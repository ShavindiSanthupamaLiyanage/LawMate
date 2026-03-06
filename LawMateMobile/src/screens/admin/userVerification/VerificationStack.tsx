import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UserManagementScreen from ".//UserManagementScreen";
import LawyerVerificationScreen from "./LawyerVerificationScreen";
// import ClientVerificationScreen from "./ClientVerificationScreen";

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

            {/*/!*<Stack.Screen*!/*/}
            {/*/!*    name="ClientVerification"*!/*/}
            {/*    // component={ClientVerificationScreen}*/}
            {/*/>*/}
        </Stack.Navigator>
    );
};

export default VerificationStack;