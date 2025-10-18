import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";

const InviteStudent: React.FC = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const handleInvite = async () => {
    if (!fullName || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const res = await axios.post("http://192.168.1.7:5000/api/admin/invite-student", {
        full_name: fullName,
        email,
      });
      Alert.alert("Success", "Invitation sent successfully!");
      setFullName("");
      setEmail("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send invitation");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invite a Student</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter full name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter student email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: "#FF4500" }]} onPress={handleInvite}>
        <Text style={styles.buttonText}>Send Invite</Text>
      </TouchableOpacity>
    </View>
  );
};

export default InviteStudent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fffaf5",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
});
