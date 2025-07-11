import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_BASE_URL } from '../config';

export default function PaymentScreen() {
  const { name, price, qrCodeId } = useLocalSearchParams<{
    name?: string;
    price?: string;
    qrCodeId?: string;
  }>();
  const [quantity, setQuantity] = useState('1');
  const router = useRouter();

  const finalName = name?.trim() || 'Unnamed Item';
  const finalPrice = price && !isNaN(Number(price)) ? Number(price) : 0;
  const finalQty = parseInt(quantity);

  const handlePayment = async () => {
    if (!qrCodeId || !finalQty || finalQty <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid quantity and QR code');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/purchase/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId, quantity: finalQty }),
      });

      const result = await res.json();
      console.log("🧾 Payment Result:", result);

      if (!res.ok || !result.success || !result.bill) {
        Alert.alert('❌ Payment Failed', result.message || 'Something went wrong');
        return;
      }

      const bill = result.bill;

      const newPayment = {
        name: bill.item,
        price: bill.total.toFixed(2),
        quantity: finalQty,
        date: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem('payments');
      const history = existing ? JSON.parse(existing) : [];
      await AsyncStorage.setItem('payments', JSON.stringify([newPayment, ...history]));

      Alert.alert(
        '✅ Payment Successful',
        `🛒 ${bill.item}\nQty: ${finalQty}\nTotal: ₹${bill.total}\nUPI: ${bill.paymentMode}\nStatus: ${bill.status}`
      );

      router.replace('/');
    } catch (err) {
      console.error('❌ Error during payment:', err);
      Alert.alert('❌ Error', 'Something went wrong during payment.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.heading}>💳 Payment Summary</Text>
      <Text style={styles.label}>Product: <Text style={styles.value}>{finalName}</Text></Text>
      <Text style={styles.label}>Unit Price: <Text style={styles.value}>₹{finalPrice}</Text></Text>

      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Pay Now 💸" onPress={handlePayment} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, color: '#333' },
  label: { fontSize: 16, marginBottom: 8, color: '#444' },
  value: { fontWeight: 'bold', color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    marginVertical: 20,
  },
});
