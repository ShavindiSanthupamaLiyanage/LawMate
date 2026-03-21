import React, {useCallback, useEffect, useState} from "react";
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from "react-native";

import LawyerLayout from "../../../components/LawyerLayout";
import Button from "../../../components/Button";
import TransactionDetailsSheet, {
    TransactionDetails,
} from "../../../components/TransactionDetailsSheet";

import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
} from "../../../config/theme";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LawyerFinanceStackParamList } from "./LawyerFinanceStack";
import {LawyerStackParamList} from "../../../types";
import {LawyerFinanceDashboardDto, LawyerFinanceTransactionItemDto} from "../../../interfaces/lawyerFinance.interface";
import {LawyerFinanceService} from "../../../services/lawyerFinanceService";

const formatLKR = (value: number) =>
    `LKR ${value.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const getStatusChipStyle = (status: string) => {
    if (status === "Verified Payment") return { bg: "#E7F8EE", text: "#16794C" };
    if (status === "Pending Verification") return { bg: "#FFF4D6", text: "#8A5A00" };
    return { bg: "#FFE4E4", text: "#B91C1C" };
};

const toTransactionDetails = (item: LawyerFinanceTransactionItemDto): TransactionDetails => ({
    id: String(item.paymentId),
    title: `${item.clientDisplay} | ${item.referenceNo}`,
    date: new Date(item.transactionDate).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    }),
    status: item.status as TransactionDetails["status"],
    amount: item.amount,
});

export default function FinanceMain() {
    const navigation =
        useNavigation<NativeStackNavigationProp<LawyerFinanceStackParamList>>();

    const parentNavigation =
        useNavigation<NativeStackNavigationProp<LawyerStackParamList>>();

    const [dashboard, setDashboard] = useState<LawyerFinanceDashboardDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            setLoading(true);
            const data = await LawyerFinanceService.getDashboard();
            setDashboard(data);
        } catch (e) {
            console.error("Failed to load finance dashboard", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);


    const openSheet = (tx: TransactionDetails) => {
        setSelectedTx(tx);
        setSheetOpen(true);
    };

    if (loading) {
        return (
            <LawyerLayout title="Finance Details"
                          onProfilePress={() => parentNavigation.navigate("LawyerProfile")}>
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </LawyerLayout>
        );
    }

    return (
        <LawyerLayout title="Finance Details"
                      onProfilePress={() => parentNavigation.navigate("LawyerProfile")}>
            <View style={styles.wrapper}>
                {/* Earning Summary Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Earning Summary</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Total Earnings</Text>
                        <Text style={styles.value}>{formatLKR(dashboard?.totalEarnings ?? 0)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>This Month</Text>
                        <Text style={styles.value}>{formatLKR(dashboard?.thisMonth ?? 0)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Pending Verification</Text>
                        <Text style={styles.value}>{formatLKR(dashboard?.pendingVerification ?? 0)}</Text>
                    </View>
                    <View style={[styles.row, styles.rowLast]}>
                        <Text style={styles.label}>Transferred to Bank</Text>
                        <Text style={styles.value}>{formatLKR(dashboard?.transferredToBank ?? 0)}</Text>
                    </View>

                    <Button
                        title="VIEW REPORTS"
                        variant="primary"
                        onPress={() => navigation.navigate("EarningsReport")}
                        style={styles.primaryBtn}
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                </View>

                {(dashboard?.recentTransactions ?? []).map((tx) => {
                    const item = toTransactionDetails(tx);
                    const chip = getStatusChipStyle(tx.status);
                    return (
                        <Pressable key={item.id} style={styles.txCard} onPress={() => openSheet(item)}>
                            <View style={styles.txTopRow}>
                                <Text style={styles.txTitle}>{item.title}</Text>
                                <Text style={styles.txDate}>{item.date}</Text>
                            </View>
                            <View style={styles.txBottomRow}>
                                <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                                    <Text style={[styles.chipText, { color: chip.text }]}>{tx.status}</Text>
                                </View>
                                <Text style={styles.txAmount}>{formatLKR(tx.amount)}</Text>
                            </View>
                        </Pressable>
                    );
                })}

                <Pressable onPress={() => navigation.navigate("ViewTransactions")} style={styles.viewAllWrap}>
                    <Text style={styles.viewAllText}>VIEW ALL</Text>
                </Pressable>

                <TransactionDetailsSheet
                    visible={sheetOpen}
                    item={selectedTx}
                    onClose={() => setSheetOpen(false)}
                />
            </View>
        </LawyerLayout>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    wrapper: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },

    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: (colors as any).borderLight ?? colors.border,
        width: "100%",
    },

    cardTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
    },

    rowLast: {
        marginBottom: spacing.md,
    },

    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    value: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },

    primaryBtn: {
        marginTop: spacing.sm,
        alignSelf: "center",
        width: "65%",
    },

    sectionHeader: {
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },

    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },

    txCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: (colors as any).borderLight ?? colors.border,
        marginBottom: spacing.md,
    },

    txTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: spacing.sm,
    },

    txTitle: {
        flex: 1,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginRight: spacing.sm,
    },

    txDate: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    txBottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.full,
    },

    chipText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },

    txAmount: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: "#16A34A",
    },

    viewAllWrap: {
        alignSelf: "center",
        marginTop: spacing.md,
        marginBottom: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: borderRadius.full,
    },

    viewAllText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
        fontSize: fontSize.sm,
    },
});