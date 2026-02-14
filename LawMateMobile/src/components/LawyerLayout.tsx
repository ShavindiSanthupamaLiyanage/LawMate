import React, { useRef } from 'react';
import { ScrollView, StyleSheet, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { colors, spacing } from '../config/theme';
import ScreenWrapper from './ScreenWrapper';
import TopNavbar from './TopNavbar';

interface LawyerLayoutProps {
    children: React.ReactNode;
    userName?: string;
    profileImage?: string;
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
}

const LawyerLayout: React.FC<LawyerLayoutProps> = ({
    children,
    userName = 'Kavindi Dilhara',
    profileImage,
    onNotificationPress,
    onProfilePress,
}) => {
    const scrollViewRef = useRef<ScrollView>(null);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // Scroll event is passed to TopNavbar for collapse/expand behavior
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <TopNavbar
                userName={userName}
                profileImage={profileImage}
                onNotificationPress={onNotificationPress}
                onProfilePress={onProfilePress}
                onScroll={handleScroll}
            />
            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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

export default LawyerLayout;
