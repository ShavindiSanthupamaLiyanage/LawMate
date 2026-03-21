import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import LawyerLayout from '../../../components/LawyerLayout';
import { lawyerVerificationService } from '../../../services/lawyerVerificationService';
import { AuthService } from '../../../services/authService';
import { AreaOfPracticeOptions, DistrictOptions } from '../../../enum/enumOptions';
import { VerificationStatus } from '../../../enum/enum';

interface DetailRowProps {
    label: string;
    value: string;
}

interface LawyerProfessionalApiData {
    barAssociationRegNo?: string | null;
    sceCertificateNo?: string | null;
    bio?: string | null;
    professionalDesignation?: string | null;
    yearOfExperience?: number | null;
    workingDistrict?: number | null;
    areaOfPractice?: number | null;
    officeContactNumber?: string | null;
    averageRating?: number | null;
    verificationStatus?: number | null;
    barAssociationMembership?: boolean | null;
    enrollmentCertificate?: string | null;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    </View>
);

const getOptionLabel = (
    options: Array<{ label: string; value: number }>,
    value?: number | null
): string => {
    if (value === null || value === undefined) {
        return '-';
    }

    return options.find((option) => option.value === value)?.label ?? String(value);
};

const getVerificationStatusLabel = (status?: number | null): string => {
    switch (status) {
        case VerificationStatus.Pending:
            return 'Pending';
        case VerificationStatus.Verified:
            return 'Verified';
        case VerificationStatus.Rejected:
            return 'Rejected';
        default:
            return '-';
    }
};

const toBase64Uri = (base64?: string | null): string | null =>
    base64 ? `data:image/jpeg;base64,${base64}` : null;

const LawyerProfessionalDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [professionalData, setProfessionalData] = useState<LawyerProfessionalApiData | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setErrorMessage(null);

                const currentUser = await AuthService.getCurrentUser();
                const userId = currentUser?.userId;

                if (!userId) {
                    throw new Error('User session not found. Please log in again.');
                }

                const response = await lawyerVerificationService.getByUserId(userId);

                if (isMounted) {
                    setProfessionalData(response as LawyerProfessionalApiData);
                }
            } catch (error: any) {
                if (isMounted) {
                    setErrorMessage(error?.message ?? 'Failed to load professional details.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    const enrollmentCertificateUri = toBase64Uri(professionalData?.enrollmentCertificate);

    const yearOfExperience =
        professionalData?.yearOfExperience === null || professionalData?.yearOfExperience === undefined
            ? '-'
            : `${professionalData.yearOfExperience} Years`;

    const averageRating =
        professionalData?.averageRating === null || professionalData?.averageRating === undefined
            ? '-'
            : professionalData.averageRating.toFixed(1);

    const barAssociationMembership =
        professionalData?.barAssociationMembership === null || professionalData?.barAssociationMembership === undefined
            ? '-'
            : professionalData.barAssociationMembership
                ? 'Yes'
                : 'No';

    return (
        <LawyerLayout
            title="Professional Details"
            showBackButton
            onBackPress={() => navigation.goBack()}
            hideRightSection
            disableScroll
        >
            <View style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                    ) : errorMessage ? (
                        <View style={styles.infoBox}>
                            <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                            <Text style={styles.infoText}>{errorMessage}</Text>
                        </View>
                    ) : professionalData ? (
                        <View style={styles.card}>
                            <DetailRow
                                label="BAR Association Reg No"
                                value={professionalData.barAssociationRegNo ?? '-'}
                            />
                            <DetailRow
                                label="SCE Certificate No"
                                value={professionalData.sceCertificateNo ?? '-'}
                            />
                            <DetailRow
                                label="Professional Designation"
                                value={professionalData.professionalDesignation ?? '-'}
                            />
                            <DetailRow
                                label="Bio"
                                value={professionalData.bio ?? '-'}
                            />
                            <DetailRow
                                label="Years of Experience"
                                value={yearOfExperience}
                            />
                            <DetailRow
                                label="Working District"
                                value={getOptionLabel(DistrictOptions, professionalData.workingDistrict)}
                            />
                            <DetailRow
                                label="Area of Practice"
                                value={getOptionLabel(AreaOfPracticeOptions, professionalData.areaOfPractice)}
                            />
                            <DetailRow
                                label="Office Contact"
                                value={professionalData.officeContactNumber ?? '-'}
                            />
                            <DetailRow
                                label="Bar Association Membership"
                                value={barAssociationMembership}
                            />
                            <DetailRow
                                label="Average Rating"
                                value={averageRating}
                            />
                            <DetailRow
                                label="Verification Status"
                                value={getVerificationStatusLabel(professionalData.verificationStatus)}
                            />

                            <Text style={styles.sectionLabel}>Supreme Court Enrollment Certificate</Text>
                            {enrollmentCertificateUri ? (
                                <TouchableOpacity
                                    onPress={() => setPreviewImage(enrollmentCertificateUri)}
                                    activeOpacity={0.8}
                                >
                                    <Image
                                        source={{ uri: enrollmentCertificateUri }}
                                        style={styles.docImage}
                                    />
                                    <Text style={styles.tapHint}>Tap to preview</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.noImage}>Not provided</Text>
                            )}
                        </View>
                    ) : (
                        <Text style={{ padding: 16, color: colors.textSecondary }}>No data found.</Text>
                    )}
                </ScrollView>

                <Modal visible={!!previewImage} transparent animationType="fade">
                    <View style={styles.previewOverlay}>
                        <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewImage(null)}>
                            <Text style={styles.previewCloseText}>X</Text>
                        </TouchableOpacity>
                        {previewImage && (
                            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
                        )}
                    </View>
                </Modal>
            </View>
        </LawyerLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
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
    sectionLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.semibold,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.xs,
    },
    docImage: {
        height: 180,
        borderRadius: 10,
        marginBottom: spacing.md,
        width: '90%',
        alignSelf: 'center',
    },
    tapHint: {
        textAlign: 'center',
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: -spacing.sm,
        marginBottom: spacing.md,
    },
    noImage: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        color: '#aaa',
        fontSize: fontSize.sm,
    },
    previewOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    previewCloseText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    previewImage: {
        width: '95%',
        height: '75%',
    },
});

export default LawyerProfessionalDetailsScreen;
