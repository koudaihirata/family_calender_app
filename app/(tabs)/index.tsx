import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors } from '@/constants/theme';
import { CalendarView } from '@/components/ui/calendar-view';
import { EventList } from '@/components/ui/event-list';
import { mockEvents } from '@/data/mock-events';

export default function HomeScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <SafeAreaView style={styles.container}>
            <CalendarView
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                events={mockEvents}
            />
            <EventList
                selectedDate={selectedDate}
                events={mockEvents}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background,
    },
});
