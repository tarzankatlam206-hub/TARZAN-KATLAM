import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { HOME_BUTTONS, NAV_TABS } from './master_data';

type TabKey = 'home' | 'kharch' | 'order' | 'setting';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  useEffect(() => {
    const interval = setInterval(() => setLoading(p => p >= 100 ? 100 : p + 1), 25);
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

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
        {activeTab !== 'home' && (
          <View style={styles.otherContainer}>
            <Text style={styles.otherTitle}>{NAV_TABS.find(t => t.key === activeTab)?.name}</Text>
            <Text style={styles.otherSub}>यह पेज जल्द ही आयेगा</Text>
          </View>
        )}
      </View>

      {/* Bottom Bar - Data Master Data से */}
      <View style={styles.bottomBar}>
        {NAV_TABS.map(tab => (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => setActiveTab(tab.key)}>
            <Text style={[styles.tabIcon, activeTab === tab.key && styles.activeTab]}>{tab.icon}</Text>
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTab]}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  otherSub: { fontSize: 16, color: '#777', marginTop: 8 },
  bottomBar: { height: 70, backgroundColor: '#fff', flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#eee', elevation: 10 },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabIcon: { fontSize: 22, color: '#999' },
  tabText: { fontSize: 12, color: '#999', marginTop: 2, fontWeight: '600' },
  activeTab: { color: '#000' },
});
