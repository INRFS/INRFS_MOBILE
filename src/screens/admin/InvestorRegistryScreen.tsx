import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, TextInput, Platform, Alert} from 'react-native';
import {useAppData, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InvestorRegistryScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Excel export requires these packages (same as My Investments):
//   npm install xlsx react-native-fs react-native-share
// (iOS: cd ios && pod install)
// ---------------------------------------------------------------------------
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

const tierIcon = (inv: Investor) => (inv.type === 'institution' ? '🏢' : '👤');

type StatusFilter = 'All' | 'Active' | 'Pending';
const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'Pending'];

const InvestorRegistryScreen = ({navigation}: any) => {
  const {investors, bonds} = useAppData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filtered = investors.filter(inv => {
    const matchesQuery =
      inv.name.toLowerCase().includes(query.toLowerCase()) ||
      inv.id.toLowerCase().includes(query.toLowerCase()) ||
      inv.tier.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // ---------- Export to Excel ----------
  const handleExport = async () => {
    try {
      const rows = investors.map(inv => ({
        'Investor ID': inv.id,
        Name: inv.name,
        Email: inv.email,
        Mobile: inv.mobile,
        Branch: inv.branch,
        'KYC Status': inv.kycStatus,
        Status: inv.status,
        'Total Invested ($)': inv.totalInvested,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Investors');
      const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});

      const fileName = `INRFS_Investor_Management_${Date.now()}.xlsx`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64, 'base64');

      await RNShare.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
      });
    } catch (err: any) {
      if (err?.message && !/user did not share/i.test(err.message)) {
        Alert.alert('Export failed', 'Could not generate the Excel file. Please try again.');
      }
    }
  };

  // ---------- View Profile routing ----------
  // Approved + Active investors go straight to their bond (with bank details).
  // Everyone else (pending KYC, etc.) routes through KYC Approvals — and now
  // we pass THIS investor's id along, so KycApprovalsScreen can show their
  // specific pending request instead of the whole generic queue.
  const handleViewProfile = (inv: Investor) => {
    if (inv.kycStatus === 'Approved' && inv.status === 'Active') {
      const bond = bonds.find(b => b.investorName === inv.name);
      if (bond) {
        navigation.navigate('BondDetails', {investorId: inv.id, bondId: bond.seriesId});
      } else {
        Alert.alert('No bond found', `${inv.name} doesn't have an active bond record yet.`);
      }
    } else {
      navigation.navigate('KycApprovals', {investorId: inv.id});
    }
  };

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
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusFilterRow}>
          {STATUS_FILTERS.map(f => {
            const active = f === statusFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.statusFilterChip, active && styles.statusFilterChipActive]}
                onPress={() => setStatusFilter(f)}>
                <Text
                  style={[
                    styles.statusFilterChipText,
                    active && styles.statusFilterChipTextActive,
                  ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
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
              <TouchableOpacity style={styles.viewProfileBtn} onPress={() => handleViewProfile(inv)}>
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
        {/* <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminInvestments')}>
          <Text style={styles.tabIcon}>💵</Text>
          <Text style={styles.tabLabel}>Investments</Text>
        </TouchableOpacity> */}
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