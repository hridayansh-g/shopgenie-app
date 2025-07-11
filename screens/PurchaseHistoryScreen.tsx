import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

type Purchase = {
  _id: string;
  name: string;
  price: number;
  timestamp: string;
};

const PurchaseHistoryScreen = () => {
  const [history, setHistory] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/purchase/history`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHistory(data.purchases);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Error fetching history:', err);
        setLoading(false);
      });
  }, []);

  const renderItem = ({ item }: { item: Purchase }) => (
    <View style={styles.card}>
      <Text style={styles.name}>🛒 {item.name}</Text>
      <Text style={styles.detail}>💰 Price: ₹{item.price}</Text>
      <Text style={styles.detail}>
        🕓 {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#000" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detail: {
    fontSize: 14,
    color: '#555',
  },
});

export default PurchaseHistoryScreen;