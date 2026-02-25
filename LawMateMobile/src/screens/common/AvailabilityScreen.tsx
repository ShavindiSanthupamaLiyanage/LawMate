import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';

const AvailabilityScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data
    const [availability, setAvailability] = useState({
        monday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
        tuesday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
        wednesday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
        thursday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
        friday: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
        saturday: { enabled: false, start: '10:00 AM', end: '02:00 PM' },
        sunday: { enabled: false, start: '10:00 AM', end: '02:00 PM' },
    });

    const toggleDay = (day: keyof typeof availability) => {
        setAvailability(prev => ({
            ...prev,
            [day]: { ...prev[day], enabled: !prev[day].enabled }
        }));
        // TODO: Call API to update availability
    };

    const DayRow = ({ day, label }: { day: keyof typeof availability; label: string }) => (
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
            />
        </View>
    );

    return (
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
                    <DayRow day="monday" label="Monday" />
                    <DayRow day="tuesday" label="Tuesday" />
                    <DayRow day="wednesday" label="Wednesday" />
                    <DayRow day="thursday" label="Thursday" />
                    <DayRow day="friday" label="Friday" />
                    <DayRow day="saturday" label="Saturday" />
                    <DayRow day="sunday" label="Sunday" />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Toggle days on/off to set your availability. Tap on a day to edit time slots.
                    </Text>
                </View>
            </ScrollView>
        </View>
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
