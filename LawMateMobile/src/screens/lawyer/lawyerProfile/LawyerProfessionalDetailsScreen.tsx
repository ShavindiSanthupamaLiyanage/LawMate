import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import LawyerLayout from '../../../components/LawyerLayout';

const EditModal: React.FC<{
    visible: boolean;
    title: string;
    value: string;
    onClose: () => void;
    onSave: (value: string) => void;
}> = ({ visible, title, value, onClose, onSave }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleSave = () => {
        if (inputValue.trim() === '') {
            Alert.alert('Validation', `${title} cannot be empty`);
            return;
        }
        onSave(inputValue);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit {title}</Text>
                    </View>
                    <TextInput
                        style={styles.modalInput}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder={`Enter ${title.toLowerCase()}`}
                        placeholderTextColor={colors.textSecondary}
                        selectionColor={colors.primary}
                    />
                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

interface DetailRowProps {
    label: string;
    value: string;
    onPress?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, onPress }) => (
    <TouchableOpacity
        style={styles.detailRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
    >
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
);

const LawyerProfessionalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);

    // TODO: Replace with actual API data
    const [professionalData, setProfessionalData] = useState({
        barCouncilId: 'SL/2015/1234',
        specialization: 'Criminal Law',
        experience: '08 Years',
        languages: 'Sinhala, English, Tamil',
        uploadedDocument: 'LLB BAR Licence',
        licenseNumber: 'BAR-543238v',
        practiceAreas: 'Criminal Law, Civil Law',
        courtAdmissions: 'Supreme Court, High Court',
        educationQualifications: 'LLB, Attorney-at-Law',
    });

    const openEditModal = (field: string) => {
        setEditingField(field);
        setEditModalVisible(true);
    };

    const handleSaveField = (newValue: string) => {
        if (editingField) {
            setProfessionalData(prev => ({
                ...prev,
                [editingField]: newValue,
            }));
            // TODO: Call API to update lawyer professional profile
            // await updateLawyerProfessionalProfile({ [editingField]: newValue });
        }
    };

    return (
        <LawyerLayout
            title="Professional Details"
            showBackButton
            onBackPress={() => navigation.goBack()}
            hideRightSection
            disableScroll
        >
            <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <DetailRow
                        label="BAR Council ID"
                        value={professionalData.barCouncilId}
                        onPress={() => openEditModal('barCouncilId')}
                    />
                    <DetailRow
                        label="Specialization"
                        value={professionalData.specialization}
                        onPress={() => openEditModal('specialization')}
                    />
                    <DetailRow
                        label="Experience"
                        value={professionalData.experience}
                        onPress={() => openEditModal('experience')}
                    />
                    <DetailRow
                        label="Languages"
                        value={professionalData.languages}
                        onPress={() => openEditModal('languages')}
                    />
                    <DetailRow
                        label="License Number"
                        value={professionalData.licenseNumber}
                        onPress={() => openEditModal('licenseNumber')}
                    />
                    <DetailRow
                        label="Practice Areas"
                        value={professionalData.practiceAreas}
                        onPress={() => openEditModal('practiceAreas')}
                    />
                    <DetailRow
                        label="Court Admissions"
                        value={professionalData.courtAdmissions}
                        onPress={() => openEditModal('courtAdmissions')}
                    />
                    <DetailRow
                        label="Education Qualifications"
                        value={professionalData.educationQualifications}
                        onPress={() => openEditModal('educationQualifications')}
                    />
                    <DetailRow
                        label="Uploaded Document"
                        value={professionalData.uploadedDocument}
                        onPress={() => {/* TODO: Navigate to view/upload document */}}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Professional information is verified by the Bar Council. Contact support for changes.
                    </Text>
                </View>
            </ScrollView>

            <EditModal
                visible={editModalVisible}
                title={editingField ? editingField.charAt(0).toUpperCase() + editingField.slice(1) : ''}
                value={editingField ? professionalData[editingField] : ''}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveField}
            />
            </View>
        </LawyerLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs / 2,
    },
    detailValue: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    modalHeader: {
        marginBottom: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    cancelButton: {
        backgroundColor: colors.borderLight,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    cancelButtonText: {
        color: colors.textPrimary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default LawyerProfessionalDetailsScreen;
