import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Share, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { HOME_BUTTONS, NAV_TABS, SETTING_DATA, CALCULATOR_DATA, KHARCH_DATA } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';
type CalcScreen = 'main' | 'samay' | 'umr' | 'samay_list';
type AmPm = 'AM' | 'PM';

function parseTimeToMinutes(timeStr: string, ampm: AmPm): number | null {
  const s = timeStr.trim().replace('.', ':');
  const match = s.match(/(\d{1,2}):(\d{2})/);
  if (!match) {
    const dotMatch = timeStr.match(/(\d{1,2})\.(\d{2})/);
    if (!dotMatch) return null;
    let h = parseInt(dotMatch[1]); const m = parseInt(dotMatch[2]);
    if (ampm === 'PM' && h < 12) h += 12; if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  let h = parseInt(match[1]); const m = parseInt(match[2]);
  if (ampm === 'PM' && h < 12) h += 12; if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}
function parseDateDMY(str: string): Date | null {
  const cleaned = str.trim().replace(/-/g, '.').replace(/\//g, '.'); const parts = cleaned.split('.'); if (parts.length!==3) return null;
  const d = parseInt(parts[0]); const m = parseInt(parts[1]); const y = parseInt(parts[2]); if (isNaN(d)||isNaN(m)||isNaN(y)) return null;
  const date = new Date(y, m-1, d); if (date.getDate()!==d || date.getMonth()!==m-1 || date.getFullYear()!==y) return null; return date;
}

interface SamayBill {
  id: string; kisanName: string; pata: string; mobile: string; karya: string; dinank: string;
  startTime: string; startAmPm: AmPm; endTime: string; endAmPm: AmPm;
  hourlyRate: string; totalHours: string; totalAmount: string; totalMinutes: number;
}

// --- PDF HTML TEMPLATE WITH KARYA ---
function getBillHtml(bill: SamayBill): string {
  return `
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #222; }
      .header { text-align: center; border-bottom: 3px solid #2E9D5A; padding-bottom: 15px; margin-bottom: 20px; }
      .header h1 { margin: 0; font-size: 28px; color: #2E9D5A; letter-spacing: 1px; }
      .header p { margin: 4px 0 0 0; font-size: 14px; color: #555; }
      .section { background: #F9F9F9; border-radius: 10px; padding: 15px 18px; margin-bottom: 15px; }
      .section h3 { margin: 0 0 10px 0; color: #2E9D5A; font-size: 16px; }
      .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
      .row span:first-child { color: #666; }
      .row span:last-child { font-weight: bold; }
      .karya-box { background: #FFF8E1; border: 1px solid #FFD54F; border-radius: 8px; padding: 10px 14px; margin-top: 8px; }
      .karya-label { font-size: 12px; color: #8D6E63; }
      .karya-value { font-size: 15px; font-weight: bold; color: #000; margin-top: 3px; }
      .highlight { background: #E8F5E9; border: 2px dashed #2E9D5A; border-radius: 12px; padding: 15px; text-align: center; margin-top: 20px; }
      .highlight .time { font-size: 16px; font-weight: bold; }
      .highlight .amount { font-size: 26px; font-weight: 900; color: #B71C1C; margin-top: 8px; }
      .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 12px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>🚜 TARZAN KATLAM</h1>
      <p>हार्वेस्टर सेवा - प्रोफेशनल बिल</p>
      <p>मो. 9479025929 | पिपरौद</p>
    </div>

    <div class="section">
      <h3>👨‍🌾 किसान की जानकारी</h3>
      <div class="row"><span>नाम:</span><span>${bill.kisanName}</span></div>
      <div class="row"><span>पता / गांव:</span><span>${bill.pata}</span></div>
      <div class="row"><span>मोबाइल:</span><span>${bill.mobile}</span></div>
      <div class="karya-box">
        <div class="karya-label">कार्य:</div>
        <div class="karya-value">${bill.karya || '-'}</div>
      </div>
      <div class="row" style="margin-top:10px"><span>दिनांक:</span><span>${bill.dinank}</span></div>
    </div>

    <div class="section">
      <h3>⏰ समय का विवरण</h3>
      <div class="row"><span>Start Time:</span><span>${bill.startTime} ${bill.startAmPm}</span></div>
      <div class="row"><span>End Time:</span><span>${bill.endTime} ${bill.endAmPm}</span></div>
      <div class="row"><span>दर (प्रति घंटा):</span><span>₹ ${bill.hourlyRate}</span></div>
    </div>

    <div class="highlight">
      <div class="time">कुल समय: ${bill.totalHours}</div>
      <div class="amount">कुल राशि: ₹ ${bill.totalAmount}</div>
    </div>

    <div class="footer">
      <p>धन्यवाद! 🙏 फिर से सेवा का मौका दें</p>
      <p>यह बिल कंप्यूटर द्वारा बनाया गया है</p>
    </div>
  </body>
  </html>
  `;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true); const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [newPassword, setNewPassword] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcScreen, setCalcScreen] = useState<CalcScreen>('main');
  const [kisanName, setKisanName] = useState('टार्जन कतलाम');
  const [kisanPata, setKisanPata] = useState('पिपरौद');
  const [kisanMobile, setKisanMobile] = useState('9479025929');
  const [kisanKarya, setKisanKarya] = useState('');
  const [kisanDinank, setKisanDinank] = useState('14.05.1989');
  const [startTime, setStartTime] = useState('8.39');
  const [startAmPm, setStartAmPm] = useState<AmPm>('AM');
  const [endTime, setEndTime] = useState('10.39');
  const [endAmPm, setEndAmPm] = useState<AmPm>('AM');
  const [hourlyRate, setHourlyRate] = useState('3000');
  const [timeResult, setTimeResult] = useState<{hoursStr: string, amount: string, totalMin: number} | null>(null);
  const [samayBills, setSamayBills] = useState<SamayBill[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dobStr, setDobStr] = useState('14.5.1989'); const [todayStr, setTodayStr] = useState('8.10.2026'); const [ageResult, setAgeResult] = useState('');
  const [kharchPage, setKharchPage] = useState<string | null>(null);
  const [showKharchForm, setShowKharchForm] = useState(false);
  const [formValues, setFormValues] = useState<any>({ tithi: '8.10.2026', litre: '', rashi: '', parts_name: '', kaam: '', naam: '', kisan: '', hotel: '', days: '', vivaran: '', payment: 'नगद' });
  const [kharchEntries, setKharchEntries] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100? 100 : p + 1), 25);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedBills = await AsyncStorage.getItem('SAMAY_BILLS');
        if (savedBills) {
          const parsed = JSON.parse(savedBills);
          // Migration: old bills without karya field
          const migrated = parsed.map((b:any)=> ({...b, karya: b.karya || ''}));
          setSamayBills(migrated);
        }
        const savedKharch = await AsyncStorage.getItem('KHARCH_ENTRIES');
        if (savedKharch) setKharchEntries(JSON.parse(savedKharch));
      } catch (e) { console.log('load error', e); }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('SAMAY_BILLS', JSON.stringify(samayBills)).catch(()=>{});
  }, [samayBills]);

  useEffect(() => {
    AsyncStorage.setItem('KHARCH_ENTRIES', JSON.stringify(kharchEntries)).catch(()=>{});
  }, [kharchEntries]);

  useEffect(() => {
    const onBackPress = () => {
      if (showKharchForm) { setShowKharchForm(false); return true; }
      if (kharchPage) { setKharchPage(null); return true; }
      if (showCalculator) {
        if (calcScreen === 'samay_list') { setCalcScreen('samay'); return true; }
        if (calcScreen !== 'main') { setCalcScreen('main'); return true; }
        setShowCalculator(false); return true;
      }
      if (activeTab !== 'home') { setActiveTab('home'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [showCalculator, calcScreen, kharchPage, showKharchForm, activeTab]);

  const handleCalculateAndSave = () => {
    const s=parseTimeToMinutes(startTime,startAmPm);
    const e=parseTimeToMinutes(endTime,endAmPm);
    const r=parseFloat(hourlyRate);
    if(s===null||e===null){Alert.alert('समय सही लिखें'); return;}
    if(isNaN(r)){Alert.alert('Rate लिखें'); return;}
    if(!kisanName.trim()){Alert.alert('नाम लिखें'); return;}
    let d=e-s; if(d<0) d+=24*60;
    const h=Math.floor(d/60); const m=d%60; const dec=d/60;
    const hoursStr = `${h} घंटा ${String(m).padStart(2,'0')} मिनट`;
    const amount = `${(dec*r).toFixed(0)}`;
    setTimeResult({hoursStr, amount: `₹${amount}`, totalMin: d});
    if(editingId){
      setSamayBills(prev => prev.map(b => b.id===editingId? {...b, kisanName: kisanName.trim(), pata: kisanPata.trim(), mobile: kisanMobile.trim(), karya: kisanKarya.trim(), dinank: kisanDinank.trim(), startTime, startAmPm, endTime, endAmPm, hourlyRate, totalHours: hoursStr, totalAmount: amount, totalMinutes: d} : b));
      setEditingId(null); Alert.alert('✅ अपडेट हो गया');
    } else {
      const newBill: SamayBill = { id: Date.now().toString(), kisanName: kisanName.trim(), pata: kisanPata.trim(), mobile: kisanMobile.trim(), karya: kisanKarya.trim(), dinank: kisanDinank.trim(), startTime, startAmPm, endTime, endAmPm, hourlyRate, totalHours: hoursStr, totalAmount: amount, totalMinutes: d };
      setSamayBills(prev => [newBill,...prev]); Alert.alert('✅ सेव हो गया');
    }
  };

  const handleEdit = (bill: SamayBill) => {
    setKisanName(bill.kisanName); setKisanPata(bill.pata); setKisanMobile(bill.mobile); setKisanKarya(bill.karya || ''); setKisanDinank(bill.dinank);
    setStartTime(bill.startTime); setStartAmPm(bill.startAmPm); setEndTime(bill.endTime); setEndAmPm(bill.endAmPm);
    setHourlyRate(bill.hourlyRate); setEditingId(bill.id);
    setTimeResult({ hoursStr: bill.totalHours, amount: `₹${bill.totalAmount}`, totalMin: bill.totalMinutes });
    setCalcScreen('samay');
  };

  const handleDelete = (id: string) => {
    Alert.alert('डिलीट?', 'हटाना है?', [{text:'नहीं', style:'cancel'}, {text:'हाँ', style:'destructive', onPress:()=>setSamayBills(prev=>prev.filter(b=>b.id!==id))}]);
  };

  const shareBill = async (bill: SamayBill) => {
    const karyaLine = bill.karya ? `🔧 कार्य: ${bill.karya}\n` : '';
    const msg = `🚜 *TARZAN KATLAM - हार्वेस्टर बिल*\n\n👨‍🌾 किसान: ${bill.kisanName}\n📍 पता: ${bill.pata}\n📱 मोबाइल: ${bill.mobile}\n${karyaLine}📅 दिनांक: ${bill.dinank}\n\n⏰ Start: ${bill.startTime} ${bill.startAmPm}\n⏰ End: ${bill.endTime} ${bill.endAmPm}\n⏳ टोटल: ${bill.totalHours}\n💰 दर: ₹${bill.hourlyRate}/घंटा\n💵 *कुल राशि: ₹${bill.totalAmount}*\n\nधन्यवाद! 🙏`;
    try{ await Share.share({message: msg}); } catch(e){ Alert.alert('बिल', msg); }
  };

  const sharePDF = async (bill: SamayBill) => {
    try {
      const html = getBillHtml(bill);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { 
          mimeType: 'application/pdf',
          dialogTitle: `Bill - ${bill.kisanName}.pdf`,
          UTI: 'com.adobe.pdf'
        });
      } else {
        Alert.alert('PDF बन गया', `फाइल: ${uri}`);
      }
    } catch (e) {
      console.log('PDF Error', e);
      Alert.alert('Error', 'PDF बनाने में दिक्कत आई');
    }
  };

  if (showSplash) { return (<View style={styles.splashContainer}><Image source={require('./assets/splash.png')} style={styles.splashImage} resizeMode="contain" /><View style={styles.loadingContainer}><View style={styles.progressBarBackground}><View style={[styles.progressBarFill, { width: `${loading}%` }]} /></View><Text style={styles.loadingText}>Loading {loading}%</Text></View></View>); }
  const currentCat = KHARCH_DATA.categories.find(c => c.id === kharchPage);
  const entriesForCat = kharchEntries.filter(e => e.catId === kharchPage);
  const totalForCat = entriesForCat.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);
  const grandTotal = kharchEntries.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);
  const getSecondFieldValue = (e: any) => e.litre || e.parts_name || e.kaam || e.naam || e.kisan || e.hotel || e.days || e.vivaran || '-';

  if (kharchPage) {
    const formDef = (KHARCH_DATA.forms as any)[kharchPage] || (KHARCH_DATA.forms as any).anya;
    return (<View style={styles.mainContainer}><View style={styles.calcPageHeader}><TouchableOpacity onPress={()=>setKharchPage(null)}><Text style={styles.backText}>← वापस</Text></TouchableOpacity><Text style={styles.calcPageTitle}>{currentCat?.name}</Text><View style={{ width: 50 }} /></View><View style={[styles.totalCard, { margin: 10, marginBottom: 5 }]}><Text style={styles.totalText}>कुल: ₹ {totalForCat}</Text></View><View style={{ flex: 1, padding: 10 }}><View style={styles.tableHeader}>{formDef.tableHeads.map((h: string, i: number) => (<Text key={i} style={styles.th}>{h}</Text>))}</View><ScrollView contentContainerStyle={{ paddingBottom: 100 }}>{entriesForCat.map((e, idx) => (<View key={idx} style={styles.tableRow}><Text style={styles.td}>{e.tithi}</Text><Text style={styles.td}>{getSecondFieldValue(e)}</Text><Text style={styles.td}>₹{e.rashi}</Text><Text style={styles.td}>{e.payment}</Text></View>))}</ScrollView></View><TouchableOpacity style={styles.fab} onPress={()=>{ setFormValues({ tithi: '8.10.2026', litre: '', rashi: '', payment: formDef.paymentOptions[0] }); setShowKharchForm(true); }}><Text style={styles.fabText}>+</Text></TouchableOpacity><Modal visible={showKharchForm} animationType="slide" transparent><View style={styles.modalBg}><View style={styles.formCard}><Text style={styles.formTitle}>{formDef.title}</Text>{formDef.fields.map((f: any) => (<View key={f.key} style={{ marginTop: 12 }}><Text style={styles.timeLabel}>{f.label}</Text><TextInput style={styles.input} placeholder={f.placeholder} value={formValues[f.key]} onChangeText={(v)=>setFormValues({...formValues, [f.key]: v })} /></View>))}<TouchableOpacity style={[styles.blueButton, { backgroundColor: '#4A90E2', marginTop: 20 }]} onPress={()=>{ setKharchEntries([...kharchEntries, { catId: kharchPage,...formValues }]); setShowKharchForm(false); }}><Text style={styles.blueButtonText}>{formDef.saveButton}</Text></TouchableOpacity><TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={()=>setShowKharchForm(false)}><Text style={{ color: '#777' }}>बंद करें</Text></TouchableOpacity></View></View></Modal></View>);
  }

  const renderKharchMain = () => (<ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }}><Text style={styles.header}>{KHARCH_DATA.header}</Text><View style={styles.totalCard}><Text style={styles.totalText}>कुल खर्च: ₹ {grandTotal || 0}</Text></View><Text style={styles.categoryLabel}>{KHARCH_DATA.categoryLabel}</Text><View style={styles.chipContainer}>{KHARCH_DATA.categories.map(cat => (<TouchableOpacity key={cat.id} style={[styles.chip, { borderColor: cat.color }]} onPress={()=>setKharchPage(cat.id)}><Text style={[styles.chipText, { color: cat.color }]}>{cat.name}</Text></TouchableOpacity>))}</View></ScrollView>);

  const renderSamayScreen = () => (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 120 }}>
      {timeResult && (<><View style={[styles.resultCard, { backgroundColor: '#EDE7F6' }]}><Text style={styles.resultLabelFull}>⏳ टोटल समय</Text><Text style={styles.resultValue}>{timeResult.hoursStr}</Text></View><View style={[styles.resultCard, { backgroundColor: '#FFF9C4', marginTop: 10 }]}><Text style={styles.resultLabelFull}>💰 कुल राशि</Text><Text style={[styles.resultValue, { fontSize: 20 }]}>{timeResult.amount}</Text></View></>)}
      <View style={[styles.card, { marginTop: 15 }]}>
        <Text style={styles.sectionTitle}>👨‍🌾 किसान की जानकारी</Text>
        <Text style={styles.timeLabel}>किसान का नाम</Text><TextInput style={styles.input} value={kisanName} onChangeText={(t)=>setKisanName(t)} placeholder="नाम" placeholderTextColor="#AAA" />
        <Text style={[styles.timeLabel, {marginTop: 12}]}>पता</Text><TextInput style={styles.input} value={kisanPata} onChangeText={(t)=>setKisanPata(t)} placeholder="पता" placeholderTextColor="#AAA" />
        <Text style={[styles.timeLabel, {marginTop: 12}]}>मो. न.</Text><TextInput style={styles.input} value={kisanMobile} onChangeText={(t)=>setKisanMobile(t)} placeholder="मोबाइल" keyboardType="phone-pad" placeholderTextColor="#AAA" />
        <Text style={[styles.timeLabel, {marginTop: 12, fontWeight:'bold', color:'#000'}]}>कार्य</Text><TextInput style={[styles.input, { minHeight: 55, textAlignVertical: 'top' }]} value={kisanKarya} onChangeText={(t)=>setKisanKarya(t)} placeholder="जैसे - धान कटाई, जोताई, मताई, गहाई" placeholderTextColor="#AAA" multiline={true} numberOfLines={2} />
        <Text style={[styles.timeLabel, {marginTop: 12}]}>दिनांक</Text><TextInput style={styles.input} value={kisanDinank} onChangeText={(t)=>setKisanDinank(t)} placeholder="14.05.1989" placeholderTextColor="#AAA" />
        <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 18 }} />
        <Text style={styles.sectionTitle}>⏰ समय</Text>
        <Text style={styles.timeLabel}>Start time</Text><View style={styles.timeBox}><TextInput style={styles.timeInput} value={startTime} onChangeText={setStartTime} placeholder="8.39" keyboardType="numeric" /><View style={styles.ampmContainer}><TouchableOpacity style={[styles.ampmBtn, startAmPm==='AM' && styles.ampmActive]} onPress={()=>setStartAmPm('AM')}><Text style={[styles.ampmText, startAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity><TouchableOpacity style={[styles.ampmBtn, startAmPm==='PM' && styles.ampmActive]} onPress={()=>setStartAmPm('PM')}><Text style={[styles.ampmText, startAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity></View></View>
        <Text style={[styles.timeLabel, {marginTop: 15}]}>End time</Text><View style={styles.timeBox}><TextInput style={styles.timeInput} value={endTime} onChangeText={setEndTime} placeholder="10.39" keyboardType="numeric" /><View style={styles.ampmContainer}><TouchableOpacity style={[styles.ampmBtn, endAmPm==='AM' && styles.ampmActive]} onPress={()=>setEndAmPm('AM')}><Text style={[styles.ampmText, endAmPm==='AM' && styles.ampmActiveText]}>AM</Text></TouchableOpacity><TouchableOpacity style={[styles.ampmBtn, endAmPm==='PM' && styles.ampmActive]} onPress={()=>setEndAmPm('PM')}><Text style={[styles.ampmText, endAmPm==='PM' && styles.ampmActiveText]}>PM</Text></TouchableOpacity></View></View>
        <Text style={[styles.timeLabel, { marginTop: 15 }]}>राशि (₹ / घंटा)</Text><TextInput style={styles.input} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="3000" />
        <TouchableOpacity style={[styles.blueButton, { backgroundColor: editingId? '#FF9800' : '#2E9D5A', marginTop: 20 }]} onPress={handleCalculateAndSave}><Text style={styles.blueButtonText}>{editingId? '✏️ अपडेट' : 'हिसाब लगाएं'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#FF9800', marginTop: 12 }]} onPress={()=>setCalcScreen('samay_list')}><Text style={styles.blueButtonText}>📋 लिस्ट ({samayBills.length})</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSamayListScreen = () => (
    <View style={{ flex: 1, padding: 12 }}><ScrollView contentContainerStyle={{ paddingBottom: 100 }}>{samayBills.length===0? <View style={{ alignItems: 'center', marginTop: 100 }}><Text style={{ color: '#999' }}>कोई बिल नहीं</Text></View> : samayBills.map(bill => (<View key={bill.id} style={styles.billCard}>
      {/* TOP ROW: Left - Name+Pata, Right - Date+Karya */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.billName} numberOfLines={1}>{bill.kisanName}</Text>
          <Text style={styles.billSub} numberOfLines={1}>{bill.pata} {bill.mobile? '• '+bill.mobile : ''}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.billDate}>{bill.dinank}</Text>
          {bill.karya ? <Text style={styles.karyaRight} numberOfLines={2}>🔧 कार्य: {bill.karya}</Text> : null}
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
      <View style={styles.billMiddleRow}><Text style={styles.billTime}>{bill.startTime} {bill.startAmPm} → {bill.endTime} {bill.endAmPm}</Text><Text style={styles.billHours}>{bill.totalHours}</Text></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}><Text style={styles.billAmount}>₹{bill.totalAmount}</Text><View style={{ flexDirection: 'row' }}><TouchableOpacity style={styles.iconBtn} onPress={()=>handleEdit(bill)}><Text>✏️</Text></TouchableOpacity><TouchableOpacity style={[styles.iconBtn, {backgroundColor:'#FFEBEE', marginLeft:8}]} onPress={()=>handleDelete(bill.id)}><Text>🗑️</Text></TouchableOpacity></View></View>
      <View style={{ flexDirection: 'row', marginTop: 12 }}><TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#25D366', flex:1}]} onPress={()=>shareBill(bill)}><Text style={styles.actionBtnText}>📲 शेयर</Text></TouchableOpacity><TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#E91E63', flex:1, marginLeft:10}]} onPress={()=>sharePDF(bill)}><Text style={styles.actionBtnText}>📄 PDF</Text></TouchableOpacity></View>
    </View>))}</ScrollView></View>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (<ScrollView contentContainerStyle={styles.buttonContainer}><Text style={styles.header}>TARZAN KATLAM</Text>{HOME_BUTTONS.map(btn => (<TouchableOpacity key={btn.id} style={[styles.button, { backgroundColor: btn.color }]} onPress={() => Alert.alert(btn.name)}><Text style={styles.buttonText}>{btn.name}</Text></TouchableOpacity>))}</ScrollView>)}
        {activeTab === 'kharch' && renderKharchMain()}
        {activeTab === 'setting' && (<ScrollView contentContainerStyle={styles.settingContainer}><Text style={styles.settingHeader}>{SETTING_DATA.header}</Text><View style={styles.card}><Text style={styles.cardTitle}>{SETTING_DATA.calculator.title}</Text><TouchableOpacity style={[styles.blueButton, { backgroundColor: SETTING_DATA.calculator.buttonColor }]} onPress={() => { setShowCalculator(true); setCalcScreen('main'); }}><Text style={styles.blueButtonText}>{SETTING_DATA.calculator.buttonText}</Text></TouchableOpacity></View><View style={styles.card}><Text style={styles.cardTitle}>{SETTING_DATA.password.title}</Text><TextInput style={styles.input} placeholder={SETTING_DATA.password.placeholder} value={newPassword} onChangeText={setNewPassword} secureTextEntry /><TouchableOpacity style={[styles.greenButton, { backgroundColor: SETTING_DATA.password.buttonColor }]} onPress={() => { if (!newPassword) { Alert.alert('पासवर्ड लिखें'); return; } Alert.alert('सफल', newPassword); setNewPassword(''); }}><Text style={styles.greenButtonText}>{SETTING_DATA.password.buttonText}</Text></TouchableOpacity></View></ScrollView>)}
        {activeTab === 'order' && <View style={styles.otherContainer}><Text style={styles.otherTitle}>ऑर्डर</Text></View>}
      </View>
      <View style={styles.bottomBar}>{NAV_TABS.map(tab => (<TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.key)}><Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTab]}>{tab.icon}</Text><Text style={[styles.tabText, activeTab === tab.key && styles.activeTab]}>{tab.name}</Text></TouchableOpacity>))}</View>
      <Modal visible={showCalculator} animationType="slide"><View style={styles.calcPage}><View style={styles.calcPageHeader}><TouchableOpacity onPress={() => { if(calcScreen === 'main') setShowCalculator(false); else if(calcScreen === 'samay_list') setCalcScreen('samay'); else setCalcScreen('main'); }}><Text style={styles.backText}>{calcScreen === 'main'? '✕ बंद' : '← वापस'}</Text></TouchableOpacity><Text style={styles.calcPageTitle}>{calcScreen === 'samay_list'? '📋 बिल लिस्ट' : CALCULATOR_DATA.header}</Text><View style={{ width: 50 }} /></View>{calcScreen === 'main' && (<View style={{ padding: 15, paddingTop: 20 }}>{CALCULATOR_DATA.menu.map((item) => (<TouchableOpacity key={item.id} style={[styles.bigCalcBtn, { backgroundColor: item.color }]} onPress={() => setCalcScreen(item.id as CalcScreen)}><Text style={styles.bigCalcIcon}>{item.icon} {item.name}</Text><Text style={styles.bigCalcSub}>{item.sub}</Text></TouchableOpacity>))}</View>)}{calcScreen === 'samay' && renderSamayScreen()}{calcScreen === 'samay_list' && renderSamayListScreen()}{calcScreen === 'umr' && (<ScrollView contentContainerStyle={{ padding: 20 }}><Text style={styles.normalTitle}>{CALCULATOR_DATA.screens.umr.title}</Text><View style={styles.card}><Text style={styles.timeLabel}>{CALCULATOR_DATA.screens.umr.dobLabel}</Text><TextInput style={styles.input} value={dobStr} onChangeText={setDobStr} placeholder={CALCULATOR_DATA.screens.umr.dobPlaceholder} keyboardType="numeric" /><Text style={[styles.timeLabel, {marginTop: 15}]}>{CALCULATOR_DATA.screens.umr.todayLabel}</Text><TextInput style={styles.input} value={todayStr} onChangeText={setTodayStr} placeholder={CALCULATOR_DATA.screens.umr.todayPlaceholder} keyboardType="numeric" /><TouchableOpacity style={[styles.blueButton, { backgroundColor: CALCULATOR_DATA.screens.umr.color, marginTop: 20 }]} onPress={()=>{ const dob=parseDateDMY(dobStr); const today=parseDateDMY(todayStr); if(!dob||!today){Alert.alert('तारीख सही'); return;} let y=today.getFullYear()-dob.getFullYear(); let mo=today.getMonth()-dob.getMonth(); let da=today.getDate()-dob.getDate(); if(da<0){mo--; const pm=new Date(today.getFullYear(),today.getMonth(),0); da+=pm.getDate();} if(mo<0){y--; mo+=12;} setAgeResult(`${y} साल ${mo} महीना ${da} दिन`); }}><Text style={styles.blueButtonText}>{CALCULATOR_DATA.screens.umr.buttonText}</Text></TouchableOpacity>{ageResult? (<View style={[styles.resultCard, { backgroundColor: '#E6E6FA', marginTop: 20 }]}><Text style={styles.resultLabel}>उम्र</Text><Text style={styles.resultValue}>{ageResult}</Text></View>):null}</View></ScrollView>)}</View></Modal>
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
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
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
  resultCard: { borderRadius: 12, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 55 },
  resultLabel: { fontSize: 14, color: '#555' },
  resultLabelFull: { fontSize: 15, color: '#333', fontWeight: '600', flex: 1 },
  resultValue: { fontSize: 16, fontWeight: 'bold', color: '#000', flexShrink: 0, marginLeft: 10 },
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
  billCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 12, elevation: 3, borderLeftWidth: 5, borderLeftColor: '#2E9D5A' },
  billHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billName: { fontSize: 16, fontWeight: 'bold', color: '#000', flex: 1, marginRight: 10 },
  billDate: { fontSize: 13, color: '#000', fontWeight: '600', backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  billSub: { fontSize: 13, color: '#666', marginTop: 4 },
  billMiddleRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  billTime: { fontSize: 13, color: '#333' },
  billHours: { fontSize: 13, fontWeight: 'bold', color: '#2E9D5A' },
  billAmount: { fontSize: 19, fontWeight: 'bold', color: '#B71C1C' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  karyaRight: { fontSize: 13, color: '#000', fontWeight: '700', marginTop: 6, backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, textAlign: 'right' },
  actionBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
