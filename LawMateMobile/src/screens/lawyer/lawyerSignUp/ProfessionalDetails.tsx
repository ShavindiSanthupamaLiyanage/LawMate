import React, {useState} from "react";
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

import { spacing, colors, fontSize, fontWeight } from "../../../config/theme";

import {
    FileAsset,
    LawyerProfessionalDetails,
} from "../../../interfaces/lawyerRegistration.interface";
import {AreaOfPracticeOptions, DistrictsByProvince, ProvinceOptions} from "../../../emun/enumOptions";
import {District, Province} from "../../../emun/enum";

interface Props {
    values: LawyerProfessionalDetails;
    onChange: (patch: Partial<LawyerProfessionalDetails>) => void;
}

export default function ProfessionalDetailsScreen({ values, onChange }: Props) {

    // Pick a document and store the full asset (uri + name + mimeType)
    const pickFile = async (
        field: keyof Pick<
            LawyerProfessionalDetails,
            "enrollmentCertificate" | "nicFrontImage" | "nicBackImage" | "profileImage"
        >
    ) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const fileAsset: FileAsset = {
                uri: asset.uri,
                name: asset.name,
                mimeType: asset.mimeType ?? undefined,
                size: asset.size ?? undefined,
            };
            onChange({ [field]: fileAsset });
        }
    };

    const [selectedProvince, setSelectedProvince] = useState<Province | undefined>(undefined);
    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            <FloatingInput
                label="Supreme Court Enrollment No"
                value={values.sceCertificateNo}
                onChangeText={(v) => onChange({ sceCertificateNo: v })}
            />

            <FloatingInput
                label="Professional Designation"
                value={values.designation}
                onChangeText={(v) => onChange({ designation: v })}
            />

            <SelectInput
                label="Area of Practice"
                value={values.areaOfPractice === "" ? undefined : values.areaOfPractice}
                onValueChange={(v) => onChange({ areaOfPractice: v })}
                items={AreaOfPracticeOptions}
            />

            <FloatingInput
                label="BAR Association Registration No"
                value={values.barAssociationRegNo}
                onChangeText={(v) => onChange({ barAssociationRegNo: v })}
            />

            <FloatingInput
                label="Years of Experience"
                value={values.yearOfExperience}
                onChangeText={(v) => onChange({ yearOfExperience: v })}
                keyboardType="numeric"
            />

            <SelectInput
                label="Province"
                value={selectedProvince}
                onValueChange={(v) => {
                    setSelectedProvince(v as Province);
                    onChange({ workingDistrict: undefined });
                }}
                items={ProvinceOptions}
            />

            <View pointerEvents={selectedProvince !== undefined ? "auto" : "none"}
                  style={{ opacity: selectedProvince !== undefined ? 1 : 0.4 }}>
                <SelectInput
                    label="Working District"
                    value={values.workingDistrict}
                    onValueChange={(v) => onChange({ workingDistrict: v as District })}
                    items={selectedProvince !== undefined ? DistrictsByProvince[selectedProvince] : []}
                />
            </View>

            <Pressable
                style={styles.checkboxContainer}
                onPress={() => onChange({ barAssociationMembership: !values.barAssociationMembership })}
            >
                <View style={[styles.checkbox, values.barAssociationMembership && styles.checkboxActive]}>
                    {values.barAssociationMembership && (
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                </View>
                <Text style={styles.checkboxText}>Member of the Bar Association</Text>
            </Pressable>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
                <View style={styles.uploadRow}>
                    <UploadCard
                        title="Supreme Court Enr. Certificate"
                        fileName={values.enrollmentCertificate?.name}
                        uri={values.enrollmentCertificate?.uri}       // add this
                        onPress={() => pickFile("enrollmentCertificate")}
                    />
                    <UploadCard
                        title="National Identity (Front)"
                        fileName={values.nicFrontImage?.name}
                        uri={values.nicFrontImage?.uri}               // add this
                        onPress={() => pickFile("nicFrontImage")}
                    />
                </View>

                <View style={styles.uploadRow}>
                    <UploadCard
                        title="National Identity (Back)"
                        fileName={values.nicBackImage?.name}
                        uri={values.nicBackImage?.uri}                // add this
                        onPress={() => pickFile("nicBackImage")}
                    />
                    <UploadCard
                        title="Profile Photo"
                        fileName={values.profileImage?.name}
                        uri={values.profileImage?.uri}                // add this
                        onPress={() => pickFile("profileImage")}
                    />
                </View>
            </View>

            {/* Confirmation checkbox */}
            <View style={styles.checkboxContainer}>
                <Pressable
                    style={[
                        styles.checkbox,
                        values.confirmed && styles.checkboxActive,
                    ]}
                    onPress={() => onChange({ confirmed: !values.confirmed })}
                >
                    {values.confirmed && (
                        <Ionicons name="checkmark" size={16} color={colors.white} />
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
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
});