import React, { useState } from 'react';
import { FlatList } from 'react-native';
import LawyerLayout from '../../components/LawyerLayout';
import RequestTabs from './RequestTabs';
import RequestCard from './RequestCard';

type Request = {
  id: string;
  name: string;
  caseType: string;
  phone: string;
  date: string;
  time?: string;
  mode: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  reason?: string;
};

const REQUEST_DATA: Request[] = [
  { id: '1', name: 'Alex Morter', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending' },
  { id: '2', name: 'Alex Morter', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending' },
  { id: '3', name: 'Alex Morter', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending' },
  { id: '4', name: 'Alex Morter', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending' },
  { id: '5', name: 'Alex Morter', caseType: 'Criminal Law', phone: '+94 77 123 4567', date: '12 Nov 2025', mode: 'Online', status: 'Confirmed' },
  { id: '6', name: 'Alex Morter', caseType: 'Family Law', phone: '+94 77 123 4567', date: '15 Nov 2025', mode: 'Online', status: 'Rejected', reason: 'Schedule Conflict' },
];

const LawyerRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Confirmed' | 'Rejected'>('Pending');

  const filteredRequests = REQUEST_DATA.filter(req => req.status === activeTab);

  // Dynamic title based on active tab
  const navbarTitle = "Requests";

  return (
    <LawyerLayout title={navbarTitle}>
      <RequestTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <RequestCard request={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </LawyerLayout>
  );
};

export default LawyerRequests;