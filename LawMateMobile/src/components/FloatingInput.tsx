import React, { useState, useRef, useEffect } from "react";
import {
    View,
    TextInput,
    Animated,
    StyleSheet,
    TextInputProps,
} from "react-native";
import { colors, spacing, fontSize, borderRadius, fontFamily } from "../config/theme";

interface FloatingInputProps extends TextInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
                                                         label,
                                                         value,
                                                         onChangeText,
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
    }, [focused, value]);

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
        fontFamily: fontFamily.medium,
        backgroundColor: colors.white,
        paddingHorizontal: 4,
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Animated.Text style={labelStyle}>{label}</Animated.Text>

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    style={styles.input}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    {...props}
                />
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
        fontFamily: fontFamily.medium,
        color: colors.textPrimary,
        textAlignVertical: "center",
    },

});
