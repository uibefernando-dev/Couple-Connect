import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { Task } from "@/context/CoupleContext";

const CATEGORY_COLORS: Record<Task["category"], string> = {
  date: "#E8557A",
  activity: "#42A5F5",
  challenge: "#FF8A65",
  care: "#66BB6A",
};

const CATEGORY_ICONS: Record<Task["category"], keyof typeof Ionicons.glyphMap> = {
  date: "heart",
  activity: "sparkles",
  challenge: "trophy",
  care: "hand-left",
};

const CATEGORY_LABELS: Record<Task["category"], string> = {
  date: "约会",
  activity: "活动",
  challenge: "挑战",
  care: "关心",
};

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const colors = useColors();
  const catColor = CATEGORY_COLORS[task.category];

  const handleComplete = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onComplete(task.id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: task.completed ? colors.border : catColor + "30",
          opacity: task.completed ? 0.65 : 1,
        },
      ]}
    >
      <Pressable
        onPress={handleComplete}
        disabled={task.completed}
        style={[
          styles.checkButton,
          {
            backgroundColor: task.completed ? catColor : catColor + "15",
            borderColor: catColor,
          },
        ]}
      >
        {task.completed && (
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        )}
      </Pressable>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: colors.foreground,
              fontFamily: "Inter_500Medium",
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.categoryTag, { backgroundColor: catColor + "18" }]}>
            <Ionicons name={CATEGORY_ICONS[task.category]} size={11} color={catColor} />
            <Text style={[styles.categoryText, { color: catColor, fontFamily: "Inter_500Medium" }]}>
              {CATEGORY_LABELS[task.category]}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => onDelete(task.id)}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Ionicons name="trash-outline" size={16} color={colors.mutedForeground} />
      </Pressable>
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
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    gap: 6,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
});
