import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import AdminLayout from "../../../components/AdminLayout";
import SummaryCard from ".//SummaryCard";
import ActionItem from ".//ActionItem";
import { useNavigation } from "@react-navigation/native";
import {UserCountsDto} from "../../../interfaces/userDetails.interface";
import {UserDetailService} from "../../../services/userDetailService";

const UserManagementScreen = () => {
    const navigation = useNavigation<any>();

    const [counts, setCounts] = useState<UserCountsDto>({
        verifiedLawyers: 0,
        pendingLawyers: 0,
        inactiveLawyers: 0,
        activeLawyers: 0,
        activeClients: 0,
        inactiveClients: 0,
    });

    useEffect(() => {
        UserDetailService.getUserCounts()
            .then(setCounts)
            .catch(console.error);
    }, []);

    return (
        <AdminLayout
            title="User Management"
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/*Title*/}
                <Text style={styles.sectionTitle}>
                    Summary of Users
                </Text>

                {/*Cards Grid*/}
                <View style={styles.grid}>
                    <SummaryCard
                        title="Verified Lawyers"
                        value={String(counts.verifiedLawyers)}
                        backgroundColor="#CDEFE1"
                        accentColor="#2EAD6B"
                    />

                    <SummaryCard
                        title="Pending Lawyers"
                        value={String(counts.pendingLawyers)}
                        backgroundColor="#FDE6D6"
                        accentColor="#F38B2A"
                    />

                    <SummaryCard
                        title="Inactive Lawyers"
                        value={String(counts.inactiveLawyers)}
                        backgroundColor="#F9D6D6"
                        accentColor="#C74848"
                    />

                    <SummaryCard
                        title="Active Lawyers"
                        value={String(counts.activeLawyers)}
                        backgroundColor="#D9E6F7"
                        accentColor="#4A67C8"
                    />

                    <SummaryCard
                        title="Active Clients"
                        value={String(counts.activeClients)}
                        backgroundColor="#D9E6F7"
                        accentColor="#4A67C8"
                    />

                    <SummaryCard
                        title="Suspended Clients"
                        value={String(counts.inactiveClients)}
                        backgroundColor="#F9D6D6"
                        accentColor="#C74848"
                    />
                </View>

                {/*Action Items*/}
                <ActionItem
                    icon={<Feather name="user-check" size={40} color={colors.primary} />}
                    title="Lawyer Verification"
                    onPress={() => navigation.navigate("LawyerVerification")}
                />

                <ActionItem
                    icon={<Feather name="users" size={40} color={colors.primary} />}
                    title="Client Verification"
                    onPress={() => navigation.navigate("ClientVerification")}
                />

                <View style={{ height: 30 }} />
            </ScrollView>
        </AdminLayout>
    );
};

export default UserManagementScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    content: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: spacing.lg,
    },
});