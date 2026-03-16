import React, {useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Modal, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors, spacing } from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import Button from "../../../../components/Button";
import {useToast} from "../../../../context/ToastContext";
import {lawyerVerificationService} from "../../../../services/lawyerVerificationService";

type Lawyer = {
    userId: string;
    name: string;
    image: string | null;
    barId: string;
    status: "pending" | "active" | "suspended";
};

type AdminStackParamList = {
    LawyerProfile: { lawyer: Lawyer };
    LawyerPersonal: { viewOnly: boolean };
    LawyerProfessional: undefined;
    Availability: undefined;
};

const LawyerProfileScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<AdminStackParamList, "LawyerProfile">>();
    const { lawyer } = route.params;
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const { showSuccess, showError } = useToast();

    // @ts-ignore
    const [loading, setLoading] = useState(false);

    const handleAccept = async () => {
        try {
            setLoading(true);
            await lawyerVerificationService.accept(lawyer.userId);
            showSuccess("Lawyer has been verified successfully.");
            navigation.navigate("LawyerVerification");
        } catch (e) {
            showError("Failed to verify lawyer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = () => {
        setRejectReason("");
        setRejectModalVisible(true);
    };

    const confirmReject = async () => {
        if (!rejectReason.trim()) return; // safety guard
        try {
            setLoading(true);
            setRejectModalVisible(false);
            await lawyerVerificationService.reject(lawyer.userId, rejectReason.trim());
            showError("Lawyer has been rejected.");
            navigation.navigate("LawyerVerification");
        } catch (e) {
            showError("Failed to reject lawyer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const status = lawyer.status.toLowerCase();

    return (
        <AdminLayout
            title="Lawyer Profile"
            showBackButton
            disableScroll
            onBackPress={() => navigation.navigate("LawyerVerification")}
            hideRightSection
        >
            <ScrollView style={styles.container}>
                <View style={styles.profileCard}>
                    {lawyer.image
                        ? <Image source={{ uri: lawyer.image }} style={styles.avatar} />
                        : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarInitials}>
                                    {lawyer.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                                </Text>
                            </View>
                        )
                    }
                    <Text style={styles.name}>{lawyer.name}</Text>
                    <Text style={styles.barId}>{lawyer.barId}</Text>

                    <Text
                        style={[
                            styles.status,
                            status === "pending" && { color: "#F39C12" },
                            status === "active" && { color: "#2ECC71" },
                            status === "suspended" && { color: "#E74C3C" },
                        ]}
                    >
                        {status.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.menuCard}>
                    <Ionicons name="person-outline" size={22} color={colors.primary} />
                    <Text
                        style={styles.menuText}
                        onPress={() => navigation.navigate("LawyerPersonal",
                            {
                                viewOnly: true,
                                userId: lawyer.userId
                            })}
                    >
                        Personal Details
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>

                <View style={styles.menuCard}>
                    <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
                    <Text
                        style={styles.menuText}
                        onPress={() => navigation.navigate("LawyerProfessional",
                            {
                                viewOnly: true,
                                userId: lawyer.userId
                            })}
                    >
                        Professional Details
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>

                <View style={styles.menuCard}>
                    <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                    <Text
                        style={styles.menuText}
                        onPress={() => navigation.navigate("Availability")}
                    >
                        Availability
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>

                {/* ADMIN BUTTONS */}
                {(status === "pending" || status === "active") && (
                    <View style={styles.buttonRow}>
                        {status === "pending" && (
                            <Button
                                title="VERIFY"
                                variant="accept"
                                onPress={handleAccept}
                                style={{ flex: 1, marginRight: 10 }}
                            />
                        )}
                        <Button
                            title="REJECT"
                            variant="reject"
                            onPress={handleSuspend}
                            style={{ flex: 1, marginLeft: status === "pending" ? 10 : 0 }}
                        />
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setRejectModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Reason for Rejection</Text>
                        <Text style={styles.modalSubtitle}>
                            Please provide a reason before rejecting this lawyer.
                        </Text>

                        <TextInput
                            style={[
                                styles.textInput,
                                !rejectReason.trim() && styles.textInputError,
                            ]}
                            placeholder="Enter reason..."
                            placeholderTextColor="#aaa"
                            multiline
                            numberOfLines={4}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                        />

                        {!rejectReason.trim() && (
                            <Text style={styles.errorText}>Reason is required.</Text>
                        )}

                        <View style={styles.modalButtons}>
                            <Button
                                title="CANCEL"
                                variant="secondary"
                                onPress={() => setRejectModalVisible(false)}
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title="REJECT"
                                variant="reject"
                                onPress={confirmReject}
                                disabled={!rejectReason.trim()}
                                style={{ flex: 1, marginLeft: 8 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

        </AdminLayout>
    );
};

export default LawyerProfileScreen;

const styles = StyleSheet.create({
    container: { padding: spacing.md },

    profileCard: {
        alignItems: "center",
        backgroundColor: "#fff",
        padding: spacing.lg,
        borderRadius: 16,
        marginBottom: 20,
    },

    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },

    avatarFallback: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 3,
    },

    avatarInitials: {
        color: colors.white,
        fontSize: 24,
        fontWeight: "600",
    },

    name: {
        fontSize: 18,
        fontWeight: "600",
    },

    barId: {
        color: "#777",
    },

    status: {
        marginTop: 6,
        fontWeight: "600",
        fontSize: 14,
    },

    menuCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },

    menuText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "500",
    },

    buttonRow: {
        flexDirection: "row",
        marginTop: 20,
        gap: 10,
    },
    // REPLACE these styles only
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
        padding: 0,
    },
    modalCard: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: spacing.lg,
        width: "100%",
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