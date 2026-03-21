import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image  } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../config/theme';

interface InitialTopNavbarProps {
    title: string;
    onBack?: () => void;
    showLogo?: boolean;
}

const InitialTopNavbar: React.FC<InitialTopNavbarProps> = ({
                                                               title,
                                                               onBack,
                                                               showLogo = true,
                                                           }) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[
                    'rgba(24,114,234,1)',
                    'rgba(54,87,208,1)',
                    'rgba(77,55,200,1)',
                    'rgba(99,71,253,1)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient as any}
            >
                <View style={styles.content}>
                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={24}
                            color={colors.white}
                        />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title} numberOfLines={1}>
                        {title}
                    </Text>

                    {/* Logo */}
                    {showLogo && (
                        <View style={styles.logoContainer}>
                            <View>
                                <Image
                                    source={require('../../assets/logoIcon.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        justifyContent: 'center',
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
        zIndex: 100,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    title: {
        flex: 1,
        color: colors.white,
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    logoContainer: {
        marginLeft: spacing.sm,
    },
    logoCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 36,
        height: 36,
    },
});

export default InitialTopNavbar;