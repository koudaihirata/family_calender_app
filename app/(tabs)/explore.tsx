import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'

export default function SettingsScreen() {
  const { signOut } = useAuth()

  async function handleLogout() {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>ログアウト</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 28, fontWeight: '700', color: '#111',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24,
  },
  logoutButton: {
    marginHorizontal: 20, marginTop: 8,
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 16, paddingHorizontal: 20,
    borderWidth: 1, borderColor: '#ffe0e0',
  },
  logoutText: { color: '#e53935', fontSize: 16, fontWeight: '500' },
})
