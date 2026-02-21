import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
} from "../../../config/theme";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Toast, { ToastType } from "../../../components/Toast";
import UploadCard from "../../../components/UploadCard";
import Button from "../../../components/Button";
import { PaymentVerificationStackParamList } from "./PaymentVerificationStack";
import { PaymentStatus } from "./PaymentVerificationCard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
    navigation: NativeStackNavigationProp<
        PaymentVerificationStackParamList,
        "PaymentVerificationView"
    >;
    route: RouteProp<PaymentVerificationStackParamList, "PaymentVerificationView">;
};

const REJECT_REASONS = [
    "Invalid payment slip",
    "Amount mismatch",
    "Wrong bank details",
    "Duplicate payment",
    "Other",
];

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentVerificationViewScreen({
                                                          navigation,
                                                          route,
                                                      }: Props) {
    const { item } = route.params;

    const [status, setStatus] = useState<PaymentStatus>(item.status);
    const [showRejectSheet, setShowRejectSheet] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState("");

    const [toast, setToast] = useState<{
        visible: boolean;
        message: string;
        type: ToastType;
    }>({ visible: false, message: "", type: "success" });

    const showToast = (message: string, type: ToastType) => {
        setToast({ visible: true, message, type });
    };

    const hideToast = () => {
        setToast((prev) => ({ ...prev, visible: false }));
    };

    const handleAccept = () => {
        setStatus("Approved");
        showToast("Payment has been Accepted.", "success");
    };

    const handleRejectConfirm = () => {
        if (!selectedReason) return;
        setShowRejectSheet(false);
        setStatus("Rejected");
        showToast("Payment has been Rejected.", "error");
        setSelectedReason(null);
        setCustomReason("");
    };

    const isPending = status === "Pending";

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Verification</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* User Info */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                        <Text style={styles.userTrans}>Trans No. {item.transNo}</Text>
                    </View>
                </View>

                {/* Payment Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <InfoRow label="Amount" value={item.amount} />
                    <InfoRow label="Payment Date" value={item.paymentDate} />
                    <InfoRow label="Payment Method" value="Bank Transfer" />
                    <InfoRow label="Reference Number" value="BEF-75124578" />
                </View>

                {/* Bank Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Information</Text>
                    <InfoRow label="Bank Name" value="National Bank" />
                    <InfoRow label="Account Number" value="••••••••••45" />
                </View>

                {/* Documents */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Documents to be called.</Text>
                    <View style={styles.documentsRow}>
                        <UploadCard
                            title="Upload Payment Slip"
                            fileName="Payment Slip.png"
                            onPress={() => {}}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Action Buttons — only visible while still Pending */}
            {isPending && (
                <View style={styles.actionContainer}>
                    <Button
                        title="ACCEPT"
                        variant="primary"
                        onPress={handleAccept}
                    />
                    <Button
                        title="REJECT"
                        variant="transparent"
                        onPress={() => setShowRejectSheet(true)}
                    />
                </View>
            )}

            {/* Reject Bottom Sheet Modal */}
            <Modal
                visible={showRejectSheet}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRejectSheet(false)}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={() => setShowRejectSheet(false)}
                />
                <View style={styles.sheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.sheetHeader}>
                        <TouchableOpacity onPress={() => setShowRejectSheet(false)}>
                            <Text style={styles.sheetBack}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleRejectConfirm}
                            disabled={!selectedReason}
                        >
                            <Text
                                style={[
                                    styles.sheetConfirm,
                                    !selectedReason && { opacity: 0.4 },
                                ]}
                            >
                                Confirm
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sheetBody}>
                        Are you sure you want to reject this payment?{"\n"}This will notify
                        the client / lawyer.{"\n"}Please select the reject reason.
                    </Text>

                    {/* Reason Options */}
                    {REJECT_REASONS.map((reason) => (
                        <TouchableOpacity
                            key={reason}
                            style={styles.reasonRow}
                            onPress={() => setSelectedReason(reason)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.radioOuter,
                                    selectedReason === reason && styles.radioOuterActive,
                                ]}
                            >
                                {selectedReason === reason && (
                                    <View style={styles.radioInner} />
                                )}
                            </View>
                            <Text style={styles.reasonText}>{reason}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Custom reason input */}
                    {selectedReason === "Other" && (
                        <TextInput
                            style={styles.reasonInput}
                            placeholder="Please describe the reason..."
                            placeholderTextColor={colors.textLight}
                            value={customReason}
                            onChangeText={setCustomReason}
                            multiline
                        />
                    )}
                </View>
            </Modal>

            {/* Toast */}
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onDismiss={hideToast}
            />
        </ScreenWrapper>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
    },
    backBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.white,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.primary + "20",
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    userName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    userEmail: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    userTrans: {
        fontSize: fontSize.xs,
        color: colors.textLight,
        marginTop: 2,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
    },
    infoLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    documentsRow: {
        flexDirection: "row",
    },
    actionContainer: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
        paddingTop: spacing.sm,
        backgroundColor: colors.background,
        gap: spacing.sm,
    },
    // Bottom Sheet
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.md,
        paddingBottom: spacing.xxl,
        minHeight: 360,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.borderLight,
        alignSelf: "center",
        marginBottom: spacing.md,
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    sheetBack: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    sheetConfirm: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    sheetBody: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
        marginBottom: spacing.md,
    },
    reasonRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.md,
    },
    radioOuterActive: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    reasonText: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    reasonInput: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        minHeight: 80,
        textAlignVertical: "top",
    },
});