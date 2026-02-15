import React, { useState } from "react";
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Pressable,
} from "react-native";

import FloatingInput from "../../../components/FloatingInput";
import SelectInput from "../../../components/SelectInput";
import UploadCard from "../../../components/UploadCard";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

import {
    spacing,
    colors,
    fontSize,
    fontFamily,
} from "../../../config/theme";

export default function ProfessionalDetailsScreen() {
    const [certificateNo, setCertificateNo] = useState("");
    const [membershipCategory, setMembershipCategory] = useState("");
    const [designation, setDesignation] = useState("");
    const [areaOfPractice, setAreaOfPractice] = useState("");
    const [barNumber, setBarNumber] = useState("");

    const [certificateFile, setCertificateFile] = useState<string>();
    const [nicFile, setNicFile] = useState<string>();
    const [slipFile, setSlipFile] = useState<string>();

    const [confirmed, setConfirmed] = useState(false);

    const pickFile = async (setter: (name: string) => void) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
            setter(result.assets[0].name);
        }
    };

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {/* Inputs */}
            <FloatingInput
                label="Supreme Court Enrollment No"
                value={certificateNo}
                onChangeText={setCertificateNo}
            />

            <SelectInput
                label="Membership Category"
                value={membershipCategory}
                onValueChange={setMembershipCategory}
                items={[
                    { label: "Junior Counsel", value: "junior" },
                    { label: "Senior Counsel", value: "senior" },
                    { label: "President’s Counsel", value: "president" },
                ]}
            />

            <FloatingInput
                label="Professional Designation"
                value={designation}
                onChangeText={setDesignation}
            />

            <SelectInput
                label="Area of Practice"
                value={areaOfPractice}
                onValueChange={setAreaOfPractice}
                items={[
                    { label: "Criminal Law", value: "criminal" },
                    { label: "Civil Law", value: "civil" },
                    { label: "Corporate Law", value: "corporate" },
                    { label: "Family Law", value: "family" },
                ]}
            />

            <FloatingInput
                label="BAR Association Registration No"
                value={barNumber}
                onChangeText={setBarNumber}
            />

            {/* Bank Section */}
            <View style={styles.bankSection}>
                <Text style={styles.bankText}>
                    To complete the registration please make the payment for
                    the following bank account for the membership fee and
                    upload the slip.
                </Text>

                <Text style={styles.bankDetails}>
                    Bank - Bank of Ceylon{"\n"}
                    Branch - Borella{"\n"}
                    Account No - 10002020332{"\n"}
                    Account Holder - M.A.Perera{"\n"}
                    Amount - Rs.15,000.00
                </Text>
            </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
                <View style={styles.uploadRow}>
                    <UploadCard
                        title="Supreme Court Enr. Certificate"
                        fileName={certificateFile}
                        onPress={() => pickFile(setCertificateFile)}
                    />

                    <UploadCard
                        title="National Identity Card (Back/Front)"
                        fileName={nicFile}
                        onPress={() => pickFile(setNicFile)}
                    />
                </View>

                <UploadCard
                    title="Membership Fee Pay Slip"
                    fileName={slipFile}
                    onPress={() => pickFile(setSlipFile)}
                />
            </View>

            {/* Confirmation */}
            <View style={styles.checkboxContainer}>
                <Pressable
                    style={[
                        styles.checkbox,
                        confirmed && styles.checkboxActive,
                    ]}
                    onPress={() => setConfirmed(!confirmed)}
                >
                    {confirmed && (
                        <Ionicons
                            name="checkmark"
                            size={16}
                            color={colors.white}
                        />
                    )}
                </Pressable>

                <Text style={styles.checkboxText}>
                    I confirm that the details are accurate
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        gap: spacing.md,
    },

    bankSection: {
        marginTop: spacing.lg,
    },

    bankText: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.medium,
        color: colors.textSecondary,
        marginBottom: spacing.md,
        lineHeight: 18,
    },

    bankDetails: {
        fontSize: fontSize.sm,
        fontFamily: fontFamily.semibold,
        color: colors.textPrimary,
        lineHeight: 20,
    },

    uploadSection: {
        marginTop: spacing.lg,
    },

    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacing.sm,
    },

    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: spacing.lg,
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
        fontFamily: fontFamily.medium,
        color: colors.textPrimary,
    },
});
