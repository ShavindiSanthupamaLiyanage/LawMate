import React, { useState } from "react";
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView, Text,
} from "react-native";

import {colors, fontSize, spacing} from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../types";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import InitialTopNavbar from "../../../components/InitialTopNavbar";
import Button from "../../../components/Button";
import FloatingInput from "../../../components/FloatingInput";
import SelectInput from "../../../components/SelectInput";
import { useToast } from "../../../context/ToastContext";
import ScreenWrapper from "../../../components/ScreenWrapper";
import UploadCard from "../../../components/UploadCard";
import * as DocumentPicker from "expo-document-picker";
import {AntDesign} from "@expo/vector-icons";

export default function ClientSignUpScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const insets = useSafeAreaInsets();
    const { showSuccess } = useToast();

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [prefix, setPrefix] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [district, setDistrict] = useState("");
    const [nic, setNic] = useState("");
    const [mobileContact, setMobileContact] = useState("");
    const [email, setEmail] = useState("");
    const [language, setLanguage] = useState("");
    const [profilePic, setProfilePic] = useState<string>();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordsMatch = password !== '' && confirmPassword !== '' && password === confirmPassword;
    const passwordsDontMatch = confirmPassword !== '' && password !== confirmPassword;
    const isButtonEnabled = password !== '' && confirmPassword !== '' && passwordsMatch;

    const pickFile = async (setter: (name: string) => void) => {
        const result = await DocumentPicker.getDocumentAsync({
            type: "*/*",
            copyToCacheDirectory: true,
        });

        if (result.assets && result.assets.length > 0) {
            setter(result.assets[0].name);
        }
    };

    const handleSubmit = () => {
        if (!isButtonEnabled) return;

        showSuccess("Account created successfully.");
        setTimeout(() => {
            navigation.replace('ClientTabs', {
                screen: 'Dashboard',
            });
        }, 2000);
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
                    {/* Form */}
                    <ScrollView
                        contentContainerStyle={styles.formContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <FloatingInput
                            label="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <FloatingInput
                            label="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />

                        <SelectInput
                            label="Prefix"
                            value={prefix}
                            onValueChange={setPrefix}
                            items={[
                                { label: "Rev.", value: "Rev." },
                                { label: "Dr.", value: "Dr." },
                                { label: "Mr.", value: "Mr." },
                                { label: "Mrs.", value: "Mrs." },
                                { label: "Ms.", value: "Ms." },
                            ]}
                        />

                        <SelectInput
                            label="Gender"
                            value={gender}
                            onValueChange={setGender}
                            items={[
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "Other", value: "other" },
                            ]}
                        />

                        <FloatingInput
                            label="Address"
                            value={address}
                            onChangeText={setAddress}
                        />
                        <SelectInput
                            label="District"
                            value={district}
                            onValueChange={setDistrict}
                            items={[
                                { label: "Galle", value: "galle" },
                                { label: "Mathara", value: "mathara" },
                                { label: "Hambanthota", value: "hambanthota" },
                            ]}
                        />
                        <FloatingInput
                            label="NIC"
                            value={nic}
                            onChangeText={setNic}
                        />
                        <FloatingInput
                            label="Mobile Contact"
                            value={mobileContact}
                            onChangeText={setMobileContact}
                        />

                        <SelectInput
                            label="Language"
                            value={language}
                            onValueChange={setLanguage}
                            items={[
                                { label: "Sinhala", value: "sinhala" },
                                { label: "English", value: "english" },
                                { label: "Tamil", value: "tamil" },
                            ]}
                        />

                        <FloatingInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                        <FloatingInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            // placeholder="Enter new password"
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            rightIcon={
                                <AntDesign
                                    name={showNewPassword ? 'eye' : 'eye-invisible'}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            }
                            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                        />
                        <FloatingInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            rightIcon={
                                <AntDesign
                                    name={showConfirmPassword ? 'eye' : 'eye-invisible'}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            }
                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                        {passwordsDontMatch && (
                            <Text style={styles.errorText}>
                                Passwords do not match
                            </Text>
                        )}
                        <View style={styles.uploadSection}>
                            <View style={styles.uploadRow}>
                                <UploadCard
                                    title="Profile Picture"
                                    fileName={profilePic}
                                    onPress={() => pickFile(setProfilePic)}
                                />
                            </View>
                        </View>

                    </ScrollView>

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
                            title="CREATE ACCOUNT"
                            variant="primary"
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
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    uploadRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacing.sm,
    },
});