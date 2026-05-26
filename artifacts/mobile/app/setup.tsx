import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
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
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";

const AVATAR_COLORS = [
  "#E8557A", "#F48FB1", "#42A5F5", "#66BB6A",
  "#FF8A65", "#BA68C8", "#FFB300", "#26C6DA",
];

const STEPS = [
  { title: "你叫什么名字？", subtitle: "让对方认识你" },
  { title: "TA叫什么名字？", subtitle: "你的另一半" },
  { title: "你们的纪念日", subtitle: "爱情开始的日子" },
  { title: "你们的专属昵称", subtitle: "属于你们的独特名字" },
];

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { completeSetup } = useCouple();
  const [step, setStep] = useState(0);
  const [myName, setMyName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [coupleNickname, setCoupleNickname] = useState("");
  const [myColor, setMyColor] = useState(AVATAR_COLORS[0]);
  const [partnerColor, setPartnerColor] = useState(AVATAR_COLORS[2]);
  const [dateInput, setDateInput] = useState("");

  const formatDate = (input: string) => {
    const digits = input.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDate(text);
    setDateInput(formatted);
    if (formatted.length === 10) {
      setAnniversaryDate(formatted);
    }
  };

  const canProceed = () => {
    if (step === 0) return myName.trim().length > 0;
    if (step === 1) return partnerName.trim().length > 0;
    if (step === 2) return anniversaryDate.length === 10;
    if (step === 3) return coupleNickname.trim().length > 0;
    return false;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await completeSetup({
        myName: myName.trim(),
        partnerName: partnerName.trim(),
        anniversaryDate,
        coupleNickname: coupleNickname.trim(),
        myColor,
        partnerColor,
      });
      router.replace("/(tabs)");
    }
  };

  const progress = (step + 1) / STEPS.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.decorCircle1,
          { backgroundColor: colors.primary + "12" },
        ]}
      />
      <View
        style={[
          styles.decorCircle2,
          { backgroundColor: colors.secondary },
        ]}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + (Platform.OS === "web" ? 67 : 40),
              paddingBottom: insets.bottom + 32,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressRow}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: i <= step ? colors.primary : colors.border,
                    width: i === step ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>

          <Text style={[styles.heartDecor, { color: colors.primary }]}>♥</Text>

          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {STEPS[step].title}
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {STEPS[step].subtitle}
          </Text>

          <View style={styles.inputArea}>
            {step === 0 && (
              <>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                  value={myName}
                  onChangeText={setMyName}
                  placeholder="你的名字或昵称"
                  placeholderTextColor={colors.mutedForeground}
                  maxLength={20}
                  autoFocus
                />
                <Text style={[styles.colorLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  选择头像颜色
                </Text>
                <View style={styles.colorRow}>
                  {AVATAR_COLORS.map(c => (
                    <Pressable key={c} onPress={() => setMyColor(c)} style={styles.colorWrap}>
                      <View style={[styles.colorDot, { backgroundColor: c }]}>
                        {myColor === c && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {step === 1 && (
              <>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                  value={partnerName}
                  onChangeText={setPartnerName}
                  placeholder="TA的名字或昵称"
                  placeholderTextColor={colors.mutedForeground}
                  maxLength={20}
                  autoFocus
                />
                <Text style={[styles.colorLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  TA的头像颜色
                </Text>
                <View style={styles.colorRow}>
                  {AVATAR_COLORS.map(c => (
                    <Pressable key={c} onPress={() => setPartnerColor(c)} style={styles.colorWrap}>
                      <View style={[styles.colorDot, { backgroundColor: c }]}>
                        {partnerColor === c && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                  value={dateInput}
                  onChangeText={handleDateChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                />
                <Text style={[styles.hint, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  例：2023-02-14
                </Text>
              </>
            )}

            {step === 3 && (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
                value={coupleNickname}
                onChangeText={setCoupleNickname}
                placeholder="例：小星星、甜蜜搭档"
                placeholderTextColor={colors.mutedForeground}
                maxLength={20}
                autoFocus
              />
            )}
          </View>

          <Pressable
            onPress={handleNext}
            disabled={!canProceed()}
            style={({ pressed }) => [
              styles.nextButton,
              {
                backgroundColor: canProceed() ? colors.primary : colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.nextText,
                {
                  color: canProceed() ? "#FFFFFF" : colors.mutedForeground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              {step === STEPS.length - 1 ? "开始我们的故事 ♥" : "下一步"}
            </Text>
            {step < STEPS.length - 1 && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color={canProceed() ? "#FFFFFF" : colors.mutedForeground}
              />
            )}
          </Pressable>

          {step > 0 && (
            <Pressable
              onPress={() => setStep(step - 1)}
              style={styles.backButton}
            >
              <Text style={[styles.backText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                返回
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 60,
    left: -60,
  },
  content: {
    paddingHorizontal: 28,
    alignItems: "center",
    gap: 0,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 32,
    alignSelf: "center",
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  heartDecor: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 33,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 21,
  },
  inputArea: {
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  input: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 18,
    fontSize: 16,
  },
  colorLabel: {
    fontSize: 13,
    marginBottom: -8,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorWrap: {
    padding: 2,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  hint: {
    fontSize: 13,
    marginTop: -8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 56,
    borderRadius: 28,
    width: "100%",
    shadowColor: "#E8557A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextText: {
    fontSize: 17,
  },
  backButton: {
    marginTop: 16,
    padding: 8,
  },
  backText: {
    fontSize: 15,
  },
});
