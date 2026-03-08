import React, { useState } from 'react';
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
import ScreenWrapper from '../../../components/ScreenWrapper';

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

const LawyerProfessionalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // Example data (replace with API later)
    const [professionalData] = useState({
        barCouncilId: 'SL/2015/1234',
        specialization: 'Criminal Law',
        experience: '08 Years',
        languages: 'Sinhala, English, Tamil',
        uploadedDocument: 'LLB BAR Licence',
        licenseNumber: 'BAR-543238v',
        practiceAreas: 'Criminal Law, Civil Law',
        courtAdmissions: 'Supreme Court, High Court',
        educationQualifications: 'LLB, Attorney-at-Law',
    });

    return (
        <ScreenWrapper backgroundColor={colors.background} edges={['top']}>
            <View style={styles.container}>

                {/* Header */}
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
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>

                    <Text style={styles.headerTitle}>Professional Details</Text>

                    <View style={styles.backButton} />
                </LinearGradient>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.card}>
                        <DetailRow label="BAR Council ID" value={professionalData.barCouncilId} />
                        <DetailRow label="Specialization" value={professionalData.specialization} />
                        <DetailRow label="Experience" value={professionalData.experience} />
                        <DetailRow label="Languages" value={professionalData.languages} />
                        <DetailRow label="License Number" value={professionalData.licenseNumber} />
                        <DetailRow label="Practice Areas" value={professionalData.practiceAreas} />
                        <DetailRow label="Court Admissions" value={professionalData.courtAdmissions} />
                        <DetailRow label="Education Qualifications" value={professionalData.educationQualifications} />
                        <DetailRow label="Uploaded Document" value={professionalData.uploadedDocument} />
                    </View>

                </ScrollView>

            </View>
        </ScreenWrapper>
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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
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
        paddingTop: 110,
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

export default LawyerProfessionalDetailsScreen;