import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity, ActivityIndicator,
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
import {AdminTabParamList} from "../../../types";
import {useNavigation} from "@react-navigation/native";
import {PaymentDto, paymentService} from "../../../services/paymentService";

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
    const parentNavigation =
        useNavigation<NativeStackNavigationProp<AdminTabParamList>>();

    const [allData,      setAllData]      = useState<PaymentVerificationItem[]>([]);
    const [pendingData,  setPendingData]  = useState<PaymentVerificationItem[]>([]);
    const [approvedData, setApprovedData] = useState<PaymentVerificationItem[]>([]);
    const [rejectedData, setRejectedData] = useState<PaymentVerificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const mapDto = (dto: PaymentDto, index: number): PaymentVerificationItem => ({
        id: dto.transactionId
            ? `${dto.transactionId}-${index}`   // ensure uniqueness even if IDs repeat
            : `fallback-${index}-${Date.now()}`,
        name:        dto.lawyerId ?? 'Unknown',
        paymentType: dto.paymentType as 'Membership' | 'Booking',
        amount:      `LKR ${dto.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`,
        paymentDate: dto.paymentDate
            ? new Date(dto.paymentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—',
        status: dto.verificationStatus === 0 ? 'Pending'
            : dto.verificationStatus === 1 ? 'Approved'
                : 'Rejected',
        transNo: dto.transactionId ?? '—',
    });

    useEffect(() => {
        Promise.all([
            paymentService.getAll(),
            paymentService.getPending(),
            paymentService.getApproved(),
            paymentService.getRejected(),
        ])
            .then(([all, pending, approved, rejected]) => {
            setAllData(all.map((dto, i) => mapDto(dto, i)));
            setPendingData(pending.map((dto, i) => mapDto(dto, i)));
            setApprovedData(approved.map((dto, i) => mapDto(dto, i)));
            setRejectedData(rejected.map((dto, i) => mapDto(dto, i)));
        })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getTabData = () => {
        const base = selectedTab === 'All'      ? allData
            : selectedTab === 'Pending'  ? pendingData
                : selectedTab === 'Approved' ? approvedData
                    : rejectedData;

        return base.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.transNo.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    return (
        <AdminLayout title="Payment Verification"
                     onProfilePress={() => parentNavigation.navigate('AdminProfile')}
        >
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

                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
                ) : getTabData().length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No payment records found</Text>
                    </View>
                ) : (
                    getTabData().map((item) => (
                        <PaymentVerificationCard
                            key={item.id}
                            item={item}
                            onPress={() => navigation.navigate("PaymentVerificationView", { item })}
                        />
                    ))
                )}
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