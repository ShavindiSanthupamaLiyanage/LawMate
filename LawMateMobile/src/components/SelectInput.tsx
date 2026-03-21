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
    fontWeight,
} from "../config/theme";

// ── Generic so it works with both string and number values ───────────────────
interface SelectInputProps<T extends string | number> {
    label:          string;
    value:          T | undefined;
    onValueChange:  (value: T) => void;
    items:          { label: string; value: T }[];
}

function SelectInput<T extends string | number>({
                                                    label,
                                                    value,
                                                    onValueChange,
                                                    items,
                                                }: SelectInputProps<T>) {
    const [visible, setVisible] = useState(false);
    const [focused, setFocused] = useState(false);

    // Derive the display label from the selected value
    const selectedLabel = items.find((i) => i.value === value)?.label ?? "";

    const animatedValue = useRef(
        new Animated.Value(value !== undefined && value !== "" ? 1 : 0)
    ).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: focused || (value !== undefined && value !== "") ? 1 : 0,
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
                                inputRange:  [0, 1],
                                outputRange: [14, -14],
                            }),
                            fontSize: animatedValue.interpolate({
                                inputRange:  [0, 1],
                                outputRange: [fontSize.md, fontSize.sm],
                            }),
                            color:           focused ? colors.primary : colors.textLight,
                            fontWeight:      fontWeight.medium,
                            backgroundColor: colors.white,
                            paddingHorizontal: 4,
                        }}
                    >
                        {label}
                    </Animated.Text>

                    {/* Select trigger */}
                    <TouchableOpacity
                        style={styles.selectContent}
                        onPress={() => {
                            setFocused(true);
                            setVisible(true);
                        }}
                    >
                        <Text
                            style={{
                                fontSize:   fontSize.md,
                                fontWeight: fontWeight.medium,
                                color:      selectedLabel ? colors.textPrimary : colors.textLight,
                            }}
                        >
                            {selectedLabel}
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
                            keyExtractor={(item) => String(item.value)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        item.value === value && styles.optionSelected,
                                    ]}
                                    onPress={() => {
                                        onValueChange(item.value);   // ← passes the value (number or string), not the label
                                        setVisible(false);
                                        setFocused(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item.value === value && styles.optionTextSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

export default SelectInput;

const styles = StyleSheet.create({
    container: {},

    inputContainer: {
        borderWidth:     1,
        borderColor:     colors.border,
        borderRadius:    borderRadius.md,
        height:          55,
        justifyContent:  "center",
        backgroundColor: colors.white,
    },

    selectContent: {
        paddingHorizontal: spacing.md,
        flexDirection:     "row",
        justifyContent:    "space-between",
        alignItems:        "center",
        height:            "100%",
    },

    overlay: {
        flex:            1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent:  "center",
        padding:         spacing.lg,
    },

    dropdown: {
        backgroundColor: colors.white,
        borderRadius:    borderRadius.md,
        maxHeight:       250,
    },

    option: {
        padding:         spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },

    optionSelected: {
        backgroundColor: colors.primaryLight ?? "#EEF2FF",
    },

    optionText: {
        fontSize:   fontSize.md,
        fontWeight: fontWeight.medium,
        color:      colors.textPrimary,
    },

    optionTextSelected: {
        color:      colors.primary,
        fontWeight: fontWeight.semibold,
    },
});