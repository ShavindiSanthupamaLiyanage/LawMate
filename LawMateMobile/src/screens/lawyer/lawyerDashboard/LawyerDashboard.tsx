import React, { useEffect, useState, useMemo } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { G, Path, Circle, Text as SvgText } from "react-native-svg";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import LawyerLayout from "../../../components/LawyerLayout";
import { LawyerDashboardService, DonutItem, LawyerDashboardDto, LawyerActivityDto } from "../../../services/lawyerDashboardService";

/* ----------------------------- */
/* Donut Chart                   */
/* ----------------------------- */
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

const DonutChart: React.FC<{ size?: number; strokeWidth?: number; totalText: string; data: DonutItem[] }> = ({
    size = 150,
    strokeWidth = 18,
    totalText,
    data,
}) => {
    const r = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
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

/* ----------------------------- */
/* Legend & Activity Card         */
/* ----------------------------- */
const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendText}>{label}</Text>
    </View>
);

type ActivityStatus = "Approved" | "Pending";

const statusColors = (status: ActivityStatus) => {
    if (status === "Approved") return { bg: "#E8F0FF", fg: "#2F6BFF" };
    return { bg: "#EAF8EE", fg: "#2E9B4B" };
};

const ActivityCard: React.FC<LawyerActivityDto & { status: ActivityStatus }> = ({
    title,
    caseNumber,
    status,
    clientName,
    filedDate,
    clientImage,
}) => {
    const st = statusColors(status);
    return (
        <View style={styles.activityCard}>
            <View style={styles.activityTopRow}>
                <View>
                    <Text style={styles.activityTitle}>{title}</Text>
                    <Text style={styles.activityCaseId}>{caseNumber}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.fg }]}>{status}</Text>
                </View>
            </View>
            <View style={styles.lawyerRow}>
                <Image
                    source={clientImage ? { uri: clientImage } : { uri: "https://i.pravatar.cc/100?img=12" }}
                    style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.lawyerName}>{clientName}</Text>
                </View>
            </View>
            <Text style={styles.filedText}>Filed: {filedDate}</Text>
        </View>
    );
};

/* ----------------------------- */
/* Main Dashboard Component       */
/* ----------------------------- */
const LawyerDashboard: React.FC<{ lawyerId: string }> = ({ lawyerId }) => {
    const navigation = useNavigation<any>();
    const [dashboard, setDashboard] = useState<LawyerDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const data = await LawyerDashboardService.getDashboard(lawyerId);
            setDashboard(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const donutData: DonutItem[] = useMemo(() => {
        if (!dashboard) return [];
        const colorsPalette = ["#6D7CFF", "#FF8C86", "#26C6DA", "#FFB74D", "#3F51B5"];
        return dashboard.appointmentBreakdown.map((item, idx) => ({
            label: item.category,
            value: item.count,
            color: colorsPalette[idx % colorsPalette.length],
        }));
    }, [dashboard]);

    return (
        <LawyerLayout onProfilePress={() => navigation.getParent()?.navigate("LawyerProfile")}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.md }}>
                <View style={styles.body}>
                    {/* Gradient hero card */}
                    <LinearGradient colors={[colors.primary, "#6D49FF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroCard}>
                        <View style={styles.heroStatsRow}>
                            <View style={[styles.heroStatTile, { backgroundColor: "#BFD9FF" }]}>
                                <Text style={styles.heroStatNumber}>{dashboard?.summary.totalAppointments ?? 0}</Text>
                                <Text style={styles.heroStatLabel}>Total Appointments</Text>
                            </View>
                            <View style={[styles.heroStatTile, { backgroundColor: "#CFF7D0" }]}>
                                <Text style={styles.heroStatNumber}>${dashboard?.summary.totalRevenue.toFixed(2) ?? 0}</Text>
                                <Text style={styles.heroStatLabel}>Total Earnings</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Total Appointments Donut */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Total Appointments</Text>
                        <Text style={styles.sectionSub}>Since - 2025</Text>
                        <View style={styles.card}>
                            <DonutChart totalText={`${dashboard?.summary.totalAppointments ?? 0}`} data={donutData} />
                            <View style={styles.legend}>
                                {donutData.map((d) => (
                                    <LegendItem key={d.label} color={d.color} label={d.label} />
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* My Activity */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View>
                                <Text style={styles.sectionTitle}>My Activity</Text>
                            </View>
                        </View>

                        {dashboard?.recentActivities.length === 0 ? (
                            <Text style={{ textAlign: "center", marginTop: spacing.md, color: colors.textSecondary }}>
                                No activity yet
                            </Text>
                        ) : (
                            dashboard?.recentActivities.map((act, idx) => (
                                <ActivityCard key={idx} {...act} status={act.status as ActivityStatus} />
                            ))
                        )}
                    </View>
                </View>
            </ScrollView>
        </LawyerLayout>
    );
};


/* ----------------------------- */
/* Styles                         */
/* ----------------------------- */
const styles = StyleSheet.create({
    body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    heroCard: { borderRadius: 18, padding: spacing.lg, marginBottom: spacing.lg },
    heroSmall: { color: colors.white, fontSize: fontSize.sm, opacity: 0.9 },
    heroName: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold, marginTop: 2 },
    heroStatsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xs},
    heroStatTile: { flex: 1, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
    heroStatNumber: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.textPrimary },
    heroStatLabel: { marginTop: 4, fontSize: fontSize.xs, color: colors.textSecondary },

    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    sectionSub: { marginTop: 4, fontSize: fontSize.xs, color: colors.textSecondary },
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
    legend: { gap: 10, paddingLeft: spacing.md },
    legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { fontSize: fontSize.sm, color: colors.textSecondary },

    sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    viewAll: { fontSize: fontSize.sm, color: colors.primary, fontWeight: fontWeight.medium },

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
    activityTopRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
    activityTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    activityCaseId: { marginTop: 4, fontSize: fontSize.xs, color: colors.textSecondary },
    statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginLeft: spacing.md },
    statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

    lawyerRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    lawyerName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
    lawyerMeta: { marginTop: 2, fontSize: fontSize.xs, color: colors.textSecondary },
    filedText: { marginTop: spacing.md, fontSize: fontSize.xs, color: colors.textSecondary },
});

export default LawyerDashboard;