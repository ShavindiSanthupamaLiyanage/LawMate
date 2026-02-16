import React, { useRef } from 'react';
import { ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';
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
    const animatedValue = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const scrollDirection = useRef<'up' | 'down'>('up');

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentY = event.nativeEvent.contentOffset.y;
        const diff = currentY - lastScrollY.current;

        if (diff > 10 && scrollDirection.current !== 'down') {
            scrollDirection.current = 'down';
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
            }).start();
        } else if (diff < -10 && scrollDirection.current !== 'up') {
            scrollDirection.current = 'up';
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }

        lastScrollY.current = currentY;
    };

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <Animated.View style={{ transform: [{ translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -80],
                extrapolate: 'clamp',
            }) }] }}>
                <TopNavbar
                    userName={userName}
                    profileImage={profileImage}
                    onNotificationPress={onNotificationPress}
                    onProfilePress={onProfilePress}
                />
            </Animated.View>
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
