import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../../config/theme';
import AdminLayout from '../../../../components/AdminLayout';

// ── mock data — replace with real API data ────────────────────────────────────
const SLOTS = [
    { id: '1', date: '2025/12/14', time: '12:00 p.m', minutesPerSlot: 30 },
    { id: '2', date: '2025/12/14', time: '12:00 p.m', minutesPerSlot: 30 },
    { id: '3', date: '2025/12/14', time: '12:00 p.m', minutesPerSlot: 30 },
    { id: '4', date: '2025/12/14', time: '12:00 p.m', minutesPerSlot: 30 },
    { id: '5', date: '2025/12/14', time: '12:00 p.m', minutesPerSlot: 30 },
];

const AvailabilityScreen: React.FC = () => {
    const navigation = useNavigation();
    const [slots] = useState(SLOTS);

    return (
        <AdminLayout
            title="Availability"
            showBackButton
            disableScroll
            onBackPress={() => navigation.goBack()}
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {slots.map((slot) => (
                    <View key={slot.id} style={styles.card}>
                        <View style={styles.cardLeft}>
                            <Text style={styles.dateText}>{slot.date}</Text>
                            <Text style={styles.timeText}>{slot.time}</Text>
                        </View>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {slot.minutesPerSlot} M PER SLOT
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    },
});

export default AvailabilityScreen;