// 数据模型

export const SUBJECTS = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
  '其他',
] as const;

export type Subject = (typeof SUBJECTS)[number];

// 举一反三 / 测验生成出来的同类题
export interface VariantProblem {
  question: string; // 题目
  answer: string; // 答案
  solution: string; // 解析
}

export interface Problem {
  id: string;
  subject: Subject;
  question: string; // 题目内容
  myAnswer: string; // 我当时的错误答案
  correctAnswer: string; // 正确答案
  reason: string; // 错误原因
  knowledgePoint: string; // 涉及知识点
  imageUri?: string; // 拍照原图（本地 uri）
  explanation?: string; // AI 讲解（缓存，避免重复请求）
  variants?: VariantProblem[]; // 举一反三（缓存）
  createdAt: number;

  // —— 间隔重复复习状态 ——
  reviewLevel: number; // 复习等级，越高间隔越长
  nextReviewAt: number; // 下次该复习的时间戳
  reviewCount: number; // 总复习次数
}

export interface Settings {
  apiKey: string; // Claude API Key（存在本机）
  model: string; // 使用的模型
}

export const DEFAULT_MODEL = 'claude-opus-4-8';

// 间隔重复的复习间隔（天）。记住了就升一级，间隔变长。
export const REVIEW_INTERVALS_DAYS = [0, 1, 2, 4, 7, 15, 30, 60];

export function computeNextReview(level: number): number {
  const clamped = Math.max(0, Math.min(level, REVIEW_INTERVALS_DAYS.length - 1));
  const days = REVIEW_INTERVALS_DAYS[clamped];
  return Date.now() + days * 24 * 60 * 60 * 1000;
}
