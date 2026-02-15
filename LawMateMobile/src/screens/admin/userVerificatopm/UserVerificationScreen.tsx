import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import AdminLayout from '../../../components/AdminLayout';
import SearchBar from '../../../components/SearchBar';

interface User {
    id: string;
    name: string;
    phone: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedDate: string;
    avatar?: string;
}

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

const UserVerificationScreen: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // Sample data
    const users: User[] = [
        {
            id: '1',
            name: 'Maya Wickramage',
            phone: '94 76 2617 0345',
            status: 'pending',
            approvedDate: 'Approved: 5 days ago',
        },
        {
            id: '2',
            name: 'Tharindu Ransika',
            phone: '94 76 2617 0346',
            status: 'pending',
            approvedDate: 'Approved: 2 days ago',
        },
        {
            id: '3',
            name: 'John Wickramage',
            phone: '94 76 2617 0347',
            status: 'approved',
            approvedDate: 'Approved: 5 days ago',
        },
        {
            id: '4',
            name: 'Namal Kumar',
            phone: '94 76 2617 0348',
            status: 'rejected',
            approvedDate: 'Approved: 5 days ago',
        },
        {
            id: '5',
            name: 'Amal Perera',
            phone: '94 76 2617 0349',
            status: 'pending',
            approvedDate: 'Approved: 5 days ago',
        },
    ];

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'ALL' },
        { key: 'pending', label: 'Pending' },
        { key: 'approved', label: 'Approved' },
        { key: 'rejected', label: 'Rejected' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#FEF3C7';
            case 'approved':
                return '#D1FAE5';
            case 'rejected':
                return '#FEE2E2';
            default:
                return colors.borderLight;
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'pending':
                return '#F59E0B';
            case 'approved':
                return '#10B981';
            case 'rejected':
                return '#EF4444';
            default:
                return colors.textSecondary;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.phone.includes(searchQuery);
        const matchesFilter = activeFilter === 'all' || user.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleSearch = () => {
        console.log('Searching for:', searchQuery);
    };

    const handleClear = () => {
        console.log('Search cleared');
    };

    return (
        <AdminLayout userName="Kavindu Gimsara">
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
                <View style={styles.filtersContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersScrollContent}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterButton,
                                    activeFilter === filter.key && styles.activeFilterButton
                                ]}
                                onPress={() => setActiveFilter(filter.key)}
                            >
                                <Text style={[
                                    styles.filterText,
                                    activeFilter === filter.key && styles.activeFilterText
                                ]}>
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Users List */}
                <ScrollView
                    style={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                >
                    {filteredUsers.map((user) => (
                        <View key={user.id} style={styles.userCard}>
                            {/* Avatar */}
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {user.name.charAt(0)}
                                </Text>
                            </View>

                            {/* User Info */}
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user.name}</Text>
                                <Text style={styles.userPhone}>{user.phone}</Text>
                            </View>

                            {/* Status and Date */}
                            <View style={styles.statusContainer}>
                                <Text style={styles.approvedDate}>{user.approvedDate}</Text>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(user.status) }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: getStatusTextColor(user.status) }
                                    ]}>
                                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    {filteredUsers.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No users found</Text>
                        </View>
                    )}

                    {/* Bottom Spacer */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    searchContainer: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    filtersContainer: {
        paddingBottom: spacing.sm,
    },
    filtersScrollContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    filterButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeFilterButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    activeFilterText: {
        color: colors.white,
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        paddingTop: spacing.sm,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.white,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: 4,
    },
    userPhone: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    approvedDate: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginBottom: 6,
    },
    statusBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: borderRadius.md,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default UserVerificationScreen;