import { useEffect, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { router, useLocalSearchParams } from 'expo-router'
import { api } from '@/lib/api'
import type { Label } from '@/types/label'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

type PickerTarget = 'startDate' | 'startTime' | 'endDate' | 'endTime' | null

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [title,        setTitle]        = useState('')
  const [startAt,      setStartAt]      = useState(new Date())
  const [endAt,        setEndAt]        = useState(new Date())
  const [locationName, setLocationName] = useState('')
  const [labels,       setLabels]       = useState<Label[]>([])
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null)
  const [pickerTarget, setPickerTarget]   = useState<PickerTarget>(null)

  useEffect(() => {
    Promise.all([api.getEvent(id), api.getLabels()])
      .then(([{ event }, { labels }]) => {
        setTitle(event.title)
        setStartAt(new Date(event.start_at))
        setEndAt(new Date(event.end_at))
        setLocationName(event.location_name ?? '')
        setLabels(labels)
        if (event.label_id) {
          setSelectedLabel(labels.find((l: Label) => l.id === event.label_id) ?? null)
        }
      })
      .catch(() => Alert.alert('エラー', '取得に失敗しました'))
      .finally(() => setLoading(false))
  }, [id])

  function openPicker(target: PickerTarget) {
    setPickerTarget(prev => prev === target ? null : target)
  }

  function handlePickerChange(_: any, date?: Date) {
    if (!date) { setPickerTarget(null); return }
    if (pickerTarget === 'startDate') {
      const next = new Date(startAt); next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()); setStartAt(next)
    } else if (pickerTarget === 'startTime') {
      const next = new Date(startAt); next.setHours(date.getHours(), date.getMinutes()); setStartAt(next)
    } else if (pickerTarget === 'endDate') {
      const next = new Date(endAt); next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()); setEndAt(next)
    } else if (pickerTarget === 'endTime') {
      const next = new Date(endAt); next.setHours(date.getHours(), date.getMinutes()); setEndAt(next)
    }
    if (Platform.OS === 'android') setPickerTarget(null)
  }

  async function handleSave() {
    if (!title.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return }
    if (endAt <= startAt) { Alert.alert('エラー', '終了日時は開始日時より後にしてください'); return }
    setSaving(true)
    try {
      await api.updateEvent(id, {
        title:         title.trim(),
        start_at:      startAt.toISOString(),
        end_at:        endAt.toISOString(),
        label_id:      selectedLabel?.id ?? null,
        location_name: locationName.trim() || null,
      })
      router.back()
    } catch (e: any) {
      Alert.alert('エラー', e.message)
    } finally {
      setSaving(false)
    }
  }

  const pickerValue = (pickerTarget === 'startDate' || pickerTarget === 'startTime') ? startAt : endAt
  const pickerMode  = (pickerTarget === 'startDate' || pickerTarget === 'endDate') ? 'date' : 'time'

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F07828" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>閉じる</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? '編集' : 'イベント詳細'}</Text>
        {isEditing ? (
          <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveBtn, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>保存</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.editText}>編集</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* タイトル */}
        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        ) : (
          <Text style={styles.titleText}>{title}</Text>
        )}

        {/* 日時 */}
        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>開始</Text>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => openPicker('startDate')}>
                  <Text style={[styles.dateValue, pickerTarget === 'startDate' && styles.dateValueActive]}>
                    {format(startAt, 'M月d日(E)', { locale: ja })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openPicker('startTime')}>
                  <Text style={[styles.dateValue, pickerTarget === 'startTime' && styles.dateValueActive]}>
                    {format(startAt, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.dateValueReadonly}>
                {format(startAt, 'M月d日(E) HH:mm', { locale: ja })}
              </Text>
            )}
          </View>

          {isEditing && (pickerTarget === 'startDate' || pickerTarget === 'startTime') && (
            <DateTimePicker value={pickerValue} mode={pickerMode} display="spinner" onChange={handlePickerChange} locale="ja" />
          )}

          <View style={styles.cardSep} />

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>終了</Text>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={() => openPicker('endDate')}>
                  <Text style={[styles.dateValue, pickerTarget === 'endDate' && styles.dateValueActive]}>
                    {format(endAt, 'M月d日(E)', { locale: ja })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openPicker('endTime')}>
                  <Text style={[styles.dateValue, pickerTarget === 'endTime' && styles.dateValueActive]}>
                    {format(endAt, 'HH:mm')}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.dateValueReadonly}>
                {format(endAt, 'M月d日(E) HH:mm', { locale: ja })}
              </Text>
            )}
          </View>

          {isEditing && (pickerTarget === 'endDate' || pickerTarget === 'endTime') && (
            <DateTimePicker value={pickerValue} mode={pickerMode} display="spinner" onChange={handlePickerChange} locale="ja" />
          )}
        </View>

        {/* ラベル */}
        {(isEditing ? labels.length > 0 : selectedLabel) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ラベル</Text>
            {isEditing ? (
              <View style={styles.labelGrid}>
                {labels.map(label => (
                  <TouchableOpacity
                    key={label.id}
                    style={[styles.labelChip, { borderColor: label.color }, selectedLabel?.id === label.id && { backgroundColor: label.color }]}
                    onPress={() => setSelectedLabel(prev => prev?.id === label.id ? null : label)}
                  >
                    <View style={[styles.labelDot, { backgroundColor: label.color }, selectedLabel?.id === label.id && { backgroundColor: '#fff' }]} />
                    <Text style={[styles.labelChipText, selectedLabel?.id === label.id && { color: '#fff' }]}>{label.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              selectedLabel && (
                <View style={[styles.labelChip, { borderColor: selectedLabel.color, backgroundColor: selectedLabel.color, alignSelf: 'flex-start' }]}>
                  <View style={[styles.labelDot, { backgroundColor: '#fff' }]} />
                  <Text style={[styles.labelChipText, { color: '#fff' }]}>{selectedLabel.name}</Text>
                </View>
              )
            )}
          </View>
        )}

        {/* 場所 */}
        {(isEditing || locationName) ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>場所</Text>
            {isEditing ? (
              <TextInput
                style={styles.locationInput}
                placeholder="場所（任意）"
                placeholderTextColor="#C4A898"
                value={locationName}
                onChangeText={setLocationName}
              />
            ) : (
              <Text style={styles.locationText}>{locationName}</Text>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#FFF8F2', alignItems: 'center', justifyContent: 'center' },
  container:   { flex: 1, backgroundColor: '#FFF8F2' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#FFE8CC',
  },
  cancelText:  { color: '#A07858', fontSize: 16, minWidth: 60 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#3D2B1F' },
  editText:    { color: '#F07828', fontSize: 16, fontWeight: '600', minWidth: 60, textAlign: 'right' },
  saveBtn: {
    backgroundColor: '#F07828', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 14, minWidth: 60, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  disabled:    { opacity: 0.6 },
  form:        { padding: 16, gap: 12 },
  titleText:   { fontSize: 24, fontWeight: '700', color: '#3D2B1F', paddingVertical: 8 },
  titleInput: {
    fontSize: 22, fontWeight: '600', color: '#3D2B1F',
    borderBottomWidth: 1, borderBottomColor: '#FFE8CC', paddingVertical: 10,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#FFE8CC', padding: 16, gap: 8,
  },
  cardTitle:        { fontSize: 13, fontWeight: '600', color: '#A07858' },
  cardSep:          { height: 1, backgroundColor: '#FFE8CC' },
  dateRow:          { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateLabel:        { fontSize: 14, color: '#A07858', width: 32 },
  dateValue: {
    fontSize: 15, color: '#3D2B1F', fontWeight: '500',
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: 6, backgroundColor: '#FFF8F2',
  },
  dateValueActive:   { backgroundColor: '#FFE8CC', color: '#F07828' },
  dateValueReadonly: { fontSize: 15, color: '#3D2B1F', fontWeight: '500' },
  labelGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  labelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12,
  },
  labelDot:      { width: 8, height: 8, borderRadius: 4 },
  labelChipText: { fontSize: 14, color: '#3D2B1F', fontWeight: '500' },
  locationInput: { fontSize: 15, color: '#3D2B1F', paddingVertical: 2 },
  locationText:  { fontSize: 15, color: '#3D2B1F' },
})
