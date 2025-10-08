import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Clock } from "lucide-react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import MCIcon from "react-native-vector-icons/MaterialCommunityIcons";

// ----- TypeScript Interfaces -----
interface MenuItem {
  name: string;
  price: number;
}

interface DailyMenu {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

type WeeklyMenu = Record<string, DailyMenu>;

// ----- Component -----
export default function MenuScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenu>({});
  const [loading, setLoading] = useState(true);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // ----- Fetch Weekly Menu -----
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("http://192.168.1.3:5000/menu/weekly");
        if (!response.ok) {
          console.error("Server returned error:", response.status);
          return;
        }

        const data = await response.json();

        // Convert price strings to numbers once
        const convertedMenu: WeeklyMenu = Object.fromEntries(
          Object.entries(data.menu).map(([day, meals]: [string, any]) => [
            day,
            {
              breakfast: meals.breakfast.map((i: any) => ({ ...i, price: parseFloat(i.price) })),
              lunch: meals.lunch.map((i: any) => ({ ...i, price: parseFloat(i.price) })),
              dinner: meals.dinner.map((i: any) => ({ ...i, price: parseFloat(i.price) })),
            },
          ])
        );

        setWeeklyMenu(convertedMenu);
      } catch (err) {
        console.error("Error fetching menu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // ----- Current Day Menu -----
  const todayMenu: DailyMenu = weeklyMenu[dayKeys[selectedDay]] || {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Calendar size={30} color="#FF4500" />
          <Text style={styles.headerTitle}>Weekly Menu</Text>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  selectedDay === index && styles.dayButtonActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedDay(index)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDay === index && styles.dayButtonTextActive,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Day Menu */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF4500" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.menuContainer}>
            <Text style={styles.dayTitle}>{dayNames[selectedDay]}'s Menu</Text>

            <MealCard title="Breakfast" time="8:00 AM - 10:00 AM" items={todayMenu.breakfast} />
            <MealCard title="Lunch" time="12:30 PM - 2:30 PM" items={todayMenu.lunch} />
            <MealCard title="Dinner" time="7:30 PM - 9:30 PM" items={todayMenu.dinner} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ----- Meal Card Component -----
interface MealCardProps {
  title: string;
  time: string;
  items: MenuItem[];
}

function MealCard({ title, time, items }: MealCardProps) {
  const getMealIconAndColor = () => {
    switch (title) {
      case "Breakfast":
        return { icon: <Icon name="coffee" size={20} color="#FFFFFF" />, color: "#B87C4C" };
      case "Lunch":
        return { icon: <Icon name="utensils" size={20} color="#FFFFFF" />, color: "#DC143C" };
      case "Dinner":
        return { icon: <MCIcon name="food-fork-drink" size={20} color="#FFFFFF" />, color: "#8B5CF6" };
      default:
        return { icon: <Icon name="utensils" size={20} color="#FFFFFF" />, color: "#6B3F69" };
    }
  };

  const { icon, color } = getMealIconAndColor();

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={[styles.mealIcon, { backgroundColor: color }]}>{icon}</View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealTitle}>{title}</Text>
          <View style={styles.timeContainer}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.mealTime}>{time}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <View key={index} style={styles.menuItem}>
              <View style={styles.itemDot} />
              <Text style={styles.itemText}>
                {item.name} — ₹{item.price}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#6B7280" }}>No items available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollView: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 24 },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 12,
  },
  daySelector: { paddingHorizontal: 24, marginBottom: 24 },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dayButtonActive: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
  dayButtonText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  dayButtonTextActive: { color: "#FFFFFF" },
  menuContainer: { padding: 24, paddingTop: 0 },
  dayTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: { marginLeft: 16, flex: 1 },
  mealTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  timeContainer: { flexDirection: "row", alignItems: "center" },
  mealTime: { fontSize: 14, color: "#6B7280", marginLeft: 4 },
  itemsContainer: { marginLeft: 8 },
  menuItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginRight: 12,
  },
  itemText: { fontSize: 14, color: "#374151" },
});
