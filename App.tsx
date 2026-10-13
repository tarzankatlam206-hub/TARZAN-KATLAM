import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Share, BackHandler, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { HOME_BUTTONS, NAV_TABS, SETTING_DATA, CALCULATOR_DATA, KHARCH_DATA } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';
type CalcScreen = 'main' | 'samay' | 'samay_list';
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

interface KisanItem {
  id: string;
  name: string;
  mobile: string;
  pata: string;
  totalRashi: string;
  advanceRashi: string;
  ghanta: string;
  trolly: string;
  karya?: string;
  dinank?: string;
}

interface OrderItem {
  id: string; name: string; pata: string; block: string; jila: string; rajya: string;
  mobile: string; karya: string; trolly: string; dinank: string; samay: string; ekad: string;
}
interface SamayBill {
  id: string; kisanName: string; pata: string; mobile: string; karya: string; dinank: string;
  startTime: string; startAmPm: AmPm; endTime: string; endAmPm: AmPm;
  hourlyRate: string; totalHours: string; totalAmount: string; totalMinutes: number;
}
function getBillHtml(bill: SamayBill): string {
  return `<html><head><meta charset="utf-8" /><style>
 body { font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #222; }
.header { text-align: center; border-bottom: 3px solid #2E9D5A; padding-bottom: 15px; margin-bottom: 20px; }
.section { background: #F9F9F9; border-radius: 10px; padding: 15px 18px; margin-bottom: 15px; }
.row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 14px; }
.karya-box { background: #FFF8E1; border: 1px solid #FFD54F; border-radius: 8px; padding: 10px 14px; margin-top: 8px; }
.highlight { background: #E8F5E9; border: 2px dashed #2E9D5A; border-radius: 12px; padding: 15px; text-align: center; margin-top: 20px; }
.amount { font-size: 26px; font-weight: 900; color: #B71C1C; margin-top: 8px; }
 </style></head><body>
 <div class="header"><h1>🚜 TARZAN KATLAM</h1><p>हार्वेस्टर सेवा - प्रोफेशनल बिल</p><p>मो. 9479025929 | पिपरौद</p></div>
 <div class="section"><div class="row"><span>नाम:</span><span>${bill.kisanName}</span></div><div class="row"><span>पता:</span><span>${bill.pata}</span></div><div class="row"><span>मोबाइल:</span><span>${bill.mobile}</span></div><div class="karya-box">कार्य: ${bill.karya || '-'}</div><div class="row"><span>दिनांक:</span><span>${bill.dinank}</span></div></div>
 <div class="section"><div class="row"><span>Start:</span><span>${bill.startTime} ${bill.startAmPm}</span></div><div class="row"><span>End:</span><span>${bill.endTime} ${bill.endAmPm}</span></div><div class="row"><span>दर:</span><span>₹ ${bill.hourlyRate}</span></div></div>
 <div class="highlight"><div>कुल समय: ${bill.totalHours}</div><div class="amount">कुल राशि: ₹ ${bill.totalAmount}</div></div>
 </body></html>`;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [appPassword, setAppPassword] = useState('2022');
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [newPassword, setNewPassword] = useState('');
  const [showSamayFolder, setShowSamayFolder] = useState(false);
  const [showSamayList, setShowSamayList] = useState(false);
  const [kisanName, setKisanName] = useState('');
  const [kisanPata, setKisanPata] = useState('');
  const [kisanMobile, setKisanMobile] = useState('');
  const [kisanKarya, setKisanKarya] = useState('');
  const [kisanDinank, setKisanDinank] = useState('');
  const [startTime, setStartTime] = useState('');
  const [startAmPm, setStartAmPm] = useState<AmPm>('AM');
  const [endTime, setEndTime] = useState('');
  const [endAmPm, setEndAmPm] = useState<AmPm>('AM');
  const [hourlyRate, setHourlyRate] = useState('');
  const [timeResult, setTimeResult] = useState<{hoursStr: string, amount: string, totalMin: number} | null>(null);
  const [samayBills, setSamayBills] = useState<SamayBill[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState({ name:'', pata:'', block:'', jila:'', rajya:'', mobile:'', karya:'', trolly:'लगाना है', dinank:'', samay:'', ekad:'' });

  // Kisan Section States
  const [showKisanScreen, setShowKisanScreen] = useState(false);
  const [kisanList, setKisanList] = useState<KisanItem[]>([]);
  const [searchKisan, setSearchKisan] = useState('');
  const [showKisanForm, setShowKisanForm] = useState(false);
  const [editingKisanId, setEditingKisanId] = useState<string | null>(null);
  const [kisanForm, setKisanForm] = useState({ name: '', mobile: '', pata: '', totalRashi: '', advanceRashi: '', ghanta: '', trolly: '', karya: '', dinank: '' });
  const [selectedKisanDetail, setSelectedKisanDetail] = useState<KisanItem | null>(null);
  const [kharchPage, setKharchPage] = useState<string | null>(null);
  const [showKharchForm, setShowKharchForm] = useState(false);
  const [formValues, setFormValues] = useState<any>({ tithi: '8.10.2026', litre: '', rashi: '', parts_name: '', kaam: '', naam: '', kisan: '', hotel: '', days: '', vivaran: '', payment: 'नगद' });
  const [kharchEntries, setKharchEntries] = useState<any[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100? 100 : p + 1), 25);
    const timer = setTimeout(() => { setShowSplash(false); if (!isLoggedIn) setShowLogin(true); }, 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedPass = await AsyncStorage.getItem('APP_PASSWORD');
        if (savedPass) setAppPassword(savedPass);
        const savedBills = await AsyncStorage.getItem('SAMAY_BILLS');
        if (savedBills) {
          const parsed = JSON.parse(savedBills);
          const migrated = parsed.map((b:any)=> ({...b, karya: b.karya || ''}));
          setSamayBills(migrated);
        }
        const savedKharch = await AsyncStorage.getItem('KHARCH_ENTRIES');
        if (savedKharch) setKharchEntries(JSON.parse(savedKharch));
        const savedOrders = await AsyncStorage.getItem('ORDER_LIST');
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        const savedKisan = await AsyncStorage.getItem('KISAN_LIST');
        if (savedKisan) setKisanList(JSON.parse(savedKisan));
      } catch (e) {
        console.log('load error', e);
      } finally {
        setIsDataLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;
    AsyncStorage.setItem('APP_PASSWORD', appPassword).catch(()=>{});
  }, [appPassword, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    AsyncStorage.setItem('SAMAY_BILLS', JSON.stringify(samayBills)).catch(()=>{});
  }, [samayBills, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    AsyncStorage.setItem('KHARCH_ENTRIES', JSON.stringify(kharchEntries)).catch(()=>{});
  }, [kharchEntries, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    AsyncStorage.setItem('ORDER_LIST', JSON.stringify(orders)).catch(()=>{});
  }, [orders, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded) return;
    AsyncStorage.setItem('KISAN_LIST', JSON.stringify(kisanList)).catch(()=>{});
  }, [kisanList, isDataLoaded]);

  useEffect(() => {
    const onBackPress = () => {
      if (selectedKisanDetail) { setSelectedKisanDetail(null); return true; }
      if (showKisanForm) { setShowKisanForm(false); return true; }
      if (showKisanScreen) { setShowKisanScreen(false); return true; }
      if (showOrderForm) { setShowOrderForm(false); return true; }
      if (showKharchForm) { setShowKharchForm(false); return true; }
      if (kharchPage) { setKharchPage(null); return true; }
      if (showSamayList) { setShowSamayList(false); return true; }
      if (showSamayFolder) { setShowSamayFolder(false); return true; }
      if (activeTab!== 'home') { setActiveTab('home'); return true; }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [showSamayFolder, showSamayList, kharchPage, showKharchForm, activeTab, showOrderForm, showKisanScreen, showKisanForm, selectedKisanDetail]);

  const handleLogout = () => {
    Alert.alert(
      'लॉग आउट?',
      'क्या आप लॉग आउट करना चाहते हैं?',
      [
        { text: 'नहीं', style: 'cancel' },
        {
          text: 'हाँ',
          style: 'destructive',
          onPress: () => {
            setIsLoggedIn(false);
            setShowLogin(true);
            setLoginPassword('');
            setActiveTab('home');
            setShowSamayFolder(false);
            setShowSamayList(false);
            setKharchPage(null);
          }
        }
      ]
    );
  };

  const handleSaveKisan = () => {
    const total = parseFloat(kisanForm.totalRashi) || 0;
    if (!kisanForm.name.trim()) { Alert.alert('नाम लिखें'); return; }
    const newItem: KisanItem = {
      id: editingKisanId || Date.now().toString(),
      name: kisanForm.name.trim() || 'रामदेव',
      mobile: kisanForm.mobile.trim() || '8629984119',
      pata: kisanForm.pata.trim() || 'मैनपुर',
      totalRashi: kisanForm.totalRashi.trim() || '3500',
      advanceRashi: kisanForm.advanceRashi.trim() || '1500',
      ghanta: kisanForm.ghanta.trim() || '3 घंटा 10 मिनट',
      trolly: kisanForm.trolly.trim() || '2',
      karya: kisanForm.karya.trim(),
      dinank: kisanForm.dinank.trim()
    };
    if (editingKisanId) {
      setKisanList(prev => prev.map(k => k.id === editingKisanId? newItem : k));
      setEditingKisanId(null);
    } else {
      setKisanList(prev => [newItem,...prev]);
    }
    setShowKisanForm(false);
    setKisanForm({ name: '', mobile: '', pata: '', totalRashi: '', advanceRashi: '', ghanta: '', trolly: '', karya: '', dinank: '' });
  };

  const handleEditKisan = (item: KisanItem) => {
    setKisanForm({
      name: item.name,
      mobile: item.mobile,
      pata: item.pata,
      totalRashi: item.totalRashi,
      advanceRashi: item.advanceRashi,
      ghanta: item.ghanta,
      trolly: item.trolly,
      karya: item.karya || '',
      dinank: item.dinank || ''
    });
    setEditingKisanId(item.id);
    setShowKisanForm(true);
  };

  const handleDeleteKisan = (id: string) => {
    Alert.alert('डिलीट?', 'इस किसान को हटाना है?', [
      { text: 'नहीं', style: 'cancel' },
      { text: 'हाँ', style: 'destructive', onPress: () => setKisanList(prev => prev.filter(k => k.id!== id)) }
    ]);
  };

  const handleLogin = () => {
    if (!loginPassword.trim()) {
      Alert.alert('पासवर्ड लिखें');
      return;
    }
    if (loginPassword === appPassword || loginPassword === '202122') {
      setIsLoggedIn(true);
      setShowLogin(false);
      setLoginPassword('');
      if (loginPassword === '202122' && loginPassword!== appPassword) {
        Alert.alert('मास्टर पासवर्ड से लॉगिन', 'आप मास्टर पासवर्ड 202122 से लॉगिन हुए हैं। नया पासवर्ड सेटिंग में जाकर बदल सकते हैं।');
      }
    } else {
      Alert.alert('गलत पासवर्ड', 'पासवर्ड सही नहीं है।');
    }
  };

  const handleCalculateAndSave = () => {
    const finalName = kisanName.trim() || 'टार्जन कतलाम';
    const finalPata = kisanPata.trim() || 'पिपरौद';
    const finalMobile = kisanMobile.trim() || '9479025929';
    const finalKarya = kisanKarya.trim();
    const finalDinank = kisanDinank.trim() || '14.05.1989';
    const finalStart = startTime.trim() || '8.39';
    const finalEnd = endTime.trim() || '10.39';
    const finalRate = hourlyRate.trim() || '3000';
    const s=parseTimeToMinutes(finalStart,startAmPm);
    const e=parseTimeToMinutes(finalEnd,endAmPm);
    const r=parseFloat(finalRate);
    if(s===null||e===null){Alert.alert('समय सही लिखें'); return;}
    if(isNaN(r)){Alert.alert('Rate लिखें'); return;}
    let d=e-s; if(d<0) d+=24*60;
    const h=Math.floor(d/60); const m=d%60; const dec=d/60;
    const hoursStr = `${h} घंटा ${String(m).padStart(2,'0')} मिनट`;
    const amount = `${(dec*r).toFixed(0)}`;
    setTimeResult({hoursStr, amount: `₹${amount}`, totalMin: d});
    if(editingId){
      setSamayBills(prev => prev.map(b => b.id===editingId? {...b, kisanName: finalName, pata: finalPata, mobile: finalMobile, karya: finalKarya, dinank: finalDinank, startTime: finalStart, startAmPm, endTime: finalEnd, endAmPm, hourlyRate: finalRate, totalHours: hoursStr, totalAmount: amount, totalMinutes: d} : b));
      setEditingId(null);
      Alert.alert('✅ अपडेट हो गया');
    } else {
      const newBill: SamayBill = { id: Date.now().toString(), kisanName: finalName, pata: finalPata, mobile: finalMobile, karya: finalKarya, dinank: finalDinank, startTime: finalStart, startAmPm, endTime: finalEnd, endAmPm, hourlyRate: finalRate, totalHours: hoursStr, totalAmount: amount, totalMinutes: d };
      setSamayBills(prev => [newBill,...prev]);
      Alert.alert('✅ सेव हो गया');
    }
  };

  const handleEdit = (bill: SamayBill) => {
    setKisanName(bill.kisanName);
    setKisanPata(bill.pata);
    setKisanMobile(bill.mobile);
    setKisanKarya(bill.karya || '');
    setKisanDinank(bill.dinank);
    setStartTime(bill.startTime);
    setStartAmPm(bill.startAmPm);
    setEndTime(bill.endTime);
    setEndAmPm(bill.endAmPm);
    setHourlyRate(bill.hourlyRate);
    setEditingId(bill.id);
    setTimeResult({ hoursStr: bill.totalHours, amount: `₹${bill.totalAmount}`, totalMin: bill.totalMinutes });
    setShowSamayList(false);
    setActiveTab('setting');
  };

  const handleDelete = (id: string) => {
    Alert.alert('डिलीट?', 'हटाना है?', [{text:'नहीं', style:'cancel'}, {text:'हाँ', style:'destructive', onPress:()=>setSamayBills(prev=>prev.filter(b=>b.id!==id))}]);
  };

  const shareBill = async (bill: SamayBill) => {
    const karyaLine = bill.karya? `🔧 कार्य: ${bill.karya}\n` : '';
    const msg = `🚜 *TARZAN KATLAM - हार्वेस्टर बिल*\n\n👨‍🌾 किसान: ${bill.kisanName}\n📍 पता: ${bill.pata}\n📱 मोबाइल: ${bill.mobile}\n${karyaLine}📅 दिनांक: ${bill.dinank}\n\n⏰ Start: ${bill.startTime} ${bill.startAmPm}\n⏰ End: ${bill.endTime} ${bill.endAmPm}\n⏳ टोटल: ${bill.totalHours}\n💰 दर: ₹${bill.hourlyRate}/घंटा\n💵 *कुल राशि: ₹${bill.totalAmount}*\n\nधन्यवाद! 🙏`;
    try{ await Share.share({message: msg}); } catch(e){ Alert.alert('बिल', msg); }
  };

  const sharePDF = async (bill: SamayBill) => {
    try {
      const html = getBillHtml(bill);
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Bill - ${bill.kisanName}.pdf`, UTI: 'com.adobe.pdf' });
      } else {
        Alert.alert('PDF बन गया', `फाइल: ${uri}`);
      }
    } catch (e) {
      Alert.alert('Error', 'PDF बनाने में दिक्कत आई');
    }
  };

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

  if (showLogin) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>🚜 TARZAN KATLAM</Text>
          <View style={{ marginTop: 30, width: '100%' }}>
            <Text style={[styles.timeLabel, { textAlign: 'center', fontSize: 15 }]}>
              पासवर्ड लिखें
            </Text>
            <TextInput
              style={[styles.input, { marginTop: 12, textAlign: 'center', fontSize: 22, letterSpacing: 8, fontWeight: 'bold' }]}
              placeholder="••••"
              placeholderTextColor="#BBB"
              secureTextEntry
              value={loginPassword}
              onChangeText={setLoginPassword}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.blueButton, { backgroundColor: '#2E9D5A', marginTop: 25, borderRadius: 25 }]}
              onPress={handleLogin}
            >
              <Text style={styles.blueButtonText}>🔒 लॉगिन करें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const currentCat = KHARCH_DATA.categories.find(c => c.id === kharchPage);
  const entriesForCat = kharchEntries.filter(e => e.catId === kharchPage);
  const totalForCat = entriesForCat.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);
  const grandTotal = kharchEntries.reduce((s, e) => s + (parseFloat(e.rashi) || 0), 0);
  const getSecondFieldValue = (e: any) => e.litre || e.parts_name || e.kaam || e.naam || e.kisan || e.hotel || e.days || e.vivaran || '-';

  if (kharchPage) {
    const formDef = (KHARCH_DATA.forms as any)[kharchPage] || (KHARCH_DATA.forms as any).anya;
    return (
      <View style={styles.mainContainer}>
        <View style={styles.calcPageHeader}>
          <View style={{ width: 50 }} />
          <Text style={styles.calcPageTitle}>{currentCat?.name}</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={[styles.totalCard, { margin: 10, marginBottom: 5 }]}>
          <Text style={styles.totalText}>कुल: ₹ {totalForCat}</Text>
        </View>
        <View style={{ flex: 1, padding: 10 }}>
          <View style={styles.tableHeader}>
            {formDef.tableHeads.map((h: string, i: number) => (
              <Text key={i} style={styles.th}>{h}</Text>
            ))}
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {entriesForCat.map((e, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.td}>{e.tithi}</Text>
                <Text style={styles.td}>{getSecondFieldValue(e)}</Text>
                <Text style={styles.td}>₹{e.rashi}</Text>
                <Text style={styles.td}>{e.payment || 'नगद'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity
          style={styles.fab}
          onPress={()=>{ setFormValues({ tithi: '8.10.2026', litre: '', rashi: '', payment: 'नगद', parts_name:'', kaam:'', naam:'', kisan:'', hotel:'', days:'', vivaran:'' }); setShowKharchForm(true); }}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
        <Modal visible={showKharchForm} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={[styles.formCard, { maxHeight: '90%' }]}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.formTitle}>{formDef.title}</Text>
                {formDef.fields.map((f: any) => (
                  <View key={f.key} style={{ marginTop: 12 }}>
                    <Text style={styles.timeLabel}>{f.label}</Text>
                    <TextInput style={styles.input} placeholder={f.placeholder} value={formValues[f.key]} onChangeText={(v)=>setFormValues({...formValues, [f.key]: v })} />
                  </View>
                ))}
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.timeLabel, { fontWeight: 'bold', color: '#000' }]}>भुगतान माध्यम *</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    <TouchableOpacity style={[styles.trollyChip, formValues.payment==='नगद' && styles.trollyActive]} onPress={()=>setFormValues({...formValues, payment:'नगद'})}>
                      <Text style={formValues.payment==='नगद'? styles.trollyActiveText : styles.trollyText}>💵 नगद</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.trollyChip, formValues.payment==='UPI' && styles.trollyActive]} onPress={()=>setFormValues({...formValues, payment:'UPI'})}>
                      <Text style={formValues.payment==='UPI'? styles.trollyActiveText : styles.trollyText}>📱 UPI</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#4A90E2', marginTop: 20 }]} onPress={()=>{ if(!formValues.rashi){ Alert.alert('राशि लिखें'); return; } setKharchEntries([...kharchEntries, { catId: kharchPage,...formValues }]); setShowKharchForm(false); }}>
                  <Text style={styles.blueButtonText}>{formDef.saveButton}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginTop: 12, alignItems: 'center', padding: 8 }} onPress={()=>setShowKharchForm(false)}>
                  <Text style={{ color: '#777' }}>बंद करें</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const filteredOrders = orders.filter(o => {
    if(!searchOrder.trim()) return true;
    const q = searchOrder.toLowerCase();
    return (o.name?.toLowerCase().includes(q) || o.mobile?.includes(q) || o.pata?.toLowerCase().includes(q) || o.karya?.toLowerCase().includes(q) || o.block?.toLowerCase().includes(q) || o.jila?.toLowerCase().includes(q));
  });

  const handleSaveOrder = () => {
    const finalForm = {
      name: orderForm.name.trim() || 'टार्जन कतलाम',
      pata: orderForm.pata.trim() || 'पिपरौद',
      block: orderForm.block.trim() || 'चारामा',
      jila: orderForm.jila.trim() || 'कांकेर',
      rajya: orderForm.rajya.trim() || 'छत्तीसगढ़',
      mobile: orderForm.mobile.trim() || '9479025929',
      karya: orderForm.karya.trim(),
      trolly: orderForm.trolly,
      dinank: orderForm.dinank.trim(),
      samay: orderForm.samay.trim(),
      ekad: orderForm.ekad.trim()
    };
    if(editingOrderId){
      setOrders(prev => prev.map(o => o.id===editingOrderId? { id: editingOrderId,...finalForm } : o));
      setEditingOrderId(null);
    } else {
      const newOrder: OrderItem = { id: Date.now().toString(),...finalForm };
      setOrders(prev => [newOrder,...prev]);
    }
    setShowOrderForm(false);
    setOrderForm({ name:'', pata:'', block:'', jila:'', rajya:'', mobile:'', karya:'', trolly:'लगाना है', dinank:'', samay:'', ekad:'' });
  };

  const handleEditOrder = (o: OrderItem) => {
    setOrderForm({ name:o.name, pata:o.pata, block:o.block, jila:o.jila, rajya:o.rajya, mobile:o.mobile, karya:o.karya, trolly:o.trolly, dinank:o.dinank, samay:o.samay, ekad:o.ekad });
    setEditingOrderId(o.id);
    setShowOrderForm(true);
  };

  const handleDeleteOrder = (id: string) => {
    Alert.alert('डिलीट करें?', 'यह ऑर्डर हटाना है?', [{text:'नहीं', style:'cancel'}, {text:'हाँ, हटाएँ', style:'destructive', onPress:()=> setOrders(prev=>prev.filter(o=>o.id!==id))}]);
  };

  const handleCall = (mobile: string) => { Linking.openURL(`tel:${mobile}`).catch(()=>Alert.alert('कॉल नहीं हो पा रहा')); };
  const handleWhatsApp = (mobile: string) => { const msg = `नमस्ते! Tarzan Katlam Harvester Service 🚜`; Linking.openURL(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`).catch(()=>Alert.alert('WhatsApp नहीं खुल रहा')); };
  const handleMessage = (mobile: string) => { Linking.openURL(`sms:${mobile}`).catch(()=>Alert.alert('मैसेज नहीं खुल रहा')); };

  const renderOrderMain = () => (
    <View style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <View style={{ padding: 12 }}>
        <View style={styles.orderTopBox}><Text style={styles.orderTopText}>📝 कुल ऑर्डर: {orders.length}</Text></View>
        <View style={styles.searchBox}><TextInput style={styles.searchInput} placeholder="🔍 सर्च करें (नाम / मोबाइल नं. / पता / कार्य)" placeholderTextColor="#888" value={searchOrder} onChangeText={setSearchOrder} /></View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
        {filteredOrders.length===0? (
          <View style={{ alignItems: 'center', marginTop: 80 }}><Text style={{ color: '#999', fontSize: 14 }}>{orders.length===0? 'कोई ऑर्डर नहीं, + से नया ऑर्डर जोड़ें' : 'कुछ नहीं मिला'}</Text></View>
        ) : filteredOrders.map(item => (
          <View key={item.id} style={styles.orderCard}>
            <Text style={styles.orderName}>🌾 {item.name}</Text>
            <Text style={styles.orderLine}>📍 पता: {item.pata} {item.block? `| ब्लॉक: ${item.block}` : ''}</Text>
            <Text style={styles.orderLine}>🏠 जिला: {item.jila} {item.rajya? `| राज्य: ${item.rajya}` : ''}</Text>
            <Text style={styles.orderLine}>📞 मोबाइल: {item.mobile}</Text>
            <Text style={styles.orderLine}>🔧 कार्य: {item.karya || '-'}</Text>
            <Text style={styles.orderLine}>🚛 ट्रॉली: {item.trolly || '-'}</Text>
            <Text style={styles.orderLine}>📅 दिनांक: {item.dinank} {item.samay? `| ⏰ समय: ${item.samay}` : ''} {item.ekad? `| 🌾 एकड़: ${item.ekad}` : ''}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 }}>
              <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#4CAF50' }]} onPress={()=>handleCall(item.mobile)}><Text style={styles.orderBtnText}>📞 कॉल</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#2E9D5A' }]} onPress={()=>handleWhatsApp(item.mobile)}><Text style={styles.orderBtnText}>🟢 व्हाट्सएप</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#4A90E2' }]} onPress={()=>handleMessage(item.mobile)}><Text style={styles.orderBtnText}>💬 मैसेज</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#FF9800' }]} onPress={()=>handleEditOrder(item)}><Text style={styles.orderBtnText}>✏️ एडिट</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.orderBtn, { backgroundColor: '#D32F2F' }]} onPress={()=>handleDeleteOrder(item.id)}><Text style={styles.orderBtnText}>🗑️ डिलीट</Text></TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.orderFab} onPress={()=>{ setEditingOrderId(null); setOrderForm({ name:'', pata:'', block:'', jila:'', rajya:'', mobile:'', karya:'', trolly:'लगाना है', dinank:'', samay:'', ekad:'' }); setShowOrderForm(true); }}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>+</Text>
      </TouchableOpacity>
      <Modal visible={showOrderForm} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.formCard, { maxHeight: '92%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formTitle}>{editingOrderId? '✏️ ऑर्डर एडिट करें' : '➕ नया ऑर्डर जोड़ें'}</Text>
              <Text style={styles.timeLabel}>किसान का नाम *</Text>
              <TextInput style={styles.input} placeholder="टार्जन कतलाम" placeholderTextColor="#AAA" value={orderForm.name} onChangeText={v=>setOrderForm({...orderForm, name:v})} />
              <Text style={[styles.timeLabel,{marginTop:10}]}>पता / गांव *</Text>
              <TextInput style={styles.input} placeholder="पिपरौद" placeholderTextColor="#AAA" value={orderForm.pata} onChangeText={v=>setOrderForm({...orderForm, pata:v})} />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timeLabel}>ब्लॉक</Text>
                  <TextInput style={styles.input} placeholder="चारामा" placeholderTextColor="#AAA" value={orderForm.block} onChangeText={v=>setOrderForm({...orderForm, block:v})} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timeLabel}>जिला</Text>
                  <TextInput style={styles.input} placeholder="कांकेर" placeholderTextColor="#AAA" value={orderForm.jila} onChangeText={v=>setOrderForm({...orderForm, jila:v})} />
                </View>
              </View>
              <Text style={[styles.timeLabel,{marginTop:10}]}>राज्य</Text>
              <TextInput style={styles.input} placeholder="छत्तीसगढ़" placeholderTextColor="#AAA" value={orderForm.rajya} onChangeText={v=>setOrderForm({...orderForm, rajya:v})} />
              <Text style={[styles.timeLabel,{marginTop:10}]}>मोबाइल नं. *</Text>
              <TextInput style={styles.input} placeholder="9479025929" placeholderTextColor="#AAA" keyboardType="phone-pad" value={orderForm.mobile} onChangeText={v=>setOrderForm({...orderForm, mobile:v})} />
              <Text style={[styles.timeLabel,{marginTop:10}]}>कार्य</Text>
              <TextInput style={styles.input} placeholder="धान कटाई, जोताई..." placeholderTextColor="#AAA" value={orderForm.karya} onChangeText={v=>setOrderForm({...orderForm, karya:v})} />
              <Text style={[styles.timeLabel,{marginTop:10}]}>ट्रॉली</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.trollyChip, orderForm.trolly==='लगाना है' && styles.trollyActive]} onPress={()=>setOrderForm({...orderForm, trolly:'लगाना है'})}>
                  <Text style={orderForm.trolly==='लगाना है'? styles.trollyActiveText: styles.trollyText}>लगाना है</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.trollyChip, orderForm.trolly==='नहीं लगाना' && styles.trollyActive]} onPress={()=>setOrderForm({...orderForm, trolly:'नहीं लगाना'})}>
                  <Text style={orderForm.trolly==='नहीं लगाना'? styles.trollyActiveText: styles.trollyText}>नहीं लगाना</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timeLabel}>दिनांक</Text>
                  <TextInput style={styles.input} placeholder="25.9.2026" placeholderTextColor="#AAA" value={orderForm.dinank} onChangeText={v=>setOrderForm({...orderForm, dinank:v})} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.timeLabel}>समय</Text>
                  <TextInput style={styles.input} placeholder="11 बजे" placeholderTextColor="#AAA" value={orderForm.samay} onChangeText={v=>setOrderForm({...orderForm, samay:v})} />
                </View>
              </View>
              <Text style={[styles.timeLabel,{marginTop:10}]}>एकड़</Text>
              <TextInput style={styles.input} placeholder="10" placeholderTextColor="#AAA" keyboardType="numeric" value={orderForm.ekad} onChangeText={v=>setOrderForm({...orderForm, ekad:v})} />
              <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#2E9D5A', marginTop: 20 }]} onPress={handleSaveOrder}>
                <Text style={styles.blueButtonText}>💾 सेव करें</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 12, alignItems: 'center', padding: 10 }} onPress={()=>setShowOrderForm(false)}>
                <Text style={{ color: '#777' }}>बंद करें</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderKharchMain = () => (
    <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 90 }}>
      <Text style={styles.header}>{KHARCH_DATA.header}</Text>
      <View style={styles.totalCard}>
        <Text style={styles.totalText}>कुल खर्च: ₹ {grandTotal || 0}</Text>
      </View>
      <Text style={styles.categoryLabel}>{KHARCH_DATA.categoryLabel}</Text>
      <View style={styles.chipContainer}>
        {KHARCH_DATA.categories.map(cat => (
          <TouchableOpacity key={cat.id} style={[styles.chip, { borderColor: cat.color }]} onPress={()=>setKharchPage(cat.id)}>
            <Text style={[styles.chipText, { color: cat.color }]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={{ flex: 1 }}>
        {activeTab === 'home' && (
          showKisanScreen? (
            <View style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
              <View style={styles.calcPageHeader}>
                <TouchableOpacity onPress={()=>setShowKisanScreen(false)} style={{ padding: 5 }}><Text style={styles.backText}>‹ वापस</Text></TouchableOpacity>
                <Text style={styles.calcPageTitle}>किसान</Text>
                <View style={{ width: 50 }} />
              </View>

              {(() => {
                const totalKisan = kisanList.length;
                const sumTotal = kisanList.reduce((s,k)=> s + (parseFloat(k.totalRashi)||0), 0);
                const sumAdv = kisanList.reduce((s,k)=> s + (parseFloat(k.advanceRashi)||0), 0);
                const sumBachat = sumTotal - sumAdv;
                return (
                  <View style={{ padding: 12 }}>
                    <View style={[styles.orderTopBox, { backgroundColor: '#E8F5E9', borderColor: '#2E9D5A', borderWidth: 1 }]}>
                      <Text style={[styles.orderTopText, { fontSize: 16, color: '#2E7D32' }]}>कुल किसान: {totalKisan}</Text>
                      <Text style={{ fontSize: 13, color: '#1A237E', marginTop: 6, fontWeight: 'bold', textAlign: 'center' }}>
                        💰 कुल राशि: ₹{sumTotal} | एडवांस: ₹{sumAdv} | बचत: ₹{sumBachat}
                      </Text>
                    </View>
                    <View style={styles.searchBox}>
                      <TextInput style={styles.searchInput} placeholder="🔍 सर्च करें (नाम / मोबाइल नं. / पता)" placeholderTextColor="#888" value={searchKisan} onChangeText={setSearchKisan} />
                    </View>
                  </View>
                );
              })()}

              <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 100 }}>
                {kisanList.filter(k=>{
                  if(!searchKisan.trim()) return true;
                  const q=searchKisan.toLowerCase();
                  return k.name.toLowerCase().includes(q) || k.mobile.includes(q) || k.pata.toLowerCase().includes(q);
                }).length===0? (
                  <View style={{ alignItems: 'center', marginTop: 80 }}><Text style={{ color: '#999' }}>{kisanList.length===0? 'कोई किसान नहीं, + से जोड़ें' : 'कुछ नहीं मिला'}</Text></View>
                ) : kisanList.filter(k=>{
                  if(!searchKisan.trim()) return true;
                  const q=searchKisan.toLowerCase();
                  return k.name.toLowerCase().includes(q) || k.mobile.includes(q) || k.pata.toLowerCase().includes(q);
                }).map(item=>{
                  const bachat = (parseFloat(item.totalRashi)||0) - (parseFloat(item.advanceRashi)||0);
                  return (
                    <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={()=>setSelectedKisanDetail(item)} style={[styles.orderCard, { borderLeftColor: '#2E9D5A', borderLeftWidth: 4 }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#37474F' }}>{item.name}</Text>
                        <Text style={{ marginLeft: 8, fontSize: 14 }}>👁️</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#333', marginTop: 2 }}>{item.mobile} {item.pata}</Text>
                      <Text style={{ fontSize: 13, color: '#444', marginTop: 6 }}>💰 टोटल: ₹{item.totalRashi} | एडवांस: ₹{item.advanceRashi} | बचत: ₹{bachat}</Text>
                      <Text style={{ fontSize: 13, color: '#444', marginTop: 2 }}>🌾 घंटा: {item.ghanta} | ट्रॉली: {item.trolly}</Text>
                      <Text style={{ fontSize: 11, color: '#888', marginTop: 4 }}>पूरी जानकारी देखने के लिए क्लिक करें</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        <TouchableOpacity style={[styles.kisanBtn, { backgroundColor: '#4CAF50' }]} onPress={()=>Linking.openURL(`tel:${item.mobile}`)}><Text style={styles.kisanBtnText}>📞 कॉल</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.kisanBtn, { backgroundColor: '#2E9D5A' }]} onPress={()=>Linking.openURL(`https://wa.me/91${item.mobile}?text=${encodeURIComponent('नमस्ते '+item.name+' जी! Tarzan Katlam 🚜')}`)}><Text style={styles.kisanBtnText}>🟢 व्हाट्सएप</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.kisanBtn, { backgroundColor: '#4A90E2' }]} onPress={()=>Linking.openURL(`sms:${item.mobile}`)}><Text style={styles.kisanBtnText}>✉️ मैसेज</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.kisanBtn, { backgroundColor: '#FF9800' }]} onPress={()=>handleEditKisan(item)}><Text style={styles.kisanBtnText}>✏️ एडिट करें</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.kisanBtn, { backgroundColor: '#D32F2F' }]} onPress={()=>handleDeleteKisan(item.id)}><Text style={styles.kisanBtnText}>🗑️ डिलीट</Text></TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity style={styles.kisanFab} onPress={()=>{ setEditingKisanId(null); setKisanForm({ name: '', mobile: '', pata: '', totalRashi: '', advanceRashi: '', ghanta: '', trolly: '', karya: '', dinank: '' }); setShowKisanForm(true); }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>

              <Modal visible={!!selectedKisanDetail} animationType="slide" transparent>
                <View style={styles.modalBg}>
                  <View style={[styles.formCard, { maxHeight: '85%' }]}>
                    <ScrollView>
                      <Text style={styles.formTitle}>👨‍🌾 {selectedKisanDetail?.name}</Text>
                      <View style={{ backgroundColor: '#F1F8E9', padding: 12, borderRadius: 10, marginTop: 10 }}>
                        <Text style={styles.detailLine}>📞 मोबाइल: {selectedKisanDetail?.mobile}</Text>
                        <Text style={styles.detailLine}>📍 पता: {selectedKisanDetail?.pata}</Text>
                        <Text style={styles.detailLine}>💰 टोटल: ₹{selectedKisanDetail?.totalRashi}</Text>
                        <Text style={styles.detailLine}>💵 एडवांस: ₹{selectedKisanDetail?.advanceRashi}</Text>
                        <Text style={styles.detailLine}>💳 बचत: ₹{selectedKisanDetail? (parseFloat(selectedKisanDetail.totalRashi||'0')-parseFloat(selectedKisanDetail.advanceRashi||'0')) : 0}</Text>
                        <Text style={styles.detailLine}>⏳ घंटा: {selectedKisanDetail?.ghanta}</Text>
                        <Text style={styles.detailLine}>🚛 ट्रॉली: {selectedKisanDetail?.trolly}</Text>
                        {selectedKisanDetail?.karya? <Text style={styles.detailLine}>🔧 कार्य: {selectedKisanDetail.karya}</Text> : null}
                        {selectedKisanDetail?.dinank? <Text style={styles.detailLine}>📅 दिनांक: {selectedKisanDetail.dinank}</Text> : null}
                      </View>
                      <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#2E9D5A', marginTop: 18 }]} onPress={()=>setSelectedKisanDetail(null)}>
                        <Text style={styles.blueButtonText}>बंद करें</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              <Modal visible={showKisanForm} animationType="slide" transparent>
                <View style={styles.modalBg}>
                  <View style={[styles.formCard, { maxHeight: '92%' }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <Text style={styles.formTitle}>{editingKisanId? '✏️ किसान एडिट करें' : '➕ नया किसान जोड़ें'}</Text>
                      <Text style={styles.timeLabel}>किसान का नाम *</Text>
                      <TextInput style={styles.input} placeholder="रामदेव" value={kisanForm.name} onChangeText={v=>setKisanForm({...kisanForm, name: v})} />
                      <Text style={[styles.timeLabel,{marginTop:10}]}>मोबाइल नं. *</Text>
                      <TextInput style={styles.input} placeholder="8629984119" keyboardType="phone-pad" value={kisanForm.mobile} onChangeText={v=>setKisanForm({...kisanForm, mobile: v})} />
                      <Text style={[styles.timeLabel,{marginTop:10}]}>पता / गांव</Text>
                      <TextInput style={styles.input} placeholder="मैनपुर" value={kisanForm.pata} onChangeText={v=>setKisanForm({...kisanForm, pata: v})} />
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeLabel}>टोटल राशि ₹ *</Text>
                          <TextInput style={styles.input} placeholder="3500" keyboardType="numeric" value={kisanForm.totalRashi} onChangeText={v=>setKisanForm({...kisanForm, totalRashi: v})} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeLabel}>एडवांस ₹</Text>
                          <TextInput style={styles.input} placeholder="1500" keyboardType="numeric" value={kisanForm.advanceRashi} onChangeText={v=>setKisanForm({...kisanForm, advanceRashi: v})} />
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeLabel}>घंटा</Text>
                          <TextInput style={styles.input} placeholder="3 घंटा 10 मिनट" value={kisanForm.ghanta} onChangeText={v=>setKisanForm({...kisanForm, ghanta: v})} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeLabel}>ट्रॉली</Text>
                          <TextInput style={styles.input} placeholder="2" keyboardType="numeric" value={kisanForm.trolly} onChangeText={v=>setKisanForm({...kisanForm, trolly: v})} />
                        </View>
                      </View>
                      <Text style={[styles.timeLabel,{marginTop:10}]}>कार्य (वैकल्पिक)</Text>
                      <TextInput style={styles.input} placeholder="धान कटाई" value={kisanForm.karya} onChangeText={v=>setKisanForm({...kisanForm, karya: v})} />
                      <Text style={[styles.timeLabel,{marginTop:10}]}>दिनांक</Text>
                      <TextInput style={styles.input} placeholder="25.9.2026" value={kisanForm.dinank} onChangeText={v=>setKisanForm({...kisanForm, dinank: v})} />
                      <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#2E9D5A', marginTop: 20 }]} onPress={handleSaveKisan}>
                        <Text style={styles.blueButtonText}>💾 सेव करें</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={{ marginTop: 12, alignItems: 'center', padding: 10 }} onPress={()=>setShowKisanForm(false)}>
                        <Text style={{ color: '#777' }}>बंद करें</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.buttonContainer}>
              <Text style={styles.header}>TARZAN KATLAM</Text>
              {HOME_BUTTONS.map(btn => {
                const isKisan = btn.name.toLowerCase().includes('किसान') || btn.name.toLowerCase().includes('kisan');
                return (
                  <TouchableOpacity key={btn.id} style={[styles.button, { backgroundColor: btn.color }]} onPress={() => {
                    if (isKisan) setShowKisanScreen(true);
                    else Alert.alert(btn.name);
                  }}>
                    <Text style={styles.buttonText}>{btn.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )
        )}
        {activeTab === 'kharch' && renderKharchMain()}
        {activeTab === 'order' && renderOrderMain()}
        {activeTab === 'setting' && (
          showSamayList? (
            <View style={{ flex: 1 }}>
              <View style={styles.calcPageHeader}>
                <View style={{ width: 50 }} />
                <Text style={styles.calcPageTitle}>📋 बिल लिस्ट</Text>
                <View style={{ width: 50 }} />
              </View>
              <View style={{ flex: 1, padding: 12 }}>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                  {samayBills.length===0? (
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                      <Text style={{ color: '#999' }}>कोई बिल नहीं</Text>
                    </View>
                  ) : samayBills.map(bill => (
                    <View key={bill.id} style={styles.billCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={styles.billName} numberOfLines={1}>{bill.kisanName}</Text>
                          <Text style={styles.billSub} numberOfLines={1}>{bill.pata} {bill.mobile? '• '+bill.mobile : ''}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.billDate}>{bill.dinank}</Text>
                          {bill.karya? <Text style={styles.karyaRight} numberOfLines={2}>🔧 कार्य: {bill.karya}</Text> : null}
                        </View>
                      </View>
                      <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 8 }} />
                      <View style={styles.billMiddleRow}>
                        <Text style={styles.billTime}>{bill.startTime} {bill.startAmPm} → {bill.endTime} {bill.endAmPm}</Text>
                        <Text style={styles.billHours}>{bill.totalHours}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
                        <Text style={styles.billAmount}>₹{bill.totalAmount}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity style={styles.iconBtn} onPress={()=>handleEdit(bill)}><Text>✏️</Text></TouchableOpacity>
                          <TouchableOpacity style={[styles.iconBtn, {backgroundColor:'#FFEBEE', marginLeft:8}]} onPress={()=>handleDelete(bill.id)}><Text>🗑️</Text></TouchableOpacity>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', marginTop: 12 }}>
                        <TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#25D366', flex:1}]} onPress={()=>shareBill(bill)}><Text style={styles.actionBtnText}>📲 शेयर</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, {backgroundColor:'#E91E63', flex:1, marginLeft:10}]} onPress={()=>sharePDF(bill)}><Text style={styles.actionBtnText}>📄 PDF</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : showSamayFolder? (
            <ScrollView contentContainerStyle={styles.settingContainer}>
              <View style={styles.calcPageHeader}>
                <View style={{ width: 50 }} />
                <Text style={styles.calcPageTitle}>⏰ समय</Text>
                <View style={{ width: 50 }} />
              </View>
              {timeResult && (
                <>
                  <View style={[styles.resultCard, { backgroundColor: '#EDE7F6', marginTop: 10 }]}>
                    <Text style={styles.resultLabelFull}>⏳ टोटल समय</Text>
                    <Text style={styles.resultValue}>{timeResult.hoursStr}</Text>
                  </View>
                  <View style={[styles.resultCard, { backgroundColor: '#FFF9C4', marginTop: 10 }]}>
                    <Text style={styles.resultLabelFull}>💰 कुल राशि</Text>
                    <Text style={[styles.resultValue, { fontSize: 20 }]}>{timeResult.amount}</Text>
                  </View>
                </>
              )}
              <View style={[styles.card, { marginTop: 15 }]}>
                <Text style={styles.sectionTitle}>👨‍🌾 किसान की जानकारी</Text>
                <Text style={styles.timeLabel}>किसान का नाम</Text>
                <TextInput style={[styles.input, { color: kisanName? '#000' : '#999' }]} value={kisanName} onChangeText={(t)=>setKisanName(t)} placeholder="टार्जन कतलाम" placeholderTextColor="#C8C8C8" />
                <Text style={[styles.timeLabel, {marginTop: 12}]}>पता</Text>
                <TextInput style={[styles.input, { color: kisanPata? '#000' : '#999' }]} value={kisanPata} onChangeText={(t)=>setKisanPata(t)} placeholder="पिपरौद" placeholderTextColor="#C8C8C8" />
                <Text style={[styles.timeLabel, {marginTop: 12}]}>मो. न.</Text>
                <TextInput style={[styles.input, { color: kisanMobile? '#000' : '#999' }]} value={kisanMobile} onChangeText={(t)=>setKisanMobile(t)} placeholder="9479025929" keyboardType="phone-pad" placeholderTextColor="#C8C8C8" />
                <Text style={[styles.timeLabel, {marginTop: 12}]}>कार्य</Text>
                <TextInput style={[styles.input, { minHeight: 55, textAlignVertical: 'top', color: kisanKarya? '#000' : '#999' }]} value={kisanKarya} onChangeText={(t)=>setKisanKarya(t)} placeholder="जैसे - धान कटाई, मिंजाई, जोताई, मताई" placeholderTextColor="#C8C8C8" multiline={true} numberOfLines={2} />
                <Text style={[styles.timeLabel, {marginTop: 12}]}>दिनांक</Text>
                <TextInput style={[styles.input, { color: kisanDinank? '#000' : '#999' }]} value={kisanDinank} onChangeText={(t)=>setKisanDinank(t)} placeholder="14.05.1989" placeholderTextColor="#C8C8C8" />
                <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 18 }} />
                <Text style={styles.sectionTitle}>⏰ समय</Text>
                <Text style={styles.timeLabel}>Start time</Text>
                <View style={styles.timeBox}>
                  <TextInput style={[styles.timeInput, { color: startTime? '#000' : '#999' }]} value={startTime} onChangeText={setStartTime} placeholder="8.39" placeholderTextColor="#C8C8C8" keyboardType="numeric" />
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity style={[styles.ampmBtn, startAmPm==='AM' && styles.ampmActive]} onPress={()=>setStartAmPm('AM')}>
                      <Text style={[styles.ampmText, startAmPm==='AM' && styles.ampmActiveText]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ampmBtn, startAmPm==='PM' && styles.ampmActive]} onPress={()=>setStartAmPm('PM')}>
                      <Text style={[styles.ampmText, startAmPm==='PM' && styles.ampmActiveText]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.timeLabel, {marginTop: 15}]}>End time</Text>
                <View style={styles.timeBox}>
                  <TextInput style={[styles.timeInput, { color: endTime? '#000' : '#999' }]} value={endTime} onChangeText={setEndTime} placeholder="10.39" placeholderTextColor="#C8C8C8" keyboardType="numeric" />
                  <View style={styles.ampmContainer}>
                    <TouchableOpacity style={[styles.ampmBtn, endAmPm==='AM' && styles.ampmActive]} onPress={()=>setEndAmPm('AM')}>
                      <Text style={[styles.ampmText, endAmPm==='AM' && styles.ampmActiveText]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.ampmBtn, endAmPm==='PM' && styles.ampmActive]} onPress={()=>setEndAmPm('PM')}>
                      <Text style={[styles.ampmText, endAmPm==='PM' && styles.ampmActiveText]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.timeLabel, { marginTop: 15 }]}>राशि (₹ / घंटा)</Text>
                <TextInput style={[styles.input, { color: hourlyRate? '#000' : '#999' }]} value={hourlyRate} onChangeText={setHourlyRate} keyboardType="numeric" placeholder="3000" placeholderTextColor="#C8C8C8" />
                <TouchableOpacity style={[styles.blueButton, { backgroundColor: editingId? '#FF9800' : '#2E9D5A', marginTop: 20 }]} onPress={handleCalculateAndSave}>
                  <Text style={styles.blueButtonText}>{editingId? '✏️ अपडेट' : 'हिसाब लगाएं'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#FF9800', marginTop: 12 }]} onPress={()=>setShowSamayList(true)}>
                  <Text style={styles.blueButtonText}>📋 लिस्ट ({samayBills.length})</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.settingContainer}>
              <Text style={styles.settingHeader}>{SETTING_DATA.header}</Text>
              <TouchableOpacity style={[styles.bigCalcBtn, { backgroundColor: '#2E9D5A' }]} onPress={()=>setShowSamayFolder(true)}>
                <Text style={styles.bigCalcIcon}>⏰ समय</Text>
                <Text style={styles.bigCalcSub}>समय का हिसाब + राशि + बिल</Text>
              </TouchableOpacity>
              <View style={[styles.card, { marginTop: 10 }]}>
                <Text style={styles.cardTitle}>🔑 पासवर्ड बदलें</Text>
                <TextInput style={styles.input} placeholder="नया पासवर्ड लिखें" placeholderTextColor="#AAA" value={newPassword} onChangeText={setNewPassword} secureTextEntry keyboardType="numeric" />
                <TouchableOpacity style={[styles.greenButton, { backgroundColor: '#2E9D5A' }]} onPress={() => { if (!newPassword) { Alert.alert('पासवर्ड लिखें'); return; } if (newPassword.length < 4) { Alert.alert('पासवर्ड कम से कम 4 अंकों का होना चाहिए'); return; } setAppPassword(newPassword); setNewPassword(''); Alert.alert('✅ सफल', `नया पासवर्ड सेव हो गया: ${newPassword}`); }}>
                  <Text style={styles.greenButtonText}>पासवर्ड सुरक्षित करें</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.card, { marginTop: 15, borderWidth: 1, borderColor: '#FFCDD2' }]}>
                <Text style={styles.cardTitle}>🚪 लॉग आउट</Text>
                <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>ऐप से बाहर निकलने के लिए नीचे बटन दबाएं</Text>
                <TouchableOpacity style={[styles.blueButton, { backgroundColor: '#D32F2F' }]} onPress={handleLogout}>
                  <Text style={styles.blueButtonText}>🔓 लॉग आउट करें</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )
        )}
      </View>
      <View style={styles.bottomBar}>
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity key={tab.id} style={[styles.tab, isActive && styles.activeTabContainer]} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{tab.icon}</Text>
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.name}</Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashImage: {
    width: '85%',
    height: '60%'
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '80%'
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700'
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB'
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10
  },
  buttonContainer: {
    padding: 15,
    paddingBottom: 90
  },
  button: {
    height: 70,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  otherContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  otherTitle: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  bottomBar: {
    height: 75,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 12,
    paddingTop: 5
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4
  },
  tabIcon: {
    fontSize: 20,
    color: '#999'
  },
  tabText: {
    fontSize: 11,
    color: '#999',
    marginTop: 3,
    fontWeight: '600'
  },
  activeTab: {
    color: '#000'
  },
  activeTabContainer: {
    backgroundColor: '#E8F5E9'
  },
  activeTabIcon: {
    fontSize: 24,
    color: '#2E9D5A'
  },
  activeTabText: {
    fontSize: 12,
    color: '#2E9D5A',
    fontWeight: '900'
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2E9D5A',
    marginTop: 3
  },
  settingContainer: {
    padding: 15,
    paddingBottom: 90
  },
  settingHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 14,
    color: '#111'
  },
  blueButton: {
    borderRadius: 15,
    padding: 16,
    alignItems: 'center'
  },
  blueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  greenButton: {
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    marginTop: 10
  },
  greenButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  calcPage: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingTop: 40
  },
  calcPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  calcPageTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  },
  normalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  bigCalcBtn: {
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3
  },
  bigCalcIcon: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    width: '100%',
    marginLeft: 5
  },
  bigCalcSub: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    width: '100%',
    paddingLeft: 18,
    letterSpacing: 0.3
  },
  resultCard: {
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 55
  },
  resultLabel: {
    fontSize: 14,
    color: '#555'
  },
  resultLabelFull: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    flex: 1
  },
  resultValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 0,
    marginLeft: 10
  },
  timeLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 6
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 10
  },
  timeInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16
  },
  ampmContainer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 20,
    padding: 3
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15
  },
  ampmActive: {
    backgroundColor: '#2E9D5A'
  },
  ampmText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555'
  },
  ampmActiveText: {
    color: '#fff'
  },
  totalCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B71C1C',
    textAlign: 'center'
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    backgroundColor: '#fff'
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5
  },
  th: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    elevation: 1
  },
  td: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center'
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#2E9D5A'
  },
  billHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  billName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    marginRight: 10
  },
  billDate: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  billSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4
  },
  billMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  billTime: {
    fontSize: 13,
    color: '#333'
  },
  billHours: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E9D5A'
  },
  billAmount: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#B71C1C'
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center'
  },
  karyaRight: {
    fontSize: 13,
    color: '#000',
    fontWeight: '700',
    marginTop: 6,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textAlign: 'right'
  },
  actionBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center'
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  orderTopBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  orderTopText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1
  },
  searchInput: {
    paddingVertical: 12,
    fontSize: 14,
    color: '#000'
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#2E9D5A'
  },
  orderName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6
  },
  orderLine: {
    fontSize: 13,
    color: '#333',
    marginTop: 3,
    lineHeight: 18
  },
  orderBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  orderBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold'
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 350,
    elevation: 8,
    alignItems: 'center'
  },
  loginLogo: {
    width: 120,
    height: 120,
    marginBottom: 10
  },
  loginLogoTransparent: {
    width: 140,
    height: 140,
    marginBottom: 5,
    backgroundColor: 'transparent'
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2E9D5A',
    textAlign: 'center',
    marginTop: 5
  },
  loginSub: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5
  },
  orderFab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6
  },
  trollyChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  trollyActive: {
    backgroundColor: '#2E9D5A',
    borderColor: '#2E9D5A'
  },
  trollyText: {
    color: '#555',
    fontWeight: '600'
  },
  kisanBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 75,
    alignItems: 'center',
    elevation: 1
  },
  kisanBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  kisanFab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E9D5A',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6
  },
  detailLine: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
    lineHeight: 20
  },
  trollyActiveText: {
    color: '#fff',
    fontWeight: 'bold'
  },
});
