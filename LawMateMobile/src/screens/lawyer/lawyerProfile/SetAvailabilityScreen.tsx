import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Toast from '../../../components/Toast';

export interface AvailabilitySlot {
    id: string;
    date: Date;
    startTime: string;   // "HH:MM" 24h
    price: number;
    duration: number;    // minutes
    booked: boolean;
}

const DURATIONS = [15, 30, 45, 60];
const PRICES    = [3000, 5000, 7500, 10000];

/* ─────────────────────────── helpers ─────────────────────────────────── */
const fmtDate = (d: Date) =>
    d.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

const to12h = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'p.m.' : 'a.m.';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
};

/* ─────────────────────────── main screen ─────────────────────────────── */
const SetAvailabilityScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [slots, setSlots] = useState<AvailabilitySlot[]>([
        { id: '1', date: new Date(2025, 11, 4), startTime: '12:00', price: 5000, duration: 30, booked: false },
        { id: '2', date: new Date(2025, 11, 4), startTime: '12:30', price: 5000, duration: 30, booked: false },
        { id: '3', date: new Date(2025, 11, 4), startTime: '13:00', price: 5000, duration: 30, booked: false },
        { id: '4', date: new Date(2025, 11, 4), startTime: '13:30', price: 5000, duration: 30, booked: false },
    ]);

    // Which slot card is expanded (shows edit/delete)
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Add / edit modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId]       = useState<string | null>(null);
    const [slotDate, setSlotDate]         = useState<Date>(new Date());
    const [slotTime, setSlotTime]         = useState<Date>(new Date());
    const [slotDuration, setSlotDuration] = useState(30);
    const [slotPrice, setSlotPrice]       = useState(5000);

    // Date / time pickers (native)
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Toast
    const [toastVisible, setToastVisible] = useState(false);

    /* open add-new modal */
    const openAddModal = () => {
        setEditingId(null);
        setSlotDate(new Date());
        setSlotTime(new Date());
        setSlotDuration(30);
        setSlotPrice(5000);
        setModalVisible(true);
    };

    /* open edit modal */
    const openEditModal = (slot: AvailabilitySlot) => {
        setEditingId(slot.id);
        setSlotDate(slot.date);
        const [h, m] = slot.startTime.split(':').map(Number);
        const t = new Date(); t.setHours(h, m, 0, 0);
        setSlotTime(t);
        setSlotDuration(slot.duration);
        setSlotPrice(slot.price);
        setModalVisible(true);
    };

    /* confirm add/edit */
    const handleConfirm = () => {
        const timeStr = `${String(slotTime.getHours()).padStart(2,'0')}:${String(slotTime.getMinutes()).padStart(2,'0')}`;
        if (editingId) {
            setSlots(prev => prev.map(s => s.id === editingId
                ? { ...s, date: slotDate, startTime: timeStr, duration: slotDuration, price: slotPrice }
                : s
            ));
        } else {
            setSlots(prev => [...prev, {
                id: Date.now().toString(),
                date: slotDate, startTime: timeStr,
                duration: slotDuration, price: slotPrice, booked: false,
            }]);
        }
        setModalVisible(false);
        setToastVisible(true);
    };

    const handleDelete = (id: string) => {
        setSlots(prev => prev.filter(s => s.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['rgba(24,114,234,1)', 'rgba(54,87,208,1)', 'rgba(77,55,200,1)', 'rgba(99,71,253,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={colors.white} />
                    <Text style={styles.headerTitle}>Set Availability</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {slots.map(slot => {
                    const isSelected = selectedId === slot.id;
                    return (
                        <TouchableOpacity
                            key={slot.id}
                            activeOpacity={0.85}
                            onPress={() => setSelectedId(isSelected ? null : slot.id)}
                            style={styles.slotCard}
                        >
                            <View style={styles.slotRow}>
                                {/* icon */}
                                <View style={styles.slotIconWrap}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                </View>
                                {/* info */}
                                <View style={styles.slotInfo}>
                                    <Text style={styles.slotDateTxt}>
                                        Available on {fmtDate(slot.date)}
                                    </Text>
                                    <Text style={styles.slotTimeTxt}>{to12h(slot.startTime)}</Text>
                                </View>
                                {/* duration badge */}
                                <View style={styles.slotBadge}>
                                    <Text style={styles.badgeDur}>{slot.duration} M</Text>
                                    <Text style={styles.badgePer}>PER SLOT</Text>
                                </View>
                            </View>

                            {/* edit / delete — only when selected */}
                            {isSelected && (
                                <View style={styles.slotActions}>
                                    <TouchableOpacity
                                        style={styles.editBtn}
                                        onPress={() => { openEditModal(slot); setSelectedId(null); }}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="pencil" size={18} color={colors.white} />
                                        <Text style={styles.actionTxt}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.deleteBtn}
                                        onPress={() => handleDelete(slot.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="trash" size={18} color={colors.white} />
                                        <Text style={styles.actionTxt}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Bottom: BACK + ADD NEW */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.backBtnTxt}>BACK</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addNewBtn} onPress={openAddModal} activeOpacity={0.8}>
                    <LinearGradient
                        colors={['#1872EA', '#6347FD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addNewGrad}
                    >
                        <Text style={styles.addNewTxt}>ADD NEW</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Add / Edit bottom sheet */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheet}>
                        {/* handle */}
                        <View style={styles.sheetHandle} />
                        <View style={styles.sheetHeader}>
                            <Text style={styles.sheetTitle}>{editingId ? 'Edit Slot' : 'Add New Slot'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={22} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
                            {/* Date */}
                            <View style={styles.formRow}>
                                <Text style={styles.formLabel}>Date</Text>
                                <TouchableOpacity
                                    style={styles.pickBtn}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.pickTxt}>{fmtDate(slotDate)}</Text>
                                    <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Time */}
                            <View style={styles.formRow}>
                                <Text style={styles.formLabel}>Start Time</Text>
                                <TouchableOpacity
                                    style={styles.pickBtn}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <Text style={styles.pickTxt}>
                                        {`${String(slotTime.getHours()).padStart(2,'0')}:${String(slotTime.getMinutes()).padStart(2,'0')}`}
                                    </Text>
                                    <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Duration */}
                            <View style={styles.formRow}>
                                <Text style={styles.formLabel}>Duration</Text>
                                <View style={styles.chipRow}>
                                    {DURATIONS.map(d => (
                                        <TouchableOpacity
                                            key={d}
                                            style={[styles.chip, slotDuration === d && styles.chipSel]}
                                            onPress={() => setSlotDuration(d)}
                                        >
                                            <Text style={[styles.chipTxt, slotDuration === d && styles.chipTxtSel]}>
                                                {d} min
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price */}
                            <View style={styles.formRow}>
                                <Text style={styles.formLabel}>Price (LKR)</Text>
                                <View style={styles.chipRow}>
                                    {PRICES.map(p => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[styles.chip, slotPrice === p && styles.chipSel]}
                                            onPress={() => setSlotPrice(p)}
                                        >
                                            <Text style={[styles.chipTxt, slotPrice === p && styles.chipTxtSel]}>
                                                {p.toLocaleString()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Sheet actions */}
                        <View style={styles.sheetActions}>
                            <TouchableOpacity style={styles.sheetCancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                                <Text style={styles.sheetCancelTxt}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
                                <LinearGradient
                                    colors={['#1872EA', '#6347FD']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.sheetConfirmGrad}
                                >
                                    <Text style={styles.sheetConfirmTxt}>{editingId ? 'UPDATE' : 'CONFIRM'}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Native date/time pickers */}
            {showDatePicker && (
                <DateTimePicker
                    value={slotDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, d) => { setShowDatePicker(false); if (d) setSlotDate(d); }}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={slotTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(_, t) => { setShowTimePicker(false); if (t) setSlotTime(t); }}
                />
            )}

            {/* Toast */}
            <Toast
                visible={toastVisible}
                message="Availability Updated Successfully"
                type="success"
                onDismiss={() => setToastVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: {
        paddingTop: 48,
        paddingBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },

    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingBottom: 120 },

    /* slot card */
    slotCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    slotIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotInfo: { flex: 1 },
    slotDateTxt: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    slotTimeTxt: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    slotBadge: { alignItems: 'flex-end' },
    badgeDur: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    badgePer: {
        fontSize: 10,
        color: colors.textSecondary,
        marginTop: 2,
    },
    slotActions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    editBtn: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: colors.primary,
    },
    deleteBtn: {
        flex: 1,
        flexDirection: 'row',
        gap: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        backgroundColor: '#E53935',
    },
    actionTxt: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium },

    /* bottom bar */
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        flexDirection: 'row',
        gap: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    backBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    backBtnTxt: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    addNewBtn: { flex: 1, borderRadius: borderRadius.lg, overflow: 'hidden' },
    addNewGrad: { paddingVertical: spacing.md, alignItems: 'center' },
    addNewTxt: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },

    /* bottom sheet */
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl ?? 24,
        borderTopRightRadius: borderRadius.xl ?? 24,
        maxHeight: '80%',
        paddingBottom: spacing.xl,
    },
    sheetHandle: {
        width: 40, height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: spacing.sm,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    sheetTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    sheetBody: { paddingHorizontal: spacing.lg },

    /* form rows */
    formRow: { marginTop: spacing.lg },
    formLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    pickBtn: {
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
    pickTxt: { fontSize: fontSize.sm, color: colors.textPrimary },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
    },
    chipSel: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipTxt: { fontSize: fontSize.sm, color: colors.textPrimary },
    chipTxtSel: { color: colors.white, fontWeight: fontWeight.bold },

    sheetActions: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    sheetCancelBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    sheetCancelTxt: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold },
    sheetConfirmBtn: { flex: 1, borderRadius: borderRadius.lg, overflow: 'hidden' },
    sheetConfirmGrad: { paddingVertical: spacing.md, alignItems: 'center' },
    sheetConfirmTxt: { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});

export default SetAvailabilityScreen;
