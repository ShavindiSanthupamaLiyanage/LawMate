import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';
import {FinanceDetailsDto} from "../../../interfaces/adminFinance.interface";
import {AdminFinanceService} from "../../../services/adminFinanceService";
import {useNavigation} from "@react-navigation/native";
import {AdminTabParamList} from "../../../types";

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
  bookingId?: number;
}

function FinanceCard({
                       item,
                       onPress,
                     }: {
  item: FinanceItem;
  onPress: () => void;
}) {
  return (
      <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
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
  const [financeData, setFinanceData] = useState<FinanceDetailsDto[]>([]);
  // @ts-ignore
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const parentNavigation = useNavigation<NativeStackNavigationProp<AdminTabParamList>>();

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AdminFinanceService.getAllFinanceDetails();
        setFinanceData(data);
      } catch (error) {
        console.error('Error fetching finance data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = financeData
      .filter(item => selectedTab === 'All' ||
          (selectedTab === 'Paid Out' ? item.isPaid : !item.isPaid))
      .filter(item =>
          item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.transactionId?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => ({
        id: item.bookingId.toString(),
        name: item.fullName,
        bookingId: item.bookingId,
        slipNumber: item.slipNumber,
        category: item.nic,
        code: item.transactionId ?? '-',
        amount: `LKR ${item.amount.toLocaleString()}`,      // total paid by client
        status: item.isPaid ? 'Paid Out' : 'Pending',
        email: item.email,
        phone: item.contactNumber,                           // ← add this
        baseAmount: `LKR ${item.amount.toLocaleString()}`,   // amount = base amount
        platformFee: `LKR ${item.platformCommission.toLocaleString()}`,
        totalAmount: `LKR ${item.lawyerFee.toLocaleString()}`, // lawyerFee = total pay & paid amount
        duration: item.duration ? `${item.duration}` : undefined,
        sessionDate: formatDateTime(item.scheduledDateTime),
      } as FinanceItem));

  const renderItem = ({ item }: { item: FinanceItem }) => (
      <FinanceCard
          item={item}
          onPress={() => navigation.navigate("FinanceView", { item })}
      />
  );

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleClear = () => {
    console.log('Search cleared');
  };

  return (
      <AdminLayout
          title="Finance Management"
          disableScroll
          onProfilePress={() => parentNavigation.navigate('AdminProfile')}
      >
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search name..."
                onSearch={handleSearch}
                onClear={handleClear}
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
      </AdminLayout>
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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