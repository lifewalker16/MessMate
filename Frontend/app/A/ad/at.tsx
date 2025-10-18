import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

const AttendanceCountModule = () => {
  const [counts, setCounts] = useState({ breakfast: 0, lunch: 0, dinner: 0 });
  const [emailStatus, setEmailStatus] = useState({ breakfast: false, lunch: false, dinner: false });
  useEffect(() => {
    const fetchAttendanceCounts = async () => {
      try {
        const res = await axios.get(
          "http://192.168.1.7:5000/api/admin/attendance/today-students"
        );

        setCounts({
          breakfast: res.data.breakfast.length,
          lunch: res.data.lunch.length,
          dinner: res.data.dinner.length,
        });
      } catch (err) {
        console.error("Error fetching attendance:", err);
      }
    };

    fetchAttendanceCounts();
  }, []);

  
useEffect(() => {
  // Define the function inside useEffect
  const fetchEmailStatus = async () => {
    try {
      const res = await axios.get(
        "http://192.168.1.7:5000/api/admin/attendance/email-status"
      );
      setEmailStatus(res.data);
    } catch (err) {
      console.error("Error fetching email status:", err);
    }
  };

  // Fetch immediately on mount
  fetchEmailStatus();

  // Set interval to fetch every 1 minute
  const interval = setInterval(fetchEmailStatus, 60000);

  // Cleanup on unmount
  return () => clearInterval(interval);
}, []);



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Today's Attendance Counts</Text>

    <View style={styles.card}>
      <Text style={styles.meal}>Breakfast</Text>
      <Text style={styles.count}>{counts.breakfast} students</Text>
      <Text style={{ marginTop: 5, color: emailStatus.breakfast ? "green" : "red" }}>
        {emailStatus.breakfast ? "Email Sent ✅" : "Pending ⏳"}
      </Text>
    </View>


    <View style={styles.card}>
      <Text style={styles.meal}>Lunch</Text>
      <Text style={styles.count}>{counts.lunch} students</Text>
      <Text style={{ marginTop: 5, color: emailStatus.lunch ? "green" : "red" }}>
        {emailStatus.lunch ? "Email Sent ✅" : "Pending ⏳"}
      </Text>
    </View>


      <View style={styles.card}>
        <Text style={styles.meal}>Dinner</Text>
        <Text style={styles.count}>{counts.dinner} students</Text>
        <Text style={{ marginTop: 5, color: emailStatus.dinner ? "green" : "red" }}>
          {emailStatus.dinner ? "Email Sent ✅" : "Pending ⏳"}
        </Text>
      </View>

    </ScrollView>
  );
};

export default AttendanceCountModule;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#FF4500",
  },
  card: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
    shadowColor: "#FF4500",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  meal: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF4500",
  },
});
