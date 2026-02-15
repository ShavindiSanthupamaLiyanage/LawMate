// LawMate Theme Configuration

import {TextStyle} from "react-native";

interface Colors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    background: string;
    white: string;
    textPrimary: string;
    textSecondary: string;
    textLight: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    chartBlue: string;
    chartPurple: string;
    chartPink: string;
    chartOrange: string;
    border: string;
    borderLight: string;
    shadow: string;
}

interface Spacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
}

interface BorderRadius {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
}

interface FontSize {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}

interface FontWeight {
    regular: TextStyle['fontWeight'];
    medium: TextStyle['fontWeight'];
    semibold: TextStyle['fontWeight'];
    bold: TextStyle['fontWeight'];
}

export const colors: Colors = {
    // Primary Colors
    primary: '#4E60FF',
    primaryLight: '#6B7CFF',
    primaryDark: '#3D4ECC',

    // Background Colors
    background: '#F8F9FE',
    white: '#FFFFFF',

    // Text Colors
    textPrimary: '#1A1A1A',
    textSecondary: '#8f9bb3',
    textLight: '#9CA3AF',

    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Chart Colors
    chartBlue: '#4E60FF',
    chartPurple: '#A78BFA',
    chartPink: '#EC4899',
    chartOrange: '#F97316',

    // Border Colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Shadow
    shadow: 'rgba(78, 96, 255, 0.1)',
};
export const fontFamily = {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semibold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
};


export const spacing: Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl:175,
};

export const borderRadius: BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

export const fontSize: FontSize = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
};

export const fontWeight: FontWeight = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
};