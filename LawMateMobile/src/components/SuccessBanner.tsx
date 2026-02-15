import React from "react";
import { View, Text, StyleSheet, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, borderRadius, fontSize, fontFamily } from "../config/theme";
import Button from "./Button";

interface SuccessBannerProps {
    visible: boolean;
    message: string;
    onClose: () => void;
}

const SuccessBanner: React.FC<SuccessBannerProps> = ({
                                                         visible,
                                                         message,
                                                         onClose,
                                                     }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>

                    {/* Success Icon */}
                    <View style={styles.iconWrapper}>
                        <Ionicons
                            name="checkmark-circle"
                            size={48}
                            color={colors.success}
                        />
                    </View>

                    {/* Message */}
                    <Text style={styles.message}>{message}</Text>

                    {/* Button */}
                    <Button
                        title="OK"
                        onPress={onClose}
                        variant="primary"
                        style={styles.button}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default SuccessBanner;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg,
    },

    container: {
        width: "100%",
        maxWidth: 340,
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: "center",
    },

    iconWrapper: {
        marginBottom: spacing.lg,
    },

    message: {
        fontSize: fontSize.md,
        fontFamily: fontFamily.medium,
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.xl,
        lineHeight: 22,
    },

    button: {
        width: "100%",
    },
});
