import React, {useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform, TextInput,
    ScrollView, TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight } from '../../../config/theme';
import { RootStackParamList, AlertState } from '../../../types';
import Button from '../../../components/Button';
import Alert from '../../../components/Alert';
import Input from '../../../components/Input';
import { useToast } from "../../../context/ToastContext";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import ScreenWrapper from "../../../components/ScreenWrapper";
import {AuthService} from "../../../services/authService";

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
    navigation: ResetPasswordScreenNavigationProp;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<Array<TextInput | null>>(Array(6).fill(null));

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });
    const { showSuccess, showError } = useToast();
    const [isOtpVerified, setIsOtpVerified] = useState(false);

    // Check if passwords match
    const passwordsMatch = newPassword !== '' && confirmPassword !== '' && newPassword === confirmPassword;

    // Check if passwords don't match but user has started typing confirm password
    const passwordsDontMatch = confirmPassword !== '' && newPassword !== confirmPassword;

    const handleOtpChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-verify when last box filled
        if (index === 5 && value) {
            const fullToken = [...newOtp.slice(0, 5), value.slice(-1)].join('');
            verifyOtp(fullToken);
        }

        // Reset verified state if user edits OTP
        if (isOtpVerified) setIsOtpVerified(false);
    };

    const verifyOtp = async (token: string): Promise<void> => {
        try {
            const isValid = await AuthService.verifyResetToken(token);
            if (isValid) {
                setIsOtpVerified(true);
                showSuccess('OTP verified successfully!');
            } else {
                setIsOtpVerified(false);
                setOtp(['', '', '', '', '', '']);
                otpRefs.current[0]?.focus();
                showError('Invalid or expired OTP. Please try again.');
            }
        } catch {
            showError('Could not verify OTP. Please try again.');
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // const isOtpComplete = otp.every(d => d !== '');

    // Button should be enabled only when both passwords are filled and match
    const isButtonEnabled = isOtpVerified && newPassword !== '' && confirmPassword !== '' && passwordsMatch;

    const handleResetPassword = async (): Promise<void> => {
        if (!isButtonEnabled) return;
        setLoading(true);
        try {
            const token = otp.join('');  // combine 6 boxes → "922613"
            await AuthService.resetPasswordWithToken(token, newPassword);
            showSuccess('Your password has been reset successfully!');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 500);
        } catch (error: any) {
            showError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper backgroundColor={colors.white} edges={['top']}>
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Reset Password</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Your new password must be different from previously used password.
                    </Text>
                </View>

                <View style={styles.otpSection}>
                    <Text style={styles.otpLabel}>Enter OTP</Text>
                    <Text style={styles.otpSubLabel}>
                        Enter the 6-digit code sent to your email
                    </Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => { otpRefs.current[index] = el; }}
                                style={[
                                    styles.otpBox,
                                    digit ? styles.otpBoxFilled : null,
                                    isOtpVerified ? styles.otpBoxVerified : null,  // ADD
                                ]}
                                value={digit}
                                onChangeText={(val) => handleOtpChange(val, index)}
                                onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                    {isOtpVerified && (
                        <Text style={styles.otpVerifiedText}> OTP verified</Text>
                    )}
                </View>

                <View style={styles.form}>
                    <Input
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        rightIcon={
                            <AntDesign
                                name={showNewPassword ? 'eye' : 'eye-invisible'}
                                size={22}
                                color={colors.textSecondary}
                            />
                        }
                        onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                    />


                    <View style={styles.confirmPasswordContainer}>
                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            rightIcon={
                                <AntDesign
                                    name={showConfirmPassword ? 'eye' : 'eye-invisible'}
                                    size={22}
                                    color={colors.textSecondary}
                                />
                            }
                            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                        {passwordsDontMatch && (
                            <Text style={styles.errorText}>
                                Passwords do not match
                            </Text>
                        )}
                    </View>

                    <Button
                        title="RESET PASSWORD"
                        onPress={handleResetPassword}
                        loading={loading}
                        disabled={!isButtonEnabled}
                        variant={isButtonEnabled ? 'primary' : 'secondary'}
                        style={styles.resetButton}
                    />
                </View>
            </ScrollView>

            <Alert
                visible={alert.visible}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => {
                    setAlert({ ...alert, visible: false });
                    if (alert.type === 'success') {
                        navigation.navigate('Login');
                    }
                }}
                onConfirm={alert.onConfirm}
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
        alignItems: 'flex-start',
        // marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.xs,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    form: {
        width: '100%',
        marginTop: spacing.lg,
    },
    confirmPasswordContainer: {
        marginTop: spacing.md,
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
    resetButton: {
        marginTop: spacing.xxxl,
    },
    otpSection: {
        marginBottom: spacing.lg,
    },
    otpLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    otpSubLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    otpBox: {
        flex: 1,
        height: 52,
        borderWidth: 1.5,
        borderColor: colors.border,       // use your theme border color
        borderRadius: 10,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        backgroundColor: colors.background ?? '#F9F9F9',
    },
    otpBoxFilled: {
        borderColor: colors.primary,      // highlight filled boxes
        backgroundColor: colors.white,
    },
    otpBoxVerified: {
        borderColor: colors.success ?? '#22c55e',
        backgroundColor: colors.white,
    },
    otpVerifiedText: {
        fontSize: fontSize.xs,
        color: colors.success ?? '#22c55e',
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});

export default ResetPasswordScreen;