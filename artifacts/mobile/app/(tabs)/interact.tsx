import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { HeartButton } from "@/components/HeartButton";
import { MoodSelector } from "@/components/MoodSelector";
import { TaskCard } from "@/components/TaskCard";
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";

const NEEDS = [
  { id: "hug", label: "想抱抱", icon: "body-outline" as const, color: "#E8557A" },
  { id: "miss", label: "很想你", icon: "heart-outline" as const, color: "#F48FB1" },
  { id: "talk", label: "想聊天", icon: "chatbubble-outline" as const, color: "#42A5F5" },
  { id: "care", label: "关心我", icon: "hand-left-outline" as const, color: "#66BB6A" },
  { id: "cheer", label: "给我加油", icon: "star-outline" as const, color: "#FFB300" },
  { id: "space", label: "需要空间", icon: "planet-outline" as const, color: "#BA68C8" },
];

const SUPPORT_CARDS = [
  "你今天辛苦了，我都看在眼里 ♥",
  "不管发生什么，我都在你身边",
  "你对我来说是最特别的存在",
  "谢谢你每天带给我的温暖",
  "你的笑容是我最喜欢的风景",
  "今天也要好好爱自己哦",
];

export default function InteractScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    myProfile,
    partnerProfile,
    todayStats,
    tasks,
    tapHeart,
    setMyMood,
    expressNeed,
    sendGoodNight,
    addTask,
    completeTask,
    deleteTask,
  } = useCouple();

  const [cardIndex, setCardIndex] = useState(0);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"date" | "activity" | "challenge" | "care">("date");
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleNeed = (needId: string, label: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    expressNeed(needId);
    Alert.alert("已发送", `你的"${label}"已发送给${partnerProfile.name} ♥`);
  };

  const handleGoodNight = () => {
    if (todayStats.goodNightSent) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    sendGoodNight();
    Alert.alert("晚安 ♥", `你的晚安已送达${partnerProfile.name}，甜梦~`);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask({ title: newTaskTitle.trim(), completed: false, category: selectedCategory });
    setNewTaskTitle("");
    setShowAddTask(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const nextCard = () => {
    setCardIndex((cardIndex + 1) % SUPPORT_CARDS.length);
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        互动中心
      </Text>

      <View style={[styles.heartSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <HeartButton
          onPress={tapHeart}
          tapCount={todayStats.heartTaps}
          size={110}
        />
        <Text style={[styles.heartHint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          点击心跳，让{partnerProfile.name}感受到你的爱
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          我的心情
        </Text>
        <MoodSelector selected={myProfile.mood} onSelect={setMyMood} />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          表达需求
        </Text>
        <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          告诉{partnerProfile.name}你现在的心理需求
        </Text>
        <View style={styles.needsGrid}>
          {NEEDS.map(need => {
            const expressed = todayStats.needsExpressed.includes(need.id);
            return (
              <Pressable
                key={need.id}
                onPress={() => handleNeed(need.id, need.label)}
                style={({ pressed }) => [
                  styles.needItem,
                  {
                    backgroundColor: expressed ? need.color + "20" : colors.muted,
                    borderColor: expressed ? need.color + "50" : "transparent",
                    borderWidth: 1.5,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Ionicons name={need.icon} size={22} color={expressed ? need.color : colors.mutedForeground} />
                <Text style={[styles.needLabel, {
                  color: expressed ? need.color : colors.mutedForeground,
                  fontFamily: expressed ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>
                  {need.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={nextCard}
        style={[styles.supportCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "25" }]}
      >
        <View style={[styles.supportBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.supportBadgeText, { fontFamily: "Inter_600SemiBold" }]}>情绪安慰卡</Text>
        </View>
        <Text style={[styles.supportText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
          {SUPPORT_CARDS[cardIndex]}
        </Text>
        <View style={styles.supportHint}>
          <Text style={[styles.supportHintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            点击换一张
          </Text>
          <Ionicons name="refresh-outline" size={14} color={colors.mutedForeground} />
        </View>
      </Pressable>

      <Pressable
        onPress={handleGoodNight}
        style={({ pressed }) => [
          styles.goodNightBtn,
          {
            backgroundColor: todayStats.goodNightSent ? colors.muted : colors.purple,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="moon" size={20} color={todayStats.goodNightSent ? colors.mutedForeground : "#FFFFFF"} />
        <View>
          <Text style={[styles.goodNightTitle, {
            color: todayStats.goodNightSent ? colors.mutedForeground : "#FFFFFF",
            fontFamily: "Inter_700Bold",
          }]}>
            {todayStats.goodNightSent ? "晚安已送出 ♥" : "发送晚安"}
          </Text>
          <Text style={[styles.goodNightSub, {
            color: todayStats.goodNightSent ? colors.mutedForeground + "99" : "rgba(255,255,255,0.8)",
            fontFamily: "Inter_400Regular",
          }]}>
            {todayStats.goodNightSent ? "甜梦，我爱你" : `向${partnerProfile.name}道一声晚安`}
          </Text>
        </View>
      </Pressable>

      <View style={styles.tasksSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            情侣任务
          </Text>
          <Pressable
            onPress={() => setShowAddTask(!showAddTask)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {showAddTask && (
          <View style={[styles.addTaskForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.taskInput, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="输入任务内容..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
            />
            <View style={styles.categoryRow}>
              {(["date", "activity", "challenge", "care"] as const).map(cat => {
                const labels = { date: "约会", activity: "活动", challenge: "挑战", care: "关心" };
                const catColors = { date: "#E8557A", activity: "#42A5F5", challenge: "#FF8A65", care: "#66BB6A" };
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.catBtn, {
                      backgroundColor: isSelected ? catColors[cat] : colors.muted,
                    }]}
                  >
                    <Text style={[styles.catBtnText, {
                      color: isSelected ? "#FFFFFF" : colors.mutedForeground,
                      fontFamily: "Inter_500Medium",
                    }]}>
                      {labels[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.formButtons}>
              <Pressable onPress={() => setShowAddTask(false)} style={[styles.cancelBtn, { borderColor: colors.border }]}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>取消</Text>
              </Pressable>
              <Pressable onPress={handleAddTask} style={[styles.confirmBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.confirmBtnText, { fontFamily: "Inter_600SemiBold" }]}>添加</Text>
              </Pressable>
            </View>
          </View>
        )}

        {pendingTasks.length === 0 && !showAddTask && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              所有任务已完成
            </Text>
          </View>
        )}

        {pendingTasks.map(task => (
          <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} />
        ))}

        {completedTasks.length > 0 && (
          <Text style={[styles.completedLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            已完成 {completedTasks.length} 项
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  pageTitle: { fontSize: 26, marginBottom: 4 },
  heartSection: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 16,
  },
  heartHint: { fontSize: 13, textAlign: "center" },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 17 },
  sectionSubtitle: { fontSize: 13, marginTop: -8 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  needsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  needItem: {
    width: "30%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  needLabel: { fontSize: 12 },
  supportCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    gap: 12,
  },
  supportBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  supportBadgeText: { fontSize: 11, color: "#FFFFFF" },
  supportText: { fontSize: 16, lineHeight: 24 },
  supportHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  supportHintText: { fontSize: 12 },
  goodNightBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    gap: 14,
  },
  goodNightTitle: { fontSize: 16 },
  goodNightSub: { fontSize: 12, marginTop: 2 },
  tasksSection: { gap: 12 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addTaskForm: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  taskInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  categoryRow: { flexDirection: "row", gap: 8 },
  catBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  catBtnText: { fontSize: 13 },
  formButtons: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14 },
  confirmBtn: {
    flex: 2,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 14, color: "#FFFFFF" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: { fontSize: 14 },
  completedLabel: { fontSize: 13, textAlign: "center" },
});
