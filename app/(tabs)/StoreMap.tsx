import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

type Product = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
  location: {
    floor: number;
    row: number;
    column: number;
    drawer: number;
  };
};

export default function StoreMap() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching map data:', err);
        setLoading(false);
      });
  }, []);

  const handlePress = (product: Product) => {
    Alert.alert(
      product.name,
      `Brand: ${product.brand || 'N/A'}\n` +
      `Price: ₹${product.price}\n` +
      `Stock: ${product.stock}\n` +
      `Row: ${product.location?.row ?? 'N/A'}, ` +
      `Col: ${product.location?.column ?? 'N/A'}, ` +
      `Drawer: ${product.location?.drawer ?? 'N/A'}`
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#555" />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'gray' }}>No items found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Store Visual Map</Text>
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>
              📍 R{item.location?.row}-C{item.location?.column}-D{item.location?.drawer}
            </Text>
          </TouchableOpacity>
        )}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#eef',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '48%',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  location: {
    marginTop: 4,
    color: 'gray',
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});