import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { AuthService } from '../../services/authService';
import {
    createAvailabilitySlot,
    deleteAvailabilitySlot,
    getLawyerAvailabilitySlots,
} from '../../services/calendarService';
import { AvailabilitySlotDto } from '../../interfaces/calendar.interface';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DayAvailability {
    enabled: boolean;
    start: string;
    end: string;
    slotIds: number[];
    hasBooked: boolean;
    date: string;
}

type WeeklyAvailability = Record<DayKey, DayAvailability>;

const DAY_ORDER: DayKey[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

const DAY_LABELS: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

const DAY_TO_INDEX: Record<DayKey, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
};

const INDEX_TO_DAY: Partial<Record<number, DayKey>> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
};

const toTimeLabel = (time24: string): string => {
    const [hoursText, minutesText] = time24.split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return time24;
    }

    const amPm = hours >= 12 ? 'PM' : 'AM';
    const normalizedHours = hours % 12 || 12;

    return `${String(normalizedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${amPm}`;
};

const addMinutesToTime = (time24: string, duration: number): string => {
    const [hoursText, minutesText] = time24.split(':');
    const hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return time24;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + duration);

    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const nextDateForDay = (day: DayKey, referenceDate: Date): Date => {
    const targetDay = DAY_TO_INDEX[day];
    const currentDay = referenceDate.getDay();
    let offset = targetDay - currentDay;

    if (offset < 0) {
        offset += 7;
    }

    const nextDate = new Date(referenceDate);
    nextDate.setDate(referenceDate.getDate() + offset);
    nextDate.setHours(0, 0, 0, 0);

    return nextDate;
};

const createDefaultAvailability = (referenceDate: Date): WeeklyAvailability => ({
    monday: {
        enabled: false,
        start: '09:00 AM',
        end: '05:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('monday', referenceDate).toISOString(),
    },
    tuesday: {
        enabled: false,
        start: '09:00 AM',
        end: '05:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('tuesday', referenceDate).toISOString(),
    },
    wednesday: {
        enabled: false,
        start: '09:00 AM',
        end: '05:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('wednesday', referenceDate).toISOString(),
    },
    thursday: {
        enabled: false,
        start: '09:00 AM',
        end: '05:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('thursday', referenceDate).toISOString(),
    },
    friday: {
        enabled: false,
        start: '09:00 AM',
        end: '05:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('friday', referenceDate).toISOString(),
    },
    saturday: {
        enabled: false,
        start: '10:00 AM',
        end: '02:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('saturday', referenceDate).toISOString(),
    },
    sunday: {
        enabled: false,
        start: '10:00 AM',
        end: '02:00 PM',
        slotIds: [],
        hasBooked: false,
        date: nextDateForDay('sunday', referenceDate).toISOString(),
    },
});

const mapSlotsToAvailability = (
    slots: AvailabilitySlotDto[],
    referenceDate: Date
): WeeklyAvailability => {
    const mappedAvailability = createDefaultAvailability(referenceDate);
    const groupedSlots: Record<DayKey, AvailabilitySlotDto[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    };

    slots.forEach((slot) => {
        const slotDate = new Date(slot.date);

        if (Number.isNaN(slotDate.getTime())) {
            return;
        }

        const dayKey = INDEX_TO_DAY[slotDate.getDay()];

        if (!dayKey) {
            return;
        }

        groupedSlots[dayKey].push(slot);
    });

    DAY_ORDER.forEach((day) => {
        const daySlots = groupedSlots[day];

        if (daySlots.length === 0) {
            return;
        }

        const sortedSlots = [...daySlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
        const firstSlot = sortedSlots[0];
        const lastSlot = sortedSlots[sortedSlots.length - 1];

        mappedAvailability[day] = {
            enabled: true,
            start: toTimeLabel(firstSlot.startTime),
            end: toTimeLabel(addMinutesToTime(lastSlot.startTime, lastSlot.duration)),
            slotIds: sortedSlots.map((slot) => slot.timeSlotId),
            hasBooked: sortedSlots.some((slot) => slot.booked),
            date: new Date(firstSlot.date).toISOString(),
        };
    });

    return mappedAvailability;
};

const AvailabilityScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [lawyerId, setLawyerId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [savingDay, setSavingDay] = useState<DayKey | null>(null);
    const [availability, setAvailability] = useState<WeeklyAvailability>(
        createDefaultAvailability(new Date())
    );

    const loadAvailability = useCallback(async (currentLawyerId: string) => {
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const slots = await getLawyerAvailabilitySlots(currentLawyerId, startDate, endDate);
        setAvailability(mapSlotsToAvailability(slots, startDate));
    }, []);

    useEffect(() => {
        let isMounted = true;

        const initialize = async () => {
            try {
                setLoading(true);
                setErrorMessage(null);

                const currentUser = await AuthService.getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    throw new Error('User session not found. Please log in again.');
                }

                if (isMounted) {
                    setLawyerId(userId);
                }

                await loadAvailability(userId);
            } catch (error: any) {
                if (isMounted) {
                    setErrorMessage(error?.message ?? 'Failed to load availability data.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
        };
    }, [loadAvailability]);

    const toggleDay = async (day: DayKey) => {
        if (!lawyerId) {
            Alert.alert('Session expired', 'Please log in again.');
            return;
        }

        const dayAvailability = availability[day];
        setSavingDay(day);

        try {
            if (dayAvailability.enabled) {
                if (dayAvailability.hasBooked) {
                    Alert.alert(
                        'Cannot disable day',
                        'This day contains booked time slots. Remove bookings first.'
                    );
                    return;
                }

                await Promise.all(dayAvailability.slotIds.map((slotId) => deleteAvailabilitySlot(slotId)));
            } else {
                await createAvailabilitySlot({
                    lawyerId,
                    date: dayAvailability.date,
                    startTime: '09:00',
                    duration: 60,
                    price: 0,
                });
            }

            await loadAvailability(lawyerId);
        } catch (error: any) {
            Alert.alert('Update failed', error?.message ?? 'Failed to update availability.');
        } finally {
            setSavingDay(null);
        }
    };

    const DayRow = ({ day, label }: { day: DayKey; label: string }) => (
        <View style={styles.dayRow}>
            <View style={styles.dayLeft}>
                <Text style={styles.dayLabel}>{label}</Text>
                {availability[day].enabled && (
                    <Text style={styles.timeText}>
                        {availability[day].start} - {availability[day].end}
                    </Text>
                )}
            </View>
            <Switch
                value={availability[day].enabled}
                onValueChange={() => toggleDay(day)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
                disabled={loading || savingDay === day}
            />
        </View>
    );

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View style={styles.container}>
                <LinearGradient
                    colors={[
                        'rgba(24,114,234,1)',
                        'rgba(54,87,208,1)',
                        'rgba(77,55,200,1)',
                        'rgba(99,71,253,1)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Availability</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Weekly Schedule</Text>
                    {loading ? (
                        <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
                    ) : errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : (
                        DAY_ORDER.map((day) => (
                            <DayRow key={day} day={day} label={DAY_LABELS[day]} />
                        ))
                    )}
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Toggle a day to create or remove a default one-hour slot for this week.
                    </Text>
                </View>
            </ScrollView>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: 110,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    dayLeft: {
        flex: 1,
    },
    dayLabel: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.xs / 2,
    },
    timeText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    errorText: {
        color: colors.error,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default AvailabilityScreen;
