import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

import { colors, fontSize, spacing } from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

import InitialTopNavbar from "../../../components/InitialTopNavbar";
import Button from "../../../components/Button";
import FloatingInput from "../../../components/FloatingInput";
import SelectInput from "../../../components/SelectInput";
import ScreenWrapper from "../../../components/ScreenWrapper";
import UploadCard from "../../../components/UploadCard";
import { useToast } from "../../../context/ToastContext";
import { registerClient } from "../../../services/clientRegistrationService";
import { ClientRegistrationDetails } from "../../../interfaces/clientRegistration.interface";
import { Province } from "../../../enum/enum";
import {
    PrefixOptions,
    GenderOptions,
    LanguageOptions,
    ProvinceOptions,
    DistrictsByProvince,
} from "../../../enum/enumOptions";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;
const nicRegex   = /^(\d{9}[VvXx]|\d{12})$/;

const defaultForm = (): ClientRegistrationDetails => ({
    prefix:          -1,
    firstName:       "",
    lastName:        "",
    gender:          -1,
    address:         "",
    district:        -1,
    nic:             "",
    mobileContact:   "",
    language:        -1,
    email:           "",
    password:        "",
    confirmPassword: "",
    profilePic:      null,
});


export default function ClientSignUpScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const insets = useSafeAreaInsets();
    const { showSuccess, showError } = useToast();

    const [form, setForm]     = useState<ClientRegistrationDetails>(defaultForm());
    const [loading, setLoading]                         = useState(false);
    const [showPassword, setShowPassword]               = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Province is UI-only — drives the district dropdown, never sent to backend
    const [province, setProvince] = useState<number>(-1);

    const update = (patch: Partial<ClientRegistrationDetails>) =>
        setForm((prev) => ({ ...prev, ...patch }));


    const districtOptions =
        province !== -1
            ? (DistrictsByProvince[province as Province] ?? [])
            : [];

    const passwordsMatch =
        form.password !== "" &&
        form.confirmPassword !== "" &&
        form.password === form.confirmPassword;

    const passwordsDontMatch =
        form.confirmPassword !== "" && !passwordsMatch;

    const isFormValid = (): boolean =>
        form.prefix         !== -1 &&
        form.firstName.trim()  !== "" &&
        form.lastName.trim()   !== "" &&
        form.gender         !== -1 &&
        form.address.trim()    !== "" &&
        form.district       !== -1 &&
        nicRegex.test(form.nic.trim()) &&
        phoneRegex.test(form.mobileContact) &&
        form.language       !== -1 &&
        emailRegex.test(form.email) &&
        passwordsMatch;

    const pickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ["image/*"],
            copyToCacheDirectory: true,
        });
        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            update({
                profilePic: {
                    uri:      asset.uri,
                    name:     asset.name,
                    mimeType: asset.mimeType ?? 'image/jpeg',
                }
            });
        }
    };

    const handleSubmit = async () => {
        if (!isFormValid()) return;
        setLoading(true);
        try {
            await registerClient(form);
            showSuccess("Account created successfully.");
            setTimeout(() => navigation.replace("Login"), 2000);
        } catch (err: any) {
            showError(err?.message ?? "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
            <View style={styles.container}>
                <InitialTopNavbar
                    title="Create your account"
                    onBack={() => navigation.goBack()}
                />

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
                >
                    <ScrollView
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >

                        <SelectInput
                            label="Prefix"
                            value={form.prefix === -1 ? "" : form.prefix}
                            onValueChange={(v) => update({ prefix: Number(v) })}
                            items={PrefixOptions}
                        />

                        <FloatingInput
                            label="First Name"
                            value={form.firstName}
                            onChangeText={(v) => update({ firstName: v })}
                        />

                        <FloatingInput
                            label="Last Name"
                            value={form.lastName}
                            onChangeText={(v) => update({ lastName: v })}
                        />

                        <SelectInput
                            label="Gender"
                            value={form.gender === -1 ? "" : form.gender}
                            onValueChange={(v) => update({ gender: Number(v) })}
                            items={GenderOptions}
                        />

                        <FloatingInput
                            label="Address"
                            value={form.address}
                            onChangeText={(v) => update({ address: v })}
                        />

                        <SelectInput
                            label="Province"
                            value={province === -1 ? "" : province}
                            onValueChange={(v) => {
                                setProvince(Number(v));
                                update({ district: -1 }); // reset district whenever province changes
                            }}
                            items={ProvinceOptions}
                        />

                        <SelectInput
                            label="District"
                            value={form.district === -1 ? "" : form.district}
                            onValueChange={(v) => update({ district: Number(v) })}
                            items={districtOptions}
                        />

                        <FloatingInput
                            label="NIC"
                            value={form.nic}
                            onChangeText={(v) => update({ nic: v })}
                            autoCapitalize="characters"
                        />
                        {form.nic.trim() !== "" && !nicRegex.test(form.nic.trim()) && (
                            <Text style={styles.errorText}>
                                Enter a valid NIC (9 digits + V/X, or 12 digits)
                            </Text>
                        )}

                        <FloatingInput
                            label="Mobile Contact"
                            value={form.mobileContact}
                            onChangeText={(v) => update({ mobileContact: v })}
                            keyboardType="phone-pad"
                            maxLength={10}
                        />
                        {form.mobileContact !== "" && !phoneRegex.test(form.mobileContact) && (
                            <Text style={styles.errorText}>
                                Enter a valid 10-digit mobile number
                            </Text>
                        )}

                        <SelectInput
                            label="Preferred Language"
                            value={form.language === -1 ? "" : form.language}
                            onValueChange={(v) => update({ language: Number(v) })}
                            items={LanguageOptions}
                        />

                        <FloatingInput
                            label="Email"
                            value={form.email}
                            onChangeText={(v) => update({ email: v })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {form.email !== "" && !emailRegex.test(form.email) && (
                            <Text style={styles.errorText}>
                                Enter a valid email address
                            </Text>
                        )}

                        <FloatingInput
                            label="Password"
                            value={form.password}
                            onChangeText={(v) => update({ password: v })}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            rightIcon={
                                <AntDesign
                                    name={showPassword ? "eye" : "eye-invisible"}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            }
                            onRightIconPress={() => setShowPassword(!showPassword)}
                        />

                        <FloatingInput
                            label="Confirm Password"
                            value={form.confirmPassword}
                            onChangeText={(v) => update({ confirmPassword: v })}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            rightIcon={
                                <AntDesign
                                    name={showConfirmPassword ? "eye" : "eye-invisible"}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            }
                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                        {passwordsDontMatch && (
                            <Text style={styles.errorText}>Passwords do not match</Text>
                        )}

                        <View style={styles.uploadSection}>
                            <UploadCard
                                title="Profile Picture"
                                fileName={form.profilePic?.name ?? undefined}
                                onPress={pickFile}
                            />
                        </View>
                    </ScrollView>

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
                            title={loading ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
                            variant={isFormValid() && !loading ? "primary" : "secondary"}
                            disabled={!isFormValid() || loading}
                            onPress={handleSubmit}
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
    formContainer: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    uploadSection: {
        marginTop: spacing.lg,
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: -spacing.xs,
        marginLeft: spacing.xs,
    },
});