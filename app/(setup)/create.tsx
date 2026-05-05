import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Share,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import type { Family } from '@/lib/auth-context'

export default function CreateFamilyScreen() {
  const { setFamily } = useAuth()
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Family | null>(null)

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('エラー', '家族グループ名を入力してください')
      return
    }
    setLoading(true)
    try {
      const { family } = await api.createFamily({ name: name.trim() })
      await setFamily(family)
      setCreated(family)
    } catch (e: any) {
      Alert.alert('エラー', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    if (!created) return
    await Share.share({
      message: `ファミリーカレンダーに参加してください！\n招待コード: ${created.invite_code}`,
    })
  }

  if (created) {
    return (
      <View style={styles.container}>
        <View style={styles.successArea}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={styles.successTitle}>「{created.name}」を作成しました！</Text>
          <Text style={styles.successSub}>招待コードを家族に共有してください</Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>招待コード</Text>
            <Text style={styles.code}>{created.invite_code}</Text>
          </View>

          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>招待コードを共有する</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryButtonText}>カレンダーを始める</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← 戻る</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        <Text style={styles.title}>家族グループを作成</Text>
        <Text style={styles.subtitle}>グループ名を決めましょう（例：田中家）</Text>

        <TextInput
          style={styles.input}
          placeholder="家族グループ名"
          placeholderTextColor="#C4A898"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>作成する</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFF8F2', paddingHorizontal: 28 },
  backButton:   { marginTop: 60, marginBottom: 8 },
  backButtonText: { color: '#A07858', fontSize: 16 },
  inner:        { flex: 1, justifyContent: 'center', gap: 14 },
  title:        { fontSize: 24, fontWeight: '700', color: '#3D2B1F' },
  subtitle:     { fontSize: 14, color: '#A07858', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#FFE8CC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, backgroundColor: '#fff', color: '#3D2B1F',
  },
  primaryButton: {
    backgroundColor: '#F07828', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled:          { opacity: 0.6 },
  // 作成完了画面
  successArea:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  successEmoji: { fontSize: 56 },
  successTitle: { fontSize: 20, fontWeight: '700', color: '#3D2B1F', textAlign: 'center' },
  successSub:   { fontSize: 14, color: '#A07858', textAlign: 'center' },
  codeBox: {
    backgroundColor: '#FFE8CC', borderRadius: 16,
    paddingVertical: 20, paddingHorizontal: 40,
    alignItems: 'center', gap: 8, marginTop: 8, width: '100%',
  },
  codeLabel: { fontSize: 12, color: '#A07858', fontWeight: '600', letterSpacing: 1 },
  code:      { fontSize: 36, fontWeight: '800', color: '#F07828', letterSpacing: 8 },
  shareButton: {
    borderWidth: 1.5, borderColor: '#F07828', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
  },
  shareButtonText: { color: '#F07828', fontSize: 15, fontWeight: '600' },
})
