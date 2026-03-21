import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import AdminLayout from '../../components/AdminLayout';
import {AdminDashboardDto} from "../../interfaces/adminDashboard.interface";
import {AdminService} from "../../services/adminDashboardService";

type DonutItem = { label: string; value: number; color: string };

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = (Math.PI / 180) * angleDeg;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}
const DonutChart: React.FC<{
    size?: number;
    strokeWidth?: number;
    totalText: string;
    data: DonutItem[];
}> = ({ size = 140, strokeWidth = 18, totalText, data }) => {

    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

    let cursor = -90;
    const GAP = 2;
    return (
        <Svg width={size} height={size}>
            <G>
                {data.map((seg, i) => {
                    const sweep = total === 0 ? 0 : (seg.value / total) * 360;

                    const start = cursor + GAP / 2;
                    const end = cursor + sweep - GAP / 2;

                    cursor += sweep;

                    return (
                        <Path
                            key={i}
                            d={arcPath(cx, cy, r, start, end)}
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                    );
                })}
                <Circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill={colors.white} />

                <SvgText
                    x={cx}
                    y={cy + 5}
                    fontSize={fontSize.lg}
                    fontWeight={fontWeight.bold as any}
                    fill={colors.textPrimary}
                    textAnchor="middle"
                >
                    {totalText}
                </SvgText>
            </G>
        </Svg>
    );
};

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

const CATEGORY_COLORS: Record<string, string> = {
    Criminal:  '#A78BFA',
    Civil:     '#EC4899',
    Cyber:     '#60A5FA',
    Family:    '#F59E0B',
    Corporate: '#10B981',
};

const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();

    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);

    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

const AdminDashboard: React.FC = () => {
    const navigation = useNavigation<any>();
    const [dashboard, setDashboard] = useState<AdminDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await AdminService.getDashboard();
                setDashboard(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
    if (error || !dashboard) return <Text>{error ?? 'No data'}</Text>;

    // Map API data → DonutChart format
    const lawyerCategories: DonutItem[] = dashboard.lawyerCategories.map(c => ({
        label: c.category,
        value: c.count,
        color: CATEGORY_COLORS[c.category] ?? '#94A3B8',
    }));

    // Map API data → Recent activities format
    const recentActivities = dashboard.recentActivities.map(a => ({
        name:   a.name,
        action: a.action,
        time:   getRelativeTime(a.time),
    }));

    return (
        <AdminLayout
            userName="Kavindu Gimsara"
            onProfilePress={() => navigation.navigate('AdminProfile')}
        >
            <View>
                {/* Dashboard Stats */}
                <LinearGradient
                    colors={['#3B82F6', '#7C3AED']}
                    style={styles.headerCard}
                >
                    <Text style={[styles.cardTitle, {color: colors.white}]}>System Users</Text>
                    <Text style={[styles.cardSubtitle, {color: colors.white}]}>Total Lawyers and Clients</Text>

                    <View style={styles.statsContainer}>

                        {/* Total Lawyers */}
                        <View style={[styles.statCard, { backgroundColor: '#AFC6E9' }]}>
                            <Text style={styles.statNumber}>{dashboard.totalLawyers.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Lawyers</Text>
                        </View>

                        {/* Total Clients */}
                        <View style={[styles.statCard, { backgroundColor: '#9FE3B4' }]}>
                            <Text style={styles.statNumber}>{dashboard.totalClients.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Clients</Text>
                        </View>

                    </View>

                </LinearGradient>

                {/* Total Lawyers Donut Chart */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Total Lawyers</Text>
                    <Text style={styles.cardSubtitle}>{dashboard.activeMemberships.toLocaleString()} Active</Text>

                    <View style={styles.pieChartContainer}>
                        <DonutChart totalText="100%" data={lawyerCategories} />

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
                        <Text style={styles.cardSubtitle}>LKR {dashboard.totalRevenue.toLocaleString()} Total</Text>
                    </View>

                    <View style={styles.barChartContainer}>
                        <View style={styles.yAxis}>
                            <Text style={styles.yAxisLabel}>150</Text>
                            <Text style={styles.yAxisLabel}>100</Text>
                            <Text style={styles.yAxisLabel}>50</Text>
                            <Text style={styles.yAxisLabel}>25</Text>
                        </View>

                        <View style={styles.barsContainer}>
                            {dashboard.monthlyRevenue.map((item, index) => (
                                <View key={index} style={styles.barGroup}>
                                    <View style={styles.barPair}>
                                        <View style={[styles.bar, styles.bar2023,
                                            { height: Math.max(10, (item.revenue / dashboard.totalRevenue) * 130) }
                                        ]} />
                                    </View>
                                    <Text style={styles.xAxisLabel}>{item.month}</Text>
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
        paddingBottom: 8,
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
        height: 20,
    },
});

export default AdminDashboard;

