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
import { useCouple } from "@/context/CoupleContext";
import { useColors } from "@/hooks/useColors";
import type { Memory } from "@/context/CoupleContext";

const TYPE_CONFIG = {
  anniversary: { label: "纪念日", icon: "heart" as const, color: "#E8557A" },
  milestone: { label: "里程碑", icon: "trophy" as const, color: "#FFB300" },
  moment: { label: "美好时刻", icon: "star" as const, color: "#42A5F5" },
  note: { label: "情话便签", icon: "document-text" as const, color: "#66BB6A" },
};

function MemoryCard({ memory, onDelete }: { memory: Memory; onDelete: (id: string) => void }) {
  const colors = useColors();
  const cfg = TYPE_CONFIG[memory.type];
  const date = new Date(memory.date);
  const dateStr = isNaN(date.getTime())
    ? memory.date
    : date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <View style={[styles.memCard, { backgroundColor: colors.card, borderColor: cfg.color + "25" }]}>
      <View style={[styles.memIconWrap, { backgroundColor: cfg.color + "18" }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>
      <View style={styles.memContent}>
        <View style={styles.memTop}>
          <Text style={[styles.memTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {memory.title}
          </Text>
          <View style={[styles.memTypePill, { backgroundColor: cfg.color + "15" }]}>
            <Text style={[styles.memTypeText, { color: cfg.color, fontFamily: "Inter_500Medium" }]}>
              {cfg.label}
            </Text>
          </View>
        </View>
        {memory.description ? (
          <Text style={[styles.memDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
            {memory.description}
          </Text>
        ) : null}
        <Text style={[styles.memDate, { color: colors.mutedForeground + "99", fontFamily: "Inter_400Regular" }]}>
          {dateStr}
        </Text>
      </View>
      <Pressable
        onPress={() => onDelete(memory.id)}
        style={({ pressed }) => [styles.memDelete, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
      </Pressable>
    </View>
  );
}

export default function MemoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { memories, coupleInfo, addMemory, deleteMemory, getDaysTogether } = useCouple();

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [selectedType, setSelectedType] = useState<Memory["type"]>("moment");

  const topInset = insets.top + (Platform.OS === "web" ? 67 : 0);
  const daysTogether = getDaysTogether();

  const getAnniversaryInfo = () => {
    if (!coupleInfo.anniversaryDate) return null;
    const ann = new Date(coupleInfo.anniversaryDate);
    const today = new Date();
    const thisYear = new Date(today.getFullYear(), ann.getMonth(), ann.getDate());
    if (thisYear < today) thisYear.setFullYear(today.getFullYear() + 1);
    const daysLeft = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { daysLeft, date: ann.toLocaleDateString("zh-CN", { month: "long", day: "numeric" }) };
  };

  const annInfo = getAnniversaryInfo();

  const formatDateInput = (text: string) => {
    const digits = text.replace(/\D/g, "");
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    const dateValue = dateInput.length === 10 ? dateInput : new Date().toISOString().split("T")[0];
    await addMemory({
      title: title.trim(),
      description: description.trim(),
      date: dateValue,
      type: selectedType,
    });
    setTitle("");
    setDescription("");
    setDateInput("");
    setShowAdd(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("删除记忆", "确定要删除这段记忆吗？", [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: () => deleteMemory(id),
      },
    ]);
  };

  const sortedMemories = [...memories].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          我们的故事
        </Text>
        <Pressable
          onPress={() => setShowAdd(!showAdd)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Ionicons name={showAdd ? "close" : "add"} size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.primary, flex: 2 }]}>
          <Text style={[styles.statBig, { fontFamily: "Inter_700Bold" }]}>{daysTogether}</Text>
          <Text style={[styles.statSmall, { fontFamily: "Inter_400Regular" }]}>在一起的天数</Text>
        </View>
        {annInfo && (
          <View style={[styles.statCard, { backgroundColor: colors.secondary, borderColor: colors.primary + "30", borderWidth: 1, flex: 1.2 }]}>
            <Text style={[styles.statBig, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {annInfo.daysLeft}
            </Text>
            <Text style={[styles.statSmall, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              天后纪念日
            </Text>
          </View>
        )}
        <View style={[styles.statCard, { backgroundColor: colors.goldLight, borderColor: colors.gold + "30", borderWidth: 1, flex: 1 }]}>
          <Text style={[styles.statBig, { color: colors.gold, fontFamily: "Inter_700Bold" }]}>
            {memories.length}
          </Text>
          <Text style={[styles.statSmall, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            段记忆
          </Text>
        </View>
      </View>

      {showAdd && (
        <View style={[styles.addForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            记录美好时刻
          </Text>

          <View style={styles.typeRow}>
            {(Object.entries(TYPE_CONFIG) as [Memory["type"], typeof TYPE_CONFIG[Memory["type"]]][]).map(([type, cfg]) => {
              const isSelected = selectedType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setSelectedType(type)}
                  style={[styles.typeBtn, {
                    backgroundColor: isSelected ? cfg.color + "18" : colors.muted,
                    borderColor: isSelected ? cfg.color : "transparent",
                    borderWidth: 1.5,
                  }]}
                >
                  <Ionicons name={cfg.icon} size={14} color={isSelected ? cfg.color : colors.mutedForeground} />
                  <Text style={[styles.typeBtnText, {
                    color: isSelected ? cfg.color : colors.mutedForeground,
                    fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
                  }]}>
                    {cfg.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_500Medium" }]}
            value={title}
            onChangeText={setTitle}
            placeholder="标题（必填）"
            placeholderTextColor={colors.mutedForeground}
            maxLength={50}
          />
          <TextInput
            style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            value={description}
            onChangeText={setDescription}
            placeholder="写下这段记忆的故事..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
            maxLength={200}
          />
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
            value={dateInput}
            onChangeText={t => setDateInput(formatDateInput(t))}
            placeholder="日期 YYYY-MM-DD（可选）"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            maxLength={10}
          />

          <View style={styles.formBtns}>
            <Pressable
              onPress={() => setShowAdd(false)}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelBtnText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>取消</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={!title.trim()}
              style={[styles.saveBtn, { backgroundColor: title.trim() ? colors.primary : colors.muted }]}
            >
              <Text style={[styles.saveBtnText, { color: title.trim() ? "#FFFFFF" : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
                保存
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {sortedMemories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="camera-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            还没有记忆
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            记录你们第一个美好时刻吧
          </Text>
        </View>
      ) : (
        <View style={styles.memoriesList}>
          {sortedMemories.map((memory, idx) => (
            <View key={memory.id}>
              {(idx === 0 || new Date(memory.date).getFullYear() !== new Date(sortedMemories[idx - 1].date).getFullYear()) && (
                <View style={styles.yearSep}>
                  <View style={[styles.yearLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.yearText, { color: colors.mutedForeground, backgroundColor: colors.background, fontFamily: "Inter_500Medium" }]}>
                    {new Date(memory.date).getFullYear() || "最近"}
                  </Text>
                  <View style={[styles.yearLine, { backgroundColor: colors.border }]} />
                </View>
              )}
              <MemoryCard memory={memory} onDelete={handleDelete} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pageTitle: { fontSize: 26 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statBig: { fontSize: 26, color: "#FFFFFF", lineHeight: 30 },
  statSmall: { fontSize: 11, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  addForm: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  formTitle: { fontSize: 16 },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  typeBtnText: { fontSize: 12 },
  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  formBtns: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14 },
  saveBtn: {
    flex: 2,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { fontSize: 15 },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 17 },
  emptySub: { fontSize: 14, textAlign: "center" },
  memoriesList: { gap: 10 },
  yearSep: { flexDirection: "row", alignItems: "center", gap: 10, marginVertical: 6 },
  yearLine: { flex: 1, height: 1 },
  yearText: { fontSize: 13, paddingHorizontal: 8 },
  memCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  memIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  memContent: { flex: 1, gap: 4 },
  memTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  memTitle: { fontSize: 14, flex: 1 },
  memTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    flexShrink: 0,
  },
  memTypeText: { fontSize: 11 },
  memDesc: { fontSize: 13, lineHeight: 18 },
  memDate: { fontSize: 11, marginTop: 2 },
  memDelete: { padding: 4, marginTop: 2 },
});
