import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useStore } from '@/store';
import { colors, radius, spacing } from '@/theme';

export default function Settings() {
  const { settings, saveSettings, problems, clearAllProblems } = useStore();
  const [key, setKey] = useState(settings.apiKey);
  const [show, setShow] = useState(false);

  useEffect(() => setKey(settings.apiKey), [settings.apiKey]);

  async function onSave() {
    await saveSettings({ apiKey: key.trim() });
    Alert.alert('已保存', 'API Key 已保存到本机。');
  }

  function clearAll() {
    Alert.alert('清空所有错题', '此操作不可恢复，确定吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '清空',
        style: 'destructive',
        onPress: async () => {
          await clearAllProblems();
          Alert.alert('已清空', '所有错题已删除。');
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.md }}>
      <Text style={styles.sectionTitle}>Claude API Key</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>显示明文</Text>
          <Switch value={show} onValueChange={setShow} />
        </View>
        <TextInput
          value={key}
          onChangeText={setKey}
          placeholder="sk-ant-..."
          placeholderTextColor={colors.subtext}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>保存</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://console.anthropic.com/settings/keys')}>
          <Text style={styles.link}>→ 前往 Anthropic 控制台获取 API Key</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>模型</Text>
      <View style={styles.card}>
        <Text style={styles.modelName}>{settings.model}</Text>
        <Text style={styles.modelHint}>
          使用 Anthropic 最新的 Claude Opus 模型，负责拍照识别、讲解、举一反三与出题。
        </Text>
      </View>

      <Text style={styles.sectionTitle}>数据</Text>
      <View style={styles.card}>
        <Text style={styles.modelHint}>当前共有 {problems.length} 道错题，全部保存在本机。</Text>
        <Pressable style={styles.dangerBtn} onPress={clearAll}>
          <Text style={styles.dangerBtnText}>清空所有错题</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>关于</Text>
      <View style={styles.card}>
        <Text style={styles.about}>
          智能错题本 · 给孩子用的学习工具。{'\n\n'}
          🔒 隐私说明：错题与 API Key 都只保存在你的手机上，不上传任何服务器。识别和出题时，
          相关内容会直接发送给 Anthropic 用于生成结果。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.subtext,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  rowLabel: { color: colors.text, fontSize: 15 },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  link: { color: colors.primary, marginTop: spacing.md, fontWeight: '600' },
  modelName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  modelHint: { color: colors.subtext, lineHeight: 21, marginTop: 6 },
  dangerBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerBtnText: { color: colors.danger, fontWeight: '700' },
  about: { color: colors.subtext, lineHeight: 22 },
});
