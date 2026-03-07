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
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Toast from '../../../components/Toast';
import Button from '../../../components/Button';

const CASE_TYPES = [
    'Criminal Law', 'Family Law', 'Property Law', 'Corporate Law',
    'Intellectual Property', 'Labor Law', 'Immigration Law', 'Contract Law',
];
const DURATIONS = ['15 min', '30 min', '45 min', '60 min'];
const STATUSES  = ['Pending', 'Confirmed', 'Completed'];
const MODES     = ['Physical', 'Virtual'];

interface AppointmentData {
    clientName: string;
    email: string;
    contactNumber: string;
    caseType: string;
    date: Date | null;
    time: Date | null;
    duration: string;
    price: string;
    status: string;
    mode: string;
    notes: string;
}

// floating label text input
const FloatInput: React.FC<{
    label: string;
    value: string;
    onChangeText: (t: string) => void;
    keyboardType?: any;
    multiline?: boolean;
}> = ({ label, value, onChangeText, keyboardType, multiline }) => (
    <View style={styles.fieldWrap}>
        <Text style={styles.floatLabel}>{label}</Text>
        <TextInput
            style={[styles.fieldInput, multiline && styles.multilineInput]}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            placeholderTextColor={colors.textSecondary}
        />
    </View>
);

// dropdown select
const DropdownField: React.FC<{
    label: string;
    value: string;
    options: string[];
    onSelect: (v: string) => void;
    icon?: keyof typeof Ionicons.glyphMap;
}> = ({ label, value, options, onSelect, icon }) => {
    const [open, setOpen] = useState(false);
    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.floatLabel}>{label}</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setOpen(true)}>
                <Text style={[styles.dropdownBtnText, !value && { color: colors.textSecondary }]}>
                    {value || `Select ${label}`}
                </Text>
                <Ionicons name={icon ?? 'chevron-down'} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.dropdownModal}>
                        <View style={styles.dropdownHeader}>
                            <Text style={styles.dropdownTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setOpen(false)}>
                                <Ionicons name="close" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={i => i}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.optionItem, value === item && styles.optionSelected]}
                                    onPress={() => { onSelect(item); setOpen(false); }}
                                >
                                    {value === item && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                                    <Text style={[styles.optionText, value === item && styles.optionTextSel]}>
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

const AddAppointmentScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [form, setForm] = useState<AppointmentData>({
        clientName: '',
        email: '',
        contactNumber: '',
        caseType: '',
        date: null,
        time: null,
        duration: '30 min',
        price: '5000',
        status: 'Confirmed',
        mode: 'Physical',
        notes: '',
    });

    // Date / time pickers
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Toast
    const [toastVisible, setToastVisible] = useState(false);

    const set = (field: keyof AppointmentData, val: any) =>
        setForm(prev => ({ ...prev, [field]: val }));

    const fmtDate = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    const fmtTime12 = (d: Date) => {
        const h = d.getHours(), m = d.getMinutes();
        const ap = h >= 12 ? 'p.m.' : 'a.m.';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
    };

    const dateTimeLabel = () => {
        if (form.date && form.time) {
            const durMins = parseInt(form.duration) || 30;
            const end = new Date(form.time.getTime() + durMins * 60000);
            return `${fmtDate(form.date)}, ${fmtTime12(form.time)} - ${fmtTime12(end)}`;
        }
        if (form.date) return fmtDate(form.date);
        return '';
    };

    const handleSave = () => {
        if (!form.clientName.trim() || !form.email.trim() || !form.caseType || !form.date || !form.price.trim()) {
            return;
        }
        // TODO: post api - save appointment
        setToastVisible(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={colors.white} />
                    <Text style={styles.backText}>Add Appointment</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <FloatInput label="Client Name"     value={form.clientName}     onChangeText={v => set('clientName', v)} />
                <FloatInput label="Email"           value={form.email}          onChangeText={v => set('email', v)} keyboardType="email-address" />
                <FloatInput label="Contact Number"  value={form.contactNumber}  onChangeText={v => set('contactNumber', v)} keyboardType="phone-pad" />

                <DropdownField
                    label="Case Type"
                    value={form.caseType}
                    options={CASE_TYPES}
                    onSelect={v => set('caseType', v)}
                />

                {/* Date and Time field */}
                <View style={styles.fieldWrap}>
                    <Text style={styles.floatLabel}>Date and Time</Text>
                    <TouchableOpacity
                        style={styles.dropdownBtn}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={[styles.dropdownBtnText, !form.date && { color: colors.textSecondary }]}>
                            {dateTimeLabel() || 'Select Date and Time'}
                        </Text>
                        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <DropdownField
                    label="Duration"
                    value={form.duration}
                    options={DURATIONS}
                    onSelect={v => set('duration', v)}
                    icon="time-outline"
                />

                <FloatInput
                    label="Price (LKR)"
                    value={form.price}
                    onChangeText={v => set('price', v)}
                    keyboardType="numeric"
                />

                <DropdownField
                    label="Status"
                    value={form.status}
                    options={STATUSES}
                    onSelect={v => set('status', v)}
                />

                <DropdownField
                    label="Mode"
                    value={form.mode}
                    options={MODES}
                    onSelect={v => set('mode', v)}
                />

                <FloatInput
                    label="Special Notes for the Appointment"
                    value={form.notes}
                    onChangeText={v => set('notes', v)}
                    multiline
                />
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.bottomBar}>
                <Button
                    title="BACK"
                    variant="transparent"
                    onPress={() => navigation.goBack()}
                    style={styles.btnStyle}
                />
                <Button
                    title="SAVE"
                    variant="primary"
                    onPress={handleSave}
                    style={styles.btnStyle}
                />
            </View>

            {/* Date picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={form.date ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) { set('date', d); setShowTimePicker(true); }
                    }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={form.time ?? new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, t) => {
                        setShowTimePicker(false);
                        if (t) set('time', t);
                    }}
                />
            )}

            {/* Success Toast */}
            <Toast
                visible={toastVisible}
                message="Appointment Saved Successfully"
                type="success"
                onDismiss={() => { setToastVisible(false); navigation.goBack(); }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
        backgroundColor: colors.primary,
        paddingTop: 48,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    backText: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },

    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingBottom: 120 },

    fieldWrap: { marginBottom: spacing.lg },
    floatLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    fieldInput: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        backgroundColor: colors.white,
    },
    multilineInput: { height: 100, paddingTop: spacing.md },

    dropdownBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        backgroundColor: colors.white,
    },
    dropdownBtnText: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        flex: 1,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dropdownModal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        maxHeight: '60%',
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
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    optionSelected: { backgroundColor: colors.background },
    optionText: {
        marginLeft: spacing.sm,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
    },
    optionTextSel: { fontWeight: fontWeight.bold, color: colors.primary },

    bottomBar: {
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
    btnStyle: { flex: 1 },
});

export default AddAppointmentScreen;
