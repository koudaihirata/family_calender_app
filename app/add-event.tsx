import { useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { api } from '@/lib/api'
import type { Label } from '@/types/label'

export default function AddEventScreen() {
  const colorScheme = useColorScheme()
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000)
  )
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [labelId, setLabelId] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(false)
  const [labelsLoading, setLabelsLoading] = useState(true)

  useEffect(() => {
    // ラベルを取得
    api
      .getLabels()
      .then(({ labels }) => {
        setLabels(labels)
        // 最初のラベルを選択
        if (labels.length > 0) {
          setLabelId(labels[0].id)
        }
      })
      .catch((error) => {
        console.error('Failed to fetch labels:', error)
        Alert.alert('エラー', 'ラベルの取得に失敗しました')
      })
      .finally(() => setLabelsLoading(false))
  }, [])

  const handleStartDateChange = (_: any, selectedDate?: Date) => {
    setShowStartPicker(false)
    if (selectedDate) {
      setStartDate(selectedDate)
      // 終了日時も更新（開始日時から1時間後）
      if (selectedDate >= endDate) {
        setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000))
      }
    }
  }

  const handleEndDateChange = (_: any, selectedDate?: Date) => {
    setShowEndPicker(false)
    if (selectedDate) {
      if (selectedDate <= startDate) {
        Alert.alert('エラー', '終了時刻は開始時刻より後にしてください')
        return
      }
      setEndDate(selectedDate)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'イベント名を入力してください')
      return
    }

    setLoading(true)
    try {
      await api.createEvent({
        title: title.trim(),
        start_at: startDate.toISOString(),
        end_at: endDate.toISOString(),
        label_id: labelId ?? undefined,
        location_name: location.trim() || undefined,
      })

      Alert.alert('成功', 'イベントを追加しました')
      router.back()
    } catch (error) {
      console.error('Failed to create event:', error)
      Alert.alert('エラー', error instanceof Error ? error.message : 'イベントの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.back()
  }

  const textColor = Colors[colorScheme ?? 'light'].text
  const backgroundColor = Colors[colorScheme ?? 'light'].background

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>イベントを追加</ThemedText>
        </View>

        {/* イベント名 */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>イベント名 *</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tint }]}
            placeholder="例: 家族会議"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* 開始日時 */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>開始日時 *</ThemedText>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { borderColor: Colors[colorScheme ?? 'light'].tint },
            ]}
            onPress={() => setShowStartPicker(true)}
            disabled={loading}
          >
            <ThemedText>
              {startDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}{' '}
              {startDate.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate}
              mode="datetime"
              display="default"
              onChange={handleStartDateChange}
            />
          )}
        </View>

        {/* 終了日時 */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>終了日時 *</ThemedText>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { borderColor: Colors[colorScheme ?? 'light'].tint },
            ]}
            onPress={() => setShowEndPicker(true)}
            disabled={loading}
          >
            <ThemedText>
              {endDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })}{' '}
              {endDate.toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate}
              mode="datetime"
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </View>

        {/* ラベル */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>ラベル</ThemedText>
          {labelsLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
          ) : labels.length > 0 ? (
            <View
              style={[
                styles.pickerContainer,
                { borderColor: Colors[colorScheme ?? 'light'].tint },
              ]}
            >
              <Picker
                selectedValue={labelId}
                onValueChange={(itemValue) => setLabelId(itemValue)}
                enabled={!loading}
              >
                {labels.map((label) => (
                  <Picker.Item
                    key={label.id}
                    label={label.name}
                    value={label.id}
                    color={Colors[colorScheme ?? 'light'].text}
                  />
                ))}
              </Picker>
            </View>
          ) : null}
        </View>

        {/* 場所 */}
        <View style={styles.section}>
          <ThemedText style={styles.label}>場所</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: Colors[colorScheme ?? 'light'].tint }]}
            placeholder="例: 居間"
            placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
            value={location}
            onChangeText={setLocation}
            editable={!loading}
          />
        </View>

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            disabled={loading}
          >
            <ThemedText style={styles.buttonText}>キャンセル</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].tint },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
                追加
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
