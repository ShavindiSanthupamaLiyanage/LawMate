import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import AdminLayout from '../../components/AdminLayout';

interface ActivityItemProps {
    name: string;
    action: string;
    time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ name, action, time }) => (
    <View style={styles.activityItem}>
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.activityTextContainer}>
            <Text style={styles.activityName}>
                {name} <Text style={styles.activityAction}>{action}</Text>
            </Text>
            <View style={styles.timeContainer}>
                <Text style={styles.timeIcon}>🕐</Text>
                <Text style={styles.timeText}>{time}</Text>
            </View>
        </View>
    </View>
);

const AdminDashboard: React.FC = () => {
    const navigation = useNavigation<any>();
    
    // Sample data for charts
    const lawyerCategories = [
        { label: 'Criminal', percentage: 30, color: '#A78BFA' },
        { label: 'Civil', percentage: 25, color: '#EC4899' },
        { label: 'Cyber', percentage: 20, color: '#60A5FA' },
        { label: 'Family', percentage: 15, color: '#F59E0B' },
        { label: 'Corporate', percentage: 10, color: '#10B981' },
    ];

    const recentActivities = [
        { name: 'Sarah Miller', action: 'reported a dispute', time: '2 minutes ago' },
        { name: 'John Doe', action: 'registered as lawyer', time: '15 minutes ago' },
        { name: 'Emma Wilson', action: 'updated profile', time: '1 hour ago' },
    ];

    return (
        <AdminLayout 
            userName="Kavindu Gimsara"
            onProfilePress={() => navigation.navigate('AdminProfile')}
        >
            <View>

                {/* Total Lawyers Pie Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Total Lawyers</Text>
                        <Text style={styles.cardSubtitle}>56,945 Active</Text>
                    </View>

                    <View style={styles.pieChartContainer}>
                        {/* Simple Pie Chart Representation */}
                        <View style={styles.pieChart}>
                            <LinearGradient
                                colors={['#A78BFA', '#EC4899', '#60A5FA', '#F59E0B', '#10B981']}
                                style={styles.pieGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.pieCenter}>
                                    <Text style={styles.pieCenterNumber}>769.66</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        <View style={styles.legendContainer}>
                            {lawyerCategories.map((category, index) => (
                                <View key={index} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: category.color }]} />
                                    <Text style={styles.legendText}>{category.label}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Revenue Bar Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Revenue</Text>
                        <Text style={styles.cardSubtitle}>56,945 Total</Text>
                    </View>

                    <View style={styles.barChartContainer}>
                        <View style={styles.yAxis}>
                            <Text style={styles.yAxisLabel}>150</Text>
                            <Text style={styles.yAxisLabel}>100</Text>
                            <Text style={styles.yAxisLabel}>50</Text>
                            <Text style={styles.yAxisLabel}>25</Text>
                        </View>

                        <View style={styles.barsContainer}>
                            {['Jan 2025', 'February', 'March', 'April', 'May', 'June'].map((month, index) => (
                                <View key={index} style={styles.barGroup}>
                                    <View style={styles.barPair}>
                                        <View style={[styles.bar, styles.bar2023, { height: 40 + Math.random() * 60 }]} />
                                        <View style={[styles.bar, styles.bar2024, { height: 50 + Math.random() * 70 }]} />
                                    </View>
                                    <Text style={styles.xAxisLabel}>{month}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.chartLegend}>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendSquare, { backgroundColor: '#A78BFA' }]} />
                            <Text style={styles.legendLabel}>2023</Text>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={[styles.legendSquare, { backgroundColor: '#60A5FA' }]} />
                            <Text style={styles.legendLabel}>2024</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Recent Activity</Text>
                        <Text style={styles.cardSubtitle}>Latest Updates</Text>
                    </View>

                    {recentActivities.map((activity, index) => (
                        <ActivityItem
                            key={index}
                            name={activity.name}
                            action={activity.action}
                            time={activity.time}
                        />
                    ))}
                </View>
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerCard: {
        margin: spacing.md,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    menuIcon: {
        width: 24,
        height: 24,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    menuLine: {
        width: 20,
        height: 2,
        backgroundColor: colors.white,
        borderRadius: 1,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    notificationIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bellIcon: {
        fontSize: 18,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    greeting: {
        fontSize: fontSize.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    userName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.white,
        marginBottom: spacing.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textPrimary,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.white,
        margin: spacing.md,
        marginTop: 0,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        marginBottom: spacing.lg,
    },
    cardTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    pieChartContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pieChart: {
        width: 120,
        height: 120,
    },
    pieGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieCenter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pieCenterNumber: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    legendContainer: {
        flex: 1,
        paddingLeft: spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: spacing.sm,
    },
    legendText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    barChartContainer: {
        flexDirection: 'row',
        height: 150,
        marginBottom: spacing.md,
    },
    yAxis: {
        width: 30,
        justifyContent: 'space-between',
        paddingRight: spacing.sm,
    },
    yAxisLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        textAlign: 'right',
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderLeftWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
        paddingLeft: spacing.sm,
        paddingBottom: spacing.md,
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
    },
    barPair: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        marginBottom: 4,
    },
    bar: {
        width: 8,
        borderRadius: 4,
    },
    bar2023: {
        backgroundColor: '#A78BFA',
    },
    bar2024: {
        backgroundColor: '#60A5FA',
    },
    xAxisLabel: {
        fontSize: 8,
        color: colors.textSecondary,
        marginTop: 4,
        transform: [{ rotate: '-45deg' }],
        width: 40,
    },
    chartLegend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    legendSquare: {
        width: 12,
        height: 12,
        borderRadius: 3,
    },
    legendLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.white,
    },
    activityTextContainer: {
        flex: 1,
    },
    activityName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    activityAction: {
        fontWeight: fontWeight.regular,
        color: colors.textSecondary,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeIcon: {
        fontSize: 12,
    },
    timeText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    bottomSpacer: {
        height: 20, // Reduced from 100 since safe area handles the rest
    },
});

export default AdminDashboard;

