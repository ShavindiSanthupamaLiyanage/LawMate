import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// import LawyerList from "../userVerification/LawyerList";
import SearchBar from "../../../components/SearchBar";
import { colors, spacing, borderRadius } from "../../../config/theme";
import AdminLayout from "../../../components/AdminLayout";


type StatusType = "ALL" | "Pending" | "Active" | "Rejected";

interface Lawyer {
    id: string;
    name: string;
    barId: string;
    image: string;
    status: StatusType;
}
const DATA: Lawyer[] = [
    {
        id: "1",
        name: "Maya Wickramage",
        barId: "Bar ID: SL/2017/2345",
        image: "https://i.pravatar.cc/150?img=5",
        status: "Pending",
    },
    {
        id: "2",
        name: "Tharindu Bandara",
        barId: "Bar ID: SL/2017/2346",
        image: "https://i.pravatar.cc/150?img=8",
        status: "Active",
    },
    {
        id: "3",
        name: "Namal Kumar",
        barId: "Bar ID: SL/2017/2347",
        image: "https://i.pravatar.cc/150?img=12",
        status: "Rejected",
    },
];

const LawyerVerificationScreen = () => {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<StatusType>("ALL");

    /* ---------- FILTER LOGIC ---------- */
    const filteredData = DATA.filter(item => {
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
                <Image source={{ uri: item.image }} style={styles.avatar} />

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
        <AdminLayout title="Lawyer Verification" disableScroll showBackButton>
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

    name: {
        fontWeight: "600",
        fontSize: 15,
    },

    barId: {
        color: "#777",
        fontSize: 12,
        marginTop: 2,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
});

export default LawyerVerificationScreen;