import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ProductCard from '../component/ProductCard';
import { API_BASE_URL } from '../config';

const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleProductPress = (product) => {
    router.push({
      pathname: '/Scan',
      params: {
        name: product.name,
        price: product.price,
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ Product List</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              popularity={item.popularity || 0}
              onPress={() => handleProductPress(item)}
            />
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20,
  },
  title: {
    fontSize: 24, fontWeight: '700', marginBottom: 16,
  },
  emptyText: {
    fontSize: 16, textAlign: 'center', marginTop: 40, color: 'gray',
  },
});

export default HomeScreen;