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
}

const ClientLayout: React.FC<ClientLayoutProps> = ({
    children,
    userName = 'Client User',
    profileImage,
    onNotificationPress,
    onProfilePress,
}) => {
    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View>
                <TopNavbar
                    userName={userName}
                    profileImage={profileImage}
                    onNotificationPress={onNotificationPress}
                    onProfilePress={onProfilePress}
                />
            </View>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {children}
            </ScrollView>
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
