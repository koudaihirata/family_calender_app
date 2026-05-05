import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Modal, Share, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'

export default function SettingsScreen() {
  const { signOut, family } = useAuth()
  const [familyModalVisible, setFamilyModalVisible] = useState(false)

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

  async function handleShareInviteCode() {
    if (!family) return
    await Share.share({
      // 共有するメッセージ
      message: `ファミリーカレンダーに参加してください！\n招待コード: ${family.invite_code}`,
    })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={() => setFamilyModalVisible(true)}>
          <Text style={styles.rowText}>家族グループ情報</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* 家族情報モーダル */}
      <Modal
        visible={familyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFamilyModalVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setFamilyModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>家族グループ情報</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>グループ名</Text>
              <Text style={styles.infoValue}>{family?.name ?? '—'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>招待コード</Text>
              <Text style={styles.inviteCode}>{family?.invite_code ?? '—'}</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShareInviteCode}>
              <Text style={styles.shareButtonText}>招待コードを共有する</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setFamilyModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  title: {
    fontSize: 28, fontWeight: '700', color: '#3D2B1F',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 24,
  },
  section: {
    marginHorizontal: 20, backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#FFE8CC', overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 20,
  },
  rowText:    { fontSize: 16, color: '#3D2B1F' },
  rowArrow:   { fontSize: 20, color: '#C4A898' },
  separator:  { height: 1, backgroundColor: '#FFE8CC', marginHorizontal: 20 },
  logoutText: { fontSize: 16, color: '#e53935', fontWeight: '500' },
  // モーダル
  backdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF8F2', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 28, paddingBottom: 48, paddingTop: 16, gap: 16,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#C4A898',
    borderRadius: 2, alignSelf: 'center', marginBottom: 8,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: '#3D2B1F' },
  infoRow: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#FFE8CC',
    paddingVertical: 14, paddingHorizontal: 18, gap: 4,
  },
  infoLabel:  { fontSize: 12, color: '#A07858', fontWeight: '600' },
  infoValue:  { fontSize: 16, color: '#3D2B1F', fontWeight: '500' },
  inviteCode: { fontSize: 28, fontWeight: '800', color: '#F07828', letterSpacing: 8 },
  shareButton: {
    backgroundColor: '#F07828', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  shareButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  closeButton: {
    borderWidth: 1, borderColor: '#FFE8CC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  closeButtonText: { color: '#A07858', fontSize: 16 },
})
