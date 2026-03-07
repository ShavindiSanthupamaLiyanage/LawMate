import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight } from '../../../config/theme';
import { RootStackParamList, AlertState } from '../../../types';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import Input from '../../../components/Input';
import {useToast} from "../../../context/ToastContext";
import ScreenWrapper from "../../../components/ScreenWrapper";
import {AuthService} from "../../../services/authService";
import {UserService} from "../../../services/userService";

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [nic, setNic] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });
    const { showSuccess, showError} = useToast();

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const isValidNic = (nic: string): boolean => {
        return /^\d{12}$/.test(nic) || /^\d{9}[VX]$/i.test(nic);
    };

    const emailIsValid = isValidEmail(email);
    const nicIsValid = isValidNic(nic.trim());
    const isFormValid = emailIsValid && nicIsValid;

// Inline error states
    const showNicError = nic.trim() !== '' && !nicIsValid;
    const showEmailError = email !== '' && !emailIsValid;

    const handleForgetPassword = async (): Promise<void> => {
        if (!nicIsValid) {
            showError('Invalid NIC format. Must be 12 digits or 9 digits followed by V or X.');
            return;
        }
        if (!emailIsValid) {
            showError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Check if NIC exists and email matches
            const user = await UserService.getUserByNic(nic.trim());

            if (!user) {
                showError('No account found with this NIC.');
                return;
            }

            if (user.email.toLowerCase() !== email.toLowerCase()) {
                showError('No account found with this NIC and email combination.');
                return;
            }

            // Step 2: NIC + email verified — request reset
            await AuthService.requestResetPassword(nic.trim().toUpperCase(), email);
            showSuccess('Password reset code has been sent to your email!');
            setTimeout(() => navigation.navigate('ResetPassword'), 500);

        } catch (error: any) {
            showError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.white}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>Enter your email address and we’ll send you an OTP to reset your password.</Text>

                    <Image
                        source={require('../../../../assets/forgot-pw.png')}
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
                    />
                    {showNicError && (
                        <Text style={styles.fieldError}>
                            NIC must be 12 digits or 9 digits followed by V or X
                        </Text>
                    )}

                    <View style={styles.emailContainer}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {showEmailError && (
                            <Text style={styles.fieldError}>
                                Please enter a valid email address
                            </Text>
                        )}
                    </View>

                    <Button
                        title="SEND RESET OTP"
                        onPress={handleForgetPassword}
                        loading={loading}
                        // disabled={!emailIsValid}
                        disabled={!isFormValid}
                        variant={isFormValid ? 'primary' : 'secondary'}
                        // variant={emailIsValid ? 'primary' : 'secondary'}
                        style={styles.loginButton}
                    />

                    <Button
                        title="BACK TO LOG IN"
                        onPress={() => navigation.navigate('Login')}
                        disabled={loading}
                        variant="transparent"
                        style={styles.backLoginButton}
                    />
                </View>
            </ScrollView>

            <Alert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, visible: false })}
            />
        </KeyboardAvoidingView>
        </ScreenWrapper>
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
        marginTop: spacing.xl,
    },
    backLoginButton: {
        marginTop: spacing.sm,
    },
    emailContainer: {
        marginTop: spacing.md,
    },
    fieldError: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});

export default ForgotPasswordScreen;