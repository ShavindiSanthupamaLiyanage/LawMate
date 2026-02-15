import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Animated,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    colors,
    spacing,
    fontSize,
    borderRadius,
    fontFamily,
} from "../config/theme";

interface SelectInputProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    items: { label: string; value: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({
                                                     label,
                                                     value,
                                                     onValueChange,
                                                     items,
                                                 }) => {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: focused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [focused, value]);

    return (
        <>
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

                    {/* Select Content */}
                    <TouchableOpacity
                        style={styles.selectContent}
                        onPress={() => {
                            setFocused(true);
                            setVisible(true);
                        }}
                    >
                        <Text
                            style={{
                                fontSize: fontSize.md,
                                fontFamily: fontFamily.medium,
                                color: value ? colors.textPrimary : colors.textLight,
                            }}
                        >
                            {value || ""}
                        </Text>

                        <Ionicons
                            name="chevron-down-outline"
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dropdown Modal */}
            <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => {
                        setVisible(false);
                        setFocused(false);
                    }}
                >
                    <View style={styles.dropdown}>
                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        onValueChange(item.label);
                                        setVisible(false);
                                        setFocused(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default SelectInput;

const styles = StyleSheet.create({
    container: {
    },

    inputContainer: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        height: 55,
        justifyContent: "center", // 👈 important
        backgroundColor: colors.white,

    },

    selectContent: {
        paddingHorizontal: spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        height: "100%",
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        padding: spacing.lg,
    },

    dropdown: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        maxHeight: 250,
    },

    option: {
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    optionText: {
        fontSize: fontSize.md,
        fontFamily: fontFamily.medium,
        color: colors.textPrimary,
    },
});
