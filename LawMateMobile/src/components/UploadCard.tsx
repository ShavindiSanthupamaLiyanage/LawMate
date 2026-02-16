import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    colors,
    spacing,
    borderRadius,
    fontSize, fontWeight,
} from "../config/theme";

interface UploadCardProps {
    title: string;
    fileName?: string;
    onPress: () => void;
    fullWidth?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({
                                                   title,
                                                   fileName,
                                                   onPress,
                                                   fullWidth,
                                               }) => {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                fullWidth && styles.fullWidth
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name="document-outline"
                    size={22}
                    color={colors.primary}
                />
            </View>

            <Text style={styles.title} numberOfLines={2}>
                {fileName ? fileName : title}
            </Text>
        </TouchableOpacity>
    );
};

export default UploadCard;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#F2F1FF",
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        margin: spacing.sm,
        minHeight: 120,
    },

    fullWidth: {
        flex: 0,
        width: "100%",
    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.sm,
    },

    title: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
        textAlign: "center",
    },
});
