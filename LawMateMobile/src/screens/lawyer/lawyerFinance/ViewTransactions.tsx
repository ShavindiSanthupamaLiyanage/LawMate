import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import InitialTopNavbar from "../../../components/InitialTopNavbar";
import SearchBar from "../../../components/SearchBar";
import TransactionDetailsSheet, { TransactionDetails } from "../../../components/TransactionDetailsSheet";

import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LawyerFinanceStackParamList } from "./LawyerFinanceStack";
import { LawyerFinanceService } from "../../../services/lawyerFinanceService";
import { LawyerFinanceTransactionItemDto } from "../../../interfaces/lawyerFinance.interface";

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

function TransactionCard({ item, onPress }: { item: LawyerFinanceTransactionItemDto; onPress: () => void }) {
    const chip = getStatusChipStyle(item.status);
    const details = toTransactionDetails(item);
    return (
        <Pressable style={styles.txCard} onPress={onPress}>
            <View style={styles.txTopRow}>
                <Text style={styles.txTitle}>{details.title}</Text>
                <Text style={styles.txDate}>{details.date}</Text>
            </View>
            <View style={styles.txBottomRow}>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                    <Text style={[styles.chipText, { color: chip.text }]}>{item.status}</Text>
                </View>
                <Text style={styles.txAmount}>{`LKR ${item.amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`}</Text>
            </View>
        </Pressable>
    );
}

type Props = {
    navigation: NativeStackNavigationProp<LawyerFinanceStackParamList, "ViewTransactions">;
};

export default function ViewTransactions({ navigation }: Props) {
    const [allTransactions, setAllTransactions] = useState<LawyerFinanceTransactionItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await LawyerFinanceService.getTransactions();
            setAllTransactions(data);
        } catch (e) {
            console.error("Failed to load transactions", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    // Client-side search filter (referenceNo + clientDisplay)
    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return allTransactions;
        return allTransactions.filter(
            (t) =>
                t.referenceNo.toLowerCase().includes(q) ||
                t.clientDisplay.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q)
        );
    }, [searchQuery, allTransactions]);

    const openSheet = (item: LawyerFinanceTransactionItemDto) => {
        setSelectedTx(toTransactionDetails(item));
        setSheetOpen(true);
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                <InitialTopNavbar
                    title="View Transactions"
                    onBack={() => navigation.goBack()}
                    showLogo={false}
                />

                <View style={styles.searchWrap}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search here..."
                        onSearch={() => {}}
                        onClear={() => setSearchQuery("")}
                    />
                </View>

                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => String(item.paymentId)}
                        renderItem={({ item }) => (
                            <TransactionCard item={item} onPress={() => openSheet(item)} />
                        )}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.empty}>No transactions found.</Text>
                        }
                    />
                )}

                <TransactionDetailsSheet
                    visible={sheetOpen}
                    item={selectedTx}
                    onClose={() => setSheetOpen(false)}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },

    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    searchWrap: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },

    empty: {
        textAlign: "center",
        color: colors.textSecondary,
        marginTop: spacing.xl
    },

    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
    },

    txCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight ?? colors.border,
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
});