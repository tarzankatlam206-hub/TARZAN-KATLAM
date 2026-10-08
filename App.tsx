import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);

  useEffect(() => {
    // 1 से 100 तक Loading
    const interval = setInterval(() => {
      setLoading(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30); // 30ms x 100 = 3 सेकंड में 100% होगा

    // 3.2 सेकंड बाद Splash हटेगा
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('./assets/splash.png')} 
          style={styles.splashImage}
          resizeMode="contain"
        />
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${loading}%` }]} />
          </View>
          <Text style={styles.loadingText}>Loading {loading}%</Text>
          <Text style={styles.brandText}>TARZAN KATLAM</Text>
        </View>
      </View>
    );
  }

  // --- यहाँ से आपका Main App ---
  return (
    <View style={styles.mainContainer}>
      <Text style={{fontSize:24, fontWeight:'bold'}}>TARZAN KATLAM</Text>
      {/* यहाँ आपका 8 Button वाला पुराना Code Paste कर देना */}
    </View>
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
    width: '85%',
    height: '65%',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '80%',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700', // पीला रंग आपकी फोटो जैसा
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  brandText: {
    color: '#FFD700',
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
