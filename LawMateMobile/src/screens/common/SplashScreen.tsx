import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, fontWeight } from '../../config/theme';
import { RootStackParamList } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
    navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 4000);
//400000
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <LinearGradient
            colors={[
                'rgba(24,114,234,1)',
                'rgba(54,87,208,1)',
                'rgba(77,55,200,1)',
                'rgba(99,71,253,1)',
            ]}
            locations={[0.12, 0.46, 0.69, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >

        <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    logoImage: {
        width: 300,
        height: 300,
    },
    title: {
        fontSize: 40,
        fontWeight: fontWeight.bold,
        color: colors.white,
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: fontSize.lg,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: fontWeight.regular,
    },
});

export default SplashScreen;