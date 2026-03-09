import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
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
    const suffix = d.getHours() >= 12 ? 'P.M.' : 'A.M.';
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, '0')}.${minutes} ${suffix}`;
};

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: React.ReactNode; isBadge?: boolean }> = ({
    label, value, isBadge,
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

const AppointmentConfirm: React.FC<AppointmentConfirmScreenProps> = ({ navigation, route }) => {
    const formData = route?.params?.formData ?? {};
    const [loading, setLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    const dateStr = formatDisplayDate(formData.date);
    const startStr = formatDisplayTime(formData.startTime);
    const endStr = formatDisplayTime(formData.endTime);
    const timeStr = `${startStr} - ${endStr}`;

    const handleSubmit = async () => {
        setLoading(true);
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
                        <Button
                            title="SUBMIT"
                            variant="primary"
                            onPress={handleSubmit}
                            loading={loading}
                            style={styles.fullWidth}
                        />
                    </View>
                </View>
            </ClientLayout>

            {/* Toast rendered outside ClientLayout so it overlays everything */}
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
    footer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingBottom: spacing.lg ?? 20,
        marginTop: 'auto',
    },
    fullWidth: {
        width: '100%',
    },
});

export default AppointmentConfirm;