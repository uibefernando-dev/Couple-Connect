import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const MOOD_LABELS = ["", "难过", "有点低落", "平静", "开心", "超开心"];
const MOOD_COLORS = ["", "#EF5350", "#FF8A65", "#FFB300", "#66BB6A", "#E8557A"];

interface PartnerCardProps {
  name: string;
  mood: number;
  status: string;
  color: string;
  isMe?: boolean;
  lastSeen?: string;
}

export function PartnerCard({ name, mood, status, color, isMe = false, lastSeen }: PartnerCardProps) {
  const colors = useColors();
  const moodColor = MOOD_COLORS[mood] ?? colors.mutedForeground;
  const moodLabel = MOOD_LABELS[mood] ?? "未知";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isMe ? color + "40" : colors.border,
          borderWidth: 1.5,
          flex: 1,
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: color + "20" }]}>
        <Text style={[styles.avatarInitial, { color }]}>{name.charAt(0)}</Text>
        <View style={[styles.onlineDot, { backgroundColor: isMe ? "#66BB6A" : "#FFB300" }]} />
      </View>

      <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
        {isMe ? "我" : name}
      </Text>

      <View style={[styles.moodPill, { backgroundColor: moodColor + "18" }]}>
        <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
        <Text style={[styles.moodText, { color: moodColor, fontFamily: "Inter_500Medium" }]}>
          {moodLabel}
        </Text>
      </View>

      <Text style={[styles.status, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
        {status}
      </Text>

      {lastSeen && !isMe && (
        <Text style={[styles.lastSeen, { color: colors.mutedForeground + "99", fontFamily: "Inter_400Regular" }]}>
          {lastSeen}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  name: {
    fontSize: 15,
  },
  moodPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moodText: {
    fontSize: 12,
  },
  status: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 17,
  },
  lastSeen: {
    fontSize: 11,
  },
});
