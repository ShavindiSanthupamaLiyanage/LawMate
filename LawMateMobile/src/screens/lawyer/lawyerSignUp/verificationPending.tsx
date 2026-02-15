import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import {colors, spacing, fontSize, fontWeight} from "../../../config/theme";

export default function VerificationPending() {
    return (
        <View style={styles.container}>

            {/* Title */}
            <Text style={styles.title}>
                Request{"\n"}Received
            </Text>

            {/* Illustration */}
            <Image
                source={require("../../../../assets/verification.png")}
                style={styles.image}
                resizeMode="contain"
            />

            {/* Description */}
            <Text style={styles.description}>
                We've received it and our team is currently reviewing the details.
                You’ll receive an email after the review is completed.
                Once verified, you can continue with LawMate.
            </Text>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.xl,
    },

    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        textAlign: "center",
        marginBottom: spacing.xl,
    },

    image: {
        width: 300,
        height: 300,
        marginBottom: spacing.xl,
    },

    description: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 22,
    },
});
