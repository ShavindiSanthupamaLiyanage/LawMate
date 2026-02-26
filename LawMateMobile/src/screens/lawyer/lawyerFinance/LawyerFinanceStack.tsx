import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FinanceMain from "./FinanceMain";
import ViewTransactions from "./ViewTransactions";
import EarningsReport from "./EarningsReport";

export type LawyerFinanceStackParamList = {
    FinanceMain: undefined;
    ViewTransactions: undefined;
    EarningsReport: undefined;
};

const Stack = createNativeStackNavigator<LawyerFinanceStackParamList>();

export default function LawyerFinanceStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="FinanceMain" component={FinanceMain} />
            <Stack.Screen name="ViewTransactions" component={ViewTransactions} />
            <Stack.Screen name="EarningsReport" component={EarningsReport} />
        </Stack.Navigator>
    );
}