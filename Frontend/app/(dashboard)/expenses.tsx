import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { DollarSign, TrendingUp, Utensils, Cookie, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExpensesScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [totalExpense, setTotalExpense] = useState(0);
  const [categories, setCategories] = useState([
    { name: 'Regular Meals', amount: 0, icon: Utensils, color: '#FF4500', percentage: 0 },
    { name: 'Extra Items', amount: 0, icon: Cookie, color: '#FF7E5F', percentage: 0 },
  ]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  const fetchExpenses = async () => {
    if (!userId) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.1.3:5000/expense/total/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Update totals
      setTotalExpense(data.total);

      // Update categories
      const updatedCategories = categories.map(cat => {
        const catData = data.byCategory.find((c: any) => c.category === cat.name);
        const amount = catData ? catData.total : 0;
        const percentage = data.total > 0 ? (amount / data.total) * 100 : 0;
        return { ...cat, amount, percentage };
      });
      setCategories(updatedCategories);

      // Recent transactions
      setRecentTransactions(data.recentTransactions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addExtraItem = async () => {
    if (!newItemName || !newItemPrice) return Alert.alert('Error', 'Enter item name and price');
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`http://192.168.1.3:5000/expense/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_id: userId,
          name: newItemName,
          price: parseFloat(newItemPrice),
          category: 'Extra Items',
        }),
      });
      if (res.ok) {
        setModalVisible(false);
        setNewItemName('');
        setNewItemPrice('');
        fetchExpenses(); // refresh
      } else {
        Alert.alert('Error', 'Could not add item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) setUserId(JSON.parse(storedUser).user_id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) fetchExpenses();
  }, [userId]);

  const messBudgetLimit = 800;
  const percentageUsed = (totalExpense / messBudgetLimit) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <DollarSign size={24} color="#FF4500" />
          <Text style={styles.headerTitle}>Mess Expense Tracker</Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period && styles.periodButtonTextActive]}>
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Budget Overview */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Mess Budget - This {selectedPeriod}</Text>
            <TrendingUp size={20} color="#FF4500" />
          </View>
          <View style={styles.budgetAmount}>
            <Text style={styles.currentAmount}>₹{totalExpense}</Text>
            <Text style={styles.budgetLimit}>/ ₹{messBudgetLimit}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(percentageUsed, 100)}%`, backgroundColor: '#FF4500' }]} />
          </View>
          <Text style={styles.budgetSubtext}>
            {percentageUsed < 80 ? 'Great! You\'re managing mess expenses well' : 'Consider reducing extra items to save money'}
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mess Categories</Text>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <category.icon size={20} color="#FFFFFF" />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryPercentage}>{category.percentage.toFixed(0)}% of total</Text>
                </View>
                <Text style={styles.categoryAmount}>₹{category.amount}</Text>
              </View>
              <View style={styles.categoryProgress}>
                <View style={[styles.categoryProgressFill, { width: `${category.percentage}%`, backgroundColor: category.color }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.transactionHeader}>
            <Text style={styles.sectionTitle}>Recent Mess Purchases</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Plus size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{tx.description}</Text>
                <Text style={styles.transactionItems}>{tx.items.join(' • ')}</Text>
                <View style={styles.transactionMeta}>
                  <Text style={styles.transactionDate}>{tx.date}</Text>
                  <Text style={styles.transactionCategory}>• {tx.category}</Text>
                </View>
              </View>
              <Text style={styles.transactionAmount}>₹{tx.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Extra Item Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.5)' }}>
          <View style={{ width:'80%', backgroundColor:'#fff', borderRadius:12, padding:20 }}>
            <Text style={{ fontSize:18, fontWeight:'bold', marginBottom:12 }}>Add Extra Item</Text>
            <TextInput
              placeholder="Item Name"
              value={newItemName}
              onChangeText={setNewItemName}
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:12 }}
            />
            <TextInput
              placeholder="Price"
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
              style={{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:8, marginBottom:12 }}
            />
            <View style={{ flexDirection:'row', justifyContent:'flex-end' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginRight:12 }}>
                <Text style={{ color:'#FF4500', fontWeight:'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addExtraItem}>
                <Text style={{ color:'#FF4500', fontWeight:'bold' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#FF4500',
    borderColor: '#FF4500',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  budgetAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  budgetLimit: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF4500',
    borderRadius: 4,
  },
  budgetSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryProgress: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FF4500',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  transactionItems: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});