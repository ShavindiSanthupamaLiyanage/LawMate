import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../config/theme';
import { AlertProps } from '../types';
import Button from './Button';

const Alert: React.FC<AlertProps> = ({
                                         visible,
                                         title,
                                         message,
                                         onClose,
                                         type = 'info',
                                         confirmText = 'OK',
                                         cancelText,
                                         onConfirm,
                                         onCancel
                                     }) => {
    const getIconByType = (): string => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
                return '⚠';
            case 'error':
                return '✕';
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
            case 'warning':
                return colors.warning;
            case 'error':
                return colors.error;
            case 'info':
                return colors.info;
            default:
                return colors.info;
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <View style={[styles.iconContainer, { backgroundColor: getColorByType() + '20' }]}>
                        <Text style={[styles.icon, { color: getColorByType() }]}>
                            {getIconByType()}
                        </Text>
                    </View>

                    {title && <Text style={styles.title}>{title}</Text>}
                    {message && <Text style={styles.message}>{message}</Text>}

                    <View style={styles.buttonContainer}>
                        {cancelText && (
                            <Button
                                title={cancelText}
                                onPress={onCancel || onClose || (() => {})}
                                variant="secondary"
                                style={styles.button}
                            />
                        )}
                        <Button
                            title={confirmText}
                            onPress={onConfirm || onClose || (() => {})}
                            style={[styles.button, cancelText && styles.buttonSpacing]}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    alertContainer: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    icon: {
        fontSize: 30,
        fontWeight: fontWeight.bold,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    message: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
    },
    button: {
        flex: 1,
    },
    buttonSpacing: {
        marginLeft: spacing.sm,
    },
});

export default Alert;