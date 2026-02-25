import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    iconColor?: string;
    isLogout?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, iconColor, isLogout }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuLeft}>
            <View style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}>
                <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
            </View>
            <Text style={[styles.menuTitle, isLogout && styles.logoutText]}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
);

const AdminProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data
    const profileData = {
        name: 'Admin User',
        adminId: 'ADM 001234',
        role: 'Super Admin',
        totalUsers: 1250,
        pendingVerifications: 18,
        totalRevenue: '₹2.5M',
        profileImage: null, // Set to image URL when available
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    onPress: () => {
                        // TODO: Call logout API and clear auth tokens
                        navigation.navigate('Login');
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false }
        );
    };

    const handleEditProfile = () => {
        // TODO: Navigate to edit profile screen
        Alert.alert('Edit Profile', 'Navigate to edit profile screen');
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header with Gradient */}
                <LinearGradient
                    colors={[
                        'rgba(24,114,234,1)',
                        'rgba(54,87,208,1)',
                        'rgba(77,55,200,1)',
                        'rgba(99,71,253,1)',
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Admin Profile</Text>
                    <View style={styles.backButton} />
                </LinearGradient>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.curvedBackground} />
                    
                    <View style={styles.profileImageContainer}>
                        {profileData.profileImage ? (
                            <Image
                                source={{ uri: profileData.profileImage }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Ionicons name="shield-checkmark" size={60} color={colors.primary} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.profileName}>{profileData.name}</Text>
                    
                    <View style={styles.badgeContainer}>
                        <Ionicons name="shield-outline" size={14} color={colors.primary} />
                        <Text style={styles.adminId}>{profileData.adminId}</Text>
                    </View>

                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{profileData.role}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Users</Text>
                            <Text style={styles.statValue}>{profileData.totalUsers}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Pending</Text>
                            <Text style={styles.statValue}>{profileData.pendingVerifications}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Revenue</Text>
                            <Text style={styles.statValue}>{profileData.totalRevenue}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="home-outline"
                        title="Personal Details"
                        onPress={() => navigation.navigate('AdminPersonalDetails')}
                    />
                    <MenuItem
                        icon="people-outline"
                        title="User Management"
                        onPress={() => Alert.alert('User Management', 'TODO: Navigate to user management')}
                    />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Verification Requests"
                        onPress={() => Alert.alert('Verification', 'TODO: Navigate to verification requests')}
                    />
                    <MenuItem
                        icon="bar-chart-outline"
                        title="Analytics & Reports"
                        onPress={() => Alert.alert('Analytics', 'TODO: Navigate to analytics')}
                    />
                    <MenuItem
                        icon="settings-outline"
                        title="Settings & Preferences"
                        onPress={() => navigation.navigate('SettingsPreferences')}
                    />
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help"
                        onPress={() => navigation.navigate('Help')}
                    />
                    <MenuItem
                        icon="log-out-outline"
                        title="Log out"
                        onPress={handleLogout}
                        iconColor={colors.error}
                        isLogout
                    />
                </View>
            </ScrollView>

            {/* Edit Profile Button */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditProfile}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#1872EA', '#6347FD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.editButtonGradient}
                    >
                        <Text style={styles.editButtonText}>EDIT PROFILE</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: colors.white,
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    profileCard: {
        backgroundColor: colors.white,
        marginTop: 10,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 80,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    curvedBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    profileImageContainer: {
        marginTop: -100,
        marginBottom: spacing.md,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.white,
    },
    defaultProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.background,
        borderWidth: 4,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
    },
    adminId: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    roleBadge: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    roleText: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeight.bold,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: borderRadius.lg,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: colors.border,
        alignSelf: 'center',
    },
    menuContainer: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutIconContainer: {
        backgroundColor: '#FFEBEE',
    },
    menuTitle: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    logoutText: {
        color: colors.error,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    editButton: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    editButtonGradient: {
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        color: colors.white,
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        letterSpacing: 0.5,
    },
});

export default AdminProfileScreen;
