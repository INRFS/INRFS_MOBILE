import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle} from 'react-native-svg'; // npm install react-native-svg
import BottomTabBar from '../components/BottomTabBar';
import {
  styles,
  PRIMARY,
  GREEN,
  PURPLE,
  ORANGE,
  RED,
} from '../styles/InvestorDashboardScreen.styles';
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

const notificationCount = 3;

const chartBars = [34, 46, 58, 66, 52, 74, 60];

const portfolioDistribution = [
  {label: 'Fixed Deposit', pct: 45, color: '#0E2A5E'},
  {label: 'Recurring', pct: 28, color: PURPLE},
  {label: 'Short Term', pct: 17, color: GREEN},
  {label: 'Long Term', pct: 10, color: ORANGE},
];

const recentInvestments = [
  {bondNumber: 'BND-2025-001', amount: 500000, rate: '12% p.a.', investedOn: '15 Jan 2025', status: 'Active'},
  {bondNumber: 'BND-2024-087', amount: 300000, rate: '11% p.a.', investedOn: '10 Jun 2024', status: 'Matured'},
];

// Each notification picks an accent (icon color + light bg) instead of every
// row defaulting to green.
const notifications = [
  {title: 'Investment Approved', time: '2 hours ago', icon: 'shield-check-outline', accent: 'green'},
  {title: 'Bond Generated', time: '2 hours ago', icon: 'file-document-outline', accent: 'blue'},
  {title: 'Interest Credited', time: '5 days ago', icon: 'chart-line', accent: 'purple'},
] as const;

const NOTIF_ACCENTS: Record<string, {wrap: any; color: string}> = {
  green: {wrap: styles.txIconGreen, color: GREEN},
  blue: {wrap: styles.txIconBlue, color: PRIMARY},
  purple: {wrap: styles.txIconPurple, color: PURPLE},
  orange: {wrap: styles.txIconOrange, color: ORANGE},
};

// Left-rail accent color per stat card, in the same order they're rendered.
const STAT_ACCENTS = [PRIMARY, GREEN, PURPLE, ORANGE, PRIMARY, RED];

// Top-rail accent color per quick action, in the same order they're rendered.
const QUICK_ACTION_ACCENTS = [PRIMARY, GREEN, PURPLE, ORANGE];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// Simple SVG donut built from stroke-dasharray segments — no chart library needed.
const Donut = ({data, size = 96, strokeWidth = 14}: {data: typeof portfolioDistribution; size?: number; strokeWidth?: number}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const dash = (d.pct / 100) * circumference;
        const segment = (
          <Circle
            key={d.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offsetAcc}
            strokeLinecap="butt"
            fill="none"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        );
        offsetAcc += dash;
        return segment;
      })}
    </Svg>
  );
};

const InvestorDashboardScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandIconWrap}>
            <Icon name="bank" size={18} color="#fff" />
          </View>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>INRFS</Text>
            <Text style={styles.headerSubtitle}>Financer Platform</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.bellWrap} onPress={() => navigation.navigate('InvestorNotifications')}>
            <Icon name="bell-outline" size={22} color="#111827" />
            {notificationCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Image source={{uri: 'https://i.pravatar.cc/64'}} style={styles.avatar} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text style={styles.greetingTitle}>Good morning, {investor.firstName}! 👋</Text>
        <Text style={styles.greetingSubtitle}>Here's your investment portfolio overview for today</Text>

        {/* Stat grid — matches the 6 web dashboard cards, each with a colored left rail */}
        <View style={styles.statGrid}>
          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[0]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Icon name="currency-inr" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.statGridLabel}>TOTAL INVESTED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.totalInvested)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.totalInvestedDelta}</Text>
          </View>

          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[1]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DCFCE7'}]}>
              <Icon name="trending-up" size={16} color={GREEN} />
            </View>
            <Text style={styles.statGridLabel}>INTEREST EARNED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.interestEarned)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.interestEarnedDelta}</Text>
          </View>

          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[2]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#EDE9FE'}]}>
              <Icon name="medal-outline" size={16} color={PURPLE} />
            </View>
            <Text style={styles.statGridLabel}>ACTIVE BONDS</Text>
            <Text style={styles.statGridValue}>{investor.activeBondsCount}</Text>
            <Text style={styles.statGridDeltaNeutral}>{investor.activeBondsDelta}</Text>
          </View>

          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[3]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#FEF3C7'}]}>
              <Icon name="chart-line" size={16} color={ORANGE} />
            </View>
            <Text style={styles.statGridLabel}>MONTHLY PAYOUT</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.monthlyPayout)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.monthlyPayoutDelta}</Text>
          </View>

          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[4]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Icon name="chart-bar" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.statGridLabel}>PORTFOLIO VALUE</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.portfolioValue)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.portfolioValueDelta}</Text>
          </View>

          <View style={[styles.statGridCard, {borderLeftColor: STAT_ACCENTS[5]}]}>
            <View style={[styles.statGridIconWrap, {backgroundColor: '#FEE2E2'}]}>
              <Icon name="calendar-clock-outline" size={16} color={RED} />
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
              <Icon name="trending-up" size={12} color={GREEN} />
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

        {/* Portfolio Distribution — donut + legend */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Portfolio Distribution</Text>
        </View>
        <View style={styles.distributionCard}>
          <View style={styles.distributionBody}>
            <View style={styles.donutWrap}>
              <Donut data={portfolioDistribution} />
            </View>
            <View style={styles.legendWrap}>
              {portfolioDistribution.map(d => (
                <View key={d.label} style={styles.legendRow}>
                  <View style={styles.legendLabelRow}>
                    <View style={[styles.legendDot, {backgroundColor: d.color}]} />
                    <Text style={styles.legendLabel}>{d.label}</Text>
                  </View>
                  <Text style={styles.legendPct}>{d.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Icon name="chevron-right" size={16} color={PRIMARY} />
          </TouchableOpacity>
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

        {/* Quick Actions — each card gets a colored top rail */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionBtn, {borderTopColor: QUICK_ACTION_ACCENTS[0]}]}
            onPress={() => navigation.navigate('InvestNow', {investorId})}>
            <Icon name="crosshairs-gps" size={18} color={PRIMARY} />
            <Text style={styles.quickActionLabel}>Invest Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, {borderTopColor: QUICK_ACTION_ACCENTS[1]}]}
            onPress={() => navigation.navigate('MyInvestments', {investorId})}>
            <Icon name="briefcase-outline" size={18} color={GREEN} />
            <Text style={styles.quickActionLabel}>My Bonds</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, {borderTopColor: QUICK_ACTION_ACCENTS[2]}]}
            onPress={() => Alert.alert('Download Bond Certificate', 'Wire this up once the bond PDF endpoint is available.')}>
            <Icon name="download-outline" size={18} color={PURPLE} />
            <Text style={styles.quickActionLabel}>Download Bond{'\n'}Certificate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, {borderTopColor: QUICK_ACTION_ACCENTS[3]}]}
            onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-edit-outline" size={18} color={ORANGE} />
            <Text style={styles.quickActionLabel}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Notifications — each row gets its own accent color */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InvestorNotifications')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.txCard}>
          {notifications.map((n, i) => {
            const accent = NOTIF_ACCENTS[n.accent];
            return (
              <View key={n.title} style={[styles.txRow, i !== notifications.length - 1 && styles.txRowBorder]}>
                <View style={[styles.txIconWrap, accent.wrap]}>
                  <Icon name={n.icon} size={16} color={accent.color} />
                </View>
                <View style={styles.txTitleWrap}>
                  <Text style={styles.txTitle}>{n.title}</Text>
                  <Text style={styles.txDate}>{n.time}</Text>
                </View>
                <Icon name="chevron-right" size={18} style={styles.txChevron} />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomTabBar active="Home" navigation={navigation} investorId={investorId} />
    </SafeAreaView>
  );
};

export default InvestorDashboardScreen;