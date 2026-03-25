import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View} from 'react-native';
import { colors, spacing } from '../config/theme';
import ScreenWrapper from './ScreenWrapper';
import TopNavbar from './TopNavbar';
import {StorageService} from "../utils/storage";
import {UserDetailService} from "../services/userDetailService";
import {useSafeAreaInsets} from "react-native-safe-area-context";

interface ClientLayoutProps {
    children: React.ReactNode;
    userName?: string;
    profileImage?: string;
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    title?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    hideRightSection?: boolean;
    disableScroll?: boolean;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
    title,
    children,
    profileImage,
    onNotificationPress,
    onProfilePress,
    showBackButton,
    onBackPress,
    hideRightSection,
    disableScroll,
}) => {
    const insets = useSafeAreaInsets();
    const [adminName, setAdminName] = useState<string>('');

    useEffect(() => {
        const loadAdminName = async () => {
            try {
                const userData = await StorageService.getUserData();
                if (userData?.userId) {
                    const user = await UserDetailService.getUserById(userData.userId);
                    if (user) {
                        setAdminName(`${user.firstName} ${user.lastName}`);
                    }
                }
            } catch (e) {
                console.error('Failed to load admin name:', e);
            }
        };
        loadAdminName();
    }, []);

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View>
                <TopNavbar
                    title={title}
                    userName={adminName}
                    profileImage={profileImage}
                    onNotificationPress={onNotificationPress}
                    onProfilePress={onProfilePress}
                    showBackButton={showBackButton}
                    onBackPress={onBackPress}
                    hideRightSection={hideRightSection}
                />
            </View>

            {disableScroll ? (
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={
                        Platform.OS === 'ios' ? insets.top + 60 : 60
                    }
                >
                    {children}
                </KeyboardAvoidingView>
            ) : (
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainer}
                >
                    {children}
                </ScrollView>
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingBottom: spacing.lg,
    },
});

export default ClientLayout;