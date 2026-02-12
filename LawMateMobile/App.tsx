import 'react-native-gesture-handler';
import './polyfills';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ToastProvider } from './src/context/ToastContext';
import { colors } from './src/config/theme';
import { RootStackParamList, LawyerTabParamList,
    ClientTabParamList, AdminTabParamList
} from './src/types';

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';

// Lawyer Screens
import LawyerDashboard from './src/screens/lawyer/LawyerDashboard';

// Client Screens
import ClientDashboard from './src/screens/client/ClientDashboard';

// Admin Screens
import AdminDashboard from './src/screens/admin/AdminDashboard';

// Placeholder Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TabIcon from "./src/components/TabIcon";
import ForgotPasswordScreen from "./src/screens/ForgotPassword";

const Stack = createNativeStackNavigator<RootStackParamList>();
const LawyerTab = createBottomTabNavigator<LawyerTabParamList>();
const ClientTab = createBottomTabNavigator<ClientTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

// Lawyer Bottom Tabs
function LawyerTabs() {
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
                name="Bookings"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="calendar-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Finance"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="cash-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Dashboard"
                component={LawyerDashboard}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} />
                    ),
                    tabBarLabel: 'Home',
                }}
            />

            <LawyerTab.Screen
                name="Knowledge"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="book-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <LawyerTab.Screen
                name="Calendar"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="time-outline" color={color} focused={focused} />
                    ),
                }}
            />

        </LawyerTab.Navigator>
    );
}

// Client Bottom Tabs
function ClientTabs() {
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
                name="Bookings"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="calendar-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Lawyers"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="search-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Dashboard"
                component={ClientDashboard}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} />
                    ),
                    tabBarLabel: 'Home',
                }}
            />

            <ClientTab.Screen
                name="Lawly"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="sparkles-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <ClientTab.Screen
                name="Knowledge"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="book-outline" color={color} focused={focused} />
                    ),
                }}
            />
        </ClientTab.Navigator>
    );
}

// Admin Bottom Tabs
function AdminTabs() {
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
                name="Bookings"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="people-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Finance"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="cash-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Dashboard"
                component={AdminDashboard}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="home-outline" color={color} focused={focused} />
                    ),
                    tabBarLabel: 'Home',
                }}
            />

            <AdminTab.Screen
                name="Payment"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="person-outline" color={color} focused={focused} />
                    ),
                }}
            />

            <AdminTab.Screen
                name="Reports"
                component={SettingsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon iconName="card-outline" color={color} focused={focused} />
                    ),
                }}
            />
        </AdminTab.Navigator>
    );
}

// Main App Navigation
export default function App() {
    return (
        <SafeAreaProvider>
            <ToastProvider>
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
                    </Stack.Navigator>
                </NavigationContainer>
            </ToastProvider>
        </SafeAreaProvider>
    );
}
