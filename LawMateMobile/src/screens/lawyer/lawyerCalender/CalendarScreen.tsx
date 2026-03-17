import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colors } from "../../../config/theme";
import LawyerLayout from "../../../components/LawyerLayout";
import CalendarComponent, {
  Appointment,
  AvailabilitySlot,
} from "./CalendarComponent";
import {
  getLawyerAppointments,
  getLawyerEvents,
  getLawyerAvailabilitySlots,
  deleteLawyerEvent,
} from "../../../services/calendarService";
import {
  AppointmentDto,
  AvailabilitySlotDto,
  LawyerEventDto,
} from "../../../interfaces/calendar.interface";
import { StorageService } from "../../../utils/storage";

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<
    AvailabilitySlot[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const [eventsData, setEventsData] = useState<LawyerEventDto[]>([]);

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

  useFocusEffect(
    React.useCallback(() => {
      if (lawyerId) {
        fetchCalendarData();
      }
    }, [lawyerId]),
  );

  const fetchCalendarData = async () => {
    if (!lawyerId) return;

    try {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [appointmentsResult, eventsResult, slotsResult] =
        await Promise.allSettled([
          getLawyerAppointments(lawyerId, startOfMonth, endOfMonth),
          getLawyerEvents(lawyerId, startOfMonth, endOfMonth),
          getLawyerAvailabilitySlots(lawyerId, startOfMonth, endOfMonth),
        ]);

      if (appointmentsResult.status === "rejected") {
        console.error(
          "Error fetching lawyer appointments:",
          appointmentsResult.reason,
        );
      }

      if (eventsResult.status === "rejected") {
        console.error("Error fetching lawyer events:", eventsResult.reason);
      }

      if (slotsResult.status === "rejected") {
        console.error("Error fetching availability slots:", slotsResult.reason);
      }

      const appointmentsData =
        appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [];
      const eventsData =
        eventsResult.status === "fulfilled" ? eventsResult.value : [];
      const slotsData = slotsResult.status === "fulfilled" ? slotsResult.value : [];

      const mappedAppointments = appointmentsData.map(
        mapAppointmentDtoToFrontend,
      );
      const mappedEvents = eventsData.map(mapEventDtoToFrontend);
      const mappedSlots = slotsData.map(mapSlotDtoToFrontend);

      setEventsData(eventsData);
      setAppointments(
        [...mappedAppointments, ...mappedEvents].sort(
          (a, b) => a.dateTime.getTime() - b.dateTime.getTime(),
        ),
      );
      setAvailabilitySlots(mappedSlots);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  };

  const mapAppointmentDtoToFrontend = (dto: AppointmentDto): Appointment => {
    const statusMap: Record<string, "pending" | "confirmed" | "completed"> = {
      Pending: "pending",
      Accepted: "confirmed",
      Verified: "completed",
      Rejected: "pending",
      Suspended: "pending",
    };

    // Ensure datetime string has Z suffix for proper UTC parsing
    const dateTimeWithZ = dto.dateTime.endsWith('Z') ? dto.dateTime : dto.dateTime + 'Z';

    return {
      id: dto.bookingId.toString(),
      clientName: dto.clientName,
      email: dto.email,
      contactNumber: dto.contactNumber,
      caseType: dto.caseType,
      dateTime: new Date(dateTimeWithZ),
      duration: dto.duration,
      status: statusMap[dto.status] || "pending",
      mode: dto.mode.toLowerCase() as "physical" | "virtual",
      price: dto.price,
      notes: dto.notes,
      appointmentId: dto.appointmentId,
      paymentStatus: dto.paymentStatusDisplay,
    };
  };

  const mapSlotDtoToFrontend = (
    dto: AvailabilitySlotDto,
  ): AvailabilitySlot => ({
    id: dto.id,
    date: new Date(dto.date),
    startTime: dto.startTime,
    price: dto.price,
    duration: dto.duration,
    booked: dto.booked,
  });

  const mapEventDtoToFrontend = (dto: LawyerEventDto): Appointment => {
    // Ensure datetime string has Z suffix for proper UTC parsing
    const dateTimeWithZ = dto.dateTime.endsWith('Z') ? dto.dateTime : dto.dateTime + 'Z';

    return {
    id: `event-${dto.eventId}`,
    type: "event",
    clientName: dto.title,
    email: "",
    caseType: dto.eventType,
    dateTime: new Date(dateTimeWithZ),
    duration: dto.duration,
    status: "confirmed",
    mode: dto.mode.toLowerCase() === "virtual" ? "virtual" : "physical",
    price: 0,
    notes: dto.notes,
    appointmentId: dto.eventCode,
    paymentStatus: "N/A",
    location: dto.location,
    };
  };

  const handleEditEvent = (eventId: number) => {
    const eventData = eventsData.find((e) => e.eventId === eventId);
    if (eventData) {
      navigation.navigate("EditEvent", { event: eventData });
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLawyerEvent(eventId);
              setTimeout(() => {
                fetchCalendarData();
              }, 500);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete event. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <LawyerLayout
        title="Calendar"
        onNotificationPress={() => {}}
        onProfilePress={() => navigation.navigate("LawyerProfile")}
        disableScroll
      >
        <View style={[styles.wrapper, styles.centered]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </LawyerLayout>
    );
  }
  return (
    <LawyerLayout
      title="Calendar"
      onNotificationPress={() => {}}
      onProfilePress={() => navigation.navigate("LawyerProfile")}
      disableScroll
    >
      <View style={styles.wrapper}>
        <CalendarComponent
          onAddAppointment={(date) => navigation.navigate("AddEvent", { date: date?.toISOString() })}
          onSetAvailability={() => navigation.navigate("SetAvailability")}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onCloseModal={() => {
            // Modal will be closed by CalendarComponent
            // Just used to signal that modal was closed
          }}
          appointments={appointments}
          availabilitySlots={availabilitySlots}
        />
      </View>
    </LawyerLayout>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CalendarScreen;
