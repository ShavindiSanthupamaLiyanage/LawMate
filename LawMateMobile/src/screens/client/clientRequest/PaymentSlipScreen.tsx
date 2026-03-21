import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import ClientLayout from '../../../components/ClientLayout';
import { paymentService } from '../../../services/paymentService';

// ─── Navigation types ─────────────────────────────────────────────────────────

type PaymentSlipRouteProp = RouteProp<RootStackParamList, 'PaymentSlipScreen'>;

type ClientRequestsStackParamList = {
  ClientRequestsList:        undefined;
  ClientAppointmentView:     undefined;
  PaymentSlipScreen:         undefined;
  PaymentSlipReceivedScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<
  ClientRequestsStackParamList,
  'PaymentSlipScreen'
>;

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentSlipScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route      = useRoute<PaymentSlipRouteProp>();

  const bookingId: number =
    (route.params as any)?.bookingId ??
    (route.params as any)?.request?.bookingId;

  // ── state ──────────────────────────────────────────────────────────────────
  const [imageUri, setImageUri]       = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType]       = useState<'success' | 'error'>('success');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  };

  // ── pick image ─────────────────────────────────────────────────────────────
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission required to access gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality:    0.8,
      base64:     true,   // needed for backend upload
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setImageUri(asset.uri);
    setImageBase64(asset.base64 ?? null);
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!imageBase64) return showToast('Please upload a payment slip', 'error');

    try {
      setSubmitting(true);
      await paymentService.uploadPaymentSlip(bookingId, imageBase64);
      showToast('Payment slip submitted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message ?? 'Failed to submit payment slip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <ClientLayout
        title="Payment Slip"
        showBackButton
        hideRightSection
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.container}>

          {/* ── Bank Info Card ── */}
          <View style={styles.card}>
            <Text style={styles.infoText}>
              Your appointment request has been approved. Please make the payment
              for the following bank account and upload the slip to confirm the session.
            </Text>
            <Text style={styles.bankText}>Bank - Bank of Ceylon</Text>
            <Text style={styles.bankText}>Branch - Borella</Text>
            <Text style={styles.bankText}>Account No - 10002020332</Text>
            <Text style={styles.bankText}>Account Holder - M.A.Perera</Text>
            <Text style={styles.bankText}>Amount - Rs. 2,000.00</Text>
          </View>

          {/* ── Image Preview Box ── */}
          <View style={styles.uploadBox}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.placeholderText}>No payment slip uploaded</Text>
            )}
          </View>

          {/* ── Buttons ── */}
          <Button
            title="UPLOAD PAYMENT SLIP"
            onPress={pickImage}
            variant="primary"
            style={{ marginTop: 20 }}
          />

          <Button
            title={submitting ? 'SUBMITTING…' : 'SUBMIT'}
            onPress={handleSubmit}
            variant="primary"
            style={{ marginTop: 20 }}
            disabled={!imageBase64 || submitting}
          />

          {submitting && (
            <ActivityIndicator
              size="small"
              color="#4F46E5"
              style={{ marginTop: 12 }}
            />
          )}

        </View>
      </ClientLayout>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        duration={3000}
        onDismiss={() => {
          setToastVisible(false);
          if (toastType === 'success') {
            navigation.navigate('PaymentSlipReceivedScreen');
          }
        }}
      />
    </>
  );
};

export default PaymentSlipScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  bankText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadBox: {
    height: 180,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  imagePreview: {
    width:        '100%',
    height:       '100%',
    borderRadius: 12,
  },
});