import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Button } from "react-native";
import Checkbox from 'expo-checkbox';
import { Picker } from '@react-native-picker/picker';
import axios from "axios";

const AdminMenu: React.FC = () => {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const [selectedDay, setSelectedDay] = useState('monday');
  const [menu, setMenu] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [foodItems, setFoodItems] = useState([]);

  useEffect(() => {
    fetchMenu(selectedDay);
  }, [selectedDay]);

  const fetchMenu = (day: string) => {
    axios.get(`http://192.168.1.7:5000/api/admin/menu/${day}`)
      .then(res => {
        setMenu(res.data.menu);
        setFoodItems(res.data.foodItems);
      })
      .catch(err => console.error(err));
  };

  const toggleSelection = (meal: string, food_id: number) => {
    setMenu(prev => {
      const selected = prev[meal];
      return {
        ...prev,
        [meal]: selected.includes(food_id)
          ? selected.filter(id => id !== food_id)
          : [...selected, food_id],
      };
    });
  };

  const saveMenu = (mealType: string, menu_id: number) => {
    const foodIds = menu[mealType];
    axios.post(`http://192.168.1.7:5000/api/admin/menu/${menu_id}`, { foodIds })
      .then(() => alert(`${mealType} menu saved`))
      .catch(err => alert("Error saving menu"));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Select Day:</Text>
      <Picker
        selectedValue={selectedDay}
        onValueChange={value => setSelectedDay(value)}
        style={{ marginBottom: 20 }}
      >
        {days.map(day => <Picker.Item key={day} label={day.toUpperCase()} value={day} />)}
      </Picker>

      {['breakfast', 'lunch', 'dinner'].map(meal => (
        <View key={meal} style={styles.mealSection}>
          <Text style={styles.mealTitle}>{meal.toUpperCase()}</Text>
          {foodItems.map(item => (
            <View key={item.food_id} style={styles.itemRow}>
              <Checkbox
                value={menu[meal]?.includes(item.food_id)}
                onValueChange={() => toggleSelection(meal, item.food_id)}
                color={menu[meal]?.includes(item.food_id) ? '#FF4500' : undefined}
              />
              <Text style={styles.itemText}>{item.name} (Rs. {item.price})</Text>
            </View>
          ))}
          <Button
            title={`Save ${meal}`}
            onPress={() => saveMenu(meal, menu[meal][0]?.menu_id || 1)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default AdminMenu;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  mealSection: { marginBottom: 20 },
  mealTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  itemRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  itemText: { marginLeft: 8 },
});
