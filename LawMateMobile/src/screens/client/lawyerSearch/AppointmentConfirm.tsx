import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import { colors, spacing } from '../../../config/theme';
import { bookingService, BookingDetailDto } from '../../../services/bookingService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDisplayDate = (isoString?: string): string => {
    if (!isoString) return '—';
    const d     = new Date(isoString);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year  = d.getFullYear();
    return `${day} ${month} ${year}`;
};

const formatDisplayTime = (isoString?: string): string => {
    if (!isoString) return '—';
    const d      = new Date(isoString);
    let h        = d.getHours();
    const m      = String(d.getMinutes()).padStart(2, '0');
    const suffix = h >= 12 ? 'P.M.' : 'A.M.';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}.${m} ${suffix}`;
};

const formatMode = (mode?: string | number): string => {
    if (mode === undefined || mode === null) return '—';
    const s = String(mode).toLowerCase().trim();
    if (s === '1' || s === 'physical') return 'Physical';
    if (s === '0' || s === 'online')   return 'Online';
    return String(mode);
};

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{
    label: string;
    value: React.ReactNode;
    isBadge?: boolean;
}> = ({ label, value, isBadge }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isBadge ? (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{value}</Text>
            </View>
        ) : (
            <Text style={styles.infoValue}>{value}</Text>
        )}
    </View>
);

const Divider: React.FC = () => <View style={styles.rowDivider} />;

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
    <View style={styles.infoRow}>
        <View style={styles.skeletonLabel} />
        <View style={styles.skeletonValue} />
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
    navigation?: any;
    route?: {
        params?: {
            bookingId?: number;
            lawyerId?:  string;
        };
    };
}

const AppointmentConfirmScreen: React.FC<Props> = ({ navigation, route }) => {
    const bookingId = route?.params?.bookingId;

    const [booking,      setBooking]      = useState<BookingDetailDto | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError,   setFetchError]   = useState<string | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    // ── Fetch booking on mount ────────────────────────────────────────────────
    useEffect(() => {
        if (!bookingId) {
            setFetchError('Booking ID missing. Please go back and try again.');
            setFetchLoading(false);
            return;
        }

        (async () => {
            try {
                const data = await bookingService.getBookingById(bookingId);
                // Debug — remove after confirming data is correct
                console.log('Booking data:', JSON.stringify(data, null, 2));
                setBooking(data);
            } catch (e: any) {
                setFetchError(e?.message ?? 'Failed to load booking details.');
            } finally {
                setFetchLoading(false);
            }
        })();
    }, [bookingId]);

    // ── Derived display values ────────────────────────────────────────────────

    // Appointment ID → "APT-0001" from backend
    const appointmentId = booking?.bookingId ?? '—';

    // Date → from BOOKING.ScheduledDateTime (DTO field: dateTime)
    const dateStr = formatDisplayDate(
        (booking as any)?.dateTime         // GetAppointmentDto uses "dateTime"
        ?? booking?.scheduledDateTime       // BookingDetailDto fallback
    );

    // Start time → from TIMESLOT.StartTime (DTO field: startTime)
    const startStr = formatDisplayTime(booking?.startTime);

    // End time → from TIMESLOT.EndTime (DTO field: endTime)
    const endStr = formatDisplayTime(booking?.endTime);

    const timeStr = booking ? `${startStr} - ${endStr}` : '—';

    // Mode → "Physical" | "Online" string from backend
    // Accept both string and number safely
    const modeStr    = formatMode((booking as any)?.mode);
    const isPhysical = modeStr === 'Physical';

    // Case type
    const caseType = (booking as any)?.caseType ?? '—';

    // Duration
    const duration = (booking as any)?.duration ?? booking?.duration ?? 0;

    // Status → DTO field is "status" in GetAppointmentDto, "bookingStatus" in BookingDetailDto
    const status = (booking as any)?.status
        ?? (booking as any)?.bookingStatus
        ?? 'Pending';

    // Payment fee — always Rs.2,000
    const paymentFee = 'Rs.2,000';

    // ── Toast → navigate ──────────────────────────────────────────────────────
    const handleToastDismiss = () => {
        setToastVisible(false);
        navigation?.navigate('AppointmentRequestReceived');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <ClientLayout
                title="Appointment Request"
                showBackButton
                onBackPress={() => navigation?.goBack()}
                disableScroll
            >
                <View style={styles.screen}>

                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Appointment Info</Text>
                        <View style={styles.divider} />

                        {fetchLoading ? (
                            <>
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <React.Fragment key={i}>
                                        <SkeletonRow />
                                        {i < 6 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </>
                        ) : fetchError ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{fetchError}</Text>
                                <TouchableOpacity onPress={() => navigation?.goBack()}>
                                    <Text style={styles.errorRetry}>← Go back</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* APT-0001 from BOOKING.BookingId */}
                                <InfoRow
                                    label="Appointment ID"
                                    value={appointmentId}
                                />
                                <Divider />

                                {/* Date from BOOKING.ScheduledDateTime */}
                                <InfoRow
                                    label="Date"
                                    value={dateStr}
                                />
                                <Divider />

                                {/* Start & End from TIMESLOT */}
                                <InfoRow
                                    label="Time"
                                    value={timeStr}
                                />
                                <Divider />

                                {/* Duration calculated from slot */}
                                <InfoRow
                                    label="Duration"
                                    value={`${duration} mins`}
                                />
                                <Divider />

                                {/* Mode from BOOKING.Mode */}
                                <InfoRow
                                    label="Mode"
                                    value={modeStr}
                                />
                                <Divider />

                                {/* Location — only for Physical */}
                                {isPhysical && (booking as any)?.location ? (
                                    <>
                                        <InfoRow
                                            label="Location"
                                            value={(booking as any).location}
                                        />
                                        <Divider />
                                    </>
                                ) : null}

                                {/* Payment fee — always Rs.2,000 */}
                                <InfoRow
                                    label="Payment fee"
                                    value={paymentFee}
                                />
                                <Divider />

                                {/* Status from BOOKING.BookingStatus */}
                                <InfoRow
                                    label="Status"
                                    value={status}
                                    isBadge
                                />
                            </>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <Button
                            title="DONE"
                            variant="primary"
                            disabled={fetchLoading || !!fetchError}
                            onPress={() => setToastVisible(true)}
                            style={styles.fullWidth}
                        />
                    </View>

                </View>
            </ClientLayout>

            <Toast
                visible={toastVisible}
                message="Appointment request submitted successfully."
                type="success"
                duration={2500}
                onDismiss={handleToastDismiss}
            />
        </>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex:            1,
        backgroundColor: colors.background ?? '#F2F2F7',
    },
    card: {
        margin:          spacing.lg ?? 20,
        backgroundColor: '#FFFFFF',
        borderRadius:    14,
        padding:         20,
        shadowColor:     '#000',
        shadowOffset:    { width: 0, height: 1 },
        shadowOpacity:   0.06,
        shadowRadius:    6,
        elevation:       2,
    },
    cardTitle: {
        fontSize:     15,
        fontWeight:   '700',
        color:        '#212121',
        marginBottom: 14,
    },
    divider: {
        height:          1,
        backgroundColor: '#F0F0F0',
        marginBottom:    6,
    },
    rowDivider: {
        height:          1,
        backgroundColor: '#F5F5F5',
        marginVertical:  4,
    },
    infoRow: {
        flexDirection:   'row',
        alignItems:      'center',
        justifyContent:  'space-between',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize:   13,
        color:      '#9E9E9E',
        fontWeight: '400',
        flex:       1,
    },
    infoValue: {
        fontSize:   13,
        color:      '#212121',
        fontWeight: '500',
        textAlign:  'right',
        flex:       1,
    },
    badge: {
        backgroundColor:   '#EDE9FB',
        borderRadius:      6,
        paddingHorizontal: 12,
        paddingVertical:   4,
    },
    badgeText: {
        color:      '#5B4BDB',
        fontSize:   12,
        fontWeight: '600',
    },
    skeletonLabel: {
        width:           80,
        height:          11,
        borderRadius:    5,
        backgroundColor: '#EFEFEF',
    },
    skeletonValue: {
        width:           120,
        height:          11,
        borderRadius:    5,
        backgroundColor: '#EFEFEF',
    },
    errorBox: {
        alignItems:      'center',
        paddingVertical: 20,
        gap:             12,
    },
    errorText: {
        color:     '#C62828',
        fontSize:  13,
        textAlign: 'center',
    },
    errorRetry: {
        color:      '#5B4BDB',
        fontSize:   13,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingBottom:     spacing.lg ?? 20,
        marginTop:         'auto',
    },
    fullWidth: { width: '100%' },
});

export default AppointmentConfirmScreen;