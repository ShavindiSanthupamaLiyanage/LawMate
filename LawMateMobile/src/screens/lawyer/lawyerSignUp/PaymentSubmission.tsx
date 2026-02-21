import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    Pressable,
} from "react-native";

import UploadCard from "../../../components/UploadCard";
import Button from "../../../components/Button";
import InitialTopNavbar from "../../../components/InitialTopNavbar";
import ScreenWrapper from "../../../components/ScreenWrapper";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius,
} from "../../../config/theme";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";

export default function PaymentSubmission() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [slipFile, setSlipFile] = useState<string | undefined>();
    const [confirmed, setConfirmed] = useState(false);

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
            setSlipFile(result.assets[0].name);
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                {/* Header */}
                <InitialTopNavbar
                    title="Payment Verification"
                    onBack={() => navigation.goBack()}
                    showLogo={true}
                />

                {/* Content */}
                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Instruction */}
                    <Text style={styles.description}>
                        To complete the registration please make the payment for the
                        following bank account for the membership fee and upload the slip to
                        the folder.
                    </Text>

                    {/* Bank Details */}
                    <Text style={styles.bankDetails}>
                        Bank - Bank of Ceylon{"\n"}
                        Branch - Borella{"\n"}
                        Account No - 10002020332{"\n"}
                        Account Holder - M.A.Perera{"\n"}
                        Amount - Rs.15,000.00
                    </Text>

                    {/* Upload Container */}
                    <View style={styles.uploadContainer}>
                        <UploadCard
                            title="Membership Fee Pay Slip"
                            fileName={slipFile}
                            onPress={pickFile}
                        />
                    </View>

                    {/* Confirmation */}
                    <View style={styles.checkboxContainer}>
                        <Pressable
                            style={[styles.checkbox, confirmed && styles.checkboxActive]}
                            onPress={() => setConfirmed(!confirmed)}
                        >
                            {confirmed && (
                                <Ionicons name="checkmark" size={16} color={colors.white} />
                            )}
                        </Pressable>

                        <Text style={styles.checkboxText}>
                            I confirmed that the details provided are accurate
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <Button
                        title="SUBMIT FOR VERIFICATION"
                        onPress={() => navigation.replace("PaymentVerification")}
                        disabled={!confirmed}
                        style={styles.button}
                    />
                </ScrollView>
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
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },

    description: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
        lineHeight: 20,
        marginBottom: spacing.lg,
    },

    bankDetails: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        lineHeight: 22,
        marginBottom: spacing.xl,
    },

    uploadContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.xl,
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.xl,
    },

    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: spacing.sm,
    },

    checkboxActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },

    checkboxText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },

    button: {
        marginTop: spacing.md,
    },
});