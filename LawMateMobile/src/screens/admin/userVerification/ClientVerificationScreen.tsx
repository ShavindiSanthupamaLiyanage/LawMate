import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
} from "react-native";

import ScreenWrapper from "../../../components/ScreenWrapper";
import TopNavbar from "../../../components/TopNavbar";
import SearchBar from "../../../components/SearchBar";
import { colors, spacing, borderRadius } from "../../../config/theme";

type StatusType = "ALL" | "Active" | "Rejected";

interface Client {
    id: string;
    name: string;
    email: string;
    image: string;
    status: StatusType;
}

const DATA: Client[] = [
    {
        id: "1",
        name: "Nisal Perera",
        email: "nisal@gmail.com",
        image: "https://i.pravatar.cc/150?img=10",
        status: "Rejected",
    },
    {
        id: "2",
        name: "Nisha Perera",
        email: "nisha@gmail.com",
        image: "https://i.pravatar.cc/150?img=12",
        status: "Active",
    },
    {
        id: "3",
        name: "Kamal Silva",
        email: "kamal@gmail.com",
        image: "https://i.pravatar.cc/150?img=7",
        status: "Active",
    },
];

const ClientVerificationScreen = () => {
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<StatusType>("ALL");

    const filteredData = DATA.filter((item) => {
        const matchSearch = item.name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchStatus =
            selectedTab === "ALL" || item.status === selectedTab;

        return matchSearch && matchStatus;
    });

    const getStatusStyle = (status: StatusType) => {
        switch (status) {
            case "Active":
                return { backgroundColor: "#D4F4E2", color: "#1E8E5A" };
            case "Rejected":
                return { backgroundColor: "#FAD4D4", color: "#C53030" };
            default:
                return {};
        }
    };

    const renderItem = ({ item }: { item: Client }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.avatar} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
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
            </View>
        );
    };

    return (
        <ScreenWrapper backgroundColor="#F4F6F9">
            <TopNavbar userName="Admin" />

            <View style={styles.container}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search here..."
                />

                <View style={styles.tabs}>
                    {["ALL", "Active", "Rejected"].map((tab) => (
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

                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenWrapper>
    );
};

export default ClientVerificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.md,
    },

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

    email: {
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