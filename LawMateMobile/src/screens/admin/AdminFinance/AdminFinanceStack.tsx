import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FinanceListScreen from "./AllFinanceListScreen";
// import FinanceViewScreen from "./ViewFinanceDetailScreen";
import { colors } from "../../../config/theme";
import ViewFinanceDetailScreen from "./ViewFinanceDetailScreen";

export interface FinanceItem {
    id: string;
    name: string;
    category: string;
    code: string;
    amount: string;
    status: "Pending" | "Paid Out";
    email?: string;
    phone?: string;
    serviceType?: string;
    duration?: string;
    sessionDate?: string;
    baseAmount?: string;
    platformFee?: string;
    totalAmount?: string;
}

export type AdminFinanceStackParamList = {
    FinanceList: undefined;
    FinanceView: { item: FinanceItem };
};

const Stack = createNativeStackNavigator<AdminFinanceStackParamList>();

const AdminFinanceStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                    fontWeight: "600",
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="FinanceList"
                component={FinanceListScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="FinanceView"
                component={ViewFinanceDetailScreen}
                options={{
                    title: "Finance Details",
                    headerBackTitle: "Back",
                }}
            />
        </Stack.Navigator>
    );
};

export default AdminFinanceStack;