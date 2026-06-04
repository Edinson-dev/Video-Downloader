import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/colors';

export default function DownloadCard({
  platform,
  status,
  progress,
  error,
  quality,
  onDownload,
  onReset,
  canDownload,
  onShare,
  isAudio = false,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for download button
  useEffect(() => {
    if (canDownload) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [canDownload]);

  // Progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Shake on error
  useEffect(() => {
    if (status === 'error') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  // Check mark animation on complete
  useEffect(() => {
    if (status === 'complete') {
      Animated.spring(checkAnim, {
        toValue: 1,
        tension: 200,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      checkAnim.setValue(0);
    }
  }, [status]);

  const getStatusInfo = () => {
    switch (status) {
      case 'fetching':
        return { text: 'Obteniendo video...', icon: 'cloud-download-outline', color: Colors.primary };
      case 'downloading':
        return { text: `Descargando ${Math.round(progress * 100)}%`, icon: 'download-outline', color: Colors.primary };
      case 'complete':
        return { text: '¡Video guardado en galería!', icon: 'checkmark-circle', color: Colors.success };
      case 'error':
        return { text: error || 'Error en la descarga', icon: 'alert-circle', color: Colors.error };
      default:
        return { text: 'Descargar Video', icon: 'download-outline', color: Colors.primary };
    }
  };

  const statusInfo = getStatusInfo();
  const isLoading = status === 'fetching' || status === 'downloading';
  const gradientColors = platform
    ? platform.gradient.length >= 2
      ? platform.gradient
      : [...platform.gradient, platform.gradient[0]]
    : [Colors.primary, Colors.primaryDark];

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
      {/* Download Button */}
      {status === 'idle' && (
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={onDownload}
            disabled={!canDownload}
            activeOpacity={0.8}
            style={styles.buttonWrapper}
          >
            <LinearGradient
              colors={canDownload ? gradientColors : [Colors.surfaceHover, Colors.surfaceElevated]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.downloadButton}
            >
              <Ionicons
                name="download-outline"
                size={26}
                color={canDownload ? '#FFF' : Colors.textMuted}
              />
              <Text style={[styles.buttonText, !canDownload && styles.buttonTextDisabled]}>
                Descargar Video
              </Text>
              <Text style={[styles.qualityBadge, !canDownload && styles.qualityBadgeDisabled]}>
                {quality}p
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Progress State */}
      {isLoading && (
        <View style={styles.progressContainerWrapper}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Ionicons name={statusInfo.icon} size={22} color={statusInfo.color} />
              <Text style={styles.progressText}>{statusInfo.text}</Text>
            </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
            {/* Shimmer effect */}
            <View style={styles.shimmer} />
          </View>
        </View>
        </View>
      )}

      {/* Complete State */}
      {status === 'complete' && (
        <Animated.View
          style={[
            styles.completeContainer,
            { transform: [{ scale: checkAnim }] },
          ]}
        >
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color="#FFF" />
          </View>
          <Text style={styles.completeText}>¡{isAudio ? 'Audio' : 'Video'} guardado en galería!</Text>
          
          <View style={styles.completeButtons}>
            {onShare && (
              <TouchableOpacity
                onPress={onShare}
                activeOpacity={0.8}
                style={styles.shareBtn}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.shareBtnGradient}
                >
                  <Ionicons name="share-social-outline" size={16} color="#FFF" />
                  <Text style={styles.shareBtnText}>Compartir</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onReset}
              activeOpacity={0.8}
              style={styles.anotherBtn}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.anotherBtnText}>Descargar otro</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Error State */}
      {status === 'error' && (
        <View style={styles.errorContainerWrapper}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.errorContainer}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={22} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          <TouchableOpacity onPress={onReset} style={styles.retryButton}>
            <Ionicons name="refresh" size={18} color={Colors.primary} />
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  buttonWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg - 4,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonTextDisabled: {
    color: Colors.textMuted,
  },
  qualityBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  qualityBadgeDisabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: Colors.textMuted,
  },
  // Progress
  progressContainerWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  progressContainer: {
    backgroundColor: 'transparent',
    padding: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  // Complete
  completeContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.glow(Colors.success),
  },
  completeText: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  completeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  shareBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.small,
  },
  shareBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 2,
  },
  shareBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  anotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 1,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  anotherBtnText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  // Error
  errorContainerWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.errorGlow,
  },
  errorContainer: {
    backgroundColor: 'transparent',
    padding: Spacing.lg,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceElevated,
  },
  retryText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
