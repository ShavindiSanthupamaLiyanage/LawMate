import React, { useState } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../config/theme';
import CalendarComponent, { Appointment } from '../../components/Calendar/CalendarComponent';

const CalendarScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [appointments] = useState<Appointment[]>([
        {
            id: '1',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            caseType: 'Criminal Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0), // May 18, 2025, 11:00 AM
            duration: 30,
            status: 'confirmed',
            mode: 'physical',
            price: 5000,
            notes: 'Important case discussion',
        },
        {
            id: '2',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            caseType: 'Family Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0),
            duration: 30,
            status: 'confirmed',
            mode: 'physical',
            price: 5000,
            notes: '',
        },
        {
            id: '3',
            clientName: 'John Silva',
            email: 'john.silva@email.com',
            caseType: 'Property Law',
            dateTime: new Date(2025, 4, 18, 11, 0, 0),
            duration: 30,
            status: 'pending',
            mode: 'virtual',
            price: 5000,
            notes: '',
        },
    ]);

    const handleAddAppointment = () => {
        navigation.navigate('AddAppointment');
    };

    const handleSetAvailability = () => {
        navigation.navigate('SetAvailability');
    };

    const handleSelectDate = () => {
        // You can implement additional logic here if needed
    };

    return (
        <View style={styles.container}>
            <CalendarComponent
                onAddAppointment={handleAddAppointment}
                onSetAvailability={handleSetAvailability}
                onSelectDate={handleSelectDate}
                appointments={appointments}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});

export default CalendarScreen;
