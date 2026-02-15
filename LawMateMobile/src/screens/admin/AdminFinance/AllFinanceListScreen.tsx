import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../../config/theme";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AdminFinanceStackParamList } from "./AdminFinanceStack";
import ScreenWrapper from "../../../components/ScreenWrapper";

type Props = {
  navigation: NativeStackNavigationProp<
      AdminFinanceStackParamList,
      "FinanceList"
  >;
};

export interface FinanceItem {
  id: string;
  name: string;
  category: string;
  code: string;
  amount: string;
  status: "Pending" | "Paid Out";
  email?: string;
  phone?: string;
  serviceType?: string;
  duration?: string;
  sessionDate?: string;
  baseAmount?: string;
  platformFee?: string;
  totalAmount?: string;
}

const dummyData: FinanceItem[] = [
  {
    id: "1",
    name: "Maya Wickramasinghe",
    category: "Family Law",
    code: "PV-CODE/0001",
    amount: "LKR 25,000.00",
    status: "Pending",
    email: "maya@example.com",
    phone: "+94 771234567",
    serviceType: "Legal Consultation",
    duration: "1 Hour Session",
    sessionDate: "Jan 28, 2025",
    baseAmount: "LKR 15,000.00",
    platformFee: "LKR 150.00",
    totalAmount: "LKR 14,850.00",
  },
  {
    id: "2",
    name: "Nisal Silva",
    category: "Criminal Law",
    code: "PV-CODE/0002",
    amount: "LKR 35,000.00",
    status: "Paid Out",
    email: "nisal@example.com",
    phone: "+94 771234568",
    serviceType: "Legal Consultation",
    duration: "1 Hour Session",
    sessionDate: "Jan 25, 2025",
    baseAmount: "LKR 20,000.00",
    platformFee: "LKR 200.00",
    totalAmount: "LKR 19,800.00",
  },
  {
    id: "3",
    name: "Tharindu Lakshan",
    category: "Contract Law",
    code: "PV-CODE/0003",
    amount: "LKR 30,000.00",
    status: "Pending",
    email: "tharindu@example.com",
    phone: "+94 771234569",
    serviceType: "Legal Consultation",
    duration: "1 Hour Session",
    sessionDate: "Jan 29, 2025",
    baseAmount: "LKR 18,000.00",
    platformFee: "LKR 180.00",
    totalAmount: "LKR 17,820.00",
  },
  {
    id: "4",
    name: "Suresh Wickramasinghe",
    category: "Family Law",
    code: "PV-CODE/0004",
    amount: "LKR 28,000.00",
    status: "Pending",
    email: "suresh@example.com",
    phone: "+94 771234570",
    serviceType: "Legal Consultation",
    duration: "1 Hour Session",
    sessionDate: "Jan 30, 2025",
    baseAmount: "LKR 16,000.00",
    platformFee: "LKR 160.00",
    totalAmount: "LKR 15,840.00",
  },
];

function FinanceCard({
                       item,
                       onPress,
                     }: {
  item: FinanceItem;
  onPress: () => void;
}) {
  return (
      <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.code}>{item.code}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <Text style={styles.amount}>{item.amount}</Text>

          <View
              style={[
                styles.statusBadge,
                item.status === "Paid Out"
                    ? styles.successBadge
                    : styles.warningBadge,
              ]}
          >
            <Text
                style={[
                  styles.statusText,
                  item.status === "Paid Out"
                      ? styles.successText
                      : styles.warningText,
                ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  );
}

export default function FinanceListScreen({ navigation }: Props) {
  const [selectedTab, setSelectedTab] = useState<
      "All" | "Pending" | "Paid Out"
  >("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = dummyData.filter((item) => {
    const matchesTab =
        selectedTab === "All" ? true : item.status === selectedTab;
    const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const renderItem = ({ item }: { item: FinanceItem }) => (
      <FinanceCard
          item={item}
          onPress={() => navigation.navigate("FinanceView", { item })}
      />
  );

  return (
      <ScreenWrapper backgroundColor={colors.background} edges={["bottom"]}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Finance Management</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
                placeholder="Search here..."
                placeholderTextColor={colors.textSecondary}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Tabs */}
          <View style={styles.tabContainer}>
            {(["All", "Pending", "Paid Out"] as const).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    style={[
                      styles.tabButton,
                      selectedTab === tab && styles.activeTab,
                    ]}
                    onPress={() => setSelectedTab(tab)}
                    activeOpacity={0.7}
                >
                  <Text
                      style={[
                        styles.tabText,
                        selectedTab === tab && styles.activeTabText,
                      ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
            ))}
          </View>

          {/* List */}
          <FlatList
              data={filteredData}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No finance records found</Text>
                </View>
              }
          />
        </View>
      </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    height: "100%",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: 4,
  },

  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: borderRadius.md,
  },

  activeTab: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },

  activeTabText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },

  cardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  cardInfo: {
    flex: 1,
  },

  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },

  category: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  code: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },

  cardRight: {
    alignItems: "flex-end",
    marginLeft: spacing.md,
  },

  amount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    minWidth: 70,
    alignItems: "center",
  },

  successBadge: {
    backgroundColor: "#D1FAE5",
  },

  warningBadge: {
    backgroundColor: "#FEF3C7",
  },

  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },

  successText: {
    color: colors.success,
  },

  warningText: {
    color: colors.warning,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },

  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});