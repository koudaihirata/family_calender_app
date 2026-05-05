import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export default function RegisterScreen() {
  const { signIn } = useAuth()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert('エラー', 'すべての項目を入力してください')
      return
    }
    if (password.length < 8) {
      Alert.alert('エラー', 'パスワードは8文字以上で入力してください')
      return
    }
    setLoading(true)
    try {
      const { user, access_token, refresh_token } = await api.register({ name, email, password })
      await signIn(access_token, refresh_token, user)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('登録失敗', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>新規登録</Text>
        <Text style={styles.subtitle}>アカウントを作成してください</Text>

        <TextInput
          style={styles.input}
          placeholder="名前"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          autoComplete="name"
        />
        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード（8文字以上）"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>アカウントを作成</Text>
          }
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>すでにアカウントをお持ちの方は </Text>
          <Link href="/(auth)/login" style={styles.link}>ログイン</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: {
    flexGrow: 1, justifyContent: 'center',
    paddingHorizontal: 32, paddingVertical: 48, gap: 12,
  },
  title:    { fontSize: 30, fontWeight: '700', textAlign: 'center', color: '#111' },
  subtitle: { fontSize: 14, textAlign: 'center', color: '#888', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, backgroundColor: '#fafafa', color: '#111',
  },
  primaryButton: {
    backgroundColor: '#4F7FFF', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', marginTop: 4,
  },
  disabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#888', fontSize: 14 },
  link: { color: '#4F7FFF', fontSize: 14, fontWeight: '600' },
})
