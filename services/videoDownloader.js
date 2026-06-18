import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { DEFAULT_API_URL } from '../constants/platforms';
import { getSettings } from './storage';

const COBALT_ERROR_MAP = {
  'error.api.fetch.fail': 'El servidor no pudo descargar el video. Verifica que el enlace sea público, no esté restringido por edad y no requiera inicio de sesión.',
  'error.api.fetch.empty': 'No se encontró ningún video o contenido descargable en este enlace.',
  'error.api.fetch.disabled': 'Las descargas de esta plataforma están desactivadas en este servidor.',
  'error.api.rate_limit': 'Has superado el límite de descargas del servidor. Por favor, espera unos minutos e intenta de nuevo.',
  'error.api.invalid_body': 'Error de formato en la petición del servidor.',
  'error.api.auth.jwt.missing': 'Este servidor requiere autenticación (token JWT) para descargar.',
  'error.api.auth.key.missing': 'Este servidor requiere una API Key para descargar.',
};

/**
 * Fetches the download URL from Cobalt API
 * @param {string} videoUrl - The social media video URL
 * @param {string} quality - Video quality (1080, 720, 480, etc.)
 * @param {boolean} isAudioOnly - Whether to download only the audio
 * @returns {Promise<object>} - The API response with download URL
 */
export async function getVideoDownloadUrl(videoUrl, quality = '1080', isAudioOnly = false) {
  const settings = await getSettings();
  const apiUrl = settings.apiUrl || DEFAULT_API_URL;
  
  const isTikTok = videoUrl.includes('tiktok.com');

  if (isTikTok) {
    try {
      console.log('[DEBUG] GET to TikWM API');
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}&hd=1`);
      const json = await response.json();
      
      if (json.code !== 0) {
        throw new Error(json.msg || 'No se pudo obtener el video de TikTok');
      }

      const { data } = json;

      if (data.images && data.images.length > 0) {
        // Carousel post
        return {
          url: data.images[0],
          filename: `${isAudioOnly ? 'audio' : 'video'}_${Date.now()}.${isAudioOnly ? 'mp3' : 'mp4'}`,
          picker: data.images.map((imgUrl) => ({ url: imgUrl })),
          isMultiple: true,
        };
      }

      const downloadUrl = isAudioOnly ? data.music : (data.hdplay || data.play);
      if (!downloadUrl) {
        throw new Error('No se encontró archivo multimedia en este enlace.');
      }

      return {
        url: downloadUrl,
        filename: `${isAudioOnly ? 'audio' : 'video'}_${Date.now()}.${isAudioOnly ? 'mp3' : 'mp4'}`,
      };
    } catch (error) {
      if (error.message === 'Network request failed' || error.message.includes('Failed to fetch') || error instanceof TypeError) {
        throw new Error('No se pudo conectar con el servidor de descargas de TikTok.');
      }
      throw error;
    }
  }

  // Fallback to Cobalt for Instagram/Facebook
  // Los servidores públicos gratuitos de Cobalt han dejado de funcionar.
  // El usuario DEBE configurar su propia URL y Token en los Ajustes.
  const fallbackUrls = [
    apiUrl,
  ];

  // Remove duplicates in case settings.apiUrl is one of these
  const uniqueUrls = [...new Set(fallbackUrls.filter(Boolean))];

  const requestBody = {
    url: videoUrl,
    videoQuality: quality,
    filenameStyle: 'pretty',
    downloadMode: isAudioOnly ? 'audio' : 'auto',
  };

  const baseHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  let data = null;
  let lastError = null;

  for (const url of uniqueUrls) {
    try {
      console.log('[DEBUG] POST to:', url);
      const headers = { ...baseHeaders };
      // Only send custom authorization token to the user's configured API url
      if (url === apiUrl && settings.apiToken) {
        headers['Authorization'] = `Bearer ${settings.apiToken.trim()}`;
      }

      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      data = await response.json();

      if (data.status === 'error' && data.error?.code === 'error.api.invalid_body') {
        const minimalBody = { 
          url: videoUrl,
          downloadMode: isAudioOnly ? 'audio' : 'auto',
        };
        
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(minimalBody),
        });
        data = await response.json();
      }

      if (data.status === 'error') {
        const code = data.error?.code || '';
        // If it's an auth error or rate limit, we can try another server
        if (code.includes('auth') || code.includes('jwt') || code.includes('key') || code.includes('rate_limit')) {
          console.log(`[DEBUG] server error ${code} on ${url}, trying next fallback...`);
          lastError = new Error(COBALT_ERROR_MAP[code] || `Error del servidor: ${code}`);
          continue;
        }
        
        const friendlyMessage = COBALT_ERROR_MAP[code] || `Error del servidor: ${code || 'Error desconocido'}`;
        throw new Error(friendlyMessage);
      }

      // Success, break the loop
      break;
    } catch (error) {
      console.log(`[DEBUG] Error on ${url}:`, error.message);
      if (error.message.includes('auth') || error.message.includes('servidor') || error.message.includes('fetch') || error.message.includes('Network') || error instanceof TypeError) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  if (!data) {
    throw lastError || new Error('Los servidores públicos de descarga ya no están disponibles. Por favor, ve a la pestaña "Ajustes" y configura tu propia URL de la API de Cobalt y Token.');
  }

  if (data.status === 'tunnel' || data.status === 'redirect') {
    return {
      url: data.url,
      filename: data.filename || `${isAudioOnly ? 'audio' : 'video'}_${Date.now()}.${isAudioOnly ? 'mp3' : 'mp4'}`,
    };
  }

  if (data.status === 'picker') {
    return {
      url: data.picker[0]?.url,
      filename: data.filename || `${isAudioOnly ? 'audio' : 'video'}_${Date.now()}.${isAudioOnly ? 'mp3' : 'mp4'}`,
      picker: data.picker,
      isMultiple: true,
    };
  }

  throw new Error('Formato de respuesta inesperado');
}

/**
 * Downloads a video/audio file and saves it to the device gallery (on Mobile) or downloads it (on Web)
 * @param {string} downloadUrl - Direct download URL
 * @param {string} filename - Desired filename
 * @param {function} onProgress - Progress callback (0-1)
 * @param {boolean} isAudioOnly - Whether it is an audio file
 * @returns {Promise<object>} - Result with local file URI or URL
 */
export async function downloadAndSaveVideo(downloadUrl, filename, onProgress, isAudioOnly = false) {
  // Asegurar extensión adecuada
  const defaultExt = isAudioOnly ? '.mp3' : '.mp4';
  const hasValidExt = filename.endsWith('.mp3') || filename.endsWith('.mp4') || filename.endsWith('.m4a') || filename.endsWith('.ogg');
  const safeFilename = hasValidExt ? filename : `${filename}${defaultExt}`;

  // 1. SOPORTE DE ENTORNO WEB
  if (Platform.OS === 'web') {
    try {
      if (onProgress) onProgress(0.2);
      
      // En la web, creamos un elemento 'a' invisible y lo pulsamos programáticamente
      // para forzar la descarga nativa a través del navegador.
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', safeFilename);
      link.setAttribute('target', '_blank'); // Abre en pestaña nueva si hay restricciones de CORS
      document.body.appendChild(link);
      
      if (onProgress) onProgress(0.6);
      link.click();
      document.body.removeChild(link);
      
      if (onProgress) onProgress(1.0);
      
      return {
        uri: downloadUrl,
        assetId: 'web-download-' + Date.now(),
        filename: safeFilename,
        fileSize: 0,
      };
    } catch (err) {
      throw new Error('No se pudo descargar en el navegador. Por favor intenta copiar el enlace de descarga directamente.');
    }
  }

  // 2. SOPORTE DE ENTORNO MÓVIL (NATIVO)
  const { status } = await MediaLibrary.requestPermissionsAsync(true);
  if (status !== 'granted') {
    throw new Error(`Se necesitan permisos para guardar el ${isAudioOnly ? 'audio' : 'video'} en la galería.`);
  }

  const fileUri = FileSystem.documentDirectory + safeFilename;

  // Crear descarga para móvil
  const downloadResumable = FileSystem.createDownloadResumable(
    downloadUrl,
    fileUri,
    {},
    (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      if (onProgress) {
        onProgress(progress);
      }
    }
  );

  try {
    const result = await downloadResumable.downloadAsync();

    if (!result || !result.uri) {
      throw new Error('La descarga falló');
    }

    // Guardar en la galería de fotos del móvil
    const asset = await MediaLibrary.createAssetAsync(result.uri);

    // Limpieza de archivo temporal
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (e) {
      // Ignorar
    }

    return {
      uri: asset.uri,
      assetId: asset.id,
      filename: safeFilename,
      fileSize: result.headers?.['content-length'] || 0,
    };
  } catch (error) {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (e) {
      // Ignorar
    }
    throw error;
  }
}
