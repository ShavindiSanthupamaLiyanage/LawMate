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
import GradientHeader from "../../../components/Common/GradientHeader";
import Button from "../../../components/Button";
import {useToast} from "../../../context/ToastContext";

type TabKey = "Personal Details" | "Professional Details";

export default function LawyerSignUpScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] =
        useState<TabKey>("Personal Details");

    const {showSuccess} = useToast();

    const handleSubmit = () => {
        showSuccess('Verification request submitted successfully.');
        setTimeout(() => {
            navigation.replace("VerificationPending");
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <GradientHeader
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
                    onPress={() => setActiveTab("Professional Details")}
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
                        <PersonalDetailsScreen />
                    ) : (
                        <ProfessionalDetailsScreen />
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
                        variant="primary"
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
