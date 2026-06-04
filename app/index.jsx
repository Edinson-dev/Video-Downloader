import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  AppState,
  Switch,
  Animated,
  Easing,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import GradientBackground from '../components/GradientBackground';
import UrlInput from '../components/UrlInput';
import PlatformBadge from '../components/PlatformBadge';
import DownloadCard from '../components/DownloadCard';
import QualitySelector from '../components/QualitySelector';
import { useDownload } from '../hooks/useDownload';
import { Colors, Spacing, BorderRadius, Shadows } from '../constants/colors';
import { detectPlatform } from '../services/platformDetector';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [showQualityPicker, setShowQualityPicker] = useState(false);
  const {
    url,
    platform,
    status,
    progress,
    error,
    quality,
    isAudio,
    setUrl,
    setQuality,
    setIsAudio,
    startDownload,
    reset,
    shareDownload,
    isDownloading,
    canDownload,
  } = useDownload();

  const [clipboardUrl, setClipboardUrl] = useState('');
  const [showClipboardBanner, setShowClipboardBanner] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Floating animation for logo
  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    float.start();
    return () => float.stop();
  }, []);

  // Banner animations
  const triggerBanner = (show) => {
    Animated.spring(slideAnim, {
      toValue: show ? 0 : -100,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    triggerBanner(showClipboardBanner);
  }, [showClipboardBanner]);

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await Clipboard.getStringAsync();
        if (text && text.trim().length > 10 && text.trim() !== url.trim()) {
          const detection = detectPlatform(text);
          if (detection.isValid) {
            setClipboardUrl(text.trim());
            setShowClipboardBanner(true);
          }
        }
      } catch (err) {
        console.error('Clipboard check error:', err);
      }
    };

    // Check on mount
    checkClipboard();

    // Check when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkClipboard();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [url]);

  return (
    <GradientBackground platform={platform}>
      {showClipboardBanner && (
        <Animated.View style={[styles.clipboardBanner, { transform: [{ translateY: slideAnim }], top: insets.top + Spacing.xs }]}>
          <View style={styles.clipboardBannerLeft}>
            <Ionicons name="link" size={18} color={Colors.primary} />
            <Text style={styles.clipboardBannerText} numberOfLines={1}>
              Link detectado en portapapeles
            </Text>
          </View>
          <View style={styles.clipboardBannerRight}>
            <TouchableOpacity
              style={styles.clipboardBannerBtn}
              onPress={() => {
                setUrl(clipboardUrl);
                setShowClipboardBanner(false);
              }}
            >
              <Text style={styles.clipboardBannerBtnText}>Pegar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowClipboardBanner(false)}
              style={styles.clipboardBannerClose}
            >
              <Ionicons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.md },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Professional Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Animated.View style={[styles.logoIcon, { transform: [{ translateY: floatAnim }] }]}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.logoGradientCircle}
                >
                  <Ionicons name="sparkles" size={18} color="#FFF" />
                </LinearGradient>
                <Ionicons name="download" size={16} color={Colors.primaryLight} style={styles.logoArrow} />
              </Animated.View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>
                  TikDownloader<Text style={styles.titleHighlight}>COL</Text>
                </Text>
                <Text style={styles.subtitle}>Sin marca de agua · Alta fidelidad</Text>
              </View>
            </View>
          </View>

          {/* Minimalist Supported Platforms Badges */}
          <View style={styles.platformsRow}>
            <View style={[styles.platformChip, styles.platformChipTikTok]}>
              <Ionicons name="musical-notes" size={12} color="#FF0050" />
              <Text style={styles.platformChipText}>TikTok</Text>
            </View>
            <View style={[styles.platformChip, styles.platformChipIG]}>
              <Ionicons name="logo-instagram" size={12} color="#DD2A7B" />
              <Text style={styles.platformChipText}>Instagram</Text>
            </View>
            <View style={[styles.platformChip, styles.platformChipFB]}>
              <Ionicons name="logo-facebook" size={12} color="#1877F2" />
              <Text style={styles.platformChipText}>Facebook</Text>
            </View>
          </View>

          {/* URL Input Area */}
          <View style={styles.section}>
            <UrlInput
              value={url}
              onChangeText={setUrl}
              platform={platform}
              disabled={isDownloading}
            />
          </View>

          {/* Platform Badge Indicator */}
          <View style={styles.badgeContainer}>
            <PlatformBadge platform={platform} />
          </View>

          {/* Advanced Quality Selection Row */}
          {platform && status === 'idle' && (
            <TouchableOpacity
              onPress={() => setShowQualityPicker(true)}
              activeOpacity={0.7}
              style={styles.optionsRowWrapper}
            >
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.qualityRow}>
                <View style={styles.qualityLeft}>
                  <View style={styles.qualityIconWrapper}>
                    <Ionicons name="options-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.qualityLabel}>Calidad de Descarga</Text>
                </View>
                <View style={styles.qualityRight}>
                  <Text style={styles.qualityValue}>{quality === 'max' ? 'Máxima' : `${quality}p`}</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* MP3 Audio Only Switch */}
          {platform && status === 'idle' && (
            <View style={styles.optionsRowWrapper}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.audioRow}>
                <View style={styles.audioLeft}>
                  <View style={styles.audioIconWrapper}>
                    <Ionicons name="musical-notes-outline" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.audioLabel}>Descargar solo música (MP3)</Text>
                </View>
                <Switch
                  value={isAudio}
                  onValueChange={setIsAudio}
                  trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.primaryGlow }}
                  thumbColor={isAudio ? Colors.primary : Colors.textMuted}
                />
              </View>
            </View>
          )}

          {/* Download Button Card */}
          <DownloadCard
            platform={platform}
            status={status}
            progress={progress}
            error={error}
            quality={quality}
            onDownload={startDownload}
            onReset={reset}
            canDownload={canDownload}
            onShare={() => shareDownload()}
            isAudio={isAudio}
          />

          {/* Refined Glassmorphic Instructions */}
          {!platform && status === 'idle' && (
            <View style={styles.instructionsWrapper}>
              <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
              <View style={styles.instructions}>
                <Text style={styles.instructionsTitle}>¿Cómo funciona?</Text>
                {[
                  { step: '1', text: 'Copia el link del video en tu red social', icon: 'copy-outline' },
                  { step: '2', text: 'Pega el link en el recuadro superior', icon: 'clipboard-outline' },
                  { step: '3', text: 'Presiona el botón "Descargar"', icon: 'download-outline' },
                ].map((item) => (
                  <View key={item.step} style={styles.instructionItem}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.stepCircle}
                    >
                      <Text style={styles.stepNumber}>{item.step}</Text>
                    </LinearGradient>
                    <View style={styles.instructionIconWrapper}>
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={Colors.primaryLight}
                      />
                    </View>
                    <Text style={styles.instructionText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Quality Picker Modal */}
      <QualitySelector
        visible={showQualityPicker}
        selectedQuality={quality}
        onSelect={setQuality}
        onClose={() => setShowQualityPicker(false)}
      />
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  // Header
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Shadows.small,
  },
  logoGradientCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoArrow: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#13131A',
    borderRadius: 6,
    padding: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  titleHighlight: {
    color: Colors.primaryLight,
    fontWeight: '900',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
    opacity: 0.8,
  },
  // Platforms Row
  platformsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  platformChipTikTok: {
    borderColor: 'rgba(255, 0, 80, 0.15)',
  },
  platformChipIG: {
    borderColor: 'rgba(221, 42, 123, 0.15)',
  },
  platformChipFB: {
    borderColor: 'rgba(24, 119, 242, 0.15)',
  },
  platformChipText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Section
  section: {
    marginBottom: Spacing.xs,
  },
  // Badge Container
  badgeContainer: {
    alignItems: 'center',
    minHeight: 40,
    justifyContent: 'center',
  },
  // Options row wrapper
  optionsRowWrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginTop: Spacing.xs,
  },
  // Quality Row
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
  },
  qualityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qualityIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 130, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  qualityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qualityValue: {
    color: Colors.primaryLight,
    fontSize: 14,
    fontWeight: '700',
  },
  // Glassmorphic Instructions Card
  instructionsWrapper: {
    marginTop: Spacing.xl,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    ...Shadows.small,
  },
  instructions: {
    backgroundColor: 'transparent',
    padding: Spacing.lg,
  },
  instructionsTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: Spacing.lg,
    alignSelf: 'center',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md + 2,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    ...Shadows.glow('rgba(0, 130, 255, 0.2)'),
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  instructionIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  instructionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md - 2,
  },
  audioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  audioIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 130, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  clipboardBanner: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(10, 15, 30, 0.95)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
    ...Shadows.large,
  },
  clipboardBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  clipboardBannerText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '85%',
  },
  clipboardBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  clipboardBannerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  clipboardBannerBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clipboardBannerClose: {
    padding: 2,
  },
});
