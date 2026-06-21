import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStore } from '@/store';
import { colors, radius, spacing, subjectColors } from '@/theme';
import { SUBJECTS, type Subject } from '@/types';

export default function ProblemList() {
  const { problems, dueProblems } = useStore();
  const [filter, setFilter] = useState<Subject | '全部'>('全部');

  // 只显示有错题的科目作为筛选项
  const usedSubjects = useMemo(() => {
    const set = new Set(problems.map((p) => p.subject));
    return SUBJECTS.filter((s) => set.has(s));
  }, [problems]);

  const filtered = useMemo(
    () =>
      filter === '全部'
        ? problems
        : problems.filter((p) => p.subject === filter),
    [problems, filter]
  );

  return (
    <View style={styles.container}>
      {/* 顶部统计 */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{problems.length}</Text>
          <Text style={styles.statLabel}>错题总数</Text>
        </View>
        <Pressable
          style={[styles.statCard, styles.statCardDue]}
          onPress={() => router.push('/review')}
        >
          <Text style={[styles.statNum, { color: '#fff' }]}>
            {dueProblems.length}
          </Text>
          <Text style={[styles.statLabel, { color: '#fff' }]}>待复习</Text>
        </Pressable>
      </View>

      {/* 科目筛选 */}
      {usedSubjects.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chips}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
          data={['全部', ...usedSubjects] as const}
          keyExtractor={(s) => s}
          renderItem={({ item }) => {
            const active = filter === item;
            return (
              <Pressable
                onPress={() => setFilter(item as Subject | '全部')}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <Link href={`/problem/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.subjectTag,
                    { backgroundColor: subjectColors[item.subject] },
                  ]}
                >
                  <Text style={styles.subjectTagText}>{item.subject}</Text>
                </View>
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
              <Text style={styles.question} numberOfLines={3}>
                {item.question || '（未填写题目）'}
              </Text>
              {!!item.knowledgePoint && (
                <Text style={styles.kp}>📌 {item.knowledgePoint}</Text>
              )}
            </Pressable>
          </Link>
        )}
      />

      {/* 录入按钮 */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/problem/new')}
      >
        <Text style={styles.fabText}>＋ 录入错题</Text>
      </Pressable>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>还没有错题</Text>
      <Text style={styles.emptyText}>
        点击下方「录入错题」，拍照或手动添加孩子的第一道错题吧。
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statCardDue: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  statNum: { fontSize: 28, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 13, color: colors.subtext, marginTop: 2 },
  chips: { flexGrow: 0, marginTop: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.subtext, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  listContent: { padding: spacing.md, paddingBottom: 120, gap: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  subjectTagText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  date: { color: colors.subtext, fontSize: 12 },
  question: { color: colors.text, fontSize: 15, lineHeight: 22 },
  kp: { color: colors.subtext, fontSize: 13, marginTop: spacing.sm },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.lg },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  emptyText: {
    fontSize: 14,
    color: colors.subtext,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },
});
