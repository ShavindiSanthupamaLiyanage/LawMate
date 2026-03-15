import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
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

type ClientAppointmentViewRouteProp = RouteProp<
  RootStackParamList,
  'ClientAppointmentView'
>;

type ClientAppointmentViewNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'ClientAppointmentView'
  >;

const ClientAppointmentView: React.FC = () => {
  const navigation =
    useNavigation<ClientAppointmentViewNavigationProp>();
  const route = useRoute<ClientAppointmentViewRouteProp>();

  const appointment = route.params?.request;

  const [modalVisible, setModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
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
  const isAccepted = appointment.status === 'Accepted';

  const statusStyles = {
    Pending: { textColor: '#3B82F6', bgColor: '#E8F0FE' },
    Confirmed: { textColor: '#10B981', bgColor: '#D1FAE5' },
    Accepted: { textColor: '#7C3AED', bgColor: '#EDE9FE' },
    Rejected: { textColor: '#EF4444', bgColor: '#FEE2E2' },
  };

  const { textColor, bgColor } =
    statusStyles[
      appointment.status as keyof typeof statusStyles
    ];

  const handleCancel = () => {
    if (!cancelReason) return alert('Please select a reason');

    setModalVisible(false);
    setToastVisible(true);
  };

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
            <View style={styles.card}>
              <Text style={styles.cardTitle}>
                Appointment Info
              </Text>

              <InfoRow label="Lawyer" value={appointment.lawyerName} />
              <InfoRow label="Date" value={appointment.date} />
              <InfoRow label="Time" value={appointment.time} />
              <InfoRow label="Mode" value={appointment.mode} />
              <InfoRow label="Location" value={appointment.location} />

              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: bgColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: textColor },
                    ]}
                  >
                    {appointment.status}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* ACTION BUTTONS */}
          {isPending && (
            <View style={styles.bottomActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(true)} > 
              <Text style={styles.rejectText}>CANCEL APPOINTMENT</Text> 
              </TouchableOpacity>
            </View>
          )}

          {isConfirmed && (
            <View style={styles.bottomActions}>
              <Button
                title="JOIN MEETING"
                onPress={() => null}
                variant="primary"
              />
              <Button
                title="CANCEL APPOINTMENT"
                onPress={() => setModalVisible(true)}
                variant="transparent"
              />
            </View>
          )}

          {isAccepted && (
            <View style={styles.bottomActions}>
              <Button
                title="UPLOAD PAYMENT SLIP"
                onPress={() =>
                  navigation.navigate(
                    'PaymentSlipScreen',
                    { request: appointment }
                  )
                }
                variant="primary"
              />
              <Button
                title="CANCEL APPOINTMENT"
                onPress={() => setModalVisible(true)}
                variant="transparent"
              />
            </View>
          )}
        </View>

        {/* CANCEL MODAL */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>
                Cancel Appointment
              </Text>

              <Text style={styles.modalText}>
                Please select a reason for cancellation:
              </Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cancelReason}
                  onValueChange={(value) =>
                    setCancelReason(value)
                  }
                >
                  <Picker.Item label="Select reason" value="" />
                  <Picker.Item
                    label="Personal emergency"
                    value="Personal emergency"
                  />
                  <Picker.Item
                    label="Schedule conflict"
                    value="Schedule conflict"
                  />
                  <Picker.Item
                    label="Other"
                    value="Other"
                  />
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <Pressable
                  style={[
                    styles.modalBtn,
                    { backgroundColor: '#E5E7EB' },
                  ]}
                  onPress={() =>
                    setModalVisible(false)
                  }
                >
                  <Text style={{ fontWeight: '600' }}>
                    Back
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalBtn,
                    { backgroundColor: '#F87171' },
                  ]}
                  onPress={handleCancel}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: '600',
                    }}
                  >
                    Confirm
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ClientLayout>

      <Toast
        visible={toastVisible}
        message="Appointment Cancelled Successfully"
        type="success"
        duration={3000}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
};

export default ClientAppointmentView;

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
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
  bottomActions: {
    padding: 16,
    gap: 12,
  },
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
    marginTop: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelBtn: { 
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
    paddingBottom:20,
    paddingTop:20 
  },
  rejectText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 14, 
  },
});