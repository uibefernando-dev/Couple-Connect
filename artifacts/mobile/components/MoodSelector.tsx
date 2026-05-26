import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

const MOODS = [
  { value: 1, label: "难过", icon: "😢", color: "#EF5350" },
  { value: 2, label: "低落", icon: "😕", color: "#FF8A65" },
  { value: 3, label: "平静", icon: "😊", color: "#FFB300" },
  { value: 4, label: "开心", icon: "😄", color: "#66BB6A" },
  { value: 5, label: "超开心", icon: "🥰", color: "#E8557A" },
];

interface MoodSelectorProps {
  selected: number;
  onSelect: (mood: number) => void;
}

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {MOODS.map(mood => {
        const isSelected = selected === mood.value;
        return (
          <Pressable
            key={mood.value}
            onPress={() => onSelect(mood.value)}
            style={({ pressed }) => [
              styles.moodItem,
              {
                backgroundColor: isSelected ? mood.color + "20" : colors.muted,
                borderColor: isSelected ? mood.color : "transparent",
                borderWidth: 1.5,
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: isSelected ? 1.08 : 1 }],
              },
            ]}
          >
            <Text style={styles.icon}>{mood.icon}</Text>
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? mood.color : colors.mutedForeground,
                  fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MoodBar({ mood, partnerMood }: { mood: number; partnerMood: number }) {
  const colors = useColors();
  const avg = (mood + partnerMood) / 2;
  const pct = ((avg - 1) / 4) * 100;

  const getBarColor = () => {
    if (avg >= 4) return "#E8557A";
    if (avg >= 3) return "#FFB300";
    return "#FF8A65";
  };

  return (
    <View style={styles.barContainer}>
      <Text style={[styles.barLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
        心情温度
      </Text>
      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${pct}%` as `${number}%`,
              backgroundColor: getBarColor(),
            },
          ]}
        />
      </View>
      <View style={styles.barLabels}>
        <Text style={[styles.barSmall, { color: colors.mutedForeground }]}>低</Text>
        <Text style={[styles.barSmall, { color: getBarColor(), fontFamily: "Inter_600SemiBold" }]}>
          {avg.toFixed(1)} / 5.0
        </Text>
        <Text style={[styles.barSmall, { color: colors.mutedForeground }]}>高</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    gap: 4,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 11,
  },
  barContainer: {
    gap: 8,
  },
  barLabel: {
    fontSize: 13,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barSmall: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
