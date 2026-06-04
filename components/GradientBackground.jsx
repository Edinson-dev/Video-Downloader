import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

export default function GradientBackground({ platform, children }) {
  const orbScale1 = useRef(new Animated.Value(1)).current;
  const orbScale2 = useRef(new Animated.Value(1)).current;
  const orbTranslateX1 = useRef(new Animated.Value(0)).current;
  const orbTranslateY1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing/pulsing scale for Orb 1
    const pulse1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale1, {
          toValue: 1.3,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbScale1, {
          toValue: 0.8,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Drifting translation for Orb 1
    const drift1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbTranslateX1, {
            toValue: 50,
            duration: 10000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbTranslateY1, {
            toValue: 40,
            duration: 12000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbTranslateX1, {
            toValue: -30,
            duration: 11000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orbTranslateY1, {
            toValue: -20,
            duration: 9000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Breathing/pulsing scale for Orb 2
    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orbScale2, {
          toValue: 1.2,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(orbScale2, {
          toValue: 0.7,
          duration: 7000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse1.start();
    drift1.start();
    pulse2.start();

    return () => {
      pulse1.stop();
      drift1.stop();
      pulse2.stop();
    };
  }, []);

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

  const activeGlowColor = platform?.glowColor || Colors.primaryGlow;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getGradientColors()}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Dynamic Glow Orb 1 (Top-Right) */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orbTopRight,
          {
            backgroundColor: activeGlowColor,
            transform: [
              { scale: orbScale1 },
              { translateX: orbTranslateX1 },
              { translateY: orbTranslateY1 },
            ],
          },
        ]}
      />

      {/* Dynamic Glow Orb 2 (Bottom-Left) */}
      <Animated.View
        style={[
          styles.glowOrb,
          styles.orbBottomLeft,
          {
            backgroundColor: activeGlowColor,
            opacity: 0.15,
            transform: [
              { scale: orbScale2 },
            ],
          },
        ]}
      />

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
    borderRadius: 200,
    opacity: 0.25,
  },
  orbTopRight: {
    top: -100,
    right: -100,
    width: 320,
    height: 320,
  },
  orbBottomLeft: {
    bottom: -150,
    left: -150,
    width: 300,
    height: 300,
  },
});
