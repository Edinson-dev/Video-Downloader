import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../constants/colors';

export default function PlatformBadge({ platform, size = 'medium' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (platform) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [platform]);

  if (!platform) return null;

  const isSmall = size === 'small';
  const iconSize = isSmall ? 16 : 22;

  return (
    <Animated.View
      style={[
        styles.container,
        isSmall && styles.containerSmall,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={platform.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, isSmall && styles.gradientSmall]}
      >
        <Ionicons name={platform.icon} size={iconSize} color="#FFF" />
        {!isSmall && <Text style={styles.text}>{platform.name}</Text>}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  containerSmall: {
    alignSelf: 'flex-start',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  gradientSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  text: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
