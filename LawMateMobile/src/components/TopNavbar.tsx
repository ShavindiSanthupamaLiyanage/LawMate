import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../config/theme';

interface TopNavbarProps {
    title?: string; // optional screen title
    userName?: string;
    profileImage?: string;
    onNotificationPress?: () => void;
    onProfilePress?: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({
    title,
    userName = 'Alex Morter',
    profileImage,
    onNotificationPress,
    onProfilePress,
}) => {
    const navigation = useNavigation<any>();
    const [notificationCount] = useState(3);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Login') },
            ],
            { cancelable: false }
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(24,114,234,1)','rgba(54,87,208,1)','rgba(77,55,200,1)','rgba(99,71,253,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient as any}
            >
                <View style={styles.content}>
                    {/* Left Section */}
                    <View style={styles.leftSection}>
                        {title ? (
                            <Text style={styles.title}>{title}</Text>
                        ) : (
                            <>
                                <Text style={styles.greeting}>
                                    {new Date().getHours() < 12
                                        ? 'Good morning'
                                        : new Date().getHours() < 18
                                        ? 'Good afternoon'
                                        : 'Good evening'}
                                </Text>
                                <Text style={styles.userName} numberOfLines={1}>
                                    {userName}
                                </Text>
                            </>
                        )}
                    </View>

                    {/* Right Section */}
                    <View style={styles.rightSection}>
                        {/* Notification Button */}
                        <TouchableOpacity
                            style={styles.notificationButton}
                            onPress={onNotificationPress}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications" size={20} color={colors.white} />
                            {notificationCount > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.badgeText}>
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Logout Button */}
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="power" size={20} color={colors.white} />
                        </TouchableOpacity>

                        {/* Profile Avatar */}
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={onProfilePress}
                            activeOpacity={0.7}
                        >
                            {profileImage ? (
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.defaultAvatar}>
                                    <Ionicons name="person" size={18} color={colors.primary} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        justifyContent: 'center',
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        zIndex: 100,
    },
    gradient: { flex: 1, justifyContent: 'center' },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    leftSection: { flex: 1, justifyContent: 'center' },
    greeting: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.medium, opacity: 0.85, marginBottom: 2 },
    userName: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold },
    title: { color: colors.white, fontSize: fontSize.lg + 2, fontWeight: fontWeight.bold },
    rightSection: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    notificationButton: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    logoutButton: { width: 40, height: 40, borderRadius: borderRadius.full, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    notificationBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: colors.error, borderRadius: borderRadius.full, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.primary },
    badgeText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
    profileButton: { marginLeft: spacing.xs },
    profileImage: { width: 44, height: 44, borderRadius: borderRadius.full, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    defaultAvatar: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
});

export default TopNavbar;