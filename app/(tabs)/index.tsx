import { CalendarView } from '@/components/ui/calendar-view'
import { EventList } from '@/components/ui/event-list'
import { AppColors } from '@/constants/theme'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { isSameDay } from 'date-fns'
import { router, useFocusEffect } from 'expo-router'
import React, { useMemo, useRef, useState, useCallback } from 'react'
import {
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { EventWithLabel } from '@/types/event'

const HANDLE_HEIGHT = 24

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [events, setEvents] = useState<EventWithLabel[]>([])
    const [loading, setLoading] = useState(false)
    const bottomSheetRef = useRef<BottomSheet>(null)
    const { height } = useWindowDimensions()

    const snapPoints = useMemo(
        () => [HANDLE_HEIGHT, height * 0.5, height * 0.88],
        [height],
    )

    const loadEvents = useCallback(async () => {
        setLoading(true)
        try {
            const { events: fetchedEvents } = await api.getEvents(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1
            )
            setEvents(fetchedEvents)
        } catch (error) {
            console.error('Failed to fetch events:', error)
            Alert.alert('エラー', 'イベントの読み込みに失敗しました')
        } finally {
            setLoading(false)
        }
    }, [selectedDate])

    useFocusEffect(
        useCallback(() => {
            loadEvents()
        }, [loadEvents])
    )

    const handleSelectDate = (date: Date) => {
        if (isSameDay(date, selectedDate)) {
            bottomSheetRef.current?.snapToIndex(1)
        } else {
            setSelectedDate(date)
        }
    }

    const handleAddEvent = () => {
        router.push('/add-event')
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator
                        size="large"
                        color={AppColors.primary}
                    />
                </View>
            )}
            <CalendarView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                events={events}
            />

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.sheetHandle}
            >
                <BottomSheetScrollView
                    contentContainerStyle={styles.sheetContent}
                >
                    <EventList
                        selectedDate={selectedDate}
                        events={events}
                    />
                </BottomSheetScrollView>
            </BottomSheet>

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: AppColors.primary }]}
                onPress={handleAddEvent}
            >
                <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
    sheetBackground: {
        backgroundColor: AppColors.cardBackground,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    sheetHandle: {
        backgroundColor: AppColors.textMuted,
        width: 40,
    },
    sheetContent: {
        paddingBottom: 32,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
})
