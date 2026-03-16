import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert as RNAlert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import LawyerLayout from '../../../components/LawyerLayout';
import Alert from "../../../components/Alert";
import {AuthService} from "../../../services/authService";

interface MenuItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    iconColor?: string;
    isLogout?: boolean;
    hasSubItems?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
}

interface SubItemProps {
    title: string;
    onPress: () => void;
}

const SubMenuItem: React.FC<SubItemProps> = ({ title, onPress }) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.subMenuLeft}>
            <View style={styles.dotIndicator} />
            <Text style={styles.subMenuTitle}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
);

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, onPress, iconColor, isLogout, hasSubItems, isExpanded, onToggle }) => (
    <>
        <TouchableOpacity 
            style={styles.menuItem} 
            onPress={hasSubItems ? onToggle : onPress} 
            activeOpacity={0.7}
        >
            <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, isLogout && styles.logoutIconContainer]}>
                    <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
                </View>
                <Text style={[styles.menuTitle, isLogout && styles.logoutText]}>{title}</Text>
            </View>
            {hasSubItems ? (
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    </>
);

const LawyerProfileScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);

    // TODO: Replace with actual API data
    const profileData = {
        name: 'Kavindi Gimsara',
        barCouncilId: 'BAR 543238v',
        specialization: 'Criminal Law',
        rating: 4.8,
        reviewCount: 156,
        totalCases: 45,
        clients: 24,
        yearsExp: 8,
        profileImage: null, // Set to image URL when available
    };

    const toggleExpand = (key: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleLogout = () => {
        setShowLogoutAlert(true);
    };

    const confirmLogout = async () => {
        setShowLogoutAlert(false);
        await AuthService.logout();
        navigation.navigate('Welcome'); // or whatever your welcome screen is named
    };
    const handleEditProfile = () => {
        // Navigate to personal details screen for editing
        navigation.navigate('LawyerPersonalDetails');
    };

    return (
        <LawyerLayout
            title="Lawyer Profile"
            showBackButton
            onBackPress={() => navigation.goBack()}
            hideRightSection
            disableScroll
        >
            <View style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >

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
                        <Ionicons name="bookmark" size={14} color={colors.primary} />
                        <Text style={styles.barCouncilId}>{profileData.barCouncilId}</Text>
                    </View>

                    <View style={styles.specializationBadge}>
                        <Text style={styles.specializationText}>{profileData.specialization}</Text>
                    </View>

                    {/* Rating */}
                    {/* <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, index) => (
                            <Ionicons
                                key={index}
                                name={index < Math.floor(profileData.rating) ? 'star' : 'star-outline'}
                                size={16}
                                color="#FFB800"
                            />
                        ))}
                        <Text style={styles.ratingText}>
                            {profileData.rating} ({profileData.reviewCount} reviews)
                        </Text>
                    </View> */}

                    {/* Stats */}
                    {/* <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Cases</Text>
                            <Text style={styles.statValue}>{profileData.totalCases}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Clients</Text>
                            <Text style={styles.statValue}>{profileData.clients}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Years Exp</Text>
                            <Text style={styles.statValue}>{String(profileData.yearsExp).padStart(2, '0')}</Text>
                        </View>
                    </View> */}
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    <MenuItem
                        icon="home-outline"
                        title="Personal Details"
                        onPress={() => navigation.navigate('LawyerPersonalDetails')}
                    />
                    
                    <MenuItem
                        icon="briefcase-outline"
                        title="Professional Details"
                        onPress={() => setExpandedItems(prev => ({ ...prev, professional: !prev.professional }))}
                        hasSubItems
                        isExpanded={expandedItems.professional}
                        onToggle={() => toggleExpand('professional')}
                    />
                    {expandedItems.professional && (
                        <>
                            <SubMenuItem
                                title="Qualifications"
                                onPress={() => navigation.navigate('LawyerProfessionalDetails')}
                            />
                            <SubMenuItem
                                title="Specializations"
                                onPress={() => RNAlert.alert('Specializations', 'Manage specializations')}
                            />
                            <SubMenuItem
                                title="Education"
                                onPress={() => RNAlert.alert('Education', 'View education details')}
                            />
                            <SubMenuItem
                                title="Experience"
                                onPress={() => RNAlert.alert('Experience', 'View experience details')}
                            />
                        </>
                    )}

                    {/* <MenuItem
                        icon="calendar-outline"
                        title="Availability"
                        onPress={() => setExpandedItems(prev => ({ ...prev, availability: !prev.availability }))}
                        hasSubItems
                        isExpanded={expandedItems.availability}
                        onToggle={() => toggleExpand('availability')}
                    />
                    {expandedItems.availability && (
                        <>
                            <SubMenuItem
                                title="Set Availability"
                                onPress={() => navigation.navigate('SetAvailability')}
                            />
                            <SubMenuItem
                                title="View Schedule"
                                onPress={() => RNAlert.alert('Schedule', 'View your schedule')}
                            />
                            <SubMenuItem
                                title="Time Slots"
                                onPress={() => RNAlert.alert('Slots', 'Manage time slots')}
                            />
                        </>
                    )} */}

                    {/* <MenuItem
                        icon="briefcase"
                        title="My Cases & Appointments"
                        onPress={() => setExpandedItems(prev => ({ ...prev, cases: !prev.cases }))}
                        hasSubItems
                        isExpanded={expandedItems.cases}
                        onToggle={() => toggleExpand('cases')}
                    />
                    {expandedItems.cases && (
                        <>
                            <SubMenuItem
                                title="Active Cases"
                                onPress={() => RNAlert.alert('Active', 'View active cases')}
                            />
                            <SubMenuItem
                                title="Completed Cases"
                                onPress={() => RNAlert.alert('Completed', 'View completed cases')}
                            />
                            <SubMenuItem
                                title="Appointments"
                                onPress={() => navigation.navigate('AddAppointment')}
                            />
                        </>
                    )} */}

                    {/* <MenuItem
                        icon="star-outline"
                        title="Reviews & Ratings"
                        onPress={() => setExpandedItems(prev => ({ ...prev, reviews: !prev.reviews }))}
                        hasSubItems
                        isExpanded={expandedItems.reviews}
                        onToggle={() => toggleExpand('reviews')}
                    />
                    {expandedItems.reviews && (
                        <>
                            <SubMenuItem
                                title="My Reviews"
                                onPress={() => RNAlert.alert('Reviews', 'View all reviews')}
                            />
                            <SubMenuItem
                                title="Ratings Overview"
                                onPress={() => RNAlert.alert('Ratings', 'View rating statistics')}
                            />
                            <SubMenuItem
                                title="Testimonials"
                                onPress={() => RNAlert.alert('Testimonials', 'View client testimonials')}
                            />
                        </>
                    )} */}

                    {/* <MenuItem
                        icon="wallet-outline"
                        title="Payments & Earnings"
                        onPress={() => setExpandedItems(prev => ({ ...prev, payments: !prev.payments }))}
                        hasSubItems
                        isExpanded={expandedItems.payments}
                        onToggle={() => toggleExpand('payments')}
                    />
                    {expandedItems.payments && (
                        <>
                            <SubMenuItem
                                title="Earnings Overview"
                                onPress={() => RNAlert.alert('Earnings', 'View earnings statistics')}
                            />
                            <SubMenuItem
                                title="Payment History"
                                onPress={() => RNAlert.alert('History', 'View payment history')}
                            />
                            <SubMenuItem
                                title="Bank Details"
                                onPress={() => RNAlert.alert('Bank', 'Manage bank details')}
                            />
                        </>
                    )} */}

                    {/* <MenuItem
                        icon="settings-outline"
                        title="Settings & Preferences"
                        onPress={() => setExpandedItems(prev => ({ ...prev, settings: !prev.settings }))}
                        hasSubItems
                        isExpanded={expandedItems.settings}
                        onToggle={() => toggleExpand('settings')}
                    />
                    {expandedItems.settings && (
                        <>
                            <SubMenuItem
                                title="Account Security"
                                onPress={() => RNAlert.alert('Security', 'Manage account security')}
                            />
                            <SubMenuItem
                                title="Privacy Settings"
                                onPress={() => RNAlert.alert('Privacy', 'Manage privacy settings')}
                            />
                            <SubMenuItem
                                title="Notification Settings"
                                onPress={() => RNAlert.alert('Notifications', 'Configure notifications')}
                            />
                        </>
                    )} */}

                    {/* <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        onPress={() => setExpandedItems(prev => ({ ...prev, help: !prev.help }))}
                        hasSubItems
                        isExpanded={expandedItems.help}
                        onToggle={() => toggleExpand('help')}
                    />
                    {expandedItems.help && (
                        <>
                            <SubMenuItem
                                title="FAQ"
                                onPress={() => RNAlert.alert('FAQ', 'View frequently asked questions')}
                            />
                            <SubMenuItem
                                title="Contact Support"
                                onPress={() => RNAlert.alert('Support', 'Contact customer support')}
                            />
                        </>
                    )} */}

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

            <Alert
                visible={showLogoutAlert}
                title="Logout"
                message="Are you sure you want to logout?"
                type="warning"
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutAlert(false)}
                onClose={() => setShowLogoutAlert(false)}
            />

        </LawyerLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 100,
        paddingTop: spacing.md,
    },
    fixedHeader: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
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
        fontSize: fontSize.lg + 2,
        fontWeight: fontWeight.bold,
        flex: 1,
        textAlign: 'center',
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
    barCouncilId: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    specializationBadge: {
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
    },
    specializationText: {
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: spacing.lg,
    },
    ratingText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
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
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        backgroundColor: '#F8F8F8',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    subMenuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    dotIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
        marginLeft: spacing.md,
    },
    subMenuTitle: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
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

export default LawyerProfileScreen;
