import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserManagementScreen from ".//UserManagementScreen";
import LawyerVerificationScreen from "./LawyerVerificationScreen";
import ClientVerificationScreen from "./ClientVerificationScreen";
import LawyerProfileScreen from "./LawyerProfileScreen";
import LawyerProfessionalDetailsScreen from "./LawyerProfessionalDetailsScreen";
import AvailabilityScreen from "./AvailabilityScreen";
import LawyerPersonalDetailsScreen from "./LawyerPersonalDetailsScreen";

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
        </Stack.Navigator>
    );
};

export default VerificationStack;