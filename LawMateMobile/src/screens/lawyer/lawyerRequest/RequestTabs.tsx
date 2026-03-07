import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TabType = 'Pending' | 'Confirmed' | 'Accepted' | 'Rejected';
interface Props {
  activeTab: TabType;
  setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
}

const ClientRequestTabs: React.FC<Props> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs: TabType[] = ['Pending', 'Confirmed', 'Rejected'];

  return (
    <View style={styles.container}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ClientRequestTabs;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 4,
    marginTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '700',
  },
});