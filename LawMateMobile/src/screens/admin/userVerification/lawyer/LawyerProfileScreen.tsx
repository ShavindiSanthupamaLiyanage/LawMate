import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { colors, spacing } from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import Alert from "../../../../components/Alert";
import Button from "../../../../components/Button";

type Lawyer = {
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

    // Alert state
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<"success" | "warning" | "error" | "info">("info");
    const [alertMessage, setAlertMessage] = useState("");

    // ACCEPT LAWYER
    const handleAccept = () => {
        setAlertType("success");
        setAlertMessage("Lawyer has been accepted successfully.");
        setAlertVisible(true);

        // TODO: API call to accept lawyer
    };

    // SUSPEND LAWYER
    const handleSuspend = () => {
        setAlertType("warning");
        setAlertMessage("Lawyer has been suspended.");
        setAlertVisible(true);

        // TODO: API call to suspend lawyer
    };

    const status = lawyer.status.toLowerCase();

    return (
        <AdminLayout
            title="Lawyer Profile"
            showBackButton
            disableScroll
            onBackPress={() => navigation.navigate("LawyerVerification")}
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
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

                {/* MENU ITEMS */}
                <View style={styles.menuCard}>
                    <Ionicons name="person-outline" size={22} color={colors.primary} />
                    <Text
                        style={styles.menuText}
                        onPress={() => navigation.navigate("LawyerPersonal", { viewOnly: true })}
                    >
                        Personal Details
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>

                <View style={styles.menuCard}>
                    <Ionicons name="briefcase-outline" size={22} color={colors.primary} />
                    <Text
                        style={styles.menuText}
                        onPress={() => navigation.navigate("LawyerProfessional")}
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


            {/* CUSTOM ALERT MODAL */}
            <Alert
                visible={alertVisible}
                title="Admin Action"
                message={alertMessage}
                type={alertType}
                confirmText="OK"
                onClose={() => setAlertVisible(false)}
            />
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
});