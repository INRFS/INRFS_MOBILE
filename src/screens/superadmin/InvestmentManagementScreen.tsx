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

import AppHeader from '../../components/AppHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {styles} from '../../styles/superadmin/InvestmentManagementScreen.styles';
import {
  getSuperAdminInvestments,
  getSuperAdminInvestmentSummary,
  getSuperAdminInvestmentDetails,
  getSuperAdminBranchesFilter,
  getErrorMessage,
  SuperAdminInvestmentRecord,
  SuperAdminInvestmentSummary,
  InvestmentFilterOption,
} from '../../services/superadmin/superAdminInvestmentService';
import {formatSuperAdminDate} from '../../services/superadmin/superAdminDashboardService';
import {exportToExcel} from '../../utils/excelExport';

const PAGE_SIZE = 10;

const formatINR = (val: number | string) => {
  const n = Number(val) || 0;
  return '₹' + n.toLocaleString('en-IN');
};

const formatFullINR = (val: number | string) => {
  const n = Number(val) || 0;
  return '₹' + n.toLocaleString('en-IN');
};

const InvestmentManagementScreen = ({navigation}: any) => {
  const [investments, setInvestments] = useState<SuperAdminInvestmentRecord[]>([]);
  const [branches, setBranches] = useState<InvestmentFilterOption[]>([]);
  const [summary, setSummary] = useState<SuperAdminInvestmentSummary>({
    totalInvestments: 0,
    activeInvestments: 0,
    pendingApproval: 0,
    matured: 0,
    totalInvested: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Search & Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // View Details Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingInvestment, setViewingInvestment] = useState<SuperAdminInvestmentRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const [invRes, summaryRes, branchesRes] = await Promise.all([
        getSuperAdminInvestments({
          limit: 100,
          offset: 0,
        }),
        getSuperAdminInvestmentSummary(),
        getSuperAdminBranchesFilter(),
      ]);

      const records = invRes.records || [];
      setInvestments(records);

      if (invRes.summary) {
        setSummary(invRes.summary);
      } else if (summaryRes && summaryRes.totalInvestments > 0) {
        setSummary(summaryRes);
      }

      if (branchesRes && branchesRes.length > 0) {
        setBranches(branchesRes);
      }
    } catch (err: any) {
      console.log('Error loading investments:', err);
      setError(getErrorMessage(err) || 'Failed to load investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Derived Branches (matching Web)
  const branchOptions = useMemo(() => {
    if (branches.length > 0) return branches;
    const unique = Array.from(
      new Set(
        investments
          .map(item => item.branchName)
          .filter(v => v && v !== '—' && v !== 'Branch'),
      ),
    ).sort();
    return unique.map((name, idx) => ({ id: idx + 1, name }));
  }, [branches, investments]);

  // Client Filtered (matching Web useMemo)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return investments.filter(i => {
      const matchesSearch =
        !q ||
        (i.investorName && i.investorName.toLowerCase().includes(q)) ||
        (i.bondId && i.bondId.toLowerCase().includes(q)) ||
        (i.investmentId && i.investmentId.toLowerCase().includes(q)) ||
        (i.branchName && i.branchName.toLowerCase().includes(q)) ||
        (i.status && i.status.toLowerCase().includes(q)) ||
        String(i.amount || '').includes(q);

      const matchesBranch =
        selectedBranchId === null ||
        i.branchId === selectedBranchId ||
        (i.branchName &&
          branchOptions.find((b: InvestmentFilterOption) => b.id === selectedBranchId)?.name === i.branchName);

      const matchesStatus =
        selectedStatus === 'All Status' ||
        (i.status || '').toLowerCase() === selectedStatus.toLowerCase() ||
        (selectedStatus.toLowerCase() === 'pending' &&
          (i.status || '').toLowerCase().includes('pending')) ||
        (selectedStatus.toLowerCase() === 'active' &&
          ((i.status || '').toLowerCase().includes('active') ||
            (i.status || '').toLowerCase().includes('approved')));

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [investments, search, selectedBranchId, selectedStatus, branchOptions]);

  // Overall Statistics (Matches Web stats useMemo from full dataset)
  const stats = useMemo(() => {
    const total =
      summary.totalInvestments > 0
        ? summary.totalInvestments
        : investments.length;

    const active =
      summary.activeInvestments > 0
        ? summary.activeInvestments
        : investments.filter(
            item =>
              String(item.status).toLowerCase().includes('active') ||
              String(item.status).toLowerCase().includes('approved'),
          ).length;

    const pending =
      summary.pendingApproval > 0
        ? summary.pendingApproval
        : investments.filter(item =>
            String(item.status).toLowerCase().includes('pending'),
          ).length;

    const matured =
      summary.matured > 0
        ? summary.matured
        : investments.filter(item =>
            String(item.status).toLowerCase().includes('mature'),
          ).length;

    const totalInvested =
      summary.totalInvested > 0
        ? summary.totalInvested
        : investments.reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      total,
      active,
      pending,
      matured,
      totalInvested,
    };
  }, [investments, summary]);

  // Total pages and Paginated Slice (Matches Web exactly)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(Math.max(1, page), totalPages);

  const paginated = useMemo(() => {
    return filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  }, [filtered, pageSafe]);

  const handlePrevPage = () => {
    if (pageSafe > 1) {
      setPage(pageSafe - 1);
    }
  };

  const handleNextPage = () => {
    if (pageSafe < totalPages) {
      setPage(pageSafe + 1);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const activeFilterCount =
    (selectedBranchId ? 1 : 0) + (selectedStatus !== 'All Status' ? 1 : 0);

  const resetFilters = () => {
    setSelectedBranchId(null);
    setSelectedStatus('All Status');
    setPage(1);
    setShowFilterModal(false);
  };

  /* ==========================================================
     VIEW DETAILS
     ========================================================== */

  const handleOpenView = async (inv: SuperAdminInvestmentRecord) => {
    setViewingInvestment(inv);
    setViewModalVisible(true);
    setDetailsLoading(true);

    try {
      const detailed = await getSuperAdminInvestmentDetails(inv.id);
      if (detailed) {
        setViewingInvestment(detailed);
      }
    } catch (err) {
      console.log('Error fetching detailed investment:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const recordsToExport = filtered.length > 0 ? filtered : investments;
      if (!recordsToExport.length) {
        Alert.alert('No data', 'There are no investment records to export.');
        return;
      }

      const rows = recordsToExport.map(inv => ({
        'Investment ID': inv.investmentId,
        'Investor Name': inv.investorName,
        'Investor ID': inv.investorId,
        'Bond ID': inv.bondId || '—',
        'Amount (₹)': inv.amount,
        'Tenure (Months)': inv.tenureMonths,
        'Interest Rate (%)': inv.interestRate,
        'Expected Monthly Interest (₹)': inv.monthlyInterest || 0,
        'Investment Date': inv.investmentDate ? formatSuperAdminDate(inv.investmentDate) : '—',
        'Maturity Date': inv.maturityDate ? formatSuperAdminDate(inv.maturityDate) : '—',
        Status: inv.status,
        Branch: inv.branchName || '—',
      }));

      await exportToExcel({
        filename: `SuperAdmin_Investments_${Date.now()}.xlsx`,
        sheetName: 'Investments',
        data: rows,
        title: 'Export Investments',
      });
    } catch (err: any) {
      console.warn('Export investments error:', err);
      Alert.alert('Export Failed', err?.message || 'Could not export investments.');
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'active' || s === 'approved') {
      return {
        badge: styles.statusBadgeActive,
        text: styles.statusTextActive,
        dotColor: '#059669',
      };
    }
    if (s === 'pending' || s === 'in review' || s === 'pending approval') {
      return {
        badge: styles.statusBadgePending,
        text: styles.statusTextPending,
        dotColor: '#D97706',
      };
    }
    if (s === 'matured' || s === 'completed' || s === 'settled') {
      return {
        badge: styles.statusBadgeMatured,
        text: styles.statusTextMatured,
        dotColor: '#2563EB',
      };
    }
    if (s === 'rejected' || s === 'cancelled') {
      return {
        badge: styles.statusBadgeRejected,
        text: styles.statusTextRejected,
        dotColor: '#DC2626',
      };
    }
    return {
      badge: styles.statusBadgeActive,
      text: styles.statusTextActive,
      dotColor: '#059669',
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Investment Management" />

      {/* HEADER TITLE & SUBTITLE */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Investment Management</Text>
        <Text style={styles.headerSubtitle}>
          All investments across all branches — {stats.total} {stats.total === 1 ? 'record' : 'records'}
        </Text>
      </View>

      {/* TOP SUMMARY STAT CARDS (Matches Web 5 Metric Cards) */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryScroll}>
          {/* TOTAL INVESTMENTS */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>TOTAL INVESTMENTS</Text>
              <View style={[styles.statIconWrap, styles.statIconBlue]}>
                <Text style={styles.statIconText}>📈</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>

          {/* ACTIVE INVESTMENTS */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>ACTIVE INVESTMENTS</Text>
              <View style={[styles.statIconWrap, styles.statIconGreen]}>
                <Text style={styles.statIconText}>✅</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.active}</Text>
          </View>

          {/* PENDING APPROVAL */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>PENDING APPROVAL</Text>
              <View style={[styles.statIconWrap, styles.statIconAmber]}>
                <Text style={styles.statIconText}>⏳</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.pending}</Text>
          </View>

          {/* MATURED */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>MATURED</Text>
              <View style={[styles.statIconWrap, styles.statIconPurple]}>
                <Text style={styles.statIconText}>🛡️</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.matured}</Text>
          </View>

          {/* TOTAL INVESTED */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>TOTAL INVESTED</Text>
              <View style={[styles.statIconWrap, styles.statIconGreen]}>
                <Text style={styles.statIconText}>₹</Text>
              </View>
            </View>
            <Text style={styles.statValueAmount}>{formatFullINR(stats.totalInvested)}</Text>
          </View>
        </ScrollView>
      </View>

      {/* TOP SEARCH & ACTION TOOLBAR */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search investor, bond or branch..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={handleSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => handleSearchChange('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          activeOpacity={0.8}
          onPress={() => setShowFilterModal(true)}>
          <Text style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}>
            ⚡ {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : 'Filters'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.8}
          onPress={handleExport}>
          <Text style={styles.exportBtnText}>⤓ Export</Text>
        </TouchableOpacity>
      </View>

      {/* ACTIVE FILTER CHIPS */}
      {activeFilterCount > 0 && (
        <View style={styles.activeChipsRow}>
          {selectedBranchId ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>
                Branch: {branchOptions.find((b: InvestmentFilterOption) => b.id === selectedBranchId)?.name || selectedBranchId}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedBranchId(null);
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {selectedStatus !== 'All Status' ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Status: {selectedStatus}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatus('All Status');
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ERROR BANNER */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

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
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={styles.loadingText}>Loading investments...</Text>
          </View>
        ) : paginated.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {search.trim() || activeFilterCount > 0 ? 'Not found' : 'No investments found'}
            </Text>
            <Text style={styles.emptyText}>
              {search || activeFilterCount > 0
                ? 'Try adjusting your search query or filters.'
                : 'No investment records registered in the system.'}
            </Text>
            {activeFilterCount > 0 || search ? (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => {
                  setSearch('');
                  resetFilters();
                }}>
                <Text style={styles.clearFilterBtnText}>Reset Filters & Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          paginated.map((inv: SuperAdminInvestmentRecord) => {
            const badgeStyle = getStatusBadgeStyle(inv.status);
            const initial =
              inv.investorName && inv.investorName !== 'Investor'
                ? inv.investorName.trim().charAt(0).toUpperCase()
                : 'I';

            return (
              <View
                key={String(inv.id)}
                style={[
                  styles.card,
                  {borderLeftColor: badgeStyle.dotColor},
                ]}>
                {/* CARD HEADER: INVESTOR AVATAR + INVESTOR NAME & BRANCH + STATUS */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.investorName} numberOfLines={1}>
                      {inv.investorName}
                    </Text>
                    <Text style={styles.branchLocation} numberOfLines={1}>
                      {inv.branchName}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, badgeStyle.badge]}>
                    <View style={[styles.statusDot, {backgroundColor: badgeStyle.dotColor}]} />
                    <Text style={[styles.statusBadgeText, badgeStyle.text]}>
                      {inv.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* INFO GRID ROW 1: AMOUNT & RATE */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>AMOUNT</Text>
                    <Text style={styles.amountValue} numberOfLines={1}>
                      {formatINR(inv.amount)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>RATE</Text>
                    <View style={styles.rateBadge}>
                      <Text style={styles.rateText}>{inv.interestRate}%</Text>
                    </View>
                  </View>
                </View>

                {/* INFO GRID ROW 2: INVESTED ON & MATURES ON */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>INVESTED ON</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {formatSuperAdminDate(inv.investmentDate)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MATURES ON</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {formatSuperAdminDate(inv.maturityDate)}
                    </Text>
                  </View>
                </View>

                {/* INFO GRID ROW 3: MONTHLY INTEREST & BOND / ID */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MONTHLY INT.</Text>
                    <Text style={styles.monthlyValue} numberOfLines={1}>
                      {formatINR(inv.monthlyInterest)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BOND / ID</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {inv.bondId !== '—' ? inv.bondId : inv.investmentId}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* ACTIONS ROW: VIEW DETAILS ONLY */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnView}
                    activeOpacity={0.7}
                    onPress={() => handleOpenView(inv)}>
                    <Text style={styles.actionBtnViewText}>👁️ View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && filtered.length > 0 && (
          <View style={styles.paginationBar}>
            <Text style={styles.pageInfoText}>
              Showing {filtered.length === 0 ? 0 : (pageSafe - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} records
            </Text>

            <View style={styles.paginationBtnGroup}>
              <TouchableOpacity
                style={[styles.pageBtn, pageSafe <= 1 && styles.pageBtnDisabled]}
                disabled={pageSafe <= 1}
                onPress={handlePrevPage}>
                <Text style={[styles.pageBtnText, pageSafe <= 1 && styles.pageBtnTextDisabled]}>
                  ◀ Prev
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pageBtn, pageSafe >= totalPages && styles.pageBtnDisabled]}
                disabled={pageSafe >= totalPages}
                onPress={handleNextPage}>
                <Text style={[styles.pageBtnText, pageSafe >= totalPages && styles.pageBtnTextDisabled]}>
                  Next ▶
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ======================================================
          FILTER MODAL
          ====================================================== */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Filter Investments</Text>
              <TouchableOpacity
                onPress={() => setShowFilterModal(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              {/* STATUS FILTER */}
              <Text style={styles.filterSectionLabel}>STATUS</Text>
              <View style={styles.segmentedRow}>
                {['All Status', 'Active', 'Pending', 'Matured', 'Rejected'].map(statusKey => (
                  <TouchableOpacity
                    key={statusKey}
                    style={[
                      styles.segmentedBtn,
                      selectedStatus === statusKey && styles.segmentedBtnActive,
                    ]}
                    onPress={() => setSelectedStatus(statusKey)}>
                    <Text
                      style={[
                        styles.segmentedText,
                        selectedStatus === statusKey && styles.segmentedTextActive,
                      ]}>
                      {statusKey}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* BRANCH FILTER */}
              <Text style={[styles.filterSectionLabel, {marginTop: 16}]}>BRANCH</Text>
              <View style={styles.pillRow}>
                <TouchableOpacity
                  style={[
                    styles.selectPill,
                    selectedBranchId === null && styles.selectPillActive,
                  ]}
                  onPress={() => setSelectedBranchId(null)}>
                  <Text
                    style={[
                      styles.selectPillText,
                      selectedBranchId === null && styles.selectPillTextActive,
                    ]}>
                    All Branches
                  </Text>
                </TouchableOpacity>

                {branchOptions.map((b: InvestmentFilterOption) => (
                  <TouchableOpacity
                    key={String(b.id)}
                    style={[
                      styles.selectPill,
                      selectedBranchId === b.id && styles.selectPillActive,
                    ]}
                    onPress={() => setSelectedBranchId(b.id)}>
                    <Text
                      style={[
                        styles.selectPillText,
                        selectedBranchId === b.id && styles.selectPillTextActive,
                      ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetFilters}>
                <Text style={styles.cancelBtnText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={() => {
                  setPage(1);
                  setShowFilterModal(false);
                }}>
                <Text style={styles.submitBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          VIEW DETAILS MODAL
          ====================================================== */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {viewingInvestment && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Investment Details</Text>
                  <TouchableOpacity
                    onPress={() => setViewModalVisible(false)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                {detailsLoading ? (
                  <View style={{paddingVertical: 30, alignItems: 'center'}}>
                    <ActivityIndicator size="small" color="#0B1E45" />
                    <Text style={{marginTop: 8, color: '#64748B', fontSize: 13}}>
                      Loading details...
                    </Text>
                  </View>
                ) : (
                  <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>INVESTOR NAME</Text>
                      <Text style={styles.detailVal}>{viewingInvestment.investorName}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BRANCH</Text>
                      <Text style={styles.detailVal}>{viewingInvestment.branchName}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BOND NUMBER / ID</Text>
                      <Text style={styles.detailVal}>
                        {viewingInvestment.bondId !== '—' ? viewingInvestment.bondId : viewingInvestment.investmentId}
                      </Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>INVESTMENT AMOUNT</Text>
                      <Text style={[styles.detailVal, {fontWeight: '800', color: '#0B1E45'}]}>
                        {formatINR(viewingInvestment.amount)}
                      </Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>INTEREST RATE</Text>
                      <Text style={styles.detailVal}>{viewingInvestment.interestRate}%</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>TENURE</Text>
                      <Text style={styles.detailVal}>{viewingInvestment.tenureMonths} Months</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>MONTHLY INTEREST</Text>
                      <Text style={[styles.detailVal, {color: '#059669', fontWeight: '800'}]}>
                        {formatINR(viewingInvestment.monthlyInterest)}
                      </Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>INVESTED ON</Text>
                      <Text style={styles.detailVal}>{formatSuperAdminDate(viewingInvestment.investmentDate)}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>MATURES ON</Text>
                      <Text style={styles.detailVal}>{formatSuperAdminDate(viewingInvestment.maturityDate)}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>STATUS</Text>
                      <Text
                        style={[
                          styles.detailVal,
                          {
                            color: getStatusBadgeStyle(viewingInvestment.status).dotColor,
                            fontWeight: '700',
                          },
                        ]}>
                        {viewingInvestment.status}
                      </Text>
                    </View>
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.doneBtn}
                  activeOpacity={0.8}
                  onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.doneBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <SuperAdminBottomTabBar navigation={navigation} active="Investments" />
    </SafeAreaView>
  );
};

export default InvestmentManagementScreen;