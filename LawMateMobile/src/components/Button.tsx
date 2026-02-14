import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    TextStyle,
    ViewStyle
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../config/theme';
import { ButtonProps } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

const Button: React.FC<ButtonProps> = ({
                                           title,
                                           onPress,
                                           variant = 'primary',
                                           disabled = false,
                                           loading = false,
                                           style,
                                           textStyle,
                                       }) => {

    const getButtonStyle = (): ViewStyle => {
        switch (variant) {
            case 'transparent':
                return styles.transparentButton;
            case 'accept':
                return styles.acceptButton;
            case 'reject':
                return styles.rejectButton;
            default:
                return {};
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'transparent':
                return styles.transparentText;
            default:
                return styles.solidText;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
        >
            {(variant === 'primary' || variant === 'secondary') ? (
                <LinearGradient
                    colors={
                        variant === 'primary'
                            ? ['rgba(98,73,235,1)', 'rgba(24,114,234,1)']
                            : ['rgba(98,73,235,0.5)', 'rgba(24,114,234,0.5)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={[styles.solidText, textStyle]}>{title}</Text>
                    )}
                </LinearGradient>
            ) : (
                loading ? (
                    <ActivityIndicator
                        color={variant === 'transparent' ? '#6249EB' : colors.white}
                    />
                ) : (
                    <Text style={[getTextStyle(), textStyle]}>{title}</Text>
                )
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        overflow: 'hidden', // Important: ensures gradient respects border radius
    },

    gradientButton: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Primary */
    primaryButton: {
        backgroundColor: '#4E60FF',
    },

    /* Secondary */
    secondaryButton: {
        backgroundColor: '#F97316',
    },

    /* Transparent / Outline */
    transparentButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#6249EB',
    },

    /* Accept */
    acceptButton: {
        backgroundColor: '#3B82F6',
    },

    /* Reject */
    rejectButton: {
        backgroundColor: '#EF4444',
    },

    disabled: {
        opacity: 0.5,
    },

    solidText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },

    transparentText: {
        color: '#4E60FF',
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
    },
});

export default Button;