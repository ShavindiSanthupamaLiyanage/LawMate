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
import { useAuth } from '../../../context/AuthContext';
import { ProfileService, UpdateAdminProfilePayload } from '../../../services/profileService';
import { UserRole } from '../../../interfaces/auth.interface';
import { GetAdminDto } from '../../../interfaces/userDetails.interface';

type PersonalData = {
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
    const { user } = useAuth();
    const editableFields: Array<keyof PersonalData> = [
        'name',
        'contactNumber',
        'emailAddress',
        'dateOfBirth',
        'gender',
        'nationality',
    ];

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<keyof PersonalData | null>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [adminProfile, setAdminProfile] = useState<GetAdminDto | null>(null);

    const [personalData, setPersonalData] = useState<PersonalData>({
        name: 'N/A',
        adminId: 'N/A',
        role: 'N/A',
        department: 'N/A',
        contactNumber: 'N/A',
        emailAddress: 'N/A',
        nic: 'N/A',
        dateOfBirth: 'N/A',
        gender: 'N/A',
        nationality: 'N/A',
    });

    const openEditModal = (field: keyof PersonalData) => {
        setEditingField(field);
        setEditModalVisible(true);
    };

    const splitName = (fullName: string) => {
        const parts = fullName.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return { firstName: '', lastName: '' };
        if (parts.length === 1) return { firstName: parts[0], lastName: '' };
        return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
    };

    const mapGender = (gender?: number) => {
        if (gender === 1) return 'Male';
        if (gender === 2) return 'Female';
        if (gender === 3) return 'Other';
        return 'N/A';
    };

    const parseGender = (value: string) => {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'male') return 1;
        if (normalized === 'female') return 2;
        if (normalized === 'other') return 3;
        return null;
    };

    const formatDateForDisplay = (dateValue?: string) => {
        if (!dateValue) return 'N/A';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return 'N/A';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}/${date.getFullYear()}`;
    };

    const parseDateForApi = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed || trimmed === 'N/A') return undefined;

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

        const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slash) {
            const day = Number(slash[1]);
            const month = Number(slash[2]);
            const year = Number(slash[3]);

            if (day < 1 || day > 31 || month < 1 || month > 12) return null;

            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }

        const parsed = new Date(trimmed);
        if (Number.isNaN(parsed.getTime())) return null;

        return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    };

    const handleSaveField = async (newValue: string) => {
        if (!editingField) return;

        if (!editableFields.includes(editingField)) {
            Alert.alert('Not Allowed', 'This field is not editable.');
            return;
        }

        if (!user?.userId || !adminProfile) {
            Alert.alert('Error', 'Profile data is not ready. Please try again.');
            return;
        }

        const nextDisplayName =
            editingField === 'name'
                ? newValue
                : `${adminProfile.firstName ?? ''} ${adminProfile.lastName ?? ''}`.trim();

        const { firstName, lastName } = splitName(nextDisplayName);

        const nextGender =
            editingField === 'gender'
                ? parseGender(newValue)
                : adminProfile.gender;

        if (nextGender == null) {
            Alert.alert('Validation', 'Gender should be Male, Female, or Other.');
            return;
        }

        const nextDateOfBirth =
            editingField === 'dateOfBirth'
                ? parseDateForApi(newValue)
                : parseDateForApi(adminProfile.dateOfBirth ?? '');

        if (editingField === 'dateOfBirth' && nextDateOfBirth === null) {
            Alert.alert('Validation', 'Use DOB format YYYY-MM-DD or DD/MM/YYYY.');
            return;
        }

        const nextNationality =
            editingField === 'nationality'
                ? newValue.trim()
                : (adminProfile.nationality ?? '');

        const payload: UpdateAdminProfilePayload = {
            userId: user.userId,
            firstName,
            lastName,
            gender: nextGender,
            email: editingField === 'emailAddress' ? newValue : adminProfile.email,
            contactNumber: editingField === 'contactNumber' ? newValue : adminProfile.contactNumber,
            dateOfBirth: nextDateOfBirth ?? undefined,
            nationality: nextNationality || undefined,
        };

        try {
            await ProfileService.updateAdminProfile(user.userId, payload);

            setPersonalData(prev => {
                if (editingField === 'gender') {
                    return { ...prev, gender: mapGender(nextGender) };
                }

                if (editingField === 'dateOfBirth') {
                    return { ...prev, dateOfBirth: formatDateForDisplay(nextDateOfBirth ?? undefined) };
                }

                if (editingField === 'nationality') {
                    return { ...prev, nationality: nextNationality || 'N/A' };
                }

                return {
                    ...prev,
                    [editingField]: newValue,
                };
            });

            setAdminProfile(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    firstName,
                    lastName,
                    gender: nextGender,
                    email: payload.email ?? prev.email,
                    contactNumber: payload.contactNumber ?? prev.contactNumber,
                    dateOfBirth: nextDateOfBirth ?? prev.dateOfBirth,
                    nationality: nextNationality || prev.nationality,
                };
            });

            Alert.alert('Success', 'Personal details updated successfully.');
        } catch {
            Alert.alert('Update Failed', 'Unable to update personal details right now.');
        }
    };

    useEffect(() => {
        let isMounted = true;

        const mapRole = (role?: number) => {
            if (role === UserRole.ADMIN) return 'Admin';
            if (role === UserRole.LAWYER) return 'Lawyer';
            if (role === UserRole.CLIENT) return 'Client';
            return 'N/A';
        };

        const loadPersonalData = async () => {
            if (!user?.userId) {
                if (isMounted) {
                    setProfileError('User session not found. Please log in again.');
                    setIsLoadingProfile(false);
                }
                return;
            }

            if (user.role !== UserRole.ADMIN) {
                if (isMounted) {
                    setProfileError(null);
                    setIsLoadingProfile(false);
                }
                return;
            }

            try {
                setIsLoadingProfile(true);
                setProfileError(null);

                const admin = await ProfileService.getAdminByUserId(user.userId);
                if (!isMounted) return;

                setAdminProfile(admin);

                setPersonalData(prev => ({
                    ...prev,
                    name: `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.trim() || 'N/A',
                    adminId: admin.userId ?? 'N/A',
                    role: mapRole(admin.userRole),
                    contactNumber: admin.contactNumber ?? 'N/A',
                    emailAddress: admin.email ?? 'N/A',
                    nic: admin.nic ?? 'N/A',
                    dateOfBirth: formatDateForDisplay(admin.dateOfBirth),
                    gender: mapGender(admin.gender),
                    nationality: admin.nationality ?? 'N/A',
                }));
            } catch {
                if (!isMounted) return;
                setProfileError('Failed to load personal details.');
            } finally {
                if (isMounted) {
                    setIsLoadingProfile(false);
                }
            }
        };

        loadPersonalData();

        return () => {
            isMounted = false;
        };
    }, [user?.userId, user?.role]);

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
                {isLoadingProfile && <ActivityIndicator color={colors.primary} style={styles.loader} />}
                {profileError ? <Text style={styles.errorText}>{profileError}</Text> : null}

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
                        onPress={() => openEditModal('dateOfBirth')}
                    />
                    <DetailRow
                        label="Gender"
                        value={personalData.gender}
                        onPress={() => openEditModal('gender')}
                    />
                    <DetailRow
                        label="Nationality"
                        value={personalData.nationality}
                        onPress={() => openEditModal('nationality')}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Only non-critical fields can be updated from this page.
                    </Text>
                </View>
            </ScrollView>

            <EditModal
                visible={editModalVisible}
                title={editingField ? editingField.charAt(0).toUpperCase() + editingField.slice(1) : ''}
                value={editingField ? personalData[editingField] : ''}
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
    loader: {
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        marginBottom: spacing.md,
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
