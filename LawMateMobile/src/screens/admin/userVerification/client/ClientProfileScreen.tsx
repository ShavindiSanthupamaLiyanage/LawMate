import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Modal,
    TextInput,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, colors, fontSize, fontWeight, borderRadius } from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import Button from "../../../../components/Button";
import { useToast } from "../../../../context/ToastContext";
import {
    PrefixOptions,
    GenderOptions,
    DistrictOptions,
    LanguageOptions,
} from "../../../../enum/enumOptions";
import {StorageService} from "../../../../utils/storage";
import apiClient from "../../../../api/httpClient";
import {ENDPOINTS} from "../../../../config/api.config";

const findLabel = (
    options: { label: string; value: number }[],
    value: number
): string => options.find(o => o.value === value)?.label ?? "—";


const ClientProfileScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { showError, showSuccess } = useToast();

    const { client } = route.params;

    const [suspendModalVisible, setSuspendModalVisible] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [loading, setLoading] = useState(false);

    const displayName = `${findLabel(PrefixOptions, client.prefix)} ${client.name}`.trim();

    const formattedDate = client.registrationDate
        ? new Date(client.registrationDate).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
        })
        : "—";

    const handleSuspendPress = () => {
        setSuspendReason("");
        setSuspendModalVisible(true);
    };

    const confirmSuspend = async () => {
        if (!suspendReason.trim()) return;
        try {
            setLoading(true);
            setSuspendModalVisible(false);

            // Get the logged-in admin's userId
            const currentUser = await StorageService.getUserData();

            await apiClient.put(ENDPOINTS.CLIENT.SUSPEND(client.id), {
                userId: client.id,
                suspendedBy: currentUser?.userId,
                suspendedReason: suspendReason.trim(),
            });

            showSuccess("Client has been suspended successfully.");
            navigation.navigate("ClientVerification");
        } catch (e) {
            showError("Failed to suspend client. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title="Client Profile"
            showBackButton
            onBackPress={() => navigation.navigate("ClientVerification")}
            hideRightSection
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {client.image ? (
                            <Image
                                source={{ uri: client.image }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Ionicons name="person" size={60} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.profileName}>{displayName}</Text>
                    <Text style={styles.profileEmail}>{client.email}</Text>

                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{client.status}</Text>
                    </View>
                </View>

                {/* Personal Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{displayName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{client.email}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Contact Number</Text>
                        <Text style={styles.value}>{client.contactNumber || "—"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>NIC</Text>
                        <Text style={styles.value}>{client.nic}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Gender</Text>
                        <Text style={styles.value}>{findLabel(GenderOptions, client.gender)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{client.address || "—"}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>District</Text>
                        <Text style={styles.value}>
                            {typeof client.district === 'string'
                                ? client.district
                                : findLabel(DistrictOptions, client.district)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Preferred Language</Text>
                        <Text style={styles.value}>{findLabel(LanguageOptions, client.preferredLanguage)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Registered On</Text>
                        <Text style={styles.value}>{formattedDate}</Text>
                    </View>
                </View>

                {/* Suspend Button */}
                {client.status === "Active" && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Suspend Client"
                            variant="reject"
                            onPress={handleSuspendPress}   // ← opens modal now
                            loading={loading}
                        />
                    </View>
                )}
            </ScrollView>

            {/* ── Suspend Reason Bottom Sheet ── */}
            <Modal
                visible={suspendModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setSuspendModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Reason for Suspension</Text>
                        <Text style={styles.modalSubtitle}>
                            Please provide a reason before suspending this client.
                        </Text>

                        <TextInput
                            style={[
                                styles.textInput,
                                !suspendReason.trim() && styles.textInputError,
                            ]}
                            placeholder="Enter reason..."
                            placeholderTextColor="#aaa"
                            multiline
                            numberOfLines={4}
                            value={suspendReason}
                            onChangeText={setSuspendReason}
                        />

                        {!suspendReason.trim() && (
                            <Text style={styles.errorText}>Reason is required.</Text>
                        )}

                        <View style={styles.modalButtons}>
                            <Button
                                title="CANCEL"
                                variant="transparent"
                                onPress={() => setSuspendModalVisible(false)}
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title="SUSPEND"
                                variant="reject"
                                onPress={confirmSuspend}
                                disabled={!suspendReason.trim()}
                                style={{ flex: 1, marginLeft: 8 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

        </AdminLayout>
    );
};

export default ClientProfileScreen;

const styles = StyleSheet.create({
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: "center",
        marginBottom: spacing.lg,
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    profileImageContainer: {
        marginBottom: spacing.md,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.white,
    },
    defaultProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    profileName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    profileEmail: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    statusBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
    },
    statusText: {
        color: "#2E7D32",
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    detailsCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },
    detailRow: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingVertical: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    value: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    buttonContainer: {
        marginTop: spacing.lg,
    },

    // ── Modal styles (mirrors LawyerProfileScreen) ──
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.lg,
        paddingBottom: 36,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
        color: "#E74C3C",
        textAlign: "center",
    },
    modalSubtitle: {
        fontSize: 13,
        color: "#777",
        marginBottom: 16,
        textAlign: "center",
    },
    textInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        textAlignVertical: "top",
        minHeight: 100,
        color: "#333",
    },
    textInputError: {
        borderColor: "#E74C3C",
    },
    errorText: {
        color: "#E74C3C",
        fontSize: 12,
        marginTop: 4,
        marginBottom: 8,
    },
    modalButtons: {
        flexDirection: "row",
        marginTop: 20,
    },
});