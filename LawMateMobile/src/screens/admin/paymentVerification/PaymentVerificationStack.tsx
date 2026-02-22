import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PaymentVerificationListScreen from "./PaymentVerificationListScreen";
import PaymentVerificationViewScreen from "./PaymentVerificationViewScreen";
import { PaymentVerificationItem } from "./PaymentVerificationCard";

export type PaymentVerificationStackParamList = {
    PaymentVerificationList: undefined;
    PaymentVerificationView: { item: PaymentVerificationItem };
};

const Stack = createNativeStackNavigator<PaymentVerificationStackParamList>();

export default function PaymentVerificationStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="PaymentVerificationList"
                component={PaymentVerificationListScreen}
            />
            <Stack.Screen
                name="PaymentVerificationView"
                component={PaymentVerificationViewScreen}
            />
        </Stack.Navigator>
    );
}