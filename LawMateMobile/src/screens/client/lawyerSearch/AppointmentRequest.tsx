import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../config/theme';
import {
    AppointmentRequestService,
    TimeSlotDto,
    LawyerProfileDto,
} from '../../../services/appointmentRequestService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatSlotDate = (iso: string): string => {
    const d = new Date(iso);
    const day   = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year  = d.getFullYear();
    const suffix =
        day === 1 || day === 21 || day === 31 ? 'st'
        : day === 2 || day === 22 ? 'nd'
        : day === 3 || day === 23 ? 'rd'
        : 'th';
    return `${day}${suffix} ${month} ${year}`;
};

const formatSlotTime = (startIso: string, endIso: string): string => {
    const fmt = (iso: string) =>
        new Date(iso).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    return `${fmt(startIso)} – ${fmt(endIso)}`;
};

// ─── Lawyer Summary Card ──────────────────────────────────────────────────────

const LawyerSummaryCard: React.FC<{ lawyer: LawyerProfileDto }> = ({ lawyer }) => {
    const imageUri = lawyer.profileImageBase64
        ? `data:image/jpeg;base64,${lawyer.profileImageBase64}`
        : null;

    const initials = lawyer.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <View style={styles.lawyerCard}>
            <View style={styles.lawyerAvatar}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                )}
            </View>
            <View style={styles.lawyerInfo}>
                <Text style={styles.lawyerName}>{lawyer.fullName}</Text>
                <Text style={styles.lawyerSubText}>{lawyer.areaOfPractice}</Text>
                {lawyer.professionalDesignation ? (
                    <Text style={styles.lawyerDesignation}>{lawyer.professionalDesignation}</Text>
                ) : null}
            </View>
            <View style={styles.lawyerMeta}>
                <Text style={styles.lawyerExp}>{lawyer.yearOfExperience} yrs exp</Text>
                <Text style={styles.lawyerRating}>⭐ {lawyer.averageRating.toFixed(1)}</Text>
                <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                </View>
            </View>
        </View>
    );
};

// ─── Lawyer Card Skeleton ─────────────────────────────────────────────────────

const LawyerCardSkeleton: React.FC = () => (
    <View style={[styles.lawyerCard, styles.skeletonCard]}>
        <View style={[styles.avatarPlaceholder, styles.skeleton]} />
        <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.skeletonLine, { width: '60%' }]} />
            <View style={[styles.skeletonLine, { width: '40%' }]} />
        </View>
    </View>
);

// ─── Time Slot Row ────────────────────────────────────────────────────────────

interface TimeSlotRowProps {
    slot: TimeSlotDto;
    selected: boolean;
    hasSelection: boolean;
    onPress: () => void;
}

const TimeSlotRow: React.FC<TimeSlotRowProps> = ({ slot, selected, hasSelection, onPress }) => {
    const dimmed = hasSelection && !selected;

    return (
        <TouchableOpacity
            style={[
                styles.slotRow,
                selected && styles.slotRowSelected,
                dimmed && styles.slotRowDimmed,
            ]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.slotDate, dimmed && styles.slotTextDimmed]}>
                {formatSlotDate(slot.startTime)}
            </Text>
            <Text style={[styles.slotTime, dimmed && styles.slotTextDimmed]}>
                {formatSlotTime(slot.startTime, slot.endTime)}
            </Text>
        </TouchableOpacity>
    );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface AppointmentRequestScreenProps {
    navigation?: any;
    route?: {
        params?: {
            lawyerId?: string;
        };
    };
}

const AppointmentRequest: React.FC<AppointmentRequestScreenProps> = ({
    navigation,
    route,
}) => {
    const lawyerId = route?.params?.lawyerId ?? '';

    // ── State ─────────────────────────────────────────────────────────────────
    const [lawyer, setLawyer]             = useState<LawyerProfileDto | null>(null);
    const [slots, setSlots]               = useState<TimeSlotDto[]>([]);
    const [lawyerLoading, setLawyerLoading] = useState(true);
    const [slotsLoading, setSlotsLoading]   = useState(true);
    const [lawyerError, setLawyerError]   = useState<string | null>(null);
    const [slotsError, setSlotsError]     = useState<string | null>(null);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
    const [continueLoading, setContinueLoading] = useState(false);

    // ── Load lawyer profile ───────────────────────────────────────────────────
    const loadLawyer = useCallback(async () => {
        if (!lawyerId) return;
        setLawyerLoading(true);
        setLawyerError(null);
        try {
            const data = await AppointmentRequestService.getLawyerProfile(lawyerId);
            setLawyer(data);
        } catch (e: any) {
            console.error('loadLawyer error:', e?.message);
            setLawyerError('Failed to load lawyer details.');
        } finally {
            setLawyerLoading(false);
        }
    }, [lawyerId]);

    // ── Load available slots ──────────────────────────────────────────────────
    const loadSlots = useCallback(async () => {
        if (!lawyerId) return;
        setSlotsLoading(true);
        setSlotsError(null);
        try {
            // Load slots from today onwards
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const data = await AppointmentRequestService.getAvailableSlots(lawyerId, today);
            setSlots(data);
        } catch (e: any) {
            console.error('loadSlots error:', e?.message);
            setSlotsError('Failed to load available slots.');
        } finally {
            setSlotsLoading(false);
        }
    }, [lawyerId]);

    useEffect(() => {
        loadLawyer();
        loadSlots();
    }, [loadLawyer, loadSlots]);

    // ── Continue ──────────────────────────────────────────────────────────────
    const handleContinue = async () => {
        if (!selectedSlotId) return;
        setContinueLoading(true);
        navigation?.navigate('AppointmentForm', {
            lawyerId,
            slotId: selectedSlotId,
        });
        setContinueLoading(false);
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <ClientLayout
            title="Appointment Request"
            showBackButton
            onBackPress={() => navigation?.goBack()}
            disableScroll
        >
            <View style={styles.screen}>

                {/* ── Lawyer summary ── */}
                <View style={styles.lawyerSection}>
                    {lawyerLoading ? (
                        <LawyerCardSkeleton />
                    ) : lawyerError ? (
                        <View style={styles.inlineError}>
                            <Text style={styles.inlineErrorText}>{lawyerError}</Text>
                            <TouchableOpacity onPress={loadLawyer}>
                                <Text style={styles.inlineRetry}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : lawyer ? (
                        <LawyerSummaryCard lawyer={lawyer} />
                    ) : null}
                </View>

                {/* ── Time slots ── */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionTitle}>Available Time Slots</Text>

                    {slotsLoading ? (
                        <View style={styles.centeredState}>
                            <ActivityIndicator size="large" color="#4F3CC9" />
                        </View>
                    ) : slotsError ? (
                        <View style={styles.centeredState}>
                            <Text style={styles.errorStateText}>{slotsError}</Text>
                            <TouchableOpacity onPress={loadSlots} style={styles.retryButton}>
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    ) : slots.length === 0 ? (
                        <View style={styles.centeredState}>
                            <Text style={styles.emptyStateText}>No available slots</Text>
                            <Text style={styles.emptyStateSubText}>
                                This lawyer has no upcoming availability
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={slots}
                            keyExtractor={(item) => String(item.timeSlotId)}
                            renderItem={({ item }) => (
                                <TimeSlotRow
                                    slot={item}
                                    selected={selectedSlotId === item.timeSlotId}
                                    hasSelection={selectedSlotId !== null}
                                    onPress={() =>
                                        setSelectedSlotId(
                                            selectedSlotId === item.timeSlotId
                                                ? null
                                                : item.timeSlotId
                                        )
                                    }
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.slotsList}
                        />
                    )}
                </View>

                {/* ── Footer ── */}
                <View style={styles.footer}>
                    <Button
                        title="CONTINUE"
                        variant="primary"
                        onPress={handleContinue}
                        loading={continueLoading}
                        disabled={selectedSlotId === null || slotsLoading}
                        style={styles.continueButton}
                    />
                </View>
            </View>
        </ClientLayout>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background ?? '#F2F2F7',
    },

    // ── Lawyer card ───────────────────────────────────────────────────────────
    lawyerSection: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop: spacing.lg ?? 20,
        paddingBottom: 4,
    },
    lawyerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    lawyerAvatar: {
        marginRight: 12,
    },
    avatarImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#D0CCF5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarInitials: {
        color: '#5B4BDB',
        fontSize: 16,
        fontWeight: '700',
    },
    lawyerInfo: {
        flex: 1,
    },
    lawyerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 3,
    },
    lawyerSubText: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    lawyerDesignation: {
        fontSize: 11,
        color: '#BDBDBD',
        marginTop: 2,
    },
    lawyerMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    lawyerExp: {
        fontSize: 11,
        color: '#9E9E9E',
        marginBottom: 2,
    },
    lawyerRating: {
        fontSize: 12,
        color: '#F9A825',
        fontWeight: '600',
        marginBottom: 4,
    },
    verifiedBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    verifiedText: {
        color: '#43A047',
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Skeleton ──────────────────────────────────────────────────────────────
    skeletonCard: {
        gap: 12,
    },
    skeleton: {
        backgroundColor: '#E8E8E8',
    },
    skeletonLine: {
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E8E8E8',
    },

    // ── Slots ─────────────────────────────────────────────────────────────────
    slotsSection: {
        flex: 1,
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop: spacing.lg ?? 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#432cdd',
        marginBottom: 14,
    },
    slotsList: {
        gap: 10,
        paddingBottom: 10,
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
        marginBottom: 2,
    },
    slotRowSelected: {
        borderColor: '#4F3CC9',
        backgroundColor: '#FFFFFF',
    },
    slotRowDimmed: {
        backgroundColor: '#F7F7FA',
        borderColor: '#EBEBEB',
        opacity: 0.55,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#C8C8D8',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    checkboxSelected: {
        backgroundColor: '#4F3CC9',
        borderColor: '#4F3CC9',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 16,
    },
    slotDate: {
        flex: 1,
        fontSize: 14,
        color: '#333333',
        fontWeight: '500',
    },
    slotTime: {
        fontSize: 14,
        color: '#555555',
        fontWeight: '400',
    },
    slotTextDimmed: {
        color: '#AAAAAA',
    },

    // ── Inline error (lawyer card area) ───────────────────────────────────────
    inlineError: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#FFEBEE',
        borderRadius: 10,
        padding: 14,
    },
    inlineErrorText: {
        color: '#C62828',
        fontSize: 13,
    },
    inlineRetry: {
        color: '#5B4BDB',
        fontSize: 13,
        fontWeight: '600',
    },

    // ── Centered states (slots area) ──────────────────────────────────────────
    centeredState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },
    errorStateText: {
        color: '#C62828',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 14,
    },
    retryButton: {
        backgroundColor: '#5B4BDB',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 6,
    },
    emptyStateSubText: {
        fontSize: 13,
        color: '#9E9E9E',
        textAlign: 'center',
    },

    // ── Footer ────────────────────────────────────────────────────────────────
    footer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingBottom: spacing.lg ?? 20,
        paddingTop: 10,
    },
    continueButton: {
        width: '100%',
    },
});

export default AppointmentRequest;