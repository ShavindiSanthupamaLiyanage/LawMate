import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import InitialTopNavbar from "../../../components/InitialTopNavbar";

import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LawyerFinanceService } from "../../../services/lawyerFinanceService";
import { LawyerEarningsReportDto } from "../../../interfaces/lawyerFinance.interface";

type FilterMode = "THIS_MONTH" | "LAST_MONTH" | "THIS_WEEK";

const formatLKR = (value: number) =>
    `LKR ${value.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const PRESET_MAP: Record<FilterMode, "thismonth" | "lastmonth" | "thisweek"> = {
    THIS_MONTH: "thismonth",
    LAST_MONTH: "lastmonth",
    THIS_WEEK: "thisweek",
};

export default function EarningsReport({ navigation }: any) {
    const [mode, setMode] = useState<FilterMode>("THIS_MONTH");
    const [report, setReport] = useState<LawyerEarningsReportDto | null>(null);
    const [loading, setLoading] = useState(true);
    const insets = useSafeAreaInsets();

    const fetchReport = useCallback(async (selectedMode: FilterMode) => {
        try {
            setLoading(true);
            const data = await LawyerFinanceService.getReport({ preset: PRESET_MAP[selectedMode] });
            setReport(data);
        } catch (e) {
            console.error("Failed to load earnings report", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReport(mode); }, [mode, fetchReport]);

    const overviewBars = report
        ? [
            { label: formatLKR(report.verifiedAmount), value: report.verifiedAmount },
            { label: formatLKR(report.pendingAmount), value: report.pendingAmount },
            { label: formatLKR(report.transferredAmount), value: report.transferredAmount },
        ]
        : [];

    const maxBar = overviewBars.length > 0 ? Math.max(...overviewBars.map((b) => b.value), 1) : 1;

    const TAB_BAR_HEIGHT = -20;
    const bottomSpace = spacing.xxl + insets.bottom + TAB_BAR_HEIGHT + 20;

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                <InitialTopNavbar
                    title="Earnings Report"
                    onBack={() => navigation.goBack()}
                    showLogo={false}
                />

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.content, { paddingBottom: bottomSpace }]}
                >
                    {/* Filter row */}
                    <View style={styles.filterRow}>
                        {(["THIS_MONTH", "LAST_MONTH", "THIS_WEEK"] as FilterMode[]).map((m) => (
                            <Pressable
                                key={m}
                                style={[styles.filterBtn, mode === m && styles.filterBtnActive]}
                                onPress={() => setMode(m)}
                            >
                                <Text style={[styles.filterText, mode === m && styles.filterTextActive]}>
                                    {m === "THIS_MONTH" ? "This Month" : m === "LAST_MONTH" ? "Last Month" : "This Week"}
                                </Text>
                                <Ionicons
                                    name="chevron-down"
                                    size={14}
                                    color={mode === m ? colors.primary : colors.textSecondary}
                                />
                            </Pressable>
                        ))}
                    </View>

                    {loading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <>
                            {/* Earnings Overview */}
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Earnings Overview</Text>
                                {[
                                    { label: "Verified", bar: overviewBars[0] },
                                    { label: "Pending", bar: overviewBars[1] },
                                    { label: "Transferred", bar: overviewBars[2] },
                                ].map(({ label, bar }, idx) => (
                                    <View key={idx} style={styles.barRow}>
                                        <Text style={styles.barCategoryLabel}>{label}</Text>
                                        <View style={styles.barTrack}>
                                            <View
                                                style={[
                                                    styles.barFill,
                                                    { width: `${((bar?.value ?? 0) / maxBar) * 100}%` },
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.barLabel}>{bar?.label ?? "LKR 0.00"}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Info */}
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Info</Text>
                                <InfoRow label="Total Sessions" value={String(report?.totalSessions ?? 0)} />
                                <InfoRow label="Total Earnings" value={formatLKR(report?.totalEarnings ?? 0)} />
                                <InfoRow label="Verified Amount" value={formatLKR(report?.verifiedAmount ?? 0)} />
                                <InfoRow label="Pending" value={formatLKR(report?.pendingAmount ?? 0)} />
                                <InfoRow label="Transferred" value={formatLKR(report?.transferredAmount ?? 0)} />
                            </View>

                            {/* Top Clients */}
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>Top Clients (By Income)</Text>
                                {(report?.topClients ?? []).length === 0 ? (
                                    <Text style={styles.empty}>No data available.</Text>
                                ) : (
                                    report?.topClients.map((c, idx) => (
                                        <View key={idx} style={styles.clientRow}>
                                            <Text style={styles.clientName}>{c.clientId}</Text>
                                            <Text style={styles.clientAmount}>{formatLKR(c.amount)}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </ScreenWrapper>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },

    centered: {
        paddingVertical:
        spacing.xxl,
        alignItems: "center"
    },
    content: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        gap: spacing.md,
    },

    filterRow: {
        flexDirection: "row",
        gap: spacing.md,
    },

    filterBtn: {
        flex: 1,
        height: 42,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.borderLight ?? colors.border,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    filterBtnActive: {
        borderColor: colors.primary,
    },

    filterText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    filterTextActive: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.borderLight ?? colors.border,
        padding: spacing.md,
    },

    cardTitle: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
    },

    barCategoryLabel: {
        width: 70,
        fontSize:
        fontSize.xs,
        color: colors.textSecondary }
    ,

    barRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.sm,
        gap: spacing.md,
    },

    barTrack: {
        flex: 1,
        height: 10,
        borderRadius: 999,
        backgroundColor: colors.borderLight ?? colors.border,
        overflow: "hidden",
    },

    barFill: {
        height: "100%",
        backgroundColor: colors.primary,
        borderRadius: 999,
    },

    barLabel: {
        width: 95,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
        textAlign: "right",
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },

    infoLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    infoValue: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },

    clientRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },

    clientName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    clientAmount: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },

    empty: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: "center",
        paddingVertical: spacing.md
    },
});