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
import {StorageService} from "../../../utils/storage";
import {uploadMembershipPayment} from "../../../services/lawyerRegistrationService";
import {useToast} from "../../../context/ToastContext";

export default function PaymentSubmission() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [slipFile, setSlipFile] = useState<string | undefined>();
    const [confirmed, setConfirmed] = useState(false);
    const [membershipType, setMembershipType] = useState<'monthly' | 'biannual' | null>(null);
    const [uploading, setUploading] = useState(false);
    const [slipFileAsset, setSlipFileAsset] = useState<{ uri: string; name: string; mimeType?: string } | null>(null);
    const { showSuccess, showError } = useToast();

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
            setSlipFile(result.assets[0].name);
            setSlipFileAsset({ uri: result.assets[0].uri, name: result.assets[0].name, mimeType: result.assets[0].mimeType });
        }
    };

    const handleSubmit = async () => {
        console.log('=== [handleSubmit] START ===');

        if (!membershipType || !slipFile || !confirmed) {
            console.warn('[handleSubmit] Validation failed:', {
                membershipType,
                slipFile,
                confirmed,
            });
            return;
        }

        setUploading(true);
        try {
            const userData = await StorageService.getUserData();
            const lawyerId = userData?.userId;
            console.log('[handleSubmit] LawyerId from storage:', lawyerId ?? '❌ NOT FOUND');

            if (!lawyerId) throw new Error('User not found');

            const amount = membershipType === 'monthly' ? 1500 : 6000;
            const membershipTypeEnum = membershipType === 'monthly' ? 0 : 1;

            console.log('[handleSubmit] Submitting payment:', {
                lawyerId,
                membershipType,
                membershipTypeEnum,
                amount,
                slipFile,
            });

            await uploadMembershipPayment(lawyerId, membershipTypeEnum, amount, slipFileAsset!);

            console.log('[handleSubmit] ✅ Payment uploaded successfully');
            showSuccess("Payment slip uploaded successfully.");
            navigation.replace('PaymentVerification');

        } catch (error: any) {
            console.error('[handleSubmit] ❌ Error:', error.message);
            console.error('[handleSubmit] Full error:', error);
            showError(error.message);
        } finally {
            setUploading(false);
            console.log('=== [handleSubmit] END ===');
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.page}>
                {/* Header */}
                <InitialTopNavbar
                    title="Upload Payement Information"
                    onBack={() => navigation.navigate('Login')}
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

                    {/* Membership Type Selection */}
                    <Text style={styles.sectionLabel}>Select Membership Plan</Text>
                    <View style={styles.membershipRow}>
                        <Pressable
                            style={[styles.membershipCard, membershipType === 'monthly' && styles.membershipCardActive]}
                            onPress={() => setMembershipType('monthly')}
                        >
                            <Text style={[styles.membershipTitle, membershipType === 'monthly' && styles.membershipTitleActive]}>Monthly</Text>
                            <Text style={[styles.membershipPrice, membershipType === 'monthly' && styles.membershipTitleActive]}>Rs. 1,500.00</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.membershipCard, membershipType === 'biannual' && styles.membershipCardActive]}
                            onPress={() => setMembershipType('biannual')}
                        >
                            <Text style={[styles.membershipTitle, membershipType === 'biannual' && styles.membershipTitleActive]}>Bi-Annual</Text>
                            <Text style={[styles.membershipPrice, membershipType === 'biannual' && styles.membershipTitleActive]}>Rs. 6,000.00</Text>
                        </Pressable>
                    </View>

                    {/* Bank Details */}
                    <Text style={styles.bankDetails}>
                        Bank - Bank of Ceylon{"\n"}
                        Branch - Borella{"\n"}
                        Account No - 10002020332{"\n"}
                        Account Holder - LawMate{"\n"}
                        {membershipType ? `Amount - Rs.${membershipType === 'monthly' ? '1,500.00' : '6,000.00'}` : 'Please select a membership plan above'}
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
                        onPress={handleSubmit}
                        loading={uploading}
                        disabled={!confirmed || !membershipType}
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

    sectionLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    membershipRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    membershipCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: 'center',
    },
    membershipCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '15',
    },
    membershipTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    membershipTitleActive: {
        color: colors.primary,
    },
    membershipPrice: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textSecondary,
    },
});