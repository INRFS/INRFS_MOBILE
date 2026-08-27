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
import {validation} from '../../utils/validation';

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

  const [recentInvestments, setRecentInvestments] =
    useState<any[]>([]);

  const [selectedInvestment, setSelectedInvestment] =
    useState<any | null>(null);

  const [rejectingInvestment, setRejectingInvestment] =
    useState<any | null>(null);

  const [rejectionRemarks, setRejectionRemarks] =
    useState('');

  const [actionBusy, setActionBusy] =
    useState(false);

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
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

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
     FETCH ALL DASHBOARD APIs
  ======================================================= */

  const loadDashboardData = useCallback(
    async () => {
      try {
        setDashboardError('');

        const [
          summary,
          growth,
          monthly,
          investmentsRes,
        ] = await Promise.all([
          fetchDashboardApi<DashboardSummary>(
            '/admin/dashboard/summary',
          ).catch(() => null),

          fetchDashboardApi<
            InvestorGrowthItem[]
          >(
            '/admin/dashboard/investor-growth',
          ).catch(() => []),

          fetchDashboardApi<
            MonthlyInvestmentTrendItem[]
          >(
            '/admin/dashboard/monthly-investment-trend',
          ).catch(() => []),

          fetchDashboardApi<any[]>(
            '/admin/investments?limit=10&offset=0',
          ).catch(() => []),
        ]);

        if (summary) {
          setDashboardSummary(summary);
        }

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

        setRecentInvestments(
          Array.isArray(investmentsRes)
            ? investmentsRes
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
     APPROVAL & REJECTION ACTIONS
  ======================================================= */

  const handleApproveInvestment = async (inv: any) => {
    const invId = inv.investment_id || inv.id;
    try {
      setActionBusy(true);
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL}/admin/investments/${encodeURIComponent(invId)}/approve`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            interest_rate: Number(inv.interest_rate || inv.rate || 3),
            remarks: 'Approved by admin',
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.detail || data?.message || 'Failed to approve investment',
        );
      }
      Alert.alert(
        'Approved',
        `Investment ${invId} has been approved successfully.`,
      );
      await loadDashboardData();
    } catch (e: any) {
      Alert.alert(
        'Approval Failed',
        e?.message || 'Could not approve investment.',
      );
    } finally {
      setActionBusy(false);
    }
  };

  const handleRejectInvestment = async () => {
    if (!rejectingInvestment) return;
    if (!rejectionRemarks.trim()) {
      Alert.alert(
        'Remarks Required',
        'Please enter rejection remarks.',
      );
      return;
    }
    const invId =
      rejectingInvestment.investment_id || rejectingInvestment.id;
    try {
      setActionBusy(true);
      const headers = await getAuthHeaders();
      const res = await fetch(
        `${API_BASE_URL}/admin/investments/${encodeURIComponent(invId)}/reject`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            rejection_reason: rejectionRemarks.trim(),
            remarks: rejectionRemarks.trim(),
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data?.detail || data?.message || 'Failed to reject investment',
        );
      }
      setRejectingInvestment(null);
      setRejectionRemarks('');
      Alert.alert('Rejected', `Investment ${invId} was rejected.`);
      await loadDashboardData();
    } catch (e: any) {
      Alert.alert(
        'Rejection Failed',
        e?.message || 'Could not reject investment.',
      );
    } finally {
      setActionBusy(false);
    }
  };

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
    setModalErrors({});

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
    const errs: Record<string, string> = {};

    if (!selectedInvestor) {
      errs.investor = 'Please search and select an investor first.';
    }

    const cleanAmount = amountText.trim();
    if (!cleanAmount) {
      errs.amount = 'Please enter an investment amount.';
    } else if (/\D/.test(cleanAmount) || amount <= 0) {
      errs.amount = 'Please enter a valid numeric investment amount.';
    }

    const dateCheck = validation.isValidDateString(investedDate, 'DD-MM-YYYY');
    if (!dateCheck.isValid) {
      errs.date = dateCheck.error || 'Please enter a valid date in DD-MM-YYYY format.';
    }

    setModalErrors(errs);
    if (Object.keys(errs).length > 0 || !selectedInvestor) {
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
        investedDate.trim(),

      reference:
        paymentReference.trim() ||
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
     REAL API DASHBOARD VALUES (FLEXIBLE MAPPING)
  ======================================================= */

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

  const totalAUM = getValue(
    dashboardSummary,
    [
      'total_aum',
      'totalAum',
      'aum',
      'total_portfolio_value',
      'portfolio_value',
    ],
    0,
  );

  const totalInvestors = getValue(
    dashboardSummary,
    [
      'total_investors',
      'totalInvestors',
      'investors_count',
      'investor_count',
    ],
    investors.length || 0,
  );

  const pendingKyc = getValue(
    dashboardSummary,
    [
      'pending_kyc',
      'pendingKyc',
      'pending_kyc_count',
    ],
    kycPendingCount || 0,
  );

  const activeInvestments = getValue(
    dashboardSummary,
    [
      'active_investments',
      'activeInvestments',
      'active_investment_count',
    ],
    0,
  );

  const monthlyInterestDue = getValue(
    dashboardSummary,
    [
      'monthly_interest_due',
      'monthlyInterestDue',
      'monthly_interest',
      'monthly_payout',
    ],
    0,
  );

  const pendingApprovals = getValue(
    dashboardSummary,
    [
      'pending_approvals',
      'pendingApprovals',
      'pending_investments_count',
      'pending_approval_count',
    ],
    0,
  );

  const closedInvestments = getValue(
    dashboardSummary,
    [
      'closed_investments',
      'closedInvestments',
      'matured_investments',
      'closed_count',
    ],
    0,
  );

  const branchCount = getValue(
    dashboardSummary,
    [
      'branch_count',
      'branchCount',
      'branches',
      'total_branches',
    ],
    0,
  );

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

          {/* CLOSED INVESTMENTS */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#F3F4F6',
                },
              ]}>
              <Text>🏁</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              CLOSED INVESTMENTS
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                closedInvestments,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaNeutral
              }>
              Settled
            </Text>
          </View>

          {/* BRANCH COUNT */}

          <View
            style={
              styles.statGridCard
            }>
            <View
              style={[
                styles.statGridIconWrap,
                {
                  backgroundColor:
                    '#EDE9FE',
                },
              ]}>
              <Text>🏢</Text>
            </View>

            <Text
              style={
                styles.statGridLabel
              }>
              BRANCHES
            </Text>

            <Text
              style={
                styles.statGridValue
              }>
              {formatNumber(
                branchCount,
              )}
            </Text>

            <Text
              style={
                styles.statGridDeltaGood
              }>
              Active
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

          {(recentInvestments.length > 0
            ? recentInvestments.slice(0, 5)
            : investors.slice(0, 5)
          ).map(
            (
              item: any,
              idx: number,
            ) => {
              const isInvestment =
                !!item.investment_id ||
                item.investment_amount !== undefined;

              const title = isInvestment
                ? item.investor_name ||
                  `Investment ${item.investment_id || item.id}`
                : item.name;

              const subtitle = isInvestment
                ? `${item.investment_id || item.id} • ${formatCurrency(
                    item.investment_amount || item.amount || 0,
                  )}${
                    item.interest_rate || item.rate
                      ? ` • ${item.interest_rate || item.rate}%`
                      : ''
                  }`
                : `${item.branch || 'Branch'} • ${item.id}`;

              const rawStatus = String(
                item.status ||
                  item.investment_status ||
                  (isInvestment ? 'Active' : item.status || 'Active'),
              ).toLowerCase();

              const isPending =
                rawStatus.includes('pending') ||
                rawStatus.includes('approval');

              const isRejected = rawStatus.includes('reject');

              const statusDisplay = isPending
                ? 'Pending Approval'
                : isRejected
                ? 'Rejected'
                : 'Active';

              const badgeStyle = isPending
                ? {bg: '#FEF3C7', text: '#B45309'}
                : isRejected
                ? {bg: '#FEE2E2', text: '#DC2626'}
                : {bg: '#DCFCE7', text: '#16A34A'};

              return (
                <View
                  key={
                    item.investment_id ||
                    item.id ||
                    `act-${idx}`
                  }
                  style={[
                    styles.activityRow,
                    idx !==
                      (recentInvestments.length > 0
                        ? recentInvestments.slice(0, 5)
                        : investors.slice(0, 5)
                      ).length -
                        1 &&
                      styles.activityRowBorder,
                    {
                      flexDirection: 'column',
                      alignItems: 'stretch',
                    },
                  ]}>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View
                      style={
                        styles.activityIconWrap
                      }>
                      <Text
                        style={
                          styles.activityInitial
                        }>
                        {title
                          .charAt(0)
                          .toUpperCase()}
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
                        {title}
                      </Text>

                      <Text
                        style={
                          styles.activitySubtitle
                        }>
                        {subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.miniBadge,
                        {
                          backgroundColor:
                            badgeStyle.bg,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.miniBadgeText,
                          {
                            color:
                              badgeStyle.text,
                          },
                        ]}>
                        {statusDisplay}
                      </Text>
                    </View>
                  </View>

                  {/* Actions Row */}
                  <View
                    style={
                      styles.activityActionRow
                    }>
                    <TouchableOpacity
                      style={
                        styles.actionBtn
                      }
                      onPress={() =>
                        setSelectedInvestment(
                          item,
                        )
                      }>
                      <Text
                        style={
                          styles.actionBtnText
                        }>
                        👁 View
                      </Text>
                    </TouchableOpacity>

                    {isPending && (
                      <>
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            styles.actionBtnApprove,
                          ]}
                          disabled={
                            actionBusy
                          }
                          onPress={() =>
                            handleApproveInvestment(
                              item,
                            )
                          }>
                          <Text
                            style={
                              styles.actionBtnApproveText
                            }>
                            ✓ Approve
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            styles.actionBtnReject,
                          ]}
                          disabled={
                            actionBusy
                          }
                          onPress={() => {
                            setRejectingInvestment(
                              item,
                            );
                            setRejectionRemarks(
                              '',
                            );
                          }}>
                          <Text
                            style={
                              styles.actionBtnRejectText
                            }>
                            ✕ Reject
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
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
          DETAILS MODAL
      ==================================================== */}

      <Modal
        visible={!!selectedInvestment}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSelectedInvestment(null)
        }>
        <View
          style={{
            flex: 1,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={
              styles.detailModalCard
            }>
            {selectedInvestment && (
              <>
                <View
                  style={
                    styles.modalHeaderRow
                  }>
                  <Text
                    style={
                      styles.modalTitle
                    }>
                    {selectedInvestment.investment_id ||
                      selectedInvestment.id}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedInvestment(
                        null,
                      )
                    }>
                    <Text
                      style={
                        styles.modalClose
                      }>
                      ✕
                    </Text>
                  </TouchableOpacity>
                </View>

                {[
                  [
                    'Investor Name',
                    selectedInvestment.investor_name ||
                      selectedInvestment.name ||
                      '—',
                  ],
                  [
                    'Status',
                    selectedInvestment.status ||
                      selectedInvestment.investment_status ||
                      'Active',
                  ],
                  [
                    'Amount',
                    formatCurrency(
                      selectedInvestment.investment_amount ||
                        selectedInvestment.amount ||
                        selectedInvestment.totalInvested ||
                        0,
                    ),
                  ],
                  ...(selectedInvestment.interest_rate ||
                  selectedInvestment.rate
                    ? [
                        [
                          'Interest Rate',
                          `${
                            selectedInvestment.interest_rate ||
                            selectedInvestment.rate
                          }% p.a.`,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.tenure_months
                    ? [
                        [
                          'Tenure',
                          `${selectedInvestment.tenure_months} months`,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.investment_date ||
                  selectedInvestment.registeredDate
                    ? [
                        [
                          'Date',
                          selectedInvestment.investment_date ||
                            selectedInvestment.registeredDate,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.maturity_date
                    ? [
                        [
                          'Matures On',
                          selectedInvestment.maturity_date,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.branch_name ||
                  selectedInvestment.branch
                    ? [
                        [
                          'Branch',
                          selectedInvestment.branch_name ||
                            selectedInvestment.branch,
                        ],
                      ]
                    : []),
                  ...(selectedInvestment.bond_number
                    ? [
                        [
                          'Bond Number',
                          selectedInvestment.bond_number,
                        ],
                      ]
                    : []),
                ].map(([label, val]) => (
                  <View
                    style={
                      styles.detailRow
                    }
                    key={label}>
                    <Text
                      style={
                        styles.detailLabel
                      }>
                      {label}
                    </Text>
                    <Text
                      style={
                        styles.detailValue
                      }>
                      {val}
                    </Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={
                    styles.detailConfirmBtn
                  }
                  onPress={() =>
                    setSelectedInvestment(
                      null,
                    )
                  }>
                  <Text
                    style={
                      styles.detailConfirmBtnText
                    }>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ===================================================
          REJECTION REMARKS MODAL
      ==================================================== */}

      <Modal
        visible={!!rejectingInvestment}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setRejectingInvestment(null)
        }>
        <View
          style={{
            flex: 1,
            backgroundColor:
              'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={
              styles.detailModalCard
            }>
            <View
              style={
                styles.modalHeaderRow
              }>
              <Text
                style={
                  styles.modalTitle
                }>
                Reject Investment
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setRejectingInvestment(
                    null,
                  )
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
              style={{
                fontSize: 13,
                color: '#6B7280',
                marginTop: 4,
                marginBottom: 8,
              }}>
              Enter the reason for rejecting{' '}
              {rejectingInvestment?.investment_id ||
                rejectingInvestment?.id}
              :
            </Text>

            <TextInput
              style={
                styles.rejectTextarea
              }
              multiline
              placeholder="Enter rejection remarks (required)..."
              placeholderTextColor="#9CA3AF"
              value={rejectionRemarks}
              onChangeText={
                setRejectionRemarks
              }
            />

            <View
              style={{
                flexDirection: 'row',
                gap: 10,
              }}>
              <TouchableOpacity
                style={
                  styles.modalCancelBtn
                }
                onPress={() =>
                  setRejectingInvestment(
                    null,
                  )
                }>
                <Text
                  style={
                    styles.modalCancelBtnText
                  }>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.actionBtnReject,
                  {
                    flex: 1.4,
                    paddingVertical: 12,
                  },
                  !rejectionRemarks.trim() && {
                    opacity: 0.5,
                  },
                ]}
                disabled={
                  !rejectionRemarks.trim() ||
                  actionBusy
                }
                onPress={
                  handleRejectInvestment
                }>
                <Text
                  style={[
                    styles.actionBtnRejectText,
                    {
                      textAlign: 'center',
                      fontSize: 13.5,
                    },
                  ]}>
                  {actionBusy
                    ? 'Rejecting...'
                    : 'Reject Investment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

                  {investorQuery.trim() &&
                    investorResults.length ===
                      0 && (
                      <Text
                        style={
                          styles.noResultsText
                        }>
                        No matching
                        investors found
                      </Text>
                    )}
                </>
              )}

              {modalErrors.investor ? (
                <Text style={{color: '#DC2626', fontSize: 12, marginTop: 4, marginBottom: 6, fontWeight: '500'}}>
                  {modalErrors.investor}
                </Text>
              ) : null}

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
                keyboardType="numeric"
                value={amountText}
                onChangeText={t => {
                  setAmountText(t);
                  if (modalErrors.amount) setModalErrors(prev => ({...prev, amount: ''}));
                }}
              />

              {modalErrors.amount ? (
                <Text style={{color: '#DC2626', fontSize: 12, marginTop: 4, marginBottom: 4, fontWeight: '500'}}>
                  {modalErrors.amount}
                </Text>
              ) : null}

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
                  (opt, i) => (
                    <TouchableOpacity
                      key={opt.months}
                      style={[
                        styles.tenureOption,
                        i ===
                          tenureIndex &&
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
                          i ===
                            tenureIndex &&
                            styles.tenureOptionMonthsActive,
                        ]}>
                        {opt.months}m
                      </Text>

                      <Text
                        style={[
                          styles.tenureOptionRate,
                          i ===
                            tenureIndex &&
                            styles.tenureOptionRateActive,
                        ]}>
                        {opt.rate}%
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Invested Date */}

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
                onChangeText={t => {
                  setInvestedDate(t);
                  if (modalErrors.date) setModalErrors(prev => ({...prev, date: ''}));
                }}
              />

              {modalErrors.date ? (
                <Text style={{color: '#DC2626', fontSize: 12, marginTop: 4, marginBottom: 4, fontWeight: '500'}}>
                  {modalErrors.date}
                </Text>
              ) : null}

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