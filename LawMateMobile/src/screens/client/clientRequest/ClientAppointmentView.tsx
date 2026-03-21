import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import { bookingService, GetAppointmentDto } from '../../../services/bookingService';
import { clientBookingService } from '../../../services/clientBookingService';
import { paymentService, PaymentSlipResultDto } from '../../../services/paymentService';

// ─── Route / Nav types ────────────────────────────────────────────────────────

type ClientAppointmentViewRouteProp = RouteProp<
  RootStackParamList,
  'ClientAppointmentView'
>;

type ClientAppointmentViewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ClientAppointmentView'
>;

// ─── Status style map ─────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { textColor: string; bgColor: string }> = {
  Pending:   { textColor: '#3B82F6', bgColor: '#E8F0FE' },
  Accepted:  { textColor: '#7C3AED', bgColor: '#EDE9FE' },
  Verified:  { textColor: '#10B981', bgColor: '#D1FAE5' },
  Confirmed: { textColor: '#10B981', bgColor: '#D1FAE5' },
  Rejected:  { textColor: '#EF4444', bgColor: '#FEE2E2' },
  Cancelled: { textColor: '#EF4444', bgColor: '#FEE2E2' },
  Suspended: { textColor: '#F59E0B', bgColor: '#FEF3C7' },
};

const SLIP_STATUS_STYLES: Record<string, { textColor: string; bgColor: string }> = {
  Pending:  { textColor: '#D97706', bgColor: '#FEF3C7' },
  Verified: { textColor: '#16A34A', bgColor: '#F0FDF4' },
  Rejected: { textColor: '#DC2626', bgColor: '#FFF7F7' },
};

// ─── Component ────────────────────────────────────────────────────────────────

const ClientAppointmentView: React.FC = () => {
  const navigation = useNavigation<ClientAppointmentViewNavigationProp>();
  const route      = useRoute<ClientAppointmentViewRouteProp>();

  const bookingId: number =
    (route.params as any)?.bookingId ??
    (route.params as any)?.request?.bookingId;

  // ── state ──────────────────────────────────────────────────────────────────
  const [appointment, setAppointment]     = useState<GetAppointmentDto | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [paymentSlip, setPaymentSlip]     = useState<PaymentSlipResultDto | null>(null);
  const [slipLoading, setSlipLoading]     = useState(false);

  const [modalVisible, setModalVisible]   = useState(false);
  const [cancelReason, setCancelReason]   = useState('');

  const [toastVisible, setToastVisible]   = useState(false);
  const [toastMessage, setToastMessage]   = useState('');
  const [toastType, setToastType]         = useState<'success' | 'error'>('success');

  // ── fetch appointment ──────────────────────────────────────────────────────
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingById(bookingId);
      setAppointment(data);

      // If Accepted — also fetch payment slip
      if (
        data.status === 'Accepted' ||
        data.status === 'Confirmed' ||
        data.status === 'Verified'
      ) {
        fetchSlip();
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load appointment');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  // ── fetch slip ─────────────────────────────────────────────────────────────
  const fetchSlip = useCallback(async () => {
    try {
      setSlipLoading(true);
      const slip = await paymentService.getPaymentSlip(bookingId);
      setPaymentSlip(slip);
    } catch {
      // silently ignore — slip just won't show
    } finally {
      setSlipLoading(false);
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

  // ── cancel ─────────────────────────────────────────────────────────────────
  const handleCancelConfirm = async () => {
    if (!cancelReason.trim())
      return showToast('Please enter a cancellation reason', 'error');
    try {
      setActionLoading(true);
      setModalVisible(false);
      await clientBookingService.cancelBooking(bookingId, cancelReason.trim());
      showToast('Appointment cancelled successfully.', 'success');
      setCancelReason('');
      await fetchDetail();
    } catch (err: any) {
      showToast(err.message ?? 'Failed to cancel appointment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <ClientLayout title="Appointment Details" showBackButton hideRightSection onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading appointment…</Text>
        </View>
      </ClientLayout>
    );
  }

  if (error || !appointment) {
    return (
      <ClientLayout title="Appointment Details" showBackButton hideRightSection onBackPress={() => navigation.goBack()}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'Appointment not found.'}</Text>
          <Text style={styles.retryText} onPress={fetchDetail}>Tap to retry</Text>
        </View>
      </ClientLayout>
    );
  }

  // ── derived values ─────────────────────────────────────────────────────────
  const statusStr = appointment.status ?? 'Pending';
  const { textColor, bgColor } = STATUS_STYLES[statusStr] ?? STATUS_STYLES['Pending'];

  const isPending   = statusStr === 'Pending';
  const isAccepted  = statusStr === 'Accepted';
  const isConfirmed = statusStr === 'Confirmed' || statusStr === 'Verified';
  const isRejected  = statusStr === 'Rejected';
  const isCancelled = statusStr === 'Cancelled';

  const dateObj = new Date(appointment.dateTime);
  const dateStr = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  let timeStr = '-';
  try {
    timeStr = new Date(appointment.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { /* keep default */ }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <ClientLayout
        title="Appointment Details"
        showBackButton
        hideRightSection
        onBackPress={() => navigation.goBack()}
      >
        <StatusBar barStyle="dark-content" />

        <View style={styles.wrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* ── APPOINTMENT INFO ── */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Appointment Info</Text>
              <InfoRow label="Lawyer"   value={appointment.lawyerName ?? '-'} />
              <InfoRow label="Case"     value={appointment.caseType} />
              <InfoRow label="Date"     value={dateStr} />
              <InfoRow label="Time"     value={timeStr} />
              <InfoRow label="Mode"     value={appointment.mode} />
              <InfoRow label="Notes"    value={appointment.notes ?? '-'} />
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                  <Text style={[styles.statusText, { color: textColor }]}>
                    {statusStr}
                  </Text>
                </View>
              </View>
              {(isRejected || isCancelled) && appointment.rejectionReason ? (
                <InfoRow label="Reason" value={appointment.rejectionReason} />
              ) : null}
            </View>

            {/* ── PAYMENT SLIP CARD (only when Accepted/Confirmed/Verified) ── */}
            {(isAccepted || isConfirmed) && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Payment Slip</Text>

                {slipLoading && (
                  <View style={styles.slipLoading}>
                    <ActivityIndicator size="small" color="#4F46E5" />
                    <Text style={styles.slipLoadingText}>Loading slip…</Text>
                  </View>
                )}

                {!slipLoading && paymentSlip && (
                  <>
                    {/* slip image */}
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${paymentSlip.slipImageBase64}`,
                      }}
                      style={styles.slipImage}
                      resizeMode="contain"
                    />

                    {/* verification status badge */}
                    <View style={styles.slipStatusRow}>
                      <Text style={styles.label}>Verification</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              SLIP_STATUS_STYLES[paymentSlip.verificationStatus]
                                ?.bgColor ?? '#F3F4F6',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color:
                                SLIP_STATUS_STYLES[paymentSlip.verificationStatus]
                                  ?.textColor ?? '#6B7280',
                            },
                          ]}
                        >
                          {paymentSlip.verificationStatus}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {!slipLoading && !paymentSlip && (
                  <View style={styles.noSlipBox}>
                    <Text style={styles.noSlipText}>No payment slip uploaded yet</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* ── ACTION BAR ── */}
          {actionLoading && (
            <View style={styles.actionLoader}>
              <ActivityIndicator size="small" color="#4F46E5" />
            </View>
          )}

          {isPending && !actionLoading && (
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.btnText}>CANCEL APPOINTMENT</Text>
              </TouchableOpacity>
            </View>
          )}

          {isConfirmed && !actionLoading && (
            <View style={styles.bottomActions}>
              <Button title="JOIN MEETING" onPress={() => null} variant="primary" />
              <Button
                title="CANCEL APPOINTMENT"
                onPress={() => setModalVisible(true)}
                variant="transparent"
              />
            </View>
          )}

          {isAccepted && !actionLoading && (
            <View style={styles.bottomActions}>
              {/* Only show upload button if no slip uploaded yet */}
              {!paymentSlip && (
                <Button
                  title="UPLOAD PAYMENT SLIP"
                  onPress={() =>
                    navigation.navigate('PaymentSlipScreen', {
                      request: appointment as any,
                    })
                  }
                  variant="primary"
                />
              )}
              <Button
                title="CANCEL APPOINTMENT"
                onPress={() => setModalVisible(true)}
                variant="transparent"
              />
            </View>
          )}

          {(isRejected || isCancelled) && !actionLoading && (
            <View style={styles.rejectedBanner}>
              <Text style={styles.rejectedText}>
                This appointment has been {statusStr.toLowerCase()}.
              </Text>
            </View>
          )}
        </View>

        {/* ── CANCEL MODAL ── */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Cancel Appointment</Text>
              <Text style={styles.modalText}>
                Are you sure you want to cancel this appointment?
              </Text>
              <Text style={[styles.modalText, { marginTop: 12, marginBottom: 8 }]}>
                Please enter the cancellation reason:
              </Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="e.g. Personal emergency, schedule conflict…"
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
                    setModalVisible(false);
                    setCancelReason('');
                  }}
                >
                  <Text style={{ fontWeight: '600' }}>Back</Text>
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
      </ClientLayout>

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
  scrollView: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#6B7280', fontSize: 14 },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryText: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  label: { fontSize: 14, color: '#8A8A8A' },
  value: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '55%',
    textAlign: 'right',
    color: '#111',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontWeight: '600', fontSize: 13 },

  // slip card
  slipLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  slipLoadingText: { color: '#6B7280', fontSize: 13 },
  slipImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
  },
  slipStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noSlipBox: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  noSlipText: { color: '#9CA3AF', fontSize: 13 },

  // action bar
  actionLoader: { padding: 16, alignItems: 'center' },
  bottomActions: { padding: 16, gap: 12 },
  cancelBtn: {
    backgroundColor: '#F87171',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  rejectedBanner: {
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

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalText: { fontSize: 14, color: '#4B5563' },
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
  modalButtons: { flexDirection: 'row', marginTop: 20 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});

export default ClientAppointmentView;