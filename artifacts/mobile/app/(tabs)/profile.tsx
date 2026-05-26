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
import { AchievementCard } from "@/components/AchievementCard";
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    myProfile,
    partnerProfile,
    coupleInfo,
    achievements,
    updateMyProfile,
    updatePartnerProfile,
    updateCoupleInfo,
    getDaysTogether,
  } = useCouple();

  const [editingStatus, setEditingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState(myProfile.status);
  const [showAchievements, setShowAchievements] = useState(false);

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const daysTogether = getDaysTogether();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const intimacyPct = Math.min(100, Math.round(coupleInfo.intimacyLevel));

  const getIntimacyLabel = () => {
    if (intimacyPct < 20) return "初识阶段";
    if (intimacyPct < 40) return "慢慢熟悉";
    if (intimacyPct < 60) return "甜蜜陪伴";
    if (intimacyPct < 80) return "深情相守";
    return "心心相印";
  };

  const handleSaveStatus = async () => {
    await updateMyProfile({ status: statusDraft });
    setEditingStatus(false);
  };

  const handleShareCode = () => {
    Alert.alert(
      "我们的配对码",
      `配对码：${coupleInfo.pairingCode}\n\n分享给你的另一半，让TA连接到你的世界 ♥`,
      [{ text: "好的" }]
    );
  };

  const recentAchievements = achievements.filter(a => a.unlocked).slice(0, 3);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.coupleHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: myProfile.color + "30", borderColor: "#FFFFFF", borderWidth: 2 }]}>
            <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>{myProfile.name.charAt(0)}</Text>
          </View>

          <View style={styles.coupleInfo}>
            <Text style={[styles.coupleNick, { fontFamily: "Inter_700Bold" }]}>
              {coupleInfo.coupleNickname || "我们的小天地"}
            </Text>
            <Text style={[styles.coupleDays, { fontFamily: "Inter_400Regular" }]}>
              在一起 {daysTogether} 天
            </Text>
          </View>

          <View style={[styles.avatar, { backgroundColor: partnerProfile.color + "30", borderColor: "#FFFFFF", borderWidth: 2 }]}>
            <Text style={[styles.avatarText, { color: "#FFFFFF" }]}>{partnerProfile.name.charAt(0)}</Text>
          </View>
        </View>

        <View style={styles.intimacySection}>
          <View style={styles.intimacyHeader}>
            <Text style={[styles.intimacyTitle, { fontFamily: "Inter_500Medium" }]}>
              亲密度 · {getIntimacyLabel()}
            </Text>
            <Text style={[styles.intimacyPct, { fontFamily: "Inter_700Bold" }]}>
              {intimacyPct}%
            </Text>
          </View>
          <View style={styles.intimacyTrack}>
            <View style={[styles.intimacyFill, { width: `${intimacyPct}%` as `${number}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {[
          { value: coupleInfo.totalHeartTaps, label: "总心跳次数", icon: "heart", color: colors.primary },
          { value: coupleInfo.daysStreak, label: "连续互动天", icon: "flame", color: colors.warm },
          { value: coupleInfo.completedTasks, label: "完成任务数", icon: "checkmark-circle", color: colors.green },
          { value: unlockedCount, label: "获得成就数", icon: "trophy", color: colors.gold },
        ].map((stat, i) => (
          <View key={i} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name={stat.icon as keyof typeof Ionicons.glyphMap} size={20} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          我的状态
        </Text>

        <View style={styles.profileRow}>
          <View style={[styles.smallAvatar, { backgroundColor: myProfile.color + "20" }]}>
            <Text style={[styles.smallAvatarText, { color: myProfile.color }]}>
              {myProfile.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {myProfile.name}（我）
            </Text>
            {editingStatus ? (
              <View style={styles.editRow}>
                <TextInput
                  style={[styles.statusInput, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
                  value={statusDraft}
                  onChangeText={setStatusDraft}
                  placeholder="输入状态..."
                  placeholderTextColor={colors.mutedForeground}
                  autoFocus
                  maxLength={40}
                />
                <Pressable onPress={handleSaveStatus} style={[styles.saveStatusBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => { setStatusDraft(myProfile.status); setEditingStatus(true); }}>
                <Text style={[styles.profileStatus, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {myProfile.status || "点击设置状态..."}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.profileRow}>
          <View style={[styles.smallAvatar, { backgroundColor: partnerProfile.color + "20" }]}>
            <Text style={[styles.smallAvatarText, { color: partnerProfile.color }]}>
              {partnerProfile.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              {partnerProfile.name}
            </Text>
            <Text style={[styles.profileStatus, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {partnerProfile.status}
            </Text>
          </View>
          <View style={[styles.onlinePill, { backgroundColor: colors.gold + "20" }]}>
            <View style={[styles.onlineDot, { backgroundColor: colors.gold }]} />
            <Text style={[styles.onlineText, { color: colors.gold, fontFamily: "Inter_500Medium" }]}>刚刚</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            成就徽章
          </Text>
          <Pressable onPress={() => setShowAchievements(!showAchievements)}>
            <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              {showAchievements ? "收起" : `全部 ${achievements.length}`}
            </Text>
          </Pressable>
        </View>

        {unlockedCount === 0 ? (
          <View style={styles.achievementEmpty}>
            <Ionicons name="trophy-outline" size={32} color={colors.mutedForeground} />
            <Text style={[styles.achievementEmptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              开始互动解锁成就吧
            </Text>
          </View>
        ) : (
          <>
            {recentAchievements.map(a => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </>
        )}

        {showAchievements && (
          <>
            {lockedAchievements.map(a => (
              <AchievementCard key={a.id} achievement={a} />
            ))}
          </>
        )}
      </View>

      <Pressable
        onPress={handleShareCode}
        style={[styles.codeCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "30" }]}
      >
        <View style={[styles.codeIconWrap, { backgroundColor: colors.primary + "20" }]}>
          <Ionicons name="qr-code-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.codeInfo}>
          <Text style={[styles.codeTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            配对码
          </Text>
          <Text style={[styles.codeValue, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {coupleInfo.pairingCode}
          </Text>
        </View>
        <Ionicons name="share-outline" size={18} color={colors.primary} />
      </Pressable>

      {coupleInfo.anniversaryDate && (
        <View style={[styles.annCard, { backgroundColor: colors.card, borderColor: colors.primary + "25" }]}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <View style={styles.annInfo}>
            <Text style={[styles.annTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
              纪念日
            </Text>
            <Text style={[styles.annDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {new Date(coupleInfo.anniversaryDate).toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 16 },
  coupleHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 18,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  coupleInfo: {
    alignItems: "center",
    flex: 1,
  },
  coupleNick: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  coupleDays: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 3,
  },
  intimacySection: {
    gap: 8,
  },
  intimacyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  intimacyTitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  intimacyPct: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  intimacyTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  intimacyFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 24, lineHeight: 28 },
  statLabel: { fontSize: 12, textAlign: "center" },
  section: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 17 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: { fontSize: 14 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  smallAvatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { fontSize: 15 },
  profileStatus: { fontSize: 13, lineHeight: 18 },
  editRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  statusInput: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  saveStatusBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  onlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: { fontSize: 12 },
  divider: {
    height: 1,
    marginVertical: -2,
  },
  achievementEmpty: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  achievementEmptyText: { fontSize: 14 },
  codeCard: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  codeIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  codeInfo: { flex: 1 },
  codeTitle: { fontSize: 14, marginBottom: 2 },
  codeValue: { fontSize: 20, letterSpacing: 2 },
  annCard: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  annInfo: { flex: 1 },
  annTitle: { fontSize: 14, marginBottom: 2 },
  annDate: { fontSize: 13 },
});
