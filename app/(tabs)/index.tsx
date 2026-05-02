import { CalendarView } from '@/components/ui/calendar-view'
import { EventList } from '@/components/ui/event-list'
import { AppColors } from '@/constants/theme'
import { mockEvents } from '@/data/mock-events'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { isSameDay } from 'date-fns'
import React, { useMemo, useRef, useState } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HANDLE_HEIGHT = 24

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const bottomSheetRef = useRef<BottomSheet>(null)
    const { height } = useWindowDimensions()

    const snapPoints = useMemo(
        () => [HANDLE_HEIGHT, height * 0.5, height * 0.88],
        [height],
    )

    const handleSelectDate = (date: Date) => {
        if (isSameDay(date, selectedDate)) {
            bottomSheetRef.current?.snapToIndex(1)
        } else {
            setSelectedDate(date)
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <CalendarView
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                events={mockEvents}
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
                        events={mockEvents}
                    />
                </BottomSheetScrollView>
            </BottomSheet>
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
})
