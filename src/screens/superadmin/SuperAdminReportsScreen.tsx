import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

import AppHeader from '../../components/AppHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {styles} from '../../styles/superadmin/SuperAdminReportsScreen.styles';
import {
  getErrorMessage,
  formatCurrencyAUM,
  formatIndianNumber,
  formatSuperAdminDate,
} from '../../services/superadmin/superAdminDashboardService';
import {
  getReportFilters,
  getInvestmentReports,
  getInvestmentReportDetails,
  getInvestorReports,
  getAdminReports,
  getSettlementReports,
  getExtensionReports,
  deriveMaturityReports,
  deriveInterestReports,
  deriveBranchReports,
  deriveMonthlyReports,
  ReportFilterOption,
  InvestmentReportItem,
  InvestorReportItem,
  AdminReportItem,
  SettlementReportItem,
  ExtensionReportItem,
} from '../../services/superadmin/superAdminReportsService';

type ReportTab =
  | 'Overview'
  | 'Investments'
  | 'Investors'
  | 'Admins'
  | 'Maturity'
  | 'Interest'
  | 'Settlement'
  | 'Branches'
  | 'Monthly'
  | 'Extensions';

const TABS: ReportTab[] = [
  'Overview',
  'Investments',
  'Investors',
  'Admins',
  'Maturity',
  'Interest',
  'Settlement',
  'Branches',
  'Monthly',
  'Extensions',
];

const formatINR = (n: number) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

const DATE_PRESETS = [
  {label: 'All Time', from: '', to: ''},
  {
    label: 'This Month',
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },
  {
    label: 'Last 30 Days',
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  },
  {
    label: 'This Year',
    from: `${new Date().getFullYear()}-01-01`,
    to: new Date().toISOString().split('T')[0],
  },
];

const SuperAdminReportsScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('Overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('All Time');

  const [filterOptions, setFilterOptions] = useState<{
    branches: ReportFilterOption[];
    admins: ReportFilterOption[];
    statuses: ReportFilterOption[];
  }>({branches: [], admins: [], statuses: []});

  // Modals Visibility
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);

  // Data Collections (Live API Data)
  const [investments, setInvestments] = useState<InvestmentReportItem[]>([]);
  const [investors, setInvestors] = useState<InvestorReportItem[]>([]);
  const [admins, setAdmins] = useState<AdminReportItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementReportItem[]>([]);
  const [extensions, setExtensions] = useState<ExtensionReportItem[]>([]);

  // Investment Details Modal
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentReportItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Load Real Backend Data
  const loadData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);
        setError('');

        const queryParams = {
          search: search.trim() || undefined,
          branch_id: branchFilter !== 'all' ? branchFilter : undefined,
          admin_id: adminFilter !== 'all' ? adminFilter : undefined,
          status_id: statusFilter !== 'all' ? statusFilter : undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          limit: 500,
          offset: 0,
        };

        const [filtersRes, invRes, usersRes, admRes, settRes, extRes] =
          await Promise.all([
            getReportFilters(),
            getInvestmentReports(queryParams),
            getInvestorReports(queryParams),
            getAdminReports(queryParams),
            getSettlementReports(queryParams),
            getExtensionReports(queryParams),
          ]);

        setFilterOptions(filtersRes);
        setInvestments(invRes.records || []);
        setInvestors(usersRes.records || []);
        setAdmins(admRes.records || []);
        setSettlements(settRes.records || []);
        setExtensions(extRes.records || []);
      } catch (err: any) {
        console.log('Error loading superadmin reports:', err);
        setError(getErrorMessage(err) || 'Failed to load reports.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, branchFilter, adminFilter, statusFilter, fromDate, toDate],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Derived Datasets
  const maturityReports = useMemo(
    () => deriveMaturityReports(investments),
    [investments],
  );
  const interestReports = useMemo(
    () => deriveInterestReports(investments),
    [investments],
  );
  const branchReports = useMemo(
    () => deriveBranchReports(investments),
    [investments],
  );
  const monthlyReports = useMemo(
    () => deriveMonthlyReports(investments),
    [investments],
  );

  // Real Metric Calculations
  const overviewStats = useMemo(() => {
    const totalPrincipal = investments.reduce(
      (sum, i) => sum + i.investment_amount,
      0,
    );
    const totalExpectedInterest = investments.reduce(
      (sum, i) => sum + i.expected_interest_amount,
      0,
    );
    const activeCount = investments.filter(
      i => i.status_name.toLowerCase() === 'active',
    ).length;
    const pendingCount = investments.filter(
      i =>
        i.status_name.toLowerCase().includes('pending') ||
        i.status_name.toLowerCase().includes('submitted'),
    ).length;
    const settledCount = investments.filter(
      i =>
        i.status_name.toLowerCase().includes('settled') ||
        i.status_name.toLowerCase().includes('closed') ||
        i.status_name.toLowerCase().includes('paid'),
    ).length;

    const uniqueInvestors = new Set(
      investments.map(i => i.investor_id).filter(Boolean),
    ).size;

    const monthlyInterestPayout = investments.reduce(
      (sum, i) =>
        sum +
        (i.tenure_months > 0
          ? i.expected_interest_amount / i.tenure_months
          : 0),
      0,
    );

    return {
      totalInvestors: uniqueInvestors || investors.length,
      totalInvestments: investments.length,
      activeInvestments: activeCount,
      pendingApprovals: pendingCount,
      settledInvestments: settledCount,
      totalPortfolio: totalPrincipal,
      totalExpectedInterest,
      monthlyInterestPayout,
    };
  }, [investments, investors]);

  const statCards = [
    {
      label: 'Unique Investors',
      value: formatIndianNumber(overviewStats.totalInvestors),
      sub: 'Portfolio investors',
      icon: '👥',
      bg: '#EEF2FF',
    },
    {
      label: 'Total Investments',
      value: formatIndianNumber(overviewStats.totalInvestments),
      sub: 'Bond count',
      icon: '📈',
      bg: '#F0F9FF',
    },
    {
      label: 'Active Investments',
      value: String(overviewStats.activeInvestments),
      sub: 'Currently active',
      icon: '✅',
      bg: '#ECFDF5',
    },
    {
      label: 'Pending Approvals',
      value: String(overviewStats.pendingApprovals),
      sub: 'Requires review',
      icon: '⏱',
      bg: '#FFFBEB',
    },
    {
      label: 'Total Principal',
      value: formatCurrencyAUM(overviewStats.totalPortfolio),
      sub: 'Portfolio AUM',
      icon: '💼',
      bg: '#FDF4FF',
    },
    {
      label: 'Monthly Payout',
      value: formatINR(overviewStats.monthlyInterestPayout),
      sub: 'Monthly interest',
      icon: '％',
      bg: '#F0FDF4',
    },
  ];

  // Open Details Modal
  const handleOpenDetails = async (item: InvestmentReportItem) => {
    setSelectedInvestment(item);
    setDetailsModalVisible(true);
    setDetailsLoading(true);

    try {
      const detailed = await getInvestmentReportDetails(
        item.investment_id || item.id,
      );
      if (detailed) {
        setSelectedInvestment(detailed);
      }
    } catch (err) {
      console.log('Error fetching report details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (
      s === 'paid' ||
      s === 'completed' ||
      s === 'settled' ||
      s === 'approved' ||
      s === 'active'
    ) {
      return {
        bg: '#DCFCE7',
        fg: '#15803D',
        dot: '#16A34A',
        label: status || 'Active',
      };
    }
    if (s.includes('pending') || s.includes('requested') || s.includes('review')) {
      return {
        bg: '#FEF3C7',
        fg: '#B45309',
        dot: '#D97706',
        label: status || 'Pending',
      };
    }
    if (s.includes('reject') || s.includes('cancel') || s.includes('declined')) {
      return {
        bg: '#FEE2E2',
        fg: '#DC2626',
        dot: '#EF4444',
        label: status || 'Rejected',
      };
    }
    return {
      bg: '#F1F5F9',
      fg: '#475569',
      dot: '#64748B',
      label: status || 'Closed',
    };
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSearch('');
    setBranchFilter('all');
    setAdminFilter('all');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setSelectedPreset('All Time');
  };

  const hasActiveFilters = Boolean(
    search ||
      branchFilter !== 'all' ||
      statusFilter !== 'all' ||
      fromDate ||
      toDate,
  );

  // Export to Excel
  const handleExport = async () => {
    try {
      let exportRows: any[] = [];
      const sheetName = activeTab;

      switch (activeTab) {
        case 'Overview':
        case 'Investments':
        case 'Maturity':
        case 'Interest':
          const sourceList =
            activeTab === 'Maturity'
              ? maturityReports
              : activeTab === 'Interest'
              ? interestReports
              : investments;
          exportRows = sourceList.map(x => ({
            'Investment ID': x.investment_id,
            'Investor ID': x.investor_id,
            'Investor Name': x.investor_name,
            'Branch Name': x.branch_name,
            'Admin Name': x.admin_name,
            'Super Admin': x.superadmin_name,
            'Amount (₹)': x.investment_amount,
            'Interest Rate (%)': x.interest_rate,
            'Tenure (Months)': x.tenure_months,
            'Investment Date': x.investment_date,
            'Maturity Date': x.maturity_date,
            'Expected Interest (₹)': x.expected_interest_amount,
            'Maturity Amount (₹)': x.maturity_amount,
            Status: x.status_name,
          }));
          break;

        case 'Investors':
          exportRows = investors.map(x => ({
            'Investor ID': x.investor_id,
            Name: x.name,
            Email: x.email,
            Mobile: x.mobile,
            Branch: x.branch_name,
            'Investments Count': x.investment_count,
            'Total Invested (₹)': x.total_invested,
            'Total Interest (₹)': x.total_interest,
            Status: x.status,
            'Registered Date': x.created_date,
          }));
          break;

        case 'Admins':
          exportRows = admins.map(x => ({
            'Admin ID': x.admin_id,
            Name: x.name,
            Email: x.email,
            Mobile: x.mobile,
            Branch: x.branch_name,
            'Investors Managed': x.investor_count,
            'Investments Count': x.investment_count,
            'Total AUM (₹)': x.total_aum,
            Status: x.status,
          }));
          break;

        case 'Settlement':
          exportRows = settlements.map(x => ({
            'Settlement ID': x.settlement_id,
            'Investment ID': x.investment_id,
            'Investor Name': x.investor_name,
            'Settlement Type': x.settlement_type,
            'Principal Amount (₹)': x.principal_amount,
            'Interest Amount (₹)': x.interest_amount,
            'Penalty Amount (₹)': x.penalty_amount,
            'Net Settlement Amount (₹)': x.net_settlement_amount,
            Status: x.status,
            'Requested Date': x.requested_date,
            'Settled Date': x.settled_date,
            Branch: x.branch_name,
          }));
          break;

        case 'Extensions':
          exportRows = extensions.map(x => ({
            'Extension ID': x.extension_id,
            'Investment ID': x.investment_id,
            'Investor Name': x.investor_name,
            'Previous Tenure (M)': x.previous_tenure_months,
            'Extended Duration (M)': x.extended_months,
            'New Tenure (M)': x.new_tenure_months,
            Status: x.status,
            'Requested Date': x.requested_date,
            'Approved Date': x.approved_date,
            Branch: x.branch_name,
          }));
          break;

        case 'Branches':
          exportRows = branchReports.map(x => ({
            Branch: x.branch_name,
            'Investor Count': x.investor_count,
            'Investment Count': x.investment_count,
            'Total Principal (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            'Maturity Amount (₹)': x.maturity_amount,
          }));
          break;

        case 'Monthly':
          exportRows = monthlyReports.map(x => ({
            Month: x.month,
            'Investor Count': x.investor_count,
            'Investment Count': x.investment_count,
            'Total Principal (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            'Maturity Amount (₹)': x.maturity_amount,
          }));
          break;
      }

      if (exportRows.length === 0) {
        Alert.alert('No Records', 'No data available to export for this report.');
        return;
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportRows);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
      const path = `${RNFS.DocumentDirectoryPath}/INRFS_${sheetName}_Report_${Date.now()}.xlsx`;

      await RNFS.writeFile(path, wbout, 'base64');
      await RNShare.open({
        url: `file://${path}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: `Share ${sheetName} Report`,
      });
    } catch (e: any) {
      if (e?.message !== 'User did not share') {
        Alert.alert('Export Notice', 'Unable to complete report export.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader subtitle="Reports & Analytics" />

      {/* HEADER SECTION */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Track and analyze investment performance
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(false)}
            colors={['#0B1E45', '#2563EB']}
          />
        }>
        {/* HERO PORTFOLIO VALUE BANNER */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO ASSETS</Text>
          <Text style={styles.heroAmount}>
            {formatINR(overviewStats.totalPortfolio)}
          </Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Active Bonds</Text>
              <Text style={styles.heroStatVal}>
                {overviewStats.activeInvestments}
              </Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Monthly Payout</Text>
              <Text style={styles.heroStatValGreen}>
                {formatINR(overviewStats.monthlyInterestPayout)}
              </Text>
            </View>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Pending</Text>
              <Text style={styles.heroStatVal}>
                {overviewStats.pendingApprovals}
              </Text>
            </View>
          </View>
        </View>

        {/* 10 HORIZONTAL REPORT CATEGORY TABS */}
        <View style={styles.tabBarWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}>
            {TABS.map(tab => {
              const isSelected = activeTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabChip, isSelected && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab)}>
                  <Text
                    style={[
                      styles.tabChipText,
                      isSelected && styles.tabChipTextActive,
                    ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* DATE RANGE FILTER BANNER */}
        <TouchableOpacity
          style={styles.dateRangeCard}
          activeOpacity={0.8}
          onPress={() => setDateModalVisible(true)}>
          <View style={styles.dateRangeLeft}>
            <View style={styles.dateIconWrap}>
              <Text style={styles.dateIcon}>📅</Text>
            </View>
            <View>
              <Text style={styles.dateRangeTitle}>Date Range Filter</Text>
              <Text style={styles.dateRangeValue}>
                {fromDate && toDate
                  ? `${formatSuperAdminDate(fromDate)} → ${formatSuperAdminDate(
                      toDate,
                    )}`
                  : selectedPreset}
              </Text>
            </View>
          </View>
          <View style={styles.dateChangeBtn}>
            <Text style={styles.dateChangeBtnText}>Change</Text>
          </View>
        </TouchableOpacity>

        {/* SEARCH & FILTERS CONTROLS */}
        <View style={styles.filterCard}>
          <View style={styles.searchRow}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${activeTab.toLowerCase()} reports...`}
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => setSearch('')}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dropdownsRow}>
            <TouchableOpacity
              style={[
                styles.dropdownBtn,
                branchFilter !== 'all' && styles.dropdownBtnActive,
              ]}
              onPress={() => setBranchModalVisible(true)}>
              <Text
                style={[
                  styles.dropdownBtnText,
                  branchFilter !== 'all' && styles.dropdownBtnTextActive,
                ]}
                numberOfLines={1}>
                {branchFilter === 'all'
                  ? 'All Branches'
                  : filterOptions.branches.find(
                      b => String(b.id) === String(branchFilter),
                    )?.name || 'Branch Filter'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dropdownBtn,
                statusFilter !== 'all' && styles.dropdownBtnActive,
              ]}
              onPress={() => setStatusModalVisible(true)}>
              <Text
                style={[
                  styles.dropdownBtnText,
                  statusFilter !== 'all' && styles.dropdownBtnTextActive,
                ]}
                numberOfLines={1}>
                {statusFilter === 'all'
                  ? 'All Status'
                  : filterOptions.statuses.find(
                      s => String(s.id) === String(statusFilter),
                    )?.name || 'Status Filter'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>

            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={handleClearFilters}>
                <Text style={styles.resetFilterBtnText}>✕ Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* EXPORT ACTION BUTTON */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={[styles.exportBtn, styles.exportBtnPrimary]}
            onPress={handleExport}>
            <Text style={[styles.exportBtnText, styles.exportBtnTextPrimary]}>
              📥 Export {activeTab} Report (Excel)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ERROR STATE */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => loadData(true)}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* LOADING STATE */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={styles.loadingText}>
              Loading {activeTab.toLowerCase()} report metrics...
            </Text>
          </View>
        ) : (
          <>
            {/* ============================================================
                TAB 1: OVERVIEW
                ============================================================ */}
            {activeTab === 'Overview' && (
              <>
                <View style={styles.statsGrid}>
                  {statCards.map(stat => (
                    <View key={stat.label} style={styles.statCard}>
                      <View style={styles.statCardTopRow}>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                        <View
                          style={[
                            styles.statIconBadge,
                            {backgroundColor: stat.bg},
                          ]}>
                          <Text style={styles.statIcon}>{stat.icon}</Text>
                        </View>
                      </View>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statSub}>{stat.sub}</Text>
                    </View>
                  ))}
                </View>

                {/* RECENT INVESTMENTS SUMMARY */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Recent Investment Records
                  </Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>Live Data</Text>
                  </View>
                </View>

                {investments.slice(0, 6).map((inv, idx) => {
                  const badge = getStatusBadge(inv.status_name);
                  return (
                    <TouchableOpacity
                      key={`overview-card-${inv.investment_id}-${idx}`}
                      style={styles.reportCard}
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetails(inv)}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardIdWrap}>
                          <Text style={styles.cardIdTag}>
                            {inv.investment_id}
                          </Text>
                          <Text style={styles.cardDateTag}>
                            {formatSuperAdminDate(inv.investment_date)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            {backgroundColor: badge.bg},
                          ]}>
                          <View
                            style={[
                              styles.statusDot,
                              {backgroundColor: badge.dot},
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusPillText,
                              {color: badge.fg},
                            ]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.cardTitle}>{inv.investor_name}</Text>
                      <Text style={styles.cardSubtitle}>
                        {inv.branch_name} • Admin: {inv.admin_name}
                      </Text>

                      <View style={styles.metricsGrid}>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>AMOUNT</Text>
                          <Text style={styles.metricVal}>
                            {formatINR(inv.investment_amount)}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>RATE</Text>
                          <Text style={styles.metricValGold}>
                            {inv.interest_rate}% p.a.
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>EXPECTED INT.</Text>
                          <Text style={styles.metricValGreen}>
                            {formatINR(inv.expected_interest_amount)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.cardBottomRow}>
                        <Text style={styles.cardMetaText}>
                          Matures: {formatSuperAdminDate(inv.maturity_date)}
                        </Text>
                        <View style={styles.cardActionBtn}>
                          <Text style={styles.cardActionBtnText}>
                            View Details →
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* ============================================================
                TAB 2: INVESTMENTS
                ============================================================ */}
            {activeTab === 'Investments' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Investments Report</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {investments.length} Records
                    </Text>
                  </View>
                </View>

                {investments.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>📈</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Investments Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Reports matching your selected filters will appear here.
                    </Text>
                    {hasActiveFilters && (
                      <TouchableOpacity
                        style={styles.clearFiltersBtn}
                        onPress={handleClearFilters}>
                        <Text style={styles.clearFiltersBtnText}>
                          Clear Filters
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  investments.map((inv, idx) => {
                    const badge = getStatusBadge(inv.status_name);
                    return (
                      <TouchableOpacity
                        key={`inv-report-${inv.investment_id}-${idx}`}
                        style={styles.reportCard}
                        activeOpacity={0.8}
                        onPress={() => handleOpenDetails(inv)}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              {inv.investment_id}
                            </Text>
                            <Text style={styles.cardDateTag}>
                              {formatSuperAdminDate(inv.investment_date)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{inv.investor_name}</Text>
                        <Text style={styles.cardSubtitle}>
                          Investor ID: {inv.investor_id} • Branch:{' '}
                          {inv.branch_name}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>AMOUNT</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(inv.investment_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>RATE</Text>
                            <Text style={styles.metricValGold}>
                              {inv.interest_rate}% p.a.
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXP. INTEREST</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(inv.expected_interest_amount)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardBottomRow}>
                          <Text style={styles.cardMetaText}>
                            Admin: {inv.admin_name} • Matures:{' '}
                            {formatSuperAdminDate(inv.maturity_date)}
                          </Text>
                          <View style={styles.cardActionBtn}>
                            <Text style={styles.cardActionBtnText}>
                              View Details →
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}

            {/* ============================================================
                TAB 3: INVESTORS
                ============================================================ */}
            {activeTab === 'Investors' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Investors Report</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {investors.length} Investors
                    </Text>
                  </View>
                </View>

                {investors.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>👥</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Investors Found</Text>
                    <Text style={styles.emptySubtitle}>
                      No investor records matching current filters.
                    </Text>
                  </View>
                ) : (
                  investors.map((inv, idx) => {
                    const badge = getStatusBadge(inv.status);
                    return (
                      <View
                        key={`investor-card-${inv.investor_id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              {inv.investor_id}
                            </Text>
                            <Text style={styles.cardDateTag}>
                              {formatSuperAdminDate(inv.created_date)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{inv.name}</Text>
                        <Text style={styles.cardSubtitle}>
                          {inv.branch_name} • {inv.mobile}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>TOTAL INVESTED</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(inv.total_invested)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>BONDS COUNT</Text>
                            <Text style={styles.metricValGold}>
                              {inv.investment_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>TOTAL INTEREST</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(inv.total_interest)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* ============================================================
                TAB 4: ADMINS
                ============================================================ */}
            {activeTab === 'Admins' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Admins Report</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {admins.length} Admins
                    </Text>
                  </View>
                </View>

                {admins.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>🛡️</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Admins Found</Text>
                    <Text style={styles.emptySubtitle}>
                      No admin records match the criteria.
                    </Text>
                  </View>
                ) : (
                  admins.map((adm, idx) => {
                    const badge = getStatusBadge(adm.status);
                    return (
                      <View
                        key={`admin-card-${adm.admin_id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>{adm.admin_id}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{adm.name}</Text>
                        <Text style={styles.cardSubtitle}>
                          Branch: {adm.branch_name} • {adm.email}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>INVESTORS</Text>
                            <Text style={styles.metricVal}>
                              {adm.investor_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>BONDS MANAGED</Text>
                            <Text style={styles.metricValGold}>
                              {adm.investment_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PORTFOLIO AUM</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(adm.total_aum)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* ============================================================
                TAB 5: MATURITY
                ============================================================ */}
            {activeTab === 'Maturity' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Maturity Timeline</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {maturityReports.length} Scheduled
                    </Text>
                  </View>
                </View>

                {maturityReports.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>📅</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Maturity Records</Text>
                    <Text style={styles.emptySubtitle}>
                      No investments scheduled for maturity in this period.
                    </Text>
                  </View>
                ) : (
                  maturityReports.map((inv, idx) => {
                    const badge = getStatusBadge(inv.status_name);
                    return (
                      <TouchableOpacity
                        key={`maturity-card-${inv.investment_id}-${idx}`}
                        style={styles.reportCard}
                        activeOpacity={0.8}
                        onPress={() => handleOpenDetails(inv)}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              {inv.investment_id}
                            </Text>
                            <Text style={styles.cardDateTag}>
                              Matures: {formatSuperAdminDate(inv.maturity_date)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{inv.investor_name}</Text>
                        <Text style={styles.cardSubtitle}>
                          Branch: {inv.branch_name} • Tenure:{' '}
                          {inv.tenure_months} Months
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PRINCIPAL</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(inv.investment_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXPECTED INT.</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(inv.expected_interest_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>MATURITY VALUE</Text>
                            <Text style={styles.metricValGold}>
                              {formatINR(
                                inv.maturity_amount ||
                                  inv.investment_amount +
                                    inv.expected_interest_amount,
                              )}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}

            {/* ============================================================
                TAB 6: INTEREST
                ============================================================ */}
            {activeTab === 'Interest' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Interest Rankings (Highest First)
                  </Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {interestReports.length} Ranked
                    </Text>
                  </View>
                </View>

                {interestReports.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>％</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Interest Data</Text>
                    <Text style={styles.emptySubtitle}>
                      No investments with calculated interest records.
                    </Text>
                  </View>
                ) : (
                  interestReports.map((inv, idx) => (
                    <TouchableOpacity
                      key={`interest-card-${inv.investment_id}-${idx}`}
                      style={styles.reportCard}
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetails(inv)}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardIdWrap}>
                          <Text style={styles.cardIdTag}>#{idx + 1}</Text>
                          <Text style={styles.cardDateTag}>
                            {inv.investment_id}
                          </Text>
                        </View>
                        <Text style={styles.metricValGreen}>
                          +{formatINR(inv.expected_interest_amount)}
                        </Text>
                      </View>

                      <Text style={styles.cardTitle}>{inv.investor_name}</Text>
                      <Text style={styles.cardSubtitle}>
                        Principal: {formatINR(inv.investment_amount)} • Rate:{' '}
                        {inv.interest_rate}% p.a.
                      </Text>

                      <View style={styles.metricsGrid}>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>MONTHLY PAYOUT</Text>
                          <Text style={styles.metricVal}>
                            {formatINR(
                              inv.tenure_months > 0
                                ? inv.expected_interest_amount /
                                    inv.tenure_months
                                : 0,
                            )}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>TENURE</Text>
                          <Text style={styles.metricValGold}>
                            {inv.tenure_months} Months
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>BRANCH</Text>
                          <Text style={styles.metricVal} numberOfLines={1}>
                            {inv.branch_name}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            {/* ============================================================
                TAB 7: SETTLEMENT
                ============================================================ */}
            {activeTab === 'Settlement' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Settlements Report</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {settlements.length} Records
                    </Text>
                  </View>
                </View>

                {settlements.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>💳</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Settlements Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Settlement requests and payouts will appear here.
                    </Text>
                  </View>
                ) : (
                  settlements.map((sett, idx) => {
                    const badge = getStatusBadge(sett.status);
                    return (
                      <View
                        key={`settlement-card-${sett.settlement_id || sett.id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              {sett.investment_id || sett.settlement_id}
                            </Text>
                            <Text style={styles.cardDateTag}>
                              {sett.settlement_type}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{sett.investor_name}</Text>
                        <Text style={styles.cardSubtitle}>
                          Branch: {sett.branch_name} • Requested:{' '}
                          {formatSuperAdminDate(sett.requested_date)}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PRINCIPAL</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(sett.principal_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>INTEREST</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(sett.interest_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>NET SETTLED</Text>
                            <Text style={styles.metricValGold}>
                              {formatINR(sett.net_settlement_amount)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* ============================================================
                TAB 8: BRANCHES
                ============================================================ */}
            {activeTab === 'Branches' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Branch Performance</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {branchReports.length} Branches
                    </Text>
                  </View>
                </View>

                {branchReports.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>🏢</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Branch Data</Text>
                    <Text style={styles.emptySubtitle}>
                      Branch summary records will appear here.
                    </Text>
                  </View>
                ) : (
                  branchReports.map((br, idx) => (
                    <View
                      key={`branch-card-${br.branch_id || br.branch_name}-${idx}`}
                      style={styles.reportCard}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle}>{br.branch_name}</Text>
                        <Text style={styles.cardDateTag}>
                          {br.investor_count} Investors • {br.investment_count}{' '}
                          Bonds
                        </Text>
                      </View>

                      <View style={styles.metricsGrid}>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>PRINCIPAL AUM</Text>
                          <Text style={styles.metricVal}>
                            {formatINR(br.principal_amount)}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>TOTAL INTEREST</Text>
                          <Text style={styles.metricValGreen}>
                            {formatINR(br.expected_interest)}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>MATURITY VALUE</Text>
                          <Text style={styles.metricValGold}>
                            {formatINR(br.maturity_amount)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* ============================================================
                TAB 9: MONTHLY
                ============================================================ */}
            {activeTab === 'Monthly' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Monthly Time-Series</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {monthlyReports.length} Months
                    </Text>
                  </View>
                </View>

                {monthlyReports.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>📊</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Monthly Data</Text>
                    <Text style={styles.emptySubtitle}>
                      Monthly breakdown will appear once investments are active.
                    </Text>
                  </View>
                ) : (
                  monthlyReports.map((mo, idx) => (
                    <View
                      key={`monthly-card-${mo.month}-${idx}`}
                      style={styles.reportCard}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle}>Month: {mo.month}</Text>
                        <Text style={styles.cardDateTag}>
                          {mo.investor_count} Investors • {mo.investment_count}{' '}
                          Bonds
                        </Text>
                      </View>

                      <View style={styles.metricsGrid}>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>TOTAL INVESTED</Text>
                          <Text style={styles.metricVal}>
                            {formatINR(mo.principal_amount)}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>EXP. INTEREST</Text>
                          <Text style={styles.metricValGreen}>
                            {formatINR(mo.expected_interest)}
                          </Text>
                        </View>
                        <View style={styles.metricCol}>
                          <Text style={styles.metricLabel}>MATURITY</Text>
                          <Text style={styles.metricValGold}>
                            {formatINR(mo.maturity_amount)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}

            {/* ============================================================
                TAB 10: EXTENSIONS
                ============================================================ */}
            {activeTab === 'Extensions' && (
              <>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    Tenure Extensions Report
                  </Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>
                      {extensions.length} Requests
                    </Text>
                  </View>
                </View>

                {extensions.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>⏳</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Extensions Found</Text>
                    <Text style={styles.emptySubtitle}>
                      Tenure extension requests will appear here.
                    </Text>
                  </View>
                ) : (
                  extensions.map((ext, idx) => {
                    const badge = getStatusBadge(ext.status);
                    return (
                      <View
                        key={`extension-card-${ext.extension_id || ext.id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              {ext.investment_id || ext.extension_id}
                            </Text>
                            <Text style={styles.cardDateTag}>
                              Requested:{' '}
                              {formatSuperAdminDate(ext.requested_date)}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusPill,
                              {backgroundColor: badge.bg},
                            ]}>
                            <View
                              style={[
                                styles.statusDot,
                                {backgroundColor: badge.dot},
                              ]}
                            />
                            <Text
                              style={[
                                styles.statusPillText,
                                {color: badge.fg},
                              ]}>
                              {badge.label}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.cardTitle}>{ext.investor_name}</Text>
                        <Text style={styles.cardSubtitle}>
                          Branch: {ext.branch_name}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PREV. TENURE</Text>
                            <Text style={styles.metricVal}>
                              {ext.previous_tenure_months}M
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXTENSION</Text>
                            <Text style={styles.metricValGold}>
                              +{ext.extended_months}M
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>NEW TENURE</Text>
                            <Text style={styles.metricValGreen}>
                              {ext.new_tenure_months}M
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* ============================================================
          INVESTMENT DETAILS MODAL
          ============================================================ */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Investment Report Details</Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailsLoading || !selectedInvestment ? (
              <View style={{padding: 30, alignItems: 'center'}}>
                <ActivityIndicator size="small" color="#0B1E45" />
                <Text style={{marginTop: 8, color: '#6B7280'}}>
                  Loading details...
                </Text>
              </View>
            ) : (
              <ScrollView style={{maxHeight: 380}}>
                {[
                  ['Investment ID', selectedInvestment.investment_id],
                  ['Investor Name', selectedInvestment.investor_name],
                  ['Investor ID', selectedInvestment.investor_id],
                  ['Branch Name', selectedInvestment.branch_name],
                  ['Admin Name', selectedInvestment.admin_name],
                  ['Super Admin', selectedInvestment.superadmin_name],
                  [
                    'Principal Amount',
                    formatINR(selectedInvestment.investment_amount),
                  ],
                  [
                    'Interest Rate',
                    `${selectedInvestment.interest_rate}% p.a.`,
                  ],
                  [
                    'Tenure Months',
                    `${selectedInvestment.tenure_months} Months`,
                  ],
                  [
                    'Investment Date',
                    formatSuperAdminDate(selectedInvestment.investment_date),
                  ],
                  [
                    'Maturity Date',
                    formatSuperAdminDate(selectedInvestment.maturity_date),
                  ],
                  [
                    'Expected Interest',
                    formatINR(selectedInvestment.expected_interest_amount),
                  ],
                  [
                    'Maturity Amount',
                    formatINR(selectedInvestment.maturity_amount),
                  ],
                  ['Status', selectedInvestment.status_name],
                ].map(([label, val]) => (
                  <View key={label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{label}</Text>
                    <Text style={styles.detailVal}>{val}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          BRANCH FILTER MODAL
          ============================================================ */}
      <Modal
        visible={branchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBranchModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter by Branch</Text>
              <TouchableOpacity
                onPress={() => setBranchModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 300}}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  branchFilter === 'all' && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setBranchFilter('all');
                  setBranchModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    branchFilter === 'all' && styles.dropdownItemTextActive,
                  ]}>
                  All Branches
                </Text>
              </TouchableOpacity>
              {filterOptions.branches.map(b => {
                const isSelected = String(branchFilter) === String(b.id);
                return (
                  <TouchableOpacity
                    key={`branch-opt-${b.id}`}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setBranchFilter(String(b.id));
                      setBranchModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                      ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          STATUS FILTER MODAL
          ============================================================ */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter by Status</Text>
              <TouchableOpacity
                onPress={() => setStatusModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{maxHeight: 300}}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  statusFilter === 'all' && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setStatusFilter('all');
                  setStatusModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    statusFilter === 'all' && styles.dropdownItemTextActive,
                  ]}>
                  All Statuses
                </Text>
              </TouchableOpacity>
              {filterOptions.statuses.map(s => {
                const isSelected = String(statusFilter) === String(s.id);
                return (
                  <TouchableOpacity
                    key={`status-opt-${s.id}`}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setStatusFilter(String(s.id));
                      setStatusModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                      ]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          DATE RANGE PRESETS MODAL
          ============================================================ */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity
                onPress={() => setDateModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: '#64748B',
                fontWeight: '600',
                marginBottom: 10,
              }}>
              QUICK PRESETS
            </Text>

            <View style={styles.presetChipRow}>
              {DATE_PRESETS.map(preset => {
                const isSelected = selectedPreset === preset.label;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.presetChip,
                      isSelected && styles.presetChipActive,
                    ]}
                    onPress={() => {
                      setSelectedPreset(preset.label);
                      setFromDate(preset.from);
                      setToDate(preset.to);
                      setDateModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.presetChipText,
                        isSelected && styles.presetChipTextActive,
                      ]}>
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setDateModalVisible(false)}>
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SuperAdminBottomTabBar navigation={navigation} active="More" />
    </SafeAreaView>
  );
};

export default SuperAdminReportsScreen;