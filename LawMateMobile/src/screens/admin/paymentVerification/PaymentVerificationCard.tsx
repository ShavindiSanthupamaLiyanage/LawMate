import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
} from "../../../config/theme";

export type PaymentStatus = "Pending" | "Approved" | "Rejected";

export interface PaymentVerificationItem {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    amount: string;
    paymentDate: string;
    status: PaymentStatus;
    transNo: string;
}

interface PaymentVerificationCardProps {
    item: PaymentVerificationItem;
    onPress: () => void;
}

const STATUS_CONFIG: Record<
    PaymentStatus,
    { label: string; badgeBg: string; textColor: string }
> = {
    Pending: {
        label: "Pending",
        badgeBg: "#FEF3C7",
        textColor: colors.warning,
    },
    Approved: {
        label: "Approved",
        badgeBg: "#D1FAE5",
        textColor: colors.success,
    },
    Rejected: {
        label: "Rejected",
        badgeBg: "#FEE2E2",
        textColor: colors.error,
    },
};

const PaymentVerificationCard: React.FC<PaymentVerificationCardProps> = ({
                                                                             item,
                                                                             onPress,
                                                                         }) => {
    const config = STATUS_CONFIG[item.status];

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.left}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.subText} numberOfLines={1}>
                        {item.email}
                    </Text>
                    <Text style={styles.transNo}>Trans ID: {item.transNo}</Text>
                </View>
            </View>

            <View style={styles.right}>
                <Text style={styles.amount}>{item.amount}</Text>
                <Text style={styles.date}>{item.paymentDate}</Text>
                <View style={[styles.badge, { backgroundColor: config.badgeBg }]}>
                    <Text style={[styles.badgeText, { color: config.textColor }]}>
                        {config.label}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default PaymentVerificationCard;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        alignItems: "center",
    },
    left: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: colors.primary + "20",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    subText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    transNo: {
        fontSize: fontSize.xs,
        color: colors.textLight,
    },
    right: {
        alignItems: "flex-end",
        marginLeft: spacing.sm,
    },
    amount: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 2,
    },
    date: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 3,
        borderRadius: borderRadius.full,
        minWidth: 70,
        alignItems: "center",
    },
    badgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },
});