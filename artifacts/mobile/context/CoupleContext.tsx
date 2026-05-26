import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface MyProfile {
  name: string;
  mood: number;
  status: string;
  color: string;
}

export interface PartnerProfile {
  name: string;
  mood: number;
  status: string;
  color: string;
}

export interface CoupleInfo {
  anniversaryDate: string;
  coupleNickname: string;
  pairingCode: string;
  intimacyLevel: number;
  totalHeartTaps: number;
  daysStreak: number;
  goodNightStreak: number;
  completedTasks: number;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  category: "date" | "activity" | "challenge" | "care";
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "anniversary" | "milestone" | "moment" | "note";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyStats {
  date: string;
  heartTaps: number;
  myMood: number;
  needsExpressed: string[];
  goodNightSent: boolean;
  quizAnswered: boolean;
  challengeCompleted: boolean;
}

export interface SetupData {
  myName: string;
  partnerName: string;
  anniversaryDate: string;
  coupleNickname: string;
  myColor: string;
  partnerColor: string;
}

interface CoupleContextType {
  myProfile: MyProfile;
  partnerProfile: PartnerProfile;
  coupleInfo: CoupleInfo;
  todayStats: DailyStats;
  tasks: Task[];
  memories: Memory[];
  achievements: Achievement[];
  isSetupComplete: boolean;
  isLoading: boolean;
  updateMyProfile: (profile: Partial<MyProfile>) => Promise<void>;
  updatePartnerProfile: (profile: Partial<PartnerProfile>) => Promise<void>;
  updateCoupleInfo: (info: Partial<CoupleInfo>) => Promise<void>;
  tapHeart: () => Promise<void>;
  setMyMood: (mood: number) => Promise<void>;
  expressNeed: (need: string) => Promise<void>;
  sendGoodNight: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addMemory: (memory: Omit<Memory, "id">) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  completeSetup: (data: SetupData) => Promise<void>;
  answerQuiz: () => Promise<void>;
  completeChallenge: () => Promise<void>;
  getDaysTogether: () => number;
}

const defaultAchievements: Achievement[] = [
  { id: "first_tap", title: "初心一击", description: "第一次点击心跳按钮", icon: "heart", unlocked: false },
  { id: "tap_50", title: "爱的涟漪", description: "累计心跳点击50次", icon: "heart-circle", unlocked: false },
  { id: "tap_100", title: "爱的百击", description: "累计心跳点击100次", icon: "heart-circle-sharp", unlocked: false },
  { id: "streak_7", title: "七日甜蜜", description: "连续7天互动", icon: "flame", unlocked: false },
  { id: "streak_30", title: "月月相伴", description: "连续30天互动", icon: "bonfire", unlocked: false },
  { id: "good_night_7", title: "甜梦七夜", description: "连续7天晚安打卡", icon: "moon", unlocked: false },
  { id: "memories_5", title: "回忆收藏家", description: "记录5个美好记忆", icon: "camera", unlocked: false },
  { id: "tasks_5", title: "任务达人", description: "完成5个情侣任务", icon: "checkmark-circle", unlocked: false },
  { id: "quiz_7", title: "默契达人", description: "连续7天完成每日问答", icon: "help-circle", unlocked: false },
];

const defaultTasks: Task[] = [
  { id: "t1", title: "一起看一部电影", completed: false, createdAt: new Date().toISOString(), category: "date" },
  { id: "t2", title: "互发一张今日自拍", completed: false, createdAt: new Date().toISOString(), category: "activity" },
  { id: "t3", title: "说出三件喜欢对方的事", completed: false, createdAt: new Date().toISOString(), category: "care" },
  { id: "t4", title: "一起规划下次约会", completed: false, createdAt: new Date().toISOString(), category: "date" },
  { id: "t5", title: "给对方写一封信", completed: false, createdAt: new Date().toISOString(), category: "care" },
];

const defaultTodayStats = (): DailyStats => ({
  date: new Date().toDateString(),
  heartTaps: 0,
  myMood: 3,
  needsExpressed: [],
  goodNightSent: false,
  quizAnswered: false,
  challengeCompleted: false,
});

const CoupleContext = createContext<CoupleContextType | null>(null);

const STORAGE_KEYS = {
  MY_PROFILE: "@couple/myProfile",
  PARTNER_PROFILE: "@couple/partnerProfile",
  COUPLE_INFO: "@couple/coupleInfo",
  TASKS: "@couple/tasks",
  MEMORIES: "@couple/memories",
  ACHIEVEMENTS: "@couple/achievements",
  TODAY_STATS: "@couple/todayStats",
  SETUP_COMPLETE: "@couple/setupComplete",
};

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function generatePairingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function CoupleProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [myProfile, setMyProfile] = useState<MyProfile>({
    name: "我",
    mood: 3,
    status: "今天心情不错",
    color: "#E8557A",
  });
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile>({
    name: "TA",
    mood: 4,
    status: "想你了",
    color: "#42A5F5",
  });
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo>({
    anniversaryDate: "",
    coupleNickname: "",
    pairingCode: generatePairingCode(),
    intimacyLevel: 1,
    totalHeartTaps: 0,
    daysStreak: 0,
    goodNightStreak: 0,
    completedTasks: 0,
  });
  const [todayStats, setTodayStats] = useState<DailyStats>(defaultTodayStats());
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        setupDone,
        savedMyProfile,
        savedPartnerProfile,
        savedCoupleInfo,
        savedTasks,
        savedMemories,
        savedAchievements,
        savedTodayStats,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE),
        AsyncStorage.getItem(STORAGE_KEYS.MY_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.PARTNER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.COUPLE_INFO),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS),
        AsyncStorage.getItem(STORAGE_KEYS.MEMORIES),
        AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.TODAY_STATS),
      ]);

      if (setupDone === "true") setIsSetupComplete(true);
      if (savedMyProfile) setMyProfile(JSON.parse(savedMyProfile));
      if (savedPartnerProfile) setPartnerProfile(JSON.parse(savedPartnerProfile));
      if (savedCoupleInfo) setCoupleInfo(JSON.parse(savedCoupleInfo));
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      if (savedMemories) setMemories(JSON.parse(savedMemories));
      if (savedAchievements) setAchievements(JSON.parse(savedAchievements));

      if (savedTodayStats) {
        const parsed: DailyStats = JSON.parse(savedTodayStats);
        if (parsed.date === new Date().toDateString()) {
          setTodayStats(parsed);
        } else {
          setTodayStats(defaultTodayStats());
        }
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (key: string, value: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const updateMyProfile = useCallback(async (profile: Partial<MyProfile>) => {
    setMyProfile(prev => {
      const updated = { ...prev, ...profile };
      save(STORAGE_KEYS.MY_PROFILE, updated);
      return updated;
    });
  }, []);

  const updatePartnerProfile = useCallback(async (profile: Partial<PartnerProfile>) => {
    setPartnerProfile(prev => {
      const updated = { ...prev, ...profile };
      save(STORAGE_KEYS.PARTNER_PROFILE, updated);
      return updated;
    });
  }, []);

  const updateCoupleInfo = useCallback(async (info: Partial<CoupleInfo>) => {
    setCoupleInfo(prev => {
      const updated = { ...prev, ...info };
      save(STORAGE_KEYS.COUPLE_INFO, updated);
      return updated;
    });
  }, []);

  const checkAchievements = useCallback((
    newTotalTaps: number,
    newCompletedTasks: number,
    newMemoriesCount: number,
    newStreak: number,
    currentAchievements: Achievement[],
  ) => {
    let updated = [...currentAchievements];
    const now = new Date().toISOString();

    const unlock = (id: string) => {
      const idx = updated.findIndex(a => a.id === id);
      if (idx !== -1 && !updated[idx].unlocked) {
        updated[idx] = { ...updated[idx], unlocked: true, unlockedAt: now };
      }
    };

    if (newTotalTaps >= 1) unlock("first_tap");
    if (newTotalTaps >= 50) unlock("tap_50");
    if (newTotalTaps >= 100) unlock("tap_100");
    if (newStreak >= 7) unlock("streak_7");
    if (newStreak >= 30) unlock("streak_30");
    if (newCompletedTasks >= 5) unlock("tasks_5");
    if (newMemoriesCount >= 5) unlock("memories_5");

    save(STORAGE_KEYS.ACHIEVEMENTS, updated);
    return updated;
  }, []);

  const tapHeart = useCallback(async () => {
    const newTodayStats = { ...todayStats, heartTaps: todayStats.heartTaps + 1 };
    const newTotalTaps = coupleInfo.totalHeartTaps + 1;
    const newIntimacy = Math.min(100, coupleInfo.intimacyLevel + 0.5);

    setTodayStats(newTodayStats);
    save(STORAGE_KEYS.TODAY_STATS, newTodayStats);

    const newInfo = { ...coupleInfo, totalHeartTaps: newTotalTaps, intimacyLevel: newIntimacy };
    setCoupleInfo(newInfo);
    save(STORAGE_KEYS.COUPLE_INFO, newInfo);

    const updated = checkAchievements(newTotalTaps, coupleInfo.completedTasks, memories.length, coupleInfo.daysStreak, achievements);
    setAchievements(updated);
  }, [todayStats, coupleInfo, memories.length, achievements, checkAchievements]);

  const setMyMood = useCallback(async (mood: number) => {
    await updateMyProfile({ mood });
    const newStats = { ...todayStats, myMood: mood };
    setTodayStats(newStats);
    save(STORAGE_KEYS.TODAY_STATS, newStats);
  }, [todayStats, updateMyProfile]);

  const expressNeed = useCallback(async (need: string) => {
    const newNeeds = [...todayStats.needsExpressed, need];
    const newStats = { ...todayStats, needsExpressed: newNeeds };
    setTodayStats(newStats);
    save(STORAGE_KEYS.TODAY_STATS, newStats);
  }, [todayStats]);

  const sendGoodNight = useCallback(async () => {
    const newStats = { ...todayStats, goodNightSent: true };
    setTodayStats(newStats);
    save(STORAGE_KEYS.TODAY_STATS, newStats);

    const newStreak = coupleInfo.goodNightStreak + 1;
    const newInfo = { ...coupleInfo, goodNightStreak: newStreak };
    setCoupleInfo(newInfo);
    save(STORAGE_KEYS.COUPLE_INFO, newInfo);

    if (newStreak >= 7) {
      const updated = achievements.map(a =>
        a.id === "good_night_7" && !a.unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
      );
      setAchievements(updated);
      save(STORAGE_KEYS.ACHIEVEMENTS, updated);
    }
  }, [todayStats, coupleInfo, achievements]);

  const addTask = useCallback(async (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = { ...task, id: generateId(), createdAt: new Date().toISOString() };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    save(STORAGE_KEYS.TASKS, newTasks);
  }, [tasks]);

  const completeTask = useCallback(async (taskId: string) => {
    const newTasks = tasks.map(t => t.id === taskId ? { ...t, completed: true } : t);
    setTasks(newTasks);
    save(STORAGE_KEYS.TASKS, newTasks);

    const newCount = coupleInfo.completedTasks + 1;
    const newInfo = { ...coupleInfo, completedTasks: newCount };
    setCoupleInfo(newInfo);
    save(STORAGE_KEYS.COUPLE_INFO, newInfo);

    const updated = checkAchievements(coupleInfo.totalHeartTaps, newCount, memories.length, coupleInfo.daysStreak, achievements);
    setAchievements(updated);
  }, [tasks, coupleInfo, memories.length, achievements, checkAchievements]);

  const deleteTask = useCallback(async (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    save(STORAGE_KEYS.TASKS, newTasks);
  }, [tasks]);

  const addMemory = useCallback(async (memory: Omit<Memory, "id">) => {
    const newMemory: Memory = { ...memory, id: generateId() };
    const newMemories = [newMemory, ...memories];
    setMemories(newMemories);
    save(STORAGE_KEYS.MEMORIES, newMemories);

    const updated = checkAchievements(coupleInfo.totalHeartTaps, coupleInfo.completedTasks, newMemories.length, coupleInfo.daysStreak, achievements);
    setAchievements(updated);
  }, [memories, coupleInfo, achievements, checkAchievements]);

  const deleteMemory = useCallback(async (memoryId: string) => {
    const newMemories = memories.filter(m => m.id !== memoryId);
    setMemories(newMemories);
    save(STORAGE_KEYS.MEMORIES, newMemories);
  }, [memories]);

  const completeSetup = useCallback(async (data: SetupData) => {
    const newMyProfile: MyProfile = { name: data.myName, mood: 3, status: "在线", color: data.myColor };
    const newPartnerProfile: PartnerProfile = { name: data.partnerName, mood: 3, status: "刚刚在线", color: data.partnerColor };
    const newCoupleInfo: CoupleInfo = {
      ...coupleInfo,
      anniversaryDate: data.anniversaryDate,
      coupleNickname: data.coupleNickname,
    };

    const anniversaryMemory: Memory = {
      id: generateId(),
      title: `${data.coupleNickname || "我们"} 的纪念日`,
      description: `${data.myName} 和 ${data.partnerName} 的爱情正式开始`,
      date: data.anniversaryDate,
      type: "anniversary",
    };

    setMyProfile(newMyProfile);
    setPartnerProfile(newPartnerProfile);
    setCoupleInfo(newCoupleInfo);
    setMemories([anniversaryMemory]);
    setIsSetupComplete(true);

    await Promise.all([
      save(STORAGE_KEYS.MY_PROFILE, newMyProfile),
      save(STORAGE_KEYS.PARTNER_PROFILE, newPartnerProfile),
      save(STORAGE_KEYS.COUPLE_INFO, newCoupleInfo),
      save(STORAGE_KEYS.MEMORIES, [anniversaryMemory]),
      AsyncStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, "true"),
    ]);
  }, [coupleInfo]);

  const answerQuiz = useCallback(async () => {
    const newStats = { ...todayStats, quizAnswered: true };
    setTodayStats(newStats);
    save(STORAGE_KEYS.TODAY_STATS, newStats);
  }, [todayStats]);

  const completeChallenge = useCallback(async () => {
    const newStats = { ...todayStats, challengeCompleted: true };
    setTodayStats(newStats);
    save(STORAGE_KEYS.TODAY_STATS, newStats);
  }, [todayStats]);

  const getDaysTogether = useCallback(() => {
    if (!coupleInfo.anniversaryDate) return 0;
    const start = new Date(coupleInfo.anniversaryDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [coupleInfo.anniversaryDate]);

  return (
    <CoupleContext.Provider
      value={{
        myProfile,
        partnerProfile,
        coupleInfo,
        todayStats,
        tasks,
        memories,
        achievements,
        isSetupComplete,
        isLoading,
        updateMyProfile,
        updatePartnerProfile,
        updateCoupleInfo,
        tapHeart,
        setMyMood,
        expressNeed,
        sendGoodNight,
        addTask,
        completeTask,
        deleteTask,
        addMemory,
        deleteMemory,
        completeSetup,
        answerQuiz,
        completeChallenge,
        getDaysTogether,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error("useCouple must be used within CoupleProvider");
  return ctx;
}
