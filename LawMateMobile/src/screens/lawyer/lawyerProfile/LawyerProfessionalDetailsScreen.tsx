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

const LawyerProfessionalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    // TODO: Replace with actual API data
    const professionalData = {
        barCouncilId: 'SL/2015/1234',
        specialization: 'Criminal Law',
        experience: '08 Years',
        languages: 'Sinhala, English, Tamil',
        uploadedDocument: 'LLB BAR Licence',
        licenseNumber: 'BAR-543238v',
        practiceAreas: 'Criminal Law, Civil Law',
        courtAdmissions: 'Supreme Court, High Court',
        educationQualifications: 'LLB, Attorney-at-Law',
    };

    return (
        <View style={styles.container}>
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
                <Text style={styles.headerTitle}>Professional Details</Text>
                <View style={styles.backButton} />
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.card}>
                    <DetailRow
                        label="BAR Council ID"
                        value={professionalData.barCouncilId}
                        onPress={() => {/* TODO: Navigate to edit BAR ID */}}
                    />
                    <DetailRow
                        label="Specialization"
                        value={professionalData.specialization}
                        onPress={() => {/* TODO: Navigate to edit specialization */}}
                    />
                    <DetailRow
                        label="Experience"
                        value={professionalData.experience}
                        onPress={() => {/* TODO: Navigate to edit experience */}}
                    />
                    <DetailRow
                        label="Languages"
                        value={professionalData.languages}
                        onPress={() => {/* TODO: Navigate to edit languages */}}
                    />
                    <DetailRow
                        label="License Number"
                        value={professionalData.licenseNumber}
                        onPress={() => {/* TODO: Navigate to edit license */}}
                    />
                    <DetailRow
                        label="Practice Areas"
                        value={professionalData.practiceAreas}
                        onPress={() => {/* TODO: Navigate to edit practice areas */}}
                    />
                    <DetailRow
                        label="Court Admissions"
                        value={professionalData.courtAdmissions}
                        onPress={() => {/* TODO: Navigate to edit court admissions */}}
                    />
                    <DetailRow
                        label="Education Qualifications"
                        value={professionalData.educationQualifications}
                        onPress={() => {/* TODO: Navigate to edit qualifications */}}
                    />
                    <DetailRow
                        label="Uploaded Document"
                        value={professionalData.uploadedDocument}
                        onPress={() => {/* TODO: Navigate to view/upload document */}}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Professional information is verified by the Bar Council. Contact support for changes.
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

export default LawyerProfessionalDetailsScreen;
