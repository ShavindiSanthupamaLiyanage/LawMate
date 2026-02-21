import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import ScreenWrapper from "../../../components/ScreenWrapper";
import InitialTopNavbar from "../../../components/InitialTopNavbar";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";

export default function PaymentVerification() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleBackToWelcome = () => {
        // Back arrow should take user to Welcome screen
        navigation.replace("Welcome");
        // If you want user to be able to go back instead:
        // navigation.navigate("Welcome");
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                {/* ✅ Header with back arrow */}
                <InitialTopNavbar
                    title="Payment Verification"
                    onBack={handleBackToWelcome}
                    showLogo={true}
                />

                {/* ✅ Body */}
                <View style={styles.container}>
                    <Text style={styles.title}>
                        Payment{"\n"}Request{"\n"}Received
                    </Text>

                    <Image
                        source={require("../../../../assets/verification.png")}
                        style={styles.image}
                        resizeMode="contain"
                    />

                    <Text style={styles.description}>
                        We've received it and our team is currently reviewing the payment
                        details. You’ll receive an email after the review is completed. Once
                        verified, you can continue with LawMate.
                    </Text>
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.white,
    },

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