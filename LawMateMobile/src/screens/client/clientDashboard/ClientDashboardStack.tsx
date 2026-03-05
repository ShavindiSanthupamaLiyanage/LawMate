import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ClientDashboard from "./ClientDashboard";
import ClientActivityList from "./ClientActivityList";
import ClientChatbotScreen from "../clientChatbot/ClientChatbotScreen";

export type ClientDashboardStackParamList = {
    ClientDashboardHome: undefined;
    ClientActivityList: undefined;
    ClientChatbot: undefined;
};

const Stack = createNativeStackNavigator<ClientDashboardStackParamList>();

export default function ClientDashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClientDashboardHome" component={ClientDashboard} />
            <Stack.Screen name="ClientActivityList" component={ClientActivityList} />
            <Stack.Screen name="ClientChatbot" component={ClientChatbotScreen} />
        </Stack.Navigator>
    );
}