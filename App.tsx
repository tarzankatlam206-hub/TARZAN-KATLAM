import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { HOME_BUTTONS, NAV_TABS, SETTING_DATA, CALCULATOR_DATA } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';
type CalcScreen = 'main' | 'samay' | 'umr';
type AmPm = 'AM' | 'PM';

function parseTimeToMinutes(timeStr: string, ampm: AmPm): number | null {
  // timeStr = "1.10" या "1:10"
  const s = timeStr.trim().replace('.', ':');
  const match = s.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    // अगर सिर्फ 1.10 बिना : के
    const dotMatch = timeStr.match(/(\d{1,2})\.(\d{2})/);
    if (!dotMatch) return null;
    let h = parseInt(dotMatch[1]); const m = parseInt(dotMatch[2]);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  let h = parseInt(match[1]); const m = parseInt(match[2]);
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [newPassword, setNewPassword] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcScreen, setCalcScreen] = useState<CalcScreen>('main');
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFirst, setCalcFirst] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Samay - नया सिस्टम AM/PM के साथ
  const [startTime, setStartTime] = useState('1.10');
  const [startAmPm, setStartAmPm] = useState<AmPm>('PM');
  const [endTime, setEndTime] = useState('2.40');
  const [endAmPm, setEndAmPm] = useState<AmPm>('PM');
  const [hourlyRate, setHourlyRate] = useState('3000');
  const [timeResult, setTimeResult] = useState<{hoursStr: string, amount: string} | null>(null);

  const [dob, setDob] = useState(''); const [ageResult, setAgeResult] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100? 100 : p + 1), 25);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  const handleCalcPress = (val: string) => {
    if (val === 'C') { setCalcDisplay('0'); setCalcFirst(null); setCalcOp(null); return; }
    if (['+', '-', 'x', '/'].includes(val)) { setCalcFirst(parseFloat(calcDisplay)); setCalcOp(val); setCalcDisplay('0'); return; }
    if (val === '=') {
      if (calcFirst!== null && calcOp) {
        const s = parseFloat(calcDisplay); let r = 0;
        if (calcOp === '+') r = calcFirst + s; if (calcOp === '-') r = calcFirst - s;
        if (calcOp === 'x') r = calcFirst * s; if (calcOp === '/') r = s!== 0? calcFirst / s : 0;
        setCalcDisplay(String(r)); setCalcFirst(null); setCalcOp(null);
      } return;
    }
    setCalcDisplay(prev => prev === '0'? val : prev + val);
  };

  const calcTimeWithRate = () => {
    const startM = parseTimeToMinutes(startTime, startAmPm);
    const endM = parseTimeToMinutes(endTime, endAmPm);
    const rate = parseFloat(hourlyRate);
    if (startM === null || endM === null) { Alert.alert('समय सही लिखें', 'जैसे 1.10'); return; }
    if (isNaN(rate)) { Alert.alert('Hourly rate लिखें'); return; }
    let diff = endM - startM;
    if (diff < 0) diff += 24*60;
    const h = Math.floor(diff/60); const m = diff % 60;
    const dec = diff / 60;
    const amount = dec * rate;
    setTimeResult({
      hoursStr: `${h}.${String(m).padStart(2,'0')} मिनट`,
      amount: `₹${amount.toFixed(0)}`
    });
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
        {activeTab === 'setting' && (
          <ScrollView contentContainerStyle={styles.settingContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.settingHeader}>{SETTING_DATA.header}</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{SETTING_DATA.calculator.title}</Text>
              <TouchableOpacity style={[styles.blueButton, { backgroundColor: SETTING_DATA.calculator.buttonColor }]} onPress={() => { setShowCalculator(true); setCalcScreen('main'); }}>
                <Text style={styles.blueButtonText}>{SETTING_DATA.calculator.buttonText}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{SETTING_DATA.password.title}</Text>
              <TextInput style={styles.input} placeholder={SETTING_DATA.password.placeholder} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <TouchableOpacity style={[styles.greenButton, { backgroundColor: SETTING_DATA.password.buttonColor }]} onPress={() => {
                if (!newPassword) { Alert.alert('पासवर्ड लिखें'); return; }
                Alert.alert('सफल', newPassword); setNewPassword('');
              }}>
                <Text style={styles.greenButtonText}>{SETTING_DATA.password.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
        {activeTab!== 'home' && activeTab!== 'setting' && <View style={styles.otherContainer}><Text style={styles.otherTitle}>{NAV_TABS.find(t=>t.key===activeTab)?.name}</Text></View>}
      </View>

      <View style={styles.bottomBar}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTab]}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTab]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={showCalculator} animationType="slide">
        <View style={styles.calcPage}>
          <View style={styles.calcPageHeader}>
            <TouchableOpacity onPress={() => calcScreen === 'main'? setShowCalculator(false) : setCalcScreen('main')}>
              <Text style={styles.backText}>{calcScreen === 'main'? '✕ बंद' : '← वापस'}</Text>
            </TouchableOpacity>
            <Text style={styles.calcPageTitle}>{CALCULATOR_DATA.header}</Text>
            <View style={{ width: 50 }} />
          </View>

          {calcScreen === 'main' && (
            <ScrollView contentContainerStyle={{ padding: 15 }}>
              <Text style={styles.normalTitle}>{CALCULATOR_DATA.normalTitle}</Text>
              <Text style={styles.calcDisplay}>{calcDisplay}</Text>
              <View style={styles.calcGrid}>
                {CALCULATOR_DATA.calcButtons.map((b) => (
                  <TouchableOpacity key={b} style={styles.calcBtn} onPress={() => handleCalcPress(b)}>
                    <Text style={styles.calcBtnText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ marginTop: 20 }}>
                {CALCULATOR_DATA.menu.map((item) => (
                  <TouchableOpacity key={item.id} style={[styles.bigCalcBtn, { backgroundColor: item.color }]} onPress={() => setCalcScreen(item.id as CalcScreen)}>
                    <Text style={styles.bigCalcIcon}>{item.icon} {item.name}</Text>
                    <Text style={styles.bigCalcSub}>{item.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {calcScreen === 'samay' && (
            <ScrollView contentContainerStyle={{ padding: 15 }}>
              {timeResult && (
                <>
                  <View style={[styles.resultCard, { backgroundColor: '#E6E6FA' }]}>
                    <Text style={styles.resultLabel}>{CALCULATOR_DATA.screens.samay.totalLabel}</Text>
                    <Text style={styles.resultValue}>{timeResult.hoursStr}</Text>
                  </View>
                  <View style={[styles.resultCard, { backgroundColor: '#FFF8DC', marginTop: 10 }]}>
                    <Text style={styles.resultLabel}>{CALCULATOR_DATA.screens.samay.amountLabel}</Text>
                    <Text style={styles.resultValue}>{timeResult.amount}</Text>
                  </View>
                </>
              )}

              <View style={[styles.card, { marginTop: 15 }]}>
                {/* Start Time - AM PM Box के अंदर */}
                <Text style={styles.timeLabel}>{CALCULATOR_DATA.screens.samay.startLabel}</Text>
                <View style={styles.timeBox}>
                  <TextInput style={styles.timeInput} value={startTime} onChangeText={setStartTime} placeholder="1.10" keyboardType="numeric" />
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity style={[styles.ampmBtn, startAmPm==='AM' && styles.ampmActive]} onPress={()=>setStartAmPm('AM')}><Text style={[styles.ampmText, startAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.ampmBtn, startAmPm==='PM' && styles.ampmActive]} onPress={()=>setStartAmPm('PM')}><Text style={[styles.ampmText, startAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity>
                  </View>
                </View>

                {/* End Time - AM PM Box के अंदर */}
                <Text style={[styles.timeLabel, {marginTop: 15}]}>{CALCULATOR_DATA.screens.samay.endLabel}</Text>
                <View style={styles.timeBox}>
                  <TextInput style={styles.timeInput} value={endTime} onChangeText={setEndTime} placeholder="2.40" keyboardType="numeric" />
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity style={[styles.ampmBtn, endAmPm==='AM' && styles.ampmActive]} onPress={()=>setEndAmPm('AM')}><Text style={[styles.ampmText, endAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.ampmBtn, endAmPm==='PM' && styles.ampmActive]} onPress={()=>setEndAmPm('PM')}><Text style={[styles.ampmText, endAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.timeLabel, { marginTop: 15 }]}>Hourly rate</Text>
                <TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder={CALCULATOR_DATA.screens.samay.ratePlaceholder} />

                <TouchableOpacity style={[styles.blueButton, { backgroundColor: CALCULATOR_DATA.screens.samay.color, marginTop: 20 }]} onPress={calcTimeWithRate}>
                  <Text style={styles.blueButtonText}>{CALCULATOR_DATA.screens.samay.buttonText}</Text>
                </TouchableOpacity>

                {timeResult && (
                  <Text style={styles.exampleText}>{startTime} {startAmPm} से {endTime} {endAmPm} = {timeResult.hoursStr} x {hourlyRate} = {timeResult.amount}</Text>
                )}
              </View>
            </ScrollView>
          )}

          {calcScreen === 'umr' && (
            <View style={{ padding: 20 }}>
              <Text style={styles.normalTitle}>{CALCULATOR_DATA.screens.umr.title}</Text>
              <TextInput style={styles.input} placeholder={CALCULATOR_DATA.screens.umr.placeholder} keyboardType="numeric" value={dob} onChangeText={setDob} />
              <TouchableOpacity style={[styles.blueButton, { backgroundColor: CALCULATOR_DATA.screens.umr.color, marginTop: 15 }]} onPress={() => {
                const y=parseInt(dob), cur=new Date().getFullYear();
                setAgeResult(isNaN(y)? 'साल लिखें' : `उम्र: ${cur-y} साल`);
              }}>
                <Text style={styles.blueButtonText}>{CALCULATOR_DATA.screens.umr.buttonText}</Text>
              </TouchableOpacity>
              {ageResult? <Text style={styles.resultText}>{ageResult}</Text> : null}
            </View>
          )}
        </View>
      </Modal>
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
  blueButton: { borderRadius: 15, padding: 16, alignItems: 'center' },
  blueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  greenButton: { borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 10 },
  greenButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  calcPage: { flex: 1, backgroundColor: '#F5F7FB', paddingTop: 40 },
  calcPageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, backgroundColor: '#fff' },
  calcPageTitle: { fontSize: 18, fontWeight: 'bold' },
  backText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  normalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  calcDisplay: { fontSize: 32, fontWeight: 'bold', textAlign: 'right', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 1 },
  calcGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  calcBtn: { width: '22%', backgroundColor: '#fff', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 10, elevation: 1 },
  calcBtnText: { fontSize: 20, fontWeight: 'bold' },
  bigCalcBtn: { borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 15, elevation: 3 },
  bigCalcIcon: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  bigCalcSub: { fontSize: 14, color: '#fff', marginTop: 4 },
  resultText: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20, color: '#000' },
  resultCard: { borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14, color: '#555' },
  resultValue: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  timeLabel: { fontSize: 14, color: '#555', marginBottom: 5 },
  timeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 10 },
  timeInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  ampmContainer: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 20, padding: 3 },
  ampmBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  ampmActive: { backgroundColor: '#2E9D5A' },
  ampmText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  ampmActiveText: { color: '#fff' },
  exampleText: { textAlign: 'center', marginTop: 15, color: '#666', fontSize: 13 },
});
