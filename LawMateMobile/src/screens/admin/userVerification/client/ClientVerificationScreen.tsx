import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import SearchBar from "../../../../components/SearchBar";
import {colors, spacing, borderRadius, fontWeight, fontSize} from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import { useNavigation } from "@react-navigation/native";
import {ClientService} from "../../../../services/clientVerificationService";

type StatusType = "ALL" | "Active" | "Rejected";

interface Client {
    id:               string;
    prefix:           number;
    name:             string;
    nic:              string;
    email:            string;
    gender:           number;
    contactNumber:    string;
    state:            number;
    registrationDate: string;
    address:          string;
    district:         number;
    preferredLanguage: number;
    image:            string | null;
    status:           StatusType;
}

const ClientVerificationScreen = () => {
    const [search, setSearch] = useState("");
    const [selectedTab, setSelectedTab] = useState<StatusType>("ALL");
    const navigation = useNavigation<any>();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ClientService.getAll()
            .then(data => setClients(data.map(c => ({
                id:               c.userId,
                prefix:           c.prefix,
                name:             `${c.firstName} ${c.lastName}`,
                nic:              c.nic,
                email:            c.email,
                gender:           c.gender,
                contactNumber:    c.contactNumber,
                state:            c.state,
                registrationDate: c.registrationDate,
                address:          c.address,
                district:         c.district,
                preferredLanguage: c.prefferedLanguage,
                image:            c.profileImage ? `data:image/jpeg;base64,${c.profileImage}` : null,
                status:           c.state === 1 ? "Active" : "Rejected",
            }))))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filteredData = clients.filter((item) => {
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
    const openProfile = (client: Client) => {
        navigation.navigate("ClientProfile", {
            client,
            viewOnly: true,
        });
    };

    const renderItem = ({ item }: { item: Client }) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <TouchableOpacity style={styles.card} onPress={() => openProfile(item)}>
                {item.image
                    ? <Image source={{ uri: item.image }} style={styles.avatar} />
                    : <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarInitials}>
                            {item.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                        </Text>
                    </View>
                }

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.nic}>{item.nic}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={{ color: statusStyle.color }}>{item.status}</Text>
                </View>
            </TouchableOpacity>
        );
    };
    return (
        <AdminLayout title="Client Verification"
                     disableScroll
                     showBackButton
                     onBackPress={() => navigation.navigate("UserManagement")}
                     onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
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
                            <Text style={{
                                color: selectedTab === tab ? colors.primary : colors.textSecondary,
                                fontWeight: selectedTab === tab ? fontWeight.semibold : fontWeight.medium,
                                fontSize: fontSize.sm,
                            }}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {loading && <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />}
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            </View>
         </AdminLayout>
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
        backgroundColor: colors.borderLight,
        borderRadius: borderRadius.lg,
        marginVertical: spacing.md,
        padding: 4,
    },

    tab: {
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

    nic: {
        color: "#777",
        fontSize: 12,
        marginTop: 2,
    },

    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    avatarFallback: {
        backgroundColor: colors.primaryLight,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarInitials: {
        color: colors.white,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
    },
});