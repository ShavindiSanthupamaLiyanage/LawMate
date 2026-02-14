import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../config/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({
                                         visible,
                                         message,
                                         type = 'default',
                                         duration = 3000,
                                         onDismiss,
                                     }) => {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        }

        return undefined;
    }, [visible, duration]);


    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss();
        });
    };

    const getIconByType = (): string => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return 'ℹ';
        }
    };

    const getColorByType = (): string => {
        switch (type) {
            case 'success':
                return colors.success;
            case 'error':
                return colors.error;
            case 'warning':
                return colors.warning;
            case 'info':
                return colors.info;
            default:
                return colors.primary;
        }
    };

    const getBackgroundByType = (): string => {
        switch (type) {
            case 'success':
                return '#D1FAE5';
            case 'error':
                return '#FEE2E2';
            case 'warning':
                return '#FEF3C7';
            case 'info':
                return '#DBEAFE';
            default:
                return '#E0E7FF';
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateY }],
                    backgroundColor: getBackgroundByType(),
                },
            ]}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: getColorByType() }]}>
                    <Text style={styles.icon}>{getIconByType()}</Text>
                </View>
                <Text style={[styles.message, { color: colors.textPrimary }]}>
                    {message}
                </Text>
                <TouchableOpacity
                    onPress={hideToast}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={styles.closeIconContainer}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: spacing.md,
        right: spacing.md,
        borderRadius: borderRadius.md,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    icon: {
        fontSize: 18,
        color: colors.white,
        fontWeight: fontWeight.bold,
    },
    message: {
        flex: 1,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
    },
    closeButton: {
        marginLeft: spacing.sm,
    },
    closeIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: fontWeight.bold,
    },
});

export default Toast;