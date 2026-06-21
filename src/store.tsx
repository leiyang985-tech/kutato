// 全局数据存储：错题与设置，持久化到本机 AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  computeNextReview,
  DEFAULT_MODEL,
  type Problem,
  type Settings,
} from './types';

const PROBLEMS_KEY = 'kutato.problems.v1';
const SETTINGS_KEY = 'kutato.settings.v1';

type NewProblem = Omit<
  Problem,
  'id' | 'createdAt' | 'reviewLevel' | 'nextReviewAt' | 'reviewCount'
>;

interface StoreValue {
  ready: boolean;
  problems: Problem[];
  settings: Settings;
  addProblem: (p: NewProblem) => Promise<Problem>;
  updateProblem: (id: string, patch: Partial<Problem>) => Promise<void>;
  deleteProblem: (id: string) => Promise<void>;
  getProblem: (id: string) => Problem | undefined;
  reviewProblem: (id: string, remembered: boolean) => Promise<void>;
  clearAllProblems: () => Promise<void>;
  saveSettings: (patch: Partial<Settings>) => Promise<void>;
  dueProblems: Problem[];
}

const StoreContext = createContext<StoreValue | null>(null);

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    apiKey: '',
    model: DEFAULT_MODEL,
  });

  // 启动时加载
  useEffect(() => {
    (async () => {
      try {
        const [pRaw, sRaw] = await Promise.all([
          AsyncStorage.getItem(PROBLEMS_KEY),
          AsyncStorage.getItem(SETTINGS_KEY),
        ]);
        if (pRaw) setProblems(JSON.parse(pRaw));
        if (sRaw) setSettings({ model: DEFAULT_MODEL, ...JSON.parse(sRaw) });
      } catch (e) {
        // 读取失败就用空数据，不影响使用
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Problem[]) => {
    setProblems(next);
    await AsyncStorage.setItem(PROBLEMS_KEY, JSON.stringify(next));
  }, []);

  const addProblem = useCallback(
    async (p: NewProblem) => {
      const problem: Problem = {
        ...p,
        id: genId(),
        createdAt: Date.now(),
        reviewLevel: 0,
        nextReviewAt: computeNextReview(0),
        reviewCount: 0,
      };
      await persist([problem, ...problems]);
      return problem;
    },
    [problems, persist]
  );

  const updateProblem = useCallback(
    async (id: string, patch: Partial<Problem>) => {
      await persist(problems.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [problems, persist]
  );

  const deleteProblem = useCallback(
    async (id: string) => {
      await persist(problems.filter((p) => p.id !== id));
    },
    [problems, persist]
  );

  const getProblem = useCallback(
    (id: string) => problems.find((p) => p.id === id),
    [problems]
  );

  const reviewProblem = useCallback(
    async (id: string, remembered: boolean) => {
      await persist(
        problems.map((p) => {
          if (p.id !== id) return p;
          // 记住了升一级（间隔变长），没记住回到第 1 级（明天再复习）
          const nextLevel = remembered ? p.reviewLevel + 1 : 1;
          return {
            ...p,
            reviewLevel: nextLevel,
            nextReviewAt: computeNextReview(nextLevel),
            reviewCount: p.reviewCount + 1,
          };
        })
      );
    },
    [problems, persist]
  );

  const clearAllProblems = useCallback(async () => {
    await persist([]);
  }, [persist]);

  const saveSettings = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    },
    [settings]
  );

  const dueProblems = useMemo(() => {
    const now = Date.now();
    return problems
      .filter((p) => p.nextReviewAt <= now)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt);
  }, [problems]);

  const value: StoreValue = {
    ready,
    problems,
    settings,
    addProblem,
    updateProblem,
    deleteProblem,
    getProblem,
    reviewProblem,
    clearAllProblems,
    saveSettings,
    dueProblems,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore 必须在 StoreProvider 内使用');
  return ctx;
}
