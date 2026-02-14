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
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import { RootStackParamList, User } from '../../../types';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import {AntDesign} from "@expo/vector-icons";
import {useToast} from "../../../context/ToastContext";
import WarningCard from "./WarningCard";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

// Hardcoded users for demo
const USERS: Record<string, User> = {
    'lawyer@test.com': { email: 'lawyer@test.com', password: '123456', type: 'lawyer', name: 'John Smith' },
    'client@test.com': { email: 'client@test.com', password: '123456', type: 'client', name: 'Jane Doe' },
    'admin@test.com': { email: 'admin@test.com', password: '123456', type: 'admin', name: 'Admin User' },
    'dual@test.com': { email: 'dual@test.com', password: '123', type: 'lawyer', name: 'Dual User' },
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showWarningCard, setShowWarningCard] = useState<boolean>(false);
    const [selectedUserType, setSelectedUserType] = useState<'lawyer' | 'client' | null>(null);
    const {showError, showWarning} = useToast();

    const handleLogin = (): void => {
        if (!email || !password) {
            showWarning('Please enter email and password');
            return;
        }

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            // Check for dual user
            if (email.toLowerCase() === 'dual@test.com' && password === '123') {
                setLoading(false);
                setShowWarningCard(true);
                setSelectedUserType(null);
                return;
            }

            const user = USERS[email.toLowerCase()];

            if (user && user.password === password) {
                setLoading(false);

                // Navigate based on user type
                switch (user.type) {
                    case 'lawyer':
                        navigation.replace('LawyerTabs', {
                            screen: 'Dashboard',
                        });
                        break;

                    case 'client':
                        navigation.replace('ClientTabs', {
                            screen: 'Dashboard',
                        });
                        break;

                    case 'admin':
                        navigation.replace('AdminTabs', {
                            screen: 'Dashboard',
                        });
                        break;
                }
            } else {
                setLoading(false);
                showError('Invalid email or password');
            }
        }, 1500);
    };

    const handleWarningCardLogin = (): void => {
        if (!selectedUserType) return;

        setShowWarningCard(false);
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            // Navigate based on selected user type
            if (selectedUserType === 'lawyer') {
                navigation.replace('LawyerTabs', {
                    screen: 'Dashboard',
                });
            } else {
                navigation.replace('ClientTabs', {
                    screen: 'Dashboard',
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
                    <Text style={styles.subtitle}>Login in securely to continue your journey with LawMate today.</Text>

                    <Image
                        source={require('../../../../assets/login.png')}
                        style={styles.loginImg}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.form}>
                    <Input
                        label="NIC"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <AntDesign
                                name={showPassword ? 'eye' : 'eye-invisible'}
                                size={22}
                                color={colors.textSecondary}
                            />
                        }
                        onRightIconPress={() => setShowPassword(!showPassword)}
                    />

                    <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
                        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
                            <Text style={styles.signUpText}>Sign Up Now</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.demoCredentials}>
                        <Text style={styles.demoTitle}>Demo Credentials:</Text>
                        <Text style={styles.demoText}>Lawyer: lawyer@test.com / 123456</Text>
                        <Text style={styles.demoText}>Client: client@test.com / 123456</Text>
                        <Text style={styles.demoText}>Admin: admin@test.com / 123456</Text>
                        <Text style={styles.demoText}>Dual User: dual@test.com / 123</Text>
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
    demoCredentials: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.lg,
    },
    demoTitle: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    demoText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 2,
    },
});

export default LoginScreen;