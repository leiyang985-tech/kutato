import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ocrProblem } from '@/ai';
import { useStore } from '@/store';
import { colors, radius, spacing, subjectColors } from '@/theme';
import { SUBJECTS, type Subject } from '@/types';

export default function NewProblem() {
  const { addProblem, settings } = useStore();

  const [subject, setSubject] = useState<Subject>('数学');
  const [question, setQuestion] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [reason, setReason] = useState('');
  const [knowledgePoint, setKnowledgePoint] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function runOcr(base64: string, mediaType: string) {
    if (!settings.apiKey) {
      Alert.alert(
        '未设置 API Key',
        '图片已保存。若要自动识别文字，请先到「设置」里填入 Claude API Key。'
      );
      return;
    }
    setOcrLoading(true);
    try {
      const r = await ocrProblem(settings.apiKey, settings.model, base64, mediaType);
      setSubject(r.subject);
      setQuestion(r.question);
      if (r.correctAnswer) setCorrectAnswer(r.correctAnswer);
      if (r.knowledgePoint) setKnowledgePoint(r.knowledgePoint);
    } catch (e: any) {
      Alert.alert('识别失败', e?.message ?? '请重试，或手动输入。');
    } finally {
      setOcrLoading(false);
    }
  }

  async function pickImage(fromCamera: boolean) {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('需要权限', '请在系统设置中允许访问' + (fromCamera ? '相机' : '相册'));
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = {
      base64: true,
      quality: 0.6,
      mediaTypes: ['images'],
    };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    if (asset.base64) {
      const mediaType = asset.mimeType ?? 'image/jpeg';
      await runOcr(asset.base64, mediaType);
    }
  }

  async function save() {
    if (!question.trim()) {
      Alert.alert('请填写题目', '题目内容不能为空。');
      return;
    }
    setSaving(true);
    try {
      await addProblem({
        subject,
        question: question.trim(),
        myAnswer: myAnswer.trim(),
        correctAnswer: correctAnswer.trim(),
        reason: reason.trim(),
        knowledgePoint: knowledgePoint.trim(),
        imageUri,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* 拍照 / 选图 */}
      <View style={styles.photoRow}>
        <Pressable style={styles.photoBtn} onPress={() => pickImage(true)}>
          <Text style={styles.photoBtnText}>📷 拍照</Text>
        </Pressable>
        <Pressable style={styles.photoBtn} onPress={() => pickImage(false)}>
          <Text style={styles.photoBtnText}>🖼️ 从相册选</Text>
        </Pressable>
      </View>

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
      )}

      {ocrLoading && (
        <View style={styles.ocrLoading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.ocrLoadingText}>AI 正在识别题目…</Text>
        </View>
      )}

      {/* 科目 */}
      <Text style={styles.label}>科目</Text>
      <View style={styles.subjectWrap}>
        {SUBJECTS.map((s) => {
          const active = subject === s;
          return (
            <Pressable
              key={s}
              onPress={() => setSubject(s)}
              style={[
                styles.subjectChip,
                active && { backgroundColor: subjectColors[s], borderColor: subjectColors[s] },
              ]}
            >
              <Text style={[styles.subjectChipText, active && { color: '#fff' }]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <Field label="题目" value={question} onChange={setQuestion} multiline placeholder="题目内容（可拍照自动识别）" />
      <Field label="孩子的错误答案" value={myAnswer} onChange={setMyAnswer} multiline placeholder="写错成了什么" />
      <Field label="正确答案" value={correctAnswer} onChange={setCorrectAnswer} multiline placeholder="正确答案" />
      <Field label="错误原因" value={reason} onChange={setReason} multiline placeholder="例如：计算粗心 / 概念不清" />
      <Field label="知识点" value={knowledgePoint} onChange={setKnowledgePoint} placeholder="例如：一元二次方程" />

      <Pressable style={[styles.save, saving && { opacity: 0.6 }]} disabled={saving} onPress={save}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>保存错题</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.subtext}
        multiline={multiline}
        style={[styles.input, multiline && { minHeight: 70, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  photoRow: { flexDirection: 'row', gap: spacing.md },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  photoBtnText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginTop: spacing.md,
    backgroundColor: colors.card,
  },
  ocrLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ocrLoadingText: { color: colors.subtext },
  label: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 6 },
  subjectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectChipText: { color: colors.subtext, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  save: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
