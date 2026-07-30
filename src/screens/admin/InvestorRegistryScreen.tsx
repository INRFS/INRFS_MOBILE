import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, TextInput} from 'react-native';
import {useAppData, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InvestorRegistryScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const tierIcon = (inv: Investor) => (inv.type === 'institution' ? '🏢' : '👤');

const InvestorRegistryScreen = ({navigation}: any) => {
  const {investors} = useAppData();
  const [query, setQuery] = useState('');

  const filtered = investors.filter(
    inv =>
      inv.name.toLowerCase().includes(query.toLowerCase()) ||
      inv.id.toLowerCase().includes(query.toLowerCase()) ||
      inv.tier.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>INRFS</Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Investor Management</Text>
        <Text style={styles.subtitle}>Manage and monitor {investors.length.toLocaleString()} registered entities.</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ID, name, or tier..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.filterBtn}>
            <Text>⇅</Text>
          </View>
        </View>

        {filtered.map(inv => (
          <View key={inv.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{tierIcon(inv)}</Text>
              </View>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{inv.name}</Text>
                <Text style={styles.invId}>{inv.id}</Text>
                <Text style={styles.email}>{inv.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>{inv.mobile}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Branch</Text>
                <Text style={styles.infoValue}>{inv.branch}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>KYC</Text>
                <View style={[styles.pill, kycPillColor(inv.kycStatus)]}>
                  <Text style={[styles.pillText, kycPillTextColor(inv.kycStatus)]}>{inv.kycStatus}</Text>
                </View>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.dot, {backgroundColor: inv.status === 'Active' ? '#16A34A' : '#F59E0B'}]} />
                  <Text style={[styles.statusText, {color: inv.status === 'Active' ? '#16A34A' : '#F59E0B'}]}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Investment</Text>
                <Text style={styles.statValue}>
                  ${inv.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.viewProfileBtn} onPress={() => navigation.navigate('KycApprovals')}>
                <Text style={styles.viewProfileText}>View Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editBtn}>
                <Text>✎</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>👥</Text>
          <Text style={styles.tabLabelActive}>Investors</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('BondTracking')}>
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>Portfolio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InterestPayouts')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Payouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminProfile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const kycPillColor = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {backgroundColor: '#DCFCE7'};
  if (status === 'Pending') return {backgroundColor: '#FEF3C7'};
  return {backgroundColor: '#FEE2E2'};
};

const kycPillTextColor = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {color: '#16A34A'};
  if (status === 'Pending') return {color: '#B45309'};
  return {color: '#DC2626'};
};

export default InvestorRegistryScreen;