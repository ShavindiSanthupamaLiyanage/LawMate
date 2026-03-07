import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

export interface AvailabilitySlot {
    id: string;
    date: Date;
    startTime: string;
    price: number;
    duration: number; // in minutes
    booked: boolean;
}

interface SetAvailabilityProps {
    onSave: (slots: AvailabilitySlot[]) => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
});

const SetAvailabilityScreen: React.FC<SetAvailabilityProps> = ({ onSave }) => {
    const navigation = useNavigation<any>();
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
        {
            id: '1',
            date: new Date(2025, 11, 4), // December 4, 2025
            startTime: '12:00',
            price: 5000,
            duration: 30,
            booked: false,
        },
        {
            id: '2',
            date: new Date(2025, 11, 4),
            startTime: '12:30',
            price: 5000,
            duration: 30,
            booked: false,
        },
        {
            id: '3',
            date: new Date(2025, 11, 4),
            startTime: '13:00',
            price: 5000,
            duration: 30,
            booked: false,
        },
        {
            id: '4',
            date: new Date(2025, 11, 4),
            startTime: '13:30',
            price: 5000,
            duration: 30,
            booked: false,
        },
    ]);

    const [newSlot, setNewSlot] = useState<Partial<AvailabilitySlot>>({
        date: new Date(),
        startTime: '09:00',
        price: 5000,
        duration: 30,
    });

    const [showAddSlotModal, setShowAddSlotModal] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [timeModalVisible, setTimeModalVisible] = useState(false);

    const handleDeleteSlot = (id: string) => {
        setAvailabilitySlots(slots => slots.filter(slot => slot.id !== id));
    };

    const handleEditSlot = (slot: AvailabilitySlot) => {
        setNewSlot(slot);
        setSelectedSlotId(slot.id);
        setShowAddSlotModal(true);
    };

    const handleSaveSlot = () => {
        if (!newSlot.date || !newSlot.startTime || !newSlot.price || !newSlot.duration) {
            alert('Please fill in all fields');
            return;
        }

        if (selectedSlotId) {
            // Edit existing slot
            setAvailabilitySlots(slots =>
                slots.map(slot =>
                    slot.id === selectedSlotId
                        ? { ...slot, ...newSlot }
                        : slot
                )
            );
        } else {
            // Add new slot
            const newId = Date.now().toString();
            setAvailabilitySlots(slots => [
                ...slots,
                {
                    id: newId,
                    date: newSlot.date!,
                    startTime: newSlot.startTime!,
                    price: newSlot.price!,
                    duration: newSlot.duration!,
                    booked: false,
                },
            ]);
        }

        // Reset form
        setNewSlot({
            date: new Date(),
            startTime: '09:00',
            price: 5000,
            duration: 30,
        });
        setSelectedSlotId(null);
        setShowAddSlotModal(false);
    };

    const handleSave = () => {
        onSave(availabilitySlots);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[
                    'rgba(24,114,234,1)',
                    'rgba(54,87,208,1)',
                    'rgba(77,55,200,1)',
                    'rgba(99,71,253,1)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set Availability</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Availability Slots List */}
                {availabilitySlots.map((slot) => (
                    <View key={slot.id} style={styles.slotCard}>
                        <View style={styles.slotContent}>
                            <View style={styles.slotInfo}>
                                <Text style={styles.slotDate}>
                                    Available on {slot.date.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </Text>
                                <Text style={styles.slotTime}>{slot.startTime} p.m</Text>
                            </View>
                            <View style={styles.slotPrice}>
                                <Text style={styles.priceText}>{slot.duration} M</Text>
                                <Text style={styles.perSlotText}>PER SLOT</Text>
                            </View>
                        </View>
                        <View style={styles.slotActions}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => handleEditSlot(slot)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="pencil" size={20} color={colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteSlot(slot.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="trash" size={20} color={colors.white} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Add New Slot Button */}
            <View style={styles.addButtonContainer}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setNewSlot({
                            date: new Date(),
                            startTime: '09:00',
                            price: 5000,
                            duration: 30,
                        });
                        setSelectedSlotId(null);
                        setShowAddSlotModal(true);
                    }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1872EA', '#6347FD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.addButtonGradient}
                    >
                        <Text style={styles.addButtonText}>ADD NEW</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Add/Edit Slot Modal */}
            <Modal
                visible={showAddSlotModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowAddSlotModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {selectedSlotId ? 'Edit Slot' : 'Add New Slot'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddSlotModal(false)}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                            {/* Date Input */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Date</Text>
                                <TouchableOpacity
                                    style={styles.dateButton}
                                    onPress={() => {
                                        // TODO: Implement date picker
                                    }}
                                >
                                    <Text style={styles.dateButtonText}>
                                        {newSlot.date?.toLocaleDateString()}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Time Input */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Start Time</Text>
                                <TouchableOpacity
                                    style={styles.timeButton}
                                    onPress={() => setTimeModalVisible(true)}
                                >
                                    <Text style={styles.timeButtonText}>
                                        {newSlot.startTime}
                                    </Text>
                                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Duration Input */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Duration (minutes)</Text>
                                <View style={styles.durationButtons}>
                                    {[15, 30, 45, 60].map(duration => (
                                        <TouchableOpacity
                                            key={duration}
                                            style={[
                                                styles.durationButton,
                                                newSlot.duration === duration && styles.selectedDurationButton,
                                            ]}
                                            onPress={() => setNewSlot({ ...newSlot, duration })}
                                        >
                                            <Text
                                                style={[
                                                    styles.durationButtonText,
                                                    newSlot.duration === duration && styles.selectedDurationButtonText,
                                                ]}
                                            >
                                                {duration}m
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Price Input */}
                            <View style={styles.formField}>
                                <Text style={styles.formLabel}>Price (LKR)</Text>
                                <View style={styles.priceInputContainer}>
                                    {[3000, 5000, 7500, 10000].map(price => (
                                        <TouchableOpacity
                                            key={price}
                                            style={[
                                                styles.priceButton,
                                                newSlot.price === price && styles.selectedPriceButton,
                                            ]}
                                            onPress={() => setNewSlot({ ...newSlot, price })}
                                        >
                                            <Text
                                                style={[
                                                    styles.priceButtonText,
                                                    newSlot.price === price && styles.selectedPriceButtonText,
                                                ]}
                                            >
                                                {price}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Modal Actions */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowAddSlotModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleSaveSlot}
                            >
                                <LinearGradient
                                    colors={['#1872EA', '#6347FD']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.confirmButtonGradient}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {selectedSlotId ? 'UPDATE' : 'ADD'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Time Picker Modal */}
            <Modal
                visible={timeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setTimeModalVisible(false)}
            >
                <View style={styles.timePickerOverlay}>
                    <View style={styles.timePickerModal}>
                        <View style={styles.timePickerHeader}>
                            <Text style={styles.timePickerTitle}>Select Time</Text>
                            <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={TIME_OPTIONS}
                            keyExtractor={(item) => item}
                            numColumns={4}
                            columnWrapperStyle={styles.timePickerGrid}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.timeOption,
                                        newSlot.startTime === item && styles.selectedTimeOption,
                                    ]}
                                    onPress={() => {
                                        setNewSlot({ ...newSlot, startTime: item });
                                        setTimeModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.timeOptionText,
                                            newSlot.startTime === item && styles.selectedTimeOptionText,
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Save Changes Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1872EA', '#6347FD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButtonGradient}
                    >
                        <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.md,
        paddingBottom: 120,
    },
    slotCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        marginBottom: spacing.lg,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    slotContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    slotInfo: {
        flex: 1,
    },
    slotDate: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    slotTime: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    slotPrice: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    perSlotText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    slotActions: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
    },
    editButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        backgroundColor: colors.error,
    },
    addButtonContainer: {
        padding: spacing.lg,
    },
    addButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    addButtonGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        height: '90%',
        paddingBottom: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    modalTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    modalForm: {
        flex: 1,
        padding: spacing.lg,
    },
    formField: {
        marginBottom: spacing.lg,
    },
    formLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    dateButton: {
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
    dateButtonText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    timeButton: {
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
    timeButtonText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    durationButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    durationButton: {
        flex: 1,
        minWidth: '48%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    selectedDurationButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    durationButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    selectedDurationButtonText: {
        color: colors.white,
    },
    priceInputContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    priceButton: {
        flex: 1,
        minWidth: '48%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    selectedPriceButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    priceButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    selectedPriceButtonText: {
        color: colors.white,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    modalButton: {
        flex: 1,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.primary,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        paddingVertical: spacing.md,
        textAlign: 'center',
    },
    confirmButton: {
        flex: 1,
    },
    confirmButtonGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
    },
    timePickerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    timePickerModal: {
        backgroundColor: colors.white,
        borderTopLeftRadius: borderRadius.lg,
        borderTopRightRadius: borderRadius.lg,
        maxHeight: '60%',
        paddingBottom: spacing.lg,
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    timePickerTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    timePickerGrid: {
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    timeOption: {
        width: '23%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        backgroundColor: colors.white,
        marginBottom: spacing.sm,
    },
    selectedTimeOption: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeOptionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    selectedTimeOptionText: {
        color: colors.white,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    button: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    saveButton: {
        flex: 1,
    },
    saveButtonGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
});

export default SetAvailabilityScreen;
