import 'react-native-gesture-handler';
import './polyfills';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import { colors } from './src/config/theme';

import {
    RootStackParamList, LawyerTabParamList,
    ClientTabParamList, AdminTabParamList
} from './src/types';

// Auth Screens
import SplashScreen from './src/screens/common/SplashScreen';
import WelcomeScreen from './src/screens/common/WelcomeScreen';
import LoginScreen from './src/screens/common/loginScreen/LoginScreen';
import ResetPasswordScreen from "./src/screens/common/forgetPasswordScreen/ResetPassword";
import PaymentVerificationStack from "./src/screens/admin/paymentVerification/PaymentVerificationStack";

// Lawyer Screens
import LawyerDashboard from './src/screens/lawyer/LawyerDashboard';
import LawyerSignUpScreen from './src/screens/lawyer/lawyerSignUp/LawyerSignUpScreen';
import LawyerProfileScreen from './src/screens/lawyer/lawyerProfile/LawyerProfileScreen';
import LawyerPersonalDetailsScreen from './src/screens/lawyer/lawyerProfile/LawyerPersonalDetailsScreen';
import LawyerProfessionalDetailsScreen from './src/screens/lawyer/lawyerProfile/LawyerProfessionalDetailsScreen';
import LawyerRequests from './src/screens/lawyer/lawyerRequest/LawyerRequests';
import AppointmentView from './src/screens/lawyer/lawyerRequest/AppointmentView';
import LawyerFinanceStack from "./src/screens/lawyer/lawyerFinance/LawyerFinanceStack";
import LawyerKnowledgeHubFeed from './src/screens/lawyer/lawyerKnowledgeHub/LawyerKnowledgeHubFeed';

// Client Screens
import ClientSignUpScreen from './src/screens/client/clientSignUp/ClientSignUpScreen';
import ClientProfileScreen from './src/screens/client/clientProfile/ClientProfileScreen';
import ClientPersonalDetailsScreen from './src/screens/client/clientProfile/ClientPersonalDetailsScreen';
import ClientKnowledgeHub from "./src/screens/client/clientKnowledgeHub/ClientKnowledgeHub";
import ClientRequests from './src/screens/client/clientRequest/ClientRequests'
import ClientAppointmentView from './src/screens/client/clientRequest/ClientAppointmentView'
import PaymentSlipScreen from './src/screens/client/clientRequest/PaymentSlipScreen';
import PaymentSlipReceivedScreen from './src/screens/client/clientRequest/PaymentSlipReceivedScreen';
import ClientDashboardStack from "./src/screens/client/clientDashboard/ClientDashboardStack";

// Admin Screens
import AdminDashboard from './src/screens/admin/AdminDashboard';
import AdminProfileScreen from './src/screens/admin/adminProfile/AdminProfileScreen';
import AdminPersonalDetailsScreen from './src/screens/admin/adminProfile/AdminPersonalDetailsScreen';

// Shared Screens
import AvailabilityScreen from './src/screens/common/AvailabilityScreen';
import SettingsPreferencesScreen from './src/screens/common/SettingsPreferencesScreen';
import HelpScreen from './src/screens/common/HelpScreen';

// Placeholder Screens
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
// import TabIcon from "./src/components/TabIcon";
import VerificationPending from "./src/screens/lawyer/lawyerSignUp/VerificationPending";
import TabIcon from "./src/components/BottomNavBar";
import ForgotPasswordScreen from "./src/screens/common/forgetPasswordScreen/ForgotPassword";
import ReportsScreen from "./src/screens/admin/reports/ReportsScreen";
import UserVerificationScreen from "./src/screens/admin/userVerificatopm/UserVerificationScreen";
import AdminFinanceStack from "./src/screens/admin/adminFinance/AdminFinanceStack";
import PaymentSubmission from "./src/screens/lawyer/lawyerSignUp/PaymentSubmission";
import PaymentVerification from "./src/screens/lawyer/lawyerSignUp/PaymentVerification";
import ContactsScreen from "./src/screens/client/contacts/ContactsScreen";
// import FinanceMain from "./src/screens/lawyer/lawyerFinance/FinanceMain";
// import ViewTransactions from "./src/screens/lawyer/lawyerFinance/ViewTransactions";
// import EarningsReport from "./src/screens/lawyer/lawyerFinance/EarningsReport";
import LawyerRequests from './src/screens/lawyer/lawyerRequest/LawyerRequests';
import AppointmentView from './src/screens/lawyer/lawyerRequest/AppointmentView';
import LawyerFinanceStack from "./src/screens/lawyer/lawyerFinance/LawyerFinanceStack";
import {AuthProvider} from "./src/context/AuthContext";

import AddNewArticle from './src/screens/lawyer/lawyerKnowledgeHub/LawyerKnowledgeHubAddNew';
import ManageArticle from './src/screens/lawyer/lawyerKnowledgeHub/LawyerKnowledgeHubManage';


const Stack = createNativeStackNavigator<RootStackParamList>();
const LawyerTab = createBottomTabNavigator<LawyerTabParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

const LawyerStack = createNativeStackNavigator();
const ClientStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

function LawyerRequestsStack() {
    return (
        <LawyerStack.Navigator screenOptions={{ headerShown: false }}>
            <LawyerStack.Screen name="LawyerRequestsList" component={LawyerRequests} />
            <LawyerStack.Screen name="AppointmentView" component={AppointmentView} />
        </LawyerStack.Navigator>
    );
}

function ClientRequestsStackNavigator() {
    return (
        <ClientStack.Navigator screenOptions={{ headerShown: false }}>
            <ClientStack.Screen name="ClientRequestsList" component={ClientRequests} />
            <ClientStack.Screen name="ClientAppointmentView" component={ClientAppointmentView} />
            <ClientStack.Screen name="PaymentSlipScreen" component={PaymentSlipScreen} />
            <ClientStack.Screen name="PaymentSlipReceivedScreen" component={PaymentSlipReceivedScreen} />
        </ClientStack.Navigator>
    );
}
// Lawyer Bottom Tabs (Only visible tabs)
function LawyerTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <LawyerTab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom + 10,
                    paddingTop: 10,
                    borderTopWidth: 1,
                    borderTopColor: colors.borderLight,
                    backgroundColor: colors.white,
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    marginTop: 4,
                },
                headerShown: false,
            }}
        >
            <LawyerTab.Screen
                name="Requests"
                component={LawyerRequestsStack}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="mail-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Finance"
                component={LawyerFinanceStack}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="cash-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Dashboard"
                component={LawyerDashboard}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} isHome={true} />
                    ),
                    tabBarLabel: '',
                }}
            />

            <LawyerTab.Screen
                name="Knowledge"
                component={LawyerKnowledgeHubFeed}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="book-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Calendar"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="calendar-outline" color={color} focused={focused} />
                    ),
                }}
            />

        </LawyerTab.Navigator>
    );
}

// Lawyer Stack (includes tabs + profile screens)
function LawyerTabs() {
    return (
        <LawyerStack.Navigator screenOptions={{ headerShown: false }}>
            <LawyerStack.Screen name="LawyerTabNavigator" component={LawyerTabNavigator} />
            <LawyerStack.Screen name="LawyerProfile" component={LawyerProfileScreen} />
            <LawyerStack.Screen name="LawyerPersonalDetails" component={LawyerPersonalDetailsScreen} />
            <LawyerStack.Screen name="LawyerProfessionalDetails" component={LawyerProfessionalDetailsScreen} />
            <LawyerStack.Screen name="Availability" component={AvailabilityScreen} />
            <LawyerStack.Screen name="SettingsPreferences" component={SettingsPreferencesScreen} />
            <LawyerStack.Screen name="Help" component={HelpScreen} />
            <LawyerStack.Screen name="AddNewArticle" component={AddNewArticle} />
            <LawyerStack.Screen name="ManageArticle" component={ManageArticle} />

        </LawyerStack.Navigator>
    );
}

// Client Bottom Tabs (Only visible tabs)
function ClientTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <ClientTab.Navigator screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
                height: 70 + insets.bottom,
                paddingBottom: insets.bottom + 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
                backgroundColor: colors.white,
                elevation: 5,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                marginTop: 4,
            },
            headerShown: false,
        }}>
            <ClientTab.Screen
                name="Requests"
                component={ClientRequestsStackNavigator}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="mail-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Lawyers"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="search-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Dashboard"
                component={ClientDashboardStack}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} isHome={true} />
                    ),
                    tabBarLabel: '',
                }}
            />

            <ClientTab.Screen
                name="Knowledge"
                component={ClientKnowledgeHub}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="book-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Contacts"
                component={ContactsScreen}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="chatbubble-outline" color={color} focused={focused} />
                    ),
                }}
            />
        </ClientTab.Navigator>
    );
}

// Client Stack (includes tabs + profile screens)
function ClientTabs() {
    return (
        <ClientStack.Navigator screenOptions={{ headerShown: false }}>
            <ClientStack.Screen name="ClientTabNavigator" component={ClientTabNavigator} />
            <ClientStack.Screen name="ClientProfile" component={ClientProfileScreen} />
            <ClientStack.Screen name="ClientPersonalDetails" component={ClientPersonalDetailsScreen} />
            <ClientStack.Screen name="SettingsPreferences" component={SettingsPreferencesScreen} />
            <ClientStack.Screen name="Help" component={HelpScreen} />
        </ClientStack.Navigator>
    );
}

// Admin Bottom Tabs (Only visible tabs)
function AdminTabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <AdminTab.Navigator screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            tabBarStyle: {
                height: 70 + insets.bottom,
                paddingBottom: insets.bottom + 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: colors.borderLight,
                backgroundColor: colors.white,
                elevation: 5,
            },
            tabBarLabelStyle: {
                fontSize: 11,
                marginTop: 4,
            },
            headerShown: false,
        }}>
            <AdminTab.Screen
                name="Verifications"
                component={UserVerificationScreen}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="bookmark-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Finance"
                component={AdminFinanceStack}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="cash-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Dashboard"
                component={AdminDashboard}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} isHome={true} />
                    ),
                    tabBarLabel: '',
                }}
            />

            <AdminTab.Screen
                name="Payment"
                component={PaymentVerificationStack}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="person-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Reports"
                component={ReportsScreen}
                options={{
                    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
                        <TabIcon iconName="document-text-outline" color={color} focused={focused} />
                    ),
                }}
            />
        </AdminTab.Navigator>
    );
}

// Admin Stack (includes tabs + profile screens)
function AdminTabs() {
    return (
        <AdminStack.Navigator screenOptions={{ headerShown: false }}>
            <AdminStack.Screen name="AdminTabNavigator" component={AdminTabNavigator} />
            <AdminStack.Screen name="AdminProfile" component={AdminProfileScreen} />
            <AdminStack.Screen name="AdminPersonalDetails" component={AdminPersonalDetailsScreen} />
            <AdminStack.Screen name="SettingsPreferences" component={SettingsPreferencesScreen} />
            <AdminStack.Screen name="Help" component={HelpScreen} />
        </AdminStack.Navigator>
    );
}

// Main App Navigation
export default function App() {
    return (
        <SafeAreaProvider>
            <ToastProvider>
                <AuthProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName="Splash"
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: colors.primary,
                            },
                            headerTintColor: colors.white,
                            headerTitleStyle: {
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        {/* Auth Stack */}
                        <Stack.Screen
                            name="Splash"
                            component={SplashScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Welcome"
                            component={WelcomeScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="LawyerSignUp"
                            component={LawyerSignUpScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ClientSignUp"
                            component={ClientSignUpScreen}
                            options={{ headerShown: false }}
                        />

                        <Stack.Screen
                            name="ResetPassword"
                            component={ResetPasswordScreen}
                            options={{ headerShown: false }}
                        />

                        {/* User Type Specific Tabs */}
                        <Stack.Screen
                            name="LawyerTabs"
                            component={LawyerTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ClientTabs"
                            component={ClientTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="AdminTabs"
                            component={AdminTabs}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="VerificationPending"
                            component={VerificationPending}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="PaymentSubmission"
                            component={PaymentSubmission}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="PaymentVerification"
                            component={PaymentVerification}
                            options={{ headerShown: false }}
                        />

                    </Stack.Navigator>
                </NavigationContainer>
                    </AuthProvider>
            </ToastProvider>
        </SafeAreaProvider>
    );
}
