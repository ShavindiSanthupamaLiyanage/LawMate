import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../config/theme';
import ScreenWrapper from './ScreenWrapper';
import TopNavbar from './TopNavbar';

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
    userName = 'Client User',
    profileImage,
    onNotificationPress,
    onProfilePress,
    showBackButton,
    onBackPress,
    hideRightSection,
    disableScroll,
}) => {
    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View>
                <TopNavbar
                    title={title}
                    userName={userName}
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

export default ClientLayout;