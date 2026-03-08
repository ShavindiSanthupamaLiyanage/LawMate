import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSlot {
    id: string;
    date: string;
    time: string;
}

interface Lawyer {
    id: string;
    name: string;
    barId: string;
    casesHandled: number;
    approved: boolean;
    profileImage?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TIMESLOTS: TimeSlot[] = [
    { id: '1', date: '28 th Oct 2025', time: '2.00 - 3.00 p.m' },
    { id: '2', date: '29 th Oct 2025', time: '1.00 - 2.00 p.m' },
    { id: '3', date: '31 th Oct 2025', time: '10.00 - 11.00 a.m' },
    { id: '4', date: '02 th Nov 2025', time: '2.00 - 3.00 p.m' },
    { id: '5', date: '04 th Oct 2025', time: '12.00 - 1.00 p.m' },
];

// ─── Lawyer Summary Card ──────────────────────────────────────────────────────

const LawyerSummaryCard: React.FC<{ lawyer: Lawyer }> = ({ lawyer }) => (
    <View style={styles.lawyerCard}>
        <View style={styles.lawyerAvatar}>
            {lawyer.profileImage ? (
                <Image source={{ uri: lawyer.profileImage }} style={styles.avatarImage} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                        {lawyer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Text>
                </View>
            )}
        </View>
        <View style={styles.lawyerInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <Text style={styles.lawyerBarId}>Bar ID: {lawyer.barId}</Text>
        </View>
        <View style={styles.lawyerMeta}>
            <Text style={styles.lawyerCases}>{lawyer.casesHandled} Cases Handled</Text>
            {lawyer.approved && (
                <View style={styles.approvedBadge}>
                    <Text style={styles.approvedText}>Approved</Text>
                </View>
            )}
        </View>
    </View>
);

// ─── Time Slot Row ────────────────────────────────────────────────────────────

interface TimeSlotRowProps {
    slot: TimeSlot;
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
            <Text style={[styles.slotDate, dimmed && styles.slotTextDimmed]}>{slot.date}</Text>
            <Text style={[styles.slotTime, dimmed && styles.slotTextDimmed]}>{slot.time}</Text>
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
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const lawyer: Lawyer = {
        id: route?.params?.lawyerId ?? '1',
        name: 'Tharindu Bandara',
        barId: 'SL/2017/2346',
        casesHandled: 234,
        approved: true,
        profileImage: 'https://i.pravatar.cc/150?img=3',
    };

    const handleContinue = async () => {
        if (!selectedSlotId) return;
        setLoading(true);
        await new Promise((res) => setTimeout(res, 600));
        setLoading(false);
        navigation?.navigate('AppointmentForm', {
            lawyerId: lawyer.id,
            slotId: selectedSlotId,
        });
    };

    return (
        <ClientLayout
            title="Appointment Request"
            showBackButton
            onBackPress={() => navigation?.goBack()}
            disableScroll
        >
            <View style={styles.screen}>
                {/* Lawyer summary */}
                <View style={styles.lawyerSection}>
                    <LawyerSummaryCard lawyer={lawyer} />
                </View>

                {/* Time slots */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionTitle}>Available Time Slots</Text>
                    <FlatList
                        data={MOCK_TIMESLOTS}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TimeSlotRow
                                slot={item}
                                selected={selectedSlotId === item.id}
                                hasSelection={selectedSlotId !== null}
                                onPress={() =>
                                    setSelectedSlotId(
                                        selectedSlotId === item.id ? null : item.id
                                    )
                                }
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.slotsList}
                    />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Button
                        title="CONTINUE"
                        variant="primary"
                        onPress={handleContinue}
                        loading={loading}
                        disabled={selectedSlotId === null}
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

    // ── Lawyer Card ──
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
    lawyerBarId: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    lawyerMeta: {
        alignItems: 'flex-end',
        gap: 6,
    },
    lawyerCases: {
        fontSize: 11,
        color: '#9E9E9E',
        marginBottom: 4,
    },
    approvedBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    approvedText: {
        color: '#43A047',
        fontSize: 11,
        fontWeight: '600',
    },

    // ── Time Slots ──
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

    // ── Footer ──
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