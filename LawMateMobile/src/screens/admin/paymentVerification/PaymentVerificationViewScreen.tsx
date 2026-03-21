import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Modal, TextInput, ActivityIndicator, Image,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";
import UploadCard from "../../../components/UploadCard";
import Button from "../../../components/Button";
import { PaymentVerificationStackParamList } from "./PaymentVerificationStack";
import { PaymentStatus } from "./PaymentVerificationCard";
import AdminLayout from "../../../components/AdminLayout";
import { paymentVerificationService } from "../../../services/paymentVerificationService";
import {PaymentDetailDto} from "../../../interfaces/paymentVerification.interface";
import {useToast} from "../../../context/ToastContext";

type Props = {
    navigation: NativeStackNavigationProp<PaymentVerificationStackParamList, "PaymentVerificationView">;
    route: RouteProp<PaymentVerificationStackParamList, "PaymentVerificationView">;
};

const REJECT_REASONS = [
    "Invalid payment slip",
    "Payment slip unclear or unreadable",
    "Amount mismatch",
    "Payment slip already used",
    "Expired payment slip",
    "Wrong bank account details",
    "Duplicate payment submission",
    "Payment made to incorrect account",
    "Payment slip not from a recognized bank",
];

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

export default function PaymentVerificationViewScreen({ navigation, route }: Props) {
    const { item } = route.params;

    const [detail, setDetail] = useState<PaymentDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [status, setStatus] = useState<PaymentStatus>(item.status);
    const [showRejectSheet, setShowRejectSheet] = useState(false);
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [customReason, setCustomReason] = useState("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            console.log('[ViewScreen] item.lawyerId:', item.lawyerId,
                '| item.paymentType:', item.paymentType,
                '| item.clientId:', item.clientId);
            try {
                setLoading(true);
                setFetchError(null);
                const data = await paymentVerificationService.getDetails(
                    item.lawyerId,
                    item.paymentType,
                    item.clientId ?? null
                );
                setDetail(data);
                const mappedStatus: PaymentStatus =
                    data.verificationStatus === 0 ? "Pending"
                        : data.verificationStatus === 1 ? "Approved"
                            : "Rejected";
                setStatus(mappedStatus);
            } catch (err: any) {
                setFetchError(err.message ?? "Failed to load payment details.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [item.lawyerId, item.paymentType, item.clientId]);

    const { showSuccess, showError, showWarning } = useToast();
    const formatDate = (iso: string | null) =>
        iso
            ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
            : "—";
    const formatAmount = (amount: number) =>
        `LKR ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

    const isBooking = detail?.paymentType === 'Booking';

    const displayName   = detail?.lawyerName  ?? item.name;
    const displayEmail  = detail?.lawyerEmail ?? "—";
    const displayTransNo = detail?.transactionId ?? item.transNo;
    const displayAmount  = detail ? formatAmount(detail.amount) : item.amount;
    const displayDate    = detail ? formatDate(detail.paymentDate) : item.paymentDate;

    const handleAccept = async () => {
        console.log('[handleAccept] FIRED — detail:', detail?.paymentType, '| bookingId:', detail?.bookingId);
        try {
            if (!detail) return;

            if (detail.paymentType === 'Booking') {
                if (!detail.bookingId) {
                    showError("Booking ID missing");
                    return;
                }
                await paymentVerificationService.updateBookingPayment({
                    bookingId: detail.bookingId,
                    lawyerId:  detail.lawyerId,
                    clientId:  detail.clientId,
                    status:    'Verified',
                });
            } else {
                await paymentVerificationService.updateMembershipPayment({
                    lawyerId: detail.lawyerId,
                    status:   'Verified',
                });
            }
            setStatus("Approved");
            showSuccess("Payment has been Accepted.");

        } catch (err: any) {
            showError("Failed to accept payment");
        }
    };

    const handleRejectConfirm = async () => {
        if (!selectedReason || !detail) return;

        const reason = selectedReason === "Other" ? customReason.trim() : selectedReason;

        if (!reason) {
            showWarning("Please provide a rejection reason");
            return;
        }
        try {
            if (detail.paymentType === 'Booking') {
                if (!detail.bookingId) {
                    showError("Booking ID missing");
                    return;
                }
                await paymentVerificationService.updateBookingPayment({
                    bookingId:       detail.bookingId,
                    lawyerId:        detail.lawyerId,
                    clientId:        detail.clientId,
                    status:          'Rejected',
                    rejectionReason: reason,
                });
            } else {
                await paymentVerificationService.updateMembershipPayment({
                    lawyerId:        detail.lawyerId,
                    status:          'Rejected',
                    rejectionReason: reason,
                });
            }
            setShowRejectSheet(false);
            setStatus("Rejected");
            setSelectedReason(null);
            setCustomReason("");
            showSuccess("Payment has been Rejected.");

        } catch (err: any) {
            showError("Failed to reject payment");
        }
    };

    const isPending = status === "Pending";

    return (
        <AdminLayout
            title="View Payment Details"
            showBackButton
            onBackPress={() => navigation.goBack()}
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            {loading ? (
                <View style={styles.centeredState}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : fetchError ? (
                <View style={styles.centeredState}>
                    <Text style={styles.errorText}>{fetchError}</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.retryLink}>Go back</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {/* User Info */}
                        <View style={styles.userCard}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {displayName.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.userName}>{displayName}</Text>
                                <Text style={styles.userEmail}>{displayEmail}</Text>
                                <Text style={styles.userTrans}>Trans No. {displayTransNo}</Text>
                            </View>
                        </View>

                        {/* Payment Information */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Payment Information</Text>
                            <InfoRow label="Payment Type" value={detail?.paymentType ?? "—"} />
                            <InfoRow label="Amount" value={displayAmount} />
                            <InfoRow label="Payment Date" value={displayDate} />
                            <InfoRow label="Transaction ID" value={displayTransNo} />
                            {detail?.verificationStatus !== 0 && (
                                <>
                                    <InfoRow label="Verified By" value={detail?.verifiedBy ?? "—"} />
                                    <InfoRow label="Verified At" value={formatDate(detail?.verifiedAt ?? null)} />
                                </>
                            )}
                            {status === "Rejected" && detail?.rejectionReason && (
                                <InfoRow label="Rejection Reason" value={detail.rejectionReason} />
                            )}
                        </View>

                        {/* Lawyer Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Lawyer Details</Text>
                            <InfoRow label="Lawyer ID"    value={detail?.lawyerId    ?? "—"} />
                            <InfoRow label="Lawyer Name"  value={detail?.lawyerName  ?? "—"} />
                            <InfoRow label="Lawyer Email" value={detail?.lawyerEmail ?? "—"} />
                        </View>

                        {/* Client Info — only for Booking payments */}
                        {isBooking && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Client Details</Text>
                                <InfoRow label="Client ID"    value={detail?.clientId    ?? "—"} />
                                <InfoRow label="Client Name"  value={detail?.clientName  ?? "—"} />
                                <InfoRow label="Client Email" value={detail?.clientEmail ?? "—"} />
                            </View>
                        )}

                        {/* Receipt Document */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Documents</Text>
                            {detail?.receiptDocument ? (
                                <TouchableOpacity onPress={() => setPreviewImage(`data:image/png;base64,${detail.receiptDocument}`)}>
                                    <Image
                                        source={{ uri: `data:image/png;base64,${detail.receiptDocument}` }}
                                        style={styles.receiptImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.tapHint}>Tap to preview</Text>
                                </TouchableOpacity>
                            ) : (
                                <UploadCard
                                    title="Payment Slip"
                                    fileName="No slip uploaded"
                                    onPress={() => {}}
                                />
                            )}
                        </View>

                        <Modal visible={!!previewImage} transparent animationType="fade">
                            <View style={styles.previewOverlay}>
                                <TouchableOpacity
                                    style={styles.previewClose}
                                    onPress={() => setPreviewImage(null)}
                                >
                                    <Text style={styles.previewCloseText}>✕</Text>
                                </TouchableOpacity>
                                {previewImage && (
                                    <Image
                                        source={{ uri: previewImage }}
                                        style={styles.previewImage}
                                        resizeMode="contain"
                                    />
                                )}
                            </View>
                        </Modal>

                    </ScrollView>

                    {/* Action Buttons */}
                    {isPending && (
                        <View style={styles.actionContainer}>
                            <Button title="ACCEPT" variant="primary" onPress={handleAccept} />
                            <Button title="REJECT" variant="transparent" onPress={() => setShowRejectSheet(true)} />
                        </View>
                    )}
                </>
            )}

            {/* Reject Bottom Sheet */}
            <Modal
                visible={showRejectSheet}
                transparent
                animationType="slide"
                onRequestClose={() => setShowRejectSheet(false)}
            >
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
                            <TouchableOpacity onPress={handleRejectConfirm} disabled={!selectedReason}>
                                <Text style={[styles.sheetConfirm, !selectedReason && { opacity: 0.4 }]}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.sheetBody}>
                            Are you sure you want to reject this payment?{"\n"}
                            This will notify the client / lawyer.{"\n"}
                            Please select the reject reason.
                        </Text>

                        {REJECT_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={styles.reasonRow}
                                onPress={() => setSelectedReason(reason)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.radioOuter, selectedReason === reason && styles.radioOuterActive]}>
                                    {selectedReason === reason && <View style={styles.radioInner} />}
                                </View>
                                <Text style={styles.reasonText}>{reason}</Text>
                            </TouchableOpacity>
                        ))}

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
                </View>
            </Modal>
        </AdminLayout>
    );
}

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
        ...StyleSheet.absoluteFillObject,
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
    centeredState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
    },
    errorText: {
        fontSize: fontSize.md,
        color: colors.error,
        textAlign: "center",
        marginBottom: spacing.md,
    },
    retryLink: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
    },
    receiptImage: {
        width: "100%",
        height: 220,
        borderRadius: borderRadius.md,
    },
    tapHint: {
        textAlign: "center",
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
        justifyContent: "center",
        alignItems: "center",
    },
    previewClose: {
        position: "absolute",
        top: 50,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    previewCloseText: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    previewImage: {
        width: "95%",
        height: "75%",
    },
});