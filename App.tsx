import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { ROLES, UserRole } from './master_data';

export default function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleRolePress = (roleId: UserRole) => {
    const role = ROLES.find(r => r.id === roleId);
    Alert.alert(
      `${role?.label} चुना गया`,
      `आपने ${role?.label} के रूप में लॉगिन किया है।`,
      [
        { text: 'बंद करें', style: 'cancel' },
        { text: 'लॉगिन करें', onPress: () => console.log('Login as', roleId) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F4F7" />
      <View style={styles.header}>
        <Text style={styles.title}>TARZAN KATLAM</Text>
        <Text style={styles.subtitle}>अपनी भूमिका चुनें</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleBtn, { backgroundColor: role.color }]}
            activeOpacity={0.85}
            onPress={() => handleRolePress(role.id)}
          >
            <Text style={styles.roleText}>{role.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F7' },
  header: { alignItems: 'center', paddingTop: 50, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: 2, color: '#111' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },
  roleBtn: {
    width: '100%', height: 78, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    elevation: 3
  },
  roleText: { color: '#fff', fontSize: 20, fontWeight: '700' }
});
