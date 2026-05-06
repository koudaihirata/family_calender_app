import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Alert, ActivityIndicator, Modal, Pressable,
  KeyboardAvoidingView, ScrollView, Platform,
} from 'react-native'
import { router } from 'expo-router'
import { api } from '@/lib/api'
import type { Label } from '@/types/label'

const PRESET_COLORS = [
  '#F07828', '#E53935', '#8E24AA', '#3949AB',
  '#039BE5', '#00897B', '#43A047', '#F9A825',
  '#FB8C00', '#6D4C41', '#757575', '#546E7A',
]

export default function LabelSettingsScreen() {
  const [labels, setLabels]         = useState<Label[]>([])
  const [loading, setLoading]       = useState(true)
  const [addVisible, setAddVisible] = useState(false)
  const [newName, setNewName]       = useState('')
  const [newColor, setNewColor]     = useState(PRESET_COLORS[0])
  const [saving, setSaving]         = useState(false)

  useEffect(() => { loadLabels() }, [])

  async function loadLabels() {
    try {
      const { labels } = await api.getLabels()
      setLabels(labels)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!newName.trim()) {
      Alert.alert('エラー', 'ラベル名を入力してください')
      return
    }
    setSaving(true)
    try {
      const { label } = await api.createLabel({ name: newName.trim(), color: newColor })
      setLabels(prev => [...prev, label])
      setNewName('')
      setNewColor(PRESET_COLORS[0])
      setAddVisible(false)
    } catch (e: any) {
      Alert.alert('エラー', e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(label: Label) {
    Alert.alert(`「${label.name}」を削除`, 'このラベルを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteLabel(label.id)
            setLabels(prev => prev.filter(l => l.id !== label.id))
          } catch (e: any) {
            Alert.alert('エラー', e.message)
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>閉じる</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ラベル設定</Text>
        <TouchableOpacity onPress={() => setAddVisible(true)}>
          <Text style={styles.addText}>追加</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#F07828" />
      ) : (
        <FlatList
          data={labels}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.labelRow}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={styles.labelName}>{item.name}</Text>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>削除</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>ラベルがありません{'\n'}「追加」から作成してください</Text>
          }
        />
      )}

      {/* 新規追加モーダル */}
      <Modal visible={addVisible} animationType="slide" transparent onRequestClose={() => setAddVisible(false)}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.backdropTap} onPress={() => setAddVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}
            >
              <Text style={styles.sheetTitle}>ラベルを追加</Text>

              <TextInput
                style={styles.input}
                placeholder="ラベル名（例：学校、医療）"
                placeholderTextColor="#C4A898"
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />

              <Text style={styles.colorLabel}>カラー</Text>
              <View style={styles.colorGrid}>
                {PRESET_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setNewColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      newColor === color && styles.colorCircleSelected,
                    ]}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabled]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.saveButtonText}>追加する</Text>
                }
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#FFE8CC',
  },
  backText:  { color: '#A07858', fontSize: 16 },
  title:     { fontSize: 17, fontWeight: '700', color: '#3D2B1F' },
  addText:   { color: '#F07828', fontSize: 16, fontWeight: '600' },
  list:      { padding: 20, gap: 10 },
  labelRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#FFE8CC', gap: 12,
  },
  colorDot:   { width: 24, height: 24, borderRadius: 12 },
  labelName:  { flex: 1, fontSize: 16, color: '#3D2B1F', fontWeight: '500' },
  deleteBtn:  { paddingHorizontal: 8 },
  deleteText: { color: '#e53935', fontSize: 14 },
  empty:      { textAlign: 'center', color: '#A07858', lineHeight: 24, marginTop: 60 },
  // モーダル
  backdrop:    { flex: 1, justifyContent: 'flex-end' },
  backdropTap: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#FFF8F2', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 16, maxHeight: '85%',
  },
  sheetContent: { gap: 14, paddingBottom: 48 },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: '#C4A898',
    borderRadius: 2, alignSelf: 'center', marginBottom: 8,
  },
  sheetTitle:  { fontSize: 18, fontWeight: '700', color: '#3D2B1F' },
  input: {
    borderWidth: 1, borderColor: '#FFE8CC', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 16, backgroundColor: '#fff', color: '#3D2B1F',
  },
  colorLabel: { fontSize: 13, fontWeight: '600', color: '#A07858' },
  colorGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorCircle: { width: 36, height: 36, borderRadius: 18 },
  colorCircleSelected: { borderWidth: 3, borderColor: '#3D2B1F' },
  saveButton: {
    backgroundColor: '#F07828', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled:       { opacity: 0.6 },
})
