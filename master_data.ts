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

// SETTING का पूरा Master Data - आपकी फोटो जैसा
export const SETTING_DATA = {
  header: '⚙️ सेटिंग',
  calculator: {
    title: '🧮 कैलकुलेटर',
    buttonText: '🧮  कैलकुलेटर खोलें',
    buttonColor: '#7A9BDF',
  },
  password: {
    title: '🔑 पासवर्ड बदलें',
    placeholder: 'नया पासवर्ड लिखें',
    buttonText: 'पासवर्ड सुरक्षित करें',
    buttonColor: '#7AAE8A',
  },
  calcButtons: ['7','8','9','/','4','5','6','x','1','2','3','-','C','0','=','+'] as const,
};

export const APP_NAME = "TARZAN KATLAM";
