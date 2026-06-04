import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import GradientBackground from '../components/GradientBackground';
import DownloadHistory from '../components/DownloadHistory';
import { getHistory, removeFromHistory, clearHistory } from '../services/storage';
import { Colors, Spacing, BorderRadius } from '../constants/colors';

// Floating custom modal video player
function VideoPlayerModal({ visible, uri, onClose }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.play();
  });

  if (!uri) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="close-circle" size={38} color="#FFF" />
          </TouchableOpacity>
          <VideoView
            style={styles.videoPlayer}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      </View>
    </Modal>
  );
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [activeVideoUri, setActiveVideoUri] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  // Reload every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const handleDelete = async (id) => {
    await removeFromHistory(id);
    await loadHistory();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar historial',
      '¿Estás seguro? Se eliminará todo el historial de descargas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  // Share handler
  const handleShare = async (item) => {
    try {
      if (!item.uri) {
        Alert.alert('Compartir', 'No se encontró la dirección de este archivo.');
        return;
      }
      
      let fileToShare = item.uri;
      if (item.uri.startsWith('content://') || item.uri.startsWith('ph://')) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(item.uri);
        fileToShare = assetInfo.localUri || item.uri;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileToShare);
      } else {
        Alert.alert('Compartir no disponible', 'La opción de compartir no está disponible en este dispositivo.');
      }
    } catch (err) {
      console.error('Error sharing from history:', err);
      Alert.alert('Error', 'No se pudo compartir este archivo.');
    }
  };

  // Video play handler
  const handlePlay = async (item) => {
    try {
      if (!item.uri) {
        Alert.alert('Reproducir', 'No se encontró la dirección de este video.');
        return;
      }
      
      let playUri = item.uri;
      if (item.uri.startsWith('content://') || item.uri.startsWith('ph://')) {
        const assetInfo = await MediaLibrary.getAssetInfoAsync(item.uri);
        playUri = assetInfo.localUri || item.uri;
      }

      setActiveVideoUri(playUri);
      setShowPlayer(true);
    } catch (err) {
      console.error('Error playing video:', err);
      Alert.alert('Error', 'No se pudo reproducir este video.');
    }
  };

  return (
    <GradientBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Historial</Text>
          <Text style={styles.subtitle}>Tus descargas recientes</Text>
        </View>

        {/* History List */}
        <DownloadHistory
          history={history}
          onDelete={handleDelete}
          onClearAll={history.length > 0 ? handleClearAll : undefined}
          onShare={handleShare}
          onPlay={handlePlay}
        />
      </View>

      {/* Floating Video Player Modal */}
      <VideoPlayerModal
        visible={showPlayer}
        uri={activeVideoUri}
        onClose={() => {
          setShowPlayer(false);
          setActiveVideoUri(null);
        }}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: -40,
    right: 20,
    zIndex: 9999,
  },
  videoPlayer: {
    width: '90%',
    height: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
