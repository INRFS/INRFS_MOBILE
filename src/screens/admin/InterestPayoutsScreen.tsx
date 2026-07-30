import React, {useState} from 'react';
import {View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert} from 'react-native';
import {useAppData, Payout} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InterestPayoutsScreen.styles';

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', {minimumFractionDigits: 2});

const InterestPayoutsScreen = ({navigation}: any) => {
  const {payouts, markPayoutPaid, markAllPayoutsPaid} = useAppData();
  const [query, setQuery] = useState('');

  const filtered = payouts.filter(
    p =>
      p.investorName.toLowerCase().includes(query.toLowerCase()) ||
      p.bondId.toLowerCase().includes(query.toLowerCase()),
  );

  const overdue = filtered.filter(p => p.status === 'overdue');
  const upcoming = filtered.filter(p => p.status === 'upcoming');
  const paid = filtered.filter(p => p.status === 'paid');
  const totalPending = payouts
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const confirmProcess = (p: Payout) => {
    Alert.alert(
      p.status === 'overdue' ? 'Process payment' : 'Process early',
      `Mark ${formatINR(p.amount)} for ${p.investorName} (${p.bondId}) as paid?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: () => markPayoutPaid(p.id)},
      ],
    );
  };

  const handleMarkAllPaid = () => {
    if (payouts.length === 0) return;
    Alert.alert('Mark all paid', `Mark all ${payouts.length} pending payouts as paid?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Confirm', onPress: markAllPayoutsPaid},
    ]);
  };

  const renderRow = (p: Payout) => (
    <View key={p.id} style={styles.card}>
      <View style={styles.cardTopRow}>
        <View style={styles.avatarWrap}>
          <Text>{p.investorType === 'institution' ? '🏢' : '👤'}</Text>
        </View>
        <View style={styles.nameWrap}>
          <Text style={styles.name}>{p.investorName}</Text>
          <Text style={styles.bondId}>{p.bondId}</Text>
        </View>
        <View style={{alignItems: 'flex-end'}}>
          <Text style={[styles.amount, p.status === 'overdue' && styles.amountOverdue]}>
            {formatINR(p.amount)}
          </Text>
          {p.status === 'overdue' && (
            <Text style={styles.overdueText}>Overdue {p.overdueDays} Day{p.overdueDays === 1 ? '' : 's'}</Text>
          )}
          {p.status === 'paid' && <Text style={styles.paidText}>Paid</Text>}
        </View>
      </View>
      <View style={styles.cardBottomRow}>
        <View>
          <Text style={styles.dueText}>Due {p.dueDate}</Text>
          {p.reference !== '–' && <Text style={styles.refText}>Ref: {p.reference}</Text>}
        </View>
        {p.status === 'paid' ? (
          <Text style={styles.doneText}>✓ Done</Text>
        ) : (
          <TouchableOpacity
            style={p.status === 'overdue' ? undefined : styles.processEarlyBtn}
            onPress={() => confirmProcess(p)}>
            <Text style={p.status === 'overdue' ? styles.processPaymentText : styles.processEarlyText}>
              {p.status === 'overdue' ? 'Process Payment' : 'Process Early'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏦  INRFS</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SettlementCalculator')}>
          <Text style={styles.calcIcon}>🧮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Interest Payouts</Text>
        <Text style={styles.subtitle}>Manage monthly disbursements to investors</Text>

        <View style={styles.pendingCard}>
          <View style={styles.pendingTopRow}>
            <Text style={styles.pendingLabel}>TOTAL PENDING</Text>
            <View style={styles.processingBadge}>
              <Text style={styles.processingBadgeText}>Processing</Text>
            </View>
          </View>
          <Text style={styles.pendingValue}>{formatINR(totalPending)}</Text>
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllPaid}>
            <Text style={styles.markAllBtnText}>Mark All Paid</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search investor or Bond ID"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.filterBtn}>
            <Text>⇅</Text>
          </View>
        </View>

        {overdue.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>⚠ Past Due ({overdue.length} Pending)</Text>
            {overdue.map(renderRow)}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>📅 Upcoming ({upcoming.length} Total)</Text>
            {upcoming.map(renderRow)}
          </>
        )}

        {paid.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✓ Paid ({paid.length})</Text>
            {paid.map(renderRow)}
          </>
        )}

        {overdue.length === 0 && upcoming.length === 0 && paid.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No payouts found</Text>
          </View>
        )}

        <Text style={styles.securityText}>🛡  Security standard PCI-DSS Level 1 compliant</Text>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('BondTracking')}>
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>Portfolio</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>💰</Text>
          <Text style={styles.tabLabelActive}>Payouts</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminProfile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InterestPayoutsScreen;