// TARZAN KATLAM - Master Data

export interface HomeButton {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export const HOME_BUTTONS: HomeButton[] = [
  { id: 'sadasya', name: 'सदस्य', color: '#6CC36E' },
  { id: 'kisan', name: 'किसान', color: '#F9A825' },
  { id: 'agent', name: 'एजेंट', color: '#4FC3F7' },
  { id: 'operator', name: 'ऑपरेटर', color: '#9575CD' },
  { id: 'helper', name: 'हेल्पर', color: '#EF5350' },
  { id: 'dealer', name: 'डीलर', color: '#A1887F' },
  { id: 'parts', name: 'पार्ट्स विक्रेता', color: '#4DB6AC' },
  { id: 'mechanic', name: 'मैकेनिक', color: '#6D4C41' },
];

// बाद में यहाँ और Master Data जोड़ सकते हो
export const APP_NAME = "TARZAN KATLAM";
