import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";


type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function PrimaryButton({
  title,
  onPress,
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2D1F8F", // Primary color (blue)
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "15%",
    marginTop:10,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
