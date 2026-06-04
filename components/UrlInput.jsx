import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Spacing, Shadows } from '../constants/colors';
import { extractUrlFromText } from '../services/platformDetector';

export default function UrlInput({ value, onChangeText, platform, disabled }) {
  const [isFocused, setIsFocused] = useState(false);
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isPasting, setIsPasting] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handlePaste = async () => {
    try {
      setIsPasting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const text = await Clipboard.getStringAsync();
      if (text) {
        const extracted = extractUrlFromText(text);
        onChangeText(extracted || text);
      }
    } catch (err) {
      console.error('Paste error:', err);
    } finally {
      setIsPasting(false);
    }
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText('');
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, platform ? platform.gradient[0] : Colors.primary],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  return (
    <View style={styles.wrapper}>
      {/* Glow effect behind the input */}
      <Animated.View
        style={[
          styles.glowEffect,
          {
            opacity: glowOpacity,
            backgroundColor: platform ? platform.gradient[0] : Colors.primary,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.container,
          { borderColor },
          isFocused && styles.containerFocused,
        ]}
      >
        <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFill, styles.blurBackground]} />
        
        <Ionicons
          name="link-outline"
          size={22}
          color={isFocused ? Colors.primary : Colors.textSecondary}
          style={styles.linkIcon}
        />

        <TextInput
          style={styles.input}
          placeholder="Pega el link del video aquí..."
          placeholderTextColor={Colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          selectionColor={Colors.primary}
          keyboardType="url"
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Paste from clipboard button */}
      <TouchableOpacity
        style={styles.pasteButton}
        onPress={handlePaste}
        disabled={disabled || isPasting}
        activeOpacity={0.7}
      >
        {isPasting ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <>
            <Ionicons name="clipboard-outline" size={18} color={Colors.primary} />
            <Text style={styles.pasteText}>Pegar del portapapeles</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: 20,
    borderRadius: BorderRadius.xl,
    zIndex: -1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Make transparent for blur
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
    overflow: 'hidden', // IMPORTANT for BlurView
    ...Shadows.medium,
  },
  blurBackground: {
    backgroundColor: Colors.surface, // fallback color with opacity
  },
  containerFocused: {
    backgroundColor: Colors.surfaceElevated,
  },
  linkIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingVertical: Spacing.md,
    fontWeight: '400',
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  pasteText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
