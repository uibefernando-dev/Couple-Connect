import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";

const QUIZ_QUESTIONS = [
  {
    question: "对方最喜欢的季节是什么？",
    options: ["春天", "夏天", "秋天", "冬天"],
    hint: "想想TA平时的喜好",
  },
  {
    question: "对方最喜欢用哪种方式表达爱意？",
    options: ["语言肯定", "贴心服务", "送礼物", "肢体接触"],
    hint: "观察TA的行动",
  },
  {
    question: "如果和对方吵架了，TA通常会怎么做？",
    options: ["马上道歉", "先冷静一会儿", "找你说清楚", "用行动弥补"],
    hint: "回想你们的相处",
  },
  {
    question: "对方睡前最常做的事是什么？",
    options: ["刷手机", "看书", "发消息给你", "马上睡觉"],
    hint: "想想TA的生活习惯",
  },
  {
    question: "对方最享受哪种约会方式？",
    options: ["电影约会", "户外活动", "家里煮饭", "逛街购物"],
    hint: "TA提到过吗？",
  },
  {
    question: "对方遇到压力时最需要什么？",
    options: ["一个人静静", "倾诉发泄", "你陪在旁边", "分散注意力"],
    hint: "关注TA的情绪变化",
  },
  {
    question: "对方的梦想是什么？",
    options: ["环游世界", "自由创业", "家庭幸福", "成就事业"],
    hint: "TA聊过未来吗？",
  },
];

const CHALLENGES = [
  { title: "今日挑战", desc: "给对方发一条我爱你的语音消息，声音要充满感情", icon: "mic", color: "#E8557A" },
  { title: "温情挑战", desc: "回忆一件对方曾经为你做的暖心小事，并告诉TA你记得", icon: "heart", color: "#FF8A65" },
  { title: "创意挑战", desc: "画一幅表达你对TA感情的小画，哪怕是火柴人也可以", icon: "brush", color: "#42A5F5" },
  { title: "浪漫挑战", desc: "为对方写一首至少4行的小诗，主题是我喜欢你的____", icon: "pencil", color: "#BA68C8" },
  { title: "关心挑战", desc: "查问一下对方今天的饮食状况，并关心TA是否好好休息了", icon: "nutrition", color: "#66BB6A" },
  { title: "惊喜挑战", desc: "策划一个小惊喜：一句话描述你们下次约会的计划", icon: "gift", color: "#FFB300" },
];

const TRIVIA = [
  { q: "人均心跳一生约多少次？", a: "25亿次", options: ["10亿次", "25亿次", "50亿次", "100亿次"] },
  { q: "爱情在大脑中激活的区域与哪种情感最相似？", a: "痴迷", options: ["愤怒", "恐惧", "痴迷", "悲伤"] },
  { q: "研究发现，恋爱中的人会与伴侣的心跳保持？", a: "同步", options: ["不同步", "接近同步", "同步", "对立"] },
  { q: "全球情人节是哪天？", a: "2月14日", options: ["1月1日", "2月14日", "3月8日", "5月20日"] },
  { q: "表示爱情的玫瑰花，什么颜色代表最深的爱？", a: "红色", options: ["粉色", "白色", "红色", "紫色"] },
];

export default function GamesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { partnerProfile, todayStats, answerQuiz, completeChallenge } = useCouple();

  const [quizIndex] = useState(new Date().getDay() % QUIZ_QUESTIONS.length);
  const [triviaIndex] = useState(new Date().getDate() % TRIVIA.length);
  const [challengeIndex] = useState(new Date().getDate() % CHALLENGES.length);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [triviaAnswer, setTriviaAnswer] = useState<number | null>(null);
  const [triviaCorrect, setTriviaCorrect] = useState<boolean | null>(null);

  const currentQuiz = QUIZ_QUESTIONS[quizIndex];
  const currentChallenge = CHALLENGES[challengeIndex];
  const currentTrivia = TRIVIA[triviaIndex];

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);

  const handleQuizAnswer = (idx: number) => {
    if (todayStats.quizAnswered) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setQuizAnswer(idx);
    answerQuiz();
    Alert.alert(
      "已回答 ♥",
      `你的答案是"${currentQuiz.options[idx]}"，等${partnerProfile.name}来对答案吧！`,
      [{ text: "好的" }]
    );
  };

  const handleTriviaAnswer = (idx: number) => {
    if (triviaAnswer !== null) return;
    const isCorrect = currentTrivia.options[idx] === currentTrivia.a;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
    }
    setTriviaAnswer(idx);
    setTriviaCorrect(isCorrect);
  };

  const handleChallenge = () => {
    if (todayStats.challengeCompleted) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    completeChallenge();
    Alert.alert("挑战接受！", "完成挑战后记得告诉对方哦 ♥", [{ text: "好的" }]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
        趣味互动
      </Text>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.primary + "30" }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Ionicons name="help-circle" size={14} color="#FFFFFF" />
            <Text style={[styles.badgeText, { fontFamily: "Inter_600SemiBold" }]}>每日默契测试</Text>
          </View>
          {todayStats.quizAnswered && (
            <View style={[styles.doneBadge, { backgroundColor: colors.green + "20" }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.green} />
              <Text style={[styles.doneText, { color: colors.green, fontFamily: "Inter_500Medium" }]}>已完成</Text>
            </View>
          )}
        </View>

        <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {currentQuiz.question}
        </Text>
        <Text style={[styles.hintText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          提示：{currentQuiz.hint}
        </Text>

        <View style={styles.optionsGrid}>
          {currentQuiz.options.map((opt, idx) => {
            const isSelected = quizAnswer === idx;
            return (
              <Pressable
                key={idx}
                onPress={() => handleQuizAnswer(idx)}
                disabled={todayStats.quizAnswered}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected ? colors.primary + "18" : colors.muted,
                    borderColor: isSelected ? colors.primary : "transparent",
                    borderWidth: 1.5,
                    opacity: pressed ? 0.8 : todayStats.quizAnswered && !isSelected ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.optionText, {
                  color: isSelected ? colors.primary : colors.foreground,
                  fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.warm + "30" }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: colors.warm }]}>
            <Ionicons name="trophy" size={14} color="#FFFFFF" />
            <Text style={[styles.badgeText, { fontFamily: "Inter_600SemiBold" }]}>今日挑战</Text>
          </View>
          {todayStats.challengeCompleted && (
            <View style={[styles.doneBadge, { backgroundColor: colors.green + "20" }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.green} />
              <Text style={[styles.doneText, { color: colors.green, fontFamily: "Inter_500Medium" }]}>已完成</Text>
            </View>
          )}
        </View>

        <View style={[styles.challengeIconWrap, { backgroundColor: currentChallenge.color + "15" }]}>
          <Ionicons
            name={currentChallenge.icon as keyof typeof Ionicons.glyphMap}
            size={32}
            color={currentChallenge.color}
          />
        </View>

        <Text style={[styles.challengeTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {currentChallenge.title}
        </Text>
        <Text style={[styles.challengeDesc, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
          {currentChallenge.desc}
        </Text>

        <Pressable
          onPress={handleChallenge}
          disabled={todayStats.challengeCompleted}
          style={({ pressed }) => [
            styles.challengeBtn,
            {
              backgroundColor: todayStats.challengeCompleted ? colors.muted : currentChallenge.color,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text style={[styles.challengeBtnText, {
            color: todayStats.challengeCompleted ? colors.mutedForeground : "#FFFFFF",
            fontFamily: "Inter_600SemiBold",
          }]}>
            {todayStats.challengeCompleted ? "挑战已接受" : "接受挑战"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.purple + "30" }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: colors.purple }]}>
            <Ionicons name="bulb" size={14} color="#FFFFFF" />
            <Text style={[styles.badgeText, { fontFamily: "Inter_600SemiBold" }]}>爱情冷知识</Text>
          </View>
        </View>

        <Text style={[styles.questionText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
          {currentTrivia.q}
        </Text>

        <View style={styles.optionsGrid}>
          {currentTrivia.options.map((opt, idx) => {
            const isSelected = triviaAnswer === idx;
            const isCorrectOpt = opt === currentTrivia.a;
            let bgColor = colors.muted;
            let borderColor = "transparent";
            let textColor = colors.foreground;
            if (triviaAnswer !== null && isCorrectOpt) {
              bgColor = colors.green + "20";
              borderColor = colors.green;
              textColor = colors.green;
            } else if (isSelected && !isCorrectOpt) {
              bgColor = colors.destructive + "15";
              borderColor = colors.destructive;
              textColor = colors.destructive;
            }
            return (
              <Pressable
                key={idx}
                onPress={() => handleTriviaAnswer(idx)}
                disabled={triviaAnswer !== null}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: bgColor,
                    borderColor,
                    borderWidth: 1.5,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.optionText, {
                  color: textColor,
                  fontFamily: isSelected || (triviaAnswer !== null && isCorrectOpt) ? "Inter_600SemiBold" : "Inter_400Regular",
                }]}>
                  {opt}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {triviaCorrect !== null && (
          <View style={[styles.triviaResult, {
            backgroundColor: triviaCorrect ? colors.green + "15" : colors.destructive + "10",
          }]}>
            <Ionicons
              name={triviaCorrect ? "checkmark-circle" : "close-circle"}
              size={18}
              color={triviaCorrect ? colors.green : colors.destructive}
            />
            <Text style={[styles.triviaResultText, {
              color: triviaCorrect ? colors.green : colors.destructive,
              fontFamily: "Inter_500Medium",
            }]}>
              {triviaCorrect ? "答对了！太棒了" : `正确答案是：${currentTrivia.a}`}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.comingSoonCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <Ionicons name="game-controller-outline" size={28} color={colors.mutedForeground} />
        <Text style={[styles.comingSoonTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
          更多互动游戏
        </Text>
        <Text style={[styles.comingSoonSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          心理测试、记忆翻牌等更多有趣游戏即将上线
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  pageTitle: { fontSize: 26, marginBottom: 4 },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 18,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: { fontSize: 12, color: "#FFFFFF" },
  doneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  doneText: { fontSize: 12 },
  questionText: { fontSize: 16, lineHeight: 23 },
  hintText: { fontSize: 13, marginTop: -6 },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  option: {
    width: "47%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  optionText: { fontSize: 14, textAlign: "center" },
  challengeIconWrap: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeTitle: { fontSize: 18, textAlign: "center" },
  challengeDesc: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  challengeBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeBtnText: { fontSize: 15 },
  triviaResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  triviaResultText: { fontSize: 14 },
  comingSoonCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  comingSoonTitle: { fontSize: 15 },
  comingSoonSub: { fontSize: 13, textAlign: "center", lineHeight: 19 },
});
