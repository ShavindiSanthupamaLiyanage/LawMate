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
import ClientLayout from '../../../components/ClientLayout';
import apiClient from '../../../api/client';
import { AuthService } from '../../../services/authService';
import { ENDPOINTS } from '../../../config/api.config';

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

interface PersonalData {
    name: string;
    address: string;
    contactNumber: string;
    emailAddress: string;
    nic: string;
    gender: string;
}

interface ClientApiData {
    userId: string;
    prefix: number;
    firstName?: string | null;
    lastName?: string | null;
    gender?: number | null;
    email?: string | null;
    nic?: string | null;
    contactNumber?: string | null;
    address?: string | null;
    district?: string | null;
    prefferedLanguage?: number | null;
}

type EditableField = 'address' | 'contactNumber' | 'emailAddress';

const toGenderLabel = (gender?: number | null): string => {
    if (gender === 1) {
        return 'Male';
    }

    if (gender === 2) {
        return 'Female';
    }

    return '-';
};

const toPersonalData = (data: ClientApiData): PersonalData => ({
    name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || '-',
    address: data.address ?? '-',
    contactNumber: data.contactNumber ?? '-',
    emailAddress: data.email ?? '-',
    nic: data.nic ?? '-',
    gender: toGenderLabel(data.gender),
});

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

const ClientPersonalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingField, setEditingField] = useState<EditableField | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [apiData, setApiData] = useState<ClientApiData | null>(null);
    const [personalData, setPersonalData] = useState<PersonalData>({
        name: '-',
        address: '-',
        contactNumber: '-',
        emailAddress: '-',
        nic: '-',
        gender: '-',
    });

    useEffect(() => {
        let isMounted = true;

        const loadClientProfile = async () => {
            try {
                setLoading(true);
                setErrorMessage(null);

                const currentUser = await AuthService.getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    throw new Error('User session not found. Please log in again.');
                }

                const response = await apiClient.get<ClientApiData>(
                    ENDPOINTS.CLIENT.GET_BY_USER_ID(userId)
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

        loadClientProfile();

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

        const updatedApiData: ClientApiData = {
            ...apiData,
            address: editingField === 'address' ? newValue : apiData.address,
            contactNumber: editingField === 'contactNumber' ? newValue : apiData.contactNumber,
            email: editingField === 'emailAddress' ? newValue : apiData.email,
        };

        try {
            await apiClient.put(ENDPOINTS.CLIENT.UPDATE_BY_USER_ID(updatedApiData.userId), {
                userId: updatedApiData.userId,
                prefix: updatedApiData.prefix,
                firstName: updatedApiData.firstName ?? '',
                lastName: updatedApiData.lastName ?? '',
                gender: updatedApiData.gender ?? undefined,
                email: updatedApiData.email ?? '',
                contactNumber: updatedApiData.contactNumber ?? '',
                address: updatedApiData.address ?? '',
                district: updatedApiData.district ?? '',
                prefferedLanguage: updatedApiData.prefferedLanguage ?? 1,
            });

            setApiData(updatedApiData);
        } catch (error: any) {
            setPersonalData(previousPersonalData);
            Alert.alert('Update failed', error?.message ?? 'Failed to update profile. Please try again.');
        }
    };

    return (
        <ClientLayout
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
                            />
                            <DetailRow
                                label="Address"
                                value={personalData.address}
                                onPress={() => openEditModal('address')}
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
                                label="Gender"
                                value={personalData.gender}
                            />
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                            <Text style={styles.infoText}>
                                Address, contact number, and email can be updated here.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>

            <EditModal
                visible={editModalVisible}
                title={editingField ? editingField.charAt(0).toUpperCase() + editingField.slice(1) : ''}
                value={editingField ? personalData[editingField] : ''}
                onClose={() => setEditModalVisible(false)}
                onSave={handleSaveField}
            />
            </View>
        </ClientLayout>
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

export default ClientPersonalDetailsScreen;
