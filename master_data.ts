export type UserRole = 'sadasya' | 'kisan' | 'agent' | 'operator' | 'helper' | 'dealer' | 'parts' | 'mechanic';

export interface RoleConfig {
  id: UserRole;
  label: string;
  color: string;
}

export const ROLES: RoleConfig[] = [
  { id: 'sadasya', label: 'सदस्य', color: '#7BC67E' },
  { id: 'kisan', label: 'किसान', color: '#F5A623' },
  { id: 'agent', label: 'एजेंट', color: '#5CC4F5' },
  { id: 'operator', label: 'ऑपरेटर', color: '#8B7DD6' },
  { id: 'helper', label: 'हेल्पर', color: '#E85D6E' },
  { id: 'dealer', label: 'डीलर', color: '#9B8A7A' },
  { id: 'parts', label: 'पार्ट्स विक्रेता', color: '#4DB6AC' },
  { id: 'mechanic', label: 'मैकेनिक', color: '#6D4C41' },
];

export const APP_NAME = 'TARZAN KATLAM';
