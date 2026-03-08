import React, { useState } from "react";
import { StyleSheet, ScrollView, Text } from "react-native";
import FloatingInput from "../../../components/FloatingInput";
import DateInput from "../../../components/DateInput";
import SelectInput from "../../../components/SelectInput";
import { colors, spacing } from "../../../config/theme";
import { AntDesign } from "@expo/vector-icons";
import { LawyerPersonalDetails } from "../../../interfaces/lawyerRegistration.interface";
import {GenderOptions, PrefixOptions} from "../../../emun/enumOptions";

interface Props {
    values: LawyerPersonalDetails;
    onChange: (patch: Partial<LawyerPersonalDetails>) => void;
}

export default function PersonalDetailsScreen({ values, onChange }: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <FloatingInput
                label="First Name"
                value={values.firstName}
                onChangeText={(v) => onChange({ firstName: v })}
            />
            <FloatingInput
                label="Last Name"
                value={values.lastName}
                onChangeText={(v) => onChange({ lastName: v })}
            />

            <SelectInput
                label="Prefix"
                value={values.prefix === "" ? undefined : values.prefix}
                onValueChange={(v) => onChange({ prefix: v })}
                items={PrefixOptions}
            />

            <SelectInput
                label="Gender"
                value={values.gender === "" ? undefined : values.gender}
                onValueChange={(v) => onChange({ gender: v })}
                items={GenderOptions}
            />

            <FloatingInput
                label="Address"
                value={values.address}
                onChangeText={(v) => onChange({ address: v })}
            />
            <FloatingInput
                label="Office Address"
                value={values.officeAddress}
                onChangeText={(v) => onChange({ officeAddress: v })}
            />
            <FloatingInput
                label="NIC"
                value={values.nic}
                onChangeText={(v) => onChange({ nic: v })}
            />

            <DateInput
                label="Date of Birth"
                value={values.dob}
                onChange={(v) => onChange({ dob: v })}
            />

            <FloatingInput
                label="Mobile Contact"
                value={values.mobileContact}
                onChangeText={(v) => onChange({ mobileContact: v })}
                keyboardType="phone-pad"
            />
            {values.mobileContact !== "" && !/^\d{10}$/.test(values.mobileContact) && (
                <Text style={styles.errorText}>Mobile number must be 10 digits</Text>
            )}

            <FloatingInput
                label="Office Contact"
                value={values.officeContact}
                onChangeText={(v) => onChange({ officeContact: v })}
                keyboardType="phone-pad"
            />
            {values.officeContact !== "" && !/^\d{10}$/.test(values.officeContact) && (
                <Text style={styles.errorText}>Office number must be 10 digits</Text>
            )}

            <FloatingInput
                label="Email"
                value={values.email}
                onChangeText={(v) => onChange({ email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {values.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) && (
                <Text style={styles.errorText}>Enter a valid email address</Text>
            )}

            <FloatingInput
                label="Password"
                value={values.password}
                onChangeText={(v) => onChange({ password: v })}
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
                value={values.confirmPassword}
                onChangeText={(v) => onChange({ confirmPassword: v })}
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
            {values.confirmPassword !== "" && values.password !== values.confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        gap: spacing.md,
    },

    errorText: {
        fontSize: 12,
        color: colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
});