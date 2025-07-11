import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../config';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const parsed = JSON.parse(data); // 👈 this is IMPORTANT
      console.log('✅ Scanned QR:', parsed);

      fetch(`${API_BASE_URL}/api/purchase/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCodeId: parsed.qrCodeId }),
      })
        .then(res => res.json())
        .then(result => {
          console.log('📦 Backend Response:', result);
          if (result.product) {
            router.push({
              pathname: '/(tabs)/Payment',
              params: {
                name: result.product.name,
                price: result.product.price,
              },
            });
          } else {
            Alert.alert('❌ Not Found', result.message || 'QR not linked to any product');
            setScanned(false);
          }
        })
        .catch(error => {
          console.error('❌ Fetch Error:', error);
          Alert.alert('Network Error', 'Could not fetch product details.');
          setScanned(false);
        });
    } catch (err) {
      Alert.alert('Invalid QR', 'QR code is not valid JSON.');
      console.log('❌ Parse Error:', err);
      setScanned(false);
    }
  };

  if (!permission) return <Text>Requesting camera permission...</Text>;
  if (!permission.granted) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.text}>📷 Scan QR Code</Text>
        <View style={styles.scannerBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  overlay: {
    position: 'absolute',
    top: '35%',
    left: '15%',
    width: '70%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: '#00CFFF',
    borderRadius: 15,
  },
  text: {
    color: '#00CFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
});