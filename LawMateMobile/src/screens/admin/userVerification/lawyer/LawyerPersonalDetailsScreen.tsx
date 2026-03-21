import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet, Image,
    ScrollView, Modal, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../../config/theme';
import AdminLayout from '../../../../components/AdminLayout';
import {lawyerVerificationService} from "../../../../services/lawyerVerificationService";

interface DetailRowProps {
    label: string;
    value: string;
}

type RouteParams = { LawyerPersonal: { viewOnly: boolean; userId: string } };

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
    const route = useRoute<RouteProp<RouteParams, 'LawyerPersonal'>>();
    const { userId } = route.params;

    const [personalData, setPersonalData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        lawyerVerificationService.getByUserId(userId)
            .then(setPersonalData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userId]);

    const toBase64Uri = (base64: string | null) =>
        base64 ? `data:image/jpeg;base64,${base64}` : null;


    return (
        <AdminLayout
            title="Personal Details"
            showBackButton
            onBackPress={() => navigation.goBack()}
            hideRightSection
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
                ) : personalData ? (
                    <View style={styles.card}>
                        <DetailRow label="Name" value={`${personalData.firstName} ${personalData.lastName}`} />
                        <DetailRow label="Email" value={personalData.email ?? '-'} />
                        <DetailRow label="NIC" value={personalData.nic ?? '-'} />
                        <DetailRow label="Contact Number" value={personalData.contactNumber ?? '-'} />
                        <DetailRow label="Gender" value={personalData.gender === 0 ? 'Male' : 'Female'} />
                        <DetailRow label="State" value={personalData.state === 1 ? 'Active' : 'Pending'} />
                        <DetailRow label="Dual Account" value={personalData.isDualAccount ? 'Yes' : 'No'} />

                        {/* NIC Images */}
                        <Text style={styles.sectionLabel}>NIC Front</Text>
                        {toBase64Uri(personalData.nicFrontImage) ? (
                            <TouchableOpacity onPress={() => setPreviewImage(toBase64Uri(personalData.nicFrontImage))}>
                                <Image source={{ uri: toBase64Uri(personalData.nicFrontImage)! }} style={styles.docImage} />
                            </TouchableOpacity>
                        ) : <Text style={styles.noImage}>Not provided</Text>}

                        <Text style={styles.sectionLabel}>NIC Back</Text>
                        {toBase64Uri(personalData.nicBackImage) ? (
                            <TouchableOpacity onPress={() => setPreviewImage(toBase64Uri(personalData.nicBackImage))}>
                                <Image source={{ uri: toBase64Uri(personalData.nicBackImage)! }} style={styles.docImage} />
                            </TouchableOpacity>
                        ) : <Text style={styles.noImage}>Not provided</Text>}
                    </View>
                ) : (
                    <Text style={{ padding: 16, color: colors.textSecondary }}>No data found.</Text>
                )}

                <Modal visible={!!previewImage} transparent animationType="fade">
                    <View style={styles.previewOverlay}>
                        <TouchableOpacity style={styles.previewClose} onPress={() => setPreviewImage(null)}>
                            <Text style={styles.previewCloseText}>✕</Text>
                        </TouchableOpacity>
                        {previewImage && (
                            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
                        )}
                    </View>
                </Modal>

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

export default LawyerPersonalDetailsScreen;