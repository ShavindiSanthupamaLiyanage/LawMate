import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
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

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

interface ResetPasswordScreenProps {
    navigation: ResetPasswordScreenNavigationProp;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });
    const { showSuccess } = useToast();

    // Check if passwords match
    const passwordsMatch = newPassword !== '' && confirmPassword !== '' && newPassword === confirmPassword;

    // Check if passwords don't match but user has started typing confirm password
    const passwordsDontMatch = confirmPassword !== '' && newPassword !== confirmPassword;

    // Button should be enabled only when both passwords are filled and match
    const isButtonEnabled = newPassword !== '' && confirmPassword !== '' && passwordsMatch;

    const handleResetPassword = (): void => {
        if (!isButtonEnabled) return;

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            showSuccess('Your password has been reset successfully!');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 500);
        }, 1000);
    };

    return (
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
        marginTop: spacing.lg,
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
});

export default ResetPasswordScreen;