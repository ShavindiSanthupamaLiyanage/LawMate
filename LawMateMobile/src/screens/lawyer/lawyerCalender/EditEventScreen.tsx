import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Platform,
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
import LawyerLayout from "../../../components/LawyerLayout";
import { updateLawyerEvent, deleteLawyerEvent } from "../../../services/calendarService";
import { LawyerEventDto } from "../../../interfaces/calendar.interface";

const EVENT_TYPES = [
  "Court Appearance",
  "Client Meeting",
  "Internal Work",
  "Personal",
  "Other Event",
];

const DURATIONS = [
  "15 min",
  "30 min",
  "45 min",
  "60 min",
  "90 min",
  "120 min",
];

const MODES = ["Physical", "Virtual"];

interface EventFormData {
  title: string;
  eventType: string;
  date: Date | null;
  time: Date | null;
  duration: string;
  mode: string;
  location: string;
  notes: string;
}

const FloatInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}> = ({ label, value, onChangeText, multiline }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.floatLabel}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, multiline && styles.multilineInput]}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? "top" : "center"}
      placeholderTextColor={colors.textSecondary}
    />
  </View>
);

const DropdownField: React.FC<{
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}> = ({ label, value, options, onSelect, icon }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.floatLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownBtn} onPress={() => setOpen(true)}>
        <Text
          style={[
            styles.dropdownBtnText,
            !value && { color: colors.textSecondary },
          ]}
        >
          {value || `Select ${label}`}
        </Text>
        {icon && (
          <Ionicons name={icon} size={18} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <FlatList
              data={options}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              scrollEnabled={options.length > 6}
              nestedScrollEnabled
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const EditEventScreen: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  const eventData: LawyerEventDto = route.params?.event;

  // Helper: Parse ISO datetime from backend (which may not include Z timezone marker)
  const parseUTCDateTime = (dateTimeStr: string) => {
    const withZ = dateTimeStr.endsWith('Z') ? dateTimeStr : dateTimeStr + 'Z';
    return new Date(withZ);
  };

  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const eventDateTime = eventData ? parseUTCDateTime(eventData.dateTime) : new Date();

  const [form, setForm] = useState<EventFormData>({
    title: eventData?.title || "",
    eventType: eventData?.eventType || "Other Event",
    date: eventDateTime,
    time: eventDateTime,
    duration: eventData ? `${eventData.duration} min` : "60 min",
    mode: eventData?.mode || "Physical",
    location: eventData?.location || "",
    notes: eventData?.notes || "",
  });

  const [showTimePicker, setShowTimePicker] = useState(false);



  const set = (field: keyof EventFormData, val: any) =>
    setForm((prev) => ({ ...prev, [field]: val }));

  const fmtTime12 = (d: Date) => {
    const h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? "p.m." : "a.m.";
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
  };

  const dateTimeLabel = () => {
    if (form.time) {
      return fmtTime12(form.time);
    }
    return "Select Time";
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) {
      Alert.alert("Validation Error", "Please enter event title");
      return;
    }

    if (!form.eventType) {
      Alert.alert("Validation Error", "Please select event type");
      return;
    }

    if (!form.time) {
      Alert.alert("Validation Error", "Please select time");
      return;
    }

    if (!form.date) {
      Alert.alert("Validation Error", "Please select date");
      return;
    }

    try {
      setSubmitting(true);

      const dateTime = new Date(form.date);
      dateTime.setHours(form.time.getHours(), form.time.getMinutes(), 0, 0);

      const duration = parseInt(form.duration, 10);

      await updateLawyerEvent(eventData.eventId, {
        title: form.title.trim(),
        eventType: form.eventType,
        dateTime: dateTime.toISOString(),
        duration,
        mode: form.mode,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });

      setToastVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (error: any) {
      console.error("Error updating event:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to update event. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await deleteLawyerEvent(eventData.eventId);
      setDeleteConfirm(false);
      
      // Navigate back and let CalendarScreen refresh on focus
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to delete event. Please try again.",
      );
      setSubmitting(false);
      setDeleteConfirm(false);
    }
  };

  if (!eventData) {
    return (
      <LawyerLayout
        title="Edit Event"
        showBackButton
        onBackPress={() => navigation.goBack()}
        hideRightSection
        disableScroll
      >
        <View style={styles.container}>
          <Text style={{ color: colors.textSecondary }}>Event data not found</Text>
        </View>
      </LawyerLayout>
    );
  }

  return (
    <LawyerLayout
      title="Edit Event"
      showBackButton
      onBackPress={() => navigation.goBack()}
      hideRightSection
      disableScroll
    >
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <FloatInput
            label="Event Title"
            value={form.title}
            onChangeText={(v) => set("title", v)}
          />

          <DropdownField
            label="Event Type"
            value={form.eventType}
            options={EVENT_TYPES}
            onSelect={(v) => set("eventType", v)}
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.floatLabel}>Time</Text>
            <TouchableOpacity
              style={styles.dropdownBtn}
              onPress={() => setShowTimePicker(true)}
            >
              <Text
                style={[
                  styles.dropdownBtnText,
                  !form.time && { color: colors.textSecondary },
                ]}
              >
                {dateTimeLabel()}
              </Text>
              <Ionicons
                name="time-outline"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <DropdownField
            label="Duration"
            value={form.duration}
            options={DURATIONS}
            onSelect={(v) => set("duration", v)}
            icon="time-outline"
          />

          <DropdownField
            label="Mode"
            value={form.mode}
            options={MODES}
            onSelect={(v) => set("mode", v)}
          />

          <FloatInput
            label="Location (Optional)"
            value={form.location}
            onChangeText={(v) => set("location", v)}
          />

          <FloatInput
            label="Event Notes (Optional)"
            value={form.notes}
            onChangeText={(v) => set("notes", v)}
            multiline
          />
        </ScrollView>

        <View style={styles.bottomBar}>
          <Button
            title={submitting ? "UPDATING..." : "UPDATE EVENT"}
            variant="primary"
            onPress={handleUpdate}
            disabled={submitting}
            style={styles.primaryBtn}
          />
          <Button
            title="DELETE EVENT"
            variant="danger"
            onPress={() => setDeleteConfirm(true)}
            disabled={submitting}
            style={styles.deleteBtn}
          />
        </View>

        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={form.time || new Date()}
            mode="time"
            display="default"
            onChange={(_, selectedDate) => {
              setShowTimePicker(false);
              if (selectedDate) {
                set("time", selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && Platform.OS === "ios" && (
          <Modal visible={true} transparent={false} animationType="slide">
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <View style={{ backgroundColor: colors.white, paddingTop: spacing.md }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: spacing.md,
                    paddingBottom: spacing.md,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setShowTimePicker(false);
                      setTempTime(null);
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: fontSize.md }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Select Time</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (tempTime) {
                        set("time", tempTime);
                      }
                      setShowTimePicker(false);
                      setTempTime(null);
                    }}
                  >
                    <Text style={{ color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempTime || form.time || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setTempTime(selectedDate);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

        <Toast
          visible={toastVisible}
          message="Event updated successfully!"
          type="success"
          onDismiss={() => setToastVisible(false)}
          duration={1200}
        />

        <Modal
          visible={deleteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteConfirm(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>Delete Event</Text>
              <Text style={styles.confirmText}>
                Are you sure you want to delete this event?
              </Text>
              <View style={styles.confirmBtns}>
                <Button
                  title="Cancel"
                  variant="transparent"
                  onPress={() => setDeleteConfirm(false)}
                  style={styles.confirmCancelBtn}
                />
                <Button
                  title={submitting ? "Deleting..." : "Delete"}
                  variant="danger"
                  onPress={handleDelete}
                  disabled={submitting}
                  style={styles.confirmDeleteBtn}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </LawyerLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },

  fieldWrap: {
    marginBottom: spacing.md,
  },
  floatLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? spacing.md : spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  multilineInput: {
    paddingVertical: spacing.md,
  },

  dropdownBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownBtnText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dropdownMenu: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: 300,
    paddingHorizontal: spacing.md,
  },
  dropdownItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryBtn: {
    marginBottom: spacing.sm,
  },
  deleteBtn: {
    marginBottom: spacing.md,
  },

  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    width: "80%",
  },
  confirmTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  confirmText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  confirmBtns: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  confirmCancelBtn: {
    flex: 1,
  },
  confirmDeleteBtn: {
    flex: 1,
  },
});

export default EditEventScreen;
