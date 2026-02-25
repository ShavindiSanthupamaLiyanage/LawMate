import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import BottomNavBar from '../../components/BottomNavBar';

type AppointmentViewRouteProp = RouteProp<
  RootStackParamList,
  'AppointmentView'
>;

const AppointmentView: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<AppointmentViewRouteProp>();
  const appointment = route.params?.request;

  if (!appointment) {
    return (
      <View style={styles.center}>
        <Text>No appointment data found.</Text>
      </View>
    );
  }

  const isPending = appointment.status === 'Pending';
  const statusStyles = {
  Pending: { textColor: '#3B82F6', bgColor: '#E8F0FE' },
  Confirmed: { textColor: '#10B981', bgColor: '#D1FAE5' },
  Rejected: { textColor: '#EF4444', bgColor: '#FEE2E2' },
};

const { textColor, bgColor } = statusStyles[appointment.status as keyof typeof statusStyles];

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
          <TouchableOpacity style={styles.rejectBtn}>
            <Text style={styles.rejectText}>REJECT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptBtn}>
            <Text style={styles.acceptText}>ACCEPT</Text>
          </TouchableOpacity>
        </View>
      )}
      <BottomNavBar/>
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

  rejectBtn: {
    flex: 1,
    backgroundColor: '#F87171',
    paddingVertical: 14,
    borderRadius: 25,
    marginRight: 10,
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
});

export default AppointmentView;