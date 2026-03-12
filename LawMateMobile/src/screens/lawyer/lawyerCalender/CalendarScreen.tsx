import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../config/theme';
import LawyerLayout from '../../../components/LawyerLayout';
import CalendarComponent, { Appointment, AvailabilitySlot } from './CalendarComponent';
import { getLawyerAppointments, getLawyerAvailabilitySlots } from '../../../services/calendarService';
import { AppointmentDto, AvailabilitySlotDto } from '../../../interfaces/calendar.interface';
import { StorageService } from '../../../utils/storage';

const CalendarScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [lawyerId, setLawyerId] = useState<string | null>(null);

  
    useEffect(() => {
        const fetchLawyerId = async () => {
            try {
                const userData = await StorageService.getUserData();
                if (userData?.userId) {
                    setLawyerId(userData.userId);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchLawyerId();
    }, []);

 
    useFocusEffect(
        React.useCallback(() => {
            if (lawyerId) {
                fetchCalendarData();
            }
        }, [lawyerId])
    );

    const fetchCalendarData = async () => {
        if (!lawyerId) return;

        try {
            setLoading(true);

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const [appointmentsData, slotsData] = await Promise.all([
                getLawyerAppointments(lawyerId, startOfMonth, endOfMonth),
                getLawyerAvailabilitySlots(lawyerId, startOfMonth, endOfMonth),
            ]);

            const mappedAppointments = appointmentsData.map(mapAppointmentDtoToFrontend);
            const mappedSlots = slotsData.map(mapSlotDtoToFrontend);

            setAppointments(mappedAppointments);
            setAvailabilitySlots(mappedSlots);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
     
        } finally {
            setLoading(false);
        }
    };

  
    const mapAppointmentDtoToFrontend = (dto: AppointmentDto): Appointment => {
    
        const statusMap: Record<string, 'pending' | 'confirmed' | 'completed'> = {
            'Pending': 'pending',
            'Accepted': 'confirmed',
            'Verified': 'completed',
            'Rejected': 'pending',
            'Suspended': 'pending',
        };

        return {
            id: dto.bookingId.toString(),
            clientName: dto.clientName,
            email: dto.email,
            contactNumber: dto.contactNumber,
            caseType: dto.caseType,
            dateTime: new Date(dto.dateTime),
            duration: dto.duration,
            status: statusMap[dto.status] || 'pending',
            mode: dto.mode.toLowerCase() as 'physical' | 'virtual',
            price: dto.price,
            notes: dto.notes,
            appointmentId: dto.appointmentId,
            paymentStatus: dto.paymentStatusDisplay,
        };
    };


    const mapSlotDtoToFrontend = (dto: AvailabilitySlotDto): AvailabilitySlot => ({
        id: dto.id,
        date: new Date(dto.date),
        startTime: dto.startTime,
        price: dto.price,
        duration: dto.duration,
        booked: dto.booked,
    });

    if (loading) {
        return (
            <LawyerLayout
                title="Calendar"
                onNotificationPress={() => {}}
                onProfilePress={() => navigation.navigate('LawyerProfile')}
                disableScroll
            >
                <View style={[styles.wrapper, styles.centered]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </LawyerLayout>
        );
    }
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CalendarScreen;

