import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../../config/theme';
// import ScreenWrapper from '../../../../components/ScreenWrapper';
import AdminLayout from '../../../../components/AdminLayout';

interface DetailRowProps {
    label: string;
    value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

const LawyerPersonalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [personalData] = useState({
        name: 'Alex Motor',
        address: 'Maple Terrace, Pitipana North, Homagama',
        contactNumber: '07231253',
        emailAddress: 'alexmotor@gmail.com',
        nic: '200350500030',
        dateOfBirth: '05/03/2000',
        gender: 'Male',
        nationality: 'Sri Lankan',
    });

    return (
        <AdminLayout
            title="Personal Details"
            showBackButton
            onBackPress={() => navigation.goBack()}
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <DetailRow label="Name" value={personalData.name} />
                    <DetailRow label="Address" value={personalData.address} />
                    <DetailRow label="Contact Number" value={personalData.contactNumber} />
                    <DetailRow label="Email Address" value={personalData.emailAddress} />
                    <DetailRow label="NIC" value={personalData.nic} />
                    <DetailRow label="Date of Birth" value={personalData.dateOfBirth} />
                    <DetailRow label="Gender" value={personalData.gender} />
                    <DetailRow label="Nationality" value={personalData.nationality} />
                </View>
            </ScrollView>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: spacing.lg,
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
});

export default LawyerPersonalDetailsScreen;