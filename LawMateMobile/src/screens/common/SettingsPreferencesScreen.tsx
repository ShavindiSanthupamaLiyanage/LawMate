import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';

const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data and state management
    const [settings, setSettings] = useState({
        notifications: true,
        emailAlerts: true,
        pushNotifications: true,
        darkMode: false,
        language: 'English',
        displayMode: 'Light Mode',
    });

    const SettingRow = ({ 
        icon, 
        title, 
        value, 
        hasToggle, 
        toggleValue, 
        onToggle,
        onPress 
    }: any) => (
        <TouchableOpacity
            style={styles.settingRow}
            onPress={onPress}
            activeOpacity={hasToggle ? 1 : 0.7}
            disabled={hasToggle}
        >
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    {value && <Text style={styles.settingValue}>{value}</Text>}
                </View>
            </View>
            {hasToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.white}
                />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
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
                <Text style={styles.headerTitle}>Settings & Preferences</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <SettingRow
                        icon="language-outline"
                        title="Language"
                        value={settings.language}
                        onPress={() => {/* TODO: Navigate to language selection */}}
                    />
                    <SettingRow
                        icon="contrast-outline"
                        title="Display Mode"
                        value={settings.displayMode}
                        onPress={() => {/* TODO: Navigate to display mode selection */}}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <SettingRow
                        icon="notifications-outline"
                        title="Push Notifications"
                        hasToggle
                        toggleValue={settings.pushNotifications}
                        onToggle={(value: boolean) => {
                            setSettings(prev => ({ ...prev, pushNotifications: value }));
                            // TODO: Call API to update setting
                        }}
                    />
                    <SettingRow
                        icon="mail-outline"
                        title="Email Alerts"
                        hasToggle
                        toggleValue={settings.emailAlerts}
                        onToggle={(value: boolean) => {
                            setSettings(prev => ({ ...prev, emailAlerts: value }));
                            // TODO: Call API to update setting
                        }}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Additional Settings</Text>
                    <SettingRow
                        icon="lock-closed-outline"
                        title="Privacy & Security"
                        onPress={() => {/* TODO: Navigate to privacy settings */}}
                    />
                    <SettingRow
                        icon="document-text-outline"
                        title="Terms and Conditions"
                        onPress={() => {/* TODO: Navigate to terms */}}
                    />
                    <SettingRow
                        icon="alert-circle-outline"
                        title="Complaints"
                        onPress={() => {/* TODO: Navigate to complaints */}}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    settingValue: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
});

export default SettingsScreen;
