import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, fontWeight } from '../../config/theme';

interface Props {
  request: {
    name: string;
    caseType: string;
    phone: string;
    date: string;
    time?: string;
    mode: string;
    status: 'Pending' | 'Confirmed' | 'Rejected';
    reason?: string;
    profilePic?: string; // optional
  };
}

const RequestCard: React.FC<Props> = ({ request }) => {
  // Map status to display text & badge style
  const statusMap: Record<
    Props['request']['status'],
    { text: string; style: any }
  > = {
    Pending: { text: 'Pending', style: styles.pendingBadge },
    Confirmed: { text: 'Confirmed Request', style: styles.confirmedBadge },
    Rejected: { text: 'Rejected Request', style: styles.rejectedBadge },
  };

  const { text: badgeText, style: badgeStyle } = statusMap[request.status];

return (
  <View style={styles.card}>
    {/* Top Row */}
    <View style={styles.headerRow}>
      <Image
        source={{ uri: request.profilePic || 'https://i.pravatar.cc/150?img=1' }}
        style={styles.profilePic}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{request.name}</Text>
        <Text style={styles.time}>2 minutes ago</Text>
      </View>

      <Text style={[styles.badge, badgeStyle]}>{badgeText}</Text>
    </View>

    {/* Details */}
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
          {request.date} {request.time}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Mode</Text>
        <Text style={styles.value}>{request.mode}</Text>
      </View>
    </View>

    {request.status === 'Pending' && (
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.rejectBtn}>
          <Text style={styles.rejectText}>REJECT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptText}>ACCEPT</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);
};

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
    marginBottom:10
  },

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
    paddingLeft:20,
    paddingRight:20,
    paddingTop:6,
    paddingBottom:6,
    fontSize:10,
    borderRadius:6
  },

  confirmedBadge: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    paddingLeft:20,
    paddingRight:20,
    paddingTop:6,
    paddingBottom:6,
    fontSize:10,
    borderRadius:6
  },

  rejectedBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    paddingLeft:20,
    paddingRight:20,
    paddingTop:6,
    paddingBottom:6,
    fontSize:10,
    borderRadius:6
  },

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
    marginBottom:10,
  },

  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  rejectBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F87171',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },

  acceptBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },

  rejectText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  acceptText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default RequestCard;