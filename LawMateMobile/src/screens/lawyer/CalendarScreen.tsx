import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../config/theme';
import LawyerLayout from '../../components/LawyerLayout';
import CalendarComponent, { Appointment, AvailabilitySlot } from '../../components/Calendar/CalendarComponent';

const CalendarScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: get api - fetch appointments
    const [appointments, _setAppointments] = useState<Appointment[]>([
        {
            id: '1',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            contactNumber: '0728527717',
            caseType: 'Criminal Law',
            dateTime: new Date(2026, 2, 7, 11, 0, 0),
            duration: 30,
            status: 'confirmed',
            mode: 'physical',
            price: 5000,
            appointmentId: 'APT-0001',
            paymentStatus: 'Verified Payment',
        },
        {
            id: '2',
            clientName: 'Amara Perera',
            email: 'amara.p@email.com',
            contactNumber: '0711234567',
            caseType: 'Family Law',
            dateTime: new Date(2026, 2, 12, 14, 0, 0),
            duration: 45,
            status: 'pending',
            mode: 'virtual',
            price: 7500,
            appointmentId: 'APT-0002',
            paymentStatus: 'Pending',
        },
        {
            id: '3',
            clientName: 'Kamal Fernando',
            email: 'kamal.f@email.com',
            contactNumber: '0779876543',
            caseType: 'Property Law',
            dateTime: new Date(2026, 2, 20, 9, 30, 0),
            duration: 60,
            status: 'confirmed',
            mode: 'physical',
            price: 10000,
            appointmentId: 'APT-0003',
            paymentStatus: 'Verified Payment',
            notes: 'Land dispute - bring title deeds',
        },
    ]);

    // TODO: get api - fetch availability slots
    const [availabilitySlots, _setAvailabilitySlots] = useState<AvailabilitySlot[]>([
        { id: '1', date: new Date(2026, 2, 10), startTime: '10:00', price: 5000, duration: 30, booked: false },
        { id: '2', date: new Date(2026, 2, 10), startTime: '10:30', price: 5000, duration: 30, booked: false },
        { id: '3', date: new Date(2026, 2, 15), startTime: '14:00', price: 7500, duration: 45, booked: false },
        { id: '4', date: new Date(2026, 2, 15), startTime: '14:45', price: 7500, duration: 45, booked: true },
    ]);

    return (
        <LawyerLayout
            title="Calendar"
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

