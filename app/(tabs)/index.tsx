import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors } from '@/constants/theme';
import { CalendarView } from '@/components/ui/calendar-view';
import { EventList } from '@/components/ui/event-list';
import { mockEvents } from '@/data/mock-events';

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <View style={styles.container}>
            <CalendarView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={mockEvents}
            />
            <EventList
                selectedDate={selectedDate}
                events={mockEvents}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
});
