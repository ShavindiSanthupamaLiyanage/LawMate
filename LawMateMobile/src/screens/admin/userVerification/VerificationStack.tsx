import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserManagementScreen from ".//UserManagementScreen";
import LawyerVerificationScreen from "./lawyer/LawyerVerificationScreen";
import ClientVerificationScreen from "./client/ClientVerificationScreen";
import LawyerProfileScreen from "./lawyer/LawyerProfileScreen";
import LawyerProfessionalDetailsScreen from "./lawyer/LawyerProfessionalDetailsScreen";
import AvailabilityScreen from "./lawyer/AvailabilityScreen";
import LawyerPersonalDetailsScreen from "./lawyer/LawyerPersonalDetailsScreen";
import ClientProfileScreen from "./client/ClientProfileScreen";
import ClientPersonalDetailsScreen from "./client/ClientPersonalDetailsScreen";

const Stack = createNativeStackNavigator();

const VerificationStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="UserManagement"
                component={UserManagementScreen}
            />

            <Stack.Screen
                name="LawyerVerification"
                component={LawyerVerificationScreen}
            />

            <Stack.Screen
                name="ClientVerification"
                component={ClientVerificationScreen}
            />
            <Stack.Screen
                name="LawyerProfile"
                component={LawyerProfileScreen}
            />

            <Stack.Screen
                name="LawyerProfessional"
                component={LawyerProfessionalDetailsScreen}
            />

            <Stack.Screen
                name="Availability"
                component={AvailabilityScreen}
            />

            <Stack.Screen
                name="LawyerPersonal"
                component={LawyerPersonalDetailsScreen}
            />
                {/* Client Screens */}
                <Stack.Screen
                    name="ClientProfile"
                    component={ClientProfileScreen}
                />

                <Stack.Screen
                    name="ClientPersonalDetails"
                    component={ClientPersonalDetailsScreen}
                />
        </Stack.Navigator>
    );
};

export default VerificationStack;