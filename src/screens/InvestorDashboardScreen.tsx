import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle, Polyline} from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import BottomTabBar from '../components/BottomTabBar';
import AppHeader from '../components/AppHeader';
import {
  styles,
  PRIMARY,
  NAVY,
  GREEN,
  PURPLE,
  ORANGE,
} from '../styles/InvestorDashboardScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const API_BASE_URL = 'http://187.52.115.32:8000';

type DashboardSummary = {
  total_invested: string;
  interest_earned: string;
  active_bonds: number;
  monthly_payout: string;
  portfolio_value: string;
  next_maturity_date: string | null;
  days_to_maturity: number | null;
};

type GrowthItem = {
  month_name: string;
  investment_amount: string;
};

type PortfolioSplitItem = {
  label: string;
  percentage?: number;
  pct?: number;
  color?: string;
};

type RecentInvestment = {
  investment_id: string;
  investment_amount: string;
  interest_rate: string;
  investment_date: string;
  investment_status: string;
  bond_id: string;
};

type Investor = {
  investor_id: string;
  investor_name: string;
  mobile: string;
  email: string;
  date_of_birth: string;
  aadhaar_number: string;
  address: string;
  city: string;
  state_name: string;
  pincode: string;
  branch_name: string;
  kyc_status: string;
  account_status: string;
  account_created_date: string;
  approved_date: string;
  remarks: string;
};

type InvestorDashboardResponse = {
  summary: DashboardSummary;
  growth: GrowthItem[];
  portfolio_split: PortfolioSplitItem[];
  recent_investments: RecentInvestment[];
  investor: Investor;
};

const formatINR = (value: string | number) => {
  const number = Number(value) || 0;
  return '₹' + number.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  });
};

const formatDate = (date: string) => {
  if (!date) {
    return '-';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const Sparkline = ({
  data,
  color,
  width = 110,
  height = 24,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) => {
  if (!data.length) {
    return null;
  }

  if (data.length === 1) {
    data = [data[0], data[0]];
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map(
      (value, index) =>
        `${index * step},${
          height - ((value - min) / range) * height
        }`,
    )
    .join(' ');

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const LineChart = ({
  data,
  width = 300,
  height = 80,
}: {
  data: number[];
  width?: number;
  height?: number;
}) => {
  if (!data.length) {
    return null;
  }

  if (data.length === 1) {
    data = [data[0], data[0]];
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const coords = data.map((value, index) => ({
    x: index * step,
    y: height - ((value - min) / range) * (height - 10) - 5,
  }));

  const points = coords.map(c => `${c.x},${c.y}`).join(' ');
  const last = coords[coords.length - 1];

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polyline
        points={points}
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.slice(0, -1).map((c, index) => (
        <Circle
          key={index}
          cx={c.x}
          cy={c.y}
          r={2.5}
          fill="rgba(255,255,255,0.4)"
        />
      ))}

      <Circle cx={last.x} cy={last.y} r={5} fill="#fff" />
    </Svg>
  );
};

const Donut = ({
  data,
  size = 96,
  strokeWidth = 14,
}: {
  data: PortfolioSplitItem[];
  size?: number;
  strokeWidth?: number;
}) => {
  if (!data.length) {
    return null;
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offsetAcc = 0;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((item, index) => {
        const percentage = Number(
          item.percentage ?? item.pct ?? 0,
        );

        const dash = (percentage / 100) * circumference;

        const color =
          item.color ??
          [NAVY, PURPLE, GREEN, ORANGE][index % 4];

        const segment = (
          <Circle
            key={`${item.label}-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${
              circumference - dash
            }`}
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

const InvestorDashboardScreen = ({navigation}: any) => {
  const [dashboard, setDashboard] =
    useState<InvestorDashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * IMPORTANT:
       * Use the SAME token key that your investor login stores.
       *
       * If your login stores it under another key, change this line.
       */
      const token = await AsyncStorage.getItem('access_token');

if (!token) {
  setError('Please login to continue.');
  setLoading(false);
  return;
}

      const response = await fetch(
        `${API_BASE_URL}/investor/dashboard`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

if (response.status === 401) {
  await AsyncStorage.removeItem('access_token');

  setDashboard(null);
  setError('Your session has expired. Please login again.');
  setLoading(false);

  return;
}

      if (!response.ok) {
        throw new Error(
          `Dashboard request failed: ${response.status}`,
        );
      }

      const data: InvestorDashboardResponse =
        await response.json();

      setDashboard(data);
    } catch (err) {
      console.error('Investor dashboard error:', err);
      setError(
        'Unable to load your dashboard. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  /*
   * Refresh every time the investor comes back to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  if (loading && !dashboard) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader subtitle="Investment Portal" />

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={PRIMARY} />

          <Text
            style={{
              marginTop: 12,
              color: NAVY,
              fontSize: 15,
            }}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !dashboard) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader subtitle="Investment Portal" />

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
          <Icon
            name="alert-circle-outline"
            size={48}
            color="#DC2626"
          />

          <Text
            style={{
              marginTop: 12,
              color: NAVY,
              fontSize: 16,
              textAlign: 'center',
            }}>
            {error}
          </Text>

          <TouchableOpacity
            onPress={fetchDashboard}
            style={{
              marginTop: 20,
              backgroundColor: PRIMARY,
              paddingHorizontal: 25,
              paddingVertical: 12,
              borderRadius: 8,
            }}>
            <Text
              style={{
                color: '#fff',
                fontWeight: '700',
              }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!dashboard) {
    return null;
  }

  const {summary, growth, portfolio_split, recent_investments, investor} =
    dashboard;

  const growthSeries = growth.map(item =>
    Number(item.investment_amount) || 0,
  );

  const growthMonths = growth.map(item => item.month_name);

  /*
   * The API currently doesn't provide historical values for
   * the four small sparkline cards.
   *
   * Therefore we don't use the old fake hardcoded history.
   */
  const totalInvestedSparkline = [
    0,
    Number(summary.total_invested) || 0,
  ];

  const interestSparkline = [
    0,
    Number(summary.interest_earned) || 0,
  ];

  const payoutSparkline = [
    0,
    Number(summary.monthly_payout) || 0,
  ];

  const bondSparkline = [
    0,
    Number(summary.active_bonds) || 0,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Investment Portal" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroTitle}>
                Good morning, {investor.investor_name}! 👋
              </Text>

              <Text style={styles.heroSubtitle}>
                Here's your investment portfolio overview for today
              </Text>
            </View>

            <View style={styles.heroBadge}>
              <Icon
                name="chart-line"
                size={16}
                color="#fff"
              />
            </View>
          </View>

          <Text style={styles.heroLabel}>
            TOTAL PORTFOLIO VALUE
          </Text>

          <Text style={styles.heroValue}>
            {formatINR(summary.portfolio_value)}
          </Text>

          <View style={styles.heroDeltaRow}>
            <Icon
              name="shield-check-outline"
              size={13}
              color="#D9F99D"
            />

            <Text style={styles.heroDeltaText}>
              {investor.kyc_status} • {investor.account_status}
            </Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statGrid}>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#DBEAFE'},
              ]}>
              <Icon
                name="wallet-outline"
                size={16}
                color={PRIMARY}
              />
            </View>

            <Text style={styles.statGridLabel}>
              TOTAL INVESTED
            </Text>

            <Text style={styles.statGridValue}>
              {formatINR(summary.total_invested)}
            </Text>

            <Text style={styles.statGridDeltaGood}>
              Current investment
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline
                data={totalInvestedSparkline}
                color={PRIMARY}
              />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#DCFCE7'},
              ]}>
              <Icon
                name="trending-up"
                size={16}
                color={GREEN}
              />
            </View>

            <Text style={styles.statGridLabel}>
              INTEREST EARNED
            </Text>

            <Text style={styles.statGridValue}>
              {formatINR(summary.interest_earned)}
            </Text>

            <Text style={styles.statGridDeltaGood}>
              Earned interest
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline
                data={interestSparkline}
                color={GREEN}
              />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#FEF3C7'},
              ]}>
              <Icon
                name="calendar-month-outline"
                size={16}
                color={ORANGE}
              />
            </View>

            <Text style={styles.statGridLabel}>
              MONTHLY PAYOUT
            </Text>

            <Text style={styles.statGridValue}>
              {formatINR(summary.monthly_payout)}
            </Text>

            <Text style={styles.statGridDeltaGood}>
              Monthly payout
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline
                data={payoutSparkline}
                color={ORANGE}
              />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#EDE9FE'},
              ]}>
              <Icon
                name="bank-outline"
                size={16}
                color={PURPLE}
              />
            </View>

            <Text style={styles.statGridLabel}>
              ACTIVE BONDS
            </Text>

            <Text style={styles.statGridValue}>
              {summary.active_bonds}
            </Text>

            <Text style={styles.statGridDeltaNeutral}>
              Active investments
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline
                data={bondSparkline}
                color={PRIMARY}
              />
            </View>
          </View>

        </View>

        {/* INVESTMENT GROWTH */}
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioTopRow}>
            <Text style={styles.portfolioLabel}>
              INVESTMENT GROWTH
            </Text>

            <View style={styles.trendBadge}>
              <Icon
                name="trending-up"
                size={12}
                color={GREEN}
              />

              <Text style={styles.trendText}>
                {growth.length} months
              </Text>
            </View>
          </View>

          <Text style={styles.portfolioValue}>
            {formatINR(summary.portfolio_value)}
          </Text>

          <View style={styles.lineChartWrap}>
            <LineChart
              data={growthSeries}
              width={296}
              height={80}
            />
          </View>

          <View style={styles.lineChartMonthRow}>
            {growthMonths.map(month => (
              <Text
                key={month}
                style={styles.lineChartMonthText}>
                {month}
              </Text>
            ))}
          </View>

          <View style={styles.portfolioBtnRow}>
            <TouchableOpacity
              style={styles.investBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('InvestNow')
              }>
              <Icon
                name="plus-circle-outline"
                size={16}
                color="#fff"
              />

              <Text style={styles.investBtnText}>
                Invest Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('MyInvestments')
              }>
              <Icon
                name="briefcase-outline"
                size={16}
                color="#fff"
              />

              <Text style={styles.withdrawBtnText}>
                My Investments
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PORTFOLIO DISTRIBUTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Portfolio Distribution
          </Text>
        </View>

        <View style={styles.distributionCard}>
          {portfolio_split.length === 0 ? (
            <View
              style={{
                padding: 25,
                alignItems: 'center',
              }}>
              <Icon
                name="chart-donut"
                size={40}
                color="#9CA3AF"
              />

              <Text
                style={{
                  marginTop: 10,
                  color: '#6B7280',
                  fontSize: 14,
                }}>
                No portfolio distribution available
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.distributionBody}>
                <View style={styles.donutWrap}>
                  <Donut
                    data={portfolio_split}
                    size={96}
                  />

                  <View
                    style={[
                      styles.donutCenterWrap,
                      {
                        width: 96,
                        height: 96,
                      },
                    ]}>
                    <Text
                      style={styles.donutCenterValue}>
                      {formatINR(
                        summary.portfolio_value,
                      )}
                    </Text>

                    <Text
                      style={styles.donutCenterLabel}>
                      Total Value
                    </Text>
                  </View>
                </View>

                <View style={styles.legendWrap}>
                  {portfolio_split.map(
                    (item, index) => {
                      const percentage = Number(
                        item.percentage ??
                          item.pct ??
                          0,
                      );

                      const amount =
                        (percentage / 100) *
                        Number(
                          summary.portfolio_value,
                        );

                      return (
                        <View
                          key={`${item.label}-${index}`}
                          style={styles.legendRow}>

                          <View
                            style={
                              styles.legendLabelRow
                            }>
                            <View
                              style={[
                                styles.legendDot,
                                {
                                  backgroundColor:
                                    item.color ??
                                    [
                                      NAVY,
                                      PURPLE,
                                      GREEN,
                                      ORANGE,
                                    ][
                                      index % 4
                                    ],
                                },
                              ]}
                            />

                            <Text
                              style={
                                styles.legendLabel
                              }>
                              {item.label}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.legendValueWrap
                            }>
                            <Text
                              style={
                                styles.legendPct
                              }>
                              {percentage}%
                            </Text>

                            <Text
                              style={
                                styles.legendAmount
                              }>
                              {formatINR(amount)}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsRow}>
                <Text style={styles.viewDetailsText}>
                  View Full Breakdown
                </Text>

                <Icon
                  name="chevron-right"
                  size={16}
                  color={PRIMARY}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* RECENT INVESTMENTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Recent Investments
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyInvestments')
            }>
            <Text style={styles.viewAllLink}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recent_investments.length === 0 ? (
          <View
            style={{
              padding: 25,
              alignItems: 'center',
            }}>
            <Text style={{color: '#6B7280'}}>
              No investments found
            </Text>
          </View>
        ) : (
          recent_investments.map(inv => (
            <View
              key={inv.investment_id}
              style={[
                styles.bondCard,
                {
                  borderLeftColor:
                    inv.investment_status ===
                    'Active'
                      ? GREEN
                      : PURPLE,
                },
              ]}>

              <View style={styles.bondTopRow}>
                <View style={styles.bondIconBox}>
                  <Icon
                    name="file-certificate-outline"
                    size={18}
                    color="#0E2A5E"
                  />
                </View>

                <View
                  style={styles.bondTitleWrap}>
                  <Text style={styles.bondId}>
                    {inv.investment_id}
                  </Text>

                  <Text
                    style={styles.bondType}>
                    {Number(
                      inv.interest_rate,
                    ).toFixed(2)}
                    % p.a. •{' '}
                    {formatINR(
                      inv.investment_amount,
                    )}
                  </Text>

                  <Text
                    style={{
                      marginTop: 3,
                      fontSize: 11,
                      color: '#6B7280',
                    }}>
                    Bond: {inv.bond_id}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    inv.investment_status !==
                      'Active' &&
                      styles.statusBadgeMuted,
                  ]}>
                  <Text
                    style={[
                      styles.statusBadgeText,
                      inv.investment_status !==
                        'Active' &&
                        styles.statusBadgeTextMuted,
                    ]}>
                    {inv.investment_status}
                  </Text>
                </View>
              </View>

              <View style={styles.bondDivider} />

              <View
                style={styles.bondBottomRow}>
                <View>
                  <Text
                    style={styles.bondMetaLabel}>
                    Invested On
                  </Text>

                  <Text
                    style={styles.bondMetaValue}>
                    {formatDate(
                      inv.investment_date,
                    )}
                  </Text>
                </View>

                <View
                  style={{
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={styles.bondMetaLabel}>
                    Amount
                  </Text>

                  <Text
                    style={styles.bondReturnValue}>
                    {formatINR(
                      inv.investment_amount,
                    )}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* MATURITY */}
        {summary.next_maturity_date && (
          <View
            style={{
              marginTop: 15,
              padding: 16,
              backgroundColor: '#EFF6FF',
              borderRadius: 12,
            }}>
            <Text
              style={{
                fontSize: 12,
                color: '#64748B',
                fontWeight: '700',
              }}>
              NEXT MATURITY
            </Text>

            <Text
              style={{
                marginTop: 5,
                fontSize: 18,
                fontWeight: '700',
                color: NAVY,
              }}>
              {formatDate(
                summary.next_maturity_date,
              )}
            </Text>

            {summary.days_to_maturity !==
              null && (
              <Text
                style={{
                  marginTop: 3,
                  color: '#475569',
                }}>
                {summary.days_to_maturity} days remaining
              </Text>
            )}
          </View>
        )}

        {/* NOTIFICATIONS
            Removed because /investor/dashboard does not return
            notifications. Do not show fake notifications.
        */}

        <View
          style={{
            height: 30,
          }}
        />
      </ScrollView>

      <BottomTabBar
        active="Home"
        navigation={navigation}
        investorId={investor.investor_id}
      />
    </SafeAreaView>
  );
};

export default InvestorDashboardScreen;