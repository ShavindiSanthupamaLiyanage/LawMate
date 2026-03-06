import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
    title: string;
    value: string;
    backgroundColor: string;
    accentColor: string;
}

const SummaryCard: React.FC<Props> = ({
                                          title,
                                          value,
                                          backgroundColor,
                                          accentColor,
                                      }) => {
    return (
        <View style={[styles.card, { backgroundColor }]}>
            <View style={[styles.corner, { backgroundColor: accentColor }]} />
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
        </View>
    );
};

export default SummaryCard;

const styles = StyleSheet.create({
    card: {
        width: "48%",
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        position: "relative",
        overflow: "hidden",
    },
    title: {
        fontSize: 14,
        fontWeight: "500",
        color: "#333",
    },
    value: {
        fontSize: 22,
        fontWeight: "700",
        marginTop: 10,
    },
    corner: {
        position: "absolute",
        top: -10,
        right: -10,
        width: 50,
        height: 50,
        borderRadius: 25,
    },
});