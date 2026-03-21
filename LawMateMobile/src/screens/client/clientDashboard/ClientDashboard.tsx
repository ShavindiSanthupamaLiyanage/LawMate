import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ClientLayout from "../../../components/ClientLayout";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import { ClientDashboardService } from "../../../services/clientDashboardService";
import { ClientDashboardHomeResponse } from "../../../interfaces/clientDashboard.interface";

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
}> = ({ size = 150, strokeWidth = 18, totalText, data }) => {
    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

    const GAP_DEG = 2;
    let cursor = -90;

    return (
        <Svg width={size} height={size}>
            <G>
                {data.map((seg, idx) => {
                    const sweep = total === 0 ? 0 : (seg.value / total) * 360;

                    const start = cursor + GAP_DEG / 2;
                    const end = cursor + sweep - GAP_DEG / 2;

                    cursor += sweep;

                    const safeStart = sweep < GAP_DEG ? cursor - sweep : start;
                    const safeEnd = sweep < GAP_DEG ? cursor : end;

                    return (
                        <Path
                            key={`${seg.label}-${idx}`}
                            d={arcPath(cx, cy, r, safeStart, safeEnd)}
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="butt"
                        />
                    );
                })}

                <Circle cx={cx} cy={cy} r={r - strokeWidth / 2} fill={colors.white} />

                <SvgText
                    x={cx}
                    y={cy + 7}
                    fontSize={fontSize.xl}
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

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendText}>{label}</Text>
    </View>
);

type ActivityStatus = string;

const statusColors = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "completed" || normalized === "verified") {
        return { bg: "#EAF8EE", fg: "#2E9B4B" };
    }

    return { bg: "#E8F0FF", fg: "#2F6BFF" };
};

const ActivityCard: React.FC<{
    title: string;
    caseId: string;
    status: ActivityStatus;
    lawyerName: string;
    lawyerMeta1: string;
    lawyerMeta2: string;
    filedDate: string;
    avatarUri?: string;
}> = ({ title, caseId, status, lawyerName, lawyerMeta1, lawyerMeta2, filedDate, avatarUri }) => {
    const st = statusColors(status);

    return (
        <View style={styles.activityCard}>
            <View style={styles.activityTopRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{title}</Text>
                    <Text style={styles.activityCaseId}>Case #{caseId}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.fg }]}>{status}</Text>
                </View>
            </View>

            <View style={styles.lawyerRow}>
                <Image
                    source={avatarUri ? { uri: avatarUri } : { uri: "https://i.pravatar.cc/100?img=12" }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.lawyerName}>{lawyerName}</Text>
                    <Text style={styles.lawyerMeta}>{lawyerMeta1}</Text>
                    {!!lawyerMeta2 && <Text style={styles.lawyerMeta}>{lawyerMeta2}</Text>}
                </View>
            </View>

            <Text style={styles.filedText}>Filed: {filedDate}</Text>
        </View>
    );
};

const categoryColors: Record<string, string> = {
    Criminal: "#6D7CFF",
    Civil: "#FF8C86",
    Cyber: "#29C7D8",
    Family: "#F7B64A",
    Corporate: "#4A5FD1",
};

const getCategoryColor = (category: string) => {
    return categoryColors[category] || "#6D7CFF";
};

const normalizeStatus = (status: string): "Active" | "Completed" => {
    const normalized = status.toLowerCase();

    if (normalized === "completed" || normalized === "verified") {
        return "Completed";
    }

    return "Active";
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const ClientDashboard: React.FC = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const [dashboardData, setDashboardData] = useState<ClientDashboardHomeResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await ClientDashboardService.getDashboardHome();
                setDashboardData(data);
            } catch (err: any) {
                setError(err?.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const donutData: DonutItem[] =
        dashboardData?.appointmentBreakdown.map((item) => ({
            label: item.category,
            value: item.count,
            color: getCategoryColor(item.category),
        })) ?? [];

    if (loading) {
        return (
            <ClientLayout
                userName="Client"
                onProfilePress={() => navigation.getParent()?.navigate("ClientProfile")}
            >
                <View style={styles.centerState}>
                    <Text>Loading dashboard...</Text>
                </View>
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout
                userName="Client"
                onProfilePress={() => navigation.getParent()?.navigate("ClientProfile")}
            >
                <View style={styles.centerState}>
                    <Text>{error}</Text>
                </View>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout
            userName="Client"
            onProfilePress={() => navigation.getParent()?.navigate("ClientProfile")}
        >
            <View style={{ flex: 1 }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 140 + insets.bottom,
                    }}
                >
                    <View style={styles.body}>
                        <LinearGradient
                            colors={[colors.primary, "#6D49FF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroCard}
                        >
                            <Text style={styles.heroSmall}>Welcome Back</Text>
                            <Text style={styles.heroName}>Client Dashboard</Text>

                            <View style={styles.heroStatsRow}>
                                <View style={[styles.heroStatTile, { backgroundColor: "#DCEBFF" }]}>
                                    <Text style={styles.heroStatNumber}>
                                        {dashboardData?.summary.totalAppointments ?? 0}
                                    </Text>
                                    <Text style={styles.heroStatLabel}>Appointments</Text>
                                </View>

                                <View style={[styles.heroStatTile, { backgroundColor: "#E2F6E5" }]}>
                                    <Text style={styles.heroStatNumber}>
                                        {dashboardData?.summary.contactedLawyers ?? 0}
                                    </Text>
                                    <Text style={styles.heroStatLabel}>Contacted Lawyers</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Total Appointments</Text>
                            <Text style={styles.sectionSub}>Overview</Text>

                            <View style={styles.card}>
                                {donutData.length ? (
                                    <>
                                        <DonutChart
                                            totalText={String(dashboardData?.summary.totalAppointments ?? 0)}
                                            data={donutData}
                                        />

                                        <View style={styles.legend}>
                                            {donutData.map((d) => (
                                                <LegendItem key={d.label} color={d.color} label={d.label} />
                                            ))}
                                        </View>
                                    </>
                                ) : (
                                    <Text style={{ color: colors.textSecondary }}>
                                        No appointment breakdown available.
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeaderRow}>
                                <View>
                                    <Text style={styles.sectionTitle}>My Activity</Text>
                                    <Text style={styles.sectionSub}>Recent activity</Text>
                                </View>

                                <TouchableOpacity onPress={() => navigation.navigate("ClientActivityList")}>
                                    <Text style={styles.viewAll}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            {dashboardData?.recentActivities.length ? (
                                dashboardData.recentActivities.map((activity) => (
                                    <ActivityCard
                                        key={activity.bookingId}
                                        title={activity.title}
                                        caseId={activity.caseNumber}
                                        status={normalizeStatus(activity.status)}
                                        lawyerName={activity.lawyerName}
                                        lawyerMeta1={activity.lawyerDetails}
                                        lawyerMeta2=""
                                        filedDate={formatDate(activity.filedDate)}
                                    />
                                ))
                            ) : (
                                <Text style={{ color: colors.textSecondary, marginTop: spacing.md }}>
                                    No recent activities found.
                                </Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate("ClientChatbot")}
                    style={[
                        styles.fab,
                        {
                            right: spacing.lg,
                            bottom: spacing.md,
                        },
                    ]}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color={colors.white} />
                </TouchableOpacity>
            </View>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    centerState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg,
    },

    heroCard: {
        borderRadius: 18,
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    heroSmall: {
        color: colors.white,
        fontSize: fontSize.sm,
        opacity: 0.9,
    },
    heroName: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginTop: 2,
    },
    heroStatsRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    heroStatTile: {
        flex: 1,
        borderRadius: 14,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    heroStatNumber: {
        fontSize: 22,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    heroStatLabel: {
        marginTop: 4,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },

    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    sectionSub: {
        marginTop: 4,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },

    card: {
        marginTop: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: spacing.lg,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },

    legend: {
        gap: 10,
        paddingLeft: spacing.md,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },

    sectionHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    viewAll: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },

    activityCard: {
        marginTop: spacing.md,
        backgroundColor: colors.white,
        borderRadius: 14,
        padding: spacing.md,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    activityTopRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    activityTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    activityCaseId: {
        marginTop: 4,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginLeft: spacing.md,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },

    lawyerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginTop: spacing.md,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    lawyerName: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    lawyerMeta: {
        marginTop: 2,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    filedText: {
        marginTop: spacing.md,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    fab: {
        position: "absolute",
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.shadow,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
    },
});

export default ClientDashboard;