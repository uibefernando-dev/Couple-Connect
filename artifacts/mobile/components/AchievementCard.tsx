import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Achievement } from "@/context/CoupleContext";

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
}

export function AchievementCard({ achievement, compact = false }: AchievementCardProps) {
  const colors = useColors();
  const isUnlocked = achievement.unlocked;

  if (compact) {
    return (
      <View
        style={[
          styles.compact,
          {
            backgroundColor: isUnlocked ? colors.primary + "15" : colors.muted,
            borderColor: isUnlocked ? colors.primary + "40" : colors.border,
          },
        ]}
      >
        <Ionicons
          name={(achievement.icon as keyof typeof Ionicons.glyphMap) || "star"}
          size={20}
          color={isUnlocked ? colors.primary : colors.mutedForeground}
        />
        <Text
          style={[
            styles.compactTitle,
            {
              color: isUnlocked ? colors.foreground : colors.mutedForeground,
              fontFamily: "Inter_500Medium",
            },
          ]}
          numberOfLines={1}
        >
          {achievement.title}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isUnlocked ? colors.primary + "30" : colors.border,
          opacity: isUnlocked ? 1 : 0.55,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isUnlocked ? colors.primary + "18" : colors.muted,
          },
        ]}
      >
        <Ionicons
          name={(achievement.icon as keyof typeof Ionicons.glyphMap) || "star"}
          size={26}
          color={isUnlocked ? colors.primary : colors.mutedForeground}
        />
      </View>

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {achievement.title}
        </Text>
        <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {achievement.description}
        </Text>
        {isUnlocked && achievement.unlockedAt && (
          <Text style={[styles.date, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
            已解锁 · {new Date(achievement.unlockedAt).toLocaleDateString("zh-CN")}
          </Text>
        )}
      </View>

      {isUnlocked && (
        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
  },
  description: {
    fontSize: 12,
    lineHeight: 17,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  compact: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minWidth: 100,
  },
  compactTitle: {
    fontSize: 12,
  },
});
