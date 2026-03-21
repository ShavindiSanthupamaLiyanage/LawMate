import React, { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {colors, fontWeight, spacing} from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PersonalDetailsScreen from "./PersonalDetails";
import ProfessionalDetailsScreen from "./ProfessionalDetails";
import InitialTopNavbar from "../../../components/InitialTopNavbar";
import Button from "../../../components/Button";
import {useToast} from "../../../context/ToastContext";
import ScreenWrapper from "../../../components/ScreenWrapper";
import {LawyerPersonalDetails, LawyerProfessionalDetails} from "../../../interfaces/lawyerRegistration.interface";
import {registerLawyer} from "../../../services/lawyerRegistrationService";

type TabKey = "Personal Details" | "Professional Details";

const defaultPersonal = (): LawyerPersonalDetails => ({
    prefix: "",
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    officeAddress: "",
    nic: "",
    mobileContact: "",
    officeContact: "",
    email: "",
    password: "",
    confirmPassword: "",
});

const defaultProfessional = (): LawyerProfessionalDetails => ({
    sceCertificateNo: "",
    barAssociationMembership: false,
    designation: "",
    areaOfPractice: "",
    barAssociationRegNo: "",
    yearOfExperience: "",
    workingDistrict: "",
    enrollmentCertificate: null,
    nicFrontImage: null,
    nicBackImage: null,
    profileImage: null,
    confirmed: false,
});

export default function LawyerSignUpScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] =
        useState<TabKey>("Personal Details");
    // @ts-ignore
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    const [personal, setPersonal] =
        useState<LawyerPersonalDetails>(defaultPersonal());
    const [professional, setProfessional] =
        useState<LawyerProfessionalDetails>(defaultProfessional());

    const updatePersonal = (patch: Partial<LawyerPersonalDetails>) =>
        setPersonal((prev) => ({ ...prev, ...patch }));

    const updateProfessional = (patch: Partial<LawyerProfessionalDetails>) =>
        setProfessional((prev) => ({ ...prev, ...patch }));

    const passwordsMatch =
        personal.password !== "" &&
        personal.confirmPassword !== "" &&
        personal.password === personal.confirmPassword;

    // const isSubmitDisabled = activeTab === "Professional Details" && !professional.confirmed;

    const isPersonalValid = (): boolean => {
        const phoneRegex = /^\d{10}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return (
            personal.firstName.trim() !== "" &&
            personal.lastName.trim() !== "" &&
            personal.prefix !== "" &&
            personal.gender !== "" &&
            personal.address.trim() !== "" &&
            personal.officeAddress.trim() !== "" &&
            personal.nic.trim() !== "" &&
            phoneRegex.test(personal.mobileContact) &&
            phoneRegex.test(personal.officeContact) &&
            emailRegex.test(personal.email) &&
            passwordsMatch
        );
    };

    const isProfessionalValid = (): boolean => {
        return (
            professional.sceCertificateNo.trim() !== "" &&
            professional.designation.trim() !== "" &&
            professional.areaOfPractice !== "" &&
            professional.yearOfExperience.trim() !== "" &&
            professional.workingDistrict !== undefined &&
            professional.enrollmentCertificate !== null &&
            professional.nicFrontImage !== null &&
            professional.nicBackImage !== null &&
            (!professional.barAssociationMembership || professional.barAssociationRegNo.trim() !== "") &&
            professional.confirmed
        );
    };

    const isNextDisabled = activeTab === "Personal Details" && !isPersonalValid();
    const isSubmitDisabled = activeTab === "Professional Details" && !isProfessionalValid();

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await registerLawyer({ ...personal, ...professional });
            showSuccess("Verification request submitted successfully.");
            setTimeout(() => navigation.replace("VerificationPending"), 3000);
        } catch (err: any) {
            showError(err?.message ?? "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View style={styles.container}>
            <InitialTopNavbar
                title="Create your account"
                onBack={() => navigation.goBack()}
            />

            {/* Tabs */}
            <View style={styles.tabRow}>
                <Pressable
                    onPress={() => setActiveTab("Personal Details")}
                    style={styles.tab}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Personal Details" &&
                            styles.tabTextActive,
                        ]}
                    >
                        Personal Details
                    </Text>

                    {activeTab === "Personal Details" && (
                        <View style={styles.underline} />
                    )}
                </Pressable>

                <Pressable
                    onPress={() => isPersonalValid() && setActiveTab("Professional Details")}
                    style={styles.tab}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Professional Details" &&
                            styles.tabTextActive,
                        ]}
                    >
                        Professional Details
                    </Text>

                    {activeTab === "Professional Details" && (
                        <View style={styles.underline} />
                    )}
                </Pressable>
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                {/* Form */}
                <View style={{ flex: 1 }}>
                    {activeTab === "Personal Details" ? (
                        <PersonalDetailsScreen
                            values={personal}
                            onChange={updatePersonal}
                        />
                    ) : (
                        <ProfessionalDetailsScreen
                            values={professional}
                            onChange={updateProfessional}
                        />
                    )}
                </View>

                {/* Bottom Button */}
                <View
                    style={{
                        paddingHorizontal: 16,
                        paddingTop: spacing.md,
                        paddingBottom: insets.bottom + spacing.md,
                        backgroundColor: colors.white,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderLight,
                    }}
                >
                    <Button
                        title={
                            activeTab === "Personal Details"
                                ? "SAVE AND NEXT"
                                : "SUBMIT FOR VERIFICATION"
                        }
                        variant={isNextDisabled || isSubmitDisabled ? "secondary" : "primary"}
                        disabled={isNextDisabled || isSubmitDisabled}
                        onPress={() => {
                            if (activeTab === "Personal Details") {
                                setActiveTab("Professional Details");
                            } else {
                                handleSubmit();
                            }
                        }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },

    tabRow: {
        flexDirection: "row",
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingTop: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    tab: {
        flex: 1,
        alignItems: "center",
        paddingBottom: 10,
    },

    tabText: {
        fontWeight: fontWeight.medium,
        fontSize: 14,
        color: colors.textSecondary,
    },

    tabTextActive: {
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },

    underline: {
        marginTop: 8,
        height: 3,
        width: "70%",
        borderRadius: 999,
        backgroundColor: colors.primary,
    },
});