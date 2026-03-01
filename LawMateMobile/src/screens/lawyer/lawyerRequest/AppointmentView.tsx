import React,{useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';

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
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

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

const { textColor, bgColor } = statusStyles[appointment.status as keyof typeof statusStyles];

const handleCancelConfirm = () => {
    if (!cancelReason) return alert('Please select a reason');
    // TODO: Call your cancel API here
    console.log('Cancelling appointment with reason:', cancelReason);
    setModalVisible(false);
  };

const handleRejectConfirm = () => {
    if (!rejectReason) return alert('Please select a reason');
    console.log('Rejecting appointment with reason:', rejectReason);
    setRejectModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Appointment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* BOTTOM ACTION BUTTONS */}
      {isPending && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.rejectBtn} onPress={()=> setRejectModalVisible(true)}>
            <Text style={styles.rejectText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptBtn} onPress={()=> setAcceptModalVisible(true)}>
            <Text style={styles.acceptText}>ACCEPT</Text>
          </TouchableOpacity>
        </View>
      )}
      {isConfirmed && (
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.rejectText}>CANCEL APPOINTMENT</Text>
          </TouchableOpacity>
        </View>
      )}
      {isRejected && (
        <View>
          <Text style={styles.rejectedActions}>
            This Appointment has been Rejected due to schedule conflict
          </Text>
        </View>
      )}
      {isAccepted && (
        <View style={styles.bottomActions}>
          <Text style={styles.acceptedActions}>This Appointment has been Accepted. Waiting for the customer payment</Text>
          <TouchableOpacity style={styles.cancelBtn}  onPress={() => setModalVisible(true)}>
            <Text style={styles.rejectText}>CANCEL APPOINTMENT</Text>
          </TouchableOpacity>
        </View>
      )}
      {/* CANCEL APPOINTMENT MODAL */}
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
      {/* REJECT APPOINTMENT MODAL */}
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
      {/* ACCEPT MODAL */}
<Modal
  visible={acceptModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setAcceptModalVisible(false)}
>
  <View style={styles.acceptModalOverlay}>
    <View style={styles.acceptModalContainer}>
      {/* Close Icon */}
      <TouchableOpacity 
        style={styles.acceptModalClose} 
        onPress={() => setAcceptModalVisible(false)}
      >
        <Text style={{ fontSize: 20, fontWeight: '700' }}>×</Text>
      </TouchableOpacity>

      {/* Green check button */}
      <View style={styles.acceptModalContent}>
        <View style={styles.checkCircle}>
          <Text style={{ fontSize: 30, color: 'white' }}>✓</Text>
        </View>
        <Text style={styles.acceptModalText}>Request has been Accepted</Text>
      </View>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: '#fff',
    borderBottomWidth:2,
    borderColor:'#8A8A8A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  back: {
    fontSize: 30,
    color: '#111',
    paddingLeft: 15,
    paddingRight:15
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
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
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 13,
  },
  
  statusPending: { color: '#3B82F6' , backgroundColor:'#be1414' }, statusConfirmed: { color: '#10B981' }, statusRejected: { color: '#EF4444' },

  bottomActions: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectedActions:{
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor:'#F87171',
    borderWidth:2,
    paddingLeft:40,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
  },

  acceptedActions:{
    position: 'absolute',
    bottom: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderColor:'#3B82F6',
    borderWidth:2,
    paddingLeft:20,
    paddingRight:20,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom:50,
    textAlign:'center',
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelBtn:{
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 25,
    marginLeft: 10,
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
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  modalText: { fontSize: 14, color: '#4B5563' },
  pickerContainer: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, marginTop: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginHorizontal: 5 },
  acceptModalOverlay: {
  flex: 1,
  justifyContent: 'flex-start', // top of screen
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.3)',
  paddingTop: 50, // modal starts from top
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
  backgroundColor: '#10B981', // green
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