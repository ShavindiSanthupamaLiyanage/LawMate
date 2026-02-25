import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

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

type TxStatus = "Verified Payment" | "Pending Verification";

const transactions: TransactionDetails[] = [
    {
        id: "1",
        title: "John Silva | APT-0500",
        date: "12 Nov 2025",
        status: "Verified Payment" as TxStatus,
        amount: 5000,
    },
    {
        id: "2",
        title: "John Silva | APT-0500",
        date: "12 Nov 2025",
        status: "Pending Verification" as TxStatus,
        amount: 5000,
    },
    {
        id: "3",
        title: "John Silva | APT-0500",
        date: "12 Nov 2025",
        status: "Verified Payment" as TxStatus,
        amount: 5000,
    },
    {
        id: "4",
        title: "John Silva | APT-0500",
        date: "12 Nov 2025",
        status: "Verified Payment" as TxStatus,
        amount: 5000,
    },
];

const formatLKR = (value: number) => `LKR ${value.toFixed(2)}`;

const getStatusChipStyle = (status: TxStatus) => {
    if (status === "Verified Payment") {
        return { bg: "#E7F8EE", text: "#16794C" };
    }
    return { bg: "#FFF4D6", text: "#8A5A00" };
};

export default function FinanceMain() {
    // ✅ MUST use LawyerFinanceStackParamList (NOT RootStackParamList)
    const navigation =
        useNavigation<NativeStackNavigationProp<LawyerFinanceStackParamList>>();

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);

    const openSheet = (tx: TransactionDetails) => {
        setSelectedTx(tx);
        setSheetOpen(true);
    };

    return (
        <LawyerLayout userName="Kavindi Dilhara">
            <View style={styles.wrapper}>
                {/* Earning Summary Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Earning Summery</Text>

                    <View style={styles.row}>
                        <Text style={styles.label}>Total Earnings</Text>
                        <Text style={styles.value}>{formatLKR(152000)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>This Month</Text>
                        <Text style={styles.value}>{formatLKR(100000)}</Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Pending Verification</Text>
                        <Text style={styles.value}>{formatLKR(10000)}</Text>
                    </View>

                    <View style={[styles.row, styles.rowLast]}>
                        <Text style={styles.label}>Transferred to Bank</Text>
                        <Text style={styles.value}>{formatLKR(120000)}</Text>
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

                {transactions.map((tx) => {
                    const chip = getStatusChipStyle(tx.status);

                    return (
                        <Pressable
                            key={tx.id}
                            style={styles.txCard}
                            onPress={() => openSheet(tx)}
                        >
                            <View style={styles.txTopRow}>
                                <Text style={styles.txTitle}>{tx.title}</Text>
                                <Text style={styles.txDate}>{tx.date}</Text>
                            </View>

                            <View style={styles.txBottomRow}>
                                <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                                    <Text style={[styles.chipText, { color: chip.text }]}>
                                        {tx.status}
                                    </Text>
                                </View>

                                <Text style={styles.txAmount}>
                                    {`LKR ${tx.amount.toLocaleString()}.00`}
                                </Text>
                            </View>
                        </Pressable>
                    );
                })}

                {/* View All */}
                <Pressable
                    onPress={() => navigation.navigate("ViewTransactions")}
                    style={styles.viewAllWrap}
                >
                    <Text style={styles.viewAllText}>VIEW ALL</Text>
                </Pressable>

                {/* Bottom Sheet */}
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