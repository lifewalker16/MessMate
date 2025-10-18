import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Announcements from "./ac";
import Menu from "./m";
import Feedback from "./f";
import Attendance from "./at";
import InviteStudent from "./in";

type Section = "Announcements" | "Menu" | "Feedback" | "Attendance" | "Invite";

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>("Announcements");
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  const toggleMenu = () => {
    Animated.timing(slideAnim, {
      toValue: menuVisible ? -250 : 0,
      duration: 250,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Announcements":
        return <Announcements />;
      case "Menu":
        return <Menu />;
      case "Feedback":
        return <Feedback />;
      case "Attendance":
        return <Attendance />;
      case "Invite":
        return <InviteStudent />;
      default:
        return null;
    }
  };

  const handleSelect = (section: Section) => {
    setActiveSection(section);
    toggleMenu();
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
          <Ionicons name="menu" size={28} color="#FF4500" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeSection}</Text>
      </View>
      <View style={styles.content}>{renderSection()}</View>
      <Animated.View style={[styles.sideMenu, { left: slideAnim }]}>
        {(
          ["Announcements", "Menu", "Feedback", "Attendance", "Invite"] as Section[]
        ).map((section) => (
          <TouchableOpacity
            key={section}
            style={[
              styles.menuItem,
              activeSection === section && styles.activeMenuItem,
            ]}
            onPress={() => handleSelect(section)}
          >
            <Text
              style={[
                styles.menuItemText,
                activeSection === section && styles.activeMenuItemText,
              ]}
            >
              {section}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      {menuVisible && (
        <TouchableOpacity style={styles.backdrop} onPress={toggleMenu} />
      )}
    </SafeAreaView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fffaf5",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 35,
  },
  hamburger: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF4500",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    zIndex: 10,
    paddingTop: 60,
    elevation: 10,
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  activeMenuItem: {
    backgroundColor: "#FF4500",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  activeMenuItemText: {
    color: "#fff",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 5,
  },
});
