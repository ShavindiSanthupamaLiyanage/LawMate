import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientDashboard from "./ClientDashboard";
import ClientActivityList from "./ClientActivityList";

export type ClientDashboardStackParamList = {
    ClientDashboardHome: undefined;
    ClientActivityList: undefined;
};

const Stack = createNativeStackNavigator<ClientDashboardStackParamList>();

export default function ClientDashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientDashboardHome" component={ClientDashboard} />
            <Stack.Screen name="ClientActivityList" component={ClientActivityList} />
        </Stack.Navigator>
    );
}