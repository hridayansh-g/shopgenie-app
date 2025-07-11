import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

interface Payment {
  name?: string;
  price?: string;
  date?: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const fetchPayments = async () => {
    try {
      const stored = await AsyncStorage.getItem('payments');
      const parsed: Payment[] = stored ? JSON.parse(stored) : [];

      setPayments(parsed);

      const total = parsed.reduce((sum, item) => {
        const raw = item?.price ?? "0";
        const numeric = parseFloat(raw.replace(/[^\d.]/g, ""));
        return sum + (isNaN(numeric) ? 0 : numeric);
      }, 0);

      setTotalSpent(total);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // ✅ Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const clearHistory = async () => {
    Alert.alert('Confirm', 'Clear payment history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.removeItem('payments');
          setPayments([]);
          setTotalSpent(0);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Payment }) => {
    const name = item?.name || "Unnamed Item";
    const rawPrice = item?.price ?? "0";
    const numericPrice = parseFloat(rawPrice.replace(/[^\d.]/g, ""));
    const displayPrice = isNaN(numericPrice) ? "0.00" : numericPrice.toFixed(2);
    const date = item?.date ? new Date(item.date).toLocaleString() : "Unknown Date";

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>₹{displayPrice}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🧾 Payment History</Text>
      <Text style={styles.total}>Total Spent: ₹{totalSpent.toFixed(2)}</Text>

      <FlatList
        data={payments}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No payments yet</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {payments.length > 0 && (
        <Button title="Clear History" color="#d9534f" onPress={clearHistory} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10,
  },
  total: {
    fontSize: 18, marginBottom: 16, color: '#333',
  },
  card: {
    backgroundColor: '#f4f4f4',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 18, fontWeight: '600',
  },
  price: {
    fontSize: 16, marginTop: 4,
  },
  date: {
    fontSize: 12, color: 'gray', marginTop: 6,
  },
  empty: {
    fontSize: 16, textAlign: 'center', marginTop: 40, color: 'gray',
  },
});