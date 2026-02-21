import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    Animated,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
    TextStyle,
} from "react-native";
import { colors, spacing, fontSize, borderRadius, fontWeight } from "../config/theme";

interface FloatingInputProps extends TextInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    rightIcon?: React.ReactNode;
    onRightIconPress?: () => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
                                                         label,
                                                         value,
                                                         onChangeText,
                                                         rightIcon,
                                                         onRightIconPress,
                                                         secureTextEntry,
                                                         style,
                                                         ...props
                                                     }) => {
    const [focused, setFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: focused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [focused, value, animatedValue]);

    const labelStyle = {
        position: "absolute" as const,
        left: spacing.md,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, -14],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [fontSize.md, fontSize.sm],
        }),
        color: focused ? colors.primary : colors.textLight,
        fontWeight: fontWeight.medium,
        backgroundColor: colors.white,
        paddingHorizontal: 4,
    };

    const inputStyle: TextStyle = rightIcon ? { paddingRight: 40 } : {};

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Animated.Text style={labelStyle}>{label}</Animated.Text>

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    style={[styles.input, inputStyle, style]}
                    secureTextEntry={secureTextEntry}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.icon}
                        activeOpacity={0.7}
                    >
                        {rightIcon}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FloatingInput;

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    inputContainer: {
        height: 55,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        backgroundColor: colors.white,
        justifyContent: "center",
    },
    input: {
        height: "100%",
        paddingHorizontal: spacing.md,
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
        textAlignVertical: "center",
    },
    icon: {
        position: "absolute",
        right: spacing.md,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
});
