import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types';
import Button from '../../../components/Button';
import Toast from '../../../components/Toast';
import ClientLayout from '../../../components/ClientLayout';
import PaymentSlipReceivedScreen from './PaymentSlipReceivedScreen';

type PaymentSlipRouteProp = RouteProp<
  RootStackParamList,
  'PaymentSlipScreen'
>;

const PaymentSlipScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<PaymentSlipRouteProp>();
  const appointment = route.params?.request;

  const [image, setImage] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('Permission required to access gallery');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <>
    <ClientLayout
      title="Payment Slip"
      showBackButton
      hideRightSection
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>

        {/* Bank Info Card */}
        <View style={styles.card}>
          <Text style={styles.infoText}>
            Your appointment request has been approved. Please make the payment
            for the following bank account and upload the slip to confirm the session.
          </Text>

          <Text style={styles.bankText}>Bank - Bank of Ceylon</Text>
          <Text style={styles.bankText}>Branch - Borella</Text>
          <Text style={styles.bankText}>Account No - 10002020332</Text>
          <Text style={styles.bankText}>Account Holder - M.A.Perera</Text>
          <Text style={styles.bankText}>Amount - Rs. 15,000.00</Text>
        </View>

        {/* Upload Section */}
        <View style={styles.uploadBox}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.placeholderText}>
              No payment slip uploaded
            </Text>
          )}
        </View>

        <Button
          title="UPLOAD PAYMENT SLIP"
          onPress={pickImage}
          variant="primary"
          style={{ marginTop: 20 }}
        />

        <Button
          title="SUBMIT"
          onPress={() => setToastVisible(true)}  
          variant="primary"
          style={{ marginTop: 20 }}
          disabled={!image}
        />

      </View>
    </ClientLayout>
    <Toast
        visible={toastVisible}
        message="Payment slip submitted successfully!"
        type="success"
        duration={3000}
        onDismiss={() => {
            setToastVisible(false);
            navigation.navigate('PaymentSlipReceivedScreen');
        }}
    />
      </>
  );
};

export default PaymentSlipScreen;

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
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});