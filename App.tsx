import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 3 सेकंड Splash दिखेगा
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- SPLASH SCREEN ---
  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('./assets/splash.png')} 
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // --- आपका असली TARZAN KATLAM HOME SCREEN ---
  // यहाँ आपका पुराना 8 Button वाला Code है, आप इसे अपने पुराने Code से Replace कर सकते हो
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>TARZAN KATLAM</Text>
      <Text style={styles.subtitle}>आपका स्वागत है</Text>
      
      {/* यहाँ अपने 8 Buttons को ऐसे लगाओ - मैं 2 का Sample दे रहा हूँ */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Button 1</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Button 2</Text>
      </TouchableOpacity>

      {/* बाकी 6 Button भी इसी तरह */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '90%',
    height: '90%',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
