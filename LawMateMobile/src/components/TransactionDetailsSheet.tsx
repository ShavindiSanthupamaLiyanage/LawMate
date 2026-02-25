import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../config/theme";

type TxStatus = "Verified Payment" | "Pending Verification";

export type TransactionDetails = {
    id: string;
    title: string;      // e.g. "John Silva | APT-0500"
    date: string;       // e.g. "12 Nov 2025"
    amount: number;     // e.g. 5000
    status: TxStatus;

    // Optional details for the sheet (add later when backend comes)
    clientName?: string;
    email?: string;
    appointment?: string; // e.g. "10 Nov 2025, 10.00 AM - 10.30 PM"
};

type Props = {
    visible: boolean;
    onClose: () => void;
    item: TransactionDetails | null;
};

const getStatusChipStyle = (status: TxStatus) => {
    if (status === "Verified Payment") return { bg: "#E7F8EE", text: "#16794C" };
    return { bg: "#FFF4D6", text: "#8A5A00" };
};

export default function TransactionDetailsSheet({ visible, onClose, item }: Props) {
    if (!item) return null;

    const chip = getStatusChipStyle(item.status);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            {/* Overlay */}
            <Pressable style={styles.overlay} onPress={onClose} />

            {/* Sheet */}
            <View style={styles.sheet}>
                {/* Drag Handle */}
                <View style={styles.handle} />

                {/* Header Row */}
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Appointment Information</Text>

                    <Pressable onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </Pressable>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Row label="Client" value={item.clientName ?? item.title.split("|")[0].trim()} />
                    <Row label="Email" value={item.email ?? "—"} />
                    <Row label="Appointment" value={item.appointment ?? item.date} />
                    <Row label="Amount" value={`LKR ${item.amount.toLocaleString()}.00`} />

                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Status</Text>
                        <View style={[styles.chip, { backgroundColor: chip.bg }]}>
                            <Text style={[styles.chipText, { color: chip.text }]}>{item.status}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
    },

    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight ?? colors.border,
    },

    handle: {
        alignSelf: "center",
        width: 44,
        height: 5,
        borderRadius: 999,
        backgroundColor: colors.borderLight ?? colors.border,
        marginBottom: spacing.sm,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: spacing.sm,
    },

    headerTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
    },

    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
    },

    content: {
        paddingTop: spacing.sm,
        gap: spacing.sm,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
    },

    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
        width: "40%",
    },

    value: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
        width: "60%",
        textAlign: "right",
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
});