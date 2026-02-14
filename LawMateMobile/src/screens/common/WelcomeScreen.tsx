import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, fontSize, fontWeight } from '../../config/theme';
import { RootStackParamList } from '../../types';
import Button from '../../components/Button';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useToast } from '../../context/ToastContext';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

interface WelcomeScreenProps {
    navigation: WelcomeScreenNavigationProp;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {

    const { showSuccess, showError} = useToast();

    const handleLawyerSignup = () => {
        showSuccess('Redirecting to Lawyer Registration...');
        setTimeout(() => {
            navigation.navigate('Register', { userType: 'lawyer' });
        }, 500);
    };

    // const handleLogin = () => {
    //     showInfo('Please enter your credentials to continue.');
    //     setTimeout(() => {
    //         navigation.navigate('Login');
    //     }, 500);
    // };

    const handleClientSignup = () => {
        showError('Client registration is currently unavailable.');
        // Or if you want to show it and still navigate:
        // showError('Please complete the registration form carefully.');
        // setTimeout(() => {
        //     navigation.navigate('Register', { userType: 'client' });
        // }, 500);
    };


    return (
        <ScreenWrapper backgroundColor={colors.white}>
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.illustrationContainer}>
                    <Image
                        source={require('../../../assets/welcome.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Welcome to LawMate</Text>
                <Text style={styles.subtitle}>"Your Smart Legal Partner"</Text>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title="SIGN UP AS A LAWYER"
                    // onPress={() => navigation.navigate('Register', { userType: 'lawyer' })}
                    onPress={handleLawyerSignup}
                    variant="primary"
                    style={styles.button}
                />

                <Button
                    title="SIGN UP AS A CLIENT"
                    onPress={handleClientSignup}
                    // onPress={() => navigation.navigate('Register', { userType: 'client' })}
                    variant="secondary"
                    style={styles.button}
                />

                {/* Or Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>Or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <Button
                    title="LOGIN"
                    onPress={() => navigation.navigate('Login')}
                    variant="transparent"
                    style={styles.loginButton}
                />
            </View>
        </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -spacing.xl,
    },
    illustrationContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoImage: {
        width: 300,
        height: 300,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.lg,
        color: colors.textSecondary,
    },
    buttonContainer: {
        width: '100%',
        paddingBottom: spacing.lg,
    },
    button: {
        marginBottom: spacing.md,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        marginHorizontal: spacing.md,
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    loginButton: {
        marginTop: 0,
    },
});

export default WelcomeScreen;