import React, { useEffect, useState } from "react";
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
import { createLawyerEvent } from "../../../services/calendarService";
import { StorageService } from "../../../utils/storage";

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
        <Ionicons
          name={icon ?? "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dropdownModal}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item && styles.optionSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  {value === item ? (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  ) : null}
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.optionTextSel,
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
    </View>
  );
};

const AddEventScreen: React.FC<{ route: any }> = ({ route }) => {
  const navigation = useNavigation<any>();
  const selectedDate = route.params?.date ? new Date(route.params.date) : new Date();

  // Initialize time with current time or 09:00
  const initTime = new Date();
  initTime.setHours(9, 0, 0, 0);

  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const [form, setForm] = useState<EventFormData>({
    title: "",
    eventType: "Other Event",
    date: selectedDate,
    time: initTime,
    duration: "60 min",
    mode: "Physical",
    location: "",
    notes: "",
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchLawyerId = async () => {
      try {
        const userData = await StorageService.getUserData();
        if (userData?.userId) {
          setLawyerId(userData.userId);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchLawyerId();
  }, []);

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

  const handleSave = async () => {
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

    if (!lawyerId) {
      Alert.alert("Error", "Lawyer ID not found");
      return;
    }

    try {
      setSubmitting(true);

      const dateTime = new Date(form.date);
      dateTime.setHours(form.time.getHours(), form.time.getMinutes(), 0, 0);

      const duration = parseInt(form.duration, 10);

      await createLawyerEvent({
        lawyerId,
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
      console.error("Error creating event:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to create event. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LawyerLayout
      title="Add Event"
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
            title="BACK"
            variant="transparent"
            onPress={() => navigation.goBack()}
            style={styles.btnStyle}
          />
          <Button
            title={submitting ? "SAVING..." : "SAVE"}
            variant="primary"
            onPress={handleSave}
            disabled={submitting}
            style={styles.btnStyle}
          />
        </View>

        {showTimePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={form.time || new Date()}
            mode="time"
            display="default"
            onChange={(_, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                set("time", selectedTime);
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
          message="Event Saved Successfully"
          type="success"
          onDismiss={() => {
            setToastVisible(false);
            navigation.goBack();
          }}
        />
      </View>
    </LawyerLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },

  fieldWrap: { marginBottom: spacing.lg },
  floatLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  multilineInput: { height: 100, paddingTop: spacing.md },

  dropdownBtn: {
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
  dropdownBtnText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dropdownModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: "60%",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionSelected: { backgroundColor: colors.background },
  optionText: {
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  optionTextSel: { fontWeight: fontWeight.bold, color: colors.primary },

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
});

export default AddEventScreen;
