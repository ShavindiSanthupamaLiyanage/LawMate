import React, { useState, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../../config/theme";
import Toast from "../../../components/Toast";
import Button from "../../../components/Button";
import {
  getLawyerAvailabilitySlots,
  createAvailabilitySlot,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
} from "../../../services/calendarService";
import { StorageService } from "../../../utils/storage";

export interface AvailabilitySlot {
  id: string;
  date: Date;
  startTime: string; // "HH:MM" 24h
  price: number;
  duration: number; // minutes
  booked: boolean;
}

const DURATIONS = [15, 30, 45, 60];
const PRICES = [3000, 5000, 7500, 10000];

/* ─────────────────────────── helpers ─────────────────────────────────── */
const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "p.m." : "a.m.";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
};

/* ─────────────────────────── main screen ─────────────────────────────── */
const SetAvailabilityScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [lawyerId, setLawyerId] = useState<string | null>(null);

  // Which slot card is expanded (shows edit/delete)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Add / edit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState<Date>(new Date());
  const [slotTime, setSlotTime] = useState<Date>(new Date());
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotPrice, setSlotPrice] = useState(5000);
  const [submitting, setSubmitting] = useState(false);

  // Date / time pickers (native)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await StorageService.getUserData();
        if (userData?.userId) {
          setLawyerId(userData.userId);
          await fetchSlots(userData.userId);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        Alert.alert("Error", "Failed to load availability slots");
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const fetchSlots = async (lawyerId: string) => {
    try {
      const slotsData = await getLawyerAvailabilitySlots(lawyerId);
      const mappedSlots = slotsData.map((dto) => ({
        id: dto.id,
        date: new Date(dto.date),
        startTime: dto.startTime,
        price: dto.price,
        duration: dto.duration,
        booked: dto.booked,
      }));
      setSlots(mappedSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      Alert.alert("Error", "Failed to load availability slots");
    }
  };

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
    const [h, m] = slot.startTime.split(":").map(Number);
    const t = new Date();
    t.setHours(h, m, 0, 0);
    setSlotTime(t);
    setSlotDuration(slot.duration);
    setSlotPrice(slot.price);
    setModalVisible(true);
  };

  // confirm add / edit
  const handleConfirm = async () => {
    if (!lawyerId) {
      Alert.alert("Error", "Lawyer ID not found");
      return;
    }

    const timeStr = `${String(slotTime.getHours()).padStart(2, "0")}:${String(slotTime.getMinutes()).padStart(2, "0")}`;

    try {
      setSubmitting(true);

      if (editingId) {
        await updateAvailabilitySlot(parseInt(editingId), {
          date: slotDate.toISOString(),
          startTime: timeStr,
          duration: slotDuration,
          price: slotPrice,
        });

        setSlots((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  date: slotDate,
                  startTime: timeStr,
                  duration: slotDuration,
                  price: slotPrice,
                }
              : s,
          ),
        );
      } else {
        const response = await createAvailabilitySlot({
          lawyerId,
          date: slotDate.toISOString(),
          startTime: timeStr,
          duration: slotDuration,
          price: slotPrice,
        });

        setSlots((prev) => [
          ...prev,
          {
            id: response.id,
            date: slotDate,
            startTime: timeStr,
            duration: slotDuration,
            price: slotPrice,
            booked: false,
          },
        ]);
      }

      setModalVisible(false);
      setToastVisible(true);
    } catch (error: any) {
      console.error("Error saving slot:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save availability slot",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAvailabilitySlot(parseInt(id));
      setSlots((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete availability slot",
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
          <Text style={styles.headerTitle}>Set Availability</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {slots.map((slot) => {
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
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                {/* info */}
                <View style={styles.slotInfo}>
                  <Text style={styles.slotDateTxt}>
                    Available on {fmtDate(slot.date)}
                  </Text>
                  <Text style={styles.slotTimeTxt}>
                    {to12h(slot.startTime)}
                  </Text>
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
                    onPress={() => {
                      openEditModal(slot);
                      setSelectedId(null);
                    }}
                    style={styles.actionBtnStyle}
                  />
                  <Button
                    title="Delete"
                    variant="reject"
                    onPress={() => handleDelete(slot.id)}
                    style={styles.actionBtnStyle}
                  />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom: BACK + ADD NEW */}
      <View style={styles.bottomBar}>
        <Button
          title="BACK"
          variant="transparent"
          onPress={() => navigation.goBack()}
          style={styles.btnStyle}
        />
        <Button
          title="ADD NEW"
          variant="primary"
          onPress={openAddModal}
          style={styles.btnStyle}
        />
      </View>

      {/* Add / Edit bottom sheet */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            {/* handle */}
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editingId ? "Edit Slot" : "Add New Slot"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Date */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Date</Text>
                <TouchableOpacity
                  style={styles.pickBtn}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.pickTxt}>{fmtDate(slotDate)}</Text>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
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
                    {`${String(slotTime.getHours()).padStart(2, "0")}:${String(slotTime.getMinutes()).padStart(2, "0")}`}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Duration */}
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>Duration</Text>
                <View style={styles.chipRow}>
                  {DURATIONS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.chip,
                        slotDuration === d && styles.chipSel,
                      ]}
                      onPress={() => setSlotDuration(d)}
                    >
                      <Text
                        style={[
                          styles.chipTxt,
                          slotDuration === d && styles.chipTxtSel,
                        ]}
                      >
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
                  {PRICES.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, slotPrice === p && styles.chipSel]}
                      onPress={() => setSlotPrice(p)}
                    >
                      <Text
                        style={[
                          styles.chipTxt,
                          slotPrice === p && styles.chipTxtSel,
                        ]}
                      >
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
              />
              <Button
                title={
                  submitting ? "SAVING..." : editingId ? "UPDATE" : "CONFIRM"
                }
                variant="primary"
                onPress={handleConfirm}
                disabled={submitting}
                style={styles.sheetBtnStyle}
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
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShowDatePicker(false);
            if (d) setSlotDate(d);
          }}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={slotTime}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, t) => {
            setShowTimePicker(false);
            if (t) setSlotTime(t);
          }}
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
  loadingContainer: { justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 48,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
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
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  slotRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  slotIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
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
  slotBadge: { alignItems: "flex-end" },
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
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtnStyle: {
    flex: 1,
    height: 36,
  },

  /* bottom bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  btnStyle: { flex: 1 },

  /* bottom sheet */
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl ?? 24,
    borderTopRightRadius: borderRadius.xl ?? 24,
    maxHeight: "80%",
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  pickTxt: { fontSize: fontSize.sm, color: colors.textPrimary },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
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
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sheetBtnStyle: { flex: 1 },
});

export default SetAvailabilityScreen;
