// import React, { useState } from "react";
// import {
//     View,
//     StyleSheet,
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView, Text,
// } from "react-native";
//
// import {colors, fontSize, spacing} from "../../../config/theme";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { RootStackParamList } from "../../../types";
// import { useNavigation } from "@react-navigation/native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
//
// import InitialTopNavbar from "../../../components/InitialTopNavbar";
// import Button from "../../../components/Button";
// import FloatingInput from "../../../components/FloatingInput";
// import SelectInput from "../../../components/SelectInput";
// import { useToast } from "../../../context/ToastContext";
// import ScreenWrapper from "../../../components/ScreenWrapper";
// import UploadCard from "../../../components/UploadCard";
// import * as DocumentPicker from "expo-document-picker";
// import {AntDesign} from "@expo/vector-icons";
//
// export default function ClientSignUpScreen() {
//     const navigation =
//         useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//
//     const insets = useSafeAreaInsets();
//     const { showSuccess } = useToast();
//
//     // Form state
//     const [firstName, setFirstName] = useState("");
//     const [lastName, setLastName] = useState("");
//     const [prefix, setPrefix] = useState("");
//     const [gender, setGender] = useState("");
//     const [address, setAddress] = useState("");
//     const [district, setDistrict] = useState("");
//     const [nic, setNic] = useState("");
//     const [mobileContact, setMobileContact] = useState("");
//     const [email, setEmail] = useState("");
//     const [language, setLanguage] = useState("");
//     const [profilePic, setProfilePic] = useState<string>();
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState('');
//     const [showNewPassword, setShowNewPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const passwordsMatch = password !== '' && confirmPassword !== '' && password === confirmPassword;
//     const passwordsDontMatch = confirmPassword !== '' && password !== confirmPassword;
//     const isButtonEnabled = password !== '' && confirmPassword !== '' && passwordsMatch;
//
//     const pickFile = async (setter: (name: string) => void) => {
//         const result = await DocumentPicker.getDocumentAsync({
//             type: "*/*",
//             copyToCacheDirectory: true,
//         });
//
//         if (result.assets && result.assets.length > 0) {
//             setter(result.assets[0].name);
//         }
//     };
//
//     const handleSubmit = () => {
//         if (!isButtonEnabled) return;
//
//         showSuccess("Account created successfully.");
//         setTimeout(() => {
//             navigation.replace('ClientTabs', {
//                 screen: 'ClientTabNavigator',
//                 params: { screen: 'Dashboard' }
//             });
//         }, 2000);
//     };
//
//     return (
//         <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
//             <View style={styles.container}>
//                 <InitialTopNavbar
//                     title="Create your account"
//                     onBack={() => navigation.goBack()}
//                 />
//
//                 <KeyboardAvoidingView
//                     style={{ flex: 1 }}
//                     behavior={Platform.OS === "ios" ? "padding" : "height"}
//                     keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//                 >
//                     {/* Form */}
//                     <ScrollView
//                         contentContainerStyle={styles.formContainer}
//                         keyboardShouldPersistTaps="handled"
//                         showsVerticalScrollIndicator={false}
//                     >
//                         <FloatingInput
//                             label="First Name"
//                             value={firstName}
//                             onChangeText={setFirstName}
//                         />
//                         <FloatingInput
//                             label="Last Name"
//                             value={lastName}
//                             onChangeText={setLastName}
//                         />
//
//                         <SelectInput
//                             label="Prefix"
//                             value={prefix}
//                             onValueChange={setPrefix}
//                             items={[
//                                 { label: "Rev.", value: "Rev." },
//                                 { label: "Dr.", value: "Dr." },
//                                 { label: "Mr.", value: "Mr." },
//                                 { label: "Mrs.", value: "Mrs." },
//                                 { label: "Ms.", value: "Ms." },
//                             ]}
//                         />
//
//                         <SelectInput
//                             label="Gender"
//                             value={gender}
//                             onValueChange={setGender}
//                             items={[
//                                 { label: "Male", value: "male" },
//                                 { label: "Female", value: "female" },
//                                 { label: "Other", value: "other" },
//                             ]}
//                         />
//
//                         <FloatingInput
//                             label="Address"
//                             value={address}
//                             onChangeText={setAddress}
//                         />
//                         <SelectInput
//                             label="District"
//                             value={district}
//                             onValueChange={setDistrict}
//                             items={[
//                                 { label: "Galle", value: "galle" },
//                                 { label: "Mathara", value: "mathara" },
//                                 { label: "Hambanthota", value: "hambanthota" },
//                             ]}
//                         />
//                         <FloatingInput
//                             label="NIC"
//                             value={nic}
//                             onChangeText={setNic}
//                         />
//                         <FloatingInput
//                             label="Mobile Contact"
//                             value={mobileContact}
//                             onChangeText={setMobileContact}
//                         />
//
//                         <SelectInput
//                             label="Language"
//                             value={language}
//                             onValueChange={setLanguage}
//                             items={[
//                                 { label: "Sinhala", value: "sinhala" },
//                                 { label: "English", value: "english" },
//                                 { label: "Tamil", value: "tamil" },
//                             ]}
//                         />
//
//                         <FloatingInput
//                             label="Email"
//                             value={email}
//                             onChangeText={setEmail}
//                             keyboardType="email-address"
//                         />
//                         <FloatingInput
//                             label="Password"
//                             value={password}
//                             onChangeText={setPassword}
//                             // placeholder="Enter new password"
//                             secureTextEntry={!showNewPassword}
//                             autoCapitalize="none"
//                             rightIcon={
//                                 <AntDesign
//                                     name={showNewPassword ? 'eye' : 'eye-invisible'}
//                                     size={22}
//                                     color={colors.textSecondary}
//                                 />
//                             }
//                             onRightIconPress={() => setShowNewPassword(!showNewPassword)}
//                         />
//                         <FloatingInput
//                             label="Confirm Password"
//                             value={confirmPassword}
//                             onChangeText={setConfirmPassword}
//                             secureTextEntry={!showConfirmPassword}
//                             autoCapitalize="none"
//                             rightIcon={
//                                 <AntDesign
//                                     name={showConfirmPassword ? 'eye' : 'eye-invisible'}
//                                     size={22}
//                                     color={colors.textSecondary}
//                                 />
//                             }
//                             onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
//                         />
//                         {passwordsDontMatch && (
//                             <Text style={styles.errorText}>
//                                 Passwords do not match
//                             </Text>
//                         )}
//                         <View style={styles.uploadSection}>
//                             <View style={styles.uploadRow}>
//                                 <UploadCard
//                                     title="Profile Picture"
//                                     fileName={profilePic}
//                                     onPress={() => pickFile(setProfilePic)}
//                                 />
//                             </View>
//                         </View>
//
//                     </ScrollView>
//
//                     {/* Bottom Button */}
//                     <View
//                         style={{
//                             paddingHorizontal: 16,
//                             paddingTop: spacing.md,
//                             paddingBottom: insets.bottom + spacing.md,
//                             backgroundColor: colors.white,
//                             borderTopWidth: 1,
//                             borderTopColor: colors.borderLight,
//                         }}
//                     >
//                         <Button
//                             title="CREATE ACCOUNT"
//                             variant="primary"
//                             onPress={handleSubmit}
//                         />
//                     </View>
//                 </KeyboardAvoidingView>
//             </View>
//         </ScreenWrapper>
//     );
// }
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.white,
//     },
//     formContainer: {
//         padding: spacing.lg,
//         gap: spacing.md,
//     },
//     uploadSection: {
//         marginTop: spacing.lg,
//     },
//     errorText: {
//         fontSize: fontSize.xs,
//         color: colors.error,
//         marginTop: spacing.xs,
//         marginLeft: spacing.xs,
//     },
//     uploadRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         gap: spacing.sm,
//     },
// });



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