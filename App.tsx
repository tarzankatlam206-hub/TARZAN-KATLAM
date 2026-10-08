import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { HOME_BUTTONS, NAV_TABS, SETTING_DATA, CALCULATOR_DATA, KHARCH_DATA } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';
type CalcScreen = 'main' | 'samay' | 'umr';
type AmPm = 'AM' | 'PM';

function parseTimeToMinutes(timeStr: string, ampm: AmPm): number | null {
  const s = timeStr.trim().replace('.', ':'); const match = s.match(/(\d{1,2}):(\d{2})/);
  if (!match) { const dotMatch = timeStr.match(/(\d{1,2})\.(\d{2})/); if (!dotMatch) return null; let h = parseInt(dotMatch[1]); const m = parseInt(dotMatch[2]); if (ampm === 'PM' && h < 12) h += 12; if (ampm === 'AM' && h === 12) h = 0; return h * 60 + m; }
  let h = parseInt(match[1]); const m = parseInt(match[2]); if (ampm === 'PM' && h < 12) h += 12; if (ampm === 'AM' && h === 12) h = 0; return h * 60 + m;
}
function parseDateDMY(str: string): Date | null {
  const cleaned = str.trim().replace(/-/g, '.').replace(/\//g, '.'); const parts = cleaned.split('.'); if (parts.length!==3) return null;
  const d = parseInt(parts[0]); const m = parseInt(parts[1]); const y = parseInt(parts[2]); if (isNaN(d)||isNaN(m)||isNaN(y)) return null;
  const date = new Date(y, m-1, d); if (date.getDate()!==d || date.getMonth()!==m-1 || date.getFullYear()!==y) return null; return date;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true); const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [newPassword, setNewPassword] = useState('');
  const [showCalculator, setShowCalculator] = useState(false); const [calcScreen, setCalcScreen] = useState<CalcScreen>('main');
  const [startTime, setStartTime] = useState('1.10'); const [startAmPm, setStartAmPm] = useState<AmPm>('PM');
  const [endTime, setEndTime] = useState('2.40'); const [endAmPm, setEndAmPm] = useState<AmPm>('PM');
  const [hourlyRate, setHourlyRate] = useState('3000'); const [timeResult, setTimeResult] = useState<{hoursStr: string, amount: string} | null>(null);
  const [dobStr, setDobStr] = useState('14.5.1989'); const [todayStr, setTodayStr] = useState('8.10.2026'); const [ageResult, setAgeResult] = useState('');
  const [kharchPage, setKharchPage] = useState<string | null>(null);
  const [showKharchForm, setShowKharchForm] = useState(false);
  const [formValues, setFormValues] = useState<any>({ tithi: '8.10.2026', litre: '', rashi: '', parts_name: '', kaam: '', naam: '', kisan: '', hotel: '', days: '', vivaran: '', payment: 'नगद' });
  const [kharchEntries, setKharchEntries] = useState<any[]>([]);

  useEffect(() => { const interval = setInterval(() => setLoading(p => p >= 100? 100 : p + 1), 25); const timer = setTimeout(() => setShowSplash(false), 3000); return () => { clearInterval(interval); clearTimeout(timer); }; }, []);

  if (showSplash) {
    return (<View style={styles.splashContainer}><Image source={require('./assets/splash.png')} style={styles.splashImage} resizeMode="contain" /><View style={styles.loadingContainer}><View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${loading}%` }]} /></View><Text style={styles.loadingText}>Loading {loading}%</Text></View></View>);
  }

  const currentCat = KHARCH_DATA.categories.find(c => c.id === kharchPage);
  const currentForm = (KHARCH_DATA.forms as any)[kharchPage || ''] || KHARCH_DATA.forms.hany;
  const entriesForCat = kharchEntries.filter(e => e.catId === kharchPage);
  const totalForCat = entriesForCat.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);
  const grandTotal = kharchEntries.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);

  const getSecondFieldValue = (e: any) => {
    return e.litre || e.parts_name || e.kaam || e.naam || e.kisan || e.hotel || e.days || e.vivaran || '-';
  };

  if (kharchPage) {
    const formDef = (KHARCH_DATA.forms as any)[kharchPage] || (KHARCH_DATA.forms as any).anya;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.calcPageHeader}><TouchableOpacity onPress={()=>setKharchPage(null)}><Text style={styles.backText}>← वापस</Text></TouchableOpacity><Text style={styles.calcPageTitle}>{currentCat?.name}</Text><View style={{ width: 50 }} /></View>
        <View style={[styles.totalCard, { margin: 10, marginBottom: 5 }]}><Text style={styles.totalText}>कुल खर्च: ₹ {totalForCat} | सभी का कुल: ₹ {grandTotal}</Text></View>
        <View style={{ flex: 1, padding: 10, paddingTop: 5 }}>
          <View style={styles.tableHeader}>{formDef.tableHeads.map((h: string, i: number) => (<Text key={i} style={styles.th}>{h}</Text>))}</View>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {entriesForCat.length === 0? (<View style={{ alignItems: 'center', marginTop: 50 }}><Text style={{ color: '#999' }}>कोई खर्च नहीं - Plus दबाकर जोड़ें</Text></View>) : (entriesForCat.map((e, idx) => (<View key={idx} style={styles.tableRow}><Text style={styles.td}>{e.tithi}</Text><Text style={styles.td}>{getSecondFieldValue(e)}</Text><Text style={styles.td}>₹{e.rashi}</Text><Text style={styles.td}>{e.payment}</Text></View>)))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.fab} onPress={()=>{ setFormValues({ tithi: '8.10.2026', litre: '', rashi: '', parts_name: '', kaam: '', naam: '', kisan: '', hotel: '', days: '', vivaran: '', payment: formDef.paymentOptions[0] }); setShowKharchForm(true); }}><Text style={styles.fabText}>+</Text></TouchableOpacity>
        <Modal visible={showKharchForm} animationType="slide" transparent><View style={styles.modalBg}><View style={styles.formCard}><Text style={styles.formTitle}>{formDef.title}</Text>{formDef.fields.map((f: any) => (<View key={f.key} style={{ marginTop: 12 }}><Text style={styles.timeLabel}>{f.label}</Text><TextInput style={styles.input} placeholder={f.placeholder} value={formValues[f.key]} onChangeText={(v)=>setFormValues({...formValues, [f.key]: v })} keyboardType="numeric" /></View>))}<Text style={[styles.timeLabel, { marginTop: 15 }]}>{formDef.paymentLabel}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>{formDef.paymentOptions.map((opt: string) => (<TouchableOpacity key={opt} style={[styles.chip, formValues.payment === opt && { backgroundColor: '#2E9D5A', borderColor: '#2E9D5A' }]} onPress={()=>setFormValues({...formValues, payment: opt })}><Text style={[styles.chipText, formValues.payment === opt && { color: '#fff' }]}>{opt}</Text></TouchableOpacity>))}</View><TouchableOpacity style={[styles.blueButton, { backgroundColor: '#4A90E2', marginTop: 20 }]} onPress={()=>{ if (!formValues.rashi ||!formValues.tithi) { Alert.alert('तिथि और राशि लिखें'); return; } setKharchEntries([...kharchEntries, { catId: kharchPage,...formValues }]); setShowKharchForm(false); }}><Text style={styles.blueButtonText}>{formDef.saveButton}</Text></TouchableOpacity><TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={()=>setShowKharchForm(false)}><Text style={{ color: '#777' }}>बंद करें</Text></TouchableOpacity></View></View></Modal>
      </View>
    );
  }

  const renderKharchMain = () => (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>{KHARCH_DATA.header}</Text>
      <View style={styles.totalCard}><Text style={styles.totalText}>कुल खर्च: ₹ {grandTotal || 6000}</Text></View>
      <Text style={styles.categoryLabel}>{KHARCH_DATA.categoryLabel}</Text>
      <View style={styles.chipContainer}>{KHARCH_DATA.categories.map(cat => (<TouchableOpacity key={cat.id} style={[styles.chip, { borderColor: cat.color }]} onPress={()=>setKharchPage(cat.id)}><Text style={[styles.chipText, { color: cat.color }]}>{cat.name}</Text></TouchableOpacity>))}</View>
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (<ScrollView contentContainerStyle={styles.buttonContainer} showsVerticalScrollIndicator={false}><Text style={styles.header}>TARZAN KATLAM</Text>{HOME_BUTTONS.map(btn => (<TouchableOpacity key={btn.id} style={[styles.button, { backgroundColor: btn.color }]} onPress={() => Alert.alert(btn.name)}><Text style={styles.buttonText}>{btn.name}</Text></TouchableOpacity>))}</ScrollView>)}
        {activeTab === 'kharch' && renderKharchMain()}
        {activeTab === 'setting' && (<ScrollView contentContainerStyle={styles.settingContainer} showsVerticalScrollIndicator={false}><Text style={styles.settingHeader}>{SETTING_DATA.header}</Text><View style={styles.card}><Text style={styles.cardTitle}>{SETTING_DATA.calculator.title}</Text><TouchableOpacity style={[styles.blueButton, { backgroundColor: SETTING_DATA.calculator.buttonColor }]} onPress={() => { setShowCalculator(true); setCalcScreen('main'); }}><Text style={styles.blueButtonText}>{SETTING_DATA.calculator.buttonText}</Text></TouchableOpacity></View><View style={styles.card}><Text style={styles.cardTitle}>{SETTING_DATA.password.title}</Text><TextInput style={styles.input} placeholder={SETTING_DATA.password.placeholder} value={newPassword} onChangeText={setNewPassword} secureTextEntry /><TouchableOpacity style={[styles.greenButton, { backgroundColor: SETTING_DATA.password.buttonColor }]} onPress={() => { if (!newPassword) { Alert.alert('पासवर्ड लिखें'); return; } Alert.alert('सफल', newPassword); setNewPassword(''); }}><Text style={styles.greenButtonText}>{SETTING_DATA.password.buttonText}</Text></TouchableOpacity></View></ScrollView>)}
        {activeTab === 'order' && <View style={styles.otherContainer}><Text style={styles.otherTitle}>ऑर्डर</Text></View>}
      </View>
      <View style={styles.bottomBar}>{NAV_TABS.map(tab => (<TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.key)}><Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTab]}>{tab.icon}</Text><Text style={[styles.tabText, activeTab === tab.key && styles.activeTab]}>{tab.name}</Text></TouchableOpacity>))}</View>
      <Modal visible={showCalculator} animationType="slide"><View style={styles.calcPage}><View style={styles.calcPageHeader}><TouchableOpacity onPress={() => calcScreen === 'main'? setShowCalculator(false) : setCalcScreen('main')}><Text style={styles.backText}>{calcScreen === 'main'? '✕ बंद' : '← वापस'}</Text></TouchableOpacity><Text style={styles.calcPageTitle}>{CALCULATOR_DATA.header}</Text><View style={{ width: 50 }} /></View>{calcScreen === 'main' && (<View style={{ padding: 15, paddingTop: 20 }}>{CALCULATOR_DATA.menu.map((item) => (<TouchableOpacity key={item.id} style={[styles.bigCalcBtn, { backgroundColor: item.color }]} onPress={() => setCalcScreen(item.id as CalcScreen)}><Text style={styles.bigCalcIcon}>{item.icon} {item.name}</Text><Text style={styles.bigCalcSub}>{item.sub}</Text></TouchableOpacity>))}</View>)}{calcScreen === 'samay' && (<ScrollView contentContainerStyle={{ padding: 15 }}>{timeResult && (<><View style={[styles.resultCard, { backgroundColor: '#E6E6FA' }]}><Text style={styles.resultLabel}>{CALCULATOR_DATA.screens.samay.totalLabel}</Text><Text style={styles.resultValue}>{timeResult.hoursStr}</Text></View><View style={[styles.resultCard, { backgroundColor: '#FFF8DC', marginTop: 10 }]}><Text style={styles.resultLabel}>{CALCULATOR_DATA.screens.samay.amountLabel}</Text><Text style={styles.resultValue}>{timeResult.amount}</Text></View></>)}<View style={[styles.card, { marginTop: 15 }]}><Text style={styles.timeLabel}>{CALCULATOR_DATA.screens.samay.startLabel}</Text><View style={styles.timeBox}><TextInput style={styles.timeInput} value={startTime} onChangeText={setStartTime} placeholder="1.10" keyboardType="numeric" /><View style={styles.ampmContainer}><TouchableOpacity style={[styles.ampmBtn, startAmPm==='AM' && styles.ampmActive]} onPress={()=>setStartAmPm('AM')}><Text style={[styles.ampmText, startAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity><TouchableOpacity style={[styles.ampmBtn, startAmPm==='PM' && styles.ampmActive]} onPress={()=>setStartAmPm('PM')}><Text style={[styles.ampmText, startAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity></View></View><Text style={[styles.timeLabel, {marginTop: 15}]}>{CALCULATOR_DATA.screens.samay.endLabel}</Text><View style={styles.timeBox}><TextInput style={styles.timeInput} value={endTime} onChangeText={setEndTime} placeholder="2.40" keyboardType="numeric" /><View style={styles.ampmContainer}><TouchableOpacity style={[styles.ampmBtn, endAmPm==='AM' && styles.ampmActive]} onPress={()=>setEndAmPm('AM')}><Text style={[styles.ampmText, endAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity><TouchableOpacity style={[styles.ampmBtn, endAmPm==='PM' && styles.ampmActive]} onPress={()=>setEndAmPm('PM')}><Text style={[styles.ampmText, endAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity></View></View><Text style={[styles.timeLabel, { marginTop: 15 }]}>Hourly rate</Text><TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder={CALCULATOR_DATA.screens.samay.ratePlaceholder} /><TouchableOpacity style={[styles.blueButton, { backgroundColor: CALCULATOR_DATA.screens.samay.color, marginTop: 20 }]} onPress={()=>{ const s=parseTimeToMinutes(startTime,startAmPm); const e=parseTimeToMinutes(endTime,endAmPm); const r=parseFloat(hourlyRate); if(s===null||e===null){Alert.alert('समय सही लिखें'); return;} if(isNaN(r)){Alert.alert('Rate लिखें'); return;} let d=e-s; if(d<0) d+=24*60; const h=Math.floor(d/60); const m=d%60; const dec=d/60; setTimeResult({hoursStr:`${h}.${String(m).padStart(2,'0')} मिनट`, amount:`₹${(dec*r).toFixed(0)}`}); }}><Text style={styles.blueButtonText}>{CALCULATOR_DATA.screens.samay.buttonText}</Text></TouchableOpacity></View></ScrollView>)}{calcScreen === 'umr' && (<ScrollView contentContainerStyle={{ padding: 20 }}><Text style={styles.normalTitle}>{CALCULATOR_DATA.screens.umr.title}</Text><View style={styles.card}><Text style={styles.timeLabel}>{CALCULATOR_DATA.screens.umr.dobLabel}</Text><TextInput style={styles.input} value={dobStr} onChangeText={setDobStr} placeholder={CALCULATOR_DATA.screens.umr.dobPlaceholder} keyboardType="numeric" /><Text style={[styles.timeLabel, {marginTop: 15}]}>{CALCULATOR_DATA.screens.umr.todayLabel}</Text><TextInput style={styles.input} value={todayStr} onChangeText={setTodayStr} placeholder={CALCULATOR_DATA.screens.umr.todayPlaceholder} keyboardType="numeric" /><TouchableOpacity style={[styles.blueButton, { backgroundColor: CALCULATOR_DATA.screens.umr.color, marginTop: 20 }]} onPress={()=>{ const dob=parseDateDMY(dobStr); const today=parseDateDMY(todayStr); if(!dob||!today){Alert.alert('तारीख सही लिखें'); return;} let y=today.getFullYear()-dob.getFullYear(); let mo=today.getMonth()-dob.getMonth(); let da=today.getDate()-dob.getDate(); if(da<0){mo--; const pm=new Date(today.getFullYear(),today.getMonth(),0); da+=pm.getDate();} if(mo<0){y--; mo+=12;} setAgeResult(`${y} साल ${mo} महीना ${da} दिन`); }}><Text style={styles.blueButtonText}>{CALCULATOR_DATA.screens.umr.buttonText}</Text></TouchableOpacity>{ageResult? (<View style={[styles.resultCard, { backgroundColor: '#E6E6FA', marginTop: 20 }]}><Text style={styles.resultLabel}>उम्र</Text><Text style={styles.resultValue}>{ageResult}</Text></View>):null}</View></ScrollView>)}</View></Modal>
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
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, marginTop: 10 },
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
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  blueButton: { borderRadius: 15, padding: 16, alignItems: 'center' },
  blueButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  greenButton: { borderRadius: 15, padding: 16, alignItems: 'center', marginTop: 10 },
  greenButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  calcPage: { flex: 1, backgroundColor: '#F5F7FB', paddingTop: 40 },
  calcPageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  calcPageTitle: { fontSize: 18, fontWeight: 'bold' },
  backText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  normalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  bigCalcBtn: { borderRadius: 18, padding: 25, alignItems: 'center', marginBottom: 20, elevation: 3 },
  bigCalcIcon: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  bigCalcSub: { fontSize: 15, color: '#fff', marginTop: 6 },
  resultCard: { borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 14, color: '#555' },
  resultValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  timeLabel: { fontSize: 14, color: '#555', marginBottom: 5 },
  timeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, backgroundColor: '#fff', paddingHorizontal: 10 },
  timeInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  ampmContainer: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 20, padding: 3 },
  ampmBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  ampmActive: { backgroundColor: '#2E9D5A' },
  ampmText: { fontSize: 13, fontWeight: 'bold', color: '#555' },
  ampmActiveText: { color: '#fff' },
  totalCard: { backgroundColor: '#FFEBEE', borderRadius: 15, padding: 18, alignItems: 'center', marginBottom: 15, elevation: 2 },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#B71C1C', textAlign: 'center' },
  categoryLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 5 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 10, margin: 5, backgroundColor: '#fff' },
  chipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 30, color: '#fff', fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginBottom: 5 },
  th: { flex: 1, fontWeight: 'bold', fontSize: 12, textAlign: 'center' },
  tableRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 5, elevation: 1 },
  td: { flex: 1, fontSize: 12, textAlign: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  formTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
});
