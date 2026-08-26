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

const TABS: {key: ReportTab; label: string; icon: string}[] = [
  {key: 'Overview', label: 'Overview', icon: '📊'},
  {key: 'Investments', label: 'Investments', icon: '📈'},
  {key: 'Investors', label: 'Investors', icon: '👥'},
  {key: 'Admins', label: 'Admins', icon: '🛡️'},
  {key: 'Maturity', label: 'Maturity', icon: '📅'},
  {key: 'Interest', label: 'Interest', icon: '％'},
  {key: 'Settlement', label: 'Settlement', icon: '💳'},
  {key: 'Branches', label: 'Branches', icon: '🏢'},
  {key: 'Monthly', label: 'Monthly', icon: '📆'},
  {key: 'Extensions', label: 'Extensions', icon: '⏳'},
];

const formatINR = (n: number | null | undefined): string => {
  const val = Math.round(Number(n) || 0);
  return '₹' + val.toLocaleString('en-IN');
};

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

  // Filter Bottom Sheet State
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [draftBranch, setDraftBranch] = useState<string>('all');
  const [draftAdmin, setDraftAdmin] = useState<string>('all');
  const [draftStatus, setDraftStatus] = useState<string>('all');
  const [draftPreset, setDraftPreset] = useState<string>('All Time');
  const [draftFromDate, setDraftFromDate] = useState<string>('');
  const [draftToDate, setDraftToDate] = useState<string>('');

  // Filter Dropdown Options
  const [filterOptions, setFilterOptions] = useState<{
    branches: ReportFilterOption[];
    admins: ReportFilterOption[];
    statuses: ReportFilterOption[];
  }>({branches: [], admins: [], statuses: []});

  // Cached Datasets (Lazy loaded per tab/dataset)
  const [investments, setInvestments] = useState<InvestmentReportItem[]>([]);
  const [investors, setInvestors] = useState<InvestorReportItem[]>([]);
  const [admins, setAdmins] = useState<AdminReportItem[]>([]);
  const [settlements, setSettlements] = useState<SettlementReportItem[]>([]);
  const [extensions, setExtensions] = useState<ExtensionReportItem[]>([]);

  // Track which datasets have been loaded for current filter set
  const [loadedDatasets, setLoadedDatasets] = useState<{
    investments: boolean;
    investors: boolean;
    admins: boolean;
    settlements: boolean;
    extensions: boolean;
  }>({
    investments: false,
    investors: false,
    admins: false,
    settlements: false,
    extensions: false,
  });

  // Investment Details Modal State
  const [selectedInvestment, setSelectedInvestment] =
    useState<InvestmentReportItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

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
    if (
      s.includes('pending') ||
      s.includes('submitted') ||
      s.includes('requested') ||
      s.includes('review')
    ) {
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

  // 1. Load Filter Options on Mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const filters = await getReportFilters();
        setFilterOptions(filters);
      } catch (err) {
        console.warn('Could not load filters:', err);
      }
    };
    fetchFilters();
  }, []);

  // Compute active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (branchFilter !== 'all') count++;
    if (adminFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (fromDate || toDate) count++;
    if (search.trim()) count++;
    return count;
  }, [branchFilter, adminFilter, statusFilter, fromDate, toDate, search]);

  // Determine which dataset the active tab requires
  const activeDatasetType = useMemo((): 'investments' | 'investors' | 'admins' | 'settlements' | 'extensions' => {
    if (activeTab === 'Investors') return 'investors';
    if (activeTab === 'Admins') return 'admins';
    if (activeTab === 'Settlement') return 'settlements';
    if (activeTab === 'Extensions') return 'extensions';
    return 'investments';
  }, [activeTab]);

  // Sanitized query params for backend calls
  const currentQueryParams = useMemo(() => {
    return {
      search: search.trim() || undefined,
      branch_id:
        branchFilter !== 'all' && !isNaN(Number(branchFilter))
          ? Number(branchFilter)
          : undefined,
      admin_id:
        adminFilter !== 'all' && !isNaN(Number(adminFilter))
          ? Number(adminFilter)
          : undefined,
      status_id:
        statusFilter !== 'all' && !isNaN(Number(statusFilter))
          ? Number(statusFilter)
          : undefined,
      from_date: fromDate.trim() || undefined,
      to_date: toDate.trim() || undefined,
      limit: 500,
      offset: 0,
    };
  }, [search, branchFilter, adminFilter, statusFilter, fromDate, toDate]);

  // 2. Fetch specific dataset on demand (Lazy Loading & Caching)
  const loadActiveDataset = useCallback(
    async (datasetType: 'investments' | 'investors' | 'admins' | 'settlements' | 'extensions', force = false) => {
      if (!force && loadedDatasets[datasetType]) {
        return;
      }

      try {
        setLoading(true);
        setError('');

        switch (datasetType) {
          case 'investments': {
            const res = await getInvestmentReports(currentQueryParams);
            setInvestments(res.records || []);
            setLoadedDatasets(prev => ({...prev, investments: true}));
            break;
          }
          case 'investors': {
            const res = await getInvestorReports(currentQueryParams);
            setInvestors(res.records || []);
            setLoadedDatasets(prev => ({...prev, investors: true}));
            break;
          }
          case 'admins': {
            const res = await getAdminReports(currentQueryParams);
            setAdmins(res.records || []);
            setLoadedDatasets(prev => ({...prev, admins: true}));
            break;
          }
          case 'settlements': {
            const res = await getSettlementReports(currentQueryParams);
            setSettlements(res.records || []);
            setLoadedDatasets(prev => ({...prev, settlements: true}));
            break;
          }
          case 'extensions': {
            const res = await getExtensionReports(currentQueryParams);
            setExtensions(res.records || []);
            setLoadedDatasets(prev => ({...prev, extensions: true}));
            break;
          }
        }
      } catch (err: any) {
        console.warn(`Error loading ${datasetType} report:`, err);
        setError(
          err?.message ||
            `Unable to load ${datasetType} report. Please try again.`,
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentQueryParams, loadedDatasets],
  );

  // When filters or active tab change, load if not cached
  useEffect(() => {
    loadActiveDataset(activeDatasetType, false);
  }, [activeDatasetType, loadActiveDataset]);

  // Pull-to-refresh action
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Reload filter options & force reload active tab's dataset
    getReportFilters().then(setFilterOptions).catch(() => {});
    loadActiveDataset(activeDatasetType, true);
  }, [activeDatasetType, loadActiveDataset]);

  // When filters are applied or reset, invalidate all dataset caches and load active tab
  const applyFilters = (newFilters: {
    branch: string;
    admin: string;
    status: string;
    preset: string;
    from: string;
    to: string;
  }) => {
    setBranchFilter(newFilters.branch);
    setAdminFilter(newFilters.admin);
    setStatusFilter(newFilters.status);
    setSelectedPreset(newFilters.preset);
    setFromDate(newFilters.from);
    setToDate(newFilters.to);

    // Invalidate caches so next access refetches with new filters
    setLoadedDatasets({
      investments: false,
      investors: false,
      admins: false,
      settlements: false,
      extensions: false,
    });
  };

  const handleClearAllFilters = () => {
    setSearch('');
    applyFilters({
      branch: 'all',
      admin: 'all',
      status: 'all',
      preset: 'All Time',
      from: '',
      to: '',
    });
  };

  // Open Filter Bottom Sheet
  const handleOpenFilterSheet = () => {
    setDraftBranch(branchFilter);
    setDraftAdmin(adminFilter);
    setDraftStatus(statusFilter);
    setDraftPreset(selectedPreset);
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setFilterSheetVisible(true);
  };

  const handleApplyFilterSheet = () => {
    setFilterSheetVisible(false);
    applyFilters({
      branch: draftBranch,
      admin: draftAdmin,
      status: draftStatus,
      preset: draftPreset,
      from: draftFromDate,
      to: draftToDate,
    });
  };

  // Open Details Modal using Alphanumeric ID
  const handleOpenDetails = async (item: InvestmentReportItem) => {
    setSelectedInvestment(item);
    setDetailsModalVisible(true);
    setDetailsLoading(true);

    const investmentCode = String(item.investment_id || '').trim();
    if (investmentCode) {
      try {
        const detailed = await getInvestmentReportDetails(investmentCode);
        if (detailed) {
          setSelectedInvestment(detailed);
        }
      } catch (err) {
        console.warn('Error fetching investment details for:', investmentCode, err);
      } finally {
        setDetailsLoading(false);
      }
    } else {
      setDetailsLoading(false);
    }
  };

  // Derived Datasets (Calculated strictly from backend data)
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

  // Overview Metrics Calculations
  const overviewStats = useMemo(() => {
    const totalPrincipal = investments.reduce(
      (sum, i) => sum + (Number(i.investment_amount) || 0),
      0,
    );
    const totalExpectedInterest = investments.reduce(
      (sum, i) => sum + (Number(i.expected_interest_amount) || 0),
      0,
    );
    const activeCount = investments.filter(
      i => (i.status_name || '').toLowerCase() === 'active',
    ).length;
    const pendingCount = investments.filter(i => {
      const s = (i.status_name || '').toLowerCase();
      return s.includes('pending') || s.includes('submitted');
    }).length;
    const uniqueInvestors = new Set(
      investments.map(i => i.investor_id).filter(id => id && id !== '—'),
    ).size;
    const monthlyPayout = investments.reduce((sum, i) => {
      return (
        sum +
        (i.tenure_months > 0
          ? (Number(i.expected_interest_amount) || 0) / i.tenure_months
          : 0)
      );
    }, 0);

    return {
      totalInvestors: uniqueInvestors || investments.length,
      totalInvestments: investments.length,
      activeInvestments: activeCount,
      pendingApprovals: pendingCount,
      totalPortfolio: totalPrincipal,
      totalExpectedInterest,
      monthlyPayout,
    };
  }, [investments]);

  // Overview: Portfolio by Branch Visual Distribution
  const branchDistribution = useMemo(() => {
    if (!overviewStats.totalPortfolio || branchReports.length === 0) return [];
    return branchReports.slice(0, 5).map(b => ({
      name: b.branch_name,
      amount: b.principal_amount,
      pct: Math.min(
        100,
        Math.round((b.principal_amount / overviewStats.totalPortfolio) * 100),
      ),
    }));
  }, [branchReports, overviewStats.totalPortfolio]);

  // Overview: Status Distribution
  const statusDistribution = useMemo(() => {
    const total = investments.length;
    if (total === 0) return [];
    const counts: Record<string, number> = {};
    investments.forEach(inv => {
      const s = inv.status_name || 'Active';
      counts[s] = (counts[s] || 0) + 1;
    });

    const colors: Record<string, string> = {
      Active: '#10B981',
      'Pending Approval': '#F59E0B',
      Pending: '#F59E0B',
      Closed: '#64748B',
      Rejected: '#EF4444',
      Refunded: '#8B5CF6',
    };

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 100),
      color: colors[name] || '#2563EB',
    }));
  }, [investments]);

  // Top 5 Investments by Amount
  const topInvestments = useMemo(() => {
    return [...investments]
      .sort((a, b) => b.investment_amount - a.investment_amount)
      .slice(0, 5);
  }, [investments]);

  // Top 5 Investors by Principal
  const topInvestors = useMemo(() => {
    return [...investors]
      .sort((a, b) => b.principal_amount - a.principal_amount)
      .slice(0, 5);
  }, [investors]);

  // Interest Tab Visualizations
  const interestRateDistribution = useMemo(() => {
    if (investments.length === 0) return [];
    const counts: Record<string, number> = {};
    investments.forEach(inv => {
      const r = `${inv.interest_rate}% p.a.`;
      counts[r] = (counts[r] || 0) + 1;
    });
    const total = investments.length;
    return Object.entries(counts)
      .map(([rate, count]) => ({
        rate,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [investments]);

  const topInterestInvestors = useMemo(() => {
    return interestReports.slice(0, 5);
  }, [interestReports]);

  // Admin Summary & Pipeline Stats
  const adminPipelineStats = useMemo(() => {
    return admins.reduce(
      (acc, a) => {
        acc.pending += (Number(a.pending_count) || 0);
        acc.approved += (Number(a.approved_count) || 0);
        acc.rejected += (Number(a.rejected_count) || 0);
        acc.settled += (Number(a.settled_count) || 0);
        acc.totalPrincipal += (Number(a.principal_amount) || 0);
        acc.totalInterest += (Number(a.expected_interest) || 0);
        acc.totalInvestors += (Number(a.investor_count) || 0);
        return acc;
      },
      {
        pending: 0,
        approved: 0,
        rejected: 0,
        settled: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalInvestors: 0,
      },
    );
  }, [admins]);

  // Settlement Summary
  const settlementSummary = useMemo(() => {
    const paid = settlements.filter(s =>
      s.status.toLowerCase().includes('paid'),
    ).length;
    const pending = settlements.filter(s =>
      s.status.toLowerCase().includes('pending'),
    ).length;
    const totalAmount = settlements.reduce(
      (sum, s) => sum + s.settlement_amount,
      0,
    );
    return {paid, pending, totalAmount, count: settlements.length};
  }, [settlements]);

  // Extension Summary
  const extensionSummary = useMemo(() => {
    const approved = extensions.filter(e =>
      e.status.toLowerCase().includes('approved'),
    ).length;
    const pending = extensions.filter(e =>
      e.status.toLowerCase().includes('pending'),
    ).length;
    return {approved, pending, count: extensions.length};
  }, [extensions]);

  // Export to Excel
  const handleExport = async () => {
    try {
      let exportRows: any[] = [];
      const sheetName = activeTab;

      switch (activeTab) {
        case 'Overview':
        case 'Investments':
        case 'Maturity':
        case 'Interest': {
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
            'Principal Amount (₹)': x.investment_amount,
            'Interest Rate (%)': x.interest_rate,
            'Tenure (Months)': x.tenure_months,
            'Investment Date': x.investment_date
              ? formatSuperAdminDate(x.investment_date)
              : '',
            'Maturity Date': x.maturity_date
              ? formatSuperAdminDate(x.maturity_date)
              : '',
            'Expected Interest (₹)': x.expected_interest_amount,
            'Maturity Amount (₹)': x.maturity_amount,
            Status: x.status_name,
          }));
          break;
        }
        case 'Investors': {
          exportRows = investors.map(x => ({
            'Investor ID': x.investor_id,
            Name: x.name,
            Email: x.email,
            Mobile: x.mobile,
            Branch: x.branch_name,
            'Investments Count': x.investment_count,
            'Principal Amount (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            'Maturity Amount (₹)': x.maturity_amount,
            Status: x.status,
            'Registration Date': x.created_date
              ? formatSuperAdminDate(x.created_date)
              : '',
          }));
          break;
        }
        case 'Admins': {
          exportRows = admins.map(x => ({
            'Admin ID': x.admin_id,
            Name: x.name,
            Email: x.email,
            Mobile: x.mobile,
            Branch: x.branch_name,
            'Investors Managed': x.investor_count,
            'Investments Count': x.investment_count,
            'Total Principal (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            Pending: x.pending_count,
            Approved: x.approved_count,
            Rejected: x.rejected_count,
            Settled: x.settled_count,
            Status: x.status,
          }));
          break;
        }
        case 'Settlement': {
          exportRows = settlements.map(x => ({
            'Settlement ID': x.settlement_id,
            'Bond/Investment ID': x.investment_id,
            'Investor Name': x.investor_name,
            'Investor ID': x.investor_id,
            'Settlement Type': x.settlement_type_name || x.settlement_type,
            'Settlement Amount (₹)': x.settlement_amount,
            Status: x.status,
            'Requested Date': x.requested_date
              ? formatSuperAdminDate(x.requested_date)
              : '',
            'Settled Date': x.settled_date
              ? formatSuperAdminDate(x.settled_date)
              : '',
            Branch: x.branch_name,
            Remarks: x.remarks || '',
          }));
          break;
        }
        case 'Branches': {
          exportRows = branchReports.map(x => ({
            Branch: x.branch_name,
            'Unique Investors': x.investor_count,
            'Total Bonds': x.investment_count,
            'Total Principal (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            'Maturity Amount (₹)': x.maturity_amount,
          }));
          break;
        }
        case 'Monthly': {
          exportRows = monthlyReports.map(x => ({
            Month: x.month,
            'Unique Investors': x.investor_count,
            'Total Investments': x.investment_count,
            'Total Principal (₹)': x.principal_amount,
            'Expected Interest (₹)': x.expected_interest,
            'Maturity Amount (₹)': x.maturity_amount,
          }));
          break;
        }
        case 'Extensions': {
          exportRows = extensions.map(x => ({
            'Request ID': x.request_id,
            'Bond ID': x.bond_id || x.investment_id,
            'Investor Name': x.investor_name,
            'Requested Extension': x.requested_extension,
            'Current Maturity': x.current_maturity_date
              ? formatSuperAdminDate(x.current_maturity_date)
              : '',
            'Current Rate (%)': x.current_interest_rate,
            Status: x.status,
            'Submitted Date': x.submitted_date
              ? formatSuperAdminDate(x.submitted_date)
              : '',
            Branch: x.branch_name,
          }));
          break;
        }
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

      {/* HEADER TITLE */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Super Admin Reports</Text>
        <Text style={styles.headerSubtitle}>
          Portfolio & investment insights
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0B1E45', '#2563EB']}
          />
        }>
        {/* HERO PORTFOLIO VALUE BANNER */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO PRINCIPAL</Text>
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
              <Text style={styles.heroStatLabel}>Expected Int.</Text>
              <Text style={styles.heroStatValGreen}>
                {formatINR(overviewStats.totalExpectedInterest)}
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
              const isSelected = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabChip, isSelected && styles.tabChipActive]}
                  onPress={() => setActiveTab(tab.key)}>
                  <Text style={styles.tabChipIcon}>{tab.icon}</Text>
                  <Text
                    style={[
                      styles.tabChipText,
                      isSelected && styles.tabChipTextActive,
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* SEARCH BAR & UNIFIED FILTER TOGGLE BUTTON */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBoxWrap}>
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

          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              activeFilterCount > 0 && styles.filterToggleBtnActive,
            ]}
            onPress={handleOpenFilterSheet}>
            <Text style={styles.filterToggleIcon}>⚡</Text>
            <Text
              style={[
                styles.filterToggleText,
                activeFilterCount > 0 && styles.filterToggleTextActive,
              ]}>
              Filters
            </Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ACTIVE FILTER CHIPS (DISMISSIBLE PILLS) */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFilterScroll}
            contentContainerStyle={styles.activeFilterContainer}>
            {branchFilter !== 'all' && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>
                  Branch:{' '}
                  {filterOptions.branches.find(
                    b => String(b.id) === String(branchFilter),
                  )?.name || branchFilter}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    applyFilters({
                      branch: 'all',
                      admin: adminFilter,
                      status: statusFilter,
                      preset: selectedPreset,
                      from: fromDate,
                      to: toDate,
                    })
                  }>
                  <Text style={styles.activePillClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {adminFilter !== 'all' && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>
                  Admin:{' '}
                  {filterOptions.admins.find(
                    a => String(a.id) === String(adminFilter),
                  )?.name || adminFilter}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    applyFilters({
                      branch: branchFilter,
                      admin: 'all',
                      status: statusFilter,
                      preset: selectedPreset,
                      from: fromDate,
                      to: toDate,
                    })
                  }>
                  <Text style={styles.activePillClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {statusFilter !== 'all' && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>
                  Status:{' '}
                  {filterOptions.statuses.find(
                    s => String(s.id) === String(statusFilter),
                  )?.name || statusFilter}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    applyFilters({
                      branch: branchFilter,
                      admin: adminFilter,
                      status: 'all',
                      preset: selectedPreset,
                      from: fromDate,
                      to: toDate,
                    })
                  }>
                  <Text style={styles.activePillClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {(fromDate || toDate) && (
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>
                  Date:{' '}
                  {fromDate && toDate
                    ? `${formatSuperAdminDate(fromDate)} → ${formatSuperAdminDate(toDate)}`
                    : selectedPreset}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    applyFilters({
                      branch: branchFilter,
                      admin: adminFilter,
                      status: statusFilter,
                      preset: 'All Time',
                      from: '',
                      to: '',
                    })
                  }>
                  <Text style={styles.activePillClose}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.resetAllLink}
              onPress={handleClearAllFilters}>
              <Text style={styles.resetAllLinkText}>Reset All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* EXPORT ACTION ROW */}
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
              onPress={() => loadActiveDataset(activeDatasetType, true)}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* LOADING SKELETON */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator
              size="small"
              color="#0B1E45"
              style={styles.loadingSpinner}
            />
            <Text style={styles.loadingText}>
              Loading {activeTab.toLowerCase()} data...
            </Text>
            {[1, 2, 3].map(sk => (
              <View key={`skeleton-${sk}`} style={styles.skeletonCard}>
                <View style={styles.skeletonHeader}>
                  <View style={styles.skeletonLineShort} />
                  <View style={styles.skeletonPill} />
                </View>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSubtitle} />
                <View style={styles.skeletonGrid} />
              </View>
            ))}
          </View>
        ) : (
          <>
            {/* ============================================================
                TAB 1: OVERVIEW
                ============================================================ */}
            {activeTab === 'Overview' && (
              <>
                {/* 4 CORE METRIC CARDS */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Unique Investors</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgIndigo,
                        ]}>
                        <Text style={styles.statIcon}>👥</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatIndianNumber(overviewStats.totalInvestors)}
                    </Text>
                    <Text style={styles.statSub}>Portfolio investors</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Total Investments</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgSky,
                        ]}>
                        <Text style={styles.statIcon}>📈</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatIndianNumber(overviewStats.totalInvestments)}
                    </Text>
                    <Text style={styles.statSub}>Total bonds count</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Total Principal</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgFuchsia,
                        ]}>
                        <Text style={styles.statIcon}>💼</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatCurrencyAUM(overviewStats.totalPortfolio)}
                    </Text>
                    <Text style={styles.statSub}>Invested capital</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Expected Interest</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgEmerald,
                        ]}>
                        <Text style={styles.statIcon}>％</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatCurrencyAUM(overviewStats.totalExpectedInterest)}
                    </Text>
                    <Text style={styles.statSub}>Total projected yield</Text>
                  </View>
                </View>

                {/* VISUALIZATION 1: PORTFOLIO BY BRANCH */}
                {branchDistribution.length > 0 && (
                  <View style={styles.vizCard}>
                    <Text style={styles.vizTitle}>Portfolio by Branch</Text>
                    <Text style={styles.vizSubtitle}>
                      Branch-wise invested principal distribution
                    </Text>
                    {branchDistribution.map(b => (
                      <View key={b.name} style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>{b.name}</Text>
                          <Text style={styles.vizBarValue}>
                            {formatINR(b.amount)} ({b.pct}%)
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              styles.bgBlue,
                              {width: `${b.pct}%`},
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* VISUALIZATION 2: INVESTMENT STATUS DISTRIBUTION */}
                {statusDistribution.length > 0 && (
                  <View style={styles.vizCard}>
                    <Text style={styles.vizTitle}>Investment Statuses</Text>
                    <Text style={styles.vizSubtitle}>
                      Breakdown of current bond states
                    </Text>
                    {statusDistribution.map(s => (
                      <View key={s.name} style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>{s.name}</Text>
                          <Text style={styles.vizBarValue}>
                            {s.count} ({s.pct}%)
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              {width: `${s.pct}%`, backgroundColor: s.color},
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* VISUALIZATION 3: TOP INVESTMENTS */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Top Investments</Text>
                  <View style={styles.sectionBadge}>
                    <Text style={styles.sectionBadgeText}>Ranked by Amount</Text>
                  </View>
                </View>

                {topInvestments.map((inv, idx) => {
                  const badge = getStatusBadge(inv.status_name);
                  return (
                    <TouchableOpacity
                      key={`top-inv-${inv.investment_id}-${idx}`}
                      style={styles.reportCard}
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetails(inv)}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardIdWrap}>
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankBadgeText}>
                              {idx < 9 ? `#0${idx + 1}` : `#${idx + 1}`}
                            </Text>
                          </View>
                          <Text style={styles.cardIdTag}>{inv.investment_id}</Text>
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
                          <Text style={styles.metricLabel}>EXP. INTEREST</Text>
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
                  <Text style={styles.sectionTitle}>All Investments</Text>
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
                      No investments match your current search or filter criteria.
                    </Text>
                    {activeFilterCount > 0 && (
                      <TouchableOpacity
                        style={styles.clearFiltersBtn}
                        onPress={handleClearAllFilters}>
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
                        key={`inv-${inv.investment_id}-${idx}`}
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
                      {investors.length} Registered
                    </Text>
                  </View>
                </View>

                {/* TOP INVESTORS VISUALIZATION */}
                {topInvestors.length > 0 && (
                  <View style={styles.vizCard}>
                    <Text style={styles.vizTitle}>Top Investors by Principal</Text>
                    <Text style={styles.vizSubtitle}>
                      Highest capital contributors
                    </Text>
                    {topInvestors.map(inv => (
                      <View key={inv.investor_id} style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>{inv.name}</Text>
                          <Text style={styles.vizBarValue}>
                            {formatINR(inv.principal_amount)}
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              styles.bgGreen,
                              {
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    (inv.principal_amount /
                                      (topInvestors[0].principal_amount || 1)) *
                                      100,
                                  ),
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {investors.length === 0 ? (
                  <View style={styles.emptyWrap}>
                    <View style={styles.emptyIconWrap}>
                      <Text style={styles.emptyIcon}>👥</Text>
                    </View>
                    <Text style={styles.emptyTitle}>No Investors Found</Text>
                    <Text style={styles.emptySubtitle}>
                      No investor records found for the applied filters.
                    </Text>
                  </View>
                ) : (
                  investors.map((inv, idx) => {
                    const badge = getStatusBadge(inv.status);
                    return (
                      <View
                        key={`investor-${inv.investor_id}-${idx}`}
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
                        <Text
                          style={styles.cardEmailText}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          ✉ {inv.email && inv.email !== '—' ? inv.email : '—'}
                        </Text>
                        <Text
                          style={styles.cardSubtitle}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          Branch: {inv.branch_name || '—'}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PRINCIPAL</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(inv.principal_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>BONDS</Text>
                            <Text style={styles.metricValGold}>
                              {inv.investment_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXP. INTEREST</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(inv.expected_interest)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardBottomRow}>
                          <Text style={styles.cardMetaText}>
                            Active: {inv.active_count} • Pending:{' '}
                            {inv.pending_count} • Settled: {inv.settled_count}
                          </Text>
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
                      {admins.length} Staff
                    </Text>
                  </View>
                </View>

                {/* 4 SUMMARY METRIC CARDS */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Total Admins</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgIndigo,
                        ]}>
                        <Text style={styles.statIcon}>🛡️</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {admins.length}
                    </Text>
                    <Text style={styles.statSub}>Active admins in report</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Investors Managed</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgSky,
                        ]}>
                        <Text style={styles.statIcon}>👥</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatIndianNumber(adminPipelineStats.totalInvestors)}
                    </Text>
                    <Text style={styles.statSub}>Managed investors</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Portfolio AUM</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgFuchsia,
                        ]}>
                        <Text style={styles.statIcon}>💼</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatINR(adminPipelineStats.totalPrincipal)}
                    </Text>
                    <Text style={styles.statSub}>Admin-wise principal</Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Expected Interest</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgEmerald,
                        ]}>
                        <Text style={styles.statIcon}>％</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatINR(adminPipelineStats.totalInterest)}
                    </Text>
                    <Text style={styles.statSub}>Projected yield</Text>
                  </View>
                </View>

                {/* ADMIN PIPELINE COUNTERS */}
                <View style={styles.pipelineGrid}>
                  <View
                    style={[
                      styles.pipelineBox,
                      styles.pipelineBoxPending,
                    ]}>
                    <Text style={[styles.pipelineVal, styles.pipelineValPending]}>
                      {adminPipelineStats.pending}
                    </Text>
                    <Text style={[styles.pipelineLabel, styles.pipelineLabelPending]}>
                      Pending
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.pipelineBox,
                      styles.pipelineBoxApproved,
                    ]}>
                    <Text style={[styles.pipelineVal, styles.pipelineValApproved]}>
                      {adminPipelineStats.approved}
                    </Text>
                    <Text style={[styles.pipelineLabel, styles.pipelineLabelApproved]}>
                      Approved
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.pipelineBox,
                      styles.pipelineBoxRejected,
                    ]}>
                    <Text style={[styles.pipelineVal, styles.pipelineValRejected]}>
                      {adminPipelineStats.rejected}
                    </Text>
                    <Text style={[styles.pipelineLabel, styles.pipelineLabelRejected]}>
                      Rejected
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.pipelineBox,
                      styles.pipelineBoxSettled,
                    ]}>
                    <Text style={[styles.pipelineVal, styles.pipelineValSettled]}>
                      {adminPipelineStats.settled}
                    </Text>
                    <Text style={[styles.pipelineLabel, styles.pipelineLabelSettled]}>
                      Settled
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
                    const badge = getStatusBadge(adm.status || 'Active');
                    return (
                      <View
                        key={`admin-${adm.admin_id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>ID: {adm.admin_id}</Text>
                            <Text style={styles.cardDateTag}>{adm.branch_name}</Text>
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

                        <Text style={styles.cardTitle}>{adm.admin_name || adm.name}</Text>
                        <Text style={styles.cardSubtitle}>
                          {adm.email && adm.email !== '—' ? adm.email : ''}
                          {adm.mobile && adm.mobile !== '—' ? ` • ${adm.mobile}` : ''}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>INVESTORS</Text>
                            <Text style={styles.metricVal}>
                              {adm.investor_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>BONDS</Text>
                            <Text style={styles.metricValGold}>
                              {adm.investment_count}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>PORTFOLIO AUM</Text>
                            <Text style={styles.metricVal}>
                              {formatINR(adm.principal_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXP. INTEREST</Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(adm.expected_interest)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardBottomRow}>
                          <Text style={styles.cardMetaText}>
                            Apprv: {adm.approved_count} • Pend: {adm.pending_count}{' '}
                            • Rej: {adm.rejected_count} • Settled: {adm.settled_count}
                          </Text>
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
                        key={`maturity-${inv.investment_id}-${idx}`}
                        style={styles.reportCard}
                        activeOpacity={0.8}
                        onPress={() => handleOpenDetails(inv)}>
                        <View style={styles.maturityDateHeaderRow}>
                          <View style={styles.maturityDateBadge}>
                            <Text style={styles.maturityDateIcon}>📅</Text>
                            <Text style={styles.maturityDateText}>
                              {formatSuperAdminDate(inv.maturity_date).toUpperCase()}
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

                        <View style={styles.cardIdWrap}>
                          <Text style={styles.cardIdTag}>
                            {inv.investment_id}
                          </Text>
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
                              {formatINR(inv.maturity_amount)}
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

                {/* VISUALIZATION 1: INTEREST BY INVESTOR */}
                {topInterestInvestors.length > 0 && (
                  <View style={styles.vizCard}>
                    <Text style={styles.vizTitle}>Interest by Investor</Text>
                    <Text style={styles.vizSubtitle}>
                      Highest projected returns across portfolio
                    </Text>
                    {topInterestInvestors.map(inv => (
                      <View
                        key={`top-int-${inv.investment_id}`}
                        style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>
                            {inv.investor_name}
                          </Text>
                          <Text style={styles.vizBarValue}>
                            {formatINR(inv.expected_interest_amount)}
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              styles.bgGreen,
                              {
                                width: `${Math.min(
                                  100,
                                  Math.round(
                                    (inv.expected_interest_amount /
                                      (topInterestInvestors[0]
                                        .expected_interest_amount || 1)) *
                                      100,
                                  ),
                                )}%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* VISUALIZATION 2: INTEREST RATE DISTRIBUTION */}
                {interestRateDistribution.length > 0 && (
                  <View style={styles.vizCard}>
                    <Text style={styles.vizTitle}>
                      Interest Rate Distribution
                    </Text>
                    <Text style={styles.vizSubtitle}>
                      Bonds breakdown by annual interest rate
                    </Text>
                    {interestRateDistribution.map(rateItem => (
                      <View
                        key={`rate-${rateItem.rate}`}
                        style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>{rateItem.rate}</Text>
                          <Text style={styles.vizBarValue}>
                            {rateItem.count} Bonds ({rateItem.pct}%)
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              styles.bgBlue,
                              {width: `${rateItem.pct}%`},
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

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
                      key={`interest-${inv.investment_id}-${idx}`}
                      style={styles.reportCard}
                      activeOpacity={0.8}
                      onPress={() => handleOpenDetails(inv)}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardIdWrap}>
                          <View style={styles.rankBadge}>
                            <Text style={styles.rankBadgeText}>
                              {idx < 9 ? `#0${idx + 1}` : `#${idx + 1}`}
                            </Text>
                          </View>
                          <Text style={styles.cardIdTag}>
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

                {/* SUMMARY METRICS */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Total Settlements</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgIndigo,
                        ]}>
                        <Text style={styles.statIcon}>💳</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {settlementSummary.count}
                    </Text>
                    <Text style={styles.statSub}>
                      Paid: {settlementSummary.paid} • Pend:{' '}
                      {settlementSummary.pending}
                    </Text>
                  </View>

                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Settlement Amount</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgFuchsia,
                        ]}>
                        <Text style={styles.statIcon}>💼</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {formatCurrencyAUM(settlementSummary.totalAmount)}
                    </Text>
                    <Text style={styles.statSub}>Total net payout</Text>
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
                        key={`settlement-${sett.settlement_id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              ID: {sett.settlement_id}
                            </Text>
                            <Text style={styles.cardIdTag}>
                              Bond: {sett.investment_id}
                            </Text>
                            <View
                              style={[
                                styles.settlementTypePill,
                                sett.settlement_type?.toUpperCase().includes('PRE')
                                  ? styles.settlementTypePreclose
                                  : styles.settlementTypeMaturity,
                              ]}>
                              <Text style={styles.settlementTypePillText}>
                                {sett.settlement_type?.toUpperCase().includes('PRE')
                                  ? 'PRE-CLOSE'
                                  : 'MATURITY'}
                              </Text>
                            </View>
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
                          Branch: {sett.branch_name}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>
                              SETTLEMENT AMOUNT
                            </Text>
                            <Text style={styles.metricValGreen}>
                              {formatINR(sett.settlement_amount)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>REQUESTED</Text>
                            <Text style={styles.metricVal}>
                              {formatSuperAdminDate(sett.requested_date)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>SETTLED</Text>
                            <Text style={styles.metricVal}>
                              {sett.settled_date
                                ? formatSuperAdminDate(sett.settled_date)
                                : 'Pending'}
                            </Text>
                          </View>
                        </View>

                        {sett.remarks ? (
                          <View style={styles.cardBottomRow}>
                            <Text style={styles.cardMetaText} numberOfLines={2}>
                              Note: {sett.remarks}
                            </Text>
                          </View>
                        ) : null}
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
                      key={`branch-${br.branch_id}-${idx}`}
                      style={styles.reportCard}>
                      <View style={styles.cardTopRow}>
                        <Text style={styles.cardTitle}>{br.branch_name}</Text>
                        <Text style={styles.cardDateTag}>
                          {br.investor_count} Unique Investors •{' '}
                          {br.investment_count} Bonds
                        </Text>
                      </View>

                      {/* Branch Share Bar */}
                      <View style={styles.vizBarRow}>
                        <View style={styles.vizBarHeader}>
                          <Text style={styles.vizBarLabel}>Portfolio Share</Text>
                          <Text style={styles.vizBarValue}>
                            {overviewStats.totalPortfolio > 0
                              ? Math.min(
                                  100,
                                  Math.round(
                                    (br.principal_amount /
                                      overviewStats.totalPortfolio) *
                                      100,
                                  ),
                                )
                              : 0}%
                          </Text>
                        </View>
                        <View style={styles.vizTrack}>
                          <View
                            style={[
                              styles.vizFill,
                              styles.bgBlue,
                              {
                                width: `${
                                  overviewStats.totalPortfolio > 0
                                    ? Math.min(
                                        100,
                                        Math.round(
                                          (br.principal_amount /
                                            overviewStats.totalPortfolio) *
                                            100,
                                        ),
                                      )
                                    : 0
                                }%`,
                              },
                            ]}
                          />
                        </View>
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
                  <Text style={styles.sectionTitle}>
                    Monthly Time-Series (Chronological)
                  </Text>
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
                      key={`monthly-${mo.month}-${idx}`}
                      style={styles.reportCard}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.maturityDateBadge}>
                          <Text style={styles.maturityDateIcon}>📆</Text>
                          <Text style={styles.maturityDateText}>
                            {mo.month.toUpperCase()}
                          </Text>
                        </View>
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

                {/* SUMMARY STATS */}
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <View style={styles.statCardTopRow}>
                      <Text style={styles.statLabel}>Total Requests</Text>
                      <View
                        style={[
                          styles.statIconBadge,
                          styles.bgIndigo,
                        ]}>
                        <Text style={styles.statIcon}>⏳</Text>
                      </View>
                    </View>
                    <Text style={styles.statValue}>
                      {extensionSummary.count}
                    </Text>
                    <Text style={styles.statSub}>
                      Approved: {extensionSummary.approved} • Pend:{' '}
                      {extensionSummary.pending}
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
                        key={`extension-${ext.request_id}-${idx}`}
                        style={styles.reportCard}>
                        <View style={styles.cardTopRow}>
                          <View style={styles.cardIdWrap}>
                            <Text style={styles.cardIdTag}>
                              Req #{ext.request_id}
                            </Text>
                            <Text style={styles.cardIdTag}>
                              Bond: {ext.bond_id || ext.investment_id}
                            </Text>
                            <View style={styles.extensionBadge}>
                              <Text style={styles.extensionBadgeText}>
                                {ext.requested_extension
                                  ? ext.requested_extension.toUpperCase()
                                  : '+6 MONTHS'}
                              </Text>
                            </View>
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
                          Investor ID: {ext.investor_id}
                          {ext.submitted_date
                            ? ` • Submitted: ${formatSuperAdminDate(ext.submitted_date)}`
                            : ''}
                        </Text>

                        <View style={styles.metricsGrid}>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>EXTENSION</Text>
                            <Text style={styles.metricValGold}>
                              {ext.requested_extension}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>
                              CURRENT MATURITY
                            </Text>
                            <Text style={styles.metricVal}>
                              {formatSuperAdminDate(ext.current_maturity_date)}
                            </Text>
                          </View>
                          <View style={styles.metricCol}>
                            <Text style={styles.metricLabel}>CURRENT RATE</Text>
                            <Text style={styles.metricValGreen}>
                              {ext.current_interest_rate}% p.a.
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
          UNIFIED PREMIUM FILTER BOTTOM SHEET
          ============================================================ */}
      <Modal
        visible={filterSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterSheetVisible(false)}>
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setFilterSheetVisible(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandleBar} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Reports</Text>
              <TouchableOpacity
                onPress={() => setFilterSheetVisible(false)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Text style={styles.sheetClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {/* SECTION: BRANCH */}
              <View style={styles.sheetSection}>
                <Text style={styles.sheetSectionLabel}>Branch</Text>
                <View style={styles.sheetChipRow}>
                  <TouchableOpacity
                    style={[
                      styles.sheetFilterChip,
                      draftBranch === 'all' && styles.sheetFilterChipActive,
                    ]}
                    onPress={() => setDraftBranch('all')}>
                    <Text
                      style={[
                        styles.sheetFilterChipText,
                        draftBranch === 'all' &&
                          styles.sheetFilterChipTextActive,
                      ]}>
                      All Branches
                    </Text>
                  </TouchableOpacity>
                  {filterOptions.branches.map(b => {
                    const isSelected = String(draftBranch) === String(b.id);
                    return (
                      <TouchableOpacity
                        key={`draft-br-${b.id}`}
                        style={[
                          styles.sheetFilterChip,
                          isSelected && styles.sheetFilterChipActive,
                        ]}
                        onPress={() => setDraftBranch(String(b.id))}>
                        <Text
                          style={[
                            styles.sheetFilterChipText,
                            isSelected && styles.sheetFilterChipTextActive,
                          ]}>
                          {b.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION: ADMIN */}
              <View style={styles.sheetSection}>
                <Text style={styles.sheetSectionLabel}>Assigned Admin</Text>
                <View style={styles.sheetChipRow}>
                  <TouchableOpacity
                    style={[
                      styles.sheetFilterChip,
                      draftAdmin === 'all' && styles.sheetFilterChipActive,
                    ]}
                    onPress={() => setDraftAdmin('all')}>
                    <Text
                      style={[
                        styles.sheetFilterChipText,
                        draftAdmin === 'all' &&
                          styles.sheetFilterChipTextActive,
                      ]}>
                      All Admins
                    </Text>
                  </TouchableOpacity>
                  {filterOptions.admins.map(a => {
                    const isSelected = String(draftAdmin) === String(a.id);
                    return (
                      <TouchableOpacity
                        key={`draft-adm-${a.id}`}
                        style={[
                          styles.sheetFilterChip,
                          isSelected && styles.sheetFilterChipActive,
                        ]}
                        onPress={() => setDraftAdmin(String(a.id))}>
                        <Text
                          style={[
                            styles.sheetFilterChipText,
                            isSelected && styles.sheetFilterChipTextActive,
                          ]}>
                          {a.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION: STATUS */}
              <View style={styles.sheetSection}>
                <Text style={styles.sheetSectionLabel}>Status</Text>
                <View style={styles.sheetChipRow}>
                  <TouchableOpacity
                    style={[
                      styles.sheetFilterChip,
                      draftStatus === 'all' && styles.sheetFilterChipActive,
                    ]}
                    onPress={() => setDraftStatus('all')}>
                    <Text
                      style={[
                        styles.sheetFilterChipText,
                        draftStatus === 'all' &&
                          styles.sheetFilterChipTextActive,
                      ]}>
                      All Statuses
                    </Text>
                  </TouchableOpacity>
                  {filterOptions.statuses.map(s => {
                    const isSelected = String(draftStatus) === String(s.id);
                    return (
                      <TouchableOpacity
                        key={`draft-st-${s.id}`}
                        style={[
                          styles.sheetFilterChip,
                          isSelected && styles.sheetFilterChipActive,
                        ]}
                        onPress={() => setDraftStatus(String(s.id))}>
                        <Text
                          style={[
                            styles.sheetFilterChipText,
                            isSelected && styles.sheetFilterChipTextActive,
                          ]}>
                          {s.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SECTION: DATE PRESETS */}
              <View style={styles.sheetSection}>
                <Text style={styles.sheetSectionLabel}>Date Range</Text>
                <View style={styles.sheetChipRow}>
                  {DATE_PRESETS.map(p => {
                    const isSelected = draftPreset === p.label;
                    return (
                      <TouchableOpacity
                        key={`draft-preset-${p.label}`}
                        style={[
                          styles.sheetFilterChip,
                          isSelected && styles.sheetFilterChipActive,
                        ]}
                        onPress={() => {
                          setDraftPreset(p.label);
                          setDraftFromDate(p.from);
                          setDraftToDate(p.to);
                        }}>
                        <Text
                          style={[
                            styles.sheetFilterChipText,
                            isSelected && styles.sheetFilterChipTextActive,
                          ]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* CUSTOM DATE INPUTS */}
                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputCol}>
                    <Text style={styles.dateInputSubLabel}>From Date</Text>
                    <View style={styles.dateInputBox}>
                      <TextInput
                        style={styles.dateInputText}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94A3B8"
                        value={draftFromDate}
                        onChangeText={t => {
                          setDraftFromDate(t);
                          setDraftPreset('Custom');
                        }}
                      />
                    </View>
                  </View>
                  <View style={styles.dateInputCol}>
                    <Text style={styles.dateInputSubLabel}>To Date</Text>
                    <View style={styles.dateInputBox}>
                      <TextInput
                        style={styles.dateInputText}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94A3B8"
                        value={draftToDate}
                        onChangeText={t => {
                          setDraftToDate(t);
                          setDraftPreset('Custom');
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.sheetResetBtn}
                onPress={() => {
                  setDraftBranch('all');
                  setDraftAdmin('all');
                  setDraftStatus('all');
                  setDraftPreset('All Time');
                  setDraftFromDate('');
                  setDraftToDate('');
                }}>
                <Text style={styles.sheetResetBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sheetApplyBtn}
                onPress={handleApplyFilterSheet}>
                <Text style={styles.sheetApplyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================
          INVESTMENT DETAILS MODAL (Live Alphanumeric ID Lookup)
          ============================================================ */}
      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Investment Details</Text>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {detailsLoading || !selectedInvestment ? (
              <View style={styles.detailsLoadingBox}>
                <ActivityIndicator size="small" color="#0B1E45" />
                <Text style={styles.detailsLoadingText}>
                  Fetching investment details...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.detailsScrollView}>
                <Text style={styles.detailGroupTitle}>IDENTIFIERS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investment ID</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.investment_id}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.status_name}
                  </Text>
                </View>

                <Text style={styles.detailGroupTitle}>INVESTOR</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investor Name</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.investor_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investor ID</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.investor_id}
                  </Text>
                </View>
                {selectedInvestment.investor_email &&
                selectedInvestment.investor_email !== '—' ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailVal}>
                      {selectedInvestment.investor_email}
                    </Text>
                  </View>
                ) : null}
                {selectedInvestment.investor_mobile &&
                selectedInvestment.investor_mobile !== '—' ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile</Text>
                    <Text style={styles.detailVal}>
                      {selectedInvestment.investor_mobile}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.detailGroupTitle}>ORGANIZATION</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Branch</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.branch_name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Admin</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.admin_name}
                  </Text>
                </View>
                {selectedInvestment.superadmin_name &&
                selectedInvestment.superadmin_name !== '—' ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Super Admin</Text>
                    <Text style={styles.detailVal}>
                      {selectedInvestment.superadmin_name}
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.detailGroupTitle}>FINANCIAL TERMS</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Principal Amount</Text>
                  <Text style={styles.detailVal}>
                    {formatINR(selectedInvestment.investment_amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Interest Rate</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.interest_rate}% p.a.
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expected Interest</Text>
                  <Text style={styles.detailVal}>
                    {formatINR(selectedInvestment.expected_interest_amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Maturity Amount</Text>
                  <Text style={styles.detailVal}>
                    {formatINR(selectedInvestment.maturity_amount)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tenure</Text>
                  <Text style={styles.detailVal}>
                    {selectedInvestment.tenure_months} Months
                  </Text>
                </View>

                <Text style={styles.detailGroupTitle}>TIMELINE</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investment Date</Text>
                  <Text style={styles.detailVal}>
                    {formatSuperAdminDate(selectedInvestment.investment_date)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Maturity Date</Text>
                  <Text style={styles.detailVal}>
                    {formatSuperAdminDate(selectedInvestment.maturity_date)}
                  </Text>
                </View>
                {selectedInvestment.approved_date ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Approved Date</Text>
                    <Text style={styles.detailVal}>
                      {formatSuperAdminDate(selectedInvestment.approved_date)}
                    </Text>
                  </View>
                ) : null}
                {selectedInvestment.remarks ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remarks</Text>
                    <Text style={styles.detailVal}>
                      {selectedInvestment.remarks}
                    </Text>
                  </View>
                ) : null}
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

      <SuperAdminBottomTabBar navigation={navigation} active="More" />
    </SafeAreaView>
  );
};

export default SuperAdminReportsScreen;