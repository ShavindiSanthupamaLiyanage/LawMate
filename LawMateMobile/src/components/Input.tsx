import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../config/theme';
import { InputProps } from '../types';

const Input: React.FC<InputProps & Omit<TextInputProps, 'value' | 'onChangeText'>> = ({
                                                                                          label,
                                                                                          value,
                                                                                          onChangeText,
                                                                                          placeholder,
                                                                                          secureTextEntry = false,
                                                                                          keyboardType = 'default',
                                                                                          autoCapitalize = 'sentences',
                                                                                          error,
                                                                                          rightIcon,
                                                                                          onRightIconPress,
                                                                                          ...props
                                                                                      }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[styles.inputContainer, error && styles.inputError]}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textLight}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        style={styles.rightIcon}
                        onPress={onRightIconPress}
                        disabled={!onRightIconPress}
                    >
                        <Text style={styles.iconText}>{rightIcon}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        backgroundColor: colors.white,
    },
    inputError: {
        borderColor: colors.error,
    },
    rightIcon: {
        position: 'absolute',
        right: spacing.md,
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
    },
    iconText: {
        fontSize: 20,
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.error,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});

export default Input;