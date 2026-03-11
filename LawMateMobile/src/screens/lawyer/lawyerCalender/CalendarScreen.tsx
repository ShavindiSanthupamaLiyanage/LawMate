import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../config/theme';
import LawyerLayout from '../../../components/LawyerLayout';
import CalendarComponent, { Appointment, AvailabilitySlot } from './CalendarComponent';
import { CalendarService } from '../../../services/calendarService';

const CalendarScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch calendar data (appointments and availability slots)
     */
    const fetchCalendarData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('Loading calendar data...');

            // Fetch both appointments and availability slots in parallel
            const [apptsData, slotsData] = await Promise.all([
                CalendarService.getAppointments(),
                CalendarService.getAvailabilitySlots(),
            ]);

            setAppointments(apptsData);
            setAvailabilitySlots(slotsData);

            console.log('Calendar data loaded successfully');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load calendar data';
            console.error('Error fetching calendar data:', errorMessage);
            setError(errorMessage);

            // Show error alert to user
            Alert.alert(
                'Failed to Load Calendar',
                errorMessage,
                [{ text: 'Retry', onPress: fetchCalendarData }, { text: 'Dismiss' }]
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Fetch data when component first mounts
     */
    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    /**
     * Refresh data when screen comes into focus
     * (in case data was updated from another screen)
     */
    useFocusEffect(
        useCallback(() => {
            fetchCalendarData();
        }, [fetchCalendarData])
    );

    return (
        <LawyerLayout
            title="Calendar"
            onNotificationPress={() => {}}
            onProfilePress={() => navigation.navigate('LawyerProfile')}
            disableScroll
        >
            <View style={styles.wrapper}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <CalendarComponent
                        onAddAppointment={() => navigation.navigate('AddAppointment')}
                        onSetAvailability={() => navigation.navigate('SetAvailability')}
                        appointments={appointments}
                        availabilitySlots={availabilitySlots}
                    />
                )}
            </View>
        </LawyerLayout>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default CalendarScreen;

