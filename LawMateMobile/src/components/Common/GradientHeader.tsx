import React from "react";
import { Text, StyleSheet, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface Props {
    title: string;
    onBack?: () => void;
}

export default function GradientHeader({ title, onBack }: Props) {
    return (
        <LinearGradient
            colors={["#6249EB", "#1872EA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.row}>
                {onBack && (
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </Pressable>
                )}

                <Text style={styles.title}>{title}</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 100,
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        paddingBottom: 14,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
