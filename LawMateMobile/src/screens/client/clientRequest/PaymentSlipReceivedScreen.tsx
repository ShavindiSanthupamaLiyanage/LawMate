import React, {useEffect} from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ClientRequestsStackParamList = {
  ClientRequestsList: undefined;
  ClientAppointmentView: undefined;
  PaymentSlipScreen: undefined;
  PaymentSlipReceivedScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<ClientRequestsStackParamList, 'PaymentSlipReceivedScreen'>;


const PaymentSlipReceivedScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('ClientRequestsList');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
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
      </View>
    // </ClientLayout>
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