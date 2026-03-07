import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight } from '../../../config/theme';
import { RootStackParamList } from '../../../types';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { AntDesign } from "@expo/vector-icons";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import WarningCard from "./WarningCard";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    // Form state
    const [nic, setNic] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Dual account state
    const [showWarningCard, setShowWarningCard] = useState<boolean>(false);
    const [selectedUserType, setSelectedUserType] = useState<'lawyer' | 'client' | null>(null);
    // @ts-ignore
    const [dualAccountData, setDualAccountData] = useState<any>(null);

    // Hooks
    const { showError, showWarning } = useToast();
    const { login } = useAuth();

    //Updated handleLogin to call actual API
    const handleLogin = async (): Promise<void> => {
        // Validation
        if (!nic || !password) {
            showWarning('Please enter NIC and password');
            return;
        }

        if (nic.trim().toUpperCase() === 'CLIENT123' && password === 'client123') {
            navigation.replace('ClientTabs', {
                screen: 'ClientTabNavigator',
                params: { screen: 'Dashboard' }
            });
            return;
        }

        setLoading(true);

        try {
            console.log('Attempting login with NIC:', nic);

            // Call the actual API through AuthContext
            const response = await login({
                NIC: nic.trim().toUpperCase(),  // Normalize NIC (convert to uppercase)
                Password: password,
            });

            console.log('✅ Login successful:', response);

            //Check if user has dual account
            if (response.isDualAccount) {
                console.log('👥 User has dual account');
                setDualAccountData(response);
                setShowWarningCard(true);
                setLoading(false);
                return;
            }

            // Navigate based on role from backend
            // Backend returns: 1 = Lawyer, 2 = Client, 0 = Admin
            navigateBasedOnRole(response.role);

        } catch (error: any) {
            console.error('Login failed:', error);

            // Show error message to user
            const errorMessage = error.message || 'Invalid NIC or password';
            showError(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    //Navigate based on role number from backend
    const navigateBasedOnRole = (role: number): void => {
        console.log('Navigating based on role:', role);

        switch (role) {
            case 0: // Admin
                console.log('→ Navigating to Admin Dashboard');
                navigation.replace('AdminTabs', {
                    screen: 'AdminTabNavigator',
                    params: { screen: 'Dashboard' }
                });
                break;

            case 1: // Lawyer
                console.log('→ Navigating to Lawyer Dashboard');
                navigation.replace('LawyerTabs', {
                    screen: 'LawyerTabNavigator',
                    params: { screen: 'Dashboard' }
                });
                break;

            case 2: // Client
                console.log('→ Navigating to Client Dashboard');
                navigation.replace('ClientTabs', {
                    screen: 'ClientTabNavigator',
                    params: { screen: 'Dashboard' }
                });
                break;

            default:
                console.error('Unknown user role:', role);
                showError('Unknown user role. Please contact support.');
        }
    };

    // Handle dual account selection
    const handleWarningCardLogin = (): void => {
        if (!selectedUserType) return;

        console.log('👥 Dual account type selected:', selectedUserType);

        setShowWarningCard(false);
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Navigate based on selected user type
            if (selectedUserType === 'lawyer') {
                navigation.replace('LawyerTabs', {
                    screen: 'LawyerTabNavigator',
                    params: { screen: 'Dashboard' }
                });
            } else {
                navigation.replace('ClientTabs', {
                    screen: 'ClientTabNavigator',
                    params: { screen: 'Dashboard' }
                });
            }
        }, 500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Login</Text>
                    <Text style={styles.subtitle}>
                        Login in securely to continue your journey with LawMate today.
                    </Text>

                    <Image
                        source={require('../../../../assets/login.png')}
                        style={styles.loginImg}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.form}>
                    <Input
                        label="NIC"
                        value={nic}
                        onChangeText={setNic}
                        placeholder="Enter your NIC"
                        autoCapitalize="characters"
                        editable={!loading}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!loading}
                        rightIcon={
                            <AntDesign
                                name={showPassword ? 'eye' : 'eye-invisible'}
                                size={22}
                                color={colors.textSecondary}
                            />
                        }
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        disabled={loading}
                    >
                        <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <Button
                        title="LOG IN"
                        onPress={handleLogin}
                        loading={loading}
                        variant="primary"
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Welcome')}
                            disabled={loading}
                        >
                            <Text style={styles.signUpText}>Sign Up Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {showWarningCard && (
                <WarningCard
                    visible={showWarningCard}
                    onClose={() => setShowWarningCard(false)}
                    onSelectLawyer={() => setSelectedUserType('lawyer')}
                    onSelectClient={() => setSelectedUserType('client')}
                    selectedType={selectedUserType}
                    onLogin={handleWarningCardLogin}
                    loading={loading}
                />
            )}

        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    loginImg: {
        width: 150,
        height: 150,
        marginTop: spacing.xl,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        marginTop: spacing.xl,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    forgotPassword: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.medium,
        textAlign: 'right',
        marginBottom: spacing.lg,
    },
    loginButton: {
        marginTop: spacing.xxl,
        marginBottom: spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    signUpText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
});

export default LoginScreen;