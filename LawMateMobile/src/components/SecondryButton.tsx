import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";


type SecondryButtonProps = {
  title: string;
  onPress: () => void;
};

export default function SecondryButton({
  title,
  onPress,
}: SecondryButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FFFFFF", // Primary color (blue)
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    width: "15%",
    borderColor: "#2D1F8F",
    borderWidth:2,    
    borderStyle: "solid",
    marginTop:10,
  },
  text: {
    color: "#2D1F8F",
    fontSize: 15,
    fontWeight: "bold",
  },
});
