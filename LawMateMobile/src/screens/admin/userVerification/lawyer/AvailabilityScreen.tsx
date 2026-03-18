import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../../config/theme';
import AdminLayout from '../../../../components/AdminLayout';
import { getLawyerAvailabilitySlots } from '../../../../services/calendarService';
import { AvailabilitySlotDto } from '../../../../interfaces/calendar.interface';

type AdminStackParamList = {
    Availability: { lawyerId: string };
};

const AvailabilityScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<AdminStackParamList, 'Availability'>>();
    const { lawyerId } = route.params;

    const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getLawyerAvailabilitySlots(lawyerId);
                setSlots(data);
            } catch (e) {
                setError('Failed to load availability slots.');
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();
    }, [lawyerId]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-CA').replace(/-/g, '/'); // → 2025/12/14
    };

    const formatTime = (timeStr: string) => {
        // timeStr is "HH:mm" e.g. "09:00"
        const [hourStr, minuteStr] = timeStr.split(':');
        const hours = parseInt(hourStr, 10);
        const minutes = parseInt(minuteStr, 10);
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        const minutePadded = minutes.toString().padStart(2, '0');
        return `${hour12}:${minutePadded} ${ampm}`; // → 9:00 a.m.
    };

    return (
        <AdminLayout
            title="Availability"
            showBackButton
            disableScroll
            onBackPress={() => navigation.goBack()}
            onProfilePress={() => navigation.getParent()?.navigate('AdminProfile')}
        >
            {loading ? (
                <ActivityIndicator
                    color={colors.primary}
                    style={{ marginTop: 40 }}
                />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : slots.length === 0 ? (
                <Text style={styles.emptyText}>No availability slots found.</Text>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {slots.map((slot) => (
                        <View key={slot.id} style={styles.card}>
                            <View style={styles.cardLeft}>
                                <Text style={styles.dateText}>
                                    {formatDate(slot.date)}
                                </Text>
                                <Text style={styles.timeText}>
                                    {formatTime(slot.startTime)}
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {slot.duration} M PER SLOT
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    listContent: {
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
    },
    cardLeft: {
        gap: spacing.xs,
    },
    dateText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    timeText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    badge: {
        backgroundColor: colors.lightGradient,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        letterSpacing: 0.5,
        verticalAlign: 'middle',
    },
    errorText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: fontSize.sm,
        color: 'red',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
});

export default AvailabilityScreen;