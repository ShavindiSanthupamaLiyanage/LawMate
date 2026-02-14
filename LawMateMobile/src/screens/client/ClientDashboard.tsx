import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import ClientLayout from "../../components/ClientLayout";

interface LegendItemProps {
    color: string;
    label: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label }) => {
    return (
        <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
};

interface ActivityCardProps {
    title: string;
    subtitle: string;
    status: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, subtitle, status }) => {
    return (
        <View style={styles.activityCard}>
            <View style={styles.activityLeft}>
                <View style={styles.activityIcon}>
                    <Text style={styles.activityIconText}>📄</Text>
                </View>
                <View>
                    <Text style={styles.activityTitle}>{title}</Text>
                    <Text style={styles.activitySubtitle}>{subtitle}</Text>
                </View>
            </View>
            <View style={[
                styles.statusBadge,
                { backgroundColor: status === 'Upcoming' ? colors.info + '20' : colors.success + '20' }
            ]}>
                <Text style={[
                    styles.statusText,
                    { color: status === 'Upcoming' ? colors.info : colors.success }
                ]}>
                    {status}
                </Text>
            </View>
        </View>
    );
};

const ClientDashboard: React.FC = () => {
    return (
        <ClientLayout userName="Kavindi Dilhara">
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>1234</Text>
                    <Text style={styles.statLabel}>Active Cases</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>5,678</Text>
                    <Text style={styles.statLabel}>Total Appointments</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Total Appointments</Text>
                <View style={styles.appointmentsChart}>
                    <View style={styles.appointmentsPie}>
                        <Text style={styles.pieValue}>1234</Text>
                    </View>
                    <View style={styles.appointmentsLegend}>
                        <LegendItem color={colors.chartBlue} label="In-Person" />
                        <LegendItem color={colors.chartPurple} label="Online" />
                        <LegendItem color={colors.chartPink} label="Pending" />
                        <LegendItem color={colors.chartOrange} label="Completed" />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Activity</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>
                <ActivityCard
                    title="Property Dispute"
                    subtitle="Meeting with lawyer"
                    status="Upcoming"
                />
                <ActivityCard
                    title="Divorce Settlement"
                    subtitle="Document review"
                    status="Completed"
                />
                 <ActivityCard
                    title="Property Dispute"
                    subtitle="Meeting with lawyer"
                    status="Upcoming"
                />
                <ActivityCard
                    title="Divorce Settlement"
                    subtitle="Document review"
                    status="Completed"
                />
                 <ActivityCard
                    title="Property Dispute"
                    subtitle="Meeting with lawyer"
                    status="Upcoming"
                />
                <ActivityCard
                    title="Divorce Settlement"
                    subtitle="Document review"
                    status="Completed"
                />
                 <ActivityCard
                    title="Property Dispute"
                    subtitle="Meeting with lawyer"
                    status="Upcoming"
                />
                <ActivityCard
                    title="Divorce Settlement"
                    subtitle="Document review"
                    status="Completed"
                />
                 <ActivityCard
                    title="Property Dispute"
                    subtitle="Meeting with lawyer"
                    status="Upcoming"
                />
                <ActivityCard
                    title="Divorce Settlement"
                    subtitle="Document review"
                    status="Completed"
                />
            </View>
        </ClientLayout>
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
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
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
    appointmentsChart: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    appointmentsPie: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 20,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    appointmentsLegend: {
        gap: spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
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
    activityCard: {
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
        flex: 1,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activityIconText: {
        fontSize: 20,
    },
    activityTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    activitySubtitle: {
        fontSize: fontSize.sm,
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

export default ClientDashboard;