import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}

const ActionItem: React.FC<Props> = ({ icon, title, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.left}>
                {icon}
                <Text style={styles.title}>{title}</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
    );
};

export default ActionItem;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        elevation: 2,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: "500",
        color: "#2B3A67",
    },
});