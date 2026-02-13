import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../../components/Button';

interface WarningCardProps {
    visible: boolean;
    onClose: () => void;
    onSelectLawyer: () => void;
    onSelectClient: () => void;
    selectedType: 'lawyer' | 'client' | null;
    onLogin: () => void;
    loading?: boolean;
}

const WarningCard: React.FC<WarningCardProps> = ({
                                                     visible,
                                                     onClose,
                                                     onSelectLawyer,
                                                     onSelectClient,
                                                     selectedType,
                                                     onLogin,
                                                     loading,
                                                 }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.card} onPressIn={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="warning" size={24} color={colors.warning} />
                        </View>
                        <Text style={styles.title}>Warning</Text>
                    </View>

                    <Text style={styles.message}>
                        Two accounts are linked to this NIC number. Please select the account you want to log in to.
                    </Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                selectedType === 'lawyer' && styles.optionButtonSelected,
                            ]}
                            onPress={onSelectLawyer}
                        >
                            <View style={styles.optionContent}>
                                <View style={[
                                    styles.radio,
                                    selectedType === 'lawyer' && styles.radioSelected,
                                ]}>
                                    {selectedType === 'lawyer' && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    selectedType === 'lawyer' && styles.optionTextSelected,
                                ]}>
                                    LAWYER
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.optionButton,
                                selectedType === 'client' && styles.optionButtonSelected,
                            ]}
                            onPress={onSelectClient}
                        >
                            <View style={styles.optionContent}>
                                <View style={[
                                    styles.radio,
                                    selectedType === 'client' && styles.radioSelected,
                                ]}>
                                    {selectedType === 'client' && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.optionText,
                                    selectedType === 'client' && styles.optionTextSelected,
                                ]}>
                                    CLIENT
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Button
                        title="LOG IN"
                        onPress={onLogin}
                        loading={loading}
                        disabled={!selectedType}
                        variant={selectedType ? 'primary' : 'secondary'}
                        style={styles.loginButton}
                    />

                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        width: '100%',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.full,
        backgroundColor: `${colors.warning}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    message: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    optionsContainer: {
        gap: spacing.sm,
    },
    optionButton: {
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        backgroundColor: colors.white,
    },
    optionButtonSelected: {
        borderColor: colors.primary,
        backgroundColor: `${colors.primary}08`,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: borderRadius.full,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: spacing.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary,
    },
    optionText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
    },
    optionTextSelected: {
        color: colors.primary,
    },
    loginButton: {
        marginTop: spacing.lg,
    },
});

export default WarningCard;