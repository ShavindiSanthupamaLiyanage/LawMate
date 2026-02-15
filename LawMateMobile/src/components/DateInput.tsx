import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    colors,
    spacing,
    fontSize,
    borderRadius,
    fontFamily,
} from "../config/theme";

interface DateInputProps {
    label: string;
    value: Date | null;
    onChange: (date: Date) => void;
}

const DateInput: React.FC<DateInputProps> = ({
                                                 label,
                                                 value,
                                                 onChange,
                                             }) => {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);

    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: focused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [focused, value]);

    const handleChange = (_event: any, selectedDate?: Date) => {
        setShow(false);
        setFocused(false);

        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                {/* Floating Label */}
                <Animated.Text
                    style={{
                        position: "absolute",
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
                    }}
                >
                    {label}
                </Animated.Text>

                {/* Date Field */}
                <TouchableOpacity
                    style={styles.dateContent}
                    onPress={() => {
                        setFocused(true);
                        setShow(true);
                    }}
                >
                    <Text
                        style={{
                            fontSize: fontSize.md,
                            fontFamily: fontFamily.medium,
                            color: value ? colors.textPrimary : colors.textLight,
                        }}
                    >
                        {value ? formatDate(value) : ""}
                    </Text>

                    <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>

            {show && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleChange}
                />
            )}
        </View>
    );
};

export default DateInput;

const styles = StyleSheet.create({
    container: {
    },

    inputContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        height: 55,
        justifyContent: "center",
        backgroundColor: colors.white,
    },

    dateContent: {
        height: "100%",
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});
