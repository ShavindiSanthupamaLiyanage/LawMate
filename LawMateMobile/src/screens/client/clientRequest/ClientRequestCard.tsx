import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types'; // adjust path if needed
import { useNavigation } from '@react-navigation/native';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CardRequest {
  bookingId: number;
  name: string;
  caseType: string;
  phone: string;
  date: string;
  time?: string;
  mode: string;
  status: 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected';
  reason?: string;
  profilePic?: string;
}

interface Props {
  request: CardRequest;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ClientAppointmentView'
>;

// ─── Component ───────────────────────────────────────────────────────────────

const ClientRequestCard: React.FC<Props> = ({ request }) => {
  const navigation = useNavigation<NavigationProp>();

  const statusMap: Record<CardRequest['status'], { text: string; style: any }> = {
    Pending:   { text: 'Pending',           style: styles.pendingBadge   },
    Confirmed: { text: 'Confirmed Request', style: styles.confirmedBadge },
    Accepted:  { text: 'Accepted Request',  style: styles.acceptedBadge  },
    Rejected:  { text: 'Rejected Request',  style: styles.rejectedBadge  },
  };

  const { text: badgeText, style: badgeStyle } = statusMap[request.status];

  const handlePress = () => {
    navigation.navigate('ClientAppointmentView', {
      bookingId: request.bookingId,
      request,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.card}>

        {/* ── Top Row ──────────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <Image
            source={{
              uri: request.profilePic ?? 'https://i.pravatar.cc/150?img=1',
            }}
            style={styles.profilePic}
          />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{request.name}</Text>
            <Text style={styles.time}>2 minutes ago</Text>
          </View>

          <Text style={[styles.badge, badgeStyle]}>{badgeText}</Text>
        </View>

        {/* ── Detail Rows ───────────────────────────────────────────────── */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Case</Text>
            <Text style={styles.value}>{request.caseType}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{request.phone}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date & Time</Text>
            <Text style={styles.value}>
              {request.date}
              {request.time ? `  ${request.time}` : ''}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Mode</Text>
            <Text style={styles.value}>{request.mode}</Text>
          </View>
        </View>

        {/* ── Rejection Reason ──────────────────────────────────────────── */}
        {request.status === 'Rejected' && request.reason ? (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Reason</Text>
            <Text style={styles.value}>{request.reason}</Text>
          </View>
        ) : null}

      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    marginBottom: 10,
  },

  // badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#E8F0FF',
    color: '#3d4b64',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 10,
    borderRadius: 6,
  },
  confirmedBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 10,
    borderRadius: 6,
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 10,
    borderRadius: 6,
  },
  acceptedBadge: {
    backgroundColor: '#e2fafe',
    color: '#2d1585',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 10,
    borderRadius: 6,
  },

  // details
  details: {
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});

export default ClientRequestCard;