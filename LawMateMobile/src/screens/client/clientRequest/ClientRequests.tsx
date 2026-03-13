import React, { useState } from 'react';
import { FlatList } from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import ClientRequestTabs from './ClientRequestTabs';
import ClientRequestCard from './ClientRequestCard';
import {useNavigation} from "@react-navigation/native";

type Request = {
  id: string;
  name: string;
  caseType: string;
  phone: string;
  date: string;
  time?: string;
  mode: string;
  status: 'Pending' | 'Confirmed' | 'Rejected' | 'Accepted';
  reason?: string;
  profilePic?: string;
};

const REQUEST_DATA: Request[] = [
  { id: '1', name: 'Gihan Perera', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending', profilePic: 'https://i.pravatar.cc/150?img=3' },
  { id: '2', name: 'Gihan Perera', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending', profilePic: 'https://i.pravatar.cc/150?img=4' },
  { id: '3', name: 'Gihan Perera', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending', profilePic: 'https://i.pravatar.cc/150?img=5' },
  { id: '4', name: 'Gihan Perera', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Pending' },
  { id: '5', name: 'Gihan Perera', caseType: 'Criminal Law', phone: '+94 77 123 4567', date: '12 Nov 2025', mode: 'Online', status: 'Confirmed', profilePic: 'https://i.pravatar.cc/150?img=28' },
  { id: '6', name: 'Gihan Perera', caseType: 'Property Law', phone: '+94 77 123 4567', date: '10 Nov 2025', time: '10.00 PM', mode: 'Online', status: 'Accepted', profilePic: 'https://i.pravatar.cc/150?img=5' },
  { id: '7', name: 'Gihan Perera', caseType: 'Criminal Law', phone: '+94 77 123 4567', date: '12 Nov 2025', mode: 'Online', status: 'Confirmed' },
  { id: '8', name: 'Gihan Perera', caseType: 'Family Law', phone: '+94 77 123 4567', date: '15 Nov 2025', mode: 'Online', status: 'Rejected', reason: 'Schedule Conflict', profilePic: 'https://i.pravatar.cc/150?img=70' },
  { id: '9', name: 'Gihan Perera', caseType: 'Family Law', phone: '+94 77 123 4567', date: '15 Nov 2025', mode: 'Online', status: 'Rejected', reason: 'Schedule Conflict' },
];

const ClientRequests: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Confirmed' | 'Accepted' | 'Rejected'>('Pending');

  const filteredRequests = REQUEST_DATA.filter(req => {
    if (activeTab === 'Confirmed') {
      return req.status === 'Confirmed' || req.status === 'Accepted';
    }
    return req.status === activeTab;
  });

  const navigation = useNavigation<any>();

  return (
    <ClientLayout
        title="Requests"
        disableScroll
        onProfilePress={() => navigation.getParent()?.navigate("ClientProfile")}
    >
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ClientRequestCard request={item} />}
        ListHeaderComponent={
          <ClientRequestTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      />
    </ClientLayout>
  );
};

export default ClientRequests;