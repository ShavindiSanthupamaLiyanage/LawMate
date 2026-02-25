import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import AdminLayout from "../../../components/AdminLayout";
import SummaryCard from "../../admin/userVerificatopm/SummaryCard";
import ActionItem from "../../admin/userVerificatopm/ActionItem";

const UserManagementScreen = () => {
    return (
        <AdminLayout userName="Kavindu Gimsara">
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
                        value="100"
                        backgroundColor="#CDEFE1"
                        accentColor="#2EAD6B"
                    />

                    <SummaryCard
                        title="Pending Lawyers"
                        value="203"
                        backgroundColor="#FDE6D6"
                        accentColor="#F38B2A"
                    />

                    <SummaryCard
                        title="Inactive Lawyers"
                        value="23"
                        backgroundColor="#F9D6D6"
                        accentColor="#C74848"
                    />

                    <SummaryCard
                        title="Active Lawyers"
                        value="230"
                        backgroundColor="#D9E6F7"
                        accentColor="#4A67C8"
                    />

                    <SummaryCard
                        title="Active Clients"
                        value="503"
                        backgroundColor="#D9E6F7"
                        accentColor="#4A67C8"
                    />

                    <SummaryCard
                        title="Suspended Clients"
                        value="20"
                        backgroundColor="#F9D6D6"
                        accentColor="#C74848"
                    />
                </View>

                {/*Action Items*/}
                <ActionItem
                    icon={<Feather name="user-check" size={20} color={colors.primary} />}
                    title="Lawyer Verification"
                    onPress={() => {}}
                />

                <ActionItem
                    icon={<Feather name="users" size={20} color={colors.primary} />}
                    title="Client Verification"
                    onPress={() => {}}
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