import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, TextInput, Alert} from 'react-native';
import {useAppData, Payout} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InterestPayoutsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', {minimumFractionDigits: 2});

const InterestPayoutsScreen = ({navigation}: any) => {
  const {payouts, markPayoutPaid, markAllPayoutsPaid, requestPayoutApproval, requestAllPayoutsApproval} = useAppData();
  const [query, setQuery] = useState('');

  const filtered = payouts.filter(
    p =>
      p.investorName.toLowerCase().includes(query.toLowerCase()) ||
      p.bondId.toLowerCase().includes(query.toLowerCase()),
  );

  const overdue = filtered.filter(p => p.status === 'overdue');
  const upcoming = filtered.filter(p => p.status === 'upcoming');
  const inApproval = filtered.filter(
    p => p.status === 'pending_approval' || p.status === 'approved' || p.status === 'rejected',
  );
  const paid = filtered.filter(p => p.status === 'paid');
  const totalPending = payouts
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const needsApprovalCount = payouts.filter(p => p.status === 'overdue' || p.status === 'upcoming').length;
  const approvedCount = payouts.filter(p => p.status === 'approved').length;

  const confirmSendForApproval = (p: Payout) => {
    Alert.alert(
      'Send for approval',
      `Send ${formatINR(p.amount)} payout for ${p.investorName} (${p.bondId}) to Super Admin for approval?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send', onPress: () => requestPayoutApproval(p.id)},
      ],
    );
  };

  const confirmMarkPaid = (p: Payout) => {
    Alert.alert(
      'Mark as paid',
      `Mark ${formatINR(p.amount)} for ${p.investorName} (${p.bondId}) as paid?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: () => markPayoutPaid(p.id)},
      ],
    );
  };

  const confirmResendApproval = (p: Payout) => {
    Alert.alert(
      'Resend for approval',
      `Resend ${formatINR(p.amount)} payout for ${p.investorName} (${p.bondId}) to Super Admin?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Resend', onPress: () => requestPayoutApproval(p.id)},
      ],
    );
  };

  const handleBulkAction = () => {
    if (needsApprovalCount > 0) {
      Alert.alert(
        'Send all for approval',
        `Send ${needsApprovalCount} pending payout${needsApprovalCount === 1 ? '' : 's'} to Super Admin for approval?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Send', onPress: requestAllPayoutsApproval},
        ],
      );
      return;
    }
    if (approvedCount > 0) {
      Alert.alert('Mark all paid', `Mark all ${approvedCount} approved payouts as paid?`, [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: markAllPayoutsPaid},
      ]);
    }
  };

  const bulkBtnLabel =
    needsApprovalCount > 0 ? 'Send All for Approval' : approvedCount > 0 ? 'Mark All Paid' : 'All Settled';
  const bulkBtnDisabled = needsApprovalCount === 0 && approvedCount === 0;

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
          {p.status === 'pending_approval' && <Text style={styles.pendingApprovalText}>Pending Approval</Text>}
          {p.status === 'approved' && <Text style={styles.approvedText}>Approved</Text>}
          {p.status === 'rejected' && <Text style={styles.rejectedText}>Rejected</Text>}
        </View>
      </View>
      <View style={styles.cardBottomRow}>
        <View>
          <Text style={styles.dueText}>Due {p.dueDate}</Text>
          {p.reference !== '–' && <Text style={styles.refText}>Ref: {p.reference}</Text>}
        </View>

        {p.status === 'paid' && <Text style={styles.doneText}>✓ Done</Text>}

        {(p.status === 'overdue' || p.status === 'upcoming') && (
          <TouchableOpacity
            style={p.status === 'overdue' ? undefined : styles.processEarlyBtn}
            onPress={() => confirmSendForApproval(p)}>
            <Text style={p.status === 'overdue' ? styles.processPaymentText : styles.processEarlyText}>
              Send for Approval
            </Text>
          </TouchableOpacity>
        )}

        {p.status === 'pending_approval' && <Text style={styles.waitingText}>Waiting for Super Admin</Text>}

        {p.status === 'approved' && (
          <TouchableOpacity style={styles.markPaidBtn} onPress={() => confirmMarkPaid(p)}>
            <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        {p.status === 'rejected' && (
          <TouchableOpacity style={styles.resendBtn} onPress={() => confirmResendApproval(p)}>
            <Text style={styles.resendBtnText}>Resend for Approval</Text>
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
          <TouchableOpacity
            style={[styles.markAllBtn, bulkBtnDisabled && styles.markAllBtnDisabled]}
            disabled={bulkBtnDisabled}
            onPress={handleBulkAction}>
            <Text style={styles.markAllBtnText}>{bulkBtnLabel}</Text>
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

        {inApproval.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>⏳ Awaiting Approval ({inApproval.length})</Text>
            {inApproval.map(renderRow)}
          </>
        )}

        {paid.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>✓ Paid ({paid.length})</Text>
            {paid.map(renderRow)}
          </>
        )}

        {overdue.length === 0 && upcoming.length === 0 && inApproval.length === 0 && paid.length === 0 && (
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