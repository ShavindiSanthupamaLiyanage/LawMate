import React from "react";
import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { colors, spacing, borderRadius } from "../../../config/theme";

export interface Lawyer {
    id: string;
    name: string;
    barId: string;
    image: string;
    status: "Pending" | "Active" | "Rejected";
}

interface Props {
    data: Lawyer[];
}

const getStatusStyle = (status: string) => {
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

const LawyerList: React.FC<Props> = ({ data }) => {

    const renderItem = ({ item }: any) => {
        const statusStyle = getStatusStyle(item.status);

        return (
            <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.avatar} />

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.barId}>{item.barId}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={{ color: statusStyle.color }}>
                        {item.status}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
        />
    );
};

export default LawyerList;

const styles = StyleSheet.create({
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
        fontSize: 12,
        color: "#777",
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
});