import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';

const PaymentSlipReceivedScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <ClientLayout title="FIXIO - Get Started" hideRightSection>
      <View style={styles.container}>
        <Text style={styles.title}>Payment Slip{'\n'}Received</Text>

        <Image
          source={require('../../../../assets/verification.png')} 
          style={styles.illustration}
          resizeMode="contain"
        />

        <Text style={styles.description}>
          We've received it and admin is currently reviewing the details. You'll
          receive an email after the review is completed. Once verified, you can
          continue with LawMate.
        </Text>

        <Button
          title="FINISH"
          onPress={() => navigation.navigate('ClientRequestsList')}
          variant="primary"
          style={styles.button}
        />
      </View>
    </ClientLayout>
  );
};

export default PaymentSlipReceivedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#111827',
  },
  illustration: {
    width: 280,
    height: 280,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  button: {
    width: '100%',
  },
});