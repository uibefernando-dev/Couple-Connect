import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MoodBar } from "@/components/MoodSelector";
import { PartnerCard } from "@/components/PartnerCard";
import { TaskCard } from "@/components/TaskCard";
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";

const DAILY_QUESTIONS = [
  "如果今天只能发一条消息给对方，你会说什么？",
  "你最近一次因为TA而开心是什么时候？",
  "TA身上你最喜欢的三个特质是什么？",
  "你们最美好的一次约会是哪次？",
  "如果可以和TA一起去任何地方，你会选哪里？",
  "TA做过的最让你感动的事是什么？",
  "你们有哪些属于你们的小秘密？",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    myProfile,
    partnerProfile,
    coupleInfo,
    todayStats,
    tasks,
    completeTask,
    deleteTask,
    getDaysTogether,
  } = useCouple();

  const daysTogether = getDaysTogether();
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);
  const todayQuestion = DAILY_QUESTIONS[new Date().getDay() % DAILY_QUESTIONS.length];
  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 12) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    if (h < 22) return "晚上好";
    return "夜深了";
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { fontFamily: "Inter_400Regular" }]}>
              {getGreeting()}，{myProfile.name}
            </Text>
            {coupleInfo.coupleNickname ? (
              <Text style={[styles.coupleTitle, { fontFamily: "Inter_700Bold" }]}>
                {coupleInfo.coupleNickname}
              </Text>
            ) : (
              <Text style={[styles.coupleTitle, { fontFamily: "Inter_700Bold" }]}>
                我们的小天地
              </Text>
            )}
          </View>
          <View style={styles.daysContainer}>
            <Text style={[styles.daysNumber, { fontFamily: "Inter_700Bold" }]}>
              {daysTogether}
            </Text>
            <Text style={[styles.daysLabel, { fontFamily: "Inter_400Regular" }]}>
              天
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { fontFamily: "Inter_700Bold" }]}>
              {todayStats.heartTaps}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
              今日心跳
            </Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { fontFamily: "Inter_700Bold" }]}>
              {coupleInfo.daysStreak}
            </Text>
            <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
              连续互动
            </Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { fontFamily: "Inter_700Bold" }]}>
              {Math.round(coupleInfo.intimacyLevel)}%
            </Text>
            <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
              亲密度
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardsSection}>
        <PartnerCard
          name={myProfile.name}
          mood={myProfile.mood}
          status={myProfile.status}
          color={myProfile.color}
          isMe
        />
        <View style={styles.heartIcon}>
          <Text style={{ fontSize: 20, color: colors.primary }}>♥</Text>
        </View>
        <PartnerCard
          name={partnerProfile.name}
          mood={partnerProfile.mood}
          status={partnerProfile.status}
          color={partnerProfile.color}
          lastSeen="刚刚在线"
        />
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MoodBar mood={myProfile.mood} partnerMood={partnerProfile.mood} />
      </View>

      <View style={[styles.questionCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}>
        <View style={styles.questionHeader}>
          <View style={[styles.questionBadge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.questionBadgeText, { fontFamily: "Inter_600SemiBold" }]}>每日问答</Text>
          </View>
          {!todayStats.quizAnswered && (
            <View style={[styles.dotBadge, { backgroundColor: colors.warm }]} />
          )}
        </View>
        <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
          {todayQuestion}
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/games")}
          style={({ pressed }) => [
            styles.questionButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.questionButtonText, { fontFamily: "Inter_600SemiBold" }]}>
            {todayStats.quizAnswered ? "已回答" : "去回答"}
          </Text>
          {!todayStats.quizAnswered && <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />}
        </Pressable>
      </View>

      {pendingTasks.length > 0 && (
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              待完成任务
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/interact")}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                全部
              </Text>
            </Pressable>
          </View>
          {pendingTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={completeTask}
              onDelete={deleteTask}
            />
          ))}
        </View>
      )}

      <View style={[styles.goodNightCard, { backgroundColor: todayStats.goodNightSent ? colors.muted : colors.card, borderColor: colors.border }]}>
        <View style={styles.goodNightLeft}>
          <Ionicons
            name={todayStats.goodNightSent ? "moon" : "moon-outline"}
            size={24}
            color={todayStats.goodNightSent ? colors.purple : colors.mutedForeground}
          />
          <View>
            <Text style={[styles.goodNightTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              晚安打卡
            </Text>
            <Text style={[styles.goodNightSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              连续 {coupleInfo.goodNightStreak} 天
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/interact")}
          style={[styles.goodNightBtn, { backgroundColor: todayStats.goodNightSent ? colors.muted : colors.primary + "18" }]}
        >
          <Text style={[styles.goodNightBtnText, {
            color: todayStats.goodNightSent ? colors.mutedForeground : colors.primary,
            fontFamily: "Inter_600SemiBold",
          }]}>
            {todayStats.goodNightSent ? "已打卡" : "打卡"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    gap: 16,
    paddingHorizontal: 0,
  },
  headerBg: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 2,
  },
  coupleTitle: {
    fontSize: 22,
    color: "#FFFFFF",
  },
  daysContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  daysNumber: {
    fontSize: 22,
    color: "#FFFFFF",
    lineHeight: 26,
  },
  daysLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 24,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 4,
  },
  cardsSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 0,
  },
  heartIcon: {
    width: 32,
    alignItems: "center",
  },
  section: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  questionCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 12,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  questionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  questionBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
  },
  dotBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  questionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 14,
  },
  questionButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  tasksSection: {
    paddingHorizontal: 20,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 17,
  },
  seeAll: {
    fontSize: 14,
  },
  goodNightCard: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  goodNightLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goodNightTitle: {
    fontSize: 15,
  },
  goodNightSub: {
    fontSize: 12,
    marginTop: 1,
  },
  goodNightBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  goodNightBtnText: {
    fontSize: 14,
  },
});
