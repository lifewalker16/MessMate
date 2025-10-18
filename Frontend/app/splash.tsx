import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/ChoiceScreen"); 
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#FF7E5F", "#FF4500"]}
      style={styles.container}
    >
      {/* Logo inside wrapper with border */}
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.logo}
        />
      </View>

      <Text style={styles.title}>Mess Mate</Text>
      <Text style={styles.tagline}>Easy meals, one tap away</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60, // perfect circle
    borderWidth: 1,
    borderColor: "#fff",
    overflow: "hidden", // crop image to circle
    justifyContent: "center",
    alignItems: "center",
    // 👇 Shadow for border
  shadowColor: "#000",  
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.3,  
  shadowRadius: 6,  

  // Android shadow
  elevation: 8, 

  },
  logo: {
    width: "115%",
    height: "115%",
    resizeMode: "cover", // fills circle
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
