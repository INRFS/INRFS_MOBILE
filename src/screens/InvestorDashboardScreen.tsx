import React from 'react';
import {View, Text, TouchableOpacity,  ScrollView, Image, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestorDashboardScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
// Replace with real investor data (from context/API) once available — matches
// the same fields the web Investor Dashboard reads from the shared backend.
const investor = {
  firstName: 'Arjun',
  totalInvested: 800000,
  totalInvestedDelta: '+₹3,00,000 vs last year',
  interestEarned: 63000,
  interestEarnedDelta: '+₹12,000 this month',
  activeBondsCount: 2,
  activeBondsDelta: '0 no change',
  monthlyPayout: 7750,
  monthlyPayoutDelta: '+₹2,750 from last month',
  portfolioValue: 863000,
  portfolioValueDelta: '+8.9% total growth',
  nextMaturityDays: 45,
  nextMaturityDate: '15 Jan 2026',
  nextMaturityBondId: 'BND-2025-001',
};

const chartBars = [34, 46, 58, 66, 52, 74, 60];

const portfolioDistribution = [
  {label: 'Fixed Deposit', pct: 45, color: '#0E2A5E'},
  {label: 'Recurring', pct: 28, color: '#1955F0'},
  {label: 'Short Term', pct: 17, color: '#16A34A'},
  {label: 'Long Term', pct: 10, color: '#F59E0B'},
];

const recentInvestments = [
  {bondNumber: 'BND-2025-001', amount: 500000, rate: '12% p.a.', investedOn: '15 Jan 2025', status: 'Active'},
  {bondNumber: 'BND-2024-087', amount: 300000, rate: '11% p.a.', investedOn: '10 Jun 2024', status: 'Matured'},
];

const notifications = [
  {title: 'Investment Approved', time: '2 hours ago', icon: 'check-circle-outline'},
  {title: 'Bond Generated', time: '2 hours ago', icon: 'file-document-outline'},
  {title: 'Interest Credited', time: '5 days ago', icon: 'cash-multiple'},
];

const transactions = [
  {
    title: 'Monthly Interest',
    date: 'Today, 10:45 AM',
    amount: '+₹8,000.00',
    status: 'Settled',
    credit: true,
  },
  {
    title: 'New Investment',
    date: 'Yesterday',
    amount: '-₹2,00,000.00',
    status: 'BND-2025-001',
    credit: false,
  },
  {
    title: 'Interest Credit',
    date: '24 Oct 2023',
    amount: '+₹8,000.00',
    status: 'Settled',
    credit: true,
  },
];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

const InvestorDashboardScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandIconWrap}>
            <Icon name="bank" size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>INRFS</Text>
        </View>
        <View style={styles.headerActions}>
         <TouchableOpacity style={styles.bellWrap} onPress={() => navigation.navigate('InvestorNotifications')}>
  <Icon name="bell-outline" size={20} color="#111827" />
  <View style={styles.bellDot} />
</TouchableOpacity>
          <Image source={{uri: 'https://i.pravatar.cc/64'}} style={styles.avatar} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greetingTitle}>Good morning, {investor.firstName}! 👋</Text>
        <Text style={styles.greetingSubtitle}>Here's your investment portfolio overview for today</Text>

        {/* Stat grid — matches the 6 web dashboard cards */}
        <View style={styles.statGrid}>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Icon name="currency-inr" size={16} color="#1955F0" />
            </View>
            <Text style={styles.statGridLabel}>TOTAL INVESTED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.totalInvested)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.totalInvestedDelta}</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DCFCE7'}]}>
              <Icon name="trending-up" size={16} color="#16A34A" />
            </View>
            <Text style={styles.statGridLabel}>INTEREST EARNED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.interestEarned)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.interestEarnedDelta}</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#EDE9FE'}]}>
              <Icon name="medal-outline" size={16} color="#7C3AED" />
            </View>
            <Text style={styles.statGridLabel}>ACTIVE BONDS</Text>
            <Text style={styles.statGridValue}>{investor.activeBondsCount}</Text>
            <Text style={styles.statGridDeltaNeutral}>{investor.activeBondsDelta}</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DCFCE7'}]}>
              <Icon name="chart-line" size={16} color="#16A34A" />
            </View>
            <Text style={styles.statGridLabel}>MONTHLY PAYOUT</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.monthlyPayout)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.monthlyPayoutDelta}</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Icon name="chart-bar" size={16} color="#1955F0" />
            </View>
            <Text style={styles.statGridLabel}>PORTFOLIO VALUE</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.portfolioValue)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.portfolioValueDelta}</Text>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#FEF3C7'}]}>
              <Icon name="calendar-clock-outline" size={16} color="#B45309" />
            </View>
            <Text style={styles.statGridLabel}>NEXT MATURITY</Text>
            <Text style={styles.statGridValue}>{investor.nextMaturityDays} Days</Text>
            <Text style={styles.statGridDeltaNeutral}>
              {investor.nextMaturityDate} • {investor.nextMaturityBondId}
            </Text>
          </View>
        </View>

        {/* Investment Growth + primary CTAs */}
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioTopRow}>
            <Text style={styles.portfolioLabel}>INVESTMENT GROWTH</Text>
            <View style={styles.trendBadge}>
              <Icon name="trending-up" size={12} color="#16A34A" />
              <Text style={styles.trendText}>+12.5%</Text>
            </View>
          </View>
          <Text style={styles.portfolioValue}>{formatINR(investor.portfolioValue)}</Text>

          <View style={styles.chartRow}>
            {chartBars.map((h, i) => (
              <View
                key={i}
                style={[styles.chartBar, {height: h}, i === chartBars.length - 2 && styles.chartBarHighlight]}
              />
            ))}
          </View>

          <View style={styles.portfolioBtnRow}>
            <TouchableOpacity
              style={styles.investBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('InvestNow', {investorId})}>
              <Icon name="plus-circle-outline" size={16} color="#fff" />
              <Text style={styles.investBtnText}>Invest</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MyInvestments', {investorId})}>
              <Icon name="briefcase-outline" size={16} color="#fff" />
              <Text style={styles.withdrawBtnText}>MyInvestments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Distribution */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Portfolio Distribution</Text>
        </View>
        <View style={styles.distributionCard}>
          {portfolioDistribution.map(d => (
            <View key={d.label} style={styles.distributionRow}>
              <View style={styles.distributionLabelRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                  <View style={[styles.distributionDot, {backgroundColor: d.color}]} />
                  <Text style={styles.distributionLabel}>{d.label}</Text>
                </View>
                <Text style={styles.distributionPct}>{d.pct}%</Text>
              </View>
              <View style={styles.distributionBarTrackWrap}>
                <View style={styles.distributionBarTrack}>
                  <View style={[styles.distributionBarFill, {width: `${d.pct}%`, backgroundColor: d.color}]} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Investments (Bond Number / Amount / Rate / Invested On / Status) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Investments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyInvestments', {investorId})}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentInvestments.map(inv => (
          <View key={inv.bondNumber} style={styles.bondCard}>
            <View style={styles.bondTopRow}>
              <View style={styles.bondIconBox}>
                <Icon name="file-certificate-outline" size={18} color="#0E2A5E" />
              </View>
              <View style={styles.bondTitleWrap}>
                <Text style={styles.bondId}>{inv.bondNumber}</Text>
                <Text style={styles.bondType}>{inv.rate} • {formatINR(inv.amount)}</Text>
              </View>
              <View style={[styles.statusBadge, inv.status !== 'Active' && styles.statusBadgeMuted]}>
                <Text style={[styles.statusBadgeText, inv.status !== 'Active' && styles.statusBadgeTextMuted]}>
                  {inv.status}
                </Text>
              </View>
            </View>
            <View style={styles.bondDivider} />
            <View style={styles.bondBottomRow}>
              <View>
                <Text style={styles.bondMetaLabel}>Invested On</Text>
                <Text style={styles.bondMetaValue}>{inv.investedOn}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.bondMetaLabel}>Amount</Text>
                <Text style={styles.bondReturnValue}>{formatINR(inv.amount)}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('InvestNow', {investorId})}>
            <Icon name="plus-circle-outline" size={18} color="#1955F0" />
            <Text style={styles.quickActionLabel}>Invest Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('MyInvestments', {investorId})}>
            <Icon name="briefcase-outline" size={18} color="#1955F0" />
            <Text style={styles.quickActionLabel}>My Bonds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => Alert.alert('Download Bond Certificate', 'Wire this up once the bond PDF endpoint is available.')}>
            <Icon name="download-outline" size={18} color="#1955F0" />
            <Text style={styles.quickActionLabel}>Download Bond{'\n'}Certificate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-edit-outline" size={18} color="#1955F0" />
            <Text style={styles.quickActionLabel}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Notifications */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
        </View>
        <View style={styles.txCard}>
          {notifications.map((n, i) => (
            <View key={n.title} style={[styles.txRow, i !== notifications.length - 1 && styles.txRowBorder]}>
              <View style={[styles.txIconWrap, styles.txIconCredit]}>
                <Icon name={n.icon} size={16} color="#16A34A" />
              </View>
              <View style={styles.txTitleWrap}>
                <Text style={styles.txTitle}>{n.title}</Text>
                <Text style={styles.txDate}>{n.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Transactions (unchanged, kept as-is) */}
        {/* <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>See History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txCard}>
          {transactions.map((tx, i) => (
            <View key={i} style={[styles.txRow, i !== transactions.length - 1 && styles.txRowBorder]}>
              <View style={[styles.txIconWrap, tx.credit ? styles.txIconCredit : styles.txIconDebit]}>
                <Icon
                  name={tx.credit ? 'arrow-bottom-left' : 'arrow-top-right'}
                  size={16}
                  color={tx.credit ? '#16A34A' : '#374151'}
                />
              </View>
              <View style={styles.txTitleWrap}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={[styles.txAmount, tx.credit ? styles.txAmountCredit : null]}>{tx.amount}</Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </View>
          ))}
        </View> */}
      </ScrollView>

      <BottomTabBar active="Home" navigation={navigation} investorId={investorId} />
    </SafeAreaView>
  );
};

export default InvestorDashboardScreen;