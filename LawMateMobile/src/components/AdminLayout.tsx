import React, {useEffect, useState} from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../config/theme';
import ScreenWrapper from './ScreenWrapper';
import TopNavbar from './TopNavbar';
import {StorageService} from "../utils/storage";
import { UserDetailService  } from '../services/userDetailService';

interface AdminLayoutProps {
    children: React.ReactNode;
    userName?: string;
    profileImage?: string;
    title?: string;
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
    showBackButton?: boolean;
    onBackPress?: () => void;
    hideRightSection?: boolean;
    disableScroll?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
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
                            <View style={styles.container}>
                                {children}
                            </View>
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

export default AdminLayout;
 