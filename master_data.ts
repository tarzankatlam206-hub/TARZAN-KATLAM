// TARZAN KATLAM - Master Data

export interface HomeButton {
  id: string;
  name: string;
  color: string;
}

export interface NavTab {
  id: string;
  name: string;
  icon: string;
  key: 'home' | 'kharch' | 'order' | 'setting';
}

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

// Bottom Navigation Data - अब यहीं रहेगा
export const NAV_TABS: NavTab[] = [
  { id: 'nav_home', name: 'होम', icon: '🏠', key: 'home' },
  { id: 'nav_kharch', name: 'खर्च', icon: '💰', key: 'kharch' },
  { id: 'nav_order', name: 'ऑर्डर', icon: '📦', key: 'order' },
  { id: 'nav_setting', name: 'सेटिंग', icon: '⚙️', key: 'setting' },
];

export const APP_NAME = "TARZAN KATLAM";
