// app/components/dashboard/StatCard.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatCard({ label, value, sublabel }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {!!sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121212",
    borderRadius: 14,
    padding: 14,
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222",
  },
  label: { color: "#aaa", fontSize: 12, marginBottom: 4 },
  value: { color: "white", fontSize: 22, fontWeight: "700" },
  sublabel: { color: "#777", fontSize: 11, marginTop: 2 },
});
