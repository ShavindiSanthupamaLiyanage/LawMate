import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import InitialTopNavbar from "../../../components/InitialTopNavbar";
import SearchBar from "../../../components/SearchBar";

import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";

import TransactionDetailsSheet, { TransactionDetails } from "../../../components/TransactionDetailsSheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";

type TxStatus = "Verified Payment" | "Pending Verification";

const transactions: TransactionDetails[] = [
    { id: "1", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Verified Payment" as TxStatus, amount: 5000 },
    { id: "2", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Verified Payment" as TxStatus, amount: 5000 },
    { id: "3", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Verified Payment" as TxStatus, amount: 5000 },
    { id: "4", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Pending Verification" as TxStatus, amount: 5000 },
    { id: "5", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Pending Verification" as TxStatus, amount: 5000 },
    { id: "6", title: "John Silva | APT-0500", date: "12 Nov 2025", status: "Verified Payment" as TxStatus, amount: 5000 },
];

const getStatusChipStyle = (status: TxStatus) => {
    if (status === "Verified Payment") return { bg: "#E7F8EE", text: "#16794C" };
    return { bg: "#FFF4D6", text: "#8A5A00" };
};

function TransactionCard({ item, onPress }: { item: TransactionDetails; onPress: () => void }) {
    const chip = getStatusChipStyle(item.status);

    return (
        <Pressable style={styles.txCard} onPress={onPress}>
            <View style={styles.txTopRow}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text style={styles.txDate}>{item.date}</Text>
            </View>

            <View style={styles.txBottomRow}>
                <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                    <Text style={[styles.chipText, { color: chip.text }]}>{item.status}</Text>
                </View>
                <Text style={styles.txAmount}>{`LKR ${item.amount.toLocaleString()}.00`}</Text>
            </View>
        </Pressable>
    );
}

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, "ViewTransactions">;
};

export default function ViewTransactions({ navigation }: Props) {
    const [searchQuery, setSearchQuery] = useState("");

    const [sheetOpen, setSheetOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<TransactionDetails | null>(null);

    const openSheet = (tx: TransactionDetails) => {
        setSelectedTx(tx);
        setSheetOpen(true);
    };

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return transactions;
        return transactions.filter(
            (t) =>
                t.title.toLowerCase().includes(q) ||
                t.status.toLowerCase().includes(q)
        );
    }, [searchQuery]);

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

                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TransactionCard item={item} onPress={() => openSheet(item)} />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />

                {/* ✅ Bottom Sheet */}
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

    searchWrap: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
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