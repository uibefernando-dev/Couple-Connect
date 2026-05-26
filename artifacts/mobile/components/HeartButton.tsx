import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface HeartButtonProps {
  onPress: () => void;
  tapCount: number;
  size?: number;
}

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

export function HeartButton({ onPress, tapCount, size = 120 }: HeartButtonProps) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const particlesRef = useRef<Particle[]>([]);
  const particleCountRef = useRef(0);
  const [particles, setParticles] = React.useState<Particle[]>([]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();

    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 80, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.spring(scale, { toValue: 1.15, useNativeDriver: true, friction: 4, tension: 200 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 150 }),
    ]).start();

    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      const p: Particle = {
        id: particleCountRef.current++,
        x: new Animated.Value(0),
        y: new Animated.Value(0),
        opacity: new Animated.Value(1),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
      };

      Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * dist, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * dist - 20, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(p.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setParticles(prev => prev.filter(pp => pp.id !== p.id));
      });

      newParticles.push(p);
    }

    setParticles(prev => [...prev, ...newParticles]);
  }, [onPress, scale]);

  return (
    <View style={styles.container}>
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }],
              opacity: p.opacity,
            },
          ]}
        >
          <Text style={{ fontSize: 14, color: colors.primary }}>♥</Text>
        </Animated.View>
      ))}

      <Pressable onPress={handlePress}>
        <Animated.View
          style={[
            styles.heartContainer,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: colors.secondary,
              transform: [{ scale }],
            },
          ]}
        >
          <View
            style={[
              styles.innerGlow,
              {
                width: size * 0.8,
                height: size * 0.8,
                borderRadius: (size * 0.8) / 2,
                backgroundColor: colors.primary + "20",
              },
            ]}
          />
          <Text style={{ fontSize: size * 0.45, color: colors.primary }}>♥</Text>
        </Animated.View>
      </Pressable>

      <View style={styles.countContainer}>
        <Text style={[styles.countText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
          {tapCount}
        </Text>
        <Text style={[styles.countLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          今日心跳
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  heartContainer: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8557A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  innerGlow: {
    position: "absolute",
  },
  particle: {
    position: "absolute",
    zIndex: 10,
  },
  countContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  countText: {
    fontSize: 40,
    lineHeight: 44,
  },
  countLabel: {
    fontSize: 13,
    marginTop: 2,
  },
});
