import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { HOME_BUTTONS } from './master_data';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(p => p >= 100 ? 100 : p + 1);
    }, 25);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} resizeMode="contain" />
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${loading}%` }]} />
          </View>
          <Text style={styles.loadingText}>Loading {loading}%</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.header}>TARZAN KATLAM</Text>
      <ScrollView contentContainerStyle={styles.buttonContainer} showsVerticalScrollIndicator={false}>
        {HOME_BUTTONS.map((btn) => (
          <TouchableOpacity
            key={btn.id}
            style={[styles.button, { backgroundColor: btn.color }]}
            onPress={() => Alert.alert(btn.name)}
          >
            <Text style={styles.buttonText}>{btn.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  splashImage: { width: '85%', height: '60%' },
  loadingContainer: { marginTop: 20, alignItems: 'center', width: '80%' },
  progressBarBackground: { width: '100%', height: 8, backgroundColor: '#333', borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#FFD700' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16, fontWeight: 'bold' },
  mainContainer: { flex: 1, backgroundColor: '#F5F7FB', paddingTop: 50 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  buttonContainer: { padding: 15 },
  button: { height: 70, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 2 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
