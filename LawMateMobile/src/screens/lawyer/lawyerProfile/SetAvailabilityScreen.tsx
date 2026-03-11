import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Toast from '../../../components/Toast';
import Button from '../../../components/Button';
import { CalendarService } from '../../../services/calendarService';

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

    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    /**
     * Fetch availability slots from API
     */
    const fetchSlots = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('Loading availability slots...');

            const slotsData = await CalendarService.getAvailabilitySlots();
            setSlots(slotsData);

            console.log('Slots loaded:', slotsData.length);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Failed to load slots';
            console.error('Error fetching slots:', errorMsg);
            Alert.alert(
                'Failed to Load Slots',
                errorMsg,
                [{ text: 'Retry', onPress: fetchSlots }, { text: 'Dismiss' }]
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Load slots when screen mounts
     */
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    /**
     * Refresh slots when screen comes into focus
     */
    useFocusEffect(
        useCallback(() => {
            fetchSlots();
        }, [fetchSlots])
    );

    const openAddModal = () => {
        setEditingId(null);
        setSlotDate(new Date());
        setSlotTime(new Date());
        setSlotDuration(30);
        setSlotPrice(5000);
        setModalVisible(true);
    };

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

    // confirm add / edit
    const handleConfirm = async () => {
        if (slotPrice < 1) {
            Alert.alert('Validation Error', 'Please enter a valid price');
            return;
        }

        try {
            setIsSaving(true);
            const timeStr = `${String(slotTime.getHours()).padStart(2,'0')}:${String(slotTime.getMinutes()).padStart(2,'0')}`;

            const slotData = {
                date: slotDate,
                startTime: timeStr,
                duration: slotDuration,
                price: slotPrice,
                booked: false,
            };

            if (editingId) {
                console.log('Updating slot:', editingId);
                await CalendarService.updateAvailabilitySlot(editingId, slotData);
                setToastMessage('Slot updated successfully!');
            } else {
                console.log('Creating new slot...');
                await CalendarService.createAvailabilitySlot(slotData);
                setToastMessage('Slot created successfully!');
            }

            setToastType('success');
            setToastVisible(true);
            setModalVisible(false);

            // Refresh slots
            await fetchSlots();
        } catch (error: any) {
            console.error('Error saving slot:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to save slot';
            setToastMessage(errorMsg);
            setToastType('error');
            setToastVisible(true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Delete Slot',
            'Are you sure you want to delete this availability slot?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsSaving(true);
                            console.log('Deleting slot:', id);
                            await CalendarService.deleteAvailabilitySlot(id);
                            setToastMessage('Slot deleted successfully!');
                            setToastType('success');
                            setToastVisible(true);
                            if (selectedId === id) setSelectedId(null);
                            await fetchSlots();
                        } catch (error: any) {
                            console.error('Error deleting slot:', error);
                            const errorMsg = error.response?.data?.message || error.message || 'Failed to delete slot';
                            setToastMessage(errorMsg);
                            setToastType('error');
                            setToastVisible(true);
                        } finally {
                            setIsSaving(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backRow} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color={colors.white} />
                    <Text style={styles.headerTitle}>Set Availability</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading slots...</Text>
                    </View>
                ) : slots.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No availability slots yet</Text>
                        <Text style={styles.emptySubtext}>Tap "Add New" to create your first slot</Text>
                    </View>
                ) : (
                    slots.map(slot => {
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
                                        <Button
                                            title="Edit"
                                            variant="accept"
                                            onPress={() => { openEditModal(slot); setSelectedId(null); }}
                                            style={styles.actionBtnStyle}
                                            disabled={isSaving}
                                        />
                                        <Button
                                            title="Delete"
                                            variant="reject"
                                            onPress={() => handleDelete(slot.id)}
                                            style={styles.actionBtnStyle}
                                            disabled={isSaving}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Bottom: BACK + ADD NEW */}
            <View style={styles.bottomBar}>
                <Button
                    title="BACK"
                    variant="transparent"
                    onPress={() => navigation.goBack()}
                    style={styles.btnStyle}
                    disabled={isSaving}
                />
                <Button
                    title="ADD NEW"
                    variant="primary"
                    onPress={openAddModal}
                    style={styles.btnStyle}
                    disabled={isSaving}
                />
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
                            <Button
                                title="CANCEL"
                                variant="transparent"
                                onPress={() => setModalVisible(false)}
                                style={styles.sheetBtnStyle}
                                disabled={isSaving}
                            />
                            <Button
                                title={isSaving ? 'SAVING...' : 'CONFIRM'}
                                variant="primary"
                                onPress={handleConfirm}
                                style={styles.sheetBtnStyle}
                                disabled={isSaving}
                            />
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
                message={toastMessage}
                type={toastType}
                onDismiss={() => setToastVisible(false)}
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
    backRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },

    scroll: { flex: 1 },
    scrollContent: { padding: spacing.lg, paddingBottom: 120 },

    /* loading / empty state */
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },
    emptySubtext: {
        marginTop: spacing.sm,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: 'center',
    },

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
    actionBtnStyle: {
        flex: 1,
        height: 36,
    },

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
    btnStyle: { flex: 1 },

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
    sheetBtnStyle: { flex: 1 },
});

export default SetAvailabilityScreen;
