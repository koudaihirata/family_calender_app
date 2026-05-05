import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'

export default function SetupIndexScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <Text style={styles.title}>家族グループの設定</Text>
        <Text style={styles.subtitle}>
          カレンダーを使うには{'\n'}家族グループへの参加が必要です
        </Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(setup)/create')}
        >
          <Text style={styles.primaryButtonTitle}>新しい家族を作る</Text>
          <Text style={styles.primaryButtonSub}>招待コードを発行して家族を招待</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(setup)/join')}
        >
          <Text style={styles.secondaryButtonTitle}>招待コードで参加</Text>
          <Text style={styles.secondaryButtonSub}>家族から届いたコードを入力</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#FFF8F2',
    paddingHorizontal: 28, justifyContent: 'space-between', paddingVertical: 80,
  },
  top:        { alignItems: 'center', gap: 16 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: '#FFE8CC', alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji:  { fontSize: 44 },
  title:      { fontSize: 22, fontWeight: '700', color: '#3D2B1F', textAlign: 'center' },
  subtitle:   { fontSize: 15, color: '#A07858', textAlign: 'center', lineHeight: 22 },
  buttons:    { gap: 14 },
  primaryButton: {
    backgroundColor: '#F07828', borderRadius: 16,
    paddingVertical: 20, paddingHorizontal: 24, gap: 4,
  },
  primaryButtonTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  primaryButtonSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  secondaryButton: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingVertical: 20, paddingHorizontal: 24,
    borderWidth: 1.5, borderColor: '#FFE8CC', gap: 4,
  },
  secondaryButtonTitle: { color: '#3D2B1F', fontSize: 17, fontWeight: '700' },
  secondaryButtonSub:   { color: '#A07858', fontSize: 13 },
})
