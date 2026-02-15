import React, {useState} from "react";
import {StyleSheet, ScrollView} from "react-native";

import FloatingInput from "../../../components/FloatingInput";
import DateInput from "../../../components/DateInput";
import SelectInput from "../../../components/SelectInput";
import {spacing} from "../../../config/theme";

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
    const [dob, setDob] = useState<Date | null>(null);

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            <FloatingInput label="First Name" value={firstName} onChangeText={setFirstName}/>
            <FloatingInput label="Last Name" value={lastName} onChangeText={setLastName}/>

            <SelectInput
                label="Prefix"
                value={prefix}
                onValueChange={setPrefix}
                items={[
                    {label: "Rev.", value: "Rev."},
                    {label: "Dr.", value: "Dr."},
                    {label: "Mr.", value: "Mr."},
                    {label: "Mrs.", value: "Mrs."},
                    {label: "Ms.", value: "Ms."},
                ]}
            />

            <SelectInput
                label="Gender"
                value={gender}
                onValueChange={setGender}
                items={[
                    {label: "Male", value: "male"},
                    {label: "Female", value: "female"},
                    {label: "Other", value: "other"},
                ]}
            />

            <FloatingInput label="Address" value={address} onChangeText={setAddress}/>
            <FloatingInput label="Office Address" value={officeAddress} onChangeText={setOfficeAddress}/>
            <FloatingInput label="NIC" value={nic} onChangeText={setNic}/>

            <DateInput label="Date of Birth" value={dob} onChange={setDob}/>

            <FloatingInput label="Mobile Contact" value={mobileContact} onChangeText={setMobileContact}/>
            <FloatingInput label="Office Contact" value={officeContact} onChangeText={setOfficeContact}/>
            <FloatingInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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
