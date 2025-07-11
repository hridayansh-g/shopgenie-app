import { FlatList, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard';
import { API_BASE_URL } from '../../config';

type Product = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
};

type Popularity = {
  _id: string;
  count: number;
};

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [popularity, setPopularity] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE_URL}/api/products`).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/purchase/popularity`).then(res => res.json())
    ])
      .then(([productData, popularityData]) => {
        setProducts(productData);
        const popMap: Record<string, number> = {};
        popularityData.data.forEach((item: Popularity) => {
          popMap[item._id] = item.count;
        });
        setPopularity(popMap);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🛍 Product List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard product={item} popularity={popularity[item.name] || 0} />
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});