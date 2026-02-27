import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import InitialTopNavbar from "../../../components/InitialTopNavbar";

import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterMode = "THIS_MONTH" | "CUSTOM";

export default function EarningsReport({ navigation }: any) {
    const [mode, setMode] = useState<FilterMode>("THIS_MONTH");
    const insets = useSafeAreaInsets();

    // TEMP dummy data (later replace with API results)
    const report = useMemo(() => {
        if (mode === "CUSTOM") {
            return {
                overviewBars: [
                    { label: "LKR 29,000.00", value: 29000 },
                    { label: "LKR 21,000.00", value: 21000 },
                    { label: "LKR 20,000.00", value: 20000 },
                ],
                info: {
                    totalSessions: "1000",
                    totalEarnings: "LKR 100,000.00",
                    verifiedThisMonth: "LKR 10,000.00",
                    pending: "LKR 12,000.00",
                },
                topClients: [
                    { name: "John Silva", amount: "LKR 15,200.00" },
                    { name: "Maya Perera", amount: "LKR 10,000.00" },
                    { name: "Alex Fernando", amount: "LKR 10,000.00" },
                    { name: "Hasara Moris", amount: "LKR 12,000.00" },
                ],
            };
        }

        return {
            overviewBars: [
                { label: "LKR 29,000.00", value: 29000 },
                { label: "LKR 21,000.00", value: 21000 },
                { label: "LKR 20,000.00", value: 20000 },
            ],
            info: {
                totalSessions: "LKR 15,200.00",
                totalEarnings: "LKR 100,000.00",
                verifiedThisMonth: "LKR 10,000.00",
                pending: "LKR 12,000.00",
            },
            topClients: [
                { name: "John Silva", amount: "LKR 15,200.00" },
                { name: "Maya Perera", amount: "LKR 10,000.00" },
                { name: "Alex Fernando", amount: "LKR 10,000.00" },
                { name: "Hasara Moris", amount: "LKR 12,000.00" },
            ],
        };
    }, [mode]);

    const maxBar = Math.max(...report.overviewBars.map((b) => b.value));


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

                {/* ✅ SCROLL + ✅ bottom padding space */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.content, { paddingBottom: bottomSpace }]}
                >
                    {/* Filter row */}
                    <View style={styles.filterRow}>
                        <Pressable
                            style={[styles.filterBtn, mode === "THIS_MONTH" && styles.filterBtnActive]}
                            onPress={() => setMode("THIS_MONTH")}
                        >
                            <Text style={[styles.filterText, mode === "THIS_MONTH" && styles.filterTextActive]}>
                                This Month
                            </Text>
                            <Ionicons
                                name="chevron-down"
                                size={16}
                                color={mode === "THIS_MONTH" ? colors.primary : colors.textSecondary}
                            />
                        </Pressable>

                        <Pressable
                            style={[styles.filterBtn, mode === "CUSTOM" && styles.filterBtnActive]}
                            onPress={() => setMode("CUSTOM")}
                        >
                            <Text style={[styles.filterText, mode === "CUSTOM" && styles.filterTextActive]}>
                                Custom
                            </Text>
                            <Ionicons
                                name="calendar-outline"
                                size={16}
                                color={mode === "CUSTOM" ? colors.primary : colors.textSecondary}
                            />
                        </Pressable>
                    </View>

                    {/* Earnings Overview */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Earnings Overview</Text>

                        {report.overviewBars.map((b, idx) => {
                            const w = (b.value / maxBar) * 100;
                            return (
                                <View key={idx} style={styles.barRow}>
                                    <View style={styles.barTrack}>
                                        <View style={[styles.barFill, { width: `${w}%` }]} />
                                    </View>
                                    <Text style={styles.barLabel}>{b.label}</Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Info */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Info</Text>

                        <InfoRow label="Total Sessions" value={report.info.totalSessions} />
                        <InfoRow label="Total Earnings" value={report.info.totalEarnings} />
                        <InfoRow label="Verified this month" value={report.info.verifiedThisMonth} />
                        <InfoRow label="Pending" value={report.info.pending} />
                    </View>

                    {/* Top Clients */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Top Clients (By Income)</Text>

                        {report.topClients.map((c, idx) => (
                            <View key={idx} style={styles.clientRow}>
                                <Text style={styles.clientName}>{c.name}</Text>
                                <Text style={styles.clientAmount}>{c.amount}</Text>
                            </View>
                        ))}
                    </View>
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
});