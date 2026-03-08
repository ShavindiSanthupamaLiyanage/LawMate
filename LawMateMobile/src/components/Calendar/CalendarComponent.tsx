import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';
import Button from '../Button';

export interface Appointment {
    id: string;
    clientName: string;
    email: string;
    contactNumber?: string;
    caseType: string;
    dateTime: Date;
    duration: number;
    status: 'pending' | 'confirmed' | 'completed';
    mode: 'physical' | 'virtual';
    price: number;
    notes?: string;
    appointmentId?: string;
    paymentStatus?: string;
}

export interface AvailabilitySlot {
    id: string;
    date: Date;
    startTime: string;
    price: number;
    duration: number;
    booked: boolean;
}

interface CalendarComponentProps {
    onAddAppointment: () => void;
    onSetAvailability: () => void;
    onSelectDate?: (date: Date) => void;
    appointments?: Appointment[];
    availabilitySlots?: AvailabilitySlot[];
}

// Case type colour map
const CASE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    'Criminal Law':          { bg: '#E8F5E9', text: '#2E7D32' },
    'Family Law':            { bg: '#FFF3E0', text: '#E65100' },
    'Property Law':          { bg: '#E3F2FD', text: '#1565C0' },
    'Corporate Law':         { bg: '#F3E5F5', text: '#6A1B9A' },
    'Intellectual Property': { bg: '#FBE9E7', text: '#BF360C' },
    'Labor Law':             { bg: '#E0F7FA', text: '#00695C' },
    'Immigration Law':       { bg: '#F1F8E9', text: '#33691E' },
    'Contract Law':          { bg: '#FFF8E1', text: '#F57F17' },
    'Criminal':              { bg: '#E8F5E9', text: '#2E7D32' },
};
const getCaseTypeColors = (caseType: string) =>
    CASE_TYPE_COLORS[caseType] ?? { bg: '#E8EAF6', text: '#283593' };

const fmt12h = (d: Date) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fmtDateTimeRange = (d: Date, mins: number) => {
    const start = new Date(d);
    const end   = new Date(start.getTime() + mins * 60000);
    const dateStr = start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    const toAP = (x: Date) => {
        const h = x.getHours(), m = x.getMinutes();
        const ap = h >= 12 ? 'p.m.' : 'a.m.';
        return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
    };
    return `${dateStr}, ${toAP(start)} - ${toAP(end)}`;
};

const fmtSlotTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'p.m.' : 'a.m.';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ap}`;
};

const ordSuffix = (n: number) => {
    if (n >= 11 && n <= 13) return 'th';
    return (['th','st','nd','rd'] as const)[n % 10] ?? 'th';
};

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

const DetailRow: React.FC<{ label: string; value: string; isGreen?: boolean }> = ({ label, value, isGreen }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        {isGreen ? (
            <View style={styles.greenBadge}>
                <Text style={styles.greenBadgeText}>{value}</Text>
            </View>
        ) : (
            <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
        )}
    </View>
);

const CalendarComponent: React.FC<CalendarComponentProps> = ({
    onAddAppointment,
    onSetAvailability,
    onSelectDate,
    appointments = [],
    availabilitySlots = [],
}) => {
    const [currentDate, setCurrentDate]         = useState(new Date());
    const [selectedDate, setSelectedDate]         = useState<Date | null>(null);
    const [viewMode, setViewMode]                 = useState<'monthly' | 'weekly'>('monthly');
    const [selectedAppointment, setSelectedApt]   = useState<Appointment | null>(null);
    const [modalVisible, setModalVisible]         = useState(false);

    // helpers
    const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (d: Date) => {
        const dow = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
        return dow === 0 ? 6 : dow - 1; // Monday first
    };

    const matchDate = (ref: Date, y: number, mo: number, dy: number) => {
        const r = new Date(ref);
        return r.getFullYear() === y && r.getMonth() === mo && r.getDate() === dy;
    };

    const getApptsForDay = (day: number) =>
        appointments.filter(a => matchDate(a.dateTime, currentDate.getFullYear(), currentDate.getMonth(), day));

    const getSlotsForDay = (day: number) =>
        availabilitySlots.filter(s => matchDate(s.date, currentDate.getFullYear(), currentDate.getMonth(), day));

    const getApptsForDate = (date: Date) =>
        appointments.filter(a => {
            const d = new Date(a.dateTime);
            return d.getFullYear() === date.getFullYear() &&
                   d.getMonth()    === date.getMonth()    &&
                   d.getDate()     === date.getDate();
        });

    const getSlotsForDate = (date: Date) =>
        availabilitySlots.filter(s => {
            const d = new Date(s.date);
            return d.getFullYear() === date.getFullYear() &&
                   d.getMonth()    === date.getMonth()    &&
                   d.getDate()     === date.getDate();
        });

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateSelect = (day: number) => {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(d);
        if (onSelectDate) onSelectDate(d);
    };

    const handleAptPress = (apt: Appointment) => {
        setSelectedApt(apt);
        setModalVisible(true);
    };

    // Weekly view
    const getWeekDays = (): Date[] => {
        const base = selectedDate ?? new Date();
        const dow = base.getDay();
        const diff = dow === 0 ? -6 : 1 - dow;
        const mon = new Date(base);
        mon.setDate(base.getDate() + diff);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(mon);
            d.setDate(mon.getDate() + i);
            return d;
        });
    };

    // Calendar grid
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay    = getFirstDayOfMonth(currentDate);
    const gridDays    = Array.from({ length: 42 }, (_, i) => {
        const n = i - firstDay + 1;
        return n > 0 && n <= daysInMonth ? n : null;
    });

    const today           = new Date();
    const selApts         = selectedDate ? getApptsForDate(selectedDate) : [];
    const selSlots        = selectedDate ? getSlotsForDate(selectedDate) : [];
    const secTitle = (date: Date) => {
        const d = date.getDate();
        return `${MONTHS[date.getMonth()].slice(0, 3)} ${d}${ordSuffix(d)}`;
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
        >
            {/* toggle */}
            <View style={styles.viewToggle}>
                {(['monthly', 'weekly'] as const).map(mode => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.toggleTab, viewMode === mode && styles.activeToggleTab]}
                        onPress={() => setViewMode(mode)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.toggleTabText, viewMode === mode && styles.activeToggleTabText]}>
                            {mode === 'monthly' ? 'Monthly View' : 'Weekly View'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* month header */}
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.monthYear}>
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Text>
                <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {viewMode === 'monthly' ? (
                <>
                    {/* Weekday labels */}
                    <View style={styles.weekdayRow}>
                        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                            <Text key={d} style={styles.weekdayLabel}>{d}</Text>
                        ))}
                    </View>
                    {/* Calendar grid */}
                    <View style={styles.calendarGrid}>
                        {gridDays.map((day, idx) => {
                            if (!day) return <View key={idx} style={[styles.dayCell, styles.emptyCell]} />;
                            const hasEvent =
                                getApptsForDay(day).length > 0 || getSlotsForDay(day).length > 0;
                            const isSelected =
                                selectedDate !== null &&
                                selectedDate.getDate()        === day &&
                                selectedDate.getMonth()       === currentDate.getMonth() &&
                                selectedDate.getFullYear()    === currentDate.getFullYear();
                            const isToday =
                                today.getDate()     === day &&
                                today.getMonth()    === currentDate.getMonth() &&
                                today.getFullYear() === currentDate.getFullYear();
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.dayCell,
                                        isSelected && styles.selectedCell,
                                        isToday && !isSelected && styles.todayCell,
                                    ]}
                                    onPress={() => handleDateSelect(day)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.dayText,
                                        isSelected && styles.selectedDayText,
                                        isToday && !isSelected && styles.todayDayText,
                                    ]}>
                                        {day}
                                    </Text>
                                    {hasEvent && (
                                        <View style={[styles.eventDot, isSelected && styles.eventDotSel]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </>
            ) : (
                /* Weekly view */
                <View style={styles.weekRow}>
                    {getWeekDays().map((day, idx) => {
                        const hasEvent = getApptsForDate(day).length > 0 || getSlotsForDate(day).length > 0;
                        const isSelected = selectedDate?.toDateString() === day.toDateString();
                        const isToday   = today.toDateString() === day.toDateString();
                        const WL = ['Mo','Tu','We','Th','Fr','Sa','Su'];
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[styles.weekDayCell, isSelected && styles.selectedCell]}
                                onPress={() => { setSelectedDate(day); if (onSelectDate) onSelectDate(day); }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.wdLabel, isSelected && { color: colors.white }]}>
                                    {WL[idx]}
                                </Text>
                                <Text style={[
                                    styles.wdNumber,
                                    isSelected && styles.selectedDayText,
                                    isToday && !isSelected && styles.todayDayText,
                                ]}>
                                    {day.getDate()}
                                </Text>
                                {hasEvent && <View style={[styles.eventDot, isSelected && styles.eventDotSel]} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* appointments for selected day */}
            {selectedDate && selApts.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Appointments for {secTitle(selectedDate)}
                    </Text>
                    {selApts.map(apt => {
                        const cc    = getCaseTypeColors(apt.caseType);
                        const aptId = apt.appointmentId ?? `APT-${String(apt.id).padStart(4, '0')}`;
                        return (
                            <TouchableOpacity
                                key={apt.id}
                                style={styles.aptCard}
                                onPress={() => handleAptPress(apt)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.aptTopRow}>
                                    <Text style={styles.aptClientId} numberOfLines={1}>
                                        {apt.clientName} | {aptId}
                                    </Text>
                                    <Text style={styles.aptTime}>{fmt12h(apt.dateTime)}</Text>
                                </View>
                                <View style={[styles.caseTypeBadge, { backgroundColor: cc.bg }]}>
                                    <Text style={[styles.caseTypeBadgeText, { color: cc.text }]}>
                                        {apt.caseType}
                                    </Text>
                                </View>
                                <Text style={styles.aptPrice}>
                                    LKR {apt.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* availability for selected day */}
            {selectedDate && selSlots.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Availability for {secTitle(selectedDate)}
                    </Text>
                    {selSlots.map(slot => (
                        <View key={slot.id} style={styles.slotCard}>
                            <View style={styles.slotLeft}>
                                <View style={styles.slotIconBox}>
                                    <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                                </View>
                                <View>
                                    <Text style={styles.slotDate}>
                                        Available on {new Date(slot.date).toLocaleDateString('en-CA')}
                                    </Text>
                                    <Text style={styles.slotTime}>
                                        {fmtSlotTime(slot.startTime)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.slotRight}>
                                <Text style={styles.slotDuration}>{slot.duration} M</Text>
                                <Text style={styles.slotPerSlot}>PER SLOT</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* action buttons */}
            <View style={styles.btnRow}>
                <Button
                    title="SET AVAILABILITY"
                    variant="primary"
                    onPress={onSetAvailability}
                    style={styles.btnStyle}
                />
                <Button
                    title="ADD APPOINTMENT"
                    variant="transparent"
                    onPress={onAddAppointment}
                    style={styles.btnStyle}
                />
            </View>

            {/* appointment detail sheet */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Appointment Information</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={22} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {selectedAppointment && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <DetailRow label="Client"     value={selectedAppointment.clientName} />
                                <DetailRow label="Email"      value={selectedAppointment.email} />
                                {selectedAppointment.contactNumber ? (
                                    <DetailRow label="Contact"   value={selectedAppointment.contactNumber} />
                                ) : null}
                                <DetailRow label="Case Type"  value={selectedAppointment.caseType} />
                                <DetailRow
                                    label="Appointment"
                                    value={fmtDateTimeRange(selectedAppointment.dateTime, selectedAppointment.duration)}
                                />
                                <DetailRow
                                    label="Amount"
                                    value={`LKR ${selectedAppointment.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                                />
                                <DetailRow
                                    label="Payment Status"
                                    value={selectedAppointment.paymentStatus ?? 'Verified Payment'}
                                    isGreen
                                />
                                <DetailRow
                                    label="Mode"
                                    value={selectedAppointment.mode === 'physical' ? 'Physical Appointment' : 'Virtual Appointment'}
                                />
                                <DetailRow
                                    label="Status"
                                    value={selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                                />
                                {selectedAppointment.notes ? (
                                    <DetailRow label="Notes" value={selectedAppointment.notes} />
                                ) : null}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: 80,
    },

    // Toggle
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: 3,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    toggleTab: {
        flex: 1,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    activeToggleTab: {
        backgroundColor: colors.primary,
    },
    toggleTabText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    activeToggleTabText: {
        color: colors.white,
        fontWeight: fontWeight.bold,
    },

    // Month header
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    navButton: { padding: spacing.sm },
    monthYear: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },

    // Weekday row
    weekdayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    weekdayLabel: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
    },

    // Calendar grid
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.md,
    },
    dayCell: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        marginBottom: 1,
        position: 'relative',
    },
    emptyCell: { backgroundColor: 'transparent' },
    selectedCell: { backgroundColor: colors.primary },
    todayCell: { borderWidth: 1.5, borderColor: colors.primary },
    dayText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    selectedDayText: { color: colors.white, fontWeight: fontWeight.bold },
    todayDayText:    { color: colors.primary, fontWeight: fontWeight.bold },
    eventDot: {
        position: 'absolute',
        bottom: 3,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.primary,
    },
    eventDotSel: { backgroundColor: colors.white },

    // Weekly view
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    weekDayCell: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        marginHorizontal: 1,
        position: 'relative',
    },
    wdLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    wdNumber: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginTop: 2,
    },

    // Sections
    section: { marginBottom: spacing.md },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },

    // Appointment card (Figma style)
    aptCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        elevation: 1,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    aptTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    aptClientId: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        flex: 1,
        marginRight: spacing.sm,
    },
    aptTime: { fontSize: fontSize.xs, color: colors.textSecondary },
    caseTypeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginBottom: spacing.xs,
    },
    caseTypeBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
    aptPrice: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },

    // Availability slot card
    slotCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        elevation: 1,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    slotLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    slotIconBox: {
        width: 34,
        height: 34,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slotDate: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    slotTime: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
    slotRight: { alignItems: 'flex-end' },
    slotDuration: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    slotPerSlot: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },

    // Action buttons
    btnRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    btnStyle: {
        flex: 1,
    },

    // Appointment info bottom sheet
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        paddingBottom: 32,
        maxHeight: '75%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
        alignSelf: 'center',
        marginVertical: spacing.sm,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    modalTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    detailLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
        flex: 1,
    },
    detailValue: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
        maxWidth: '58%',
        textAlign: 'right',
    },
    greenBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    greenBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
        color: '#2E7D32',
    },
});

export default CalendarComponent;


