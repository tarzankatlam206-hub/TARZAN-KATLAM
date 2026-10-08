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

// खर्च का Master Data
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
  // हर Category के लिए Form के Fields - आपकी Photo जैसा
  forms: {
    harvester_diesel: {
      title: 'हार्वेस्टर डीजल - तिथि / लीटर / राशि',
      fields: [
        { key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' },
        { key: 'litre', label: 'लीटर', placeholder: '20', keyboard: 'numeric' },
        { key: 'rashi', label: 'राशि ₹', placeholder: '2000', keyboard: 'numeric' },
      ],
      paymentLabel: 'भुगतान माध्यम:',
      paymentOptions: ['नगद', 'UPI'],
      saveButton: 'हार्वेस्टर डीजल खर्च जोड़ें',
    },
    tractor_diesel: {
      title: 'ट्रैक्टर डीजल - तिथि / लीटर / राशि',
      fields: [
        { key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' },
        { key: 'litre', label: 'लीटर', placeholder: '10', keyboard: 'numeric' },
        { key: 'rashi', label: 'राशि ₹', placeholder: '1000', keyboard: 'numeric' },
      ],
      paymentLabel: 'भुगतान माध्यम:',
      paymentOptions: ['नगद', 'UPI'],
      saveButton: 'ट्रैक्टर डीजल खर्च जोड़ें',
    },
    default: {
      title: 'खर्च जोड़ें',
      fields: [
        { key: 'tithi', label: 'तिथि', placeholder: '8.10.2026' },
        { key: 'rashi', label: 'राशि ₹', placeholder: '500', keyboard: 'numeric' },
        { key: 'note', label: 'विवरण', placeholder: 'नोट लिखें' },
      ],
      paymentLabel: 'भुगतान माध्यम:',
      paymentOptions: ['नगद', 'UPI'],
      saveButton: 'खर्च जोड़ें',
    },
  },
};

export const APP_NAME = "TARZAN KATLAM";
