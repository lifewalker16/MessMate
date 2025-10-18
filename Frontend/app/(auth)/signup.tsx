import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import axios from "axios";

// ✅ Custom Alert Component
function AlertModal({ visible, type, title, message, onClose }) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "warning";
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Ionicons
            name={getIcon()}
            size={50}
            color={type === "success" ? "green" : type === "error" ? "red" : "orange"}
            style={{ marginBottom: 10 }}
          />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={{ width: "100%", marginTop: 15 }}>
            <LinearGradient colors={["#FF7E5F", "#FF4500"]} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (type, title, message) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  // Timer state
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const otpInputs = useRef<TextInput[]>([]);

  const API_URL = "http://192.168.1.7:5000";

  // Send OTP from backend
  const handleVerifyEmail = async () => {
    if (!email) {
      showAlert("error", "Error", "Please enter your email first.");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/verifyEmail`, { email });
      showAlert("success", "Success", res.data.message);
      setIsEmailVerified(true);
      startTimer();
    } catch (err: any) {
      console.log("Verify Email Error:", err.response?.data || err.message);
      showAlert("error", "Error", err.response?.data?.error || "Something went wrong");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await axios.post(`${API_URL}/verifyEmail`, { email });
      showAlert("success", "OTP Resent", res.data.message);
      startTimer();
    } catch (err: any) {
      showAlert("error", "Error", err.response?.data?.error || "Failed to resend OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      showAlert("error", "Error", "Please enter the 4-digit OTP.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/verifyOtp`, { email, otp: otpCode });
      showAlert("success", "Success", res.data.message);
      setIsOtpVerified(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err: any) {
      showAlert("error", "Error", err.response?.data?.error || "Invalid OTP");
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1);
    setOtp(newOtp);
    if (text && index < 3) otpInputs.current[index + 1].focus();
    if (!text && index > 0) otpInputs.current[index - 1].focus();
  };

  const handleSignup = async () => {
    if (!agreeTerms) {
      showAlert("error", "Error", "You must agree to the Terms and Conditions.");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("error", "Error", "Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/signup`, {
        full_name: fullName,
        email,
        password,
      });
      showAlert("success", "Success", res.data.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      showAlert("error", "Error", err.response?.data?.error || "Signup failed");
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(60);

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our hostel mess management system</Text>

        {/* Full Name */}
        <View style={[styles.inputContainer, focusedInput === "fullName" && styles.inputFocused]}>
          <Ionicons name="person-outline" size={20} color="gray" />
          <TextInput
            style={styles.inputField}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
            onFocus={() => setFocusedInput("fullName")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Email + Verify */}
        <View style={[styles.inputContainer, focusedInput === "email" && styles.inputFocused]}>
          <Ionicons name="mail-outline" size={20} color="gray" />
          <TextInput
            style={[styles.inputField, isEmailVerified && { color: "gray" }]}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isEmailVerified}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
          {!isEmailVerified && (
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmail}>
              <Text style={styles.verifyText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* OTP */}
        {isEmailVerified && !isOtpVerified && (
          <View>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputs.current[index] = ref!)}
                  style={styles.inputBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                />
              ))}
              <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
                <Text style={styles.verifyText}>Submit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend available in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Passwords */}
        {isOtpVerified && (
          <>
            <View style={[styles.inputContainer, focusedInput === "password" && styles.inputFocused]}>
              <Ionicons name="lock-closed-outline" size={20} color="gray" />
              <TextInput
                style={styles.inputField}
                placeholder="Create password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="gray" />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, focusedInput === "confirmPassword" && styles.inputFocused]}>
              <Ionicons name="checkmark-done-outline" size={20} color="gray" />
              <TextInput
                style={styles.inputField}
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedInput("confirmPassword")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            <View style={styles.checkboxContainer}>
              <Checkbox value={agreeTerms} onValueChange={setAgreeTerms} color={agreeTerms ? "#FF7E5F" : undefined} />
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>Terms and Conditions</Text>
              </Text>
            </View>

            <TouchableOpacity onPress={handleSignup} style={{ marginTop: 15 }} disabled={!agreeTerms}>
              <LinearGradient
                colors={["#FF7E5F", "#FF4500"]}
                style={[styles.button, !agreeTerms && { opacity: 0.5 }]}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footer}>
          Already have an account? {" "}
          <Text style={styles.link} onPress={() => router.push("/(auth)/login")}>
            Sign in here
          </Text>
        </Text>
      </View>

      <Text style={styles.appFooter}>MessMate</Text>

      {/* ✅ Custom Alert Modal */}
      <AlertModal
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fffaf5" },
  card: { width: "90%", backgroundColor: "white", borderRadius: 16, padding: 22, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 6 },
  logoContainer: { alignItems: "center", justifyContent: "center", marginBottom: 10 },
  logo: { width: 90, height: 90 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 },
  subtitle: { textAlign: "center", marginBottom: 18, color: "gray", fontSize: 14 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 10, paddingHorizontal: 10, marginBottom: 15, backgroundColor: "#fafafa" },
  inputField: { flex: 1, padding: 12 },
  inputFocused: { borderColor: "#FF7E5F" },
  button: { width: "100%", padding: 15, borderRadius: 10, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  buttonText: { color: "white", fontSize: 17, fontWeight: "600", letterSpacing: 0.5 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  checkboxText: { marginLeft: 8, color: "gray", fontSize: 13 },
  link: { color: "#FF4500", fontWeight: "600" },
  footer: { textAlign: "center", marginTop: 15, color: "gray", fontSize: 14 },
  appFooter: { textAlign: "center", marginTop: 12, color: "gray", fontSize: 14,fontWeight:600 },
  verifyButton: { backgroundColor: "#FF7E5F", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, marginLeft: 6 },
  verifyText: { color: "white", fontWeight: "600", fontSize: 13 },
  otpContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, alignItems: "center" },
  inputBox: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, width: 50, height: 50, textAlign: "center", fontSize: 18 },
  resendContainer: { alignItems: "center", marginBottom: 15 },
  resendText: { color: "#FF4500", fontWeight: "600", fontSize: 14 },
  timerText: { color: "gray", fontSize: 13 },

  // ✅ Modal Styles
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { width: "80%", backgroundColor: "white", borderRadius: 16, padding: 20, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, textAlign: "center" },
  modalMessage: { fontSize: 14, color: "gray", textAlign: "center" },
  modalButton: { padding: 12, borderRadius: 10, alignItems: "center" },
  modalButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});
