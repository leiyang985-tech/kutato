import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '@/store';
import { colors, radius, spacing, subjectColors } from '@/theme';

export default function Review() {
  const { dueProblems, reviewProblem } = useStore();

  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  // 进入页面时锁定本轮要复习的题目集合，避免复习后列表变化导致跳题
  const [queue, setQueue] = useState(dueProblems.map((p) => p.id));

  useEffect(() => {
    // 队列为空（首次进入）时初始化
    if (queue.length === 0 && dueProblems.length > 0) {
      setQueue(dueProblems.map((p) => p.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dueProblems.length]);

  const currentId = queue[index];
  const current = dueProblems.find((p) => p.id === currentId);
  const done = index >= queue.length;

  async function answer(remembered: boolean) {
    if (!currentId) return;
    await reviewProblem(currentId, remembered);
    setShowAnswer(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setIndex(0);
    setShowAnswer(false);
    setQueue(dueProblems.map((p) => p.id));
  }

  if (queue.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.bigText}>太棒了，没有待复习的错题！</Text>
        <Text style={styles.subText}>录入新错题后，会按照记忆曲线安排复习。</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/')}>
          <Text style={styles.primaryBtnText}>去错题本</Text>
        </Pressable>
      </View>
    );
  }

  if (done || !current) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>✅</Text>
        <Text style={styles.bigText}>本轮复习完成！</Text>
        <Text style={styles.subText}>共复习 {queue.length} 道错题。</Text>
        <Pressable style={styles.primaryBtn} onPress={restart}>
          <Text style={styles.primaryBtnText}>再来一轮</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        {index + 1} / {queue.length}
      </Text>

      <ScrollView contentContainerStyle={styles.cardWrap}>
        <View style={styles.card}>
          <View style={[styles.subjectTag, { backgroundColor: subjectColors[current.subject] }]}>
            <Text style={styles.subjectTagText}>{current.subject}</Text>
          </View>

          <Text style={styles.qLabel}>题目</Text>
          <Text style={styles.question}>{current.question}</Text>

          {!showAnswer ? (
            <Pressable style={styles.showBtn} onPress={() => setShowAnswer(true)}>
              <Text style={styles.showBtnText}>显示答案</Text>
            </Pressable>
          ) : (
            <View style={styles.answerBox}>
              {!!current.correctAnswer && (
                <>
                  <Text style={styles.aLabel}>正确答案</Text>
                  <Text style={styles.answer}>{current.correctAnswer}</Text>
                </>
              )}
              {!!current.reason && (
                <>
                  <Text style={[styles.aLabel, { marginTop: spacing.sm }]}>错误原因</Text>
                  <Text style={styles.answer}>{current.reason}</Text>
                </>
              )}
              {!!current.explanation && (
                <>
                  <Text style={[styles.aLabel, { marginTop: spacing.sm }]}>讲解</Text>
                  <Text style={styles.answer}>{current.explanation}</Text>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {showAnswer && (
        <View style={styles.actions}>
          <Pressable style={[styles.actionBtn, styles.forgot]} onPress={() => answer(false)}>
            <Text style={styles.actionText}>没记住</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, styles.remembered]} onPress={() => answer(true)}>
            <Text style={styles.actionText}>记住了</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  emoji: { fontSize: 56, marginBottom: spacing.md },
  bigText: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subText: { color: colors.subtext, marginTop: spacing.sm, textAlign: 'center', lineHeight: 21 },
  progress: { textAlign: 'center', color: colors.subtext, fontWeight: '700', marginBottom: spacing.sm },
  cardWrap: { paddingBottom: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  subjectTagText: { color: '#fff', fontWeight: '700' },
  qLabel: { color: colors.subtext, fontSize: 13, fontWeight: '700', marginTop: spacing.md },
  question: { color: colors.text, fontSize: 17, lineHeight: 26, marginTop: 6 },
  showBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  showBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  answerBox: { marginTop: spacing.md },
  aLabel: { color: colors.subtext, fontSize: 13, fontWeight: '700' },
  answer: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 4 },
  actions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md },
  actionBtn: { flex: 1, borderRadius: radius.md, paddingVertical: 16, alignItems: 'center' },
  forgot: { backgroundColor: colors.danger },
  remembered: { backgroundColor: colors.success },
  actionText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
