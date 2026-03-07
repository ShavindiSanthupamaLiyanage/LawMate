import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Toast from '../../../components/Toast';
import { colors, spacing } from '../../../config/theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDisplayDate = (isoString?: string): string => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    return `${year} ${month} ${day}`;
};

const formatDisplayTime = (isoString?: string): string => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'A.M.' : 'A.M.';
    const suffix = d.getHours() >= 12 ? 'P.M.' : 'A.M.';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}.${minutes} ${suffix}`;
};

// ─── Row Component ────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isBadge?: boolean }> = ({
    label,
    value,
    isBadge,
}) => (
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface FormData {
    name?: string;
    caseType?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
    mode?: string;
    location?: string;
}

interface AppointmentConfirmScreenProps {
    navigation?: any;
    route?: {
        params?: {
            lawyerId?: string;
            slotId?: string;
            formData?: FormData;
        };
    };
}

const AppointmentConfirm: React.FC<AppointmentConfirmScreenProps> = ({
    navigation,
    route,
}) => {
    const formData = route?.params?.formData ?? {};
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const dateStr = formatDisplayDate(formData.date);
    const startStr = formatDisplayTime(formData.startTime);
    const endStr = formatDisplayTime(formData.endTime);
    const timeStr = `${startStr} - ${endStr}`;

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise((res) => setTimeout(res, 800));
        setLoading(false);
        setToastVisible(true);
    };

    const handleToastDismiss = () => {
        setToastVisible(false);
        navigation?.navigate('AppointmentRequestReceived');
    };

    return (
        <>
        <ClientLayout
            title="Appointment Request"
            showBackButton
            onBackPress={() => navigation?.goBack()}
            disableScroll
        >

            <View style={styles.screen}>
                {/* Info Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Appointment Info</Text>

                    <View style={styles.divider} />

                    <InfoRow label="Date" value={dateStr} />
                    <View style={styles.rowDivider} />

                    <InfoRow label="Time" value={timeStr} />
                    <View style={styles.rowDivider} />

                    <InfoRow label="Mode" value={formData.mode ?? '—'} />
                    <View style={styles.rowDivider} />

                    {formData.mode === 'Physical' && (
                        <>
                            <InfoRow label="Location" value={formData.location ?? '—'} />
                            <View style={styles.rowDivider} />
                        </>
                    )}

                    <InfoRow label="Payment fee" value="Rs.15000" />
                    <View style={styles.rowDivider} />

                    <InfoRow label="Status" value="Pending" isBadge />
                </View>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>SUBMIT</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ClientLayout>
        {/* Toast */}
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
        flex: 1,
        backgroundColor: colors.background ?? '#F2F2F7',
    },

    // ── Card ──
    card: {
        margin: spacing.lg ?? 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 14,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: 6,
    },
    rowDivider: {
        height: 1,
        backgroundColor: '#F5F5F5',
        marginVertical: 4,
    },

    // ── Info Row ──
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    infoLabel: {
        fontSize: 13,
        color: '#9E9E9E',
        fontWeight: '400',
        flex: 1,
    },
    infoValue: {
        fontSize: 13,
        color: '#212121',
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },

    // ── Badge ──
    badge: {
        backgroundColor: '#EDE9FB',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#5B4BDB',
        fontSize: 12,
        fontWeight: '600',
    },

    // ── Footer ──
    footer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingBottom: spacing.lg ?? 20,
        marginTop: 'auto',
    },
    submitButton: {
        backgroundColor: '#4F3CC9',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1.2,
    },
});

export default AppointmentConfirm;