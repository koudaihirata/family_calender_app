import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export default function JoinFamilyScreen() {
  const { setFamily } = useAuth()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (code.trim().length < 6) {
      Alert.alert('エラー', '招待コードは6文字です')
      return
    }
    setLoading(true)
    try {
      const { family } = await api.joinFamily({ invite_code: code.trim() })
      await setFamily(family)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('参加失敗', e.message)
    } finally {
      setLoading(false)
    }
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
        <Text style={styles.title}>招待コードで参加</Text>
        <Text style={styles.subtitle}>家族から届いた6桁のコードを入力してください</Text>

        <TextInput
          style={styles.codeInput}
          placeholder="ABC123"
          placeholderTextColor="#C4A898"
          value={code}
          onChangeText={t => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          autoFocus
        />

        <TouchableOpacity
          style={[styles.primaryButton, (loading || code.length < 6) && styles.disabled]}
          onPress={handleJoin}
          disabled={loading || code.length < 6}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>参加する</Text>
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
  codeInput: {
    borderWidth: 1.5, borderColor: '#FFE8CC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 18,
    fontSize: 32, fontWeight: '800', color: '#F07828',
    backgroundColor: '#fff', textAlign: 'center', letterSpacing: 12,
  },
  primaryButton: {
    backgroundColor: '#F07828', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled:          { opacity: 0.5 },
})
