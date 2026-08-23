import React, {useCallback, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {useAppData, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminDashboardScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';

const API_BASE_URL = 'http://187.52.115.32:8000';

const TENURE_OPTIONS = [
  {months: 6, rate: 11},
  {months: 12, rate: 12},
  {months: 24, rate: 12.5},
  {months: 36, rate: 13},
];

/* =========================================================
   TYPES FOR ADMIN DASHBOARD API
========================================================= */

type DashboardSummary = {
  total_investors: number;
  pending_kyc: number;
  active_investments: number;
  total_aum: string | number;
  monthly_interest_due: string | number;
  pending_approvals: number;
  closed_investments: number;
  branch_count: number;
};

type InvestorGrowthItem = {
  month_name: string;
  investor_count: number;
};

type MonthlyInvestmentTrendItem = {
  month_name: string;
  investment_amount: string | number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  detail?: string;
};

/* =========================================================
   API HELPER
========================================================= */

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');

  if (!token) {
    throw new Error(
      'Your session has expired. Please login again.',
    );
  }

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const fetchDashboardApi = async <T,>(
  endpoint: string,
): Promise<T> => {
  const headers = await getAuthHeaders();

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method: 'GET',
      headers,
    },
  );

  const responseText = await response.text();

  let data: any = {};

  try {
    data = responseText
      ? JSON.parse(responseText)
      : {};
  } catch {
    data = {
      detail: responseText,
    };
  }

  console.log(
    `Dashboard API ${endpoint} response:`,
    data,
  );

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Dashboard API failed with status ${response.status}`,
    );
  }

  if (data?.success === false) {
    throw new Error(
      data?.message ||
        data?.detail ||
        'Dashboard API returned an unsuccessful response.',
    );
  }

  return data?.data as T;
};

/* =========================================================
   BADGE STYLES
========================================================= */

const kycBadgeStyle = (
  status: 'Approved' | 'Pending' | 'Rejected',
) => {
  if (status === 'Approved') {
    return {
      bg: '#DCFCE7',
      text: '#16A34A',
    };
  }

  if (status === 'Pending') {
    return {
      bg: '#FEF3C7',
      text: '#B45309',
    };
  }

  return {
    bg: '#FEE2E2',
    text: '#DC2626',
  };
};

const statusBadgeStyle = (
  status: 'Active' | 'Pending' | 'Suspended',
) => {
  if (status === 'Active') {
    return {
      bg: '#DCFCE7',
      text: '#16A34A',
    };
  }

  if (status === 'Pending') {
    return {
      bg: '#FEF3C7',
      text: '#B45309',
    };
  }

  return {
    bg: '#FEE2E2',
    text: '#DC2626',
  };
};

/* =========================================================
   NUMBER FORMATTERS
========================================================= */

const formatCurrency = (
  value: string | number | undefined | null,
) => {
  const numberValue = Number(value || 0);

  return `₹${numberValue.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (
  value: string | number | undefined | null,
) => {
  const numberValue = Number(value || 0);

  return numberValue.toLocaleString('en-IN');
};

/* =========================================================
   CHART BAR HEIGHT
========================================================= */

const getBarHeight = (
  value: number,
  maxValue: number,
) => {
  if (!value || !maxValue) {
    return 5;
  }

  const MIN_HEIGHT = 8;
  const MAX_HEIGHT = 120;

  const height =
    (value / maxValue) * MAX_HEIGHT;

  return Math.max(
    MIN_HEIGHT,
    Math.min(MAX_HEIGHT, height),
  );
};

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

const AdminDashboardScreen = ({
  navigation,
}: any) => {
  const {
    investors,
    bonds,
    payouts,
    kycRequests,
    kycPendingCount,
    adminProfile,
    addBond,
  } = useAppData();

  /* =======================================================
     DASHBOARD API STATE
  ======================================================= */

  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [investorGrowth, setInvestorGrowth] =
    useState<InvestorGrowthItem[]>([]);

  const [monthlyTrend, setMonthlyTrend] =
    useState<MonthlyInvestmentTrendItem[]>([]);

  const [dashboardLoading, setDashboardLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [dashboardError, setDashboardError] =
    useState('');

  /* =======================================================
     ADD INVESTMENT STATE
  ======================================================= */

  const [addInvestmentOpen, setAddInvestmentOpen] =
    useState(false);

  const [investorQuery, setInvestorQuery] =
    useState('');

  const [selectedInvestor, setSelectedInvestor] =
    useState<Investor | undefined>(undefined);

  const [amountText, setAmountText] =
    useState('');

  const [tenureIndex, setTenureIndex] =
    useState(1);

  const [investedDate, setInvestedDate] =
    useState(
      new Date()
        .toLocaleDateString('en-GB')
        .split('/')
        .join('-'),
    );

  const [paymentReference, setPaymentReference] =
    useState('');

  /* =======================================================
     CALCULATED INVESTMENT VALUES
  ======================================================= */

  const amount =
    Number(
      amountText.replace(/[^0-9]/g, ''),
    ) || 0;

  const tenure =
    TENURE_OPTIONS[tenureIndex];

  const monthlyInterest = amount
    ? (amount * (tenure.rate / 100)) / 12
    : 0;

  const totalInterest = amount
    ? amount *
      (tenure.rate / 100) *
      (tenure.months / 12)
    : 0;

  /* =======================================================
     FETCH ALL 3 DASHBOARD APIs
  ======================================================= */

  const loadDashboardData = useCallback(
    async () => {
      try {
        setDashboardError('');

        /*
         * All 3 APIs are called at the same time.
         *
         * 1. /admin/dashboard/summary
         * 2. /admin/dashboard/investor-growth
         * 3. /admin/dashboard/monthly-investment-trend
         */

        const [
          summary,
          growth,
          monthly,
        ] = await Promise.all([
          fetchDashboardApi<DashboardSummary>(
            '/admin/dashboard/summary',
          ),

          fetchDashboardApi<
            InvestorGrowthItem[]
          >(
            '/admin/dashboard/investor-growth',
          ),

          fetchDashboardApi<
            MonthlyInvestmentTrendItem[]
          >(
            '/admin/dashboard/monthly-investment-trend',
          ),
        ]);

        console.log(
          'Dashboard Summary:',
          summary,
        );

        console.log(
          'Investor Growth:',
          growth,
        );

        console.log(
          'Monthly Investment Trend:',
          monthly,
        );

        setDashboardSummary(summary);

        setInvestorGrowth(
          Array.isArray(growth)
            ? growth
            : [],
        );

        setMonthlyTrend(
          Array.isArray(monthly)
            ? monthly
            : [],
        );
      } catch (error: any) {
        console.log(
          'Dashboard Load Error:',
          error,
        );

        setDashboardError(
          error?.message ||
            'Unable to load dashboard data.',
        );

        /*
         * If token is missing/expired,
         * send user back to Login.
         */
        if (
          error?.message?.toLowerCase().includes(
            'session',
          )
        ) {
          await AsyncStorage.removeItem(
            'access_token',
          );

          navigation.replace('Login');
        }
      } finally {
        setDashboardLoading(false);
        setRefreshing(false);
      }
    },
    [navigation],
  );

  /* =======================================================
     LOAD DASHBOARD WHEN SCREEN OPENS
  ======================================================= */

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* =======================================================
     PULL TO REFRESH
  ======================================================= */

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  /* =======================================================
     INVESTOR SEARCH
  ======================================================= */

  const investorResults =
    investorQuery.trim()
      ? investors.filter(
          inv =>
            inv.name
              .toLowerCase()
              .includes(
                investorQuery.toLowerCase(),
              ) ||
            inv.id
              .toLowerCase()
              .includes(
                investorQuery.toLowerCase(),
              ) ||
            inv.mobile.includes(
              investorQuery,
            ),
        )
      : [];

  /* =======================================================
     RESET INVESTMENT FORM
  ======================================================= */

  const resetAddInvestmentForm = () => {
    setInvestorQuery('');
    setSelectedInvestor(undefined);
    setAmountText('');
    setTenureIndex(1);
    setPaymentReference('');

    setInvestedDate(
      new Date()
        .toLocaleDateString('en-GB')
        .split('/')
        .join('-'),
    );
  };

  const closeAddInvestmentModal = () => {
    setAddInvestmentOpen(false);
    resetAddInvestmentForm();
  };

  /* =======================================================
     SAVE INVESTMENT
  ======================================================= */

  const handleSaveAndGenerateBond = () => {
    if (!selectedInvestor) {
      Alert.alert(
        'Select an investor',
        'Please search and select an investor first.',
      );

      return;
    }

    if (amount <= 0) {
      Alert.alert(
        'Enter an amount',
        'Please enter a valid investment amount.',
      );

      return;
    }

    addBond({
      investorName:
        selectedInvestor.name,

      amount,

      interestRate:
        tenure.rate,

      tenureMonths:
        tenure.months,

      investedDateStr:
        investedDate,

      reference:
        paymentReference ||
        undefined,
    });

    setAddInvestmentOpen(false);

    resetAddInvestmentForm();

    Alert.alert(
      'Bond generated',
      `New investment added for ${selectedInvestor.name}. Check the Portfolio tab.`,
    );
  };

  /* =======================================================
     REAL API DASHBOARD VALUES
  ======================================================= */

  const totalAUM =
    dashboardSummary?.total_aum ?? 0;

  const totalInvestors =
    dashboardSummary?.total_investors ??
    0;

  const pendingKyc =
    dashboardSummary?.pending_kyc ??
    kycPendingCount ??
    0;

  const activeInvestments =
    dashboardSummary?.active_investments ??
    0;

  const monthlyInterestDue =
    dashboardSummary?.monthly_interest_due ??
    0;

  const pendingApprovals =
    dashboardSummary?.pending_approvals ??
    0;

  /* =======================================================
     CHART MAX VALUES
  ======================================================= */

  const maxMonthlyInvestment =
    monthlyTrend.length > 0
      ? Math.max(
          ...monthlyTrend.map(item =>
            Number(
              item.investment_amount || 0,
            ),
          ),
        )
      : 0;

  const maxInvestorGrowth =
    investorGrowth.length > 0
      ? Math.max(
          ...investorGrowth.map(item =>
            Number(
              item.investor_count || 0,
            ),
          ),
        )
      : 0;

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (
    dashboardLoading &&
    !dashboardSummary
  ) {
    return (
      <SafeAreaView
        style={styles.safeArea}>
        <AppHeader subtitle="Admin Portal" />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text
            style={{
              marginTop: 16,
              fontSize: 16,
              color: '#6B7280',
            }}>
            Loading dashboard...
          </Text>
        </View>

        <AdminBottomTabBar
          active="Home"
          navigation={navigation}
        />
      </SafeAreaView>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView
      style={styles.safeArea}>

      <AppHeader subtitle="Admin Portal" />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>

        {/* =================================================
            HEADER
        ================================================== */}

        <Text
          style={
            styles.greetingTitle
          }>
          Admin Dashboard
        </Text>

        <Text
          style={
            styles.greetingSubtitle
          }>
          Welcome back,{' '}
          {adminProfile.name.split(
            ' ',
          )[0]}
          . Here's today's overview.
        </Text>

        {/* =================================================
            API ERROR
        ================================================== */}

        {dashboardError ? (
          <View
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}>

            <Text
              style={{
                color: '#B91C1C',
                fontSize: 13,
                marginBottom: 8,
              }}>
              {dashboardError}
            </Text>

            <TouchableOpacity
              onPress={
                loadDashboardData
              }>
              <Text
                style={{
                  color: '#2563EB',
                  fontWeight: '700',
                }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* =================================================
            ACTIONS
        ================================================== */}

        <View
          style={
            styles.topActionsRow
          }>

          <TouchableOpacity
            style={
              styles.topActionBtnOutline
            }
            onPress={() =>
              navigation.navigate(
                'AdminReports',
              )
            }>
            <Text
              style={
                styles.topActionBtnOutlineText
              }>
              📊 Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.topActionBtnFilled
            }
            onPress={() =>
              setAddInvestmentOpen(
                true,
              )
            }>
            <Text
              style={
                styles.topActionBtnFilledText
              }>
              + Add Investment
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================
            TOTAL AUM
        ================================================== */}

        <View style={styles.aumCard}>
          <Text
            style={styles.aumLabel}>
            Total AUM
          </Text>

          <Text
            style={styles.aumValue}>
            {formatCurrency(
              totalAUM,
            )}
          </Text>

          <Text
            style={styles.aumChange}>
            Live data from dashboard
          </Text>
        </View>

        {/* =================================================
            STAT GRID
        ================================================== */}

        <View
          style={
            styles.statGrid
          }>

          {/* TOTAL INVESTORS */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#E7ECFB',
                },
              ]}>
              <Text>👥</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              TOTAL INVESTORS
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                totalInvestors,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaGood
              }>
              Live
            </Text>
          </View>

          {/* PENDING KYC */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#FEF3C7',
                },
              ]}>
              <Text>📋</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              PENDING KYC
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                pendingKyc,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaBad
              }>
              Needs attention
            </Text>
          </View>

          {/* ACTIVE INVESTMENTS */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#DCFCE7',
                },
              ]}>
              <Text>📈</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              ACTIVE INVESTMENTS
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                activeInvestments,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaGood
              }>
              Live
            </Text>
          </View>

          {/* MONTHLY INTEREST */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#DBEAFE',
                },
              ]}>
              <Text>💵</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              MONTHLY INTEREST DUE
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatCurrency(
                monthlyInterestDue,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaNeutral
              }>
              This Month
            </Text>
          </View>

          {/* PENDING APPROVALS */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#FBE8E8',
                },
              ]}>
              <Text>⏱</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              PENDING APPROVALS
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                pendingApprovals,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaBad
              }>
              Urgent
            </Text>
          </View>
        </View>

        {/* =================================================
            MONTHLY INVESTMENT TREND
        ================================================== */}

        <View
          style={
            styles.chartCard
          }>

          <View
            style={
              styles.chartHeaderRow
            }>
            <Text
              style={
                styles.chartTitle
              }>
              Monthly Investment Trend
            </Text>

            <Text
              style={
                styles.chartMenu
              }>
              •••
            </Text>
          </View>

          {monthlyTrend.length ===
          0 ? (
            <View
              style={{
                height: 150,
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}>
              <Text
                style={{
                  color:
                    '#9CA3AF',
                }}>
                No investment data
                available
              </Text>
            </View>
          ) : (
            <>
              <View
                style={
                  styles.chartBarsRow
                }>

                {monthlyTrend.map(
                  (item, index) => {
                    const value =
                      Number(
                        item.investment_amount ||
                          0,
                      );

                    const height =
                      getBarHeight(
                        value,
                        maxMonthlyInvestment,
                      );

                    return (
                      <View
                        key={`${item.month_name}-${index}`}
                        style={
                          styles.chartBarCol
                        }>

                        <View
                          style={[
                            styles.chartBar,
                            {
                              height,
                            },
                          ]}
                        />
                      </View>
                    );
                  },
                )}
              </View>

              <View
                style={
                  styles.chartLabelsRow
                }>

                {monthlyTrend.map(
                  (
                    item,
                    index,
                  ) => (
                    <Text
                      key={`${item.month_name}-label-${index}`}
                      style={
                        styles.chartLabel
                      }>
                      {item.month_name}
                    </Text>
                  ),
                )}
              </View>
            </>
          )}
        </View>

        {/* =================================================
            INVESTOR GROWTH
        ================================================== */}

        <View
          style={
            styles.chartCard
          }>

          <View
            style={
              styles.chartHeaderRow
            }>
            <Text
              style={
                styles.chartTitle
              }>
              Investor Growth
            </Text>

            <Text
              style={
                styles.chartMenu
              }>
              •••
            </Text>
          </View>

          {investorGrowth.length ===
          0 ? (
            <View
              style={{
                height: 150,
                alignItems:
                  'center',
                justifyContent:
                  'center',
              }}>
              <Text
                style={{
                  color:
                    '#9CA3AF',
                }}>
                No investor growth
                data available
              </Text>
            </View>
          ) : (
            <>
              <View
                style={
                  styles.chartBarsRow
                }>

                {investorGrowth.map(
                  (item, index) => {
                    const value =
                      Number(
                        item.investor_count ||
                          0,
                      );

                    const height =
                      getBarHeight(
                        value,
                        maxInvestorGrowth,
                      );

                    return (
                      <View
                        key={`${item.month_name}-${index}`}
                        style={
                          styles.chartBarCol
                        }>

                        <View
                          style={[
                            styles.chartBar,
                            {
                              height,
                              backgroundColor:
                                '#16A34A',
                            },
                          ]}
                        />
                      </View>
                    );
                  },
                )}
              </View>

              <View
                style={
                  styles.chartLabelsRow
                }>

                {investorGrowth.map(
                  (
                    item,
                    index,
                  ) => (
                    <Text
                      key={`${item.month_name}-growth-label-${index}`}
                      style={
                        styles.chartLabel
                      }>
                      {item.month_name}
                    </Text>
                  ),
                )}
              </View>
            </>
          )}
        </View>

        {/* =================================================
            RECENT ACTIVITY
        ================================================== */}

        <View
          style={
            styles.sectionHeaderRow
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Recent Activity
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                'InvestorRegistry',
              )
            }>
            <Text
              style={
                styles.viewLogs
              }>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={
            styles.activityCard
          }>

          {investors
            .slice(0, 5)
            .map(
              (
                inv,
                idx,
              ) => {
                const kycStyle =
                  kycBadgeStyle(
                    inv.kycStatus,
                  );

                const statusStyle =
                  statusBadgeStyle(
                    inv.status,
                  );

                return (
                  <TouchableOpacity
                    key={inv.id}
                    style={[
                      styles.activityRow,
                      idx !==
                        investors.slice(
                          0,
                          5,
                        ).length -
                          1 &&
                        styles.activityRowBorder,
                    ]}
                    onPress={() =>
                      navigation.navigate(
                        'InvestorRegistry',
                      )
                    }>

                    <View
                      style={
                        styles.activityIconWrap
                      }>
                      <Text
                        style={
                          styles.activityInitial
                        }>
                        {inv.name.charAt(
                          0,
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.activityTextWrap
                      }>
                      <Text
                        style={
                          styles.activityTitle
                        }>
                        {inv.name}
                      </Text>

                      <Text
                        style={
                          styles.activitySubtitle
                        }>
                        {inv.branch} •{' '}
                        {inv.id}
                      </Text>
                    </View>

                    <View
                      style={{
                        alignItems:
                          'flex-end',
                        gap: 4,
                      }}>

                      <View
                        style={[
                          styles.miniBadge,
                          {
                            backgroundColor:
                              kycStyle.bg,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.miniBadgeText,
                            {
                              color:
                                kycStyle.text,
                            },
                          ]}>
                          {
                            inv.kycStatus
                          }
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.miniBadge,
                          {
                            backgroundColor:
                              statusStyle.bg,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.miniBadgeText,
                            {
                              color:
                                statusStyle.text,
                            },
                          ]}>
                          {
                            inv.status
                          }
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              },
            )}

        </View>
      </ScrollView>

      {/* ===================================================
          BOTTOM TAB BAR
      ==================================================== */}

      <AdminBottomTabBar
        active="Home"
        navigation={navigation}
      />

      {/* ===================================================
          ADD INVESTMENT MODAL
      ==================================================== */}

      <Modal
        visible={
          addInvestmentOpen
        }
        transparent
        animationType="slide"
        onRequestClose={
          closeAddInvestmentModal
        }>

        <KeyboardAvoidingView
          style={
            styles.modalOverlay
          }
          behavior={
            Platform.OS ===
            'ios'
              ? 'padding'
              : undefined
          }>

          <View
            style={
              styles.modalCard
            }>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled">

              <View
                style={
                  styles.modalHeaderRow
                }>

                <Text
                  style={
                    styles.modalTitle
                  }>
                  Add Investment
                </Text>

                <TouchableOpacity
                  onPress={
                    closeAddInvestmentModal
                  }>
                  <Text
                    style={
                      styles.modalClose
                    }>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={
                  styles.modalSubtitle
                }>
                Search an investor, set
                the amount and tenure,
                then generate a bond.
              </Text>

              {/* Investor */}

              <Text
                style={
                  styles.inputLabel
                }>
                Investor
              </Text>

              {selectedInvestor ? (
                <View
                  style={
                    styles.selectedInvestorChip
                  }>

                  <View
                    style={{
                      flex: 1,
                    }}>
                    <Text
                      style={
                        styles.selectedInvestorName
                      }>
                      {
                        selectedInvestor.name
                      }
                    </Text>

                    <Text
                      style={
                        styles.selectedInvestorMeta
                      }>
                      {
                        selectedInvestor.id
                      }{' '}
                      •{' '}
                      {
                        selectedInvestor.branch
                      }
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      setSelectedInvestor(
                        undefined,
                      )
                    }>
                    <Text
                      style={
                        styles.changeInvestorLink
                      }>
                      Change
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={
                      styles.textInput
                    }
                    placeholder="Search by name, ID, or mobile"
                    placeholderTextColor="#9CA3AF"
                    value={
                      investorQuery
                    }
                    onChangeText={
                      setInvestorQuery
                    }
                  />

                  {investorResults.length >
                    0 && (
                    <View
                      style={
                        styles.investorResultsBox
                      }>

                      {investorResults
                        .slice(0, 5)
                        .map(
                          inv => (
                            <TouchableOpacity
                              key={
                                inv.id
                              }
                              style={
                                styles.investorResultRow
                              }
                              onPress={() => {
                                setSelectedInvestor(
                                  inv,
                                );
                                setInvestorQuery(
                                  '',
                                );
                              }}>

                              <Text
                                style={
                                  styles.investorResultName
                                }>
                                {
                                  inv.name
                                }
                              </Text>

                              <Text
                                style={
                                  styles.investorResultMeta
                                }>
                                {
                                  inv.id
                                }{' '}
                                •{' '}
                                {
                                  inv.branch
                                }
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                    </View>
                  )}

                  {investorQuery.trim()
                    .length > 0 &&
                    investorResults.length ===
                      0 && (
                      <Text
                        style={
                          styles.noResultsText
                        }>
                        No investors match "
                        {
                          investorQuery
                        }
                        "
                      </Text>
                    )}
                </>
              )}

              {/* Amount */}

              <Text
                style={
                  styles.inputLabel
                }>
                Investment Amount (₹)
              </Text>

              <TextInput
                style={
                  styles.textInput
                }
                placeholder="e.g. 500000"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                value={
                  amountText
                }
                onChangeText={
                  setAmountText
                }
              />

              {/* Tenure */}

              <Text
                style={
                  styles.inputLabel
                }>
                Tenure
              </Text>

              <View
                style={
                  styles.tenureRow
                }>

                {TENURE_OPTIONS.map(
                  (
                    opt,
                    i,
                  ) => (
                    <TouchableOpacity
                      key={
                        opt.months
                      }
                      style={[
                        styles.tenureOption,
                        tenureIndex ===
                          i &&
                          styles.tenureOptionActive,
                      ]}
                      onPress={() =>
                        setTenureIndex(
                          i,
                        )
                      }>

                      <Text
                        style={[
                          styles.tenureOptionMonths,
                          tenureIndex ===
                            i &&
                            styles.tenureOptionMonthsActive,
                        ]}>
                        {
                          opt.months
                        }
                        m
                      </Text>

                      <Text
                        style={[
                          styles.tenureOptionRate,
                          tenureIndex ===
                            i &&
                            styles.tenureOptionRateActive,
                        ]}>
                        {
                          opt.rate
                        }
                        %
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Date */}

              <Text
                style={
                  styles.inputLabel
                }>
                Invested Date
                (DD-MM-YYYY)
              </Text>

              <TextInput
                style={
                  styles.textInput
                }
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#9CA3AF"
                value={
                  investedDate
                }
                onChangeText={
                  setInvestedDate
                }
              />

              {/* Payment Reference */}

              <Text
                style={
                  styles.inputLabel
                }>
                Payment Reference
                (optional)
              </Text>

              <TextInput
                style={
                  styles.textInput
                }
                placeholder="e.g. UTR123456"
                placeholderTextColor="#9CA3AF"
                value={
                  paymentReference
                }
                onChangeText={
                  setPaymentReference
                }
              />

              {/* Summary */}

              {amount > 0 && (
                <View
                  style={
                    styles.summaryBox
                  }>

                  <View
                    style={
                      styles.summaryRow
                    }>
                    <Text
                      style={
                        styles.summaryLabel
                      }>
                      Monthly Interest
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }>
                      ₹
                      {monthlyInterest.toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 0,
                        },
                      )}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.summaryRow
                    }>
                    <Text
                      style={
                        styles.summaryLabel
                      }>
                      Total Interest (
                      {
                        tenure.months
                      }
                      m)
                    </Text>

                    <Text
                      style={
                        styles.summaryValue
                      }>
                      ₹
                      {totalInterest.toLocaleString(
                        'en-IN',
                        {
                          maximumFractionDigits: 0,
                        },
                      )}
                    </Text>
                  </View>
                </View>
              )}

              {/* Buttons */}

              <View
                style={
                  styles.modalButtonsRow
                }>

                <TouchableOpacity
                  style={
                    styles.modalCancelBtn
                  }
                  onPress={
                    closeAddInvestmentModal
                  }>
                  <Text
                    style={
                      styles.modalCancelBtnText
                    }>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.modalSaveBtn
                  }
                  onPress={
                    handleSaveAndGenerateBond
                  }>
                  <Text
                    style={
                      styles.modalSaveBtnText
                    }>
                    Save & Generate Bond
                  </Text>
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