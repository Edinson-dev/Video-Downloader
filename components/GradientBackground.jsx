import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

export default function GradientBackground({ platform, children }) {
  // Choose gradient colors based on detected platform
  const getGradientColors = () => {
    if (!platform) {
      return [Colors.background, '#040B1E', Colors.background];
    }

    switch (platform.id) {
      case 'tiktok':
        return ['#030508', '#1A0510', '#051A20', '#030508'];
      case 'instagram':
        return ['#030508', '#1A0A10', '#10051A', '#030508'];
      case 'facebook':
        return ['#030508', '#05152A', '#030508', '#030508'];
      default:
        return [Colors.background, '#040B1E', Colors.background];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Subtle glow orb */}
      {platform && (
        <View style={[styles.glowOrb, { backgroundColor: platform.glowColor || Colors.primaryGlow }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glowOrb: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.3,
  },
});
