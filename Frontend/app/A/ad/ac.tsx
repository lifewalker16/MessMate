import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, TextInput, Alert } from "react-native";
import axios from "axios";

type Announcement = { id: number; title: string; content: string };

const API_URL = "http://192.168.1.7:5000";

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSave = async () => {
    if (!title || !content) return Alert.alert("Error", "Enter title and content");

    try {
      if (editingId !== null) {
        await axios.put(`${API_URL}/announcements/${editingId}`, { title, content });
      } else {
        await axios.post(`${API_URL}/announcements`, { title, content });
      }
      fetchAnnouncements();
      setModalVisible(false);
      setTitle(""); setContent(""); setEditingId(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) { console.log(err); }
  };

  return (
    <View>
      <TouchableOpacity style={[styles.button, { backgroundColor: "#FF4500", marginBottom: 10 }]} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add Announcement</Text>
      </TouchableOpacity>

      <FlatList
        data={announcements}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.content}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => { setTitle(item.title); setContent(item.content); setEditingId(item.id); setModalVisible(true); }}>
                <Text style={styles.link}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.link, { color: "red" }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal for Add/Edit */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Edit" : "Add"} Announcement</Text>
            <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={[styles.input, { marginBottom: 10 }]} />
            <TextInput placeholder="Content" value={content} onChangeText={setContent} style={[styles.input, { height: 80, textAlignVertical: "top" }]} multiline />
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#FF4500" }]} onPress={handleSave}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setModalVisible(false)}>
              <Text style={styles.link}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Announcements;

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
  button: { padding: 10, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  link: { color: "#FF4500", fontWeight: "600" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalCard: { width: "80%", backgroundColor: "white", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 10 },
  modalButton: { padding: 12, borderRadius: 10, alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
