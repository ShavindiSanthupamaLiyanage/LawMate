import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

const CASE_TYPES = [
    'Criminal Law',
    'Family Law',
    'Property Law',
    'Corporate Law',
    'Intellectual Property',
    'Labor Law',
    'Immigration Law',
    'Contract Law',
];

const DURATIONS = [15, 30, 45, 60];

const STATUSES = ['pending', 'confirmed', 'completed'];

interface AppointmentData {
    clientName: string;
    email: string;
    contactNumber: string;
    caseType: string;
    dateTime: Date | null;
    duration: number;
    status: string;
    mode: string;
    notes: string;
    price: number;
}

interface AddAppointmentProps {
    onSave: (appointment: AppointmentData) => void;
    initialDate?: Date;
}

const DropdownSelect = ({
    label,
    value,
    options,
    onSelect,
    icon,
}: {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
    icon?: keyof typeof Ionicons.glyphMap;
}) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.fieldContainer}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.input, { color: value ? colors.textPrimary : colors.textSecondary }]}>
                    {value || `Select ${label}`}
                </Text>
                <Ionicons name={icon || 'chevron-down'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, value === item && styles.selectedOption]}
                                    onPress={() => {
                                        onSelect(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    {value === item && (
                                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                                    )}
                                    <Text
                                        style={[
                                            styles.optionText,
                                            value === item && styles.selectedOptionText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const AddAppointmentScreen: React.FC<AddAppointmentProps> = ({ onSave, initialDate }) => {
    const navigation = useNavigation<any>();
    const [formData, setFormData] = useState<AppointmentData>({
        clientName: '',
        email: '',
        contactNumber: '',
        caseType: '',
        dateTime: initialDate || null,
        duration: 30,
        status: 'pending',
        mode: 'physical',
        notes: '',
        price: 5000,
    });

    const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);

    const handleInputChange = (field: keyof AppointmentData, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {
        if (!formData.clientName.trim() || !formData.email.trim() || !formData.dateTime || !formData.caseType) {
            alert('Please fill in all required fields');
            return;
        }

        onSave(formData);
        // Reset form
        setFormData({
            clientName: '',
            email: '',
            contactNumber: '',
            caseType: '',
            dateTime: null,
            duration: 30,
            status: 'pending',
            mode: 'physical',
            notes: '',
            price: 5000,
        });

        navigation.goBack();
    };

    return (
        <View style={styles.container}>
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
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Appointment</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.form}>
                    {/* Client Name */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Client Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Client Name"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.clientName}
                            onChangeText={(text) => handleInputChange('clientName', text)}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                        />
                    </View>

                    {/* Contact Number */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Contact Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Contact Number"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="phone-pad"
                            value={formData.contactNumber}
                            onChangeText={(text) => handleInputChange('contactNumber', text)}
                        />
                    </View>

                    {/* Case Type */}
                    <DropdownSelect
                        label="Case Type"
                        value={formData.caseType}
                        options={CASE_TYPES}
                        onSelect={(value) => handleInputChange('caseType', value)}
                    />

                    {/* Date and Time */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Date and Time</Text>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setDateTimeModalVisible(true)}
                        >
                            <Text style={[styles.input, { color: formData.dateTime ? colors.textPrimary : colors.textSecondary }]}>
                                {formData.dateTime ? formData.dateTime.toLocaleString() : 'Select Date and Time'}
                            </Text>
                            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Duration */}
                    <DropdownSelect
                        label="Duration"
                        value={formData.duration ? `${formData.duration} minutes` : ''}
                        options={DURATIONS.map(d => `${d} minutes`)}
                        onSelect={(value) => {
                            const duration = parseInt(value);
                            handleInputChange('duration', duration);
                        }}
                        icon="time-outline"
                    />

                    {/* Status */}
                    <DropdownSelect
                        label="Status"
                        value={formData.status}
                        options={STATUSES}
                        onSelect={(value) => handleInputChange('status', value)}
                    />

                    {/* Mode */}
                    <DropdownSelect
                        label="Mode"
                        value={formData.mode === 'physical' ? 'Physical' : 'Virtual'}
                        options={['Physical', 'Virtual']}
                        onSelect={(value) => {
                            handleInputChange('mode', value === 'Physical' ? 'physical' : 'virtual');
                        }}
                    />

                    {/* Price */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Price (LKR)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Price"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="decimal-pad"
                            value={formData.price.toString()}
                            onChangeText={(text) => handleInputChange('price', parseFloat(text) || 0)}
                        />
                    </View>

                    {/* Special Notes */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Special Notes</Text>
                        <TextInput
                            style={[styles.input, styles.notesInput]}
                            placeholder="Special Notes"
                            placeholderTextColor={colors.textSecondary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={formData.notes}
                            onChangeText={(text) => handleInputChange('notes', text)}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.cancelButtonText}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1872EA', '#6347FD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                    >
                        <Text style={styles.saveButtonText}>SAVE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Date Time Modal */}
            <Modal
                visible={dateTimeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDateTimeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.dateTimeModal}>
                        <Text style={styles.dropdownTitle}>Select Date and Time</Text>
                        {/* TODO: Implement date/time picker */}
                        <TouchableOpacity
                            style={styles.closeModalButton}
                            onPress={() => setDateTimeModalVisible(false)}
                        >
                            <Text style={styles.closeModalButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
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
        paddingBottom: 120,
    },
    form: {
        padding: spacing.md,
    },
    fieldContainer: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        backgroundColor: colors.white,
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    notesInput: {
        height: 100,
        paddingTop: spacing.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    dropdownModal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        maxHeight: '70%',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    dropdownTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    selectedOption: {
        backgroundColor: colors.background,
    },
    optionText: {
        marginLeft: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    selectedOptionText: {
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    dateTimeModal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        padding: spacing.lg,
        height: '60%',
    },
    closeModalButton: {
        marginTop: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    closeModalButtonText: {
        color: colors.white,
        fontWeight: fontWeight.bold,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    button: {
        flex: 1,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        paddingVertical: spacing.md,
        textAlign: 'center',
    },
    saveButton: {
        flex: 1,
    },
    saveButtonGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
});

export default AddAppointmentScreen;
