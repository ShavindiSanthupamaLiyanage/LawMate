import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../config/theme';

export interface Appointment {
    id: string;
    clientName: string;
    email: string;
    caseType: string;
    dateTime: Date;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed';
    mode: 'physical' | 'virtual';
    price: number;
    notes?: string;
}

interface CalendarComponentProps {
    onAddAppointment: () => void;
    onSetAvailability: () => void;
    onSelectDate?: (date: Date) => void;
    appointments?: Appointment[];
}

const CalendarComponent: React.FC<CalendarComponentProps> = ({
    onAddAppointment,
    onSetAvailability,
    onSelectDate,
    appointments = [],
}) => {
    // TODO: get api - fetch appointments
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);

    // Helper functions
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getMonthName = (date: Date) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[date.getMonth()];
    };

    const isDateBookable = (day: number) => {
        const testDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Not bookable if today or in past
        if (testDate < today) {
            return false;
        }

        // Not bookable if today or next two days
        const twoDaysFromNow = new Date(today);
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

        if (testDate <= twoDaysFromNow) {
            return false;
        }

        // Bookable if within 3 months
        const threeMonthsFromNow = new Date(today);
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        return testDate <= threeMonthsFromNow;
    };

    const getAppointmentsForDate = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return appointments.filter(apt => {
            const aptDate = new Date(apt.dateTime);
            const aptDateStr = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
            return aptDateStr === dateStr;
        });
    };

    const handlePreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day: number) => {
        if (isDateBookable(day)) {
            const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setSelectedDate(newDate);
            const dateAppointments = getAppointmentsForDate(day);
            if (dateAppointments.length > 0) {
                setAppointmentModalVisible(true);
            }
            if (onSelectDate) {
                onSelectDate(newDate);
            }
        }
    };

    // Generate calendar days
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = Array.from({ length: 42 }, (_, i) => {
        const dayNumber = i - firstDay + 1;
        return dayNumber > 0 && dayNumber <= daysInMonth ? dayNumber : null;
    });

    const dateAppointments = selectedDate ? getAppointmentsForDate(selectedDate.getDate()) : [];

    return (
        <View style={styles.container}>
            {/* Calendar Header */}
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={handlePreviousMonth} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.monthYear}>
                    {getMonthName(currentDate)} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdayContainer}>
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
                    <Text key={index} style={styles.weekdayLabel}>
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
                {days.map((day, index) => {
                    const isBookable = day && isDateBookable(day);
                    const dateAppointments = day ? getAppointmentsForDate(day) : [];
                    const isSelected = selectedDate && day && selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth();

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.dayCell,
                                !day && styles.emptyCell,
                                day && !isBookable ? styles.unBookableCell : null,
                                isSelected ? styles.selectedCell : null,
                            ]}
                            onPress={() => day && handleDateSelect(day)}
                            disabled={!isBookable}
                            activeOpacity={isBookable ? 0.7 : 1}
                        >
                            {day && (
                                <>
                                    <Text
                                        style={[
                                            styles.dayText,
                                            !isBookable && styles.unBookableText,
                                            isSelected ? styles.selectedText : null,
                                        ]}
                                    >
                                        {day}
                                    </Text>
                                    {dateAppointments.length > 0 && (
                                        <View style={styles.appointmentIndicator}>
                                            <Text style={styles.indicatorText}>
                                                {dateAppointments.length}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Appointments for Selected Date */}
            {selectedDate && dateAppointments.length > 0 && (
                <View style={styles.appointmentsSection}>
                    <Text style={styles.appointmentsTitle}>
                        Appointments for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
                        {dateAppointments.map((appointment) => (
                            <View key={appointment.id} style={styles.appointmentCard}>
                                <View style={styles.appointmentHeader}>
                                    <View>
                                        <Text style={styles.clientName}>{appointment.clientName}</Text>
                                        <Text style={styles.caseType}>{appointment.caseType}</Text>
                                    </View>
                                    <Text style={styles.appointmentTime}>
                                        {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                                <View style={styles.appointmentFooter}>
                                    <Text style={styles.priceText}>LKR {appointment.price.toFixed(2)}</Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            appointment.status === 'confirmed' && styles.statusConfirmed,
                                            appointment.status === 'pending' && styles.statusPending,
                                        ]}
                                    >
                                        <Text style={styles.statusText}>{appointment.status}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.availabilityButton]}
                    onPress={onSetAvailability}
                    activeOpacity={0.8}
                >
                    <Text style={styles.availabilityButtonText}>SET AVAILABILITY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.appointmentButton]}
                    onPress={onAddAppointment}
                    activeOpacity={0.8}
                >
                    <Text style={styles.appointmentButtonText}>ADD APPOINTMENT</Text>
                </TouchableOpacity>
            </View>

            {/* Appointment Modal */}
            <Modal
                visible={appointmentModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAppointmentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setAppointmentModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Appointment Information</Text>

                        {dateAppointments.map((appointment) => (
                            <View key={appointment.id} style={styles.modalAppointmentDetail}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Client</Text>
                                    <Text style={styles.detailValue}>{appointment.clientName}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Email</Text>
                                    <Text style={styles.detailValue}>{appointment.email}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Appointment</Text>
                                    <Text style={styles.detailValue}>
                                        {new Date(appointment.dateTime).toLocaleDateString()},&nbsp;
                                        {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })} - {new Date(new Date(appointment.dateTime).getTime() + appointment.duration * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Amount</Text>
                                    <Text style={styles.detailValue}>LKR {appointment.price.toFixed(2)}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Payment Status</Text>
                                    <View
                                        style={[
                                            styles.paymentBadge,
                                            { backgroundColor: '#E8F5E9' },
                                        ]}
                                    >
                                        <Text style={{ color: '#2E7D32', fontSize: fontSize.sm }}>
                                            Verified Payment
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Mode</Text>
                                    <Text style={styles.detailValue}>
                                        {appointment.mode === 'physical' ? 'Physical Appointment' : 'Virtual Appointment'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    navButton: {
        padding: spacing.sm,
    },
    monthYear: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    weekdayContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    weekdayLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    dayCell: {
        width: '13.5%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        marginBottom: spacing.xs,
        position: 'relative',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    emptyCell: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    unBookableCell: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },
    selectedCell: {
        backgroundColor: colors.primary,
    },
    dayText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    unBookableText: {
        color: '#BDBDBD',
    },
    selectedText: {
        color: colors.white,
        fontWeight: fontWeight.bold,
    },
    appointmentIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: colors.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicatorText: {
        color: colors.white,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
    },
    appointmentsSection: {
        marginBottom: spacing.md,
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    appointmentsTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    appointmentsList: {
        maxHeight: 180,
    },
    appointmentCard: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.primary,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    clientName: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    caseType: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    appointmentTime: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    appointmentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        backgroundColor: '#FFF3E0',
    },
    statusConfirmed: {
        backgroundColor: '#E8F5E9',
    },
    statusPending: {
        backgroundColor: '#FFF3E0',
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: '#FF6F00',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    availabilityButton: {
        backgroundColor: colors.primary,
    },
    appointmentButton: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    availabilityButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    appointmentButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        maxHeight: '80%',
        width: '90%',
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: spacing.sm,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.primary,
        marginBottom: spacing.md,
    },
    modalAppointmentDetail: {
        marginBottom: spacing.lg,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    detailLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    detailValue: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
        maxWidth: '60%',
    },
    paymentBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
});

export default CalendarComponent;
