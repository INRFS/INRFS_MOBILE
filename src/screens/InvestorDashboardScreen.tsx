import React from 'react';
import {View, Text, TouchableOpacity, ScrollView, Image, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle, Polyline} from 'react-native-svg'; // npm install react-native-svg
import BottomTabBar from '../components/BottomTabBar';
import AppHeader from '../components/AppHeader';
import {
  styles,
  PRIMARY,
  NAVY,
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
  // Total value across every product the investor holds — shown in the hero banner.
  totalPortfolioValue: 3000000,
  totalPortfolioValueDelta: '+₹2,45,000 (8.85%) All time return',
  totalInvested: 800000,
  totalInvestedDelta: '+₹1,30,000 vs last year',
  interestEarned: 63000,
  interestEarnedDelta: '+₹12,000 this month',
  monthlyPayout: 7750,
  monthlyPayoutDelta: '+₹2,750 from last month',
  activeBondsCount: 2,
  activeBondsDelta: 'No change',
  // Value tracked by the Investment Growth chart (a subset of the total above).
  portfolioValue: 863000,
};

const notificationCount = 3;

// Mini sparkline series shown at the bottom of each stat card.
const sparklines = {
  totalInvested: [40, 44, 48, 46, 52, 58, 60],
  interestEarned: [20, 26, 24, 32, 38, 44, 52],
  monthlyPayout: [30, 36, 32, 40, 38, 46, 50],
  activeBonds: [50, 50, 50, 50, 50, 50, 50],
};

// Investment growth line-chart series (₹) with month labels.
const growthMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const growthSeries = [620000, 700000, 675000, 750000, 725000, 863000];

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

// Icon chip background + icon color per stat card, in the order rendered.
const STAT_ACCENTS = [
  {bg: '#DBEAFE', color: PRIMARY, icon: 'wallet-outline'},
  {bg: '#DCFCE7', color: GREEN, icon: 'trending-up'},
  {bg: '#FEF3C7', color: ORANGE, icon: 'calendar-month-outline'},
  {bg: '#EDE9FE', color: PURPLE, icon: 'bank-outline'},
];

// Quick action tiles — solid color background, white icon/text.
const QUICK_ACTIONS = [
  {label: 'Invest Now', sub: 'Start a new\ninvestment', icon: 'target', bg: PURPLE, screen: 'InvestNow'},
  {label: 'My Bonds', sub: 'View all your\ninvestments', icon: 'briefcase-outline', bg: GREEN, screen: 'MyInvestments'},
  {label: 'Download\nBond Certificate', sub: 'Get your bond\ncertificate', icon: 'download-outline', bg: NAVY, screen: null},
  {label: 'Update Profile', sub: 'Manage your profile\ninformation', icon: 'account-outline', bg: '#92400E', screen: 'Profile'},
];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// Tiny inline sparkline built from a normalized point list — no chart library needed.
const Sparkline = ({data, color, width = 110, height = 24}: {data: number[]; color: string; width?: number; height?: number}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

// Investment growth line chart — same normalized-polyline approach, plus a
// highlighted dot on the final (most recent) data point.
const LineChart = ({data, width = 300, height = 80, color = '#fff'}: {data: number[]; width?: number; height?: number; color?: string}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const coords = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * (height - 10) - 5,
  }));
  const points = coords.map(c => `${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {coords.slice(0, -1).map((c, i) => (
        <Circle key={i} cx={c.x} cy={c.y} r={2.5} fill="rgba(255,255,255,0.4)" />
      ))}
      <Circle cx={last.x} cy={last.y} r={5} fill="#fff" />
    </Svg>
  );
};

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
  const donutSize = 96;

  return (
    <SafeAreaView style={styles.safeArea}>
     <AppHeader subtitle="Investment Portal" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero: greeting + total portfolio value */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroTitle}>Good morning, {investor.firstName}! 👋</Text>
              <Text style={styles.heroSubtitle}>Here's your investment portfolio overview for today</Text>
            </View>
            <View style={styles.heroBadge}>
              <Icon name="chart-line" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.heroValue}>{formatINR(investor.totalPortfolioValue)}</Text>
          <View style={styles.heroDeltaRow}>
            <Icon name="arrow-up" size={13} color="#D9F99D" />
            <Text style={styles.heroDeltaText}>{investor.totalPortfolioValueDelta}</Text>
          </View>
        </View>

        {/* Stat grid — Total Invested / Interest Earned / Monthly Payout / Active Bonds */}
        <View style={styles.statGrid}>
          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: STAT_ACCENTS[0].bg}]}>
              <Icon name={STAT_ACCENTS[0].icon} size={16} color={STAT_ACCENTS[0].color} />
            </View>
            <Text style={styles.statGridLabel}>TOTAL INVESTED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.totalInvested)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.totalInvestedDelta}</Text>
            <View style={styles.statGridSparkWrap}>
              <Sparkline data={sparklines.totalInvested} color={PRIMARY} />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: STAT_ACCENTS[1].bg}]}>
              <Icon name={STAT_ACCENTS[1].icon} size={16} color={STAT_ACCENTS[1].color} />
            </View>
            <Text style={styles.statGridLabel}>INTEREST EARNED</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.interestEarned)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.interestEarnedDelta}</Text>
            <View style={styles.statGridSparkWrap}>
              <Sparkline data={sparklines.interestEarned} color={GREEN} />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: STAT_ACCENTS[2].bg}]}>
              <Icon name={STAT_ACCENTS[2].icon} size={16} color={STAT_ACCENTS[2].color} />
            </View>
            <Text style={styles.statGridLabel}>MONTHLY PAYOUT</Text>
            <Text style={styles.statGridValue}>{formatINR(investor.monthlyPayout)}</Text>
            <Text style={styles.statGridDeltaGood}>↑ {investor.monthlyPayoutDelta}</Text>
            <View style={styles.statGridSparkWrap}>
              <Sparkline data={sparklines.monthlyPayout} color={ORANGE} />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View style={[styles.statGridIconWrap, {backgroundColor: STAT_ACCENTS[3].bg}]}>
              <Icon name={STAT_ACCENTS[3].icon} size={16} color={STAT_ACCENTS[3].color} />
            </View>
            <Text style={styles.statGridLabel}>ACTIVE BONDS</Text>
            <Text style={styles.statGridValue}>{investor.activeBondsCount}</Text>
            <Text style={styles.statGridDeltaNeutral}>{investor.activeBondsDelta}</Text>
            <View style={styles.statGridSparkWrap}>
              <Sparkline data={sparklines.activeBonds} color={PRIMARY} />
            </View>
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

          <View style={styles.lineChartWrap}>
            <LineChart data={growthSeries} width={296} height={80} />
          </View>
          <View style={styles.lineChartMonthRow}>
            {growthMonths.map(m => (
              <Text key={m} style={styles.lineChartMonthText}>{m}</Text>
            ))}
          </View>

          <View style={styles.portfolioBtnRow}>
            <TouchableOpacity
              style={styles.investBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('InvestNow', {investorId})}>
              <Icon name="plus-circle-outline" size={16} color="#fff" />
              <Text style={styles.investBtnText}>Invest Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MyInvestments', {investorId})}>
              <Icon name="briefcase-outline" size={16} color="#fff" />
              <Text style={styles.withdrawBtnText}>My Investments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Distribution — donut with center total + legend w/ amounts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Portfolio Distribution</Text>
        </View>
        <View style={styles.distributionCard}>
          <View style={styles.distributionBody}>
            <View style={styles.donutWrap}>
              <Donut data={portfolioDistribution} size={donutSize} />
              <View style={[styles.donutCenterWrap, {width: donutSize, height: donutSize}]}>
                <Text style={styles.donutCenterValue}>{formatINR(investor.totalPortfolioValue)}</Text>
                <Text style={styles.donutCenterLabel}>Total Value</Text>
              </View>
            </View>
            <View style={styles.legendWrap}>
              {portfolioDistribution.map(d => (
                <View key={d.label} style={styles.legendRow}>
                  <View style={styles.legendLabelRow}>
                    <View style={[styles.legendDot, {backgroundColor: d.color}]} />
                    <Text style={styles.legendLabel}>{d.label}</Text>
                  </View>
                  <View style={styles.legendValueWrap}>
                    <Text style={styles.legendPct}>{d.pct}%</Text>
                    <Text style={styles.legendAmount}>
                      {formatINR(Math.round((d.pct / 100) * investor.totalPortfolioValue))}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Full Breakdown</Text>
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
          <View
            key={inv.bondNumber}
            style={[styles.bondCard, {borderLeftColor: inv.status === 'Active' ? GREEN : PURPLE}]}>
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

        {/* Quick Actions — solid color tiles, one row */}
        {/* <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.quickActionBtn, {backgroundColor: action.bg}]}
              activeOpacity={0.85}
              onPress={() =>
                action.screen
                  ? navigation.navigate(action.screen, {investorId})
                  : Alert.alert('Download Bond Certificate', 'Wire this up once the bond PDF endpoint is available.')
              }>
              <View style={styles.quickActionIconWrap}>
                <Icon name={action.icon} size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
                <Text style={styles.quickActionSubLabel}>{action.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}

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