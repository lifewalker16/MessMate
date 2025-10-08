import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { MotiView } from "moti";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Easing } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, {
  Rect,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Line,
} from "react-native-svg";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  DollarSign,
  Clock,
  CircleCheck as CheckCircle,
} from "lucide-react-native";
import { Dimensions } from "react-native";
import AlertModal from "@/components/AlertModal";


export default function HomeScreen() {
  // ✅ Boolean meal status
  const [mealStatus, setMealStatus] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

        const [alertVisible, setAlertVisible] = useState(false);
        const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");
        const [alertTitle, setAlertTitle] = useState("");
        const [alertMessage, setAlertMessage] = useState("");
        
        const showAlert = (
          type: "success" | "error" | "warning",
          title: string,
          message: string
        ) => {
          setAlertType(type);
          setAlertTitle(title);
          setAlertMessage(message);
          setAlertVisible(true);
        };


          const [messAttendance, setMessAttendance] = useState(false);
          const [showConfetti, setShowConfetti] = useState(false);
          const [activeModal, setActiveModal] = useState<null | "notice" | "expense">(null);
          const [weeklyData, setWeeklyData] = useState<number[]>([]);
          const [user, setUser] = useState<{ user_id: number; full_name: string } | null>(
            null
          );

          const currentDate = new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          // Circle progress
          const presentPercent = messAttendance ? 88 : 60;
          const radius = 60;
          const strokeWidth = 12;
          const circumference = 2 * Math.PI * radius;
          const progress = (presentPercent / 100) * circumference;

          const screenWidth = Dimensions.get("window").width;
          const days = ["M", "T", "W", "T", "F", "S", "S"];
          const chartHeight = 150;
          const maxValue = 3;
        const [mealItems, setMealItems] = useState<{
          breakfast: { name: string; price: number }[];
          lunch: { name: string; price: number }[];
          dinner: { name: string; price: number }[];
        }>({ breakfast: [], lunch: [], dinner: [] });


          // Meal cutoff times
            const cutoffTimes = {
              breakfast: { hour: 8, minute: 0 },
              lunch: { hour: 13, minute: 15 },
              dinner: { hour: 20, minute: 0 },
            };

            const getNextMeal = () => {
              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();

              const breakfastCutoff = cutoffTimes.breakfast.hour * 60 + cutoffTimes.breakfast.minute; // 480
              const lunchCutoff = cutoffTimes.lunch.hour * 60 + cutoffTimes.lunch.minute; // 795
              const dinnerCutoff = cutoffTimes.dinner.hour * 60 + cutoffTimes.dinner.minute; // 1200

              if (currentMinutes < breakfastCutoff) return "breakfast";
              if (currentMinutes < lunchCutoff) return "lunch";
              if (currentMinutes < dinnerCutoff) return "dinner";
              return null; // all meals done today
            };
          
            // Returns "MMM D" format
              const formatDate = (date: Date) => {
                const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
                return date.toLocaleDateString("en-US", options);
              };

              // Get current week's Monday and Sunday
              const getWeekRange = () => {
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
                const monday = new Date(now);
                monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6); // Sunday
                return `${formatDate(monday)} - ${formatDate(sunday)}`;
              };  


          // ✅ Mark attendance API
        const markMeal = async (meal: "breakfast" | "lunch" | "dinner") => {
          const token = await AsyncStorage.getItem("token");
          if (!token) return;

          try {
            // Calculate total for selected meal
            const totalAmount = mealItems[meal].reduce((sum, item) => sum + item.price, 0);

            const response = await fetch(
              "http://192.168.1.3:5000/dashboard/attendance/mark",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ meal, amount: totalAmount }),
              }
            );

            const data = await response.json();
            if (response.ok) {
              setMealStatus((prev) => ({ ...prev, [meal]: true }));
              showAlert("success", "Attendance Marked", `₹${totalAmount} added for ${meal}`);
              fetchWeekly();
            } else {
              showAlert("error", "Error", data.error || "Could not mark attendance");
            }
          } catch (err) {
            console.error(err);
          }
        };


          // ✅ Fetch user profile
          useEffect(() => {
            const fetchUser = async () => {
              try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) setUser(JSON.parse(storedUser));

                const token = await AsyncStorage.getItem("token");
                if (!token) return;

                const response = await fetch("http://192.168.1.3:5000/profile", {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();

                if (response.ok && data.user) {
                  setUser(data.user);
                }
              } catch (err) {
                console.error("Error fetching user:", err);
              }
            };

            fetchUser();
          }, []);

          // ✅ Fetch today’s attendance
          useEffect(() => {
            const fetchAttendance = async () => {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;

              try {
                const response = await fetch(
                  "http://192.168.1.3:5000/dashboard/attendance/today",
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const data = await response.json();

                if (response.ok) {
                  setMealStatus({
                    breakfast: !!data.breakfast,
                    lunch: !!data.lunch,
                    dinner: !!data.dinner,
                  });
                }
              } catch (err) {
                console.error(err);
              }
            };

            fetchAttendance();
          }, []);

          // ✅ Fetch weekly data
            const fetchWeekly = async () => {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;

              try {
                const response = await fetch(
                  "http://192.168.1.3:5000/dashboard/weekly-attendance",
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                const data = await response.json();
                if (response.ok) {
                  setWeeklyData(data.weeklyData);
                }
              } catch (err) {
                console.error(err);
              }
            };

            useEffect(() => {
              fetchWeekly();
            }, []);

          //Fetch today’s meal items
          useEffect(() => {
          const fetchTodayMeals = async () => {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            try {
              const response = await fetch("http://192.168.1.3:5000/dashboard/today-meal", {
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                setMealItems(data.mealItems);
              }
            } catch (err) {
              console.error(err);
            }
          };

          fetchTodayMeals();
        }, []);


  return (
    
    <SafeAreaView style={styles.container}>
      <AlertModal
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      {/* ✅ Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Good Evening,</Text>
          <Text style={styles.userName}>{user?.full_name || "Resident"}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <MaterialCommunityIcons name="account-circle" size={36} color="#0BA6DF" />
        </View>
      </View>

      {/* ✅ Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 5 }}
      >
        {/* Notice & Expense */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => setActiveModal("notice")}
          >
            <View style={styles.badgeNB}>
              <Text style={styles.badgeTextNB}>1</Text>
            </View>
            <MaterialCommunityIcons name="bullhorn" size={24} color="#FF7D29" />
            <Text style={styles.cardLabel}>Notice Board</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardButton}
            onPress={() => setActiveModal("expense")}
          >
            <DollarSign size={24} color="#78C841" />
            <Text style={styles.cardLabel}>Expense</Text>
          </TouchableOpacity>
        </View>

      {/* Attendance + Meals */}
      <View style={styles.attendanceMealsRow}>  
          
        <View style={styles.mealCard}>
          <Text style={styles.cardTitle}>
            {getNextMeal()
              ? getNextMeal().charAt(0).toUpperCase() + getNextMeal().slice(1)
              : "Meal"}{" "}
            Menu
          </Text>

        {(mealItems[getNextMeal() as "breakfast" | "lunch" | "dinner"] || []).map(
          (item, index) => (
            <View key={index} style={styles.mealItemRow}>
              <Text style={styles.mealItemName}>{item.name}</Text>
              <Text style={styles.mealItemPrice}>₹{item.price}</Text>
            </View>
          )
        )}

        </View>

          {/* Meals */}
          <View style={styles.mealColumn}>
            <Text style={styles.mealLabel}>Mark Attendance</Text>

            {["breakfast", "lunch", "dinner"].map((meal) => (
              <TouchableOpacity key={meal} onPress={() => markMeal(meal as any)}>
                <View style={styles.mealCardSmall}>
                  <Image
                    source={
                      meal === "breakfast"
                        ? require("../../assets/images/breakfast.jpg")
                        : meal === "lunch"
                        ? require("../../assets/images/lunch.jpg")
                        : require("../../assets/images/dinner.jpg")
                    }
                    style={styles.mealBackground}
                    resizeMode="cover"
                  />
                  <View style={styles.overlay}>
                    <View style={styles.overlayContent}>
                      <Text style={styles.mealText}>
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Text>
                    </View>
                    {mealStatus[meal as "breakfast" | "lunch" | "dinner"] && (
                      <View style={styles.checkBadge}>
                        <CheckCircle size={18} color="#22C55E" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Next Meal */}
        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Clock size={20} color="#0BA6DF" />
            <Text style={styles.summaryLabel}>Next Meal</Text>

            {getNextMeal() ? (
              <Text style={styles.summaryValue}>
                {getNextMeal() === "breakfast"
                  ? "Breakfast - 8:30 AM"
                  : getNextMeal() === "lunch"
                  ? "Lunch - 1:45 PM"
                  : "Dinner - 8:30 PM"}
              </Text>
            ) : (
              <Text style={styles.summaryValue}>All meals done</Text>
            )}
          </View>

          {getNextMeal() ? (
            mealStatus[getNextMeal() as "breakfast" | "lunch" | "dinner"] ? (
              <Text style={[styles.attendanceNote, { color: "#22C55E", fontWeight: "700" }]}>
                ✅ Attendance marked
              </Text>
            ) : (
              <Text style={styles.attendanceNote}>
                Mark your attendance before{" "}
                <Text style={{ fontWeight: "700", color: "#EF4444" }}>
                  {getNextMeal() === "breakfast"
                    ? "8:00 AM"
                    : getNextMeal() === "lunch"
                    ? "1:15 PM"
                    : "8:00 PM"}
                </Text>
              </Text>
            )
          ) : (
            <Text style={styles.attendanceNote}>No upcoming meals today</Text>
          )}
        </View>


        {/* Weekly Overview */}
        <View style={styles.cardweekly}>
          <Text style={styles.cardTitle}>Weekly Overview</Text>
          <Text style={styles.dateText}>{getWeekRange()}</Text>

          <View style={styles.chartContainer}>
            <Svg height={chartHeight + 40} width={screenWidth - 60}>
              <Defs>
                <LinearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#0BA6DF" stopOpacity="0.9" />
                  <Stop offset="100%" stopColor="#0BA6DF" stopOpacity="0.4" />
                </LinearGradient>
              </Defs>

              {[1, 2, 3].map((i) => (
                <Line
                  key={i}
                  x1={0}
                  y1={chartHeight - (i / maxValue) * chartHeight}
                  x2={screenWidth - 60}
                  y2={chartHeight - (i / maxValue) * chartHeight}
                  stroke="#E5E7EB"
                  strokeWidth={1}
                />
              ))}

              {weeklyData.map((value, index) => {
                const totalBars = weeklyData.length || 7;
                const availableWidth = screenWidth - 100;
                const spacing = availableWidth / totalBars;
                const barX = index * spacing + spacing / 4;
                const barHeight = (value / maxValue) * chartHeight;
                const barY = chartHeight - barHeight;
                const isPeak = value === maxValue;

                return (
                  <Rect
                    key={index}
                    x={barX}
                    y={barY}
                    width={spacing / 2}
                    height={barHeight}
                    fill={isPeak ? "#FF7D29" : "url(#barGradient)"}
                    rx={6}
                  />
                );
              })}

              {days.map((day, index) => {
                const totalBars = weeklyData.length || 7;
                const availableWidth = screenWidth - 100;
                const spacing = availableWidth / totalBars;
                const centerX = index * spacing + spacing / 2;
                return (
                  <SvgText
                    key={index}
                    x={centerX}
                    y={chartHeight + 20}
                    fill="#6B7280"
                    fontSize={12}
                    textAnchor="middle"
                  >
                    {day}
                  </SvgText>
                );
              })}

              {weeklyData.map((value, index) => {
                const totalBars = weeklyData.length || 7;
                const availableWidth = screenWidth - 100;
                const spacing = availableWidth / totalBars;
                const centerX = index * spacing + spacing / 2;
                return (
                  <SvgText
                    key={index}
                    x={centerX}
                    y={chartHeight - (value / maxValue) * chartHeight - 6}
                    fill="#111827"
                    fontSize={11}
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {value}
                  </SvgText>
                );
              })}
            </Svg>
          </View>
        </View>
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon count={150} origin={{ x: 200, y: -10 }} fadeOut />
      )}

      {/* Modal */}
      <Modal
        transparent={true}
        visible={activeModal !== null}
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalBackground}>
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "timing",
              duration: 300,
              easing: Easing.out(Easing.ease),
            }}
            style={styles.modalContainer}
          >
            {activeModal === "notice" && (
              <>
                <Text style={styles.modalTitle}>📢 Announcement</Text>
                <Text style={styles.modalMessage}>
                  Mess will remain closed on Sunday due to maintenance.
                </Text>
              </>
            )}

            {activeModal === "expense" && (
              <>
                <Text style={styles.modalTitle}>💰 Expense Summary</Text>
                <Text style={styles.modalMessage}>Today: ₹50</Text>
                <Text style={styles.modalMessage}>This Week: ₹490</Text>
                <Text style={styles.modalMessage}>This Month: ₹1880</Text>
              </>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setActiveModal(null)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollView: {
     flex: 1 
    },

  // ✅ Header fixed styling
  header: {
  paddingHorizontal: 20,
  paddingTop: 16,
  paddingBottom: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
  backgroundColor: "#FFF",
  borderBottomLeftRadius: 20, // 👈 Rounded corners
  borderBottomRightRadius: 20,
  elevation: 6, // 👈 Android shadow
  shadowColor: "#000", // 👈 iOS shadow
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  // 👈 spacing below header
},
cardHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 6, // spacing below header
},

headerRight: {
  flexDirection: "row",
  marginRight:5,

  alignItems: "center",
},

avatar: {
  width: 36,
  height: 36,
  borderRadius: 18, // makes it round
  marginLeft: 12,
},
attendanceNote: {
  marginTop: 6,
  fontSize: 12,
  color: "#EF4444",   // red to highlight urgency
  fontWeight: "500",
},
welcomeText: {
  fontSize: 16,
  fontWeight: "500",
  color: "#6B7280",
  marginBottom: -2,
},

userName: {
  fontSize: 18, // 👈 bigger for emphasis
  fontWeight: "700",
  color: "#000000", // 👈 accent color (blue) instead of dark gray
},

dateText: {
  fontSize: 13,
  color: "#9CA3AF",
  fontWeight: "500",
  marginRight:5,
},

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    textAlign: "center",
  },
 
  circleContainer: { alignItems: "center" },
  circleTextContainer: {
    position: "absolute",
    top: 50,
    alignItems: "center",
  },
  circleValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  circleLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  cardweekly: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  summaryBox: {
    width: 60,
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  summaryNo: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0BA6DF",
  },
  summaryText: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  attendanceSummary: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  badge: {
    marginTop: 6,
    backgroundColor: "#EBEBEB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0BA6DF",
  },
  mealCardSmall: {
    width: 100,
    height: 70,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 2,
    backgroundColor: "#F9FAFB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  // mealCardActive: {
  // borderWidth: 2,
  // borderColor: "#22C55E", // green border when marked
  // },
  mealBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  overlay: {
...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.25)", // dark overlay
  },
  overlayContent: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},
mealText: {
  fontSize: 13,
  fontWeight: "700",
  color: "#fff",
  textShadowColor: "rgba(0,0,0,0.6)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
checkBadge: {
  position: "absolute",
  top: 6,
  right: 6,
  backgroundColor: "#FFF",
  borderRadius: 20,
  padding: 2,
  elevation: 2,
},
  quickChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    elevation: 2,
  },
  quickText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  summaryRow: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  attendanceMealsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  attendanceCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    alignItems: "center",
    elevation: 3,
  },
  mealColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  mealLabel: {
  fontSize: 15,
  fontWeight: "700",
  color: "#111827",
  marginBottom: 2,
  textAlign: "center",
},
row: {
  flexDirection: "row",
  justifyContent: "space-between",
  width: "90%",
  marginVertical: 20,
  marginLeft:15,
},
cardButton: {
  flex: 1,
  backgroundColor: "#fff",
  padding: 16,
  marginHorizontal: 6,
  borderRadius: 12,
  alignItems: "center",
  elevation: 3,
},
cardLabel: {
  marginTop: 8,
  fontSize: 14,
  fontWeight: "600",
},
modalBackground: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},
modalContainer: {
  width: "80%",
  backgroundColor: "white",
  padding: 20,
  borderRadius: 15,
  alignItems: "center",
},
modalTitle: {
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center",
},
modalMessage: {
  fontSize: 16,
  textAlign: "center",
  marginBottom: 10,
},
closeButton: {
  backgroundColor: "#e74c3c",
  paddingHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 8,
  marginTop: 15,
},
closeText: {
  color: "white",
  fontWeight: "bold",
},
badgeNB: {
  position: "absolute",
  top: -10,
  right: -5,
  backgroundColor: "red",
  borderRadius: 10,
  minWidth: 18,
  height: 18,
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1,
},
badgeTextNB: {
  color: "white",
  fontSize: 10,
  fontWeight: "bold",
},
mealCard: {
  backgroundColor: "#FFF",
  borderRadius: 16,
  padding: 16,
  marginHorizontal: 20,
  marginBottom: 16,
  elevation: 3,
},

mealItemRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 8,
  borderBottomWidth: 0.5,
  borderBottomColor: "#E5E7EB",
},

mealItemName: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},

mealItemPrice: {
  fontSize: 14,
  fontWeight: "700",
  color: "#0BA6DF",
},


});
