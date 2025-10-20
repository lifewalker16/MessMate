import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, Bell, CircleHelp as HelpCircle, LogOut, ChevronRight, Mail } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = "http://192.168.1.7:5000";

type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
  Dashboard: undefined;
  ChoiceScreen: undefined; // ✅ Added
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          // If no token, go to ChoiceScreen
          navigation.reset({ index: 0, routes: [{ name: "ChoiceScreen" }] });
          return;
        }

        const res = await fetch(`${API_BASE_URL}/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (res.ok) setUserInfo(data.user);
        else console.error("Error fetching profile:", data.error);
      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      navigation.reset({
        index: 0,
        routes: [{ name: "ChoiceScreen" }],
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { icon: Settings, title: 'Account Settings', subtitle: 'Manage your account preferences', color: '#6B7280' },
    { icon: Bell, title: 'Notifications', subtitle: 'Configure notification settings', color: '#F59E0B' },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'Get help and contact support', color: '#FF4500' },
  ];

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF4500" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );

  if (!userInfo)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: "center", marginTop: 50 }}>Failed to load profile</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <User size={24} color="#FF4500" />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.full_name}</Text>
            <Text style={styles.profileId}>Student ID: {userInfo.id}</Text>
            <Text style={styles.profileJoinDate}>
              Member since {userInfo.join_date ? new Date(userInfo.join_date).toLocaleDateString() : "N/A"}
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <ContactItem icon={Mail} label="Email" value={userInfo.email} color="#10B981" />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ContactItemProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  color: string;
}

function ContactItem({ icon: Icon, label, value, color }: ContactItemProps) {
  return (
    <View style={styles.contactItem}>
      <View style={[styles.contactIcon, { backgroundColor: color }]}>
        <Icon size={16} color="#FFFFFF" />
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginLeft: 12 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: { marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FF4500', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { alignItems: 'center' },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  profileId: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  profileJoinDate: { fontSize: 12, color: '#9CA3AF' },
  section: { padding: 24, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  contactIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactLabel: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  contactValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444', marginLeft: 8 },
});
