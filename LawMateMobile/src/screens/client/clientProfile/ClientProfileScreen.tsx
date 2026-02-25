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

const ClientProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data
    const profileData = {
        name: 'Sarah Johnson',
        userId: 'CLT 892456',
        memberSince: '2023',
        totalBookings: 12,
        activeBookings: 3,
        completedBookings: 9,
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
                    <Text style={styles.headerTitle}>Client Profile</Text>
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
                                <Ionicons name="person" size={60} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.profileName}>{profileData.name}</Text>
                    
                    <View style={styles.badgeContainer}>
                        <Ionicons name="person-circle-outline" size={14} color={colors.primary} />
                        <Text style={styles.userId}>{profileData.userId}</Text>
                    </View>

                    <View style={styles.memberBadge}>
                        <Text style={styles.memberText}>Member since {profileData.memberSince}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Bookings</Text>
                            <Text style={styles.statValue}>{profileData.totalBookings}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Active</Text>
                            <Text style={styles.statValue}>{profileData.activeBookings}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Completed</Text>
                            <Text style={styles.statValue}>{profileData.completedBookings}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="home-outline"
                        title="Personal Details"
                        onPress={() => navigation.navigate('ClientPersonalDetails')}
                    />
                    <MenuItem
                        icon="bookmark-outline"
                        title="My Bookings"
                        onPress={() => Alert.alert('My Bookings', 'TODO: Navigate to my bookings')}
                    />
                    <MenuItem
                        icon="heart-outline"
                        title="Favorite Lawyers"
                        onPress={() => Alert.alert('Favorites', 'TODO: Navigate to favorites')}
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
    userId: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    memberBadge: {
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    memberText: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
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

export default ClientProfileScreen;
