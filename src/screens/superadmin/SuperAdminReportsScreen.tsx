import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Alert} from 'react-native';
const {styles} = require('../../styles/superadmin/SuperAdminReportsScreen.styles');
import AppHeader from '../../components/AppHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData} from '../../navigation/AppNavigator';

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

const SuperAdminReportsScreen = ({navigation}: any) => {
  const {investors} = useAppData();
  const [query, setQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalInvestors = investors.length;
  const totalInvestments = investors.reduce((sum, inv: any) => sum + (inv.investments?.length || 0), 0);
  const activeInvestments = investors.reduce(
    (sum, inv: any) => sum + (inv.investments?.filter((i: any) => i.status === 'Active').length || 0),
    0,
  );
  const pendingApprovals = investors.reduce(
    (sum, inv: any) => sum + (inv.investments?.filter((i: any) => i.status === 'Pending').length || 0),
    0,
  );
  const totalPortfolio = investors.reduce((sum, inv: any) => sum + (inv.totalInvested || 0), 0);
  const monthlyInterest = 0; // no monthly-interest source in context yet

  const statCards = [
    {label: 'Total Investors', value: String(totalInvestors), sub: 'Registered investors', icon: '👥', bg: '#EEF2FF'},
    {label: 'Total Investments', value: String(totalInvestments), sub: 'Investment requests', icon: '📈', bg: '#F0F9FF'},
    {label: 'Active Investments', value: String(activeInvestments), sub: 'Currently active', icon: '✅', bg: '#ECFDF5'},
    {label: 'Pending Approvals', value: String(pendingApprovals), sub: 'Requires attention', icon: '⏱', bg: '#FFFBEB'},
    {label: 'Total Portfolio', value: formatINR(totalPortfolio), sub: 'Assets under management', icon: '💼', bg: '#FDF4FF'},
    {label: 'Monthly Interest', value: formatINR(monthlyInterest), sub: 'Current month', icon: '％', bg: '#F0FDF4'},
  ];

  const groupedRows = investors
    .filter(
      (inv: any) =>
        inv.name?.toLowerCase().includes(query.toLowerCase()) ||
        inv.id?.toLowerCase().includes(query.toLowerCase()),
    )
    .map((inv: any) => {
      const list = inv.investments || [];
      return {
        id: inv.id,
        name: inv.name,
        investments: list.length,
        totalInvested: inv.totalInvested || 0,
        interestEarned: inv.interestEarned || 0,
        active: list.filter((i: any) => i.status === 'Active').length,
        pending: list.filter((i: any) => i.status === 'Pending').length,
        rejected: list.filter((i: any) => i.status === 'Rejected').length,
        closed: list.filter((i: any) => i.status === 'Closed').length,
      };
    });

  const groupedInvestmentValue = groupedRows.reduce((sum, r) => sum + r.totalInvested, 0);
  const groupedInterest = groupedRows.reduce((sum, r) => sum + r.interestEarned, 0);

  const handleExport = (type: string) => {
    Alert.alert('Export started', `Preparing ${type} export...`);
  };

  const handleDownloadAll = () => {
    Alert.alert('Download started', 'Preparing all investors export...');
  };

  const handleRefresh = () => {
    setErrorMsg(null);
    // Hook up your actual refetch here if reports come from an API.
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Reports" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Export buttons */}
        {/* <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('Excel')}>
            <Text style={styles.exportBtnText}>⬇ Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, styles.exportBtnPrimary]} onPress={() => handleExport('PDF')}>
            <Text style={[styles.exportBtnText, styles.exportBtnTextPrimary]}>⬇ PDF</Text>
          </TouchableOpacity>
        </View> */}

        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {statCards.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <View style={styles.statCardTopRow}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statIconBadge, {backgroundColor: stat.bg}]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statSub}>{stat.sub}</Text>
            </View>
          ))}
        </View>

        {/* Total Portfolio Value banner */}
        <View style={styles.portfolioBanner}>
          <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.portfolioValue}>{formatINR(totalPortfolio)}</Text>
          <Text style={styles.portfolioSub}>Combined value of investor portfolios</Text>
          <View style={styles.portfolioStatsRow}>
            <View style={styles.portfolioStatBlock}>
              <Text style={styles.portfolioStatLabel}>INVESTORS</Text>
              <Text style={styles.portfolioStatValue}>{totalInvestors}</Text>
            </View>
            <View style={styles.portfolioStatBlock}>
              <Text style={styles.portfolioStatLabel}>GROUPED RECORDS</Text>
              <Text style={styles.portfolioStatValue}>{groupedRows.length}</Text>
            </View>
          </View>
        </View>

        {/* Search + actions */}
        <TextInput
          style={styles.searchInput}
          placeholder="Name or investor ID"
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.downloadAllBtn} onPress={handleDownloadAll}>
            <Text style={styles.downloadAllBtnText}>⬇ Download All Investors</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Text style={styles.refreshBtnText}>⟳ Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Error banner */}
        {errorMsg && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>⊗ {errorMsg}</Text>
            <TouchableOpacity onPress={handleRefresh}>
              <Text style={styles.errorBannerAction}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Grouped summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>INVESTORS SHOWN</Text>
            <Text style={styles.summaryValue}>{groupedRows.length}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>GROUPED INVESTMENT VALUE</Text>
            <Text style={styles.summaryValue}>{formatINR(groupedInvestmentValue)}</Text>
          </View>
          <View style={styles.summaryBlock}>
            <Text style={styles.summaryLabel}>GROUPED INTEREST</Text>
            <Text style={styles.summaryValue}>{formatINR(groupedInterest)}</Text>
          </View>
        </View>

        {/* Investor grouped list (mobile card version of the web table) */}
        {groupedRows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No investor investment records found.</Text>
          </View>
        ) : (
          groupedRows.map(row => (
            <View key={row.id} style={styles.investorCard}>
              <View style={styles.investorCardTopRow}>
                <Text style={styles.investorCardName}>{row.name}</Text>
                <Text style={styles.investorCardId}>{row.id}</Text>
              </View>

              <View style={styles.investorCardGrid}>
                <View style={styles.investorCardCol}>
                  <Text style={styles.investorCardLabel}>INVESTMENTS</Text>
                  <Text style={styles.investorCardValue}>{row.investments}</Text>
                </View>
                <View style={styles.investorCardCol}>
                  <Text style={styles.investorCardLabel}>TOTAL INVESTED</Text>
                  <Text style={styles.investorCardValue}>{formatINR(row.totalInvested)}</Text>
                </View>
              </View>

              <View style={styles.investorCardGrid}>
                <View style={styles.investorCardCol}>
                  <Text style={styles.investorCardLabel}>INTEREST EARNED</Text>
                  <Text style={styles.investorCardValue}>{formatINR(row.interestEarned)}</Text>
                </View>
              </View>

              <View style={styles.statusChipsRow}>
                <View style={[styles.statusChip, styles.statusChipActive]}>
                  <Text style={styles.statusChipText}>Active {row.active}</Text>
                </View>
                <View style={[styles.statusChip, styles.statusChipPending]}>
                  <Text style={styles.statusChipText}>Pending {row.pending}</Text>
                </View>
                <View style={[styles.statusChip, styles.statusChipRejected]}>
                  <Text style={styles.statusChipText}>Rejected {row.rejected}</Text>
                </View>
                <View style={[styles.statusChip, styles.statusChipClosed]}>
                  <Text style={styles.statusChipText}>Closed {row.closed}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="More" />
    </SafeAreaView>
  );
};

export default SuperAdminReportsScreen;