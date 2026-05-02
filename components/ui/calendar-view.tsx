import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    isSameDay,
    isToday,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import { AppColors } from '@/constants/theme';
import { EventWithLabel } from '@/types/event';

const DAY_SIZE = (Dimensions.get('window').width - 32) / 7;

type Props = {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    events: EventWithLabel[];
};

export function CalendarView({ selectedDate, onSelectDate, events }: Props) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOfWeek = getDay(monthStart);
    const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

    const daysWithEvents = new Set(
        events.map((event) => format(event.start_at, 'yyyy-MM-dd'))
    );

    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.monthText}>
                    {format(currentDate, 'yyyy年M月', { locale: ja })}
                </Text>
                <View style={styles.navButtons}>
                    <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
                        <Ionicons name="chevron-back" size={20} color={AppColors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                        <Ionicons name="chevron-forward" size={20} color={AppColors.textPrimary} />
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
                    const dayString = format(day, 'yyyy-MM-dd');
                    const hasEvent = daysWithEvents.has(dayString);
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);

                    return (
                        <TouchableOpacity
                            key={dayString}
                            onPress={() => onSelectDate(day)}
                            style={[styles.dayCell, isSelected && styles.selectedDay]}
                        >
                            <View style={isTodayDate ? styles.todayCircle : undefined}>
                                <Text
                                    style={[
                                        styles.dayText,
                                        isTodayDate && styles.todayText,
                                        isSelected && !isTodayDate && styles.selectedDayText,
                                    ]}
                                >
                                    {format(day, 'd')}
                                </Text>
                            </View>
                            {hasEvent && <View style={styles.eventDot} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
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
        marginBottom: 8,
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
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        gap: 2,
    },
    selectedDay: {
        backgroundColor: AppColors.primaryMuted,
    },
    todayCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: AppColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
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
    eventDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: AppColors.primary,
    },
});
