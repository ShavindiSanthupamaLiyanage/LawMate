import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import LawyerLayout from '../../../components/LawyerLayout';
import RequestTabs, { TabType } from './RequestTabs';
import RequestCard from './RequestCard';
import { useNavigation } from '@react-navigation/native';
import { bookingService, GetAppointmentDto } from '../../../services/bookingService';
import { StorageService } from '../../../utils/storage';

// ─── helpers ─────────────────────────────────────────────────────────────────

function mapStatus(
  apiStatus: string,
): 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected' {
  switch (apiStatus) {
    case 'Accepted':
      return 'Accepted';
    case 'Confirmed':
    case 'Verified':
      return 'Confirmed';
    case 'Rejected':
    case 'Cancelled':
    case 'Suspended':
      return 'Rejected';
    default:
      return 'Pending';
  }
}

function toCardRequest(appt: GetAppointmentDto) {
  const dateObj = new Date(appt.dateTime);
  const dateStr = dateObj.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  let timeStr: string | undefined;
  try {
    timeStr = new Date(appt.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    timeStr = undefined;
  }

  return {
    bookingId:  appt.bookingId,
    name:       appt.clientName,
    caseType:   appt.caseType,
    phone:      appt.contactNumber ?? '',
    date:       dateStr,
    time:       timeStr,
    mode:       appt.mode,
    status:     mapStatus(appt.status),
    reason:     appt.rejectionReason,
    profilePic: undefined as string | undefined,
  };
}

// ─── component ───────────────────────────────────────────────────────────────

const LawyerRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Pending');
  const [appointments, setAppointments] = useState<GetAppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<any>();

  const fetchAppointments = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // Retrieve the lawyer's userId from local storage (stored at login)
      const lawyerId = await StorageService.getUserId();
      if (!lawyerId) throw new Error('Lawyer identity not found. Please log in again.');

      const data = await bookingService.getLawyerAppointments(lawyerId);
      setAppointments(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // ── filter by active tab ───────────────────────────────────────────────────
  const filteredRequests = appointments.filter(appt => {
    const s = appt.status;
    if (activeTab === 'Pending')
      return s === 'Pending';
    if (activeTab === 'Confirmed')
      return s === 'Confirmed' || s === 'Accepted' || s === 'Verified';
    if (activeTab === 'Rejected')
      return s === 'Rejected' || s === 'Cancelled' || s === 'Suspended';
    return false;
  });

  // ── loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LawyerLayout
        title="Requests"
        disableScroll
        onProfilePress={() => navigation.getParent()?.navigate('LawyerProfile')}
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading requests…</Text>
        </View>
      </LawyerLayout>
    );
  }

  // ── error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <LawyerLayout
        title="Requests"
        disableScroll
        onProfilePress={() => navigation.getParent()?.navigate('LawyerProfile')}
      >
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => fetchAppointments()}>
            Tap to retry
          </Text>
        </View>
      </LawyerLayout>
    );
  }

  // ── main render ───────────────────────────────────────────────────────────
  return (
    <LawyerLayout
      title="Requests"
      disableScroll
      onProfilePress={() => navigation.getParent()?.navigate('LawyerProfile')}
    >
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.bookingId.toString()}
        renderItem={({ item }) => (
          <RequestCard request={toCardRequest(item)} />
        )}
        ListHeaderComponent={
          <RequestTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No {activeTab.toLowerCase()} requests
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAppointments(true)}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </LawyerLayout>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
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
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  retryText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default LawyerRequests;