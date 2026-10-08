import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { HOME_BUTTONS, NAV_TABS, SETTING_DATA } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [newPassword, setNewPassword] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFirst, setCalcFirst] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100 ? 100 : p + 1), 25);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  const handleCalcPress = (val: string) => {
    if (val === 'C') { setCalcDisplay('0'); setCalcFirst(null); setCalcOp(null); return; }
    if (['+', '-', 'x', '/'].includes(val)) { setCalcFirst(parseFloat(calcDisplay)); setCalcOp(val); setCalcDisplay('0'); return; }
    if (val === '=') {
      if (calcFirst !== null && calcOp) {
        const s = parseFloat(calcDisplay); let r = 0;
        if (calcOp === '+') r = calcFirst + s; if (calcOp === '-') r = calcFirst - s;
        if (calcOp === 'x') r = calcFirst * s; if (calcOp === '/') r = s !== 0 ? calcFirst / s : 0;
        setCalcDisplay(String(r)); setCalcFirst(null); setCalcOp(null);
      } return;
    }
    setCalcDisplay(prev => prev === '0' ? val : prev + val);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} resizeMode="contain" />
        <View style={styles.loadingContainer}>
          <View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${loading}%` }]} /></View>
          <Text style={styles.loadingText}>Loading {loading}%</Text>
        </View>
      </View>
    );
  }

  const renderSetting = () => (
    <ScrollView contentContainerStyle={styles.settingContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.settingHeader}>{SETTING_DATA.header}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{SETTING_DATA.calculator.title}</Text>
        <TouchableOpacity style={[styles.blueButton, { backgroundColor: SETTING_DATA.calculator.buttonColor }]} onPress={() => setShowCalculator(true)}>
          <Text style={styles.blueButtonText}>{SETTING_DATA.calculator.buttonText}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{SETTING_DATA.password.title}</Text>
        <TextInput style={styles.input} placeholder={SETTING_DATA.password.placeholder} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <TouchableOpacity style={[styles.greenButton, { backgroundColor: SETTING_DATA.password.buttonColor }]} onPress={() => {
          if (!newPassword) { Alert.alert('पासवर्ड लिखें'); return; }
          Alert.alert('सफल', `नया पासवर्ड: ${newPassword}`); setNewPassword('');
        }}>
          <Text style={styles.greenButtonText}>{SETTING_DATA.password.buttonText}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCalculator} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.calcBox}>
            <Text style={styles.calcDisplay}>{calcDisplay}</Text>
            <View style={styles.calcGrid}>
              {SETTING_DATA.calcButtons.map((b) => (
                <TouchableOpacity key={b} style={styles.calcBtn} onPress={() => handleCalcPress(b)}>
                  <Text style={styles.calcBtnText}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCalculator(false)}>
              <Text style={styles.closeText}>बंद करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          <ScrollView contentContainerStyle={styles.buttonContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.header}>TARZAN KATLAM</Text>
            {HOME_BUTTONS.map(btn => (
              <TouchableOpacity key={btn.id} style={[styles.button, { backgroundColor: btn.color }]} onPress={() => Alert.alert(btn.name)}>
                <Text style={styles.buttonText}>{btn.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {activeTab !== 'home' && activeTab !== 'setting' && <View style={styles.otherContainer}><Text style={styles.otherTitle}>{NAV_TABS.find(t=>t.key===activeTab)?.name}</Text></View>}
        {activeTab === 'setting' && renderSetting()}
      </View>
      <View style={styles.bottomBar}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTab]}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTab]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
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
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, marginTop: 15 },
  buttonContainer: { padding: 15, paddingBottom: 90 },
  button: { height: 70, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 2 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  otherContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  otherTitle: { fontSize: 28, fontWeight: 'bold' },
  bottomBar: { height: 70, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', elevation: 10 },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabIcon: { fontSize: 22, color: '#999' },
  tabText: { fontSize: 12, color: '#999', marginTop: 2, fontWeight: '600' },
  activeTab: { color: '#000' },
  settingContainer: { padding: 15, paddingBottom: 90 },
  settingHeader: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  blueButton: { borderRadius: 15, padding: 16, alignItems: 'center' },
  blueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  greenButton: { borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 10 },
  greenButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calcBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  calcDisplay: { fontSize: 32, fontWeight: 'bold', textAlign: 'right', backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 15 },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  calcBtn: { width: '22%', backgroundColor: '#eee', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 10 },
  calcBtnText: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#000', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 10 },
  closeText: { color: '#fff', fontWeight: 'bold' },
});
