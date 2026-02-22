import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from "react-native";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
} from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AdminLayout from "../../../components/AdminLayout";
import SearchBar from "../../../components/SearchBar";
import PaymentVerificationCard, {
    PaymentVerificationItem,
    PaymentStatus,
} from "../paymentVerification/PaymentVerificationCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentVerificationStackParamList = {
    PaymentVerificationList: undefined;
    PaymentVerificationView: { item: PaymentVerificationItem };
};

type Props = {
    navigation: NativeStackNavigationProp<
        PaymentVerificationStackParamList,
        "PaymentVerificationList"
    >;
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const dummyData: PaymentVerificationItem[] = [
    {
        id: "1",
        name: "Kavinda Gunesekara",
        email: "kavinda@gmail.com",
        amount: "LKR 15,000.00",
        paymentDate: "Feb 5, 2025",
        status: "Pending",
        transNo: "0001",
    },
    {
        id: "2",
        name: "Santha De Silva",
        email: "santha@gmail.com",
        amount: "LKR 25,000.00",
        paymentDate: "Feb 3, 2025",
        status: "Approved",
        transNo: "0021",
    },
    {
        id: "3",
        name: "Kamal Silva",
        email: "kamal@gmail.com",
        amount: "LKR 30,000.00",
        paymentDate: "Mar 1, 2025",
        status: "Rejected",
        transNo: "0108",
    },
    {
        id: "4",
        name: "Nuwan Sliwa",
        email: "nuwan@gmail.com",
        amount: "LKR 42,000.00",
        paymentDate: "Oct 2, 2025",
        status: "Approved",
        transNo: "0002",
    },
    {
        id: "5",
        name: "Kamal Dina",
        email: "kamal.d@gmail.com",
        amount: "LKR 12,000.00",
        paymentDate: "Feb 5, 2025",
        status: "Approved",
        transNo: "0005",
    },
    {
        id: "6",
        name: "Maya De Silva",
        email: "maya@gmail.com",
        amount: "LKR 90,000.00",
        paymentDate: "May 25, 2025",
        status: "Pending",
        transNo: "0001",
    },
    {
        id: "7",
        name: "Kamil Black",
        email: "kamil@gmail.com",
        amount: "LKR 30,000.00",
        paymentDate: "Feb 1, 2025",
        status: "Rejected",
        transNo: "0013",
    },
];

const TABS: Array<"All" | PaymentStatus> = [
    "All",
    "Pending",
    "Approved",
    "Rejected",
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PaymentVerificationListScreen({ navigation }: Props) {
    const [selectedTab, setSelectedTab] = useState<"All" | PaymentStatus>("All");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredData = dummyData.filter((item) => {
        const matchesTab =
            selectedTab === "All" ? true : item.status === selectedTab;
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const renderItem = ({ item }: { item: PaymentVerificationItem }) => (
        <PaymentVerificationCard
            item={item}
            onPress={() => navigation.navigate("PaymentVerificationView", { item })}
        />
    );

    return (
        <AdminLayout userName="Payment Verification">
            <View style={styles.container}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search here..."
                        onSearch={() => {}}
                        onClear={() => setSearchQuery("")}
                    />
                </View>

                {/* Filter Tabs — same pattern as FinanceListScreen */}
                <View style={styles.tabContainer}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tabButton,
                                selectedTab === tab && styles.activeTab,
                            ]}
                            onPress={() => setSelectedTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === tab && styles.activeTabText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* List */}
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No payment records found</Text>
                        </View>
                    }
                />
            </View>
        </AdminLayout>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        padding: 4,
    },
    tabButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: "center",
        borderRadius: borderRadius.md,
    },
    activeTab: {
        backgroundColor: colors.white,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xl,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
});