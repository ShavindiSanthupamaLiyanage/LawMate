import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import LawyerLayout from '../../../components/LawyerLayout';
import Toast from '../../../components/Toast';

type AppointmentViewRouteProp = RouteProp<
  RootStackParamList,
  'AppointmentView'
>;

const AppointmentView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AppointmentViewRouteProp>();
  const appointment = route.params?.request;

  const [modalVisible, setModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  if (!appointment) {
    return (
      <View style={styles.center}>
        <Text>No appointment data found.</Text>
      </View>
    );
  }

  const isPending = appointment.status === 'Pending';
  const isConfirmed = appointment.status === 'Confirmed';
  const isRejected = appointment.status === 'Rejected';
  const isAccepted = appointment.status === 'Accepted';

  const statusStyles = {
    Pending: { textColor: '#3B82F6', bgColor: '#E8F0FE' },
    Confirmed: { textColor: '#10B981', bgColor: '#D1FAE5' },
    Rejected: { textColor: '#EF4444', bgColor: '#FEE2E2' },
    Accepted: { textColor: '#2d1585', bgColor: '#e2fafe' },
  };

  const { textColor, bgColor } =
    statusStyles[appointment.status as keyof typeof statusStyles];

  const handleCancelConfirm = () => {
    if (!cancelReason) return alert('Please select a reason');
    console.log('Cancelling appointment with reason:', cancelReason);
    setModalVisible(false);
  };

  const handleRejectConfirm = () => {
    if (!rejectReason) return alert('Please select a reason');
    console.log('Rejecting appointment with reason:', rejectReason);
    setRejectModalVisible(false);
  };

  return (
    <>
    <LawyerLayout
      title="View Appointment"
      showBackButton
      hideRightSection
      onBackPress={() => navigation.goBack()}
    >
      <StatusBar barStyle="dark-content" />

      {/* Full height wrapper */}
      <View style={styles.wrapper}>

        {/* Scrollable cards — flex:1 so it fills all space above action bar */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* CLIENT INFO */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client Information</Text>
            <InfoRow label="Name" value={appointment.name} />
            <InfoRow label="Email" value={appointment.email} />
            <InfoRow label="Phone" value={appointment.phone} />
            <InfoRow label="NIC" value={appointment.nic} />
            <InfoRow label="Address" value={appointment.address} />
          </View>

          {/* CASE DETAILS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Case Details</Text>
            <InfoRow label="Case Type" value={appointment.caseType} />
            <InfoRow label="Case Note" value={appointment.caseNote || ''} />
            <InfoRow label="Created By" value={appointment.createdBy} />
          </View>

          {/* APPOINTMENT INFO */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Appointment Info</Text>
            <InfoRow label="Date" value={appointment.date} />
            <InfoRow label="Time" value={appointment.time} />
            <InfoRow label="Mode" value={appointment.mode} />
            <InfoRow label="Location" value={appointment.location} />
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
                <Text style={[styles.statusText, { color: textColor }]}>
                  {appointment.status}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* ── STICKY ACTION BAR — always fixed above bottom navbar ── */}
        {isPending && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setRejectModalVisible(true)}
            >
              <Text style={styles.rejectText}>REJECT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => {
              console.log('Appointment Accepted');
              setToastVisible(true);
            }}
            >
              <Text style={styles.acceptText}>ACCEPT</Text>
            </TouchableOpacity>
          </View>
        )}

        {isConfirmed && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.rejectText}>CANCEL APPOINTMENT</Text>
            </TouchableOpacity>
          </View>
        )}

        {isRejected && (
          <View style={styles.rejectedActions}>
            <Text style={styles.rejectedText}>
              This Appointment has been Rejected due to schedule conflict
            </Text>
          </View>
        )}

        {isAccepted && (
          <View style={styles.acceptedWrapper}>
            <Text style={styles.acceptedInfoText}>
              This Appointment has been Accepted. Waiting for the customer payment.
            </Text>
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.rejectText}>CANCEL APPOINTMENT</Text>
              </TouchableOpacity>
            </View>
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
              Are you sure you want to cancel this appointment? This will notify the client.
            </Text>
            <Text style={[styles.modalText, { marginTop: 10 }]}>
              Please select the cancel reason:
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cancelReason}
                onValueChange={(itemValue) => setCancelReason(itemValue)}
              >
                <Picker.Item label="Select reason" value="" />
                <Picker.Item label="Client unavailable" value="Client unavailable" />
                <Picker.Item label="Schedule conflict" value="Schedule conflict" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]}
                onPress={() => setModalVisible(false)}
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

      {/* ── REJECT MODAL ── */}
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
            <Text style={[styles.modalText, { marginTop: 10 }]}>
              Please select the reject reason:
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={rejectReason}
                onValueChange={(itemValue) => setRejectReason(itemValue)}
              >
                <Picker.Item label="Select reason" value="" />
                <Picker.Item label="Client unavailable" value="Client unavailable" />
                <Picker.Item label="Schedule conflict" value="Schedule conflict" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: '#E5E7EB' }]}
                onPress={() => setRejectModalVisible(false)}
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
        message="Appointment Accepted Successfully!"
        type="success"
        duration={3000}
        onDismiss={() => setToastVisible(false)}
      />
      </>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({

  /* ── Core layout ── */
  wrapper: {
    flex: 1,                      // fills entire LawyerLayout content area
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,                      // takes all space above the action bar
  },
  scrollContent: {
    paddingBottom: 24,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Cards ── */
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

  /* ── Status badge ── */
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 13,
  },

  /* ── Action bar — never scrolls, always at bottom ── */
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingLeft: 10,
    borderColor: '#E5E7EB',
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
  rejectText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  /* ── Rejected banner ── */
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

  /* ── Accepted banner + cancel ── */
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
    borderWidth:2,
    borderColor:'#3B82F6',
    marginLeft:10,
    marginRight:10,
    marginBottom:15,
    borderRadius:15
  },

  /* ── Modals ── */
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 10,
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

  /* ── Accept modal ── */
  acceptModalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: 50,
  },
  acceptModalContainer: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  acceptModalClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  acceptModalContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  checkCircle: {
    backgroundColor: '#10B981',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  acceptModalText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#111',
  },
});

export default AppointmentView;