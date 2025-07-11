import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  View,
  Button,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '../config';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  const scanAnim = useRef(new Animated.Value(0)).current;

  // 👇 Request permission when component loads
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  // 👇 Reset scan state every time screen is focused
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  // 👇 Looping scan animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  }, []);

  // 👇 Handle scanned QR
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      Alert.alert('❌ Invalid QR', 'QR code data is not valid JSON.');
      setScanned(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/purchase/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCodeId: parsed.qrCodeId }),
    })
      .then(res => res.json())
      .then(result => {
        if (result.product) {
          router.push({
            pathname: '/(tabs)/Payment',
            params: {
              name: result.product.name,
              price: result.product.price.toString(),
              qrCodeId: parsed.qrCodeId,
            },
          });
        } else {
          Alert.alert('❌ Not Found', result.message || 'No product matched this QR code.');
          setScanned(false);
        }
      })
      .catch(err => {
        console.error('❌ Fetch Error:', err);
        Alert.alert('Error', 'Something went wrong while fetching the product.');
        setScanned(false);
      });
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

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <Text style={styles.scannerText}>📷 Scan</Text>
        <View style={styles.scannerBox}>
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateY: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 200],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>

      {scanned && (
        <View style={styles.buttonWrapper}>
          <Button title="Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#00CFFF',
    borderRadius: 2,
    opacity: 0.9,
    shadowColor: '#00CFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  scannerText: {
    color: '#00CFFF',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 12,
    textShadowColor: '#003b59',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
});