import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../config/theme';
import LawyerLayout from '../../components/LawyerLayout';
import CalendarComponent, { Appointment, AvailabilitySlot } from '../../components/Calendar/CalendarComponent';

const CalendarScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [appointments] = useState<Appointment[]>([
        {
            id: '1',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            contactNumber: '0728527717',
            caseType: 'Criminal Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0),
            duration: 30,
            status: 'confirmed',
            mode: 'physical',
            price: 5000,
            appointmentId: 'APT-0500',
            paymentStatus: 'Verified Payment',
        },
        {
            id: '2',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            contactNumber: '0728527717',
            caseType: 'Family Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0),
            duration: 30,
            status: 'confirmed',
            mode: 'physical',
            price: 5000,
            appointmentId: 'APT-0500',
            paymentStatus: 'Verified Payment',
        },
        {
            id: '3',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            contactNumber: '0728527717',
            caseType: 'Property Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0),
            duration: 30,
            status: 'pending',
            mode: 'virtual',
            price: 5000,
            appointmentId: 'APT-0500',
            paymentStatus: 'Verified Payment',
        },
    ]);

    const [availabilitySlots] = useState<AvailabilitySlot[]>([
        { id: '1', date: new Date(2025, 11, 4), startTime: '11:30', price: 5000, duration: 30, booked: false },
        { id: '2', date: new Date(2025, 11, 4), startTime: '12:00', price: 5000, duration: 30, booked: false },
        { id: '3', date: new Date(2025, 11, 4), startTime: '12:30', price: 5000, duration: 30, booked: false },
        { id: '4', date: new Date(2025, 11, 4), startTime: '13:00', price: 5000, duration: 30, booked: false },
    ]);

    return (
        <LawyerLayout
            title="Calender"
            onNotificationPress={() => {}}
            onProfilePress={() => navigation.navigate('LawyerProfile')}
            disableScroll
        >
            <View style={styles.wrapper}>
                <CalendarComponent
                    onAddAppointment={() => navigation.navigate('AddAppointment')}
                    onSetAvailability={() => navigation.navigate('SetAvailability')}
                    appointments={appointments}
                    availabilitySlots={availabilitySlots}
                />
            </View>
        </LawyerLayout>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: colors.background,
    },
});

export default CalendarScreen;

