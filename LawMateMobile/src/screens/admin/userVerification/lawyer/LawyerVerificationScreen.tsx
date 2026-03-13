import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SearchBar from "../../../../components/SearchBar";
import {colors, spacing, borderRadius, fontWeight, fontSize} from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import {UserDetailService} from "../../../../services/userDetailService";


type StatusType = "ALL" | "Pending" | "Active" | "Rejected";

interface Lawyer {
    id: string;
    name: string;
    barId: string;
    image: string | null;
    status: StatusType;
}

const mapStatus = (status: number): StatusType => {
    switch (status) {
        case 0: return "Pending";
        case 1: return "Active";
        case 2: return "Rejected";
        default: return "Pending";
    }
};

const LawyerVerificationScreen = () => {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<StatusType>("ALL");
    const [lawyers, setLawyers] = useState<Lawyer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        UserDetailService.getAllLawyerVerifications()
            .then(data => {
                setLawyers(data.map(l => ({
                    id: l.userId,
                    name: l.lawyerName,
                    barId: `Bar ID: ${l.barAssociationRegNo}`,
                    image: l.profileImage ? `data:image/jpeg;base64,${l.profileImage}` : null,
                    status: mapStatus(l.verificationStatus),
                })));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    /* ---------- FILTER LOGIC ---------- */
    const filteredData = lawyers.filter(item => {
        const matchSearch = item.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchStatus =
            selectedTab === "ALL" || item.status === selectedTab;

        return matchSearch && matchStatus;
    });

    /* ---------- STATUS COLOR ---------- */
    const getStatusStyle = (status: StatusType) => {
        switch (status) {
            case "Pending":
                return { backgroundColor: "#FFE8B3", color: "#B7791F" };
            case "Active":
                return { backgroundColor: "#D4F4E2", color: "#1E8E5A" };
            case "Rejected":
                return { backgroundColor: "#FAD4D4", color: "#C53030" };
            default:
                return {};
        }
    };

    /* ---------- LIST ITEM ---------- */
    const renderItem = ({ item }: { item: Lawyer }) => {

        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("LawyerProfile", {
                        lawyer: item,
                        mode: item.status === "Active" ? "manage" : "view",
                    })
                }
            >
                {item.image
                    ? <Image source={{ uri: item.image }} style={styles.avatar} />
                    : (
                        <View style={styles.avatarFallback}>
                            <Text style={styles.avatarInitials}>
                                {item.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                            </Text>
                        </View>
                    )
                }

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.barId}>{item.barId}</Text>
                </View>

                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.backgroundColor },
                    ]}
                >
                    <Text style={{ color: statusStyle.color }}>
                        {item.status}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <AdminLayout title="Lawyer Verification"
                     disableScroll
                     showBackButton
                     onBackPress={() => navigation.navigate("UserManagement")}
                     onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            <View style={styles.container}>
                {/* SEARCH */}
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search here..."
                />

                {/* FILTER TABS */}
                <View style={styles.tabs}>
                    {["ALL", "Pending", "Active", "Rejected"].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                selectedTab === tab && styles.activeTab,
                            ]}
                            onPress={() => setSelectedTab(tab as StatusType)}
                        >
                            <Text
                                style={{
                                    color:
                                        selectedTab === tab
                                            ? colors.white
                                            : colors.textPrimary,
                                }}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* LIST */}
                {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
                <FlatList
                    data={filteredData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
    },

    /* Tabs */
    tabs: {
        flexDirection: "row",
        marginVertical: spacing.md,
        backgroundColor: "#ECECEC",
        borderRadius: borderRadius.full,
        padding: 4,
    },

    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: borderRadius.full,
    },

    activeTab: {
        backgroundColor: colors.primary,
    },

    /* Card */
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.sm,
        elevation: 2,
    },

    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22,
        marginRight: spacing.md,
    },

    avatarFallback: {
        width: 45,
        height: 45,
        borderRadius: 22,
        marginRight: spacing.md,
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
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },

    name: {
        fontWeight: "600",
        fontSize: 15,
    },

    barId: {
        color: "#777",
        fontSize: fontSize.xs,
        marginTop: 2,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
});

export default LawyerVerificationScreen;