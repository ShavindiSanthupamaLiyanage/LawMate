import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Modal,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { spacing } from '../../../config/theme';
import { bookingService } from '../../../services/bookingService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentFormData {
    name: string;
    caseType: string;
    description: string;
    mode: 'Physical' | 'Online' | '';
    location: string;
}

const CASE_TYPE_MAP: Record<string, number> = {
    'Family Law':     1,
    'Criminal Law':   2,
    'Property Law':   3,
    'Cyber':          4,
};

const CASE_TYPES = Object.keys(CASE_TYPE_MAP);

const MODES = ['Physical', 'Online'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string => {
    const day   = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    return `${day}-${month}-${date.getFullYear()}`;
};

const formatTime = (date: Date): string => {
    let h     = date.getHours();
    const m   = String(date.getMinutes()).padStart(2, '0');
    const sfx = h >= 12 ? 'p.m.' : 'a.m.';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}.${m} ${sfx}`;
};

// ─── FieldWrapper ─────────────────────────────────────────────────────────────

const FieldWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <View style={styles.fieldWrapper}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
    </View>
);

// ─── ReadOnlyField ────────────────────────────────────────────────────────────

const ReadOnlyField: React.FC<{ label: string; value: string; icon?: string }> = ({ label, value, icon }) => (
    <FieldWrapper label={label}>
        <View style={[styles.inputRow, styles.readOnlyRow]}>
            <Text style={styles.readOnlyText}>{value}</Text>
            {icon ? <Text style={styles.iconText}>{icon}</Text> : null}
        </View>
    </FieldWrapper>
);

// ─── Dropdown ─────────────────────────────────────────────────────────────────

const Dropdown: React.FC<{
    label: string;
    value: string;
    placeholder?: string;
    options: string[];
    onSelect: (v: string) => void;
}> = ({ label, value, placeholder = 'Select…', options, onSelect }) => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <FieldWrapper label={label}>
                <TouchableOpacity
                    style={styles.inputRow}
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.inputText, !value && styles.placeholderText]}>
                        {value || placeholder}
                    </Text>
                    <Text style={styles.chevron}>⌵</Text>
                </TouchableOpacity>
            </FieldWrapper>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={styles.modalOption}
                                    onPress={() => { onSelect(opt); setVisible(false); }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        value === opt && styles.modalOptionSelected,
                                    ]}>
                                        {opt}
                                    </Text>
                                    {value === opt && (
                                        <Text style={styles.modalCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

// ─── Slot Skeleton ────────────────────────────────────────────────────────────

const SlotFieldSkeleton: React.FC = () => (
    <View style={styles.skeletonWrapper}>
        {[1, 2, 3].map((i) => (
            <View key={i} style={styles.fieldWrapper}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonInput} />
            </View>
        ))}
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
    navigation?: any;
    route?: { params?: { lawyerId?: string; slotId?: number } };
}

const AppointmentFormScreen: React.FC<Props> = ({ navigation, route }) => {
    const lawyerId = route?.params?.lawyerId ?? '';
    const slotId   = route?.params?.slotId;

    // ── Form state ────────────────────────────────────────────────────────────
    const [form, setForm] = useState<AppointmentFormData>({
        name: '', caseType: '', description: '', mode: '', location: '',
    });

    // ── Slot state (read-only) ────────────────────────────────────────────────
    const [slotDate,      setSlotDate]      = useState<Date | null>(null);
    const [slotStartTime, setSlotStartTime] = useState<Date | null>(null);
    const [slotEndTime,   setSlotEndTime]   = useState<Date | null>(null);
    const [slotLoading,   setSlotLoading]   = useState(true);
    const [slotError,     setSlotError]     = useState<string | null>(null);

    // ── Submit state ──────────────────────────────────────────────────────────
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError,   setSubmitError]   = useState<string | null>(null);

    const set = <K extends keyof AppointmentFormData>(key: K, value: AppointmentFormData[K]) =>
        setForm((f) => ({ ...f, [key]: value }));

    // ── Fetch slot on mount ───────────────────────────────────────────────────
    useEffect(() => {
        if (!slotId) {
            setSlotLoading(false);
            setSlotError('No time slot selected. Please go back and select a slot.');
            return;
        }

        (async () => {
            try {
                const slot  = await bookingService.getTimeSlot(slotId);
                const start = new Date(slot.startTime);
                const end   = new Date(slot.endTime);
                setSlotDate(start);
                setSlotStartTime(start);
                setSlotEndTime(end);
            } catch (e: any) {
                setSlotError(e?.message ?? 'Failed to load slot details.');
            } finally {
                setSlotLoading(false);
            }
        })();
    }, [slotId]);

    // ── Validation ────────────────────────────────────────────────────────────
    const isFormValid =
        form.name.trim() !== '' &&
        form.caseType    !== '' &&
        form.mode        !== '' &&
        slotDate         !== null &&
        !slotLoading     &&
        !slotError;

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleContinue = async () => {
        if (!isFormValid || !slotId) return;
        setSubmitLoading(true);
        setSubmitError(null);

        try {
            const result = await bookingService.createBooking({
                lawyerId,
                timeSlotId:  slotId,
                name:        form.name.trim(),
                caseType:    CASE_TYPE_MAP[form.caseType] ?? 0, 
                description: form.description.trim() || undefined,
                mode:        form.mode as 'Physical' | 'Online',
                location:    form.mode === 'Physical' ? form.location.trim() || undefined : null,
                paymentMode: 0,
            });

            navigation?.navigate('AppointmentConfirm', {
                bookingId: result.bookingId,
                lawyerId,
            });
        } catch (e: any) {
            setSubmitError(e?.message ?? 'Failed to create booking. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ClientLayout
            title="Appointment Request"
            showBackButton
            onBackPress={() => navigation?.goBack()}
        >
            <View style={styles.container}>

                {/* Name */}
                <FieldWrapper label="Name">
                    <TextInput
                        style={styles.inputRow}
                        value={form.name}
                        onChangeText={(v) => set('name', v)}
                        placeholder="Your full name"
                        placeholderTextColor="#BDBDBD"
                    />
                </FieldWrapper>

                {/* Case type */}
                <Dropdown
                    label="Case type"
                    value={form.caseType}
                    placeholder="Select case type"
                    options={CASE_TYPES}
                    onSelect={(v) => set('caseType', v)}
                />

                {/* Slot fields — auto-filled */}
                {slotLoading ? (
                    <SlotFieldSkeleton />
                ) : slotError ? (
                    <View style={styles.slotErrorBox}>
                        <Text style={styles.slotErrorText}>{slotError}</Text>
                    </View>
                ) : (
                    <>
                        <ReadOnlyField
                            label="Date"
                            value={slotDate ? formatDate(slotDate) : '—'}
                            icon="📅"
                        />
                        <ReadOnlyField
                            label="Start time"
                            value={slotStartTime ? formatTime(slotStartTime) : '—'}
                            icon="🕐"
                        />
                        <ReadOnlyField
                            label="End time"
                            value={slotEndTime ? formatTime(slotEndTime) : '—'}
                            icon="🕐"
                        />
                    </>
                )}

                {/* Description */}
                <FieldWrapper label="Description">
                    <TextInput
                        style={[styles.inputRow, styles.textArea]}
                        value={form.description}
                        onChangeText={(v) => set('description', v)}
                        placeholder="Briefly describe your case…"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        placeholderTextColor="#BDBDBD"
                    />
                </FieldWrapper>

                {/* Mode */}
                <Dropdown
                    label="Mode"
                    value={form.mode}
                    placeholder="Options"
                    options={MODES}
                    onSelect={(v) => {
                        set('mode', v as 'Physical' | 'Online');
                        if (v === 'Online') set('location', '');
                    }}
                />

                {/* Location — Physical only */}
                {/*{form.mode === 'Physical' && (*/}
                {/*    <FieldWrapper label="Location">*/}
                {/*        <TextInput*/}
                {/*            style={styles.inputRow}*/}
                {/*            value={form.location}*/}
                {/*            onChangeText={(v) => set('location', v)}*/}
                {/*            placeholder="Meeting location"*/}
                {/*            placeholderTextColor="#BDBDBD"*/}
                {/*        />*/}
                {/*    </FieldWrapper>*/}
                {/*)}*/}

                {/* Submit error */}
                {submitError ? (
                    <View style={styles.submitErrorBox}>
                        <Text style={styles.submitErrorText}>{submitError}</Text>
                    </View>
                ) : null}

                {/* Button */}
                <View style={styles.buttonWrapper}>
                    <Button
                        title="CONTINUE"
                        variant="primary"
                        onPress={handleContinue}
                        loading={submitLoading}
                        disabled={!isFormValid || submitLoading}
                        style={styles.fullWidth}
                    />
                </View>

            </View>
        </ClientLayout>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop:        spacing.lg ?? 20,
        paddingBottom:     spacing.xl ?? 32,
    },

    // Fields
    fieldWrapper: { marginBottom: 16 },
    fieldLabel:   { fontSize: 12, color: '#9E9E9E', marginBottom: 5, fontWeight: '400' },

    inputRow: {
        flexDirection:     'row',
        alignItems:        'center',
        backgroundColor:   '#FFFFFF',
        borderRadius:      8,
        paddingHorizontal: 14,
        paddingVertical:   13,
        borderWidth:       1,
        borderColor:       '#E8E8E8',
        fontSize:          15,
        color:             '#212121',
    },
    inputText:       { flex: 1, fontSize: 15, color: '#212121' },
    placeholderText: { color: '#BDBDBD' },

    // Read-only
    readOnlyRow:  { backgroundColor: '#F5F5F5', borderColor: '#EBEBEB' },
    readOnlyText: { flex: 1, fontSize: 15, color: '#555555' },

    // TextArea
    textArea: { height: 90, paddingTop: 12, alignItems: 'flex-start' },

    // Icons
    iconText: { fontSize: 16 },
    chevron:  { fontSize: 16, color: '#9E9E9E', marginTop: -4 },

    // Skeleton
    skeletonWrapper: { marginBottom: 4 },
    skeletonLabel:   {
        width: 60, height: 10, borderRadius: 5,
        backgroundColor: '#E8E8E8', marginBottom: 8,
    },
    skeletonInput: { height: 46, borderRadius: 8, backgroundColor: '#EFEFEF' },

    // Slot error
    slotErrorBox: {
        backgroundColor: '#FFF3F3',
        borderRadius:    8,
        borderWidth:     1,
        borderColor:     '#FFCDD2',
        padding:         14,
        marginBottom:    16,
    },
    slotErrorText: { color: '#C62828', fontSize: 13, textAlign: 'center' },

    // Submit error
    submitErrorBox: {
        backgroundColor: '#FFF3F3',
        borderRadius:    8,
        borderWidth:     1,
        borderColor:     '#FFCDD2',
        padding:         12,
        marginBottom:    12,
    },
    submitErrorText: { color: '#C62828', fontSize: 13, textAlign: 'center' },

    // Dropdown modal
    modalOverlay: {
        flex:            1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent:  'flex-end',
    },
    modalSheet: {
        backgroundColor:      '#FFFFFF',
        borderTopLeftRadius:  20,
        borderTopRightRadius: 20,
        paddingHorizontal:    20,
        paddingTop:           20,
        paddingBottom:        36,
        maxHeight:            '55%',
    },
    modalTitle:          { fontSize: 16, fontWeight: '600', color: '#212121', marginBottom: 16 },
    modalOption:         {
        flexDirection:     'row',
        alignItems:        'center',
        justifyContent:    'space-between',
        paddingVertical:   14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    modalOptionText:     { fontSize: 15, color: '#424242' },
    modalOptionSelected: { color: '#5B4BDB', fontWeight: '600' },
    modalCheck:          { color: '#5B4BDB', fontSize: 16, fontWeight: '700' },

    // Button
    buttonWrapper: { marginTop: 8 },
    fullWidth:     { width: '100%' },
});

export default AppointmentFormScreen;