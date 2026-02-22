import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

interface DetailRowProps {
    label: string;
    value: string;
    onPress?: () => void;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, onPress }) => (
    <TouchableOpacity
        style={styles.detailRow}
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        disabled={!onPress}
    >
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
);

const ClientPersonalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data
    const personalData = {
        name: 'Sarah Johnson',
        address: '123 Main Street, Colombo 03',
        contactNumber: '0771234567',
        emailAddress: 'sarah.johnson@email.com',
        nic: '199856789012',
        dateOfBirth: '15/08/1998',
        gender: 'Female',
        nationality: 'Sri Lankan',
    };

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
                <Text style={styles.headerTitle}>Personal Details</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <DetailRow
                        label="Name"
                        value={personalData.name}
                        onPress={() => {/* TODO: Navigate to edit name */}}
                    />
                    <DetailRow
                        label="Address"
                        value={personalData.address}
                        onPress={() => {/* TODO: Navigate to edit address */}}
                    />
                    <DetailRow
                        label="Contact Number"
                        value={personalData.contactNumber}
                        onPress={() => {/* TODO: Navigate to edit contact */}}
                    />
                    <DetailRow
                        label="Email Address"
                        value={personalData.emailAddress}
                        onPress={() => {/* TODO: Navigate to edit email */}}
                    />
                    <DetailRow
                        label="NIC"
                        value={personalData.nic}
                        onPress={() => {/* TODO: Navigate to edit NIC */}}
                    />
                    <DetailRow
                        label="Date of Birth"
                        value={personalData.dateOfBirth}
                        onPress={() => {/* TODO: Navigate to edit DOB */}}
                    />
                    <DetailRow
                        label="Gender"
                        value={personalData.gender}
                        onPress={() => {/* TODO: Navigate to edit gender */}}
                    />
                    <DetailRow
                        label="Nationality"
                        value={personalData.nationality}
                        onPress={() => {/* TODO: Navigate to edit nationality */}}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        To update your personal information, tap on any field above.
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
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.sm,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs / 2,
    },
    detailValue: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    infoText: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});

export default ClientPersonalDetailsScreen;
