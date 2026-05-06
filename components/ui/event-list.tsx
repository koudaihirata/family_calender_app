import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { AppColors } from '@/constants/theme';
import { EventWithLabel } from '@/types/event';
import { router } from 'expo-router';

type Props = {
    selectedDate: Date;
    events: EventWithLabel[];
};

function EventCard({ event }: { event: EventWithLabel }) {
    const color = event.label?.color ?? AppColors.fallbackEventColor;
    return (
        <TouchableOpacity
            style={[styles.eventCard, { borderLeftColor: color }]}
            onPress={() => router.push({ pathname: '/event-detail', params: { id: event.id } })}
            activeOpacity={0.7}
        >
            <View style={styles.eventCardInner}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>
                    {format(event.start_at, 'HH:mm')} – {format(event.end_at, 'HH:mm')}
                </Text>
            </View>
            {event.label && (
                <View style={[styles.labelBadge, { backgroundColor: color }]}>
                    <Text style={styles.labelBadgeText}>{event.label.name}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

export function EventList({ selectedDate, events }: Props) {
    const eventsForSelectedDate = events.filter((event) =>
        isSameDay(event.start_at, selectedDate) ||
        isSameDay(event.end_at, selectedDate) ||
        (event.start_at <= selectedDate && event.end_at >= selectedDate)
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.dateText}>
                {format(selectedDate, 'M月d日(E)', { locale: ja })}
            </Text>
            {eventsForSelectedDate.length > 0 ? (
                eventsForSelectedDate.map((event) => (
                    <EventCard key={event.id} event={event} />
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    eventCardInner: {
        flex: 1,
        gap: 2,
    },
    eventTitle: {
        color: AppColors.textLight,
        fontSize: 14,
        fontWeight: '500',
    },
    eventTime: {
        color: AppColors.textSecondary,
        fontSize: 12,
    },
    labelBadge: {
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginLeft: 8,
    },
    labelBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    noEventsText: {
        color: AppColors.textSecondary,
        fontSize: 14,
    },
});
