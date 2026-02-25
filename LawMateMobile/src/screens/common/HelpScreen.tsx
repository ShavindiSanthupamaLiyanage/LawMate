import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../config/theme';

const HelpScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const helpItems = [
        {
            icon: 'call-outline' as const,
            title: 'Contact Support',
            description: 'Get in touch with our support team',
            action: () => Linking.openURL('tel:+94112345678'),
        },
        {
            icon: 'mail-outline' as const,
            title: 'Email Us',
            description: 'support@lawmate.lk',
            action: () => Linking.openURL('mailto:support@lawmate.lk'),
        },
        {
            icon: 'chatbubbles-outline' as const,
            title: 'Live Chat',
            description: 'Chat with our support team',
            action: () => {/* TODO: Open live chat */},
        },
        {
            icon: 'help-circle-outline' as const,
            title: 'FAQ',
            description: 'Frequently asked questions',
            action: () => {/* TODO: Navigate to FAQ */},
        },
        {
            icon: 'document-text-outline' as const,
            title: 'User Guide',
            description: 'Learn how to use LawMate',
            action: () => {/* TODO: Navigate to user guide */},
        },
        {
            icon: 'videocam-outline' as const,
            title: 'Video Tutorials',
            description: 'Watch helpful video guides',
            action: () => {/* TODO: Navigate to tutorials */},
        },
    ];

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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.welcomeCard}>
                    <Ionicons name="help-circle" size={48} color={colors.primary} />
                    <Text style={styles.welcomeTitle}>How can we help you?</Text>
                    <Text style={styles.welcomeText}>
                        Choose from the options below to get the help you need
                    </Text>
                </View>

                <View style={styles.card}>
                    {helpItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.helpItem}
                            onPress={item.action}
                            activeOpacity={0.7}
                        >
                            <View style={styles.helpLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={item.icon} size={24} color={colors.primary} />
                                </View>
                                <View style={styles.helpContent}>
                                    <Text style={styles.helpTitle}>{item.title}</Text>
                                    <Text style={styles.helpDescription}>{item.description}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Support Hours</Text>
                    <Text style={styles.infoText}>
                        Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
                        Saturday: 10:00 AM - 4:00 PM{'\n'}
                        Sunday: Closed
                    </Text>
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
    welcomeCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    welcomeTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    welcomeText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    helpItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    helpLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.md,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    helpContent: {
        flex: 1,
    },
    helpTitle: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs / 2,
    },
    helpDescription: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    infoBox: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    infoTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 22,
    },
});

export default HelpScreen;
