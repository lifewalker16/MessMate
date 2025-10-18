import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type FeedbackItem = {
  feedback_id: number;
  user: string;
  category: string;
  stars: number;
  comment: string;
  status: "Pending" | "Reviewed";
};

const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ----- Fetch feedback from backend -----
  const fetchFeedback = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://192.168.1.7:5000/feedback/getPendingFeedback",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add admin token if needed:
            // "Authorization": `Bearer ${token}`
          },
        }
      );

      const data = await response.json();

      if (data.feedback) {
        setFeedback(data.feedback); // Already only pending feedback from backend
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // ----- Mark feedback as reviewed -----
const markAsReviewed = async (id: number) => {
  try {
    // Update frontend immediately
    setFeedback((prev) =>
      prev.map((f) =>
        f.feedback_id === id ? { ...f, status: "Reviewed" } : f
      )
    );

    // Send update to backend
    await fetch(`http://192.168.1.7:5000/feedback/updateStatus/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Reviewed" }),
    });
  } catch (err) {
    console.error("Error updating feedback status:", err);
  }
};


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={{ marginTop: 10, color: "#FF4500" }}>Loading feedback...</Text>
      </View>
    );
  }


  
  return (
    <FlatList
      data={feedback}
      keyExtractor={(item) => item.feedback_id.toString()}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 20, color: "#6B7280" }}>
          No pending feedback
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.user} - {item.category}</Text>
          <Text>Rating: {item.stars} ⭐</Text>
          <Text>{item.comment}</Text>
          <View style={styles.row}>
            {item.status === "Pending" && (
              <TouchableOpacity onPress={() => markAsReviewed(item.feedback_id)}>
                <Text style={[styles.link, { color: "green" }]}>Mark as Reviewed</Text>
              </TouchableOpacity>
            )}
            <Text>Status: {item.status}</Text>
          </View>
        </View>
      )}
    />
  );
};

export default Feedback;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  link: { color: "#FF4500", fontWeight: "600" },
});
