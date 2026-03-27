import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import LawyerLayout from '../../../components/LawyerLayout';
import Toast from '../../../components/Toast';
import {
  lawyerRequestService,
  BookingDetailDto,
  statusLabel,
  modeLabel,
} from '../../../services/Lawyerrequestservice';

// ─── Route type ───────────────────────────────────────────────────────────────

type AppointmentViewRouteProp = RouteProp<RootStackParamList, 'AppointmentView'>;

// ─── Status style map ─────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { textColor: string; bgColor: string }> = {
  Pending:   { textColor: '#3B82F6', bgColor: '#E8F0FE' },
  Accepted:  { textColor: '#2d1585', bgColor: '#e2fafe' },
  Verified:  { textColor: '#10B981', bgColor: '#D1FAE5' },
  Confirmed: { textColor: '#10B981', bgColor: '#D1FAE5' },
  Rejected:  { textColor: '#EF4444', bgColor: '#FEE2E2' },
  Cancelled: { textColor: '#EF4444', bgColor: '#FEE2E2' },
  Suspended: { textColor: '#F59E0B', bgColor: '#FEF3C7' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const AppointmentView: React.FC = () => {
  const navigation = useNavigation();
  const route      = useRoute<AppointmentViewRouteProp>();

  const bookingId: number = (route.params as any)?.bookingId
    ?? (route.params as any)?.request?.bookingId;

  // ── state ──────────────────────────────────────────────────────────────────
  const [appointment, setAppointment]           = useState<BookingDetailDto | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);
  const [actionLoading, setActionLoading]       = useState(false);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [cancelReason, setCancelReason]             = useState('');
  const [rejectReason, setRejectReason]             = useState('');
  const [location, setLocation] = useState('');
  const [toastVisible, setToastVisible]         = useState(false);
  const [toastMessage, setToastMessage]         = useState('');
  const [toastType, setToastType]               = useState<'success' | 'error'>('success');

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lawyerRequestService.getById(bookingId);
      setAppointment(data);
      setLocation(data.location ?? '');
    } catch (err: any) {
      setError(err.message ?? 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // ── toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // ── actions ────────────────────────────────────────────────────────────────
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await lawyerRequestService.accept(bookingId, location.trim());
      showToast('Appointment accepted successfully!', 'success');
      await fetchDetail();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to accept', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return showToast('Please enter a rejection reason', 'error');
    try {
      setActionLoading(true);
      setRejectModalVisible(false);
      await lawyerRequestService.reject(bookingId, rejectReason.trim());
      showToast('Appointment rejected.', 'success');
      setRejectReason('');
      await fetchDetail();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to reject', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) return showToast('Please enter a cancellation reason', 'error');
    try {
      setActionLoading(true);
      setCancelModalVisible(false);
      await lawyerRequestService.cancel(bookingId, cancelReason.trim());
      showToast('Appointment cancelled.', 'success');
      setCancelReason('');
      await fetchDetail();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to cancel', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LawyerLayout title="View Appointment" showBackButton hideRightSection onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading appointment…</Text>
        </View>
      </LawyerLayout>
    );
  }

  // ── error ──────────────────────────────────────────────────────────────────
  if (error || !appointment) {
    return (
      <LawyerLayout title="View Appointment" showBackButton hideRightSection onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Appointment not found.'}</Text>
          <Text style={styles.retryText} onPress={fetchDetail}>Tap to retry</Text>
        </View>
      </LawyerLayout>
    );
  }

  // ── derived display values ─────────────────────────────────────────────────
  const statusStr = statusLabel(appointment.status as number);
  const { textColor, bgColor } = STATUS_STYLES[statusStr] ?? STATUS_STYLES['Pending'];

  const isPending   = statusStr === 'Pending';
  const isAccepted  = statusStr === 'Accepted';
  const isConfirmed = statusStr === 'Confirmed' || statusStr === 'Verified';
  const isRejected  = statusStr === 'Rejected';
  const isCancelled = statusStr === 'Cancelled';

  const dateObj = new Date(appointment.scheduledDateTime);
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <LawyerLayout
        title="View Appointment"
        showBackButton
        hideRightSection
        onBackPress={() => navigation.goBack()}
      >
        <StatusBar barStyle="dark-content" />

        <View style={styles.wrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ── CLIENT INFO ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Client Information</Text>
              <InfoRow label="Name"    value={appointment.clientName} />
              <InfoRow label="Email"   value={appointment.email} />
              <InfoRow label="Phone"   value={appointment.phone} />
              <InfoRow label="NIC"     value={appointment.nic} />
              <InfoRow label="Address" value={appointment.address} />
            </View>

            {/* ── CASE DETAILS ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Case Details</Text>
              <InfoRow label="Case Type"  value={appointment.caseType} />
              <InfoRow label="Case Note"  value={appointment.caseNote ?? '-'} />
              <InfoRow label="Created By" value={appointment.createdBy} />
            </View>

            {/* ── APPOINTMENT INFO ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Appointment Info</Text>
              <InfoRow label="Date"     value={dateStr} />
              <InfoRow label="Time"     value={timeStr} />
              <InfoRow label="Mode" value={modeLabel(appointment.mode)} />
              {/*<InfoRow label="Location" value={appointment.location ?? '-'} />*/}
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                  <Text style={[styles.statusText, { color: textColor }]}>
                    {statusStr}
                  </Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  {isPending ? (
                      <>
                        <TextInput
                            style={[
                              styles.locationInput,
                              !location.trim() && styles.locationInputError,
                            ]}
                            // placeholder="Enter location (required)"
                            placeholderTextColor="#EF4444"
                            value={location}
                            onChangeText={setLocation}
                            textAlign="right"
                        />
                        {!location.trim() && (
                            <Text style={styles.locationRequired}>* Location is required to accept</Text>
                        )}
                      </>
                  ) : (
                      <Text style={styles.value}>{appointment.location ?? '-'}</Text>
                  )}
                </View>
              </View>

              {(isRejected || isCancelled) && appointment.rejectionReason ? (
                <InfoRow label="Reason" value={appointment.rejectionReason} />
              ) : null}
            </View>
          </ScrollView>

          {/* ── ACTION BAR ── */}
          {actionLoading && (
            <View style={styles.actionLoader}>
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          )}
          {isPending && !actionLoading && (
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => setRejectModalVisible(true)}>
                  <Text style={styles.btnText}>REJECT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.acceptBtn, !location.trim() && styles.acceptBtnDisabled]}
                    onPress={handleAccept}
                    disabled={!location.trim()}
                >
                  <Text style={styles.btnText}>ACCEPT</Text>
                </TouchableOpacity>
              </View>
          )}

          {(isAccepted || isConfirmed) && !actionLoading && (
            <View style={styles.acceptedWrapper}>
              <Text style={styles.acceptedInfoText}>
                This appointment has been accepted. Waiting for the client's payment.
              </Text>
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setCancelModalVisible(true)}>
                  <Text style={styles.btnText}>CANCEL APPOINTMENT</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(isRejected || isCancelled) && !actionLoading && (
            <View style={styles.rejectedActions}>
              <Text style={styles.rejectedText}>
                This appointment has been {statusStr.toLowerCase()}.
                {appointment.rejectionReason ? ` Reason: ${appointment.rejectionReason}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* ── CANCEL MODAL (free-text) ── */}
        <Modal
          visible={cancelModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCancelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Cancel Appointment</Text>
              <Text style={styles.modalText}>
                Are you sure you want to cancel this appointment? This will notify the client.
              </Text>
              <Text style={[styles.modalText, { marginTop: 12, marginBottom: 8 }]}>
                Please enter the cancellation reason:
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="e.g. Client unavailable, schedule conflict…"
                placeholderTextColor="#9CA3AF"
                value={cancelReason}
                onChangeText={setCancelReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]}
                  onPress={() => {
                    setCancelModalVisible(false);
                    setCancelReason('');
                  }}
                >
                  <Text style={{ color: '#111', fontWeight: '600' }}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: '#F87171' }]}
                  onPress={handleCancelConfirm}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── REJECT MODAL (free-text) ── */}
        <Modal
          visible={rejectModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setRejectModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reject Appointment</Text>
              <Text style={styles.modalText}>
                Are you sure you want to reject this appointment? This will notify the client.
              </Text>
              <Text style={[styles.modalText, { marginTop: 12, marginBottom: 8 }]}>
                Please enter the rejection reason:
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="e.g. Schedule conflict, unavailable on this date…"
                placeholderTextColor="#9CA3AF"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]}
                  onPress={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                  }}
                >
                  <Text style={{ color: '#111', fontWeight: '600' }}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: '#F87171' }]}
                  onPress={handleRejectConfirm}
                >
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </LawyerLayout>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: '#8A8A8A',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    maxWidth: '55%',
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },
  actionLoader: {
    padding: 16,
    alignItems: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 25,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  rejectedActions: {
    margin: 16,
    borderColor: '#F87171',
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectedText: {
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },
  acceptedWrapper: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  acceptedInfoText: {
    textAlign: 'center',
    color: '#3B82F6',
    fontWeight: '500',
    fontSize: 13,
    paddingHorizontal: 20,
    padding: 10,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 15,
    borderRadius: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 90,
    backgroundColor: '#F9FAFB',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  locationInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    minWidth: 160,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  locationInputError: {
    borderBottomColor: '#EF4444',
  },
  locationRequired: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
  },
  acceptBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

export default AppointmentView;