import React, {useCallback, useEffect, useState} from 'react';
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
import {styles} from '../../styles/superadmin/InvestorManagementScreen.styles';
import {
  getInvestors,
  getInvestorSummary,
  getInvestorDetails,
  getInvestorBranchesFilter,
  getInvestorStatusesFilter,
  exportInvestorsCSV,
  getErrorMessage,
  SuperAdminInvestorRecord,
  InvestorSummaryData,
  InvestorFilterOption,
} from '../../services/superadmin/superAdminInvestorService';
import {formatSuperAdminDate, formatIndianNumber} from '../../services/superadmin/superAdminDashboardService';

const PAGE_SIZE = 10;

const DEFAULT_STATUS_OPTIONS: InvestorFilterOption[] = [
  {id: 1, name: 'Active'},
  {id: 2, name: 'Inactive'},
  {id: 3, name: 'Pending'},
  {id: 4, name: 'Suspended'},
];

const InvestorManagementScreen = ({navigation}: any) => {
  const [investors, setInvestors] = useState<SuperAdminInvestorRecord[]>([]);
  const [branches, setBranches] = useState<InvestorFilterOption[]>([]);
  const [statuses, setStatuses] = useState<InvestorFilterOption[]>(DEFAULT_STATUS_OPTIONS);
  const [summary, setSummary] = useState<InvestorSummaryData>({
    totalInvestors: 0,
    activeInvestors: 0,
    inactiveInvestors: 0,
    totalAum: '₹0',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Search & Filters
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedStatusName, setSelectedStatusName] = useState<string>('All Status');

  // Modals for filters & details
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingInvestor, setViewingInvestor] = useState<SuperAdminInvestorRecord | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const offset = (page - 1) * PAGE_SIZE;

      const [invRes, sumRes, branchRes, statusRes] = await Promise.all([
        getInvestors({
          limit: PAGE_SIZE,
          offset,
          search: search.trim() || undefined,
          branch_id: selectedBranchId || undefined,
          status_id: selectedStatusId || undefined,
          status: selectedStatusName !== 'All Status' ? selectedStatusName : undefined,
        }),
        getInvestorSummary(),
        getInvestorBranchesFilter(),
        getInvestorStatusesFilter(),
      ]);

      let records = invRes.records || [];
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        records = records.filter(
          i =>
            (i.name && i.name.toLowerCase().includes(q)) ||
            (i.email && i.email.toLowerCase().includes(q)) ||
            (i.mobile && i.mobile.includes(q)) ||
            (i.investorId && i.investorId.toLowerCase().includes(q)) ||
            (i.branchName && i.branchName.toLowerCase().includes(q)) ||
            (i.status && i.status.toLowerCase().includes(q)),
        );
      }
      setInvestors(records);
      const total = records.length > 0 ? invRes.total || records.length : 0;
      setTotalCount(total);

      if (sumRes && sumRes.totalInvestors > 0) {
        setSummary(sumRes);
      } else {
        const activeCount = records.filter(i => (i.status || '').toLowerCase() === 'active').length;
        const inactiveCount = records.filter(i => (i.status || '').toLowerCase() !== 'active').length;
        setSummary({
          totalInvestors: total,
          activeInvestors: sumRes.activeInvestors || activeCount,
          inactiveInvestors: sumRes.inactiveInvestors || inactiveCount,
          totalAum: sumRes.totalAum || '₹0',
        });
      }

      if (branchRes && branchRes.length > 0) {
        setBranches(branchRes);
      }
      if (statusRes && statusRes.length > 0) {
        setStatuses(statusRes);
      }
    } catch (err: any) {
      console.log('Error loading investors:', err);
      setError(getErrorMessage(err) || 'Failed to load investors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, selectedBranchId, selectedStatusId, selectedStatusName]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setSelectedBranchId(null);
    setSelectedStatusId(null);
    setSelectedStatusName('All Status');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await exportInvestorsCSV();
      Alert.alert(
        'Export Investors',
        `Exporting ${totalCount} investor records. The CSV download will begin shortly.`,
        [{text: 'OK'}],
      );
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export investors.');
    }
  };

  /* ==========================================================
     VIEW DETAILS
     ========================================================== */

  const handleOpenView = async (inv: SuperAdminInvestorRecord) => {
    setViewingInvestor(inv);
    setViewModalVisible(true);
    setDetailsLoading(true);

    try {
      const detailed = await getInvestorDetails(inv.id);
      if (detailed) {
        setViewingInvestor(detailed);
      }
    } catch (err) {
      console.log('Error fetching detailed investor:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Helper styles for status badge
  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'active' || s === 'approved' || s === 'verified') {
      return {
        badge: styles.statusBadgeActive,
        text: styles.statusTextActive,
        dotColor: '#059669',
      };
    }
    return {
      badge: styles.statusBadgeInactive,
      text: styles.statusTextInactive,
      dotColor: '#DC2626',
    };
  };

  // Helper styles for KYC badge
  const getKycBadgeStyle = (kyc: string) => {
    const k = (kyc || '').toLowerCase().trim();
    if (k === 'approved' || k === 'verified' || k === 'active') {
      return {
        pill: styles.kycPillVerified,
        text: styles.kycTextVerified,
        label: 'Verified',
      };
    }
    if (k === 'rejected' || k === 'declined') {
      return {
        pill: styles.kycPillRejected,
        text: styles.kycTextRejected,
        label: 'Rejected',
      };
    }
    return {
      pill: styles.kycPillPending,
      text: styles.kycTextPending,
      label: 'Pending',
    };
  };

  const activeBranchName = selectedBranchId
    ? branches.find(b => b.id === selectedBranchId)?.name || 'Branch'
    : 'All Branches';

  const isFiltered =
    search.length > 0 ||
    selectedBranchId !== null ||
    selectedStatusName !== 'All Status';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Investor Management" />

      {/* HEADER TITLE & SUBTITLE */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Investor Management</Text>
        <Text style={styles.headerSubtitle}>
          All investors across all branches — {totalCount} {totalCount === 1 ? 'record' : 'records'}
        </Text>
      </View>

      {/* TOP SUMMARY STAT CARDS (Matches Web 4 Metric Cards) */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.summaryScroll}>
          {/* TOTAL INVESTORS */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>TOTAL INVESTORS</Text>
              <View style={[styles.statIconWrap, styles.statIconBlue]}>
                <Text style={styles.statIconText}>👥</Text>
              </View>
            </View>
            <Text style={styles.statValue}>
              {formatIndianNumber(summary.totalInvestors || totalCount)}
            </Text>
          </View>

          {/* ACTIVE INVESTORS */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>ACTIVE INVESTORS</Text>
              <View style={[styles.statIconWrap, styles.statIconGreen]}>
                <Text style={styles.statIconText}>👤</Text>
              </View>
            </View>
            <Text style={styles.statValue}>
              {formatIndianNumber(summary.activeInvestors)}
            </Text>
          </View>

          {/* INACTIVE INVESTORS */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>INACTIVE INVESTORS</Text>
              <View style={[styles.statIconWrap, styles.statIconAmber]}>
                <Text style={styles.statIconText}>👤</Text>
              </View>
            </View>
            <Text style={styles.statValue}>
              {formatIndianNumber(summary.inactiveInvestors)}
            </Text>
          </View>

          {/* TOTAL AUM */}
          <View style={styles.statCard}>
            <View style={styles.statCardTop}>
              <Text style={styles.statLabel}>TOTAL AUM</Text>
              <View style={[styles.statIconWrap, styles.statIconPurple]}>
                <Text style={styles.statIconText}>₹</Text>
              </View>
            </View>
            <Text style={styles.statValueAum}>{summary.totalAum}</Text>
          </View>
        </ScrollView>
      </View>

      {/* SEARCH & FILTER BAR (Matches Web Filtering Controls) */}
      <View style={styles.filterSection}>
        {/* ROW 1: SEARCH INPUT + SEARCH BUTTON */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Investor..."
              placeholderTextColor="#94A3B8"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.searchBtn}
            activeOpacity={0.8}
            onPress={handleSearchSubmit}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* ROW 2: BRANCH DROPDOWN + STATUS DROPDOWN + RESET + EXPORT */}
        <View style={styles.filterButtonsRow}>
          {/* BRANCH DROPDOWN BUTTON */}
          <TouchableOpacity
            style={[
              styles.filterDropdownBtn,
              selectedBranchId !== null && styles.filterDropdownBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setBranchModalVisible(true)}>
            <Text
              style={[
                styles.filterDropdownText,
                selectedBranchId !== null && styles.filterDropdownTextActive,
              ]}
              numberOfLines={1}>
              {activeBranchName}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* STATUS DROPDOWN BUTTON */}
          <TouchableOpacity
            style={[
              styles.filterDropdownBtn,
              selectedStatusName !== 'All Status' && styles.filterDropdownBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setStatusModalVisible(true)}>
            <Text
              style={[
                styles.filterDropdownText,
                selectedStatusName !== 'All Status' && styles.filterDropdownTextActive,
              ]}
              numberOfLines={1}>
              {selectedStatusName}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {/* RESET BUTTON */}
          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.8}
            onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺ Reset</Text>
          </TouchableOpacity>

          {/* EXPORT BUTTON */}
          <TouchableOpacity
            style={styles.exportBtn}
            activeOpacity={0.8}
            onPress={handleExport}>
            <Text style={styles.exportBtnText}>⤓ Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTIVE FILTER CHIPS ROW */}
      {isFiltered && (
        <View style={styles.activeChipsRow}>
          {search ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Query: "{search}"</Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchInput('');
                  setSearch('');
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {selectedBranchId ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Branch: {activeBranchName}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedBranchId(null);
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {selectedStatusName !== 'All Status' ? (
            <View style={styles.activeChip}>
              <Text style={styles.activeChipText}>Status: {selectedStatusName}</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStatusId(null);
                  setSelectedStatusName('All Status');
                  setPage(1);
                }}>
                <Text style={styles.activeChipClose}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity onPress={handleReset} style={styles.clearAllBtn}>
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
            <Text style={styles.loadingText}>Loading investors...</Text>
          </View>
        ) : investors.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>👥</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {search.trim() || isFiltered ? 'Not found' : 'No investors found'}
            </Text>
            <Text style={styles.emptyText}>
              {isFiltered
                ? 'Try adjusting your search query or filters.'
                : 'No registered investors found in the system.'}
            </Text>
            {isFiltered ? (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={handleReset}>
                <Text style={styles.clearFilterBtnText}>Reset Filters & Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          investors.map(inv => {
            const statusBadge = getStatusBadgeStyle(inv.status);
            const kycBadge = getKycBadgeStyle(inv.kycStatus);
            const initial =
              inv.name && inv.name !== '—'
                ? inv.name.trim().charAt(0).toUpperCase()
                : 'I';

            return (
              <View
                key={String(inv.id)}
                style={[
                  styles.card,
                  {borderLeftColor: statusBadge.dotColor},
                ]}>
                {/* CARD HEADER: AVATAR INITIAL + INVESTOR NAME & ID + STATUS BADGE */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.investorName} numberOfLines={1}>
                      {inv.name}
                    </Text>
                    <Text style={styles.investorIdTag} numberOfLines={1}>
                      {inv.investorId}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, statusBadge.badge]}>
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: statusBadge.dotColor},
                      ]}
                    />
                    <Text style={[styles.statusBadgeText, statusBadge.text]}>
                      {inv.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* INFO GRID ROW 1: MOBILE & BRANCH */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MOBILE</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {inv.mobile}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BRANCH</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {inv.branchName}
                    </Text>
                  </View>
                </View>

                {/* INFO GRID ROW 2: REGISTERED & KYC STATUS */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>REGISTERED</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {formatSuperAdminDate(inv.registeredDate)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>KYC STATUS</Text>
                    <View style={[styles.kycPill, kycBadge.pill]}>
                      <Text style={[styles.kycText, kycBadge.text]}>
                        {kycBadge.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* INFO GRID ROW 3: TOTAL AUM */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>TOTAL AUM</Text>
                    <Text style={styles.aumValue} numberOfLines={1}>
                      {inv.totalAum}
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
        {!loading && totalCount > 0 && (
          <View style={styles.paginationBar}>
            <Text style={styles.pageInfoText}>
              Showing {(page - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
            </Text>

            <View style={styles.paginationBtnGroup}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                disabled={page <= 1}
                onPress={handlePrevPage}>
                <Text style={[styles.pageBtnText, page <= 1 && styles.pageBtnTextDisabled]}>
                  ◀ Prev
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                disabled={page >= totalPages}
                onPress={handleNextPage}>
                <Text style={[styles.pageBtnText, page >= totalPages && styles.pageBtnTextDisabled]}>
                  Next ▶
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ======================================================
          BRANCH FILTER PICKER MODAL
          ====================================================== */}
      <Modal
        visible={branchModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBranchModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Branch</Text>
              <TouchableOpacity
                onPress={() => setBranchModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterOptionItem,
                  selectedBranchId === null && styles.filterOptionItemActive,
                ]}
                onPress={() => {
                  setSelectedBranchId(null);
                  setPage(1);
                  setBranchModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedBranchId === null && styles.filterOptionTextActive,
                  ]}>
                  All Branches
                </Text>
              </TouchableOpacity>

              {branches.map(b => (
                <TouchableOpacity
                  key={String(b.id)}
                  style={[
                    styles.filterOptionItem,
                    selectedBranchId === b.id && styles.filterOptionItemActive,
                  ]}
                  onPress={() => {
                    setSelectedBranchId(b.id);
                    setPage(1);
                    setBranchModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedBranchId === b.id && styles.filterOptionTextActive,
                    ]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          STATUS FILTER PICKER MODAL
          ====================================================== */}
      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity
                onPress={() => setStatusModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterOptionItem,
                  selectedStatusName === 'All Status' && styles.filterOptionItemActive,
                ]}
                onPress={() => {
                  setSelectedStatusId(null);
                  setSelectedStatusName('All Status');
                  setPage(1);
                  setStatusModalVisible(false);
                }}>
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedStatusName === 'All Status' && styles.filterOptionTextActive,
                  ]}>
                  All Status
                </Text>
              </TouchableOpacity>

              {statuses.map(s => (
                <TouchableOpacity
                  key={String(s.id || s.name)}
                  style={[
                    styles.filterOptionItem,
                    (selectedStatusId === s.id || selectedStatusName === s.name) &&
                      styles.filterOptionItemActive,
                  ]}
                  onPress={() => {
                    setSelectedStatusId(s.id || null);
                    setSelectedStatusName(s.name);
                    setPage(1);
                    setStatusModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      (selectedStatusId === s.id || selectedStatusName === s.name) &&
                        styles.filterOptionTextActive,
                    ]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          VIEW INVESTOR DETAILS MODAL
          ====================================================== */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {viewingInvestor && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Investor Details</Text>
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
                      <Text style={styles.detailVal}>{viewingInvestor.name}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>INVESTOR ID</Text>
                      <Text style={styles.detailVal}>{viewingInvestor.investorId}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>MOBILE</Text>
                      <Text style={styles.detailVal}>{viewingInvestor.mobile}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BRANCH</Text>
                      <Text style={styles.detailVal}>{viewingInvestor.branchName}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>REGISTERED DATE</Text>
                      <Text style={styles.detailVal}>
                        {formatSuperAdminDate(viewingInvestor.registeredDate)}
                      </Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>KYC STATUS</Text>
                      <View style={{marginTop: 4}}>
                        <View
                          style={[
                            styles.kycPill,
                            getKycBadgeStyle(viewingInvestor.kycStatus).pill,
                          ]}>
                          <Text
                            style={[
                              styles.kycText,
                              getKycBadgeStyle(viewingInvestor.kycStatus).text,
                            ]}>
                            {getKycBadgeStyle(viewingInvestor.kycStatus).label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>ACCOUNT STATUS</Text>
                      <Text
                        style={[
                          styles.detailVal,
                          {
                            color: getStatusBadgeStyle(viewingInvestor.status).dotColor,
                            fontWeight: '700',
                          },
                        ]}>
                        {viewingInvestor.status}
                      </Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>TOTAL INVESTED / AUM</Text>
                      <Text style={[styles.detailVal, {color: '#059669', fontWeight: '800'}]}>
                        {viewingInvestor.totalAum}
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

      <SuperAdminBottomTabBar navigation={navigation} active="Investors" />
    </SafeAreaView>
  );
};

export default InvestorManagementScreen;