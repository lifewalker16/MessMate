import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const ChoiceScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 🧩 Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/logo.png") as ImageSourcePropType}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 🏷️ Titles */}
        <Text style={styles.title}>Welcome to MessMate</Text>
        <Text style={styles.subtitle}>
          Please select your login type to continue
        </Text>

        {/* 🔸 Student Login (same gradient as login.tsx) */}
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          style={{ width: "100%", marginTop: 10 }}
        >
          <LinearGradient
            colors={["#FF7E5F", "#FF4500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Student Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* ⚫ Admin Login (gradient black shade) */}
        <TouchableOpacity
          onPress={() => router.push("/A/al")}
          style={{ width: "100%", marginTop: 15 }}
        >
          <LinearGradient
            colors={["#434343", "#000000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Admin Login</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footerNote}>© 2025 MessMate</Text>
      </View>
    </View>
  );
};

export default ChoiceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fffaf5",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    width: "100%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footerNote: {
    marginTop: 20,
    color: "gray",
    fontSize: 14,
    fontWeight: "600",
  },
});
