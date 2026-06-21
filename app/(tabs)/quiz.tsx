import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { generateQuiz, type QuizQuestion } from '@/ai';
import { useStore } from '@/store';
import { colors, radius, spacing, subjectColors } from '@/theme';
import { SUBJECTS, type Subject } from '@/types';

type Phase = 'setup' | 'loading' | 'taking' | 'result';

export default function Quiz() {
  const { problems, settings } = useStore();

  const [phase, setPhase] = useState<Phase>('setup');
  const [subject, setSubject] = useState<Subject | '全部'>('全部');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctCount, setCorrectCount] = useState(0);

  const usedSubjects = useMemo(() => {
    const set = new Set(problems.map((p) => p.subject));
    return SUBJECTS.filter((s) => set.has(s));
  }, [problems]);

  const pool = useMemo(
    () => (subject === '全部' ? problems : problems.filter((p) => p.subject === subject)),
    [problems, subject]
  );

  async function start() {
    if (!settings.apiKey) {
      Alert.alert('未设置 API Key', '请先到「设置」里填入 Claude API Key。');
      return;
    }
    if (pool.length === 0) {
      Alert.alert('没有错题', '该科目下还没有错题，先去录入一些吧。');
      return;
    }
    setPhase('loading');
    try {
      const qs = await generateQuiz(settings.apiKey, settings.model, pool.slice(0, 20), count);
      setQuestions(qs);
      setIndex(0);
      setRevealed(false);
      setUserAnswer('');
      setCorrectCount(0);
      setPhase('taking');
    } catch (e: any) {
      Alert.alert('出题失败', e?.message ?? '请重试');
      setPhase('setup');
    }
  }

  function mark(correct: boolean) {
    if (correct) setCorrectCount((c) => c + 1);
    if (index + 1 >= questions.length) {
      setPhase('result');
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
      setUserAnswer('');
    }
  }

  // —— 出题设置页 ——
  if (phase === 'setup') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.intro}>
          根据孩子的错题，AI 会围绕相同知识点出一份新测验，检验是否真正掌握。
        </Text>

        <Text style={styles.label}>选择范围</Text>
        <View style={styles.wrap}>
          {(['全部', ...usedSubjects] as const).map((s) => {
            const active = subject === s;
            const tint = s === '全部' ? colors.primary : subjectColors[s as Subject];
            return (
              <Pressable
                key={s}
                onPress={() => setSubject(s as Subject | '全部')}
                style={[styles.chip, active && { backgroundColor: tint, borderColor: tint }]}
              >
                <Text style={[styles.chipText, active && { color: '#fff' }]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>题目数量</Text>
        <View style={styles.wrap}>
          {[3, 5, 8, 10].map((n) => {
            const active = count === n;
            return (
              <Pressable
                key={n}
                onPress={() => setCount(n)}
                style={[styles.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={[styles.chipText, active && { color: '#fff' }]}>{n} 道</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.poolHint}>可用错题：{pool.length} 道</Text>

        <Pressable style={styles.primaryBtn} onPress={start}>
          <Text style={styles.primaryBtnText}>开始测验</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // —— 出题中 ——
  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>AI 正在出题…</Text>
      </View>
    );
  }

  // —— 结果页 ——
  if (phase === 'result') {
    const rate = Math.round((correctCount / questions.length) * 100);
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>{rate >= 80 ? '🏆' : rate >= 60 ? '👍' : '💪'}</Text>
        <Text style={styles.score}>
          {correctCount} / {questions.length}
        </Text>
        <Text style={styles.scoreLabel}>正确率 {rate}%</Text>
        <Pressable style={styles.primaryBtn} onPress={() => setPhase('setup')}>
          <Text style={styles.primaryBtnText}>再测一次</Text>
        </Pressable>
        <Pressable style={styles.linkBtn} onPress={() => router.push('/')}>
          <Text style={styles.linkBtnText}>返回错题本</Text>
        </Pressable>
      </View>
    );
  }

  // —— 答题页 ——
  const q = questions[index];
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
      <Text style={styles.progress}>
        第 {index + 1} / {questions.length} 题　·　知识点：{q.fromKnowledgePoint}
      </Text>

      <View style={styles.card}>
        <Text style={styles.question}>{q.question}</Text>
      </View>

      {!revealed ? (
        <>
          <TextInput
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="在这里写下你的答案…"
            placeholderTextColor={colors.subtext}
            multiline
            style={styles.answerInput}
          />
          <Pressable style={styles.primaryBtn} onPress={() => setRevealed(true)}>
            <Text style={styles.primaryBtnText}>对答案</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.compareBox}>
            <Text style={styles.cmpLabel}>你的答案</Text>
            <Text style={styles.cmpText}>{userAnswer || '（未作答）'}</Text>
            <Text style={[styles.cmpLabel, { marginTop: spacing.sm, color: colors.success }]}>标准答案</Text>
            <Text style={styles.cmpText}>{q.answer}</Text>
            <Text style={[styles.cmpLabel, { marginTop: spacing.sm }]}>解析</Text>
            <Text style={styles.cmpText}>{q.solution}</Text>
          </View>

          <Text style={styles.selfCheck}>这道题做对了吗？</Text>
          <View style={styles.actions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.danger }]} onPress={() => mark(false)}>
              <Text style={styles.actionText}>做错了</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => mark(true)}>
              <Text style={styles.actionText}>做对了</Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  intro: { color: colors.subtext, lineHeight: 22, marginBottom: spacing.md },
  label: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md, marginBottom: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { color: colors.subtext, fontWeight: '600' },
  poolHint: { color: colors.subtext, marginTop: spacing.md },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  loadingText: { color: colors.subtext, marginTop: spacing.md },
  emoji: { fontSize: 64, marginBottom: spacing.sm },
  score: { fontSize: 40, fontWeight: '900', color: colors.text },
  scoreLabel: { color: colors.subtext, fontSize: 16, marginTop: 4 },
  linkBtn: { marginTop: spacing.md, padding: spacing.sm },
  linkBtnText: { color: colors.primary, fontWeight: '700' },
  progress: { color: colors.subtext, fontWeight: '600', marginBottom: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  question: { color: colors.text, fontSize: 17, lineHeight: 26 },
  answerInput: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 90,
    textAlignVertical: 'top',
    color: colors.text,
    fontSize: 15,
  },
  compareBox: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cmpLabel: { color: colors.subtext, fontWeight: '700', fontSize: 13 },
  cmpText: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 4 },
  selfCheck: { textAlign: 'center', color: colors.text, fontWeight: '700', marginTop: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  actionBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
