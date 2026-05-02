import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AppColors } from '@/constants/theme';
import { EventWithLabel } from '@/types/event';

type Props = {
    selectedDate: Date;
    events: EventWithLabel[];
};

function EventCard({ title, color }: { title: string; color: string }) {
    return (
        <View style={[styles.eventCard, { borderLeftColor: color }]}>
            <Text style={styles.eventTitle}>{title}</Text>
        </View>
    );
}

export function EventList({ selectedDate, events }: Props) {
    const eventsForSelectedDate = events.filter((event) =>
        isSameDay(event.start_at, selectedDate)
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.dateText}>
                {format(selectedDate, 'M月d日', { locale: ja })}
            </Text>
            {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                    <EventCard
                        key={event.id}
                        title={event.title}
                        color={event.label?.color ?? AppColors.fallbackEventColor}
                    />
                ))
            ) : (
                <Text style={styles.noEventsText}>予定はありません</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    dateText: {
        color: AppColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    eventCard: {
        backgroundColor: AppColors.cardBackground,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 3,
    },
    eventTitle: {
        color: AppColors.textLight,
        fontSize: 14,
    },
    noEventsText: {
        color: AppColors.textSecondary,
        fontSize: 14,
    },
});
