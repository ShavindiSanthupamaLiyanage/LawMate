import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import FloatingInput from "../../../components/FloatingInput";
import DateInput from "../../../components/DateInput";
import SelectInput from "../../../components/SelectInput";
import { colors, spacing } from "../../../config/theme";
import { AntDesign } from "@expo/vector-icons";

export default function PersonalDetailsScreen() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [prefix, setPrefix] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [officeAddress, setOfficeAddress] = useState("");
    const [nic, setNic] = useState("");
    const [mobileContact, setMobileContact] = useState("");
    const [officeContact, setOfficeContact] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dob, setDob] = useState<Date | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <FloatingInput label="First Name" value={firstName} onChangeText={setFirstName} />
            <FloatingInput label="Last Name" value={lastName} onChangeText={setLastName} />

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

            <FloatingInput label="Address" value={address} onChangeText={setAddress} />
            <FloatingInput label="Office Address" value={officeAddress} onChangeText={setOfficeAddress} />
            <FloatingInput label="NIC" value={nic} onChangeText={setNic} />

            <DateInput label="Date of Birth" value={dob} onChange={setDob} />

            <FloatingInput label="Mobile Contact" value={mobileContact} onChangeText={setMobileContact} />
            <FloatingInput label="Office Contact" value={officeContact} onChangeText={setOfficeContact} />

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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        gap: spacing.md,
    },
});
