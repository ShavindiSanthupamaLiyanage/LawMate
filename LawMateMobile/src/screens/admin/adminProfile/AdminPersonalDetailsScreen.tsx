import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import AdminLayout from '../../../components/AdminLayout';
import apiClient from '../../../api/httpClient';
import { AuthService } from '../../../services/authService';
import { ENDPOINTS } from '../../../config/api.config';

interface AdminApiData {
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    userRole?: number | null;
    gender?: number | null;
    email?: string | null;
    nic?: string | null;
    contactNumber?: string | null;
    dateOfBirth?: string | null;
    nationality?: string | null;
}

interface PersonalData {
    name: string;
    adminId: string;
    role: string;
    department: string;
    contactNumber: string;
    emailAddress: string;
    nic: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
}

type EditableField = 'name' | 'contactNumber' | 'emailAddress';

const toRoleLabel = (role?: number | null): string => {
    if (role === 0) {
        return 'Admin';
    }

    if (role === 1) {
        return 'Lawyer';
    }

    if (role === 2) {
        return 'Client';
    }

    return '-';
};

const toGenderLabel = (gender?: number | null): string => {
    if (gender === 1) {
        return 'Male';
    }

    if (gender === 2) {
        return 'Female';
    }

    return '-';
};

const formatDate = (dateValue?: string | null): string => {
    if (!dateValue) {
        return '-';
    }

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return dateValue;
    }

    const day = `${parsedDate.getDate()}`.padStart(2, '0');
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
    const year = parsedDate.getFullYear();

    return `${day}/${month}/${year}`;
};

const toPersonalData = (data: AdminApiData): PersonalData => ({
    name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || '-',
    adminId: data.userId ?? '-',
    role: toRoleLabel(data.userRole),
    department: '-',
    contactNumber: data.contactNumber ?? '-',
    emailAddress: data.email ?? '-',
    nic: data.nic ?? '-',
    dateOfBirth: formatDate(data.dateOfBirth),
    gender: toGenderLabel(data.gender),
    nationality: data.nationality ?? '-',
});

const splitFullName = (fullName: string): { firstName: string; lastName: string } => {
    const trimmedName = fullName.trim();

    if (!trimmedName) {
        return {
            firstName: '',
            lastName: '',
        };
    }

    const parts = trimmedName.split(/\s+/);

    return {
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
    };
};

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
    }, [value, visible]);

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

const AdminPersonalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableField | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [apiData, setApiData] = useState<AdminApiData | null>(null);

    const [personalData, setPersonalData] = useState<PersonalData>({
        name: '-',
        adminId: '-',
        role: '-',
        department: '-',
        contactNumber: '-',
        emailAddress: '-',
        nic: '-',
        dateOfBirth: '-',
        gender: '-',
        nationality: '-',
    });

    useEffect(() => {
        let isMounted = true;

        const loadAdminProfile = async () => {
            try {
                setLoading(true);
                setErrorMessage(null);

                const currentUser = await AuthService.getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    throw new Error('User session not found. Please log in again.');
                }

                const response = await apiClient.get<AdminApiData>(
                    ENDPOINTS.ADMIN.GET_BY_USER_ID(userId)
                );

                if (!isMounted) {
                    return;
                }

                setApiData(response.data);
                setPersonalData(toPersonalData(response.data));
            } catch (error: any) {
                if (isMounted) {
                    setErrorMessage(error?.message ?? 'Failed to load personal details.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadAdminProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    const openEditModal = (field: EditableField) => {
        setEditingField(field);
        setEditModalVisible(true);
    };

    const handleSaveField = async (newValue: string) => {
        if (!editingField || !apiData) {
            return;
        }

        const previousPersonalData = personalData;
        const updatedPersonalData: PersonalData = {
            ...personalData,
            [editingField]: newValue,
        };

        setPersonalData(updatedPersonalData);

        const updatedApiData: AdminApiData = {
            ...apiData,
            firstName: editingField === 'name' ? splitFullName(newValue).firstName : apiData.firstName,
            lastName: editingField === 'name' ? splitFullName(newValue).lastName : apiData.lastName,
            contactNumber: editingField === 'contactNumber' ? newValue : apiData.contactNumber,
            email: editingField === 'emailAddress' ? newValue : apiData.email,
        };

        try {
            await apiClient.put(ENDPOINTS.ADMIN.UPDATE_BY_USER_ID(updatedApiData.userId), {
                userId: updatedApiData.userId,
                firstName: updatedApiData.firstName ?? '',
                lastName: updatedApiData.lastName ?? '',
                gender: updatedApiData.gender ?? undefined,
                email: updatedApiData.email ?? '',
                contactNumber: updatedApiData.contactNumber ?? '',
                dateOfBirth: updatedApiData.dateOfBirth ?? undefined,
                nationality: updatedApiData.nationality ?? '',
            });

            setApiData(updatedApiData);
        } catch (error: any) {
            setPersonalData(previousPersonalData);
            Alert.alert('Update failed', error?.message ?? 'Failed to update profile. Please try again.');
        }
    };

    return (
        <AdminLayout
            title="Personal Details"
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
                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                ) : errorMessage ? (
                    <View style={styles.infoBox}>
                        <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                        <Text style={styles.infoText}>{errorMessage}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.card}>
                            <DetailRow
                                label="Name"
                                value={personalData.name}
                                onPress={() => openEditModal('name')}
                            />
                            <DetailRow
                                label="Admin ID"
                                value={personalData.adminId}
                            />
                            <DetailRow
                                label="Role"
                                value={personalData.role}
                            />
                            <DetailRow
                                label="Department"
                                value={personalData.department}
                            />
                            <DetailRow
                                label="Contact Number"
                                value={personalData.contactNumber}
                                onPress={() => openEditModal('contactNumber')}
                            />
                            <DetailRow
                                label="Email Address"
                                value={personalData.emailAddress}
                                onPress={() => openEditModal('emailAddress')}
                            />
                            <DetailRow
                                label="NIC"
                                value={personalData.nic}
                            />
                            <DetailRow
                                label="Date of Birth"
                                value={personalData.dateOfBirth}
                            />
                            <DetailRow
                                label="Gender"
                                value={personalData.gender}
                            />
                            <DetailRow
                                label="Nationality"
                                value={personalData.nationality}
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                            <Text style={styles.infoText}>
                                Name, contact number, and email can be updated here.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>

            <EditModal
                visible={editModalVisible}
                title={editingField ? editingField.charAt(0).toUpperCase() + editingField.slice(1) : ''}
                value={editingField ? (personalData[editingField as keyof typeof personalData] || '') : ''}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveField}
            />
            </View>
        </AdminLayout>
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

export default AdminPersonalDetailsScreen;
