import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const ProductCard = ({ product, popularity }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/scan',
      params: {
        name: product.name,
        price: product.price,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.name}>{product.name}</Text>
      {product.brand && <Text style={styles.brand}>Brand: {product.brand}</Text>}
      <Text>Price: ₹{product.price}</Text>
      <Text>Stock: {product.stock}</Text>
      <Text style={styles.popularity}>
        🧑‍🤝‍🧑 {popularity} bought this in last 30 days
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f4f7',
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  brand: {
    color: '#666',
    marginTop: 2,
  },
  popularity: {
    color: '#2e7d32',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
});

export default ProductCard;