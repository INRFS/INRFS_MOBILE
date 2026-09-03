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
import {styles} from '../../styles/superadmin/PaymentQueueScreen.styles';
import {formatIndianNumber, formatSuperAdminDate} from '../../services/superadmin/superAdminDashboardService';
import {
  getPaymentQueue,
  getPaymentDetails,
  getMonthlyInterestPaymentQueue,
  getTenureTimeoutSettlements,
  getTenureTimeoutSettlementDetails,
  getPrecloseSettlements,
  getPrecloseSettlementDetails,
  getAllTenureExtensions,
  getTenureExtensionDetails,
  approvePayment,
  rejectPayment,
  markPaymentPaid,
  approveMonthlyInterestPayment,
  rejectMonthlyInterestPayment,
  markMonthlyInterestPaymentPaid,
  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,
  markTenureTimeoutSettlementPaid,
  approvePrecloseRequest,
  rejectPrecloseRequest,
  markPrecloseRequestPaid,
  approveTenureExtension,
  rejectTenureExtension,
  markTenureExtensionPaid,
  getErrorMessage,
  SuperAdminPaymentRecord,
  PaymentCategory,
} from '../../services/superadmin/superAdminPaymentService';

const PAGE_SIZE = 10;

type TabType =
  | 'All'
  | 'Monthly Interest'
  | 'Tenure Settlement'
  | 'Pre-Close Settlement'
  | 'Tenure Extension';

const TABS: TabType[] = [
  'All',
  'Monthly Interest',
  'Tenure Settlement',
  'Pre-Close Settlement',
  'Tenure Extension',
];

const STATUS_OPTIONS = ['All Status', 'Pending', 'Approved', 'Paid', 'Rejected'];

const PaymentQueueScreen = ({navigation}: any) => {
  // Default to 'Monthly Interest' to match the active tab in the web screenshot
  const [activeTab, setActiveTab] = useState<TabType>('Monthly Interest');
  const [payments, setPayments] = useState<SuperAdminPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  // Review / Details Modal
  const [selectedPayment, setSelectedPayment] = useState<SuperAdminPaymentRecord | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Approve Modal
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Reject Modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Mark Paid Modal
  const [markPaidModalVisible, setMarkPaidModalVisible] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  /* ==========================================================
     LOAD PAYMENTS FROM BACKEND BASED ON TAB & FILTERS
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const offset = (page - 1) * PAGE_SIZE;
      const statusParam = selectedStatus !== 'All Status' ? selectedStatus : undefined;
      const searchParam = search.trim() || undefined;

      let res: {records: SuperAdminPaymentRecord[]; total: number};

      if (activeTab === 'Monthly Interest') {
        res = await getMonthlyInterestPaymentQueue({
          limit: PAGE_SIZE,
          offset,
        });
      } else if (activeTab === 'Tenure Settlement') {
        res = await getTenureTimeoutSettlements({
          limit: PAGE_SIZE,
          offset,
        });
      } else if (activeTab === 'Pre-Close Settlement') {
        res = await getPrecloseSettlements({
          limit: PAGE_SIZE,
          offset,
        });
      } else if (activeTab === 'Tenure Extension') {
        res = await getAllTenureExtensions({
          limit: PAGE_SIZE,
          offset,
        });
      } else {
        // 'All' category
        res = await getPaymentQueue({
          payment_type: 'All',
          limit: PAGE_SIZE,
          offset,
          search: searchParam,
          status: statusParam,
        });

        // Fallback: if All queue returned 0 records, query Monthly Interest
        if (!res.records || res.records.length === 0) {
          const miRes = await getMonthlyInterestPaymentQueue({limit: PAGE_SIZE, offset});
          if (miRes.records && miRes.records.length > 0) {
            res = miRes;
          }
        }
      }

      let records = res.records || [];

      // Deduplicate records by unique key (type + id)
      const seen = new Set<string>();
      records = records.filter(p => {
        const key = `${p.paymentType}-${p.sourceId || p.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Apply client-side search/status filter if provided
      if (searchParam) {
        const q = searchParam.toLowerCase();
        records = records.filter(
          p =>
            p.investorName.toLowerCase().includes(q) ||
            p.bondId.toLowerCase().includes(q) ||
            p.branchName.toLowerCase().includes(q) ||
            p.paymentType.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q) ||
            String(p.netAmount).includes(q),
        );
      }

      if (statusParam) {
        const s = statusParam.toLowerCase();
        records = records.filter(p => (p.status || '').toLowerCase() === s);
      }

      setPayments(records);
      setTotalCount(res.total || records.length);
    } catch (err: any) {
      console.log('Error loading payments:', err);
      setError(getErrorMessage(err) || 'Failed to load payments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, page, search, selectedStatus]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const searchTrimmed = searchInput.trim().toLowerCase();
  const filteredPayments = payments.filter(p => {
    if (!searchTrimmed) return true;
    return (
      (p.investorName && p.investorName.toLowerCase().includes(searchTrimmed)) ||
      (p.bondId && p.bondId.toLowerCase().includes(searchTrimmed)) ||
      (p.branchName && p.branchName.toLowerCase().includes(searchTrimmed)) ||
      (p.paymentType && p.paymentType.toLowerCase().includes(searchTrimmed)) ||
      (p.status && p.status.toLowerCase().includes(searchTrimmed)) ||
      String(p.netAmount || '').includes(searchTrimmed) ||
      String(p.amount || '').includes(searchTrimmed)
    );
  });

  // Dynamic Pending Summary calculation matching Web
  const pendingRecords = payments.filter(
    p => (p.status || '').toLowerCase() === 'pending',
  );
  const pendingCount = pendingRecords.length;
  const pendingAmount = pendingRecords.reduce(
    (acc, p) => acc + (p.netAmount || 0),
    0,
  );

  // Total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(p => p + 1);
  };

  const handleSearchSubmit = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setSelectedStatus('All Status');
    setActiveTab('Monthly Interest');
    setPage(1);
  };

  /* ==========================================================
     REVIEW DETAILS FLOW (Matching Web implementation)
     ========================================================== */

  const handleOpenReview = async (item: SuperAdminPaymentRecord) => {
    setSelectedPayment(item);
    setReviewModalVisible(true);
    setDetailsLoading(true);

    try {
      const sourceId = item.sourceId || item.id;
      let detailed: SuperAdminPaymentRecord | null = null;

      if (item.paymentType === 'Tenure Extension') {
        detailed = await getTenureExtensionDetails(sourceId);
      } else if (item.paymentType === 'Tenure Settlement') {
        detailed = await getTenureTimeoutSettlementDetails(sourceId);
      } else if (item.paymentType === 'Pre-Close Settlement') {
        detailed = await getPrecloseSettlementDetails(sourceId);
      } else {
        detailed = await getPaymentDetails(sourceId, 'MONTHLY_INTEREST');
      }

      if (detailed) setSelectedPayment(detailed);
    } catch (err) {
      console.log('Error fetching payment details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ==========================================================
     ACTION HANDLERS (Approve, Reject, Mark Paid)
     ========================================================== */

  const handleOpenApprove = (item: SuperAdminPaymentRecord) => {
    setSelectedPayment(item);
    setApproveModalVisible(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedPayment || selectedPayment.paymentType === 'Tenure Extension') return;

    try {
      setIsApproving(true);
      const sourceId = selectedPayment.sourceId || selectedPayment.id;

      if (selectedPayment.paymentType === 'Tenure Settlement') {
        await approveTenureTimeoutSettlement(sourceId);
      } else if (selectedPayment.paymentType === 'Pre-Close Settlement') {
        await approvePrecloseRequest(sourceId);
      } else {
        await approveMonthlyInterestPayment(sourceId);
      }

      setApproveModalVisible(false);
      setReviewModalVisible(false);
      await loadData(false);
      Alert.alert('Success', 'Payment approved successfully.');
    } catch (err: any) {
      Alert.alert('Approval Failed', getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  };

  const handleOpenReject = (item: SuperAdminPaymentRecord) => {
    if (item.paymentType === 'Tenure Extension') return;
    setSelectedPayment(item);
    setRejectionReason('');
    setRejectionError('');
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedPayment || selectedPayment.paymentType === 'Tenure Extension') return;

    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is mandatory');
      return;
    }

    try {
      setIsRejecting(true);
      const sourceId = selectedPayment.sourceId || selectedPayment.id;
      const reason = rejectionReason.trim();

      if (selectedPayment.paymentType === 'Tenure Settlement') {
        await rejectTenureTimeoutSettlement(sourceId, reason);
      } else if (selectedPayment.paymentType === 'Pre-Close Settlement') {
        await rejectPrecloseRequest(sourceId, reason);
      } else {
        await rejectMonthlyInterestPayment(sourceId, reason);
      }

      setRejectModalVisible(false);
      setReviewModalVisible(false);
      await loadData(false);
      Alert.alert('Success', 'Payment request rejected.');
    } catch (err: any) {
      Alert.alert('Rejection Failed', getErrorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  };

  const handleOpenMarkPaid = (item: SuperAdminPaymentRecord) => {
    if (item.paymentType === 'Tenure Extension') return;
    setSelectedPayment(item);
    setMarkPaidModalVisible(true);
  };

  const handleConfirmMarkPaid = async () => {
    if (!selectedPayment || selectedPayment.paymentType === 'Tenure Extension') return;

    try {
      setIsMarkingPaid(true);
      const sourceId = selectedPayment.sourceId || selectedPayment.id;

      if (selectedPayment.paymentType === 'Tenure Settlement') {
        await markTenureTimeoutSettlementPaid(sourceId);
      } else if (selectedPayment.paymentType === 'Pre-Close Settlement') {
        await markPrecloseRequestPaid(sourceId);
      } else {
        await markMonthlyInterestPaymentPaid(sourceId);
      }

      setMarkPaidModalVisible(false);
      setReviewModalVisible(false);
      await loadData(false);
      Alert.alert('Success', 'Payment marked as Paid successfully.');
    } catch (err: any) {
      Alert.alert('Action Failed', getErrorMessage(err));
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const getStatusBadgeStyle = (status: string, paymentType?: string) => {
    const s = (status || '').toLowerCase().trim();
    if (s === 'paid' || s === 'completed' || s === 'settled') {
      return {
        badge: styles.statusBadgePaid,
        text: styles.statusTextPaid,
        dotColor: '#059669',
        label: paymentType === 'Tenure Extension' ? 'Completed' : 'Paid',
      };
    }
    if (s === 'approved' || s === 'active') {
      return {
        badge: styles.statusBadgeApproved,
        text: styles.statusTextApproved,
        dotColor: '#1D4ED8',
        label: s === 'active' ? 'Active' : 'Approved',
      };
    }
    if (s === 'rejected' || s === 'declined') {
      return {
        badge: styles.statusBadgeRejected,
        text: styles.statusTextRejected,
        dotColor: '#DC2626',
        label: 'Rejected',
      };
    }
    return {
      badge: paymentType === 'Tenure Extension' ? styles.statusBadgeApproved : styles.statusBadgePending,
      text: paymentType === 'Tenure Extension' ? styles.statusTextApproved : styles.statusTextPending,
      dotColor: paymentType === 'Tenure Extension' ? '#1D4ED8' : '#D97706',
      label: paymentType === 'Tenure Extension' ? 'Active' : 'Pending',
    };
  };

  const isFiltered =
    search.length > 0 ||
    selectedStatus !== 'All Status';

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Payments" />

      {/* HEADER TITLE & SUBTITLE */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Payments</Text>
        <Text style={styles.headerSubtitle}>
          Super Admin • Payment Approval & Settlement Queue
        </Text>
      </View>

      {/* TOP PENDING SUMMARY CARD (Matches Web Screenshot) */}
      <View style={styles.pendingCardWrap}>
        <View style={styles.pendingCard}>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} Pending</Text>
          </View>
          <Text style={styles.pendingAmount}>
            ₹{formatIndianNumber(pendingAmount)}
          </Text>
        </View>
      </View>

      {/* CATEGORY TABS BAR (Horizontal Scroll matching Web) */}
      <View style={styles.tabBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => {
                setActiveTab(tab);
                setPage(1);
              }}>
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === tab && styles.tabBtnTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* SEARCH & FILTER BAR */}
      <View style={styles.filterSection}>
        {/* SEARCH INPUT + SEARCH BUTTON */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by investor, bond, amount..."
              placeholderTextColor="#94A3B8"
              value={searchInput}
              onChangeText={val => {
                setSearchInput(val);
                setSearch(val);
              }}
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

        {/* STATUS FILTER BUTTON + RESET */}
        <View style={styles.filterButtonsRow}>
          <TouchableOpacity
            style={[
              styles.filterDropdownBtn,
              selectedStatus !== 'All Status' && styles.filterDropdownBtnActive,
            ]}
            activeOpacity={0.8}
            onPress={() => setStatusModalVisible(true)}>
            <Text
              style={[
                styles.filterDropdownText,
                selectedStatus !== 'All Status' && styles.filterDropdownTextActive,
              ]}
              numberOfLines={1}>
              {selectedStatus}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.8}
            onPress={handleReset}>
            <Text style={styles.resetBtnText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

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
            <Text style={styles.loadingText}>Loading payment records...</Text>
          </View>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>💳</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {searchInput.trim() || isFiltered ? 'Not found' : 'No payments found'}
            </Text>
            <Text style={styles.emptyText}>
              {searchInput.trim() || isFiltered
                ? 'No payments match your current search or filter criteria.'
                : `There are currently no records under ${activeTab}.`}
            </Text>
          </View>
        ) : (
          filteredPayments.map((payment, index) => {
            const statusBadge = getStatusBadgeStyle(payment.status, payment.paymentType);
            const initial =
              payment.investorName && payment.investorName !== '—'
                ? payment.investorName.trim().charAt(0).toUpperCase()
                : 'P';

            const cardKey = `payment-${payment.paymentType}-${payment.sourceId || payment.id}-${payment.bondId || ''}-${payment.paymentMonth || ''}-${index}`;

            return (
              <View
                key={cardKey}
                style={[
                  styles.card,
                  {borderLeftColor: statusBadge.dotColor},
                ]}>
                {/* CARD HEADER: AVATAR INITIAL + INVESTOR NAME & BOND LINK + STATUS BADGE */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.investorName} numberOfLines={1}>
                      {payment.investorName}
                    </Text>
                    <Text style={styles.bondLinkTag} numberOfLines={1}>
                      {payment.bondId}
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
                      {statusBadge.label}
                    </Text>
                  </View>
                </View>

                {/* TYPE BADGE ROW */}
                <View style={styles.typeBadgeRow}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{payment.paymentType}</Text>
                  </View>
                  {payment.paymentMonth && payment.paymentMonth !== '—' ? (
                    <Text style={styles.monthTag}>Month: {payment.paymentMonth}</Text>
                  ) : null}
                </View>

                <View style={styles.cardDivider} />

                {payment.paymentType === 'Tenure Extension' ? (
                  <>
                    {/* INFO GRID ROW 1: EXTENSION TENURE & CURRENT MATURITY */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>EXTENSION TENURE</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.requestedExtension || '—'}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>CURRENT MATURITY</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.currentMaturityDate !== '—'
                            ? formatSuperAdminDate(payment.currentMaturityDate)
                            : '—'}
                        </Text>
                      </View>
                    </View>

                    {/* INFO GRID ROW 2: AMOUNT & REQUESTED BY */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>AMOUNT</Text>
                        <Text style={styles.netAmountValue} numberOfLines={1}>
                          ₹{formatIndianNumber(payment.amount || payment.principalAmount || 0)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>REQUESTED BY</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.requestedBy}
                        </Text>
                      </View>
                    </View>

                    {/* INFO GRID ROW 3: APPROVED BY & DATE */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>APPROVED BY ADMIN</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.approvedBy}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>DATE</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.createdDate !== '—'
                            ? formatSuperAdminDate(payment.createdDate)
                            : '—'}
                        </Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    {/* INFO GRID ROW 1: AMOUNT & GST */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>AMOUNT</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          ₹{formatIndianNumber(payment.amount || 0)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>GST</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          ₹{formatIndianNumber(payment.gstAmount || 0)}
                        </Text>
                      </View>
                    </View>

                    {/* INFO GRID ROW 2: NET AMOUNT & REQUESTED BY */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>NET AMOUNT</Text>
                        <Text style={styles.netAmountValue} numberOfLines={1}>
                          ₹{formatIndianNumber(payment.netAmount || 0)}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>REQUESTED BY</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.requestedBy}
                        </Text>
                      </View>
                    </View>

                    {/* INFO GRID ROW 3: APPROVED BY & DATE */}
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>APPROVED BY ADMIN</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.approvedBy}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>DATE</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {payment.createdDate !== '—'
                            ? formatSuperAdminDate(payment.createdDate)
                            : '—'}
                        </Text>
                      </View>
                    </View>
                  </>
                )}

                {/* CARD ACTIONS */}
                <View style={styles.cardDivider} />
                <View style={styles.cardActions}>
                  {payment.paymentType === 'Tenure Extension' ? (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnReview}
                        activeOpacity={0.7}
                        onPress={() => handleOpenReview(payment)}>
                        <Text style={styles.actionBtnReviewText}>👁️ View Details</Text>
                      </TouchableOpacity>
                      <View style={styles.actionBadgePaid}>
                        <Text style={styles.actionBadgePaidText}>
                          {payment.status.toLowerCase() === 'active'
                            ? '✓ Active'
                            : payment.status.toLowerCase() === 'completed'
                            ? '✓ Completed'
                            : payment.status.toLowerCase() === 'approved'
                            ? '✓ Approved'
                            : 'ℹ Reflection Only'}
                        </Text>
                      </View>
                    </>
                  ) : payment.status.toLowerCase() === 'pending' ? (
                    <>
                      <TouchableOpacity
                        style={styles.actionBtnReview}
                        activeOpacity={0.7}
                        onPress={() => handleOpenReview(payment)}>
                        <Text style={styles.actionBtnReviewText}>👁️ Review</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtnReject}
                        activeOpacity={0.7}
                        onPress={() => handleOpenReject(payment)}>
                        <Text style={styles.actionBtnRejectText}>⛔ Reject</Text>
                      </TouchableOpacity>
                    </>
                  ) : payment.status.toLowerCase() === 'approved' ? (
                    <TouchableOpacity
                      style={styles.actionBtnApprove}
                      activeOpacity={0.7}
                      onPress={() => handleOpenMarkPaid(payment)}>
                      <Text style={styles.actionBtnApproveText}>💳 Mark Paid</Text>
                    </TouchableOpacity>
                  ) : payment.status.toLowerCase() === 'paid' ? (
                    <View style={styles.actionBadgePaid}>
                      <Text style={styles.actionBadgePaidText}>✓ Paid</Text>
                    </View>
                  ) : payment.status.toLowerCase() === 'rejected' ? (
                    <View style={styles.actionBadgeRejected}>
                      <Text style={styles.actionBadgeRejectedText}>✕ Rejected</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionBtnReview}
                      activeOpacity={0.7}
                      onPress={() => handleOpenReview(payment)}>
                      <Text style={styles.actionBtnReviewText}>👁️ Review</Text>
                    </TouchableOpacity>
                  )}
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
          STATUS FILTER MODAL
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

            <ScrollView style={{maxHeight: 320}} showsVerticalScrollIndicator={false}>
              {STATUS_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.filterOptionItem,
                    selectedStatus === s && styles.filterOptionItemActive,
                  ]}
                  onPress={() => {
                    setSelectedStatus(s);
                    setPage(1);
                    setStatusModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedStatus === s && styles.filterOptionTextActive,
                    ]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          REVIEW & DETAILS MODAL
          ====================================================== */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedPayment && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>
                    {selectedPayment.paymentType === 'Tenure Extension'
                      ? 'Tenure Extension Details'
                      : 'Payment Review'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setReviewModalVisible(false)}
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
                      <Text style={styles.detailVal}>{selectedPayment.investorName}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>BOND NUMBER</Text>
                      <Text style={styles.detailVal}>{selectedPayment.bondId}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>PAYMENT TYPE</Text>
                      <Text style={styles.detailVal}>{selectedPayment.paymentType}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>STATUS</Text>
                      <Text
                        style={[
                          styles.detailVal,
                          {
                            color: getStatusBadgeStyle(
                              selectedPayment.status,
                              selectedPayment.paymentType,
                            ).dotColor,
                            fontWeight: '700',
                          },
                        ]}>
                        {selectedPayment.status}
                      </Text>
                    </View>

                    {selectedPayment.paymentType === 'Tenure Extension' ? (
                      <>
                        {selectedPayment.requestedExtension ? (
                          <View style={styles.detailField}>
                            <Text style={styles.detailLabel}>EXTENSION TENURE</Text>
                            <Text style={[styles.detailVal, {color: '#059669', fontWeight: '700'}]}>
                              {selectedPayment.requestedExtension}
                            </Text>
                          </View>
                        ) : null}

                        {selectedPayment.currentMaturityDate !== '—' && (
                          <View style={styles.detailField}>
                            <Text style={styles.detailLabel}>CURRENT / UPDATED MATURITY</Text>
                            <Text style={styles.detailVal}>
                              {formatSuperAdminDate(selectedPayment.currentMaturityDate)}
                            </Text>
                          </View>
                        )}

                        <View style={styles.detailField}>
                          <Text style={styles.detailLabel}>AMOUNT</Text>
                          <Text style={styles.detailVal}>
                            ₹{formatIndianNumber(selectedPayment.amount || selectedPayment.principalAmount || 0)}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.detailField}>
                          <Text style={styles.detailLabel}>AMOUNT</Text>
                          <Text style={styles.detailVal}>
                            ₹{formatIndianNumber(selectedPayment.amount || 0)}
                          </Text>
                        </View>

                        <View style={styles.detailField}>
                          <Text style={styles.detailLabel}>GST AMOUNT</Text>
                          <Text style={styles.detailVal}>
                            ₹{formatIndianNumber(selectedPayment.gstAmount || 0)}
                          </Text>
                        </View>

                        {/* NET SETTLEMENT HIGHLIGHT BOX */}
                        <View style={styles.amountBox}>
                          <Text style={styles.amountBoxLabel}>NET AMOUNT</Text>
                          <Text style={styles.amountBoxValue}>
                            ₹{formatIndianNumber(selectedPayment.netAmount || 0)}
                          </Text>
                        </View>

                        {selectedPayment.bankName !== '—' && (
                          <View style={styles.detailField}>
                            <Text style={styles.detailLabel}>BANK / ACCOUNT</Text>
                            <Text style={styles.detailVal}>
                              {selectedPayment.bankName} • {selectedPayment.accountNumber} ({selectedPayment.ifscCode})
                            </Text>
                          </View>
                        )}
                      </>
                    )}

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>REQUESTED BY</Text>
                      <Text style={styles.detailVal}>{selectedPayment.requestedBy}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>APPROVED BY ADMIN</Text>
                      <Text style={styles.detailVal}>{selectedPayment.approvedBy}</Text>
                    </View>

                    <View style={styles.detailField}>
                      <Text style={styles.detailLabel}>DATE</Text>
                      <Text style={styles.detailVal}>
                        {selectedPayment.createdDate !== '—'
                          ? formatSuperAdminDate(selectedPayment.createdDate)
                          : '—'}
                      </Text>
                    </View>

                    {selectedPayment.remarks ? (
                      <View style={styles.detailField}>
                        <Text style={styles.detailLabel}>REMARKS</Text>
                        <Text style={styles.detailVal}>{selectedPayment.remarks}</Text>
                      </View>
                    ) : null}
                  </ScrollView>
                )}

                <View style={styles.modalBtnRow}>
                  {selectedPayment.status.toLowerCase() === 'pending' &&
                    selectedPayment.paymentType !== 'Tenure Extension' && (
                      <>
                        <TouchableOpacity
                          style={styles.modalConfirmApproveBtn}
                          onPress={() => {
                            setReviewModalVisible(false);
                            handleOpenApprove(selectedPayment);
                          }}>
                          <Text style={styles.btnTextWhite}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.modalConfirmRejectBtn}
                          onPress={() => {
                            setReviewModalVisible(false);
                            handleOpenReject(selectedPayment);
                          }}>
                          <Text style={styles.btnTextWhite}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}

                  {selectedPayment.status.toLowerCase() === 'approved' &&
                    selectedPayment.paymentType !== 'Tenure Extension' && (
                      <TouchableOpacity
                        style={styles.modalConfirmMarkPaidBtn}
                        onPress={() => {
                          setReviewModalVisible(false);
                          handleOpenMarkPaid(selectedPayment);
                        }}>
                        <Text style={styles.btnTextWhite}>Mark Paid</Text>
                      </TouchableOpacity>
                    )}

                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setReviewModalVisible(false)}>
                    <Text style={styles.modalCancelBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          APPROVE CONFIRMATION MODAL
          ====================================================== */}
      <Modal
        visible={approveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setApproveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Approve Payment</Text>
              <TouchableOpacity
                onPress={() => setApproveModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmMessage}>
              Are you sure you want to approve the payout of{' '}
              <Text style={{fontWeight: '800', color: '#0F172A'}}>
                ₹{formatIndianNumber(selectedPayment?.netAmount || 0)}
              </Text>{' '}
              for <Text style={{fontWeight: '700'}}>{selectedPayment?.investorName}</Text>?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                disabled={isApproving}
                onPress={() => setApproveModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmApproveBtn, isApproving && {opacity: 0.6}]}
                disabled={isApproving}
                onPress={handleConfirmApprove}>
                {isApproving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnTextWhite}>Confirm Approval</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          REJECT CONFIRMATION MODAL
          ====================================================== */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Reject Payment Request</Text>
              <TouchableOpacity
                onPress={() => setRejectModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmMessage}>
              Please enter the reason for rejecting this payment for{' '}
              <Text style={{fontWeight: '700'}}>{selectedPayment?.investorName}</Text>:
            </Text>

            <TextInput
              style={[styles.reasonInput, rejectionError ? styles.inputError : null]}
              placeholder="e.g. Discrepancy in bank account details..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              value={rejectionReason}
              onChangeText={val => {
                setRejectionReason(val);
                if (rejectionError) setRejectionError('');
              }}
            />
            {rejectionError ? (
              <Text style={styles.errorTextSmall}>{rejectionError}</Text>
            ) : null}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                disabled={isRejecting}
                onPress={() => setRejectModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmRejectBtn, isRejecting && {opacity: 0.6}]}
                disabled={isRejecting}
                onPress={handleConfirmReject}>
                {isRejecting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnTextWhite}>Confirm Rejection</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          MARK PAID CONFIRMATION MODAL
          ====================================================== */}
      <Modal
        visible={markPaidModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMarkPaidModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Mark Payment as Paid</Text>
              <TouchableOpacity
                onPress={() => setMarkPaidModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmMessage}>
              Confirm that the amount of{' '}
              <Text style={{fontWeight: '800', color: '#059669'}}>
                ₹{formatIndianNumber(selectedPayment?.netAmount || 0)}
              </Text>{' '}
              has been transferred to <Text style={{fontWeight: '700'}}>{selectedPayment?.investorName}</Text>?
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                disabled={isMarkingPaid}
                onPress={() => setMarkPaidModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmMarkPaidBtn, isMarkingPaid && {opacity: 0.6}]}
                disabled={isMarkingPaid}
                onPress={handleConfirmMarkPaid}>
                {isMarkingPaid ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnTextWhite}>Confirm Paid</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SuperAdminBottomTabBar navigation={navigation} active="Payments" />
    </SafeAreaView>
  );
};

export default PaymentQueueScreen;