import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import ClientLayout from '../../../components/ClientLayout';
import { colors, spacing } from '../../../config/theme';

interface AppointmentRequestReceivedScreenProps {
    navigation?: any;
}

const AppointmentRequestReceived: React.FC<AppointmentRequestReceivedScreenProps> = ({
    navigation,
}) => {
    const handleFinish = () => {
        // Navigate back to the Search tab root
        navigation?.navigate('SearchLawyer');
    };

    return (
        <ClientLayout title="Appointment Request" hideRightSection disableScroll>
            <View style={styles.screen}>
                {/* Top: Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>Appointment{'\n'}Request{'\n'}Received</Text>
                </View>

                {/* Illustration */}
                <View style={styles.illustrationWrapper}>
                    <Image
                        source={require('../../../../assets/verification.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Body text */}
                <View style={styles.bodySection}>
                    <Text style={styles.bodyText}>
                        We've received it and your lawyer is currently reviewing the details. You'll receive an email after the review is completed. Once verified, you can continue with LawMate.
                    </Text>
                </View>

                {/* Finish Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.finishButton}
                        onPress={handleFinish}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.finishButtonText}>FINISH</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: spacing.lg ?? 24,
        paddingTop: (spacing.lg ?? 24) + 8,
    },

    // ── Title ──
    titleSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1A1A2E',
        textAlign: 'center',
        lineHeight: 40,
        letterSpacing: -0.5,
    },

    // ── Illustration ──
    illustrationWrapper: {
        alignItems: 'center',
        marginBottom: 36,
    },
    illustration: {
        width: 220,
        height: 180,
    },

    // ── Body ──
    bodySection: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    bodyText: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '400',
    },

    // ── Footer ──
    footer: {
        paddingBottom: spacing.lg ?? 24,
    },
    finishButton: {
        backgroundColor: '#4F3CC9',
        borderRadius: 30,
        paddingVertical: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    finishButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1.4,
    },
});

export default AppointmentRequestReceived;