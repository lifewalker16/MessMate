import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageSquare, Star, Send, ThumbsUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [recentFeedback, setRecentFeedback] = useState([]);

  const categories = [
    { id: 'general', label: 'General', color: '#FF4500' },
    { id: 'food', label: 'Food Quality', color: '#FF7E5F' },
    { id: 'cleanliness', label: 'Cleanliness', color: '#F59E0B' },
    { id: 'staff', label: 'Staff Behavior', color: '#FF7E5F' },
    { id: 'facilities', label: 'Facilities', color: '#EF4444' },
  ];

  // Fetch feedback on component mount
useEffect(() => {
  const interval = setInterval(fetchRecentFeedback, 5000); // refresh every 5 seconds
  return () => clearInterval(interval); // cleanup on unmount
}, []);


  const fetchRecentFeedback = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Assuming you store JWT after login
      const response = await fetch('http://192.168.1.7:5000/feedback/getUserFeedback', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setRecentFeedback(data.feedback);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch feedback');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to fetch feedback');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim() || rating === 0) {
      Alert.alert('Incomplete', 'Please provide a rating and feedback comment');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); // JWT from login
      const response = await fetch('http://192.168.1.7:5000/feedback/submitFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: categories.find(c => c.id === selectedCategory).label,
          stars: rating,
          comment: feedback,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Thank you!', 'Your feedback has been submitted successfully.');
        setFeedback('');
        setRating(0);
        setSelectedCategory('general');
        fetchRecentFeedback(); // Refresh recent feedback
      } else {
        Alert.alert('Error', data.error || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to submit feedback');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <MessageSquare size={24} color="#FF4500" />
          <Text style={styles.headerTitle}>Feedback & Complaints</Text>
        </View>

        {/* Feedback Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Share Your Feedback</Text>

          {/* Category Selection */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && {
                    backgroundColor: category.color,
                    borderColor: category.color,
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.label}>Rating</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                <Star
                  size={32}
                  color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  fill={star <= rating ? '#F59E0B' : 'none'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Text */}
          <Text style={styles.label}>Your Feedback</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Please share your thoughts, suggestions, or concerns..."
            placeholderTextColor="#9CA3AF"
            value={feedback}
            onChangeText={setFeedback}
          />

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Feedback */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Recent Feedback</Text>

          {recentFeedback.map((item) => (
            <View key={item.feedback_id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={styles.feedbackCategory}>
                  <Text style={styles.feedbackCategoryText}>{item.category}</Text>
                </View>
                <View style={styles.feedbackRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      color={star <= item.stars ? '#F59E0B' : '#D1D5DB'}
                      fill={star <= item.stars ? '#F59E0B' : 'none'}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.feedbackComment}>{item.comment}</Text>

              <View style={styles.feedbackFooter}>
                <Text style={styles.feedbackDate}>{new Date(item.created_at).toLocaleString()}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === 'Reviewed' ? styles.statusReviewed : styles.statusPending,
                  ]}
                >
                  {item.status === 'Reviewed' && <ThumbsUp size={12} color="#FF4500" />}
                  <Text
                    style={[
                      styles.statusText,
                      item.status === 'Reviewed' ? styles.statusTextReviewed : styles.statusTextPending,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles remain the same as your original code
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
  formCard: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    marginRight: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#FF4500',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
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
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackCategory: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feedbackCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  feedbackRating: {
    flexDirection: 'row',
  },
  feedbackComment: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    lineHeight: 20,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusReviewed: {
    backgroundColor: '#ECFDF5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusTextReviewed: {
    color: '#FF4500',
  },
  statusTextPending: {
    color: '#F59E0B',
  },
});

