import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, TextInput, Alert, BackHandler } from 'react-native';

// 1.30 का मतलब = 1 घंटा 30 मिनट (1.5 घंटा), 1.3 decimal नहीं
function samayToMinute(val: string): number | null {
  const s = String(val || '').trim();
  if (!s) return null;
  let h = 0, m = 0;
  if (s.includes('.') || s.includes(':')) {
    const parts = s.replace(':', '.').split('.');
    h = parseInt(parts[0] || '0', 10) || 0;
    let mStr = (parts[1] || '').slice(0, 2);
    if (mStr.length === 1) mStr = mStr + '0';
    m = parseInt(mStr || '0', 10) || 0;
  } else {
    h = parseInt(s, 10) || 0;
    m = 0;
  }
  if (m >= 60) return null;
  return h * 60 + m;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);

  const [samay, setSamay] = useState('');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState<{ hoursStr: string, totalMin: number, amount: string } | null>(null);

  // Splash - पहले वाला
  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100 ? 100 : p + 1), 25);
    const timer = setTimeout(() => { setShowSplash(false); }, 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (showCalculator) { setShowCalculator(false); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [showCalculator]);

  const handleCalculate = () => {
    const totalMin = samayToMinute(samay);
    const r = parseFloat(rate);
    if (totalMin === null) { Alert.alert('समय सही लिखें', 'जैसे - 1.30 का मतलब 1 घंटा 30 मिनट'); return; }
    if (isNaN(r) || r <= 0) { Alert.alert('राशि लिखें', 'जैसे - 4000'); return; }
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const hoursStr = `${h} घंटा ${String(m).padStart(2, '0')} मिनट`;
    const amount = ((totalMin / 60) * r).toFixed(0);
    setResult({ hoursStr, totalMin, amount });
  };

  const handleClear = () => {
    setSamay(''); setRate(''); setResult(null);
  };

  // 1. SPLASH SCREEN - पहले वाला
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

  // 2. CALCULATOR OPEN
  if (showCalculator) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowCalculator(false)} style={{ padding: 5 }}>
            <Text style={styles.backText}>‹ वापस</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🧮 कैलकुलेटर</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 40 }}>
          <View style={styles.card}>
            <Text style={styles.label}>समय लिखें</Text>
            <Text style={styles.hint}>जैसे - 1.30 का मतलब 1 घंटा 30 मिनट</Text>
            <TextInput
              style={styles.bigInput}
              value={samay}
              onChangeText={setSamay}
              placeholder="1.30"
              placeholderTextColor="#C8C8C8"
              keyboardType="numeric"
            />

            <Text style={[styles.label, { marginTop: 18 }]}>राशि (₹ / घंटा)</Text>
            <Text style={styles.hint}>जैसे - 4000</Text>
            <TextInput
              style={styles.bigInput}
              value={rate}
              onChangeText={setRate}
              placeholder="4000"
              placeholderTextColor="#C8C8C8"
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
              <Text style={styles.calcBtnText}>हिसाब लगाएं</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>साफ करें</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultSmall}>⏳ टोटल समय: {result.hoursStr}</Text>
              <Text style={styles.resultSmall}>({result.totalMin} मिनट)</Text>
              <View style={{ height: 1, backgroundColor: '#C8E6C9', marginVertical: 12 }} />
              <Text style={styles.resultLabel}>💰 कुल राशि</Text>
              <Text style={styles.resultAmount}>₹ {result.amount}</Text>
              <Text style={styles.resultFormula}>{samay} × ₹{rate} = ₹{result.amount}</Text>
            </View>
          )}

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>उदाहरण:</Text>
            <Text style={styles.exampleText}>1.30 × 4000 = ₹6000</Text>
            <Text style={styles.exampleText}>2.00 × 4000 = ₹8000</Text>
            <Text style={styles.exampleText}>0.30 × 4000 = ₹2000</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // 3. HOME - सिर्फ Calculator फोल्डर
  return (
    <View style={styles.mainContainer}>
      <View style={styles.homeHeader}>
        <Text style={styles.homeTitle}>🚜 TARZAN KATLAM</Text>
      </View>
      <View style={{ padding: 15 }}>
        <TouchableOpacity style={styles.folderBtn} onPress={() => setShowCalculator(true)}>
          <Text style={styles.folderIcon}>📁</Text>
          <Text style={styles.folderName}>🧮 कैलकुलेटर</Text>
          <Text style={styles.folderSub}>समय × पैसे का हिसाब</Text>
        </TouchableOpacity>
      </View>
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

  mainContainer: { flex: 1, backgroundColor: '#F5F7FB' },
  homeHeader: { backgroundColor: '#fff', paddingTop: 50, paddingBottom: 15, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  homeTitle: { fontSize: 22, fontWeight: '900', color: '#2E9D5A' },

  folderBtn: { backgroundColor: '#2E9D5A', borderRadius: 18, padding: 30, alignItems: 'center', elevation: 3 },
  folderIcon: { fontSize: 50 },
  folderName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 10 },
  folderSub: { fontSize: 14, color: '#fff', marginTop: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 50, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },

  card: { backgroundColor: '#fff', borderRadius: 15, padding: 18, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  hint: { fontSize: 12, color: '#888', marginTop: 4, marginBottom: 8 },
  bigInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 22, fontWeight: 'bold', backgroundColor: '#fff', textAlign: 'center' },
  calcBtn: { backgroundColor: '#2E9D5A', borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 20 },
  calcBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  clearBtn: { alignItems: 'center', padding: 12, marginTop: 8 },
  clearBtnText: { color: '#777', fontSize: 14, fontWeight: '600' },

  resultCard: { backgroundColor: '#E8F5E9', borderRadius: 15, padding: 20, marginTop: 15, alignItems: 'center', borderWidth: 2, borderColor: '#2E9D5A' },
  resultSmall: { fontSize: 15, color: '#333', fontWeight: '600', marginTop: 2 },
  resultLabel: { fontSize: 16, color: '#333', fontWeight: '600' },
  resultAmount: { fontSize: 34, fontWeight: '900', color: '#B71C1C', marginTop: 6 },
  resultFormula: { fontSize: 13, color: '#666', marginTop: 6 },

  exampleCard: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 15, marginTop: 15, borderWidth: 1, borderColor: '#FFD54F' },
  exampleTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  exampleText: { fontSize: 14, color: '#555', marginTop: 4 },
});
