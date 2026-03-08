import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
    Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../config/theme';

interface AppointmentFormData {
    name: string;
    caseType: string;
    date: Date | null;
    startTime: Date | null;
    endTime: Date | null;
    description: string;
    mode: string;
    location: string;
}

type PickerMode = 'date' | 'start' | 'end' | null;

const CASE_TYPES = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Corporate Law',
    'Intellectual Property', 'Labour Law', 'Land & Property', 'Immigration',
];

const MODES = ['Physical', 'Online'];

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const formatTime = (date: Date | null): string => {
    if (!date) return '';
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const suffix = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}.${minutes} ${suffix}`;
};

const FieldWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
    </View>
);

interface DropdownProps {
    label: string;
    value: string;
    placeholder?: string;
    options: string[];
    onSelect: (val: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, placeholder = '', options, onSelect }) => {
    const [visible, setVisible] = useState(false);
    return (
        <>
            <FieldWrapper label={label}>
                <TouchableOpacity style={styles.inputRow} onPress={() => setVisible(true)} activeOpacity={0.7}>
                    <Text style={[styles.inputText, !value && styles.placeholderText]}>
                        {value || placeholder}
                    </Text>
                    <Text style={styles.chevron}>⌵</Text>
                </TouchableOpacity>
            </FieldWrapper>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setVisible(false)}>
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.modalOption}
                                    onPress={() => { onSelect(opt); setVisible(false); }}
                                >
                                    <Text style={[styles.modalOptionText, value === opt && styles.modalOptionSelected]}>
                                        {opt}
                                    </Text>
                                    {value === opt && <Text style={styles.modalCheck}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

interface AppointmentFormScreenProps {
    navigation?: any;
    route?: { params?: { lawyerId?: string; slotId?: string } };
}

const AppointmentForm: React.FC<AppointmentFormScreenProps> = ({ navigation, route }) => {
    const [form, setForm] = useState<AppointmentFormData>({
        name: '', caseType: '', date: null, startTime: null,
        endTime: null, description: '', mode: '', location: '',
    });
    const [loading, setLoading] = useState(false);
    const [pickerMode, setPickerMode] = useState<PickerMode>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const set = <K extends keyof AppointmentFormData>(key: K, value: AppointmentFormData[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    const openPicker = (mode: PickerMode) => {
        const existing = mode === 'date' ? form.date : mode === 'start' ? form.startTime : form.endTime;
        setTempDate(existing ?? new Date());
        setPickerMode(mode);
    };

    const onPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
        if (!selected) return;
        setTempDate(selected);
        if (Platform.OS === 'android') commitAndClose(selected);
    };

    const commitAndClose = (value: Date) => {
        if (pickerMode === 'date') set('date', value);
        else if (pickerMode === 'start') set('startTime', value);
        else if (pickerMode === 'end') set('endTime', value);
        setPickerMode(null);
    };

    const isFormValid =
        form.name.trim() !== '' && form.caseType !== '' && form.date !== null &&
        form.startTime !== null && form.endTime !== null && form.mode !== '';

    const handleContinue = async () => {
        if (!isFormValid) return;
        setLoading(true);
        await new Promise((res) => setTimeout(res, 600));
        setLoading(false);
        navigation?.navigate('AppointmentConfirm', {
            lawyerId: route?.params?.lawyerId,
            slotId: route?.params?.slotId,
            formData: {
                ...form,
                date: form.date?.toISOString(),
                startTime: form.startTime?.toISOString(),
                endTime: form.endTime?.toISOString(),
            },
        });
    };

    const pickerIsTime = pickerMode === 'start' || pickerMode === 'end';
    const pickerLabel = pickerMode === 'date' ? 'Select Date' : pickerMode === 'start' ? 'Select Start Time' : 'Select End Time';

    return (
        <ClientLayout title="Appointment Request" showBackButton onBackPress={() => navigation?.goBack()}>
            <View style={styles.container}>
                <FieldWrapper label="Name">
                    <TextInput
                        style={styles.inputRow}
                        value={form.name}
                        onChangeText={(v) => set('name', v)}
                        placeholderTextColor="#BDBDBD"
                    />
                </FieldWrapper>

                <Dropdown label="Case type" value={form.caseType} options={CASE_TYPES} onSelect={(v) => set('caseType', v)} />

                <FieldWrapper label="Date">
                    <TouchableOpacity style={styles.inputRow} onPress={() => openPicker('date')} activeOpacity={0.7}>
                        <Text style={[styles.inputText, !form.date && styles.placeholderText]}>
                            {form.date ? formatDate(form.date) : ''}
                        </Text>
                        <Text style={styles.iconText}>📅</Text>
                    </TouchableOpacity>
                </FieldWrapper>

                <FieldWrapper label="Start time">
                    <TouchableOpacity style={styles.inputRow} onPress={() => openPicker('start')} activeOpacity={0.7}>
                        <Text style={[styles.inputText, !form.startTime && styles.placeholderText]}>
                            {form.startTime ? formatTime(form.startTime) : ''}
                        </Text>
                        <Text style={styles.iconText}>🕐</Text>
                    </TouchableOpacity>
                </FieldWrapper>

                <FieldWrapper label="End time">
                    <TouchableOpacity style={styles.inputRow} onPress={() => openPicker('end')} activeOpacity={0.7}>
                        <Text style={[styles.inputText, !form.endTime && styles.placeholderText]}>
                            {form.endTime ? formatTime(form.endTime) : ''}
                        </Text>
                        <Text style={styles.iconText}>🕐</Text>
                    </TouchableOpacity>
                </FieldWrapper>

                <FieldWrapper label="Description">
                    <TextInput
                        style={[styles.inputRow, styles.textArea]}
                        value={form.description}
                        onChangeText={(v) => set('description', v)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholderTextColor="#BDBDBD"
                    />
                </FieldWrapper>

                <Dropdown
                    label="Mode"
                    value={form.mode}
                    placeholder="Options"
                    options={MODES}
                    onSelect={(v) => { set('mode', v); if (v === 'Online') set('location', ''); }}
                />

                {form.mode === 'Physical' && (
                    <FieldWrapper label="Location">
                        <TextInput
                            style={styles.inputRow}
                            value={form.location}
                            onChangeText={(v) => set('location', v)}
                            placeholderTextColor="#BDBDBD"
                        />
                    </FieldWrapper>
                )}

                <View style={styles.buttonWrapper}>
                    <Button
                        title="CONTINUE"
                        variant="primary"
                        onPress={handleContinue}
                        loading={loading}
                        disabled={!isFormValid}
                        style={styles.fullWidth}
                    />
                </View>
            </View>

            {/* Date / Time Picker Modal */}
            <Modal visible={pickerMode !== null} transparent animationType="slide" onRequestClose={() => setPickerMode(null)}>
                <View style={styles.pickerOverlay}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity onPress={() => setPickerMode(null)}>
                                <Text style={styles.pickerCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.pickerTitle}>{pickerLabel}</Text>
                            <TouchableOpacity onPress={() => commitAndClose(tempDate)}>
                                <Text style={styles.pickerDone}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={tempDate}
                            mode={pickerIsTime ? 'time' : 'date'}
                            display="spinner"
                            is24Hour={false}
                            onChange={onPickerChange}
                            minimumDate={!pickerIsTime ? new Date() : undefined}
                            style={styles.picker}
                            textColor="#212121"
                        />
                    </View>
                </View>
            </Modal>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop: spacing.lg ?? 20,
        paddingBottom: spacing.xl ?? 32,
    },
    fieldWrapper: { marginBottom: 16 },
    fieldLabel: { fontSize: 12, color: '#9E9E9E', marginBottom: 5, fontWeight: '400' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 8, paddingHorizontal: 14, paddingVertical: 13,
        borderWidth: 1, borderColor: '#E8E8E8', fontSize: 15, color: '#212121',
    },
    inputText: { flex: 1, fontSize: 15, color: '#212121' },
    placeholderText: { color: '#BDBDBD' },
    textArea: { height: 90, paddingTop: 12, alignItems: 'flex-start' },
    iconText: { fontSize: 16 },
    chevron: { fontSize: 16, color: '#9E9E9E', marginTop: -4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, maxHeight: '55%',
    },
    modalTitle: { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 16 },
    modalOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F2',
    },
    modalOptionText: { fontSize: 15, color: '#424242' },
    modalOptionSelected: { color: '#5B4BDB', fontWeight: '600' },
    modalCheck: { color: '#5B4BDB', fontSize: 16, fontWeight: '700' },
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 30 },
    pickerHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    pickerTitle: { fontSize: 16, fontWeight: '600', color: '#212121' },
    pickerCancel: { fontSize: 15, color: '#9E9E9E' },
    pickerDone: { fontSize: 15, fontWeight: '700', color: '#4F3CC9' },
    picker: { width: '100%', height: 200 },
    buttonWrapper: { marginTop: 8 },
    fullWidth: { width: '100%' },
});

export default AppointmentForm;