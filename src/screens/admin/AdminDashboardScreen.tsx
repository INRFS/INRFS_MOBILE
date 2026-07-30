import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import {useAppData, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminDashboardScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const TENURE_OPTIONS = [
  {months: 6, rate: 11},
  {months: 12, rate: 12},
  {months: 24, rate: 12.5},
  {months: 36, rate: 13},
];

const monthlyTrend = [
  {label: 'Jan', h: 30},
  {label: 'Feb', h: 40},
  {label: 'Mar', h: 46},
  {label: 'Apr', h: 55},
  {label: 'May', h: 68},
  {label: 'Jun', h: 80},
  {label: 'Jul', h: 95},
];

const investorGrowth = [
  {label: 'Jan', h: 30},
  {label: 'Feb', h: 42},
  {label: 'Mar', h: 50},
  {label: 'Apr', h: 62},
  {label: 'May', h: 74},
  {label: 'Jun', h: 84},
  {label: 'Jul', h: 96},
];

const kycBadgeStyle = (status: 'Approved' | 'Pending' | 'Rejected') => {
  if (status === 'Approved') return {bg: '#DCFCE7', text: '#16A34A'};
  if (status === 'Pending') return {bg: '#FEF3C7', text: '#B45309'};
  return {bg: '#FEE2E2', text: '#DC2626'};
};

const statusBadgeStyle = (status: 'Active' | 'Pending') => {
  if (status === 'Active') return {bg: '#DCFCE7', text: '#16A34A'};
  return {bg: '#FEF3C7', text: '#B45309'};
};

const AdminDashboardScreen = ({navigation}: any) => {
  const {investors, bonds, payouts, kycRequests, kycPendingCount, adminProfile, addBond} = useAppData();

  const [addInvestmentOpen, setAddInvestmentOpen] = useState(false);
  const [investorQuery, setInvestorQuery] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | undefined>(undefined);
  const [amountText, setAmountText] = useState('');
  const [tenureIndex, setTenureIndex] = useState(1);
  const [investedDate, setInvestedDate] = useState(
    new Date().toLocaleDateString('en-GB').split('/').join('-'),
  );
  const [paymentReference, setPaymentReference] = useState('');

  const amount = Number(amountText.replace(/[^0-9]/g, '')) || 0;
  const tenure = TENURE_OPTIONS[tenureIndex];
  const monthlyInterest = amount ? (amount * (tenure.rate / 100)) / 12 : 0;
  const totalInterest = amount ? amount * (tenure.rate / 100) * (tenure.months / 12) : 0;

  const investorResults = investorQuery.trim()
    ? investors.filter(
        inv =>
          inv.name.toLowerCase().includes(investorQuery.toLowerCase()) ||
          inv.id.toLowerCase().includes(investorQuery.toLowerCase()) ||
          inv.mobile.includes(investorQuery),
      )
    : [];

  const resetAddInvestmentForm = () => {
    setInvestorQuery('');
    setSelectedInvestor(undefined);
    setAmountText('');
    setTenureIndex(1);
    setPaymentReference('');
    setInvestedDate(new Date().toLocaleDateString('en-GB').split('/').join('-'));
  };

  const closeAddInvestmentModal = () => {
    setAddInvestmentOpen(false);
    resetAddInvestmentForm();
  };

  const handleSaveAndGenerateBond = () => {
    if (!selectedInvestor) {
      Alert.alert('Select an investor', 'Please search and select an investor first.');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Enter an amount', 'Please enter a valid investment amount.');
      return;
    }
    addBond({
      investorName: selectedInvestor.name,
      amount,
      interestRate: tenure.rate,
      tenureMonths: tenure.months,
      investedDateStr: investedDate,
      reference: paymentReference || undefined,
    });
    setAddInvestmentOpen(false);
    resetAddInvestmentForm();
    Alert.alert('Bond generated', `New investment added for ${selectedInvestor.name}. Check the Portfolio tab.`);
  };

  const totalAUM = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const activeInvestments = bonds.filter(b => b.status === 'Active').length;
  const monthlyInterestDue = payouts.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingApprovals = kycRequests.filter(k => k.category === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏦  INRFS</Text>
        <View style={styles.headerIcons}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminNotifications')}>
  <Text style={styles.bell}>🔔</Text>
</TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.greetingTitle}>Admin Dashboard</Text>
        <Text style={styles.greetingSubtitle}>
          Welcome back, {adminProfile.name.split(' ')[0]}. Here's today's overview.
        </Text>

        <View style={styles.topActionsRow}>
          <TouchableOpacity
            style={styles.topActionBtnOutline}
            onPress={() => navigation.navigate('AdminReports')}>
            <Text style={styles.topActionBtnOutlineText}>📊  Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topActionBtnFilled}
            onPress={() => setAddInvestmentOpen(true)}>
            <Text style={styles.topActionBtnFilledText}>+  Add Investment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aumCard}>
          <Text style={styles.aumLabel}>Total AUM</Text>
          <Text style={styles.aumValue}>
            ${totalAUM.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </Text>
          <Text style={styles.aumChange}>↑ +12.4%  vs last quarter</Text>
        </View>

        {/* Stat grid — matches the remaining 5 web dashboard cards */}
        <View style={styles.statGrid}>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#E7ECFB'}]}>
              <Text>👥</Text>
            </View>
            <Text style={styles.statGridLabel}>TOTAL INVESTORS</Text>
            <Text style={styles.statGridValue}>{investors.length.toLocaleString()}</Text>
            <Text style={styles.statGridDeltaGood}>↑ +24</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#FEF3C7'}]}>
              <Text>📋</Text>
            </View>
            <Text style={styles.statGridLabel}>PENDING KYC</Text>
            <Text style={styles.statGridValue}>{kycPendingCount}</Text>
            <Text style={styles.statGridDeltaBad}>↓ -3</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DCFCE7'}]}>
              <Text>📈</Text>
            </View>
            <Text style={styles.statGridLabel}>ACTIVE INVESTMENTS</Text>
            <Text style={styles.statGridValue}>{activeInvestments}</Text>
            <Text style={styles.statGridDeltaGood}>↑ +12</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Text>💵</Text>
            </View>
            <Text style={styles.statGridLabel}>MONTHLY INTEREST DUE</Text>
            <Text style={styles.statGridValue}>
              ₹{monthlyInterestDue.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statGridDeltaNeutral}>This Month</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#FBE8E8'}]}>
              <Text>⏱</Text>
            </View>
            <Text style={styles.statGridLabel}>PENDING APPROVALS</Text>
            <Text style={styles.statGridValue}>{pendingApprovals}</Text>
            <Text style={styles.statGridDeltaBad}>Urgent</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Monthly Investment Trend</Text>
            <Text style={styles.chartMenu}>•••</Text>
          </View>
          <View style={styles.chartBarsRow}>
            {monthlyTrend.map((d, i) => (
              <View key={i} style={styles.chartBarCol}>
                <View style={[styles.chartBar, {height: d.h}]} />
              </View>
            ))}
          </View>
          <View style={styles.chartLabelsRow}>
            {monthlyTrend.map(d => (
              <Text key={d.label} style={styles.chartLabel}>{d.label}</Text>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Investor Growth</Text>
            <Text style={styles.chartMenu}>•••</Text>
          </View>
          <View style={styles.chartBarsRow}>
            {investorGrowth.map((d, i) => (
              <View key={i} style={styles.chartBarCol}>
                <View style={[styles.chartBar, {height: d.h, backgroundColor: '#16A34A'}]} />
              </View>
            ))}
          </View>
          <View style={styles.chartLabelsRow}>
            {investorGrowth.map(d => (
              <Text key={d.label} style={styles.chartLabel}>{d.label}</Text>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InvestorRegistry')}>
            <Text style={styles.viewLogs}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {investors.slice(0, 5).map((inv, idx) => {
            const kycStyle = kycBadgeStyle(inv.kycStatus);
            const statusStyle = statusBadgeStyle(inv.status);
            return (
              <TouchableOpacity
                key={inv.id}
                style={[styles.activityRow, idx !== investors.slice(0, 5).length - 1 && styles.activityRowBorder]}
                onPress={() => navigation.navigate('InvestorRegistry')}>
                <View style={styles.activityIconWrap}>
                  <Text style={styles.activityInitial}>{inv.name.charAt(0)}</Text>
                </View>
                <View style={styles.activityTextWrap}>
                  <Text style={styles.activityTitle}>{inv.name}</Text>
                  <Text style={styles.activitySubtitle}>{inv.branch} • {inv.id}</Text>
                </View>
                <View style={{alignItems: 'flex-end', gap: 4}}>
                  <View style={[styles.miniBadge, {backgroundColor: kycStyle.bg}]}>
                    <Text style={[styles.miniBadgeText, {color: kycStyle.text}]}>{inv.kycStatus}</Text>
                  </View>
                  <View style={[styles.miniBadge, {backgroundColor: statusStyle.bg}]}>
                    <Text style={[styles.miniBadgeText, {color: statusStyle.text}]}>{inv.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.riskCard}>
          <Text style={styles.riskIcon}>🛡</Text>
          <View style={styles.riskTextWrap}>
            <Text style={styles.riskTitle}>Quarterly Risk Assessment</Text>
            <Text style={styles.riskSubtitle}>Due in 4 days</Text>
          </View>
          <Text style={styles.riskArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Home</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
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

      {/* ---- Add Investment / Generate Bond modal ---- */}
      <Modal
        visible={addInvestmentOpen}
        transparent
        animationType="slide"
        onRequestClose={closeAddInvestmentModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Add Investment</Text>
                <TouchableOpacity onPress={closeAddInvestmentModal}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Search an investor, set the amount and tenure, then generate a bond.</Text>

              {/* Investor search / selection */}
              <Text style={styles.inputLabel}>Investor</Text>
              {selectedInvestor ? (
                <View style={styles.selectedInvestorChip}>
                  <View style={{flex: 1}}>
                    <Text style={styles.selectedInvestorName}>{selectedInvestor.name}</Text>
                    <Text style={styles.selectedInvestorMeta}>{selectedInvestor.id} • {selectedInvestor.branch}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedInvestor(undefined)}>
                    <Text style={styles.changeInvestorLink}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Search by name, ID, or mobile"
                    placeholderTextColor="#9CA3AF"
                    value={investorQuery}
                    onChangeText={setInvestorQuery}
                  />
                  {investorResults.length > 0 && (
                    <View style={styles.investorResultsBox}>
                      {investorResults.slice(0, 5).map(inv => (
                        <TouchableOpacity
                          key={inv.id}
                          style={styles.investorResultRow}
                          onPress={() => {
                            setSelectedInvestor(inv);
                            setInvestorQuery('');
                          }}>
                          <Text style={styles.investorResultName}>{inv.name}</Text>
                          <Text style={styles.investorResultMeta}>{inv.id} • {inv.branch}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {investorQuery.trim().length > 0 && investorResults.length === 0 && (
                    <Text style={styles.noResultsText}>No investors match "{investorQuery}"</Text>
                  )}
                </>
              )}

              {/* Amount */}
              <Text style={styles.inputLabel}>Investment Amount (₹)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 500000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={amountText}
                onChangeText={setAmountText}
              />

              {/* Tenure */}
              <Text style={styles.inputLabel}>Tenure</Text>
              <View style={styles.tenureRow}>
                {TENURE_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt.months}
                    style={[styles.tenureOption, tenureIndex === i && styles.tenureOptionActive]}
                    onPress={() => setTenureIndex(i)}>
                    <Text style={[styles.tenureOptionMonths, tenureIndex === i && styles.tenureOptionMonthsActive]}>
                      {opt.months}m
                    </Text>
                    <Text style={[styles.tenureOptionRate, tenureIndex === i && styles.tenureOptionRateActive]}>
                      {opt.rate}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Invested date */}
              <Text style={styles.inputLabel}>Invested Date (DD-MM-YYYY)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#9CA3AF"
                value={investedDate}
                onChangeText={setInvestedDate}
              />

              {/* Payment reference */}
              <Text style={styles.inputLabel}>Payment Reference (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. UTR123456"
                placeholderTextColor="#9CA3AF"
                value={paymentReference}
                onChangeText={setPaymentReference}
              />

              {/* Summary */}
              {amount > 0 && (
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Monthly Interest</Text>
                    <Text style={styles.summaryValue}>
                      ₹{monthlyInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Interest ({tenure.months}m)</Text>
                    <Text style={styles.summaryValue}>
                      ₹{totalInterest.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={closeAddInvestmentModal}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveAndGenerateBond}>
                  <Text style={styles.modalSaveBtnText}>Save & Generate Bond</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;