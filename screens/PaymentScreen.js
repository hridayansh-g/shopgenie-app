import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export default function PaymentScreen() {
  const { name = 'Unnamed Item', price = 0, qrCodeId } = useLocalSearchParams();
  const router = useRouter();

  const handlePayment = async () => {
    try {
      const newPayment = {
        name,
        price,
        date: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem('payments');
      const payments = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem('payments', JSON.stringify([newPayment, ...payments]));

      // ✅ Update backend stock & popularity
      await fetch(`${API_BASE_URL}/api/purchase/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId }),
      });

      alert('✅ Payment Successful!');
      router.replace('/');
    } catch (err) {
      alert('❌ Payment failed.');
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💳 Payment</Text>
      <Text style={styles.label}>Product: {name}</Text>
      <Text style={styles.label}>Amount: ₹{price}</Text>
      <Button title="Pay Now" onPress={handlePayment} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'white' },
  label: { fontSize: 18, marginBottom: 10, color: 'white' },
});