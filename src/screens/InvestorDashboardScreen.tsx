import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle, Polyline} from 'react-native-svg';
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
  GRAY,
} from '../styles/InvestorDashboardScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import {investorService, PortfolioSplitItem} from '../services/investorService';

// ---------------------------------------------------------
// HELPERS (ALIGNED WITH WEB SOURCE OF TRUTH)
// ---------------------------------------------------------

const getValue = (object: any, keys: string[], fallback: any = 0) => {
  if (!object) return fallback;

  for (const key of keys) {
    if (
      object[key] !== undefined &&
      object[key] !== null &&
      object[key] !== ''
    ) {
      return object[key];
    }
  }

  return fallback;
};

const normalizeArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;

  if (value && typeof value === 'object') {
    return [value];
  }

  return [];
};

const formatINR = (value: string | number) => {
  const number = Number(value) || 0;
  return (
    '₹' +
    Math.round(number).toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })
  );
};

const formatDate = (date: string | null | undefined) => {
  if (!date) {
    return '-';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return String(date);
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
        `${index * step},${height - ((value - min) / range) * height}`,
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
        const percentage = Number(item.percentage ?? item.pct ?? 0);

        const dash = (percentage / 100) * circumference;

        const color =
          item.color ?? [NAVY, PURPLE, GREEN, ORANGE][index % 4];

        const segment = (
          <Circle
            key={`${item.label}-${index}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
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

const InvestorDashboardScreen = ({navigation}: any) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await investorService.getDashboard();
      setDashboard(data);
    } catch (err: any) {
      console.error('Investor dashboard error:', err);
      setError(
        err?.message || 'Unable to load your dashboard. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Refresh every time the investor comes back to this screen.
   */
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const resolveNumericInvestmentId = async (
    investment: any,
  ): Promise<number | null> => {
    if (!investment) return null;

    const rawId =
      investment?.id ??
      investment?.investmentId ??
      investment?.investment_id ??
      null;

    const numericId = Number(rawId);
    if (Number.isInteger(numericId) && numericId > 0) {
      return numericId;
    }

    const displayInvestmentId =
      investment?.investment_id ??
      investment?.investmentId ??
      investment?.bond_number ??
      '';

    try {
      const list = await investorService.getMyInvestments();
      const matched = list.find((item: any) => {
        const itemInvestmentId =
          item?.investment_id ?? item?.investmentId ?? '';
        return (
          displayInvestmentId &&
          String(itemInvestmentId) === String(displayInvestmentId)
        );
      });

      const matchedId = Number(matched?.id);
      if (Number.isInteger(matchedId) && matchedId > 0) {
        return matchedId;
      }
    } catch (e) {
      console.warn('Could not resolve numeric investment ID:', e);
    }

    return null;
  };

  // -------------------------------------------------------
  // DATA NORMALIZATION (MATCHING WEB SOURCE OF TRUTH)
  // -------------------------------------------------------

  const dataRoot = dashboard?.data ?? dashboard;

  const summary = useMemo(() => {
    const value = dataRoot?.summary ?? {};
    return Array.isArray(value) ? value[0] || {} : value;
  }, [dataRoot]);

  const investor = useMemo(() => {
    const value = dataRoot?.investor ?? {};
    return Array.isArray(value) ? value[0] || {} : value;
  }, [dataRoot]);

  const growth = useMemo(
    () => normalizeArray(dataRoot?.growth),
    [dataRoot],
  );

  const portfolioSplit = useMemo(
    () =>
      normalizeArray(
        dataRoot?.portfolio_split ?? dataRoot?.portfolioSplit,
      ),
    [dataRoot],
  );

  const recentInvestments = useMemo(
    () =>
      normalizeArray(
        dataRoot?.recent_investments ?? dataRoot?.recentInvestments,
      ),
    [dataRoot],
  );

  // -------------------------------------------------------
  // SUMMARY FIELDS
  // -------------------------------------------------------

  const totalInvestment = Number(
    getValue(
      summary,
      [
        'total_investment',
        'total_investments',
        'total_invested',
        'investment_amount',
        'principal',
        'total_principal',
      ],
      0,
    ),
  );

  const earnedInterest = Number(
    getValue(
      summary,
      [
        'earned_interest',
        'interest_earned',
        'total_interest',
        'interest_amount',
      ],
      0,
    ),
  );

  const activeInvestment = Number(
    getValue(
      summary,
      [
        'active_investment',
        'active_investments',
        'active_amount',
        'total_active',
      ],
      0,
    ),
  );

  const activeCount = Number(
    getValue(
      summary,
      ['active_count', 'active_investment_count', 'active_bonds'],
      0,
    ),
  );

  const monthlyPayout = Number(
    getValue(
      summary,
      ['monthly_payout', 'monthly_interest', 'monthly_return', 'payout'],
      0,
    ),
  );

  const portfolioValue =
    Number(
      getValue(summary, ['portfolio_value', 'current_portfolio_value'], 0),
    ) || totalInvestment + earnedInterest;

  const maturityAmount = Number(
    getValue(
      summary,
      [
        'maturity_amount',
        'total_maturity',
        'expected_maturity',
        'maturity_value',
      ],
      0,
    ),
  );

  const investmentCount = Number(
    getValue(
      summary,
      [
        'investment_count',
        'total_investment_count',
        'total_investments_count',
        'count',
      ],
      0,
    ),
  );

  const nextMaturityDate = getValue(
    summary,
    ['next_maturity_date', 'maturity_date'],
    null,
  );

  const daysToMaturity = getValue(
    summary,
    ['days_to_maturity', 'days_remaining'],
    null,
  );

  // -------------------------------------------------------
  // INVESTOR INFORMATION
  // -------------------------------------------------------

  const displayName = String(
    getValue(investor, ['full_name', 'investor_name', 'name'], 'Investor'),
  );

  const investorId = String(
    getValue(investor, ['investor_id', 'login_id'], ''),
  );

  const kycStatus = String(
    getValue(investor, ['kyc_status', 'kyc_status_name'], 'Verified'),
  );

  const accountStatus = String(
    getValue(investor, ['account_status', 'status'], 'Active'),
  );

  // -------------------------------------------------------
  // GROWTH SERIES
  // -------------------------------------------------------

  const growthValues = growth.map((item, index) => ({
    label: String(
      getValue(
        item,
        ['month', 'month_name', 'period', 'label', 'year_month'],
        `Month ${index + 1}`,
      ),
    ),
    value: Number(
      getValue(
        item,
        [
          'amount',
          'value',
          'investment_amount',
          'total_amount',
          'total_investment',
          'portfolio_value',
        ],
        0,
      ),
    ),
  }));

  const growthSeries =
    growthValues.length > 0
      ? growthValues.map(item => item.value)
      : [0, totalInvestment];

  const growthMonths =
    growthValues.length > 0 ? growthValues.map(item => item.label) : [];

  // Sparklines for 4 summary cards
  const totalInvestedSparkline = [0, totalInvestment];
  const interestSparkline = [0, earnedInterest];
  const payoutSparkline = [0, monthlyPayout];
  const bondSparkline = [0, activeCount || investmentCount];

  // -------------------------------------------------------
  // PORTFOLIO DISTRIBUTION
  // -------------------------------------------------------

  const donutColors = [NAVY, PRIMARY, GREEN, ORANGE, PURPLE];

  const portfolioItems: PortfolioSplitItem[] = portfolioSplit.map(
    (item, index) => {
      const label = String(
        getValue(
          item,
          [
            'status_name',
            'investment_status',
            'status',
            'category',
            'label',
            'name',
          ],
          `Investment ${index + 1}`,
        ),
      );

      const amount = Number(
        getValue(
          item,
          ['amount', 'investment_amount', 'total_amount', 'value'],
          0,
        ),
      );

      const rawPct = Number(
        getValue(item, ['percentage', 'percent', 'share'], 0),
      );

      const percentage =
        rawPct > 0
          ? rawPct
          : totalInvestment > 0
          ? (amount / totalInvestment) * 100
          : 0;

      return {
        label,
        amount,
        percentage: Math.round(percentage),
        color: item.color ?? donutColors[index % donutColors.length],
      };
    },
  );

  // -------------------------------------------------------
  // RECENT INVESTMENTS
  // -------------------------------------------------------

  const mappedRecentInvestments = recentInvestments.map(
    (investment, index) => {
      const itemInvestmentId = String(
        getValue(
          investment,
          ['investment_id', 'investmentId', 'bond_number', 'id'],
          `INV-${index + 1}`,
        ),
      );

      const amount = Number(
        getValue(
          investment,
          ['investment_amount', 'amount', 'principal'],
          0,
        ),
      );

      const rate = getValue(
        investment,
        ['interest_rate', 'rate', 'interest'],
        0,
      );

      const investedOn = getValue(
        investment,
        ['investment_date', 'invested_on', 'invested_date', 'created_at'],
        null,
      );

      const status = String(
        getValue(
          investment,
          ['investment_status', 'status_name', 'status'],
          'Pending',
        ),
      );

      const bondNumber = String(
        getValue(
          investment,
          ['bond_number', 'bond_id', 'bondNumber'],
          '—',
        ),
      );

      return {
        raw: investment,
        investmentId: itemInvestmentId,
        amount,
        rate,
        investedOn,
        status,
        bondNumber,
      };
    },
  );

  const handleViewInvestment = async (invItem: any) => {
    setSelectedInvestment(invItem);
    try {
      const numericId = await resolveNumericInvestmentId(invItem.raw);
      if (numericId) {
        const detail = await investorService.getInvestmentDetails(numericId);
        if (detail) {
          setSelectedInvestment((prev: any) =>
            prev
              ? {
                  ...prev,
                  detailData: detail,
                }
              : null,
          );
        }
      }
    } catch (e) {
      console.log('Could not fetch investment details:', e);
    }
  };

  const handleOpenBond = async (invItem: any) => {
    try {
      const numericId = await resolveNumericInvestmentId(invItem.raw);
      if (numericId) {
        navigation.navigate('BondDetails', {
          bondId: numericId,
          bondDisplayId:
            invItem.bondNumber !== '—'
              ? invItem.bondNumber
              : invItem.investmentId,
          investorId: investorId,
        });
      } else {
        navigation.navigate('MyInvestments', {
          investorId: investorId,
        });
      }
    } catch {
      navigation.navigate('MyInvestments', {
        investorId: investorId,
      });
    }
  };

  const handleDownloadBond = async (invItem: any) => {
    try {
      const numericId = await resolveNumericInvestmentId(invItem.raw);
      if (numericId) {
        navigation.navigate('BondDetails', {
          bondId: numericId,
          bondDisplayId:
            invItem.bondNumber !== '—'
              ? invItem.bondNumber
              : invItem.investmentId,
          investorId: investorId,
        });
      } else {
        navigation.navigate('MyInvestments', {
          investorId: investorId,
        });
      }
    } catch {
      navigation.navigate('MyInvestments', {
        investorId: investorId,
      });
    }
  };

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
          <Icon name="alert-circle-outline" size={48} color="#DC2626" />

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
                Good morning, {displayName}! 👋
              </Text>

              <Text style={styles.heroSubtitle}>
                Here's your investment portfolio overview for today
              </Text>
            </View>

            <View style={styles.heroBadge}>
              <Icon name="chart-line" size={16} color="#fff" />
            </View>
          </View>

          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>

          <Text style={styles.heroValue}>{formatINR(portfolioValue)}</Text>

          <View style={styles.heroDeltaRow}>
            <Icon name="shield-check-outline" size={13} color="#D9F99D" />

            <Text style={styles.heroDeltaText}>
              {kycStatus} • {accountStatus}
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
              <Icon name="wallet-outline" size={16} color={PRIMARY} />
            </View>

            <Text style={styles.statGridLabel}>TOTAL INVESTED</Text>

            <Text style={styles.statGridValue}>
              {formatINR(totalInvestment)}
            </Text>

            <Text style={styles.statGridDeltaGood}>
              {investmentCount > 0
                ? `${investmentCount} investments`
                : 'Current investment'}
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline data={totalInvestedSparkline} color={PRIMARY} />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#DCFCE7'},
              ]}>
              <Icon name="trending-up" size={16} color={GREEN} />
            </View>

            <Text style={styles.statGridLabel}>INTEREST EARNED</Text>

            <Text style={styles.statGridValue}>
              {formatINR(earnedInterest)}
            </Text>

            <Text style={styles.statGridDeltaGood}>Current earnings</Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline data={interestSparkline} color={GREEN} />
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

            <Text style={styles.statGridLabel}>MONTHLY PAYOUT</Text>

            <Text style={styles.statGridValue}>
              {formatINR(monthlyPayout)}
            </Text>

            <Text style={styles.statGridDeltaGood}>Monthly return</Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline data={payoutSparkline} color={ORANGE} />
            </View>
          </View>

          <View style={styles.statGridCard}>
            <View
              style={[
                styles.statGridIconWrap,
                {backgroundColor: '#EDE9FE'},
              ]}>
              <Icon name="bank-outline" size={16} color={PURPLE} />
            </View>

            <Text style={styles.statGridLabel}>ACTIVE BONDS</Text>

            <Text style={styles.statGridValue}>{activeCount}</Text>

            <Text style={styles.statGridDeltaNeutral}>
              {activeInvestment > 0
                ? formatINR(activeInvestment)
                : 'Active investments'}
            </Text>

            <View style={styles.statGridSparkWrap}>
              <Sparkline data={bondSparkline} color={PRIMARY} />
            </View>
          </View>
        </View>

        {/* INVESTMENT GROWTH */}
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioTopRow}>
            <Text style={styles.portfolioLabel}>INVESTMENT GROWTH</Text>

            <View style={styles.trendBadge}>
              <Icon name="trending-up" size={12} color={GREEN} />

              <Text style={styles.trendText}>
                {growthSeries.length} months
              </Text>
            </View>
          </View>

          <Text style={styles.portfolioValue}>
            {formatINR(portfolioValue)}
          </Text>

          <View style={styles.lineChartWrap}>
            <LineChart data={growthSeries} width={296} height={80} />
          </View>

          {growthMonths.length > 0 && (
            <View style={styles.lineChartMonthRow}>
              {growthMonths.map((month, idx) => (
                <Text
                  key={`${month}-${idx}`}
                  style={styles.lineChartMonthText}>
                  {month}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.portfolioBtnRow}>
            <TouchableOpacity
              style={styles.investBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('InvestNow', {investorId})
              }>
              <Icon name="plus-circle-outline" size={16} color="#fff" />

              <Text style={styles.investBtnText}>Invest Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate('MyInvestments', {investorId})
              }>
              <Icon name="briefcase-outline" size={16} color="#fff" />

              <Text style={styles.withdrawBtnText}>My Investments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PORTFOLIO DISTRIBUTION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Portfolio Distribution</Text>
        </View>

        <View style={styles.distributionCard}>
          {portfolioItems.length === 0 ? (
            <View
              style={{
                padding: 25,
                alignItems: 'center',
              }}>
              <Icon name="chart-donut" size={40} color="#9CA3AF" />

              <Text
                style={{
                  marginTop: 10,
                  color: '#6B7280',
                  fontSize: 14,
                }}>
                No portfolio data
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.distributionBody}>
                <View style={styles.donutWrap}>
                  <Donut data={portfolioItems} size={96} />

                  <View
                    style={[
                      styles.donutCenterWrap,
                      {
                        width: 96,
                        height: 96,
                      },
                    ]}>
                    <Text style={styles.donutCenterValue}>
                      {formatINR(totalInvestment || portfolioValue)}
                    </Text>

                    <Text style={styles.donutCenterLabel}>Portfolio</Text>
                  </View>
                </View>

                <View style={styles.legendWrap}>
                  {portfolioItems.map((item, index) => (
                    <View
                      key={`${item.label}-${index}`}
                      style={styles.legendRow}>
                      <View style={styles.legendLabelRow}>
                        <View
                          style={[
                            styles.legendDot,
                            {
                              backgroundColor:
                                item.color ??
                                donutColors[index % donutColors.length],
                            },
                          ]}
                        />

                        <Text style={styles.legendLabel}>{item.label}</Text>
                      </View>

                      <View style={styles.legendValueWrap}>
                        <Text style={styles.legendPct}>
                          {item.percentage}%
                        </Text>

                        {typeof item.amount === 'number' && item.amount > 0 && (
                          <Text style={styles.legendAmount}>
                            {formatINR(item.amount)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewDetailsRow}
                onPress={() =>
                  navigation.navigate('MyInvestments', {investorId})
                }>
                <Text style={styles.viewDetailsText}>
                  View Full Breakdown
                </Text>

                <Icon name="chevron-right" size={16} color={PRIMARY} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* RECENT INVESTMENTS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Investments</Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('MyInvestments', {investorId})
            }>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {mappedRecentInvestments.length === 0 ? (
          <View
            style={{
              padding: 25,
              alignItems: 'center',
            }}>
            <Text style={{color: '#6B7280'}}>No investments yet</Text>
          </View>
        ) : (
          mappedRecentInvestments.map((inv, index) => {
            const statusLower = inv.status.toLowerCase();
            const isActive =
              statusLower.includes('active') ||
              statusLower.includes('approved');
            const isPending =
              statusLower.includes('pending') ||
              statusLower.includes('approval');

            return (
              <View
                key={`${inv.investmentId}-${index}`}
                style={[
                  styles.bondCard,
                  {
                    borderLeftColor: isActive
                      ? GREEN
                      : isPending
                      ? ORANGE
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

                  <View style={styles.bondTitleWrap}>
                    <Text style={styles.bondId}>{inv.investmentId}</Text>

                    <Text style={styles.bondType}>
                      {Number(inv.rate)}% p.a. • {formatINR(inv.amount)}
                    </Text>

                    {inv.bondNumber !== '—' && (
                      <Text
                        style={{
                          marginTop: 3,
                          fontSize: 11,
                          color: '#6B7280',
                        }}>
                        Bond: {inv.bondNumber}
                      </Text>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      !isActive && styles.statusBadgeMuted,
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        !isActive && styles.statusBadgeTextMuted,
                      ]}>
                      {inv.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.bondDivider} />

                <View style={styles.bondBottomRow}>
                  <View>
                    <Text style={styles.bondMetaLabel}>Invested On</Text>

                    <Text style={styles.bondMetaValue}>
                      {formatDate(inv.investedOn)}
                    </Text>
                  </View>

                  <View
                    style={{
                      alignItems: 'flex-end',
                    }}>
                    <Text style={styles.bondMetaLabel}>Amount</Text>

                    <Text style={styles.bondReturnValue}>
                      {formatINR(inv.amount)}
                    </Text>
                  </View>
                </View>

                {/* ACTIONS */}
                <View style={styles.bondActionDivider} />

                <View style={styles.bondActionRow}>
                  <Text style={styles.bondActionTitle}>Actions</Text>

                  {isActive ? (
                    <View style={styles.bondActionButtonsWrap}>
                      <TouchableOpacity
                        style={[
                          styles.bondActionBtn,
                          styles.bondActionBtnPrimary,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleViewInvestment(inv)}>
                        <Icon
                          name="eye-outline"
                          size={15}
                          color={PRIMARY}
                        />
                        <Text
                          style={[
                            styles.bondActionBtnText,
                            styles.bondActionBtnTextPrimary,
                          ]}>
                          View
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.bondActionBtn}
                        activeOpacity={0.7}
                        onPress={() => handleDownloadBond(inv)}>
                        <Icon
                          name="download-outline"
                          size={15}
                          color="#374151"
                        />
                        <Text style={styles.bondActionBtnText}>
                          Download Bond
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : isPending ? (
                    <View style={styles.bondActionButtonsWrap}>
                      <TouchableOpacity
                        style={[
                          styles.bondActionBtn,
                          styles.bondActionBtnPrimary,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleViewInvestment(inv)}>
                        <Icon
                          name="eye-outline"
                          size={15}
                          color={PRIMARY}
                        />
                        <Text
                          style={[
                            styles.bondActionBtnText,
                            styles.bondActionBtnTextPrimary,
                          ]}>
                          View
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.bondPendingWrap}>
                        <Icon
                          name="clock-outline"
                          size={14}
                          color="#D97706"
                        />
                        <Text style={styles.bondActionPendingText}>
                          Waiting for Admin Approval
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.bondActionButtonsWrap}>
                      <TouchableOpacity
                        style={[
                          styles.bondActionBtn,
                          styles.bondActionBtnPrimary,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleViewInvestment(inv)}>
                        <Icon
                          name="eye-outline"
                          size={15}
                          color={PRIMARY}
                        />
                        <Text
                          style={[
                            styles.bondActionBtnText,
                            styles.bondActionBtnTextPrimary,
                          ]}>
                          View
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.bondPendingWrap}>
                        <Icon
                          name="information-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.bondActionMutedText}>
                          {inv.status}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* MATURITY */}
        {(nextMaturityDate || maturityAmount > 0) && (
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
              {nextMaturityDate
                ? formatDate(nextMaturityDate)
                : maturityAmount > 0
                ? formatINR(maturityAmount)
                : '0 Days'}
            </Text>

            {daysToMaturity !== null && daysToMaturity !== undefined ? (
              <Text
                style={{
                  marginTop: 3,
                  color: '#475569',
                }}>
                {daysToMaturity} days remaining
              </Text>
            ) : maturityAmount > 0 ? (
              <Text
                style={{
                  marginTop: 3,
                  color: '#475569',
                }}>
                Expected maturity: {formatINR(maturityAmount)}
              </Text>
            ) : null}
          </View>
        )}

        <View
          style={{
            height: 30,
          }}
        />
      </ScrollView>

      {/* INVESTMENT DETAILS MODAL */}
      <Modal
        visible={!!selectedInvestment}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedInvestment(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedInvestment && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {selectedInvestment.investmentId}
                    </Text>
                    {selectedInvestment.bondNumber !== '—' && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: GRAY,
                          marginTop: 2,
                          fontWeight: '600',
                        }}>
                        Bond: {selectedInvestment.bondNumber}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedInvestment(null)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Icon name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {[
                  ['Status', selectedInvestment.status],
                  ['Principal Amount', formatINR(selectedInvestment.amount)],
                  [
                    'Interest Rate',
                    `${Number(selectedInvestment.rate)}% p.a.`,
                  ],
                  [
                    'Invested On',
                    formatDate(
                      selectedInvestment.detailData?.investment_date ??
                        selectedInvestment.investedOn,
                    ),
                  ],
                  ...(selectedInvestment.detailData?.maturity_date
                    ? [
                        [
                          'Matures On',
                          formatDate(
                            selectedInvestment.detailData.maturity_date,
                          ),
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.detailData?.tenure_months
                    ? [
                        [
                          'Tenure',
                          `${selectedInvestment.detailData.tenure_months} months`,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.detailData?.expected_interest_amount
                    ? [
                        [
                          'Expected Interest',
                          formatINR(
                            selectedInvestment.detailData
                              .expected_interest_amount,
                          ),
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.detailData?.maturity_amount
                    ? [
                        [
                          'Maturity Amount',
                          formatINR(
                            selectedInvestment.detailData.maturity_amount,
                          ),
                        ],
                      ]
                    : []),
                ].map(([label, value]) => (
                  <View style={styles.modalRow} key={label}>
                    <Text style={styles.modalRowLabel}>{label}</Text>
                    <Text style={styles.modalRowValue}>{value}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => setSelectedInvestment(null)}>
                  <Text style={styles.modalConfirmBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomTabBar
        active="Home"
        navigation={navigation}
        investorId={investorId}
      />
    </SafeAreaView>
  );
};

export default InvestorDashboardScreen;