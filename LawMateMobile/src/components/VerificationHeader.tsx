import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { colors, spacing, borderRadius } from "../config/theme";

interface Props {
    title: string;
    backScreen?: string;
}

export default function VerificationHeader({ title, backScreen }: Props) {
    const navigation = useNavigation<any>();

    const handleBack = () => {
        if (backScreen) {
            navigation.navigate(backScreen);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={handleBack}
                style={styles.backBtn}
            >
                <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{title}</Text>

            <View style={{ width: 32 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
    },

    backBtn: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.full,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.white,
    },
});