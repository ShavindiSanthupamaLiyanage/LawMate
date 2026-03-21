import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
    children: React.ReactNode;
    backgroundColor?: string;
    edges?: Edge[];
    style?: ViewStyle;
}

/**
 * ScreenWrapper provides safe area handling for all screens.
 * 
 * When edges includes 'top', SafeAreaView automatically handles the status bar spacing.
 * Do NOT add additional paddingTop in contentWrapper as SafeAreaView already manages it.
 * 
 * Usage:
 * - For screens with headers: <ScreenWrapper edges={['top']}>
 * - For screens without headers: <ScreenWrapper> (no edges specified)
 */
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
                                                         children,
                                                         backgroundColor = '#FFFFFF',
                                                         edges = [],
                                                         style
                                                     }) => {
    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor }, style]}
            edges={edges}
        >
            <View style={styles.contentWrapper}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
    },
});

export default ScreenWrapper;