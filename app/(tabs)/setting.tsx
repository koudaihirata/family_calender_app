import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  Modal, Share, Pressable, TextInput,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export default function SettingsScreen() {
  const { signOut, user, family, setFamily } = useAuth()

  const [familyModalVisible, setFamilyModalVisible] = useState(false)
  const [userModalVisible,   setUserModalVisible]   = useState(false)

  // 住所編集
  const [zipInput,      setZipInput]      = useState('')
  const [addressResult, setAddressResult] = useState(family?.home_address ?? '')
  const [zipLoading,    setZipLoading]    = useState(false)
  const [addressSaving, setAddressSaving] = useState(false)

  async function handleLogout() {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト', style: 'destructive',
        onPress: async () => { await signOut(); router.replace('/(auth)/login') },
      },
    ])
  }

  async function handleShareInviteCode() {
    if (!family) return
    await Share.share({
      message: `ファミリーカレンダーに参加してください！\n招待コード: ${family.invite_code}`,
    })
  }

  async function handleZipSearch() {
    const zip = zipInput.replace(/[^0-9]/g, '')
    if (zip.length !== 7) { Alert.alert('エラー', '7桁の郵便番号を入力してください（例：1000001）'); return }
    setZipLoading(true)
    try {
      const res  = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`)
      const data = await res.json() as any
      if (data.status !== 200 || !data.results) {
        Alert.alert('見つかりません', '該当する住所が見つかりませんでした')
        return
      }
      const r = data.results[0]
      setAddressResult(`${r.address1}${r.address2}${r.address3}`)
    } catch {
      Alert.alert('エラー', '住所検索に失敗しました')
    } finally {
      setZipLoading(false)
    }
  }

  async function handleSaveAddress() {
    if (!addressResult.trim()) return
    setAddressSaving(true)
    try {
      const { family: updated } = await api.updateFamily({ home_address: addressResult.trim() })
      await setFamily(updated)
      Alert.alert('保存しました')
    } catch (e: any) {
      Alert.alert('エラー', e.message)
    } finally {
      setAddressSaving(false)
    }
  }

  function openFamilyModal() {
    setZipInput('')
    setAddressResult(family?.home_address ?? '')
    setFamilyModalVisible(true)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>

      {/* 家族セクション */}
      <Text style={styles.sectionLabel}>家族</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={openFamilyModal}>
          <Text style={styles.rowText}>家族グループ情報</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.row} onPress={() => router.push('/label-settings')}>
          <Text style={styles.rowText}>ラベル設定</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* アカウントセクション */}
      <Text style={styles.sectionLabel}>アカウント</Text>
      <View style={styles.section}>
        <TouchableOpacity style={styles.row} onPress={() => setUserModalVisible(true)}>
          <Text style={styles.rowText}>アカウント情報</Text>
          <Text style={styles.rowArrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>
      </View>

      {/* ── 家族グループ情報モーダル ── */}
      <Modal visible={familyModalVisible} animationType="slide" transparent onRequestClose={() => setFamilyModalVisible(false)}>
        <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable style={styles.backdropTap} onPress={() => setFamilyModalVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheetContent}>
              <Text style={styles.sheetTitle}>家族グループ情報</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>グループ名</Text>
                <Text style={styles.infoValue}>{family?.name ?? '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>招待コード</Text>
                <Text style={styles.inviteCode}>{family?.invite_code ?? '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>自宅住所</Text>
                <Text style={styles.infoValue}>{family?.home_address || '未設定'}</Text>
              </View>

              {/* 郵便番号で住所検索 */}
              <Text style={styles.subHeading}>郵便番号から住所を設定</Text>
              <View style={styles.zipRow}>
                <TextInput
                  style={styles.zipInput}
                  placeholder="1000001"
                  placeholderTextColor="#C4A898"
                  value={zipInput}
                  onChangeText={setZipInput}
                  keyboardType="number-pad"
                  maxLength={8}
                />
                <TouchableOpacity
                  style={[styles.zipButton, zipLoading && styles.disabled]}
                  onPress={handleZipSearch}
                  disabled={zipLoading}
                >
                  {zipLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.zipButtonText}>検索</Text>
                  }
                </TouchableOpacity>
              </View>

              {addressResult ? (
                <View style={styles.addressPreview}>
                  <Text style={styles.addressPreviewLabel}>住所</Text>
                  <Text style={styles.addressPreviewValue}>{addressResult}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.primaryButton, (!addressResult || addressSaving) && styles.disabled]}
                onPress={handleSaveAddress}
                disabled={!addressResult || addressSaving}
              >
                {addressSaving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryButtonText}>住所を保存する</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} onPress={handleShareInviteCode}>
                <Text style={styles.shareButtonText}>招待コードを共有する</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeButton} onPress={() => setFamilyModalVisible(false)}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── アカウント情報モーダル ── */}
      <Modal visible={userModalVisible} animationType="slide" transparent onRequestClose={() => setUserModalVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setUserModalVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>アカウント情報</Text>

              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>名前</Text>
                <Text style={styles.infoValue}>{user?.name ?? '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>メールアドレス</Text>
                <Text style={styles.infoValue}>{user?.email ?? '—'}</Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={() => setUserModalVisible(false)}>
                <Text style={styles.closeButtonText}>閉じる</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFF8F2' },
  title: {
    fontSize: 28, fontWeight: '700', color: '#3D2B1F',
    paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: '#A07858',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6, letterSpacing: 0.5,
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
  // モーダル共通
  backdrop:    { flex: 1, justifyContent: 'flex-end' },
  backdropTap: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#FFF8F2', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 16, maxHeight: '90%',
  },
  sheetContent:  { gap: 12, paddingBottom: 48 },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#C4A898',
    borderRadius: 2, alignSelf: 'center', marginBottom: 12,
  },
  sheetTitle:  { fontSize: 18, fontWeight: '700', color: '#3D2B1F', marginBottom: 4 },
  infoRow: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#FFE8CC',
    paddingVertical: 12, paddingHorizontal: 16, gap: 2,
  },
  infoLabel:   { fontSize: 11, color: '#A07858', fontWeight: '600' },
  infoValue:   { fontSize: 15, color: '#3D2B1F', fontWeight: '500' },
  inviteCode:  { fontSize: 26, fontWeight: '800', color: '#F07828', letterSpacing: 6 },
  subHeading:  { fontSize: 13, fontWeight: '600', color: '#A07858', marginTop: 4 },
  zipRow:      { flexDirection: 'row', gap: 8 },
  zipInput: {
    flex: 1, borderWidth: 1, borderColor: '#FFE8CC', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 16, backgroundColor: '#fff', color: '#3D2B1F',
  },
  zipButton: {
    backgroundColor: '#C4956A', borderRadius: 10,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  zipButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addressPreview: {
    backgroundColor: '#FFE8CC', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, gap: 2,
  },
  addressPreviewLabel: { fontSize: 11, color: '#A07858', fontWeight: '600' },
  addressPreviewValue: { fontSize: 15, color: '#3D2B1F', fontWeight: '500' },
  primaryButton: {
    backgroundColor: '#F07828', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  shareButton: {
    borderWidth: 1, borderColor: '#F07828', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  shareButtonText: { color: '#F07828', fontSize: 15, fontWeight: '600' },
  closeButton: {
    borderWidth: 1, borderColor: '#FFE8CC', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  closeButtonText: { color: '#A07858', fontSize: 15 },
  disabled:  { opacity: 0.5 },
  // アカウント情報
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFE8CC', alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', marginVertical: 8,
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#F07828' },
})
