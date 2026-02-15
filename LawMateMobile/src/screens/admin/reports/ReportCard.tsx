import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';

interface ReportCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onDownload: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ icon, title, onDownload }) => {
    return (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={24} color={colors.textPrimary} />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
            </View>

            <TouchableOpacity
                style={styles.downloadButton}
                onPress={onDownload}
                activeOpacity={0.7}
            >
                <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.lg,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: '#F0F4FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    downloadButton: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    downloadText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: '#0284C7',
    },
});

export default ReportCard;