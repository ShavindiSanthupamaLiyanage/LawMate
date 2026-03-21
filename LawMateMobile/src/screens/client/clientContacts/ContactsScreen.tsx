import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Linking,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import {useNavigation} from "@react-navigation/native";
import {useToast} from "../../../context/ToastContext";
import {ContactService} from "../../../services/contactService";

interface FormValues {
    fullName: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    fullName?: string;
    email?: string;
    subject?: string;
    message?: string;
}

interface FieldProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: string;
    multiline?: boolean;
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'sentences';
}

const Field: React.FC<FieldProps> = ({
                                         label,
                                         value,
                                         onChangeText,
                                         placeholder,
                                         error,
                                         multiline = false,
                                         keyboardType = 'default',
                                         autoCapitalize = 'sentences',
                                     }) => (
    <View style={styles.fieldGroup}>
        <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
        </View>
        <TextInput
            style={[
                styles.input,
                multiline && styles.textarea,
                error ? styles.inputError : null,
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            multiline={multiline}
            numberOfLines={multiline ? 6 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
        />
    </View>
);

const ContactsScreen: React.FC = () => {
    const [values, setValues] = useState<FormValues>({
        fullName: '',
        email: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigation = useNavigation<any>();
    const handleChange = (field: keyof FormValues) => (text: string) => {
        setValues(prev => ({ ...prev, [field]: text }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };
    const { showSuccess, showError } = useToast();

    const validate = (): FormErrors => {
        const newErrors: FormErrors = {};
        if (!values.fullName.trim()) newErrors.fullName = 'Required';
        if (!values.email.trim()) {
            newErrors.email = 'Required';
        } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!values.subject.trim()) newErrors.subject = 'Required';
        if (!values.message.trim()) newErrors.message = 'Required';
        return newErrors;
    };

    const handleSubmit = async () => {
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            await ContactService.sendMessage(values);
            showSuccess("Message sent! We'll get back to you within 24 hours.");
            setValues({ fullName: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            showError('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openURL = (url: string) => {
        Linking.openURL(url).catch(() =>
            Alert.alert('Error', 'Could not open the link. Please try again.')
        );
    };

    return (
        <ClientLayout
            title="Contact Us"
            onProfilePress={() => navigation.navigate('ClientProfile')}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* ── Page Header ── */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageSubtitle}>
                        Get in touch with us for any questions or support
                    </Text>
                </View>

                {/* ── Contact Form Card ── */}
                <View style={styles.card}>
                    <Field
                        label="Full Name"
                        value={values.fullName}
                        onChangeText={handleChange('fullName')}
                        placeholder="Enter your full name"
                        error={errors.fullName}
                    />
                    <Field
                        label="Email Address"
                        value={values.email}
                        onChangeText={handleChange('email')}
                        placeholder="Enter your email"
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Field
                        label="Subject"
                        value={values.subject}
                        onChangeText={handleChange('subject')}
                        placeholder="What is this about?"
                        error={errors.subject}
                    />
                    <Field
                        label="Message"
                        value={values.message}
                        onChangeText={handleChange('message')}
                        placeholder="Tell us more about your inquiry"
                        error={errors.message}
                        multiline
                    />

                    <Button
                        title={isSubmitting ? 'Sending...' : 'Send Message'}
                        onPress={handleSubmit}
                        variant="primary"
                        disabled={isSubmitting}
                        loading={isSubmitting}
                        style={styles.sendButton}
                    />
                </View>

                {/* ── Social Links ── */}
                <View style={styles.socialSection}>
                    <Text style={styles.socialHeading}>Follow Us on</Text>
                    <View style={styles.socialRow}>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={() =>
                                openURL('https://www.facebook.com/profile.php?id=61583961287347')
                            }
                            activeOpacity={0.75}
                        >
                            <Image
                                source={require('../../../../assets/facebook.png')}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.socialBtnLabel}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={() =>
                                openURL('https://www.linkedin.com/company/lawmatesupport/')
                            }
                            activeOpacity={0.75}
                        >
                            <Image
                                source={require('../../../../assets/linkedIn.png')}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.socialBtnLabel}>LinkedIn</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.socialBtn}
                            onPress={() =>
                                openURL('https://www.instagram.com/lawmate.infodesk/')
                            }
                            activeOpacity={0.75}
                        >
                            <Image
                                source={require('../../../../assets/instergram.png')}
                                style={styles.socialIconImage}
                                resizeMode="contain"
                            />
                            <Text style={styles.socialBtnLabel}>Instagram</Text>
                        </TouchableOpacity>

                    </View>
                </View>

                <Text style={styles.footerNote}>
                    We typically respond within 24 hours on business days.
                </Text>
            </KeyboardAvoidingView>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    // Page Header
    pageHeader: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    pageSubtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Form Card
    card: {
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.borderLight,
        marginBottom: spacing.lg,
    },

    // Fields
    fieldGroup: {
        marginBottom: spacing.md,
    },
    fieldLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    fieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    fieldError: {
        fontSize: fontSize.xs,
        color: colors.error,
        fontWeight: fontWeight.medium,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        backgroundColor: colors.background,
    },
    textarea: {
        height: 120,
        paddingTop: spacing.sm,
    },
    inputError: {
        borderColor: colors.error,
    },

    // Send Button
    sendButton: {
        marginTop: spacing.sm,
    },

    // Social Section
    socialSection: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    socialHeading: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.xl,
    },
    socialBtn: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    // Matches the previous 52×52 badge size — no visual change in layout
    socialIconImage: {
        width: 52,
        height: 52,
    },
    socialBtnLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },

    // Footer
    footerNote: {
        textAlign: 'center',
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.lg,
    },
});

export default ContactsScreen;