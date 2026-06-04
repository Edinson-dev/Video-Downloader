import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { detectPlatform } from '../services/platformDetector';
import { getVideoDownloadUrl, downloadAndSaveVideo } from '../services/videoDownloader';
import { addToHistory, getSettings } from '../services/storage';

/**
 * Custom hook that manages the entire download flow:
 * URL input → platform detection → API fetch → file download → save to gallery
 */
export function useDownload() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | detecting | fetching | downloading | complete | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [quality, setQuality] = useState('1080');
  const [isAudio, setIsAudio] = useState(false);
  const [lastDownloadedUri, setLastDownloadedUri] = useState(null);
  const downloadRef = useRef(null);

  /**
   * Handle URL change and auto-detect platform
   */
  const handleUrlChange = useCallback((newUrl) => {
    setUrl(newUrl);
    setError(null);
    setStatus('idle');
    setProgress(0);
    setLastDownloadedUri(null);

    if (newUrl.trim().length > 10) {
      const result = detectPlatform(newUrl);
      setPlatform(result.isValid ? result.platform : null);
    } else {
      setPlatform(null);
    }
  }, []);

  /**
   * Share the downloaded file
   */
  const shareDownload = useCallback(async (customUri) => {
    try {
      const targetUri = customUri || lastDownloadedUri;
      if (!targetUri) {
        Alert.alert('Compartir', 'No hay ningún archivo descargado recientemente para compartir.');
        return;
      }
      
      let fileToShare = targetUri;
      // Resolve content:// or ph:// to real local fileUri
      if (targetUri.startsWith('content://') || targetUri.startsWith('ph://')) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(targetUri);
        fileToShare = assetInfo.localUri || targetUri;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileToShare);
      } else {
        Alert.alert('Compartir no disponible', 'La opción de compartir no está disponible en este dispositivo.');
      }
    } catch (err) {
      console.error('Error sharing file:', err);
      Alert.alert('Error al compartir', 'No se pudo procesar el archivo para compartir.');
    }
  }, [lastDownloadedUri]);

  /**
   * Start the download process
   */
  const startDownload = useCallback(async () => {
    if (!url.trim()) {
      setError('Por favor, pega una URL de video');
      return;
    }

    const detection = detectPlatform(url);
    if (!detection.isValid) {
      setError('URL no válida. Soportamos TikTok, Instagram y Facebook.');
      return;
    }

    const settings = await getSettings();
    const selectedQuality = quality || settings.defaultQuality || '1080';

    try {
      // Step 1: Fetch download URL from API
      setStatus('fetching');
      setProgress(0);
      setError(null);
      setLastDownloadedUri(null);

      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const videoInfo = await getVideoDownloadUrl(
        detection.normalizedUrl || url,
        selectedQuality,
        isAudio
      );

      // Step 2: Download the file
      setStatus('downloading');

      const result = await downloadAndSaveVideo(
        videoInfo.url,
        videoInfo.filename,
        (downloadProgress) => {
          setProgress(downloadProgress);
        },
        isAudio
      );

      // Save URI for immediate sharing
      setLastDownloadedUri(result.uri);

      // Step 3: Save to history
      await addToHistory({
        url: url.trim(),
        platform: detection.platform.id,
        filename: result.filename,
        quality: selectedQuality,
        fileSize: result.fileSize,
        uri: result.uri,
        assetId: result.assetId,
        isAudio: isAudio,
      });

      // Step 4: Done!
      setStatus('complete');
      setProgress(1);

      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Reset after delay
      setTimeout(() => {
        setStatus('idle');
        setUrl('');
        setPlatform(null);
        setProgress(0);
      }, 5000); // 5 seconds display of completion so user can press "Share"
    } catch (err) {
      console.error('Download error:', err);
      setStatus('error');
      setError(err.message || 'Error desconocido al descargar');

      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [url, quality, isAudio]);

  /**
   * Reset the download state
   */
  const reset = useCallback(() => {
    setUrl('');
    setPlatform(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setIsAudio(false);
    setLastDownloadedUri(null);
  }, []);

  return {
    // State
    url,
    platform,
    status,
    progress,
    error,
    quality,
    isAudio,
    lastDownloadedUri,

    // Actions
    setUrl: handleUrlChange,
    setQuality,
    setIsAudio,
    startDownload,
    reset,
    shareDownload,

    // Computed
    isDownloading: status === 'fetching' || status === 'downloading',
    isComplete: status === 'complete',
    canDownload: platform !== null && status === 'idle',
  };
}
