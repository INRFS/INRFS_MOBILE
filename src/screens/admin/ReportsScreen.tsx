import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import {COLORS, styles} from '../../styles/admin/ReportsScreen.styles';
import {
  getReportFilters,
  getReportDashboard,
  getReportSummary,
  getReportInvestments,
  getMonthlyInvestments,
  getInvestorGrowth,
  getStatusDistribution,
  exportReportCSV,
  normalizeInvestment,
  NormalizedInvestment,
  ReportFilterBranch,
  ReportFilterStatus,
  ReportSummaryData,
  MonthlyInvestmentItem,
  InvestorGrowthItem,
  StatusDistributionItem,
} from '../../services/admin/reportService';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type ReportTab =
  | 'Overview'
  | 'Investors'
  | 'Investments'
  | 'Maturity'
  | 'Interest'
  | 'Settlement'
  | 'Branches'
  | 'Monthly';

const TABS: {key: ReportTab; label: string; icon: string}[] = [
  {key: 'Overview', label: 'Overview', icon: '📊'},
  {key: 'Investors', label: 'Investors', icon: '👥'},
  {key: 'Investments', label: 'Investments', icon: '📈'},
  {key: 'Maturity', label: 'Maturity', icon: '📅'},
  {key: 'Interest', label: 'Interest', icon: '％'},
  {key: 'Settlement', label: 'Settlement', icon: '💳'},
  {key: 'Branches', label: 'Branches', icon: '🏢'},
  {key: 'Monthly', label: 'Monthly', icon: '📆'},
];

interface InvestorGroup {
  investorId: string;
  investor: string;
  branch: string;
  count: number;
  amount: number;
  interest: number;
  active: number;
  pending: number;
  settled: number;
  items: NormalizedInvestment[];
}

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */

const formatINR = (value: number | null | undefined): string => {
  const n = Math.round(Number(value) || 0);
  return '₹' + n.toLocaleString('en-IN');
};

const formatINRCompact = (value: number | null | undefined): string => {
  const n = Number(value) || 0;
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)} K`;
  return formatINR(n);
};

const formatDisplayDate = (value: string | null | undefined): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadgeConfig = (status: string) => {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'active' || s === 'approved') {
    return {badgeStyle: styles.statusBadgeActive, textStyle: styles.statusTextActive, label: '● Active'};
  }
  if (s.includes('pending') || s.includes('submitted')) {
    return {badgeStyle: styles.statusBadgePending, textStyle: styles.statusTextPending, label: '● Pending'};
  }
  if (s === 'settled' || s === 'closed' || s === 'refunded') {
    return {badgeStyle: styles.statusBadgeClosed, textStyle: styles.statusTextClosed, label: '● Closed'};
  }
  if (s.includes('reject')) {
    return {badgeStyle: styles.statusBadgeRejected, textStyle: styles.statusTextRejected, label: '● Rejected'};
  }
  return {badgeStyle: styles.statusBadgeClosed, textStyle: styles.statusTextClosed, label: `● ${status || 'Unknown'}`};
};

/* ============================================================
   MAIN SCREEN COMPONENT
   ============================================================ */

const ReportsScreen = ({navigation}: any) => {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  // Screen State
  const [year, setYear] = useState<number>(currentYear);
  const [activeTab, setActiveTab] = useState<ReportTab>('Overview');
  const [search, setSearch] = useState<string>('');
  const [branch, setBranch] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  // Data State
  const [investments, setInvestments] = useState<NormalizedInvestment[]>([]);
  const [summary, setSummary] = useState<ReportSummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyInvestmentItem[]>([]);
  const [investorGrowth, setInvestorGrowth] = useState<InvestorGrowthItem[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistributionItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    branches: ReportFilterBranch[];
    statuses: ReportFilterStatus[];
  }>({branches: [], statuses: []});

  // UI State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Modals State
  const [selectedInvestment, setSelectedInvestment] = useState<NormalizedInvestment | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorGroup | null>(null);
  const [yearPickerVisible, setYearPickerVisible] = useState<boolean>(false);
  const [branchPickerVisible, setBranchPickerVisible] = useState<boolean>(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState<boolean>(false);

  /* ============================================================
     API DATA LOADING
     ============================================================ */

  const loadReports = useCallback(async () => {
    try {
      setError('');
      setRefreshing(true);

      // 1. Filters API
      try {
        const filterRes = await getReportFilters();
        if (filterRes) {
          setFilterOptions({
            branches: Array.isArray(filterRes.branches)
              ? filterRes.branches
              : filterRes.branch
              ? [filterRes.branch]
              : [],
            statuses: Array.isArray(filterRes.statuses) ? filterRes.statuses : [],
          });
        }
      } catch (err: any) {
        console.warn('Admin Reports filters error:', err?.message || err);
      }

      // 2. All Investments with auto-pagination (limit <= 100 per chunk, all: true)
      try {
        const invRes = await getReportInvestments({all: true});
        const rawList = Array.isArray(invRes?.data) ? invRes.data : [];
        setInvestments(rawList.map(normalizeInvestment));
      } catch (err: any) {
        console.warn('Admin Reports investments error:', err?.message || err);
        setError(`Failed to load investments: ${err?.message || err}`);
        setInvestments([]);
      }

      // 3. Authoritative Summary
      try {
        const sumRes = await getReportSummary(year);
        setSummary(sumRes?.data || null);
      } catch (err: any) {
        console.warn('Admin Reports summary error:', err?.message || err);
        setSummary(null);
      }

      // 4. Official Monthly Investments Time-Series
      try {
        const monRes = await getMonthlyInvestments(year);
        setMonthly(Array.isArray(monRes?.data) ? monRes.data : []);
      } catch (err: any) {
        console.warn('Admin Reports monthly error:', err?.message || err);
        setMonthly([]);
      }

      // 5. Official Investor Growth Dataset
      try {
        const groRes = await getInvestorGrowth(year);
        setInvestorGrowth(Array.isArray(groRes?.data) ? groRes.data : []);
      } catch (err: any) {
        console.warn('Admin Reports growth error:', err?.message || err);
        setInvestorGrowth([]);
      }

      // 6. Official Status Distribution Dataset
      try {
        const statRes = await getStatusDistribution(year);
        setStatusDistribution(Array.isArray(statRes?.data) ? statRes.data : []);
      } catch (err: any) {
        console.warn('Admin Reports status distribution error:', err?.message || err);
        setStatusDistribution([]);
      }

      setLastUpdated(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    } catch (err: any) {
      console.warn('Reports loading error:', err);
      setError(err?.message || 'Unable to load reports from server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  /* ============================================================
     DERIVED DATA & FILTERS (Computed from Real Backend Records)
     ============================================================ */

  const branchList = useMemo(() => {
    if (filterOptions.branches.length > 0) {
      return filterOptions.branches.map(b => b.branch_name).filter(Boolean);
    }
    return Array.from(new Set(investments.map(i => i.branch).filter(Boolean))).sort();
  }, [filterOptions.branches, investments]);

  const statusList = useMemo(() => {
    if (filterOptions.statuses.length > 0) {
      return filterOptions.statuses.map(s => s.status_name).filter(Boolean);
    }
    return ['Active', 'Pending Approval', 'Closed', 'Rejected'];
  }, [filterOptions.statuses]);

  const filteredInvestments = useMemo(() => {
    const q = search.trim().toLowerCase();

    return investments.filter(item => {
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.investor.toLowerCase().includes(q) ||
        item.investorId.toLowerCase().includes(q);

      const matchesBranch = branch === 'all' || item.branch === branch;

      const matchesStatus =
        status === 'all' ||
        item.status.toLowerCase() === status.toLowerCase() ||
        (status.toLowerCase() === 'pending' && item.status.toLowerCase().includes('pending')) ||
        (status.toLowerCase() === 'settled' &&
          ['settled', 'closed', 'refunded'].includes(item.status.toLowerCase()));

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [investments, search, branch, status]);

  // Group investors from real backend records
  const investorGroups = useMemo<InvestorGroup[]>(() => {
    const map = new Map<string, InvestorGroup>();

    filteredInvestments.forEach(item => {
      if (!map.has(item.investorId)) {
        map.set(item.investorId, {
          investorId: item.investorId,
          investor: item.investor,
          branch: item.branch,
          count: 0,
          amount: 0,
          interest: 0,
          active: 0,
          pending: 0,
          settled: 0,
          items: [],
        });
      }

      const row = map.get(item.investorId)!;
      row.count += 1;
      row.amount += item.amount;
      row.interest += item.interest;
      row.items.push(item);

      const s = item.status.toLowerCase();
      if (s === 'active' || s === 'approved') row.active += 1;
      if (s.includes('pending') || s.includes('submitted')) row.pending += 1;
      if (s === 'settled' || s === 'closed' || s === 'refunded') row.settled += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredInvestments]);

  // Settled records for Settlement Tab
  const settledInvestments = useMemo(() => {
    return filteredInvestments.filter(i =>
      ['settled', 'closed', 'refunded'].includes(i.status.toLowerCase()),
    );
  }, [filteredInvestments]);

  // Branch statistics for Branches Tab
  const branchPerformance = useMemo(() => {
    const list = branchList.length > 0 ? branchList : ['Main Branch'];
    return list.map(branchName => {
      const branchRows = investments.filter(i => i.branch === branchName);
      const uniqueInvestors = new Set(branchRows.map(i => i.investorId)).size;
      const totalAmount = branchRows.reduce((sum, i) => sum + i.amount, 0);

      return {
        branch: branchName,
        investors: uniqueInvestors,
        investments: branchRows.length,
        amount: totalAmount,
      };
    });
  }, [branchList, investments]);

  // Summary Metrics (Authoritative backend summary supplemented with filtered active/pending)
  const overviewStats = useMemo(() => {
    const totalPrincipal =
      summary?.new_investments != null && summary.new_investments > 0
        ? summary.new_investments
        : filteredInvestments.reduce((sum, i) => sum + i.amount, 0);

    const activeSum = filteredInvestments
      .filter(i => ['active', 'approved'].includes(i.status.toLowerCase()))
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingSum = filteredInvestments
      .filter(i => i.status.toLowerCase().includes('pending'))
      .reduce((sum, i) => sum + i.amount, 0);

    const totalInterestPaid =
      summary?.interest_paid != null && summary.interest_paid > 0
        ? summary.interest_paid
        : filteredInvestments.reduce((sum, i) => sum + i.interest, 0);

    const uniqueInvestorsCount = new Set(investments.map(i => i.investorId)).size;

    return {
      totalInvestors: uniqueInvestorsCount,
      totalInvestments: filteredInvestments.length,
      totalPortfolio: totalPrincipal,
      activePortfolio: activeSum,
      pendingValue: pendingSum,
      interestPaid: totalInterestPaid,
    };
  }, [summary, filteredInvestments, investments]);

  /* ============================================================
     EXPORT HANDLERS
     ============================================================ */

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);

    try {
      let exportRows: any[] = [];
      let filename = `INRFS_${activeTab}_Report_${year}.xlsx`;

      switch (activeTab) {
        case 'Overview':
        case 'Investments':
        case 'Maturity':
        case 'Interest':
          exportRows = filteredInvestments.map(i => ({
            'Investment ID': i.id,
            'Investor ID': i.investorId,
            'Investor Name': i.investor,
            Branch: i.branch,
            'Principal (₹)': i.amount,
            'Rate (%)': i.rate,
            'Tenure (Months)': i.tenureMonths,
            'Investment Date': formatDisplayDate(i.invested),
            'Maturity Date': formatDisplayDate(i.maturity),
            'Expected Interest (₹)': i.interest,
            Status: i.status,
          }));
          break;

        case 'Investors':
          exportRows = investorGroups.map(inv => ({
            'Investor ID': inv.investorId,
            Investor: inv.investor,
            Branch: inv.branch,
            'Total Invested (₹)': inv.amount,
            'Expected Interest (₹)': inv.interest,
            'Investment Count': inv.count,
            Active: inv.active,
            Pending: inv.pending,
            Settled: inv.settled,
          }));
          break;

        case 'Settlement':
          exportRows = settledInvestments.map(i => ({
            'Investment ID': i.id,
            'Investor ID': i.investorId,
            'Investor Name': i.investor,
            'Principal (₹)': i.amount,
            'Interest (₹)': i.interest,
            Status: i.status,
          }));
          break;

        case 'Branches':
          exportRows = branchPerformance.map(b => ({
            Branch: b.branch,
            'Investor Count': b.investors,
            'Investment Count': b.investments,
            'Total Portfolio (₹)': b.amount,
          }));
          break;

        case 'Monthly':
          exportRows = monthly.map(m => ({
            Month: m.month_name,
            'Invested Amount (₹)': m.invested_amount,
            'Interest Paid (₹)': m.interest_paid,
          }));
          break;
      }

      if (!exportRows.length) {
        Alert.alert('Export', 'No records found to export.');
        return;
      }

      await exportReportCSV(exportRows, filename);
    } catch (err: any) {
      console.warn('Export error:', err);
      Alert.alert('Export Failed', err?.message || 'Unable to export report.');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadSingleInvestment = async (item: NormalizedInvestment) => {
    try {
      const rows = [
        {
          'Investment ID': item.id,
          'Investor ID': item.investorId,
          'Investor Name': item.investor,
          Branch: item.branch,
          'Principal (₹)': item.amount,
          'Rate (%)': item.rate,
          'Tenure (Months)': item.tenureMonths,
          'Investment Date': formatDisplayDate(item.invested),
          'Maturity Date': formatDisplayDate(item.maturity),
          'Expected Interest (₹)': item.interest,
          Status: item.status,
        },
      ];
      await exportReportCSV(rows, `${item.id}_Report.xlsx`);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Unable to download investment.');
    }
  };

  const handleDownloadInvestorPortfolio = async (inv: InvestorGroup) => {
    try {
      const rows = inv.items.map(item => ({
        'Investment ID': item.id,
        'Investor ID': item.investorId,
        'Investor Name': item.investor,
        Branch: item.branch,
        'Principal (₹)': item.amount,
        'Rate (%)': item.rate,
        'Tenure (Months)': item.tenureMonths,
        'Investment Date': formatDisplayDate(item.invested),
        'Maturity Date': formatDisplayDate(item.maturity),
        'Expected Interest (₹)': item.interest,
        Status: item.status,
      }));
      await exportReportCSV(rows, `${inv.investorId}_Portfolio.xlsx`);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Unable to download portfolio.');
    }
  };

  /* ============================================================
     MODAL SELECTION HANDLERS
     ============================================================ */

  const openInvestorFromInvestment = (item: NormalizedInvestment) => {
    const inv = investorGroups.find(x => x.investorId === item.investorId);
    if (inv) {
      setSelectedInvestor(inv);
    }
  };

  /* ============================================================
     RENDER TAB VIEWS
     ============================================================ */

  const renderOverviewTab = () => {
    const maxMonthly = Math.max(...monthly.map(m => m.invested_amount), 1);
    const recentInvestments = filteredInvestments.slice(0, 5);

    return (
      <View>
        {/* Hero Card */}
        <View style={styles.heroOverviewCard}>
          <View style={styles.heroHeadRow}>
            <Text style={styles.heroEyebrow}>PORTFOLIO OVERVIEW</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>Live Data</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>{formatINR(overviewStats.totalPortfolio)}</Text>
          <Text style={styles.heroSubtitle}>Total investment principal under management</Text>

          <View style={styles.heroMetricsGrid}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>INVESTORS</Text>
              <Text style={styles.heroMetricValue}>{overviewStats.totalInvestors}</Text>
            </View>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>ACTIVE</Text>
              <Text style={styles.heroMetricValue}>{formatINRCompact(overviewStats.activePortfolio)}</Text>
            </View>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>PENDING</Text>
              <Text style={styles.heroMetricValue}>{formatINRCompact(overviewStats.pendingValue)}</Text>
            </View>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>INTEREST</Text>
              <Text style={styles.heroMetricValue}>{formatINRCompact(overviewStats.interestPaid)}</Text>
            </View>
          </View>
        </View>

        {/* Monthly Investment Value Chart (Backend API) */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>MONTHLY TREND</Text>
              <Text style={styles.panelTitle}>Investment Value ({year})</Text>
              <Text style={styles.panelSubtitle}>Official monthly performance from backend</Text>
            </View>
          </View>

          {monthly.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptySubtitle}>No monthly trend data reported for {year}.</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <View style={styles.chartBarsRow}>
                {monthly.map(m => {
                  const heightPercent = Math.max(8, Math.round((m.invested_amount / maxMonthly) * 100));
                  return (
                    <View key={m.month_number} style={styles.chartBarCol}>
                      <View style={[styles.chartBar, {height: `${heightPercent}%`}]} />
                      <Text style={styles.chartBarLabel}>{m.month_name}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartLegendRow}>
                <View style={styles.chartLegendItem}>
                  <View style={[styles.chartLegendDot, {backgroundColor: COLORS.blue}]} />
                  <Text style={styles.chartLegendLabel}>Invested Amount</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Recent Investments Section */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>INVESTMENTS</Text>
              <Text style={styles.panelTitle}>Recent Investments</Text>
              <Text style={styles.panelSubtitle}>Latest 5 backend investment accounts</Text>
            </View>
            <TouchableOpacity
              style={styles.panelActionBtn}
              onPress={() => setActiveTab('Investments')}>
              <Text style={styles.panelActionBtnText}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentInvestments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptySubtitle}>No investments found.</Text>
            </View>
          ) : (
            recentInvestments.map(item => renderInvestmentCard(item))
          )}
        </View>
      </View>
    );
  };

  const renderInvestorsTab = () => {
    const totalInvested = investorGroups.reduce((sum, i) => sum + i.amount, 0);
    const totalExpectedInterest = investorGroups.reduce((sum, i) => sum + i.interest, 0);
    const maxInvestorAmount = Math.max(...investorGroups.map(i => i.amount), 1);
    const topInvestors = investorGroups.slice(0, 6);

    return (
      <View>
        {/* Summary Strip */}
        <View style={{paddingHorizontal: 16, marginTop: 12}}>
          <View style={styles.miniMetricStrip}>
            <View style={styles.miniMetricBox}>
              <Text style={styles.miniMetricLabel}>INVESTORS</Text>
              <Text style={styles.miniMetricValue}>{investorGroups.length}</Text>
            </View>
            <View style={styles.miniMetricBox}>
              <Text style={styles.miniMetricLabel}>TOTAL PORTFOLIO</Text>
              <Text style={styles.miniMetricValue}>{formatINRCompact(totalInvested)}</Text>
            </View>
            <View style={styles.miniMetricBox}>
              <Text style={styles.miniMetricLabel}>INTEREST</Text>
              <Text style={[styles.miniMetricValue, {color: COLORS.green}]}>
                {formatINRCompact(totalExpectedInterest)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Portfolios Chart */}
        {topInvestors.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelEyebrow}>VISUALIZATION</Text>
                <Text style={styles.panelTitle}>Top Investor Portfolios</Text>
                <Text style={styles.panelSubtitle}>Principal invested by top investors</Text>
              </View>
            </View>

            <View style={styles.chartBarsRow}>
              {topInvestors.map(inv => {
                const heightPercent = Math.max(10, Math.round((inv.amount / maxInvestorAmount) * 100));
                const shortName = inv.investor.split(' ')[0] || inv.investorId;
                return (
                  <View key={inv.investorId} style={styles.chartBarCol}>
                    <View style={[styles.chartBar, {height: `${heightPercent}%`}]} />
                    <Text numberOfLines={1} style={styles.chartBarLabel}>
                      {shortName}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Status Distribution (from /admin/reports/status-distribution) */}
        {statusDistribution.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelEyebrow}>DISTRIBUTION</Text>
                <Text style={styles.panelTitle}>Investment Status Distribution</Text>
                <Text style={styles.panelSubtitle}>Authoritative breakdown from backend</Text>
              </View>
            </View>

            {statusDistribution.map(item => {
              const totalCount = statusDistribution.reduce((s, x) => s + x.investment_count, 0) || 1;
              const percent = Math.round((item.investment_count / totalCount) * 100);
              const isClosed = item.status_name.toLowerCase().includes('closed');
              const isPending = item.status_name.toLowerCase().includes('pending');
              const fillBg = isPending ? COLORS.amber : isClosed ? COLORS.gray : COLORS.green;

              return (
                <View key={item.status_id} style={styles.distBarRow}>
                  <View style={styles.distBarLabelRow}>
                    <Text style={styles.distBarLabel}>{item.status_name}</Text>
                    <Text style={styles.distBarValue}>
                      {item.investment_count} ({percent}%) · {formatINRCompact(item.investment_amount)}
                    </Text>
                  </View>
                  <View style={styles.distBarTrack}>
                    <View style={[styles.distBarFill, {width: `${percent}%`, backgroundColor: fillBg}]} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Investor Growth Trend (from /admin/reports/investor-growth) */}
        {investorGrowth.length > 0 && (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.panelEyebrow}>GROWTH TREND</Text>
                <Text style={styles.panelTitle}>Investor Growth ({year})</Text>
                <Text style={styles.panelSubtitle}>New registered investors by month</Text>
              </View>
            </View>

            <View style={styles.chartBarsRow}>
              {investorGrowth.map(item => {
                const maxCount = Math.max(...investorGrowth.map(g => g.investor_count), 1);
                const heightPercent = Math.max(10, Math.round((item.investor_count / maxCount) * 100));
                return (
                  <View key={item.month_number} style={styles.chartBarCol}>
                    <View
                      style={[
                        styles.chartBar,
                        styles.chartBarAlt,
                        {height: `${heightPercent}%`},
                      ]}
                    />
                    <Text style={styles.chartBarLabel}>{item.month_name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Investor Cards List */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>PORTFOLIOS</Text>
              <Text style={styles.panelTitle}>Investors List</Text>
              <Text style={styles.panelSubtitle}>{investorGroups.length} portfolio records</Text>
            </View>
          </View>

          {investorGroups.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No investors found</Text>
              <Text style={styles.emptySubtitle}>Try changing your search or filters.</Text>
            </View>
          ) : (
            investorGroups.map(inv => (
              <View key={inv.investorId} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={styles.itemAvatarRow}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{inv.investor.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.itemTitleText}>{inv.investor}</Text>
                      <Text style={styles.itemSubText}>
                        {inv.investorId} · {inv.branch}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.itemDetailsGrid}>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>INVESTED</Text>
                    <Text style={styles.itemDetailValue}>{formatINRCompact(inv.amount)}</Text>
                  </View>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>EXPECTED</Text>
                    <Text style={styles.itemDetailValueGreen}>{formatINRCompact(inv.interest)}</Text>
                  </View>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>BONDS</Text>
                    <Text style={styles.itemDetailValue}>{inv.count}</Text>
                  </View>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>ACTIVE</Text>
                    <Text style={styles.itemDetailValue}>{inv.active}</Text>
                  </View>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>PENDING</Text>
                    <Text style={styles.itemDetailValue}>{inv.pending}</Text>
                  </View>
                  <View style={styles.itemDetailCell3}>
                    <Text style={styles.itemDetailLabel}>SETTLED</Text>
                    <Text style={styles.itemDetailValue}>{inv.settled}</Text>
                  </View>
                </View>

                <View style={styles.itemActionsRow}>
                  <TouchableOpacity
                    style={styles.itemActionBtn}
                    onPress={() => setSelectedInvestor(inv)}>
                    <Text style={styles.itemActionBtnText}>View Portfolio →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderInvestmentCard = (item: NormalizedInvestment) => {
    const badge = getStatusBadgeConfig(item.status);

    return (
      <View key={item.id} style={styles.itemCard}>
        <View style={styles.itemHeaderRow}>
          <View style={{flex: 1}}>
            <Text style={styles.itemTitleText}>{item.id}</Text>
            <Text style={styles.itemSubText}>
              {item.investor} ({item.investorId})
            </Text>
          </View>
          <View style={[styles.statusBadge, badge.badgeStyle]}>
            <Text style={[styles.statusText, badge.textStyle]}>{badge.label}</Text>
          </View>
        </View>

        <View style={styles.itemDetailsGrid}>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>PRINCIPAL</Text>
            <Text style={styles.itemDetailValue}>{formatINR(item.amount)}</Text>
          </View>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>INTEREST RATE</Text>
            <Text style={styles.itemDetailValue}>{item.rate}% p.a.</Text>
          </View>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>INVESTED DATE</Text>
            <Text style={styles.itemDetailValue}>{formatDisplayDate(item.invested)}</Text>
          </View>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>MATURITY DATE</Text>
            <Text style={styles.itemDetailValue}>{formatDisplayDate(item.maturity)}</Text>
          </View>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>EXPECTED INTEREST</Text>
            <Text style={styles.itemDetailValueGreen}>{formatINR(item.interest)}</Text>
          </View>
          <View style={styles.itemDetailCell}>
            <Text style={styles.itemDetailLabel}>BRANCH</Text>
            <Text style={styles.itemDetailValue}>{item.branch}</Text>
          </View>
        </View>

        <View style={styles.itemActionsRow}>
          <TouchableOpacity
            style={styles.itemSecondaryBtn}
            onPress={() => handleDownloadSingleInvestment(item)}>
            <Text style={styles.itemSecondaryBtnText}>📥 Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.itemActionBtn}
            onPress={() => setSelectedInvestment(item)}>
            <Text style={styles.itemActionBtnText}>View Details →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderInvestmentsTab = () => {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>INVESTMENTS</Text>
            <Text style={styles.panelTitle}>Investment Report</Text>
            <Text style={styles.panelSubtitle}>{filteredInvestments.length} investment accounts</Text>
          </View>
        </View>

        {filteredInvestments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No investments found</Text>
            <Text style={styles.emptySubtitle}>No backend investment records match the filters.</Text>
          </View>
        ) : (
          filteredInvestments.map(item => renderInvestmentCard(item))
        )}
      </View>
    );
  };

  const renderMaturityTab = () => {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>MATURITY</Text>
            <Text style={styles.panelTitle}>Maturity Report</Text>
            <Text style={styles.panelSubtitle}>Investment maturity schedule and amounts</Text>
          </View>
        </View>

        {filteredInvestments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptySubtitle}>No investments found for maturity tracking.</Text>
          </View>
        ) : (
          filteredInvestments.map(item => {
            const badge = getStatusBadgeConfig(item.status);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemTitleText}>{item.id}</Text>
                    <Text style={styles.itemSubText}>{item.investor}</Text>
                  </View>
                  <View style={[styles.statusBadge, badge.badgeStyle]}>
                    <Text style={[styles.statusText, badge.textStyle]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.itemDetailsGrid}>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>PRINCIPAL</Text>
                    <Text style={styles.itemDetailValue}>{formatINR(item.amount)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>MATURITY DATE</Text>
                    <Text style={styles.itemDetailValue}>{formatDisplayDate(item.maturity)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>EXPECTED INTEREST</Text>
                    <Text style={styles.itemDetailValueGreen}>{formatINR(item.interest)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>BRANCH</Text>
                    <Text style={styles.itemDetailValue}>{item.branch}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderInterestTab = () => {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>INTEREST</Text>
            <Text style={styles.panelTitle}>Interest Position Report</Text>
            <Text style={styles.panelSubtitle}>Expected interest by investment account</Text>
          </View>
        </View>

        {filteredInvestments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No records found</Text>
            <Text style={styles.emptySubtitle}>No investments match the current filters.</Text>
          </View>
        ) : (
          filteredInvestments.map(item => {
            const badge = getStatusBadgeConfig(item.status);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemTitleText}>{item.investor}</Text>
                    <Text style={styles.itemSubText}>{item.id}</Text>
                  </View>
                  <View style={[styles.statusBadge, badge.badgeStyle]}>
                    <Text style={[styles.statusText, badge.textStyle]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.itemDetailsGrid}>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>PRINCIPAL</Text>
                    <Text style={styles.itemDetailValue}>{formatINR(item.amount)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>RATE</Text>
                    <Text style={styles.itemDetailValue}>{item.rate}% p.a.</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>EXPECTED INTEREST</Text>
                    <Text style={styles.itemDetailValueGreen}>{formatINR(item.interest)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>BRANCH</Text>
                    <Text style={styles.itemDetailValue}>{item.branch}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderSettlementTab = () => {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>SETTLEMENT</Text>
            <Text style={styles.panelTitle}>Settlement Report</Text>
            <Text style={styles.panelSubtitle}>{settledInvestments.length} closed & settled records</Text>
          </View>
        </View>

        {settledInvestments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No settled records</Text>
            <Text style={styles.emptySubtitle}>No settled, closed, or refunded investments reported.</Text>
          </View>
        ) : (
          settledInvestments.map(item => {
            const badge = getStatusBadgeConfig(item.status);
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeaderRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.itemTitleText}>{item.id}</Text>
                    <Text style={styles.itemSubText}>{item.investor}</Text>
                  </View>
                  <View style={[styles.statusBadge, badge.badgeStyle]}>
                    <Text style={[styles.statusText, badge.textStyle]}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.itemDetailsGrid}>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>PRINCIPAL</Text>
                    <Text style={styles.itemDetailValue}>{formatINR(item.amount)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>INTEREST</Text>
                    <Text style={styles.itemDetailValueGreen}>{formatINR(item.interest)}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>BRANCH</Text>
                    <Text style={styles.itemDetailValue}>{item.branch}</Text>
                  </View>
                  <View style={styles.itemDetailCell}>
                    <Text style={styles.itemDetailLabel}>STATUS</Text>
                    <Text style={styles.itemDetailValue}>{item.status}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };

  const renderBranchesTab = () => {
    return (
      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelEyebrow}>BRANCHES</Text>
            <Text style={styles.panelTitle}>Branch Performance</Text>
            <Text style={styles.panelSubtitle}>Investment activity grouped by branch</Text>
          </View>
        </View>

        {branchPerformance.map(b => (
          <View key={b.branch} style={styles.itemCard}>
            <View style={styles.itemHeaderRow}>
              <View style={{flex: 1}}>
                <Text style={styles.itemTitleText}>{b.branch}</Text>
                <Text style={styles.itemSubText}>INRFS Registered Branch</Text>
              </View>
            </View>

            <View style={styles.itemDetailsGrid}>
              <View style={styles.itemDetailCell3}>
                <Text style={styles.itemDetailLabel}>INVESTORS</Text>
                <Text style={styles.itemDetailValue}>{b.investors}</Text>
              </View>
              <View style={styles.itemDetailCell3}>
                <Text style={styles.itemDetailLabel}>INVESTMENTS</Text>
                <Text style={styles.itemDetailValue}>{b.investments}</Text>
              </View>
              <View style={styles.itemDetailCell3}>
                <Text style={styles.itemDetailLabel}>PORTFOLIO</Text>
                <Text style={styles.itemDetailValueGreen}>{formatINRCompact(b.amount)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderMonthlyTab = () => {
    const maxMonthly = Math.max(...monthly.map(m => m.invested_amount), 1);

    return (
      <View>
        {/* Monthly Investment Visual Trend */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>TIME SERIES</Text>
              <Text style={styles.panelTitle}>Monthly Performance ({year})</Text>
              <Text style={styles.panelSubtitle}>Direct backend report for {year}</Text>
            </View>
          </View>

          {monthly.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptySubtitle}>No monthly records found for {year}.</Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              <View style={styles.chartBarsRow}>
                {monthly.map(m => {
                  const heightPercent = Math.max(8, Math.round((m.invested_amount / maxMonthly) * 100));
                  return (
                    <View key={m.month_number} style={styles.chartBarCol}>
                      <View style={[styles.chartBar, {height: `${heightPercent}%`}]} />
                      <Text style={styles.chartBarLabel}>{m.month_name}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Monthly Cards List */}
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.panelEyebrow}>MONTHLY BREAKDOWN</Text>
              <Text style={styles.panelTitle}>Monthly Records</Text>
              <Text style={styles.panelSubtitle}>{monthly.length} months reported</Text>
            </View>
          </View>

          {monthly.map(m => (
            <View key={m.month_number} style={styles.itemCard}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitleText}>
                  {m.month_name} {year}
                </Text>
                <Text style={styles.itemDetailValueGreen}>{formatINR(m.invested_amount)}</Text>
              </View>

              <View style={styles.itemDetailsGrid}>
                <View style={styles.itemDetailCell}>
                  <Text style={styles.itemDetailLabel}>INVESTED AMOUNT</Text>
                  <Text style={styles.itemDetailValue}>{formatINR(m.invested_amount)}</Text>
                </View>
                <View style={styles.itemDetailCell}>
                  <Text style={styles.itemDetailLabel}>INTEREST PAID</Text>
                  <Text style={styles.itemDetailValue}>{formatINR(m.interest_paid)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /* ============================================================
     RENDER MAIN SCREEN
     ============================================================ */

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

      {/* Screen Header Controls */}
      <View style={styles.headerWrap}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>ADMIN PORTAL</Text>
            <Text style={styles.title}>Reports & Analytics</Text>
            <Text style={styles.subtitle}>
              Live financial performance and portfolio insights
              {lastUpdated ? ` · Updated ${lastUpdated}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.controlPill}
            onPress={() => setYearPickerVisible(true)}
            activeOpacity={0.7}>
            <Text style={styles.controlPillText}>{year}  ▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={loadReports}
            disabled={refreshing}
            activeOpacity={0.7}>
            {refreshing ? (
              <ActivityIndicator size="small" color={COLORS.blue} />
            ) : (
              <Text style={styles.refreshBtnText}>🔄</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportHeaderBtn}
            onPress={handleExport}
            disabled={exporting}>
            {exporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.exportHeaderBtnText}>🗂 Export Excel</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Banner if any */}
      {!!error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={loadReports}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadReports}
            colors={[COLORS.blue]}
            tintColor={COLORS.blue}
          />
        }>
        {/* Tab Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarScroll}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={styles.tabBtnText}>{tab.icon}</Text>
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Stat Cards Scroll Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRowScroll}>
          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>INVESTORS</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.blueLight}]}>
                <Text>👥</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{overviewStats.totalInvestors}</Text>
            <Text style={styles.statSub}>Live unique investors</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>INVESTMENTS</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.purpleLight}]}>
                <Text>📈</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{overviewStats.totalInvestments}</Text>
            <Text style={styles.statSub}>Investment accounts</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>PORTFOLIO</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.tealLight}]}>
                <Text>💼</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{formatINRCompact(overviewStats.totalPortfolio)}</Text>
            <Text style={styles.statSub}>Principal value</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>ACTIVE</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.greenLight}]}>
                <Text>✅</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{formatINRCompact(overviewStats.activePortfolio)}</Text>
            <Text style={styles.statSub}>Active investments</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>PENDING</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.amberLight}]}>
                <Text>⏱</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{formatINRCompact(overviewStats.pendingValue)}</Text>
            <Text style={styles.statSub}>Awaiting action</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>INTEREST PAID</Text>
              <View style={[styles.statIconBox, {backgroundColor: COLORS.tealLight}]}>
                <Text>％</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{formatINRCompact(overviewStats.interestPaid)}</Text>
            <Text style={styles.statSub}>Paid interest</Text>
          </View>
        </ScrollView>

        {/* Filter Section (Search, Branch, Status) */}
        <View style={styles.filterCard}>
          <View style={styles.searchInputWrap}>
            <Text>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search investor, investor ID, investment..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{color: COLORS.textMuted}}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={styles.filterPickerBtn}
              onPress={() => setBranchPickerVisible(true)}>
              <Text numberOfLines={1} style={styles.filterPickerText}>
                🏢 {branch === 'all' ? 'All Branches' : branch}
              </Text>
              <Text style={{fontSize: 10, color: COLORS.textSecondary}}>▼</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterPickerBtn}
              onPress={() => setStatusPickerVisible(true)}>
              <Text numberOfLines={1} style={styles.filterPickerText}>
                🏷 {status === 'all' ? 'All Status' : status}
              </Text>
              <Text style={{fontSize: 10, color: COLORS.textSecondary}}>▼</Text>
            </TouchableOpacity>

            {(branch !== 'all' || status !== 'all' || !!search) && (
              <TouchableOpacity
                style={styles.clearFiltersBtn}
                onPress={() => {
                  setSearch('');
                  setBranch('all');
                  setStatus('all');
                }}>
                <Text style={styles.clearFiltersText}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Loading Spinner */}
        {loading && !refreshing ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.blue} />
            <Text style={styles.loadingText}>Fetching real backend report data...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'Overview' && renderOverviewTab()}
            {activeTab === 'Investors' && renderInvestorsTab()}
            {activeTab === 'Investments' && renderInvestmentsTab()}
            {activeTab === 'Maturity' && renderMaturityTab()}
            {activeTab === 'Interest' && renderInterestTab()}
            {activeTab === 'Settlement' && renderSettlementTab()}
            {activeTab === 'Branches' && renderBranchesTab()}
            {activeTab === 'Monthly' && renderMonthlyTab()}
          </>
        )}
      </ScrollView>

      {/* INVESTMENT DETAILS MODAL */}
      <Modal
        visible={!!selectedInvestment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvestment(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInvestment && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.eyebrow}>INVESTMENT DETAILS</Text>
                    <Text style={styles.modalTitle}>{selectedInvestment.id}</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedInvestment.investor} ({selectedInvestment.investorId})
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedInvestment(null)}>
                    <Text style={styles.modalCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalDetailsList} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Investor</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.investor}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Investor ID</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.investorId}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Branch</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.branch}</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Bond ID</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedInvestment.bondId || 'Pending Assignment'}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Principal Amount</Text>
                    <Text style={[styles.modalDetailValue, {color: COLORS.blue}]}>
                      {formatINR(selectedInvestment.amount)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Interest Rate</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.rate}% p.a.</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Tenure</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.tenureMonths} Months</Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Investment Date</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatDisplayDate(selectedInvestment.invested)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Maturity Date</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatDisplayDate(selectedInvestment.maturity)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Expected Interest</Text>
                    <Text style={[styles.modalDetailValue, {color: COLORS.green}]}>
                      {formatINR(selectedInvestment.interest)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Status</Text>
                    <Text style={styles.modalDetailValue}>{selectedInvestment.status}</Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => handleDownloadSingleInvestment(selectedInvestment)}>
                    <Text style={styles.modalPrimaryBtnText}>📥 Export</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalSecondaryBtn}
                    onPress={() => {
                      const current = selectedInvestment;
                      setSelectedInvestment(null);
                      openInvestorFromInvestment(current);
                    }}>
                    <Text style={styles.modalSecondaryBtnText}>View Portfolio →</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* INVESTOR PORTFOLIO MODAL */}
      <Modal
        visible={!!selectedInvestor}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvestor(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedInvestor && (
              <>
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.eyebrow}>INVESTOR PORTFOLIO</Text>
                    <Text style={styles.modalTitle}>{selectedInvestor.investor}</Text>
                    <Text style={styles.modalSubtitle}>
                      {selectedInvestor.investorId} · {selectedInvestor.branch}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedInvestor(null)}>
                    <Text style={styles.modalCloseBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.miniMetricStrip}>
                  <View style={styles.miniMetricBox}>
                    <Text style={styles.miniMetricLabel}>INVESTED</Text>
                    <Text style={styles.miniMetricValue}>{formatINRCompact(selectedInvestor.amount)}</Text>
                  </View>
                  <View style={styles.miniMetricBox}>
                    <Text style={styles.miniMetricLabel}>EXPECTED</Text>
                    <Text style={[styles.miniMetricValue, {color: COLORS.green}]}>
                      {formatINRCompact(selectedInvestor.interest)}
                    </Text>
                  </View>
                  <View style={styles.miniMetricBox}>
                    <Text style={styles.miniMetricLabel}>BONDS</Text>
                    <Text style={styles.miniMetricValue}>{selectedInvestor.count}</Text>
                  </View>
                </View>

                <Text style={[styles.panelEyebrow, {marginVertical: 8}]}>
                  INVESTMENTS ({selectedInvestor.items.length})
                </Text>

                <ScrollView style={{maxHeight: 260}} showsVerticalScrollIndicator={false}>
                  {selectedInvestor.items.map(item => (
                    <View key={item.id} style={[styles.itemCard, {marginBottom: 8}]}>
                      <View style={styles.itemHeaderRow}>
                        <Text style={styles.itemTitleText}>{item.id}</Text>
                        <Text style={styles.itemDetailValueGreen}>{formatINR(item.amount)}</Text>
                      </View>
                      <Text style={styles.itemSubText}>
                        {item.rate}% p.a. · Matures {formatDisplayDate(item.maturity)} · {item.status}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalPrimaryBtn}
                    onPress={() => handleDownloadInvestorPortfolio(selectedInvestor)}>
                    <Text style={styles.modalPrimaryBtnText}>📥 Export Portfolio Excel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* YEAR PICKER MODAL */}
      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setYearPickerVisible(false)}>
          <View style={[styles.modalContent, {maxHeight: 280}]}>
            <Text style={styles.modalTitle}>Select Report Year</Text>
            <View style={{marginTop: 10}}>
              {availableYears.map(yr => (
                <TouchableOpacity
                  key={yr}
                  style={[styles.pickerItem, year === yr && styles.pickerItemActive]}
                  onPress={() => {
                    setYear(yr);
                    setYearPickerVisible(false);
                  }}>
                  <Text style={[styles.pickerItemText, year === yr && styles.pickerItemTextActive]}>
                    Report Year {yr}
                  </Text>
                  {year === yr && <Text style={{color: COLORS.blue, fontWeight: '700'}}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BRANCH PICKER MODAL */}
      <Modal
        visible={branchPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBranchPickerVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setBranchPickerVisible(false)}>
          <View style={[styles.modalContent, {maxHeight: 400}]}>
            <Text style={styles.modalTitle}>Select Branch</Text>
            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.pickerItem, branch === 'all' && styles.pickerItemActive]}
                onPress={() => {
                  setBranch('all');
                  setBranchPickerVisible(false);
                }}>
                <Text style={[styles.pickerItemText, branch === 'all' && styles.pickerItemTextActive]}>
                  All Branches
                </Text>
                {branch === 'all' && <Text style={{color: COLORS.blue, fontWeight: '700'}}>✓</Text>}
              </TouchableOpacity>

              {branchList.map(bName => (
                <TouchableOpacity
                  key={bName}
                  style={[styles.pickerItem, branch === bName && styles.pickerItemActive]}
                  onPress={() => {
                    setBranch(bName);
                    setBranchPickerVisible(false);
                  }}>
                  <Text style={[styles.pickerItemText, branch === bName && styles.pickerItemTextActive]}>
                    {bName}
                  </Text>
                  {branch === bName && <Text style={{color: COLORS.blue, fontWeight: '700'}}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* STATUS PICKER MODAL */}
      <Modal
        visible={statusPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusPickerVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setStatusPickerVisible(false)}>
          <View style={[styles.modalContent, {maxHeight: 400}]}>
            <Text style={styles.modalTitle}>Select Status</Text>
            <ScrollView style={{marginTop: 10}} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.pickerItem, status === 'all' && styles.pickerItemActive]}
                onPress={() => {
                  setStatus('all');
                  setStatusPickerVisible(false);
                }}>
                <Text style={[styles.pickerItemText, status === 'all' && styles.pickerItemTextActive]}>
                  All Status
                </Text>
                {status === 'all' && <Text style={{color: COLORS.blue, fontWeight: '700'}}>✓</Text>}
              </TouchableOpacity>

              {statusList.map(sName => (
                <TouchableOpacity
                  key={sName}
                  style={[styles.pickerItem, status === sName && styles.pickerItemActive]}
                  onPress={() => {
                    setStatus(sName);
                    setStatusPickerVisible(false);
                  }}>
                  <Text style={[styles.pickerItemText, status === sName && styles.pickerItemTextActive]}>
                    {sName}
                  </Text>
                  {status === sName && <Text style={{color: COLORS.blue, fontWeight: '700'}}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Tab Bar */}
      <AdminBottomTabBar active="More" navigation={navigation} />
    </SafeAreaView>
  );
};

export default ReportsScreen;