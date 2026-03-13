import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    borderRadius
} from '../../../../config/theme';
import ScreenWrapper from '../../../../components/ScreenWrapper';

interface PersonalData {
    name: string;
    address: string;
    contactNumber: string;
    emailAddress: string;
    nic: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
}

/* ---------- EDIT MODAL ---------- */
const EditModal: React.FC<{
    visible: boolean;
    title: string;
    value: string;
    onClose: () => void;
    onSave: (value: string) => void;
}> = ({ visible, title, value, onClose, onSave }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleSave = () => {
        if (inputValue.trim() === '') {
            Alert.alert('Validation', `${title} cannot be empty`);
            return;
        }
        onSave(inputValue);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Edit {title}</Text>
                    </View>

                    <TextInput
                        style={styles.modalInput}
                        value={inputValue}
                        onChangeText={setInputValue}
                        placeholder={`Enter ${title}`}
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

/* ---------- DETAIL ROW ---------- */
interface DetailRowProps {
    label: string;
    value: string;
    onPress?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, onPress }) => (
    <TouchableOpacity
        style={styles.detailRow}
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
    >
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>

        {onPress && (
            <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textSecondary}
            />
        )}
    </TouchableOpacity>
);

/* ---------- MAIN SCREEN ---------- */
const ClientPersonalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { viewOnly = false } = route.params || {};

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<keyof PersonalData | null>(null);

    const [personalData, setPersonalData] = useState<PersonalData>({
        name: 'Sarah Johnson',
        address: '123 Main Street, Colombo 03',
        contactNumber: '0771234567',
        emailAddress: 'sarah.johnson@email.com',
        nic: '199856789012',
        dateOfBirth: '15/08/1998',
        gender: 'Female',
        nationality: 'Sri Lankan',
    });

    /* ---------- OPEN EDIT ---------- */
    const openEditModal = (field: keyof PersonalData) => {
        if (viewOnly) return;
        setEditingField(field);
        setEditModalVisible(true);
    };

    /* ---------- SAVE FIELD ---------- */
    const handleSaveField = (value: string) => {
        if (!editingField) return;
        setPersonalData(prev => ({
            ...prev,
            [editingField]: value,
        }));
    };

    /* ---------- UI ---------- */
    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View style={styles.container}>
                {/* HEADER */}
                <LinearGradient
                    colors={[
                        'rgba(24,114,234,1)',
                        'rgba(54,87,208,1)',
                        'rgba(77,55,200,1)',
                        'rgba(99,71,253,1)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Personal Details</Text>

                    <View style={styles.backButton} />
                </LinearGradient>

                {/* CONTENT */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <DetailRow
                            label="Name"
                            value={personalData.name}
                            onPress={!viewOnly ? () => openEditModal('name') : undefined}
                        />
                        <DetailRow
                            label="Address"
                            value={personalData.address}
                            onPress={!viewOnly ? () => openEditModal('address') : undefined}
                        />
                        <DetailRow
                            label="Contact Number"
                            value={personalData.contactNumber}
                            onPress={!viewOnly ? () => openEditModal('contactNumber') : undefined}
                        />
                        <DetailRow
                            label="Email Address"
                            value={personalData.emailAddress}
                            onPress={!viewOnly ? () => openEditModal('emailAddress') : undefined}
                        />
                        <DetailRow
                            label="NIC"
                            value={personalData.nic}
                            onPress={!viewOnly ? () => openEditModal('nic') : undefined}
                        />
                        <DetailRow
                            label="Date of Birth"
                            value={personalData.dateOfBirth}
                            onPress={!viewOnly ? () => openEditModal('dateOfBirth') : undefined}
                        />
                        <DetailRow
                            label="Gender"
                            value={personalData.gender}
                            onPress={!viewOnly ? () => openEditModal('gender') : undefined}
                        />
                        <DetailRow
                            label="Nationality"
                            value={personalData.nationality}
                            onPress={!viewOnly ? () => openEditModal('nationality') : undefined}
                        />
                    </View>
                </ScrollView>

                {/* EDIT MODAL */}
                {!viewOnly && editingField && (
                    <EditModal
                        visible={editModalVisible}
                        title={editingField.charAt(0).toUpperCase() + editingField.slice(1)}
                        value={personalData[editingField]}
                        onClose={() => setEditModalVisible(false)}
                        onSave={handleSaveField}
                    />
                )}
            </View>
        </ScreenWrapper>
    );
};

export default ClientPersonalDetailsScreen;

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
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
    backButton:
        { width: 40,
            height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: fontWeight.bold },
    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingTop: 110 },
    card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.sm, elevation: 2, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
    detailContent: { flex: 1 },
    detailLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.xs / 2 },
    detailValue: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.medium },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, padding: spacing.lg },
    modalHeader: { marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingBottom: spacing.md },
    modalTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
    modalInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: borderRadius.md, padding: spacing.md, fontSize: fontSize.md, marginBottom: spacing.lg },
    modalActions: { flexDirection: 'row', gap: spacing.md },
    modalButton: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center' },
    saveButton: { backgroundColor: colors.primary },
    cancelButton: { backgroundColor: colors.borderLight },
    saveButtonText: { color: colors.white, fontWeight: fontWeight.bold },
    cancelButtonText: { fontWeight: fontWeight.bold, color: colors.textPrimary },
});