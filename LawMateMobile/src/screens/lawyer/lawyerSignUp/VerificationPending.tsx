import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";
import ScreenWrapper from "../../../components/ScreenWrapper";
import Button from "../../../components/Button";
import InitialTopNavbar from "../../../components/InitialTopNavbar";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";

export default function VerificationPending() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleGoToPaymentSubmission = () => {
        navigation.navigate("PaymentSubmission");
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                {/* ✅ Same header component */}
                <InitialTopNavbar
                    title="Verification"
                    onBack={() => navigation.goBack()}
                    showLogo={true}
                />

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

                    {/* ✅ TEMP BUTTON FOR TESTING */}
                    {__DEV__ && (
                        <Button
                            title="PROCEED TO PAYMENT (TEST)"
                            variant="primary"
                            onPress={handleGoToPaymentSubmission}
                            style={styles.button}
                        />
                    )}
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

    button: {
        marginTop: spacing.xl,
        alignSelf: "stretch",
    },
});