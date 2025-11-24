// app/components/dashboard/Section.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Section({ title, children }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16 },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    backgroundColor: "#0c0c0c",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
});
