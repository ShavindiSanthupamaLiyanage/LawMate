import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import LawyerLayout from '../../components/LawyerLayout';

interface ActivityItemProps {
    name: string;
    time: string;
    status: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ name, time, status }) => {
    return (
        <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>👤</Text>
                </View>
                <View>
                    <Text style={styles.activityName}>{name}</Text>
                    <Text style={styles.activityTime}>{time}</Text>
                </View>
            </View>
            <View style={[
                styles.statusBadge,
                { backgroundColor: status === 'Pending' ? colors.warning + '20' : colors.success + '20' }
            ]}>
                <Text style={[
                    styles.statusText,
                    { color: status === 'Pending' ? colors.warning : colors.success }
                ]}>
                    {status}
                </Text>
            </View>
        </View>
    );
};

const LawyerDashboard: React.FC = () => {
    return (
        <LawyerLayout userName="Kavindi Dilhara">
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>1234</Text>
                    <Text style={styles.statLabel}>Total Cases</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>5,678</Text>
                    <Text style={styles.statLabel}>Total Clients</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total Lawyers</Text>
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartValue}>709.60</Text>
                    <View style={styles.chartLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.chartBlue }]} />
                            <Text style={styles.legendText}>Criminal</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.chartPurple }]} />
                            <Text style={styles.legendText}>Civil</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.chartPink }]} />
                            <Text style={styles.legendText}>Family</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Revenues</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See all</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.revenueChart}>
                    <Text style={styles.placeholder}>📊 Revenue Chart</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                </View>
                <ActivityItem
                    name="Jeson Miller-march 4"
                    time="3 hours"
                    status="Pending"
                />
                <ActivityItem
                    name="Jeson Miller-march 4"
                    time="5 hours"
                    status="Completed"
                />
            </View>
        </LawyerLayout>
    );
}

const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: spacing.md,
        borderRadius: borderRadius.md,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.white,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        padding: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    seeAll: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    chartPlaceholder: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    chartValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    chartLegend: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    revenueChart: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        height: 200,
        justifyContent: 'center',
    },
    placeholder: {
        fontSize: fontSize.xl,
    },
    activityItem: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    activityLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
    },
    activityName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    activityTime: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
});

export default LawyerDashboard;