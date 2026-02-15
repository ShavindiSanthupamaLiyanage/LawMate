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

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const ForgotPasswordScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });
    const { showSuccess} = useToast();

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    const emailIsValid = isValidEmail(email);

    const handleForgetPassword = (): void => {
        if (!emailIsValid) return;

        setLoading(true);

        showSuccess('Password reset link has been sent successfully!');
        setTimeout(() => {
            navigation.navigate('ResetPassword');
        }, 500);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>Enter your email address and we’ll send you a link to reset your password.</Text>

                    <Image
                        source={require('../../../../assets/forgot-pw.png')}
                        style={styles.loginImg}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.form}>
                    <Input
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Button
                        title="SEND RESET LINK"
                        onPress={handleForgetPassword}
                        loading={loading}
                        disabled={!emailIsValid}
                        variant={emailIsValid ? 'primary' : 'secondary'}
                        style={styles.loginButton}
                    />

                    <Button
                        title="BACK TO LOG IN"
                        onPress={() => navigation.navigate('Login')}
                        loading={loading}
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
        marginTop: spacing.xxxl,
    },
    backLoginButton: {
        marginTop: spacing.sm,
    },
});

export default ForgotPasswordScreen;