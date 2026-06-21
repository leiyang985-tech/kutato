// Claude API 封装：OCR 识别、AI 讲解、举一反三、出测验题
//
// 说明：本 app 直接从手机端调用 Anthropic API，API Key 存在本机。
// 这适合给自己孩子用的个人 app；若要公开发布，应改为通过自己的后端中转，
// 避免 API Key 暴露。

import type { Problem, Subject, VariantProblem } from './types';
import { SUBJECTS } from './types';

const API_URL = 'https://api.anthropic.com/v1/messages';

type Block =
  | { type: 'text'; text: string }
  | {
      type: 'image';
      source: { type: 'base64'; media_type: string; data: string };
    };

interface CallOptions {
  apiKey: string;
  model: string;
  system?: string;
  content: Block[];
  maxTokens?: number;
  schema?: Record<string, unknown>; // 提供则使用结构化输出
}

// 通用调用：返回第一个文本块的内容
async function callClaude(opts: CallOptions): Promise<string> {
  const body: Record<string, unknown> = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 4096,
    messages: [{ role: 'user', content: opts.content }],
  };
  if (opts.system) body.system = opts.system;
  if (opts.schema) {
    body.output_config = {
      format: { type: 'json_schema', schema: opts.schema },
    };
  }

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': opts.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error('网络连接失败，请检查网络后重试。');
  }

  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error?.message ?? '';
    } catch {
      // ignore
    }
    if (res.status === 401) {
      throw new Error('API Key 无效，请到「设置」里检查。');
    }
    if (res.status === 429) {
      throw new Error('请求太频繁了，请稍后再试。');
    }
    throw new Error(`请求失败（${res.status}）：${detail || '请稍后重试'}`);
  }

  const data = await res.json();
  const textBlock = (data.content as Array<{ type: string; text?: string }>).find(
    (b) => b.type === 'text'
  );
  if (!textBlock?.text) {
    throw new Error('AI 没有返回内容，请重试。');
  }
  return textBlock.text;
}

function parseJSON<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    // 兜底：截取第一个 { 到最后一个 }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1)) as T;
    }
    throw new Error('AI 返回的内容解析失败，请重试。');
  }
}

const subjectEnum = [...SUBJECTS];

// ① 拍照识别错题：从图片中提取题目、答案、知识点
export interface OcrResult {
  subject: Subject;
  question: string;
  correctAnswer: string;
  knowledgePoint: string;
}

export async function ocrProblem(
  apiKey: string,
  model: string,
  base64: string,
  mediaType: string
): Promise<OcrResult> {
  const text = await callClaude({
    apiKey,
    model,
    system:
      '你是一个帮助中小学生整理错题本的助手。请仔细识别图片中的题目内容。',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: base64 },
      },
      {
        type: 'text',
        text:
          '识别这张图片里的题目。提取：题目完整内容(question)、判断所属科目(subject)、' +
          '如果图中有标准答案则填写(correctAnswer，没有就留空)、涉及的主要知识点(knowledgePoint)。' +
          '题目中的数学公式用普通文本表示。',
      },
    ],
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', enum: subjectEnum },
        question: { type: 'string' },
        correctAnswer: { type: 'string' },
        knowledgePoint: { type: 'string' },
      },
      required: ['subject', 'question', 'correctAnswer', 'knowledgePoint'],
      additionalProperties: false,
    },
  });
  return parseJSON<OcrResult>(text);
}

// ② AI 讲解：针对这道错题给出清晰的讲解
export async function explainProblem(
  apiKey: string,
  model: string,
  problem: Problem
): Promise<string> {
  return callClaude({
    apiKey,
    model,
    maxTokens: 3000,
    system:
      '你是一位耐心、亲切的中小学老师，面向学生讲解。语言简洁易懂，循序渐进，' +
      '突出解题思路和易错点。直接给出讲解，不要寒暄。',
    content: [
      {
        type: 'text',
        text:
          `请讲解下面这道${problem.subject}错题：\n\n` +
          `【题目】${problem.question}\n` +
          (problem.myAnswer ? `【学生的错误答案】${problem.myAnswer}\n` : '') +
          (problem.correctAnswer ? `【正确答案】${problem.correctAnswer}\n` : '') +
          (problem.reason ? `【错误原因】${problem.reason}\n` : '') +
          '\n请讲清楚：1) 这道题考查什么；2) 正确的解题步骤；3) 学生为什么会做错、如何避免。',
      },
    ],
  });
}

// ③ 举一反三：生成同类型的新题目
export async function generateVariants(
  apiKey: string,
  model: string,
  problem: Problem,
  count: number
): Promise<VariantProblem[]> {
  const text = await callClaude({
    apiKey,
    model,
    maxTokens: 4096,
    system:
      '你是一位中小学老师，擅长出题。根据给定错题，出同类型、同知识点但题目内容不同的练习题，难度相当。',
    content: [
      {
        type: 'text',
        text:
          `根据下面这道${problem.subject}错题，出${count}道同类型的新题目（举一反三）。\n\n` +
          `【原题】${problem.question}\n` +
          (problem.knowledgePoint ? `【知识点】${problem.knowledgePoint}\n` : '') +
          '\n每道题给出题目(question)、答案(answer)、解析(solution)。',
      },
    ],
    schema: {
      type: 'object',
      properties: {
        problems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' },
              solution: { type: 'string' },
            },
            required: ['question', 'answer', 'solution'],
            additionalProperties: false,
          },
        },
      },
      required: ['problems'],
      additionalProperties: false,
    },
  });
  return parseJSON<{ problems: VariantProblem[] }>(text).problems;
}

// ④ 出测验：从一组错题里出测验题考学生
export interface QuizQuestion {
  question: string;
  answer: string;
  solution: string;
  fromKnowledgePoint: string;
}

export async function generateQuiz(
  apiKey: string,
  model: string,
  problems: Problem[],
  count: number
): Promise<QuizQuestion[]> {
  const summary = problems
    .map(
      (p, i) =>
        `${i + 1}. [${p.subject}] ${p.question}` +
        (p.knowledgePoint ? `（知识点：${p.knowledgePoint}）` : '')
    )
    .join('\n');

  const text = await callClaude({
    apiKey,
    model,
    maxTokens: 4096,
    system:
      '你是一位中小学老师。根据学生的错题，围绕相同知识点出一份测验，检验学生是否真正掌握。题目要新，不要照抄原题。',
    content: [
      {
        type: 'text',
        text:
          `下面是学生最近的一些错题，请围绕这些知识点出${count}道测验题：\n\n${summary}\n\n` +
          '每道题给出题目(question)、标准答案(answer)、解析(solution)、对应知识点(fromKnowledgePoint)。',
      },
    ],
    schema: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              question: { type: 'string' },
              answer: { type: 'string' },
              solution: { type: 'string' },
              fromKnowledgePoint: { type: 'string' },
            },
            required: ['question', 'answer', 'solution', 'fromKnowledgePoint'],
            additionalProperties: false,
          },
        },
      },
      required: ['questions'],
      additionalProperties: false,
    },
  });
  return parseJSON<{ questions: QuizQuestion[] }>(text).questions;
}
