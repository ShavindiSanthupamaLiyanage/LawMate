import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

const AvailabilityScreen: React.FC = () => {
    const navigation = useNavigation();
    const [availability, setAvailability] = useState({
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
    });

    const days = [
        { key: 'monday', label: 'Monday', time: '09:00 AM - 05:00 PM' },
        { key: 'tuesday', label: 'Tuesday', time: '09:00 AM - 05:00 PM' },
        { key: 'wednesday', label: 'Wednesday', time: '09:00 AM - 05:00 PM' },
        { key: 'thursday', label: 'Thursday', time: '09:00 AM - 05:00 PM' },
        { key: 'friday', label: 'Friday', time: '09:00 AM - 05:00 PM' },
        { key: 'saturday', label: 'Saturday', time: '10:00 AM - 03:00 PM' },
        { key: 'sunday', label: 'Sunday', time: 'Closed' },
    ];

    const toggleDay = (day: keyof typeof availability) => {
        setAvailability(prev => ({
            ...prev,
            [day]: !prev[day]
        }));
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary, colors.primaryLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Ionicons 
                            name="chevron-back" 
                            size={28} 
                            color={colors.white}
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                    <Text style={styles.headerTitle}>Availability</Text>
                    <View style={styles.headerRight} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={colors.primary} />
                    <Text style={styles.infoText}>
                        Set your available working hours. Your calendar will be updated accordingly.
                    </Text>
                </View>

                <View style={styles.daysContainer}>
                    {days.map((day) => (
                        <View key={day.key} style={styles.dayRow}>
                            <View style={styles.dayInfo}>
                                <Text style={styles.dayLabel}>{day.label}</Text>
                                <Text style={styles.dayTime}>
                                    {availability[day.key as keyof typeof availability] ? day.time : 'Not Available'}
                                </Text>
                            </View>
                            <Switch
                                value={availability[day.key as keyof typeof availability]}
                                onValueChange={() => toggleDay(day.key as keyof typeof availability)}
                                trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                                thumbColor={availability[day.key as keyof typeof availability] ? colors.primary : colors.textSecondary}
                            />
                        </View>
                    ))}
                </View>

                {/* TODO: API Integration - Save availability changes to backend */}
                <View style={styles.bottomSpacing} />
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
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingTop: spacing.lg,
        height: 100,
        justifyContent: 'flex-end',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: {
        width: 30,
    },
    headerRight: {
        width: 30,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.white,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: colors.primaryLight,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        marginLeft: spacing.md,
        flex: 1,
        fontWeight: fontWeight.medium,
    },
    daysContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: spacing.lg,
    },
    dayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    dayInfo: {
        flex: 1,
    },
    dayLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    dayTime: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    bottomSpacing: {
        height: spacing.xl,
    },
});

export default AvailabilityScreen;
