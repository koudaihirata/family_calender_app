import { AppColors } from '@/constants/theme'
import { getHolidaysForYear } from '@/data/holidays'
import { EventWithLabel } from '@/types/event'
import { Ionicons } from '@expo/vector-icons'
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    getDay,
    isSameDay,
    isToday,
    startOfMonth,
} from 'date-fns'
import { ja } from 'date-fns/locale'
import React, { useState } from 'react'
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const DAY_SIZE = Math.floor((Dimensions.get('window').width - 32) / 7)
export const CELL_HEIGHT = DAY_SIZE + 40
const EVENT_BAR_HEIGHT = 14

type Props = {
    selectedDate: Date
    onSelectDate: (date: Date) => void
    events: EventWithLabel[]
}

export function CalendarView({ selectedDate, onSelectDate, events }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const firstDayOfWeek = getDay(monthStart)
    const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i)

    const eventsByDate = new Map<string, EventWithLabel[]>()
    events.forEach((event) => {
        const key = format(event.start_at, 'yyyy-MM-dd')
        if (!eventsByDate.has(key)) eventsByDate.set(key, [])
        eventsByDate.get(key)!.push(event)
    })

    const holidays = getHolidaysForYear(currentDate.getFullYear())

    const weekDays = ['日', '月', '火', '水', '木', '金', '土']

    const goToPreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        )
    }

    const goToNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    {format(currentDate, 'yyyy年M月', { locale: ja })}
                </Text>
                <View style={styles.navButtons}>
                    <TouchableOpacity
                        onPress={goToPreviousMonth}
                        style={styles.navButton}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={20}
                            color={AppColors.textPrimary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={styles.navButton}
                    >
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={AppColors.textPrimary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.weekDaysRow}>
                {weekDays.map((day) => (
                    <View key={day} style={styles.weekDayCell}>
                        <Text style={styles.weekDayText}>{day}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.daysGrid}>
                {paddingDays.map((i) => (
                    <View key={`padding-${i}`} style={styles.dayCell} />
                ))}
                {days.map((day) => {
                    const dayString = format(day, 'yyyy-MM-dd')
                    const holidayName = holidays.get(dayString)
                    const dayEvents = eventsByDate.get(dayString) ?? []
                    const displayEvents = dayEvents.slice(0, holidayName ? 2 : 3)
                    const isSelected = isSameDay(day, selectedDate)
                    const isTodayDate = isToday(day)

                    return (
                        <TouchableOpacity
                            key={dayString}
                            onPress={() => onSelectDate(day)}
                            style={[
                                styles.dayCell,
                                isSelected && styles.selectedDay,
                            ]}
                        >
                            <View style={styles.dayNumberRow}>
                                <View
                                    style={[
                                        styles.dayCircle,
                                        isTodayDate
                                            ? styles.todayCircle
                                            : undefined,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isTodayDate && styles.todayText,
                                            isSelected &&
                                                !isTodayDate &&
                                                styles.selectedDayText,
                                        ]}
                                    >
                                        {format(day, 'd')}
                                    </Text>
                                </View>
                            </View>

                            {holidayName && (
                                <View style={[styles.eventBar, { backgroundColor: AppColors.primary }]}>
                                    <Text style={styles.eventBarText} numberOfLines={1}>
                                        {holidayName}
                                    </Text>
                                </View>
                            )}

                            {displayEvents.map((event) => (
                                <View
                                    key={event.id}
                                    style={[
                                        styles.eventBar,
                                        {
                                            backgroundColor:
                                                event.label?.color ??
                                                AppColors.fallbackEventColor,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={styles.eventBarText}
                                        numberOfLines={1}
                                    >
                                        {event.title}
                                    </Text>
                                </View>
                            ))}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    monthText: {
        color: AppColors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
    },
    navButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    navButton: {
        padding: 8,
        borderRadius: 8,
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    weekDayCell: {
        width: DAY_SIZE,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDayText: {
        color: AppColors.textSecondary,
        fontSize: 13,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: DAY_SIZE,
        height: CELL_HEIGHT,
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 8,
        paddingTop: 4,
        paddingHorizontal: 2,
        overflow: 'hidden',
    },
    selectedDay: {
        backgroundColor: AppColors.primaryMuted,
    },
    dayNumberRow: {
        alignItems: 'center',
        marginBottom: 3,
    },
    dayCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayCircle: {
        backgroundColor: AppColors.primary,
    },
    dayText: {
        color: AppColors.textSecondary,
        fontSize: 13,
    },
    todayText: {
        color: AppColors.textPrimary,
        fontSize: 13,
    },
    selectedDayText: {
        color: AppColors.textPrimary,
    },
    eventBar: {
        width: '100%',
        height: EVENT_BAR_HEIGHT,
        borderRadius: 3,
        paddingHorizontal: 3,
        marginBottom: 2,
        justifyContent: 'center',
    },
    eventBarText: {
        fontSize: 9,
        color: '#fff',
        fontWeight: '500',
    },
})
