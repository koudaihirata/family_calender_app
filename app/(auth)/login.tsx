import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native'
import { Link, router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useAuth } from '@/lib/auth-context'
import { api, BASE_URL } from '@/lib/api'

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください')
      return
    }
    setLoading(true)
    try {
      const { user, access_token, refresh_token } = await api.login({ email, password })
      await signIn(access_token, refresh_token, user)
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('ログイン失敗', e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const result = await WebBrowser.openAuthSessionAsync(
      `${BASE_URL}/auth/google?mobile=true`,
      'familycalendar://'
    )
    if (result.type !== 'success') return

    const url          = new URL(result.url)
    const accessToken  = url.searchParams.get('access_token')
    const refreshToken = url.searchParams.get('refresh_token')
    const userParam    = url.searchParams.get('user')

    if (!accessToken || !refreshToken || !userParam) {
      Alert.alert('エラー', 'Google認証に失敗しました')
      return
    }

    try {
      await signIn(accessToken, refreshToken, JSON.parse(decodeURIComponent(userParam)))
      router.replace('/(tabs)')
    } catch {
      Alert.alert('エラー', 'ログインに失敗しました')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>ログイン</Text>
        <Text style={styles.subtitle}>ファミリーカレンダーへようこそ</Text>

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
          placeholder="パスワード"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.primaryButtonText}>ログイン</Text>
          }
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Googleでログイン</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>アカウントをお持ちでない方は </Text>
          <Link href="/(auth)/register" style={styles.link}>新規登録</Link>
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
  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  dividerText: { color: '#aaa', fontSize: 13 },
  googleButton: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', backgroundColor: '#fff',
  },
  googleButtonText: { fontSize: 16, fontWeight: '500', color: '#333' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { color: '#888', fontSize: 14 },
  link: { color: '#4F7FFF', fontSize: 14, fontWeight: '600' },
})
