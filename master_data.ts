// TARZAN KATLAM - Master Data

export interface HomeButton { id: string; name: string; color: string; }
export interface NavTab { id: string; name: string; icon: string; key: 'home' | 'kharch' | 'order' | 'setting'; }

export const HOME_BUTTONS: HomeButton[] = [
  { id: 'harvester_malik', name: 'हार्वेस्टर मालिक', color: '#6CC36E' },
  { id: 'kisan', name: 'किसान', color: '#F9A825' },
  { id: 'agent', name: 'एजेंट', color: '#4FC3F7' },
  { id: 'operator', name: 'ऑपरेटर', color: '#9575CD' },
  { id: 'helper', name: 'हेल्पर', color: '#EF5350' },
  { id: 'dealer', name: 'डीलर', color: '#A1887F' },
  { id: 'parts', name: 'पार्ट्स विक्रेता', color: '#4DB6AC' },
  { id: 'mechanic', name: 'मैकेनिक', color: '#6D4C41' },
];

export const NAV_TABS: NavTab[] = [
  { id: 'nav_home', name: 'होम', icon: '🏠', key: 'home' },
  { id: 'nav_kharch', name: 'खर्च', icon: '💰', key: 'kharch' },
  { id: 'nav_order', name: 'ऑर्डर', icon: '📦', key: 'order' },
  { id: 'nav_setting', name: 'सेटिंग', icon: '⚙️', key: 'setting' },
];

export const SETTING_DATA = {
  header: '⚙️ सेटिंग',
  calculator: { title: '🧮 कैलकुलेटर', buttonText: '🧮 कैलकुलेटर खोलें', buttonColor: '#7A9BDF' },
  password: { title: '🔑 पासवर्ड बदलें', placeholder: 'नया पासवर्ड लिखें', buttonText: 'पासवर्ड सुरक्षित करें', buttonColor: '#7AAE8A' },
};

export const CALCULATOR_DATA = {
  header: '🧮 कैलकुलेटर',
  menu: [
    { id: 'samay', name: 'समय', sub: 'समय का हिसाब + किराया', color: '#2E9D5A', icon: '⏰' },
    { id: 'umr', name: 'उम्र', sub: 'उम्र का हिसाब', color: '#7B5AE0', icon: '🎂' },
  ],
  screens: {
    samay: { title: '⏰ समय और किराया', startLabel: 'Start time', endLabel: 'End time', ratePlaceholder: 'Hourly rate (₹ / घंटा) 3000', buttonText: 'हिसाब लगाएं', color: '#2E9D5A', totalLabel: 'टोटल', amountLabel: 'कुल किराया' },
    umr: { title: '🎂 उम्र का हिसाब', dobPlaceholder: 'जन्म तिथि लिखें (जैसे 14.5.1989)', todayPlaceholder: 'आज की तारीख लिखें (जैसे 8.10.2026)', dobLabel: 'जन्म तिथि', todayLabel: 'आज की तारीख', buttonText: 'उम्र निकालें', color: '#7B5AE0' },
  },
};

export const KHARCH_DATA = {
  header: '💰 खर्च का हिसाब',
  categoryLabel: 'खर्च की श्रेणी चुनें:',
  categories: [
    { id: 'harvester_diesel', name: 'हार्वेस्टर डीजल', color: '#4A90E2' },
    { id: 'tractor_diesel', name: 'ट्रैक्टर डीजल', color: '#2E7D6B' },
    { id: 'petrol', name: 'पेट्रोल', color: '#C76B3E' },
    { id: 'parts', name: 'पार्ट्स', color: '#6B5B95' },
    { id: 'welding', name: 'वेल्डिंग', color: '#4A4A4A' },
    { id: 'mechanic', name: 'मैकेनिक', color: '#5D4037' },
    { id: 'operator', name: 'ऑपरेटर', color: '#7B6FC5' },
    { id: 'helper', name: 'हेल्पर', color: '#E57373' },
    { id: 'agent', name: 'एजेंट', color: '#64B5F6' },
    { id: 'khana', name: 'खाना खर्च', color: '#FFB74D' },
    { id: 'room', name: 'रूम किराया', color: '#4DB6AC' },
    { id: 'alcohol', name: 'अल्कोहल', color: '#8D6E63' },
    { id: 'pan', name: 'पान मसाला', color: '#78909C' },
    { id: 'anya', name: 'अन्य', color: '#A1887F' },
  ],
  forms: {
    harvester_diesel: { title: 'हार्वेस्टर डीजल - तिथि / लीटर / राशि', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'litre', label: 'लीटर', placeholder: '20' }, { key: 'rashi', label: 'राशि ₹', placeholder: '2000' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'हार्वेस्टर डीजल खर्च जोड़ें', tableHeads: ['तिथि', 'लीटर', 'राशि ₹', 'भुगतान'] },
    tractor_diesel: { title: 'ट्रैक्टर डीजल - तिथि / लीटर / राशि', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'litre', label: 'लीटर', placeholder: '10' }, { key: 'rashi', label: 'राशि ₹', placeholder: '1000' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'ट्रैक्टर डीजल खर्च जोड़ें', tableHeads: ['तिथि', 'लीटर', 'राशि ₹', 'भुगतान'] },
    petrol: { title: 'पेट्रोल - तिथि / लीटर / राशि', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'litre', label: 'लीटर', placeholder: '5' }, { key: 'rashi', label: 'राशि ₹', placeholder: '500' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'पेट्रोल खर्च जोड़ें', tableHeads: ['तिथि', 'लीटर', 'राशि ₹', 'भुगतान'] },

    parts: { title: 'पार्ट्स खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'parts_name', label: 'पार्ट्स का नाम', placeholder: 'फिल्टर, बेल्ट' }, { key: 'rashi', label: 'राशि ₹', placeholder: '1500' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI', 'उधारी'], saveButton: 'पार्ट्स खर्च जोड़ें', tableHeads: ['तिथि', 'पार्ट्स', 'राशि ₹', 'भुगतान'] },
    welding: { title: 'वेल्डिंग खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'kaam', label: 'काम का विवरण', placeholder: 'ब्लेड वेल्डिंग' }, { key: 'rashi', label: 'राशि ₹', placeholder: '800' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'वेल्डिंग खर्च जोड़ें', tableHeads: ['तिथि', 'काम', 'राशि ₹', 'भुगतान'] },
    mechanic: { title: 'मैकेनिक खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'kaam', label: 'काम', placeholder: 'इंजन रिपेयर' }, { key: 'rashi', label: 'राशि ₹', placeholder: '2000' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI', 'उधारी'], saveButton: 'मैकेनिक खर्च जोड़ें', tableHeads: ['तिथि', 'काम', 'राशि ₹', 'भुगतान'] },
    operator: { title: 'ऑपरेटर खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'naam', label: 'ऑपरेटर नाम', placeholder: 'रामू' }, { key: 'rashi', label: 'पगार / एडवांस ₹', placeholder: '5000' }], paymentLabel: 'प्रकार:', paymentOptions: ['पगार', 'एडवांस', 'खाना'], saveButton: 'ऑपरेटर खर्च जोड़ें', tableHeads: ['तिथि', 'नाम', 'राशि ₹', 'प्रकार'] },
    helper: { title: 'हेल्पर खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'naam', label: 'हेल्पर नाम', placeholder: 'श्याम' }, { key: 'rashi', label: 'पगार / एडवांस ₹', placeholder: '3000' }], paymentLabel: 'प्रकार:', paymentOptions: ['पगार', 'एडवांस', 'खाना'], saveButton: 'हेल्पर खर्च जोड़ें', tableHeads: ['तिथि', 'नाम', 'राशि ₹', 'प्रकार'] },
    agent: { title: 'एजेंट कमीशन', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'kisan', label: 'किसान / गांव', placeholder: 'रमेश - तिल्दा' }, { key: 'rashi', label: 'कमीशन ₹', placeholder: '1000' }], paymentLabel: 'भुगतान:', paymentOptions: ['नगद', 'UPI', 'बकाया'], saveButton: 'एजेंट खर्च जोड़ें', tableHeads: ['तिथि', 'किसान', 'राशि ₹', 'भुगतान'] },
    khana: { title: 'खाना खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'hotel', label: 'होटल / विवरण', placeholder: 'दोपहर का खाना' }, { key: 'rashi', label: 'राशि ₹', placeholder: '300' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'खाना खर्च जोड़ें', tableHeads: ['तिथि', 'विवरण', 'राशि ₹', 'भुगतान'] },
    room: { title: 'रूम किराया', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'days', label: 'कितने दिन', placeholder: '5' }, { key: 'rashi', label: 'राशि ₹', placeholder: '1000' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'रूम किराया जोड़ें', tableHeads: ['तिथि', 'दिन', 'राशि ₹', 'भुगतान'] },
    alcohol: { title: 'अल्कोहल खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'vivaran', label: 'विवरण', placeholder: 'शाम की पार्टी' }, { key: 'rashi', label: 'राशि ₹', placeholder: '500' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'अल्कोहल खर्च जोड़ें', tableHeads: ['तिथि', 'विवरण', 'राशि ₹', 'भुगतान'] },
    pan: { title: 'पान मसाला खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'vivaran', label: 'विवरण', placeholder: 'गुटखा, सिगरेट' }, { key: 'rashi', label: 'राशि ₹', placeholder: '100' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'पान मसाला खर्च जोड़ें', tableHeads: ['तिथि', 'विवरण', 'राशि ₹', 'भुगतान'] },
    anya: { title: 'अन्य खर्च', fields: [{ key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' }, { key: 'vivaran', label: 'विवरण', placeholder: 'क्या खर्च' }, { key: 'rashi', label: 'राशि ₹', placeholder: '200' }], paymentLabel: 'भुगतान माध्यम:', paymentOptions: ['नगद', 'UPI'], saveButton: 'अन्य खर्च जोड़ें', tableHeads: ['तिथि', 'विवरण', 'राशि ₹', 'भुगतान'] },
  },
};

export const APP_NAME = "TARZAN KATLAM";
