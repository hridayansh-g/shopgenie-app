import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '../../config';

export default function PaymentScreen() {
  const router = useRouter();
  const { name, price, qrCodeId } = useLocalSearchParams<{
    name?: string;
    price?: string;
    qrCodeId?: string;
  }>();

  const finalName = name?.trim() || 'Unnamed Item';
  const finalPrice = price && !isNaN(Number(price)) ? Number(price) : 0;
  const quantity = 1;

  const handlePayment = async () => {
    if (!qrCodeId) {
      Alert.alert('❌ Error', 'QR Code ID is missing.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/purchase/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId, quantity }),
      });

      const result = await response.json();

      if (!result.success || !result.bill) {
        Alert.alert('❌ Payment Failed', result.message || 'Try again.');
        return;
      }

      const newPayment = {
        name: result.bill.item,
        price: result.bill.total.toFixed(2),
        quantity: result.bill.quantity || 1,
        date: new Date().toISOString(),
      };

      const existing = await AsyncStorage.getItem('payments');
      const payments = existing ? JSON.parse(existing) : [];

      await AsyncStorage.setItem('payments', JSON.stringify([newPayment, ...payments]));

      Alert.alert('✅ Payment Successful');
      router.replace('/(tabs)/Payment');
    } catch (error) {
      console.error("❌ Error during payment:", error);
      Alert.alert("❌ Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💳 Payment</Text>

      <View style={styles.card}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/633/633611.png' }}
          style={styles.icon}
        />

        <Text style={styles.label}>Product</Text>
        <Text style={styles.value}>{finalName}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={styles.amount}>₹{finalPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 30,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});