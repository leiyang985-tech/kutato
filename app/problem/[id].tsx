import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { explainProblem, generateVariants } from '@/ai';
import { useStore } from '@/store';
import { colors, radius, spacing, subjectColors } from '@/theme';
import type { VariantProblem } from '@/types';

export default function ProblemDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { getProblem, updateProblem, deleteProblem, settings } = useStore();
  const problem = getProblem(id);

  const [explainLoading, setExplainLoading] = useState(false);
  const [variantLoading, setVariantLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={confirmDelete} hitSlop={10}>
          <Text style={{ color: colors.danger, fontWeight: '700' }}>删除</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, problem]);

  if (!problem) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.subtext }}>错题不存在或已删除</Text>
      </View>
    );
  }

  function confirmDelete() {
    Alert.alert('删除错题', '确定删除这道错题吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await deleteProblem(id);
          router.back();
        },
      },
    ]);
  }

  function requireKey(): boolean {
    if (!settings.apiKey) {
      Alert.alert('未设置 API Key', '请先到「设置」里填入 Claude API Key。');
      return false;
    }
    return true;
  }

  async function onExplain() {
    if (!problem || !requireKey()) return;
    setExplainLoading(true);
    try {
      const text = await explainProblem(settings.apiKey, settings.model, problem);
      await updateProblem(id, { explanation: text });
    } catch (e: any) {
      Alert.alert('讲解失败', e?.message ?? '请重试');
    } finally {
      setExplainLoading(false);
    }
  }

  async function onVariants() {
    if (!problem || !requireKey()) return;
    setVariantLoading(true);
    try {
      const list = await generateVariants(settings.apiKey, settings.model, problem, 3);
      await updateProblem(id, { variants: list });
    } catch (e: any) {
      Alert.alert('生成失败', e?.message ?? '请重试');
    } finally {
      setVariantLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
    >
      <View style={styles.headerRow}>
        <View style={[styles.subjectTag, { backgroundColor: subjectColors[problem.subject] }]}>
          <Text style={styles.subjectTagText}>{problem.subject}</Text>
        </View>
        <Text style={styles.meta}>已复习 {problem.reviewCount} 次</Text>
      </View>

      {problem.imageUri && (
        <Image source={{ uri: problem.imageUri }} style={styles.image} resizeMode="contain" />
      )}

      <Section title="题目" body={problem.question} />
      {!!problem.myAnswer && <Section title="错误答案" body={problem.myAnswer} tone="danger" />}
      {!!problem.correctAnswer && <Section title="正确答案" body={problem.correctAnswer} tone="success" />}
      {!!problem.reason && <Section title="错误原因" body={problem.reason} />}
      {!!problem.knowledgePoint && <Section title="知识点" body={problem.knowledgePoint} />}

      {/* AI 讲解 */}
      <View style={styles.aiBlock}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiTitle}>🤖 AI 讲解</Text>
          <Pressable style={styles.aiBtn} onPress={onExplain} disabled={explainLoading}>
            {explainLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.aiBtnText}>{problem.explanation ? '重新讲解' : '生成讲解'}</Text>
            )}
          </Pressable>
        </View>
        {problem.explanation ? (
          <Text style={styles.aiBody}>{problem.explanation}</Text>
        ) : (
          <Text style={styles.aiHint}>让 AI 老师讲清楚这道题的思路和易错点。</Text>
        )}
      </View>

      {/* 举一反三 */}
      <View style={styles.aiBlock}>
        <View style={styles.aiHeader}>
          <Text style={styles.aiTitle}>✨ 举一反三</Text>
          <Pressable style={styles.aiBtn} onPress={onVariants} disabled={variantLoading}>
            {variantLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.aiBtnText}>{problem.variants?.length ? '换一批' : '生成同类题'}</Text>
            )}
          </Pressable>
        </View>
        {problem.variants?.length ? (
          problem.variants.map((v, i) => <VariantCard key={i} index={i} variant={v} />)
        ) : (
          <Text style={styles.aiHint}>根据这道错题，生成 3 道同类型的练习题。</Text>
        )}
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone?: 'danger' | 'success';
}) {
  const color = tone === 'danger' ? colors.danger : tone === 'success' ? colors.success : colors.text;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={[styles.sectionBody, { color }]}>{body}</Text>
    </View>
  );
}

function VariantCard({ index, variant }: { index: number; variant: VariantProblem }) {
  const [show, setShow] = useState(false);
  return (
    <View style={styles.variant}>
      <Text style={styles.variantQ}>
        {index + 1}. {variant.question}
      </Text>
      <Pressable onPress={() => setShow((s) => !s)} style={styles.reveal}>
        <Text style={styles.revealText}>{show ? '收起答案' : '查看答案'}</Text>
      </Pressable>
      {show && (
        <View style={styles.variantAnswer}>
          <Text style={styles.variantAnswerLabel}>答案：</Text>
          <Text style={styles.variantAnswerText}>{variant.answer}</Text>
          <Text style={[styles.variantAnswerLabel, { marginTop: 6 }]}>解析：</Text>
          <Text style={styles.variantAnswerText}>{variant.solution}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subjectTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  subjectTagText: { color: '#fff', fontWeight: '700' },
  meta: { color: colors.subtext, fontSize: 13 },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 13, color: colors.subtext, marginBottom: 4, fontWeight: '700' },
  sectionBody: { fontSize: 15, lineHeight: 22 },
  aiBlock: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  aiBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
  },
  aiBtnText: { color: '#fff', fontWeight: '700' },
  aiHint: { color: colors.subtext, marginTop: spacing.sm, lineHeight: 20 },
  aiBody: { color: colors.text, marginTop: spacing.sm, lineHeight: 23, fontSize: 15 },
  variant: {
    marginTop: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  variantQ: { color: colors.text, fontSize: 15, lineHeight: 22 },
  reveal: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  revealText: { color: colors.primary, fontWeight: '700' },
  variantAnswer: { marginTop: spacing.sm },
  variantAnswerLabel: { color: colors.subtext, fontWeight: '700', fontSize: 13 },
  variantAnswerText: { color: colors.text, lineHeight: 21 },
});
