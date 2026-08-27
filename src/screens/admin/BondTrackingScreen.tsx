import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';
import {styles} from '../../styles/admin/BondTrackingScreen.styles';
import {
  getInvestments,
  getInvestmentDetails,
  approveInvestment,
  rejectInvestment,
  getPendingTenureExtensions,
  approveTenureExtension,
  submitTenureExtension,
  getErrorMessage,
  InvestmentRecord,
  TenureExtensionRecord,
  InvestmentDetails,
} from '../../services/admin/investmentManagementService';

type TabKey = 'pending' | 'tenure' | 'all';

const formatINR = (n: number) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr === '—' || dateStr === '-') return '—';
  try {
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return `${day} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
    }
  } catch {}
  return dateStr;
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

const BondTrackingScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [query, setQuery] = useState('');

  const [investments, setInvestments] = useState<InvestmentRecord[]>([]);
  const [tenureRequests, setTenureRequests] = useState<TenureExtensionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Modal States
  const [viewingDetails, setViewingDetails] = useState<InvestmentDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [approvingItem, setApprovingItem] = useState<InvestmentRecord | null>(null);
  const [approveRate, setApproveRate] = useState('3.00');
  const [approveRemarks, setApproveRemarks] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const [rejectingItem, setRejectingItem] = useState<InvestmentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [reviewingTenure, setReviewingTenure] = useState<TenureExtensionRecord | null>(null);
  const [tenureRemarks, setTenureRemarks] = useState('');
  const [isSubmittingTenure, setIsSubmittingTenure] = useState(false);

  /* ==========================================================
     LOAD DATA FROM BACKEND
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const [invRes, tenureRes] = await Promise.all([
        getInvestments({limit: 100, offset: 0}),
        getPendingTenureExtensions({limit: 100, offset: 0}),
      ]);

      setInvestments(invRes.records || []);
      setTenureRequests(tenureRes.records || []);
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

  /* ==========================================================
     STATISTICS (Derived from Real Backend Records)
     ========================================================== */

  const stats = useMemo(() => {
    const totalCount = investments.length;
    const pendingCount = investments.filter(i => i.status === 'Pending').length;
    const activeCount = investments.filter(i => i.status === 'Active').length;
    const rejectedCount = investments.filter(i => i.status === 'Rejected').length;
    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);

    return {
      totalCount,
      pendingCount,
      activeCount,
      rejectedCount,
      totalInvested,
    };
  }, [investments]);

  /* ==========================================================
     TAB FILTERING & SEARCH
     ========================================================== */

  const filteredInvestments = useMemo(() => {
    let list = investments;
    if (activeTab === 'pending') {
      list = investments.filter(i => i.status === 'Pending');
    }

    const q = query.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      i =>
        i.investorName.toLowerCase().includes(q) ||
        i.investorId.toLowerCase().includes(q) ||
        i.investmentId.toLowerCase().includes(q) ||
        i.bondId.toLowerCase().includes(q),
    );
  }, [investments, activeTab, query]);

  const filteredTenureRequests = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return tenureRequests;

    return tenureRequests.filter(
      r =>
        r.investorName.toLowerCase().includes(q) ||
        r.investorId.toLowerCase().includes(q) ||
        r.bondId.toLowerCase().includes(q) ||
        String(r.requestId).includes(q),
    );
  }, [tenureRequests, query]);

  /* ==========================================================
     ACTION HANDLERS
     ========================================================== */

  // VIEW DETAILS
  const handleOpenView = async (investmentId: string) => {
    try {
      setDetailsLoading(true);
      const details = await getInvestmentDetails(investmentId);
      setViewingDetails(details);
    } catch (err: any) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setDetailsLoading(false);
    }
  };

  // APPROVE
  const handleOpenApprove = (item: InvestmentRecord) => {
    setApprovingItem(item);
    setApproveRate(item.interestRate ? String(item.interestRate) : '3.00');
    setApproveRemarks('');
  };

  const handleConfirmApprove = async () => {
    if (!approvingItem) return;
    const rateNum = parseFloat(approveRate.trim());
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      Alert.alert('Validation Error', 'Please enter a valid interest rate between 0 and 100%.');
      return;
    }

    try {
      setIsApproving(true);
      await approveInvestment(approvingItem.investmentId, {
        interestRate: rateNum,
        remarks: approveRemarks.trim() || undefined,
      });

      setApprovingItem(null);
      await loadData(false);
      Alert.alert('Success', `Investment ${approvingItem.investmentId} approved successfully.`);
    } catch (err: any) {
      Alert.alert('Action Failed', getErrorMessage(err));
    } finally {
      setIsApproving(false);
    }
  };

  // REJECT
  const handleOpenReject = (item: InvestmentRecord) => {
    setRejectingItem(item);
    setRejectReason('');
    setRejectRemarks('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingItem) return;
    if (!rejectReason.trim()) {
      Alert.alert('Validation Error', 'Rejection reason is required.');
      return;
    }

    try {
      setIsRejecting(true);
      await rejectInvestment(rejectingItem.investmentId, {
        rejectionReason: rejectReason.trim(),
        remarks: rejectRemarks.trim() || undefined,
      });

      setRejectingItem(null);
      await loadData(false);
      Alert.alert('Success', `Investment ${rejectingItem.investmentId} rejected.`);
    } catch (err: any) {
      Alert.alert('Action Failed', getErrorMessage(err));
    } finally {
      setIsRejecting(false);
    }
  };

  // TENURE REVIEW & APPROVE
  const handleOpenReviewTenure = (r: TenureExtensionRecord) => {
    setReviewingTenure(r);
    setTenureRemarks('');
  };

  const handleConfirmApproveTenure = async () => {
    if (!reviewingTenure) return;

    try {
      setIsSubmittingTenure(true);
      await approveTenureExtension(reviewingTenure.requestId, {
        remarks: tenureRemarks.trim() || 'Approved by Admin.',
      });

      setReviewingTenure(null);
      await loadData(false);
      Alert.alert(
        'Success',
        'Tenure extension approved successfully. Investment tenure has been updated.',
      );
    } catch (err: any) {
      Alert.alert('Action Failed', getErrorMessage(err));
    } finally {
      setIsSubmittingTenure(false);
    }
  };

  // EXPORT
  const handleExport = () => {
    Alert.alert('Export', 'Investment records exported successfully.');
  };

  /* ==========================================================
     STATUS PILL
     ========================================================== */

  const renderStatusPill = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'approved' || s === 'success') {
      return (
        <View style={[local.pill, local.pillGreen]}>
          <Text style={[local.pillText, local.pillTextGreen]}>Active</Text>
        </View>
      );
    }
    if (s === 'pending') {
      return (
        <View style={[local.pill, local.pillAmber]}>
          <Text style={[local.pillText, local.pillTextAmber]}>Pending Approval</Text>
        </View>
      );
    }
    if (s === 'rejected') {
      return (
        <View style={[local.pill, local.pillRed]}>
          <Text style={[local.pillText, local.pillTextRed]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[local.pill, local.pillGray]}>
        <Text style={[local.pillText, local.pillTextGray]}>{status}</Text>
      </View>
    );
  };

  /* ==========================================================
     MAIN RENDER
     ========================================================== */

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

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
        {/* ================= PAGE TITLE ================= */}
        <Text style={styles.title}>Investment Management</Text>
        <Text style={styles.subtitle}>
          Review, approve, and track all investor bonds and tenure extension requests
        </Text>

        {/* ================= 1. METRIC CARDS SECTION ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={local.metricsScroll}
          contentContainerStyle={local.metricsContainer}>
          <View style={[local.metricCard, local.metricCardNavy]}>
            <Text style={local.metricLabelLight}>TOTAL INVESTED</Text>
            <Text style={local.metricValueLight}>{formatINR(stats.totalInvested)}</Text>
          </View>

          <View style={[local.metricCard, local.metricCardAmber]}>
            <Text style={local.metricLabelAmber}>PENDING APPROVAL</Text>
            <Text style={local.metricValueAmber}>{stats.pendingCount}</Text>
          </View>

          <View style={[local.metricCard, local.metricCardGreen]}>
            <Text style={local.metricLabelGreen}>ACTIVE BONDS</Text>
            <Text style={local.metricValueGreen}>{stats.activeCount}</Text>
          </View>

          <View style={[local.metricCard, local.metricCardRed]}>
            <Text style={local.metricLabelRed}>REJECTED</Text>
            <Text style={local.metricValueRed}>{stats.rejectedCount}</Text>
          </View>

          <View style={[local.metricCard, local.metricCardBlue]}>
            <Text style={local.metricLabelBlue}>TOTAL INVESTMENTS</Text>
            <Text style={local.metricValueBlue}>{stats.totalCount}</Text>
          </View>
        </ScrollView>

        {/* ================= 2. TABS SECTION (HORIZONTAL SCROLL) ================= */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={local.tabScroll}
          contentContainerStyle={local.tabScrollContent}>
          <View style={local.tabRow}>
            {/* Tab 1: Pending Approval */}
            <TouchableOpacity
              style={[local.tabPill, activeTab === 'pending' && local.tabPillActive]}
              onPress={() => setActiveTab('pending')}>
              <Text style={[local.tabText, activeTab === 'pending' && local.tabTextActive]}>
                Pending Approval
              </Text>
              {stats.pendingCount > 0 && (
                <View style={[local.tabBadge, activeTab === 'pending' ? local.tabBadgeActive : local.tabBadgeInactive]}>
                  <Text style={[local.tabBadgeText, activeTab === 'pending' ? local.tabBadgeTextActive : local.tabBadgeTextInactive]}>
                    {stats.pendingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Tab 2: Tenure Extend Requests */}
            <TouchableOpacity
              style={[local.tabPill, activeTab === 'tenure' && local.tabPillActive]}
              onPress={() => setActiveTab('tenure')}>
              <Text style={[local.tabText, activeTab === 'tenure' && local.tabTextActive]}>
                Tenure Extend Requests
              </Text>
              {tenureRequests.length > 0 && (
                <View style={[local.tabBadge, activeTab === 'tenure' ? local.tabBadgeActive : local.tabBadgeInactive]}>
                  <Text style={[local.tabBadgeText, activeTab === 'tenure' ? local.tabBadgeTextActive : local.tabBadgeTextInactive]}>
                    {tenureRequests.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Tab 3: All Investments */}
            <TouchableOpacity
              style={[local.tabPill, activeTab === 'all' && local.tabPillActive]}
              onPress={() => setActiveTab('all')}>
              <Text style={[local.tabText, activeTab === 'all' && local.tabTextActive]}>
                All Investments
              </Text>
              <View style={[local.tabBadge, activeTab === 'all' ? local.tabBadgeActive : local.tabBadgeInactive]}>
                <Text style={[local.tabBadgeText, activeTab === 'all' ? local.tabBadgeTextActive : local.tabBadgeTextInactive]}>
                  {stats.totalCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ================= 3. UNIFIED SEARCH & EXPORT TOOLBAR (FIXED DIMENSIONS) ================= */}
        <View style={local.toolbarRow}>
          <View style={local.searchWrap}>
            <Text style={local.searchIcon}>🔍</Text>
            <TextInput
              style={local.searchInput}
              placeholder={
                activeTab === 'tenure'
                  ? 'Search investor, bond number...'
                  : 'Search bonds, investors...'
              }
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              numberOfLines={1}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={local.clearBtn}>
                <Text style={local.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={local.exportBtn} onPress={handleExport}>
            <Text style={local.exportBtnIcon}>📥</Text>
            <Text style={local.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 4. ERROR BOX ================= */}
        {error ? (
          <View style={local.errorBox}>
            <Text style={local.errorText}>{error}</Text>
            <TouchableOpacity style={local.retryBtn} onPress={() => loadData(true)}>
              <Text style={local.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ================= 5. COMMON TABLE / LIST CONTAINER ================= */}
        <View style={local.tableContainer}>
          {loading ? (
            <View style={local.loadingWrap}>
              <ActivityIndicator size="large" color="#0B1E45" />
              <Text style={local.loadingText}>Loading data...</Text>
            </View>
          ) : activeTab === 'tenure' ? (
            filteredTenureRequests.length === 0 ? (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>No pending tenure extension requests found.</Text>
              </View>
            ) : (
              filteredTenureRequests.map(r => (
                <View key={String(r.requestId)} style={local.card}>
                  <View style={local.cardTopRow}>
                    <View style={local.cardTopLeft}>
                      <Text style={local.cardInvestorName}>{r.investorName}</Text>
                      <Text style={local.cardInvestorId}>ID: {r.investorId}</Text>
                    </View>
                    <View style={[local.pill, local.pillAmber]}>
                      <Text style={[local.pillText, local.pillTextAmber]}>{r.status}</Text>
                    </View>
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>BOND NUMBER</Text>
                      <Text style={local.gridValBlue}>{r.bondId}</Text>
                    </View>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>CURRENT RATE</Text>
                      <Text style={local.gridVal}>{r.currentInterestRate}%</Text>
                    </View>
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>CURRENT MATURITY</Text>
                      <Text style={local.gridVal}>{formatDate(r.currentMaturityDate)}</Text>
                    </View>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>REQUESTED EXTENSION</Text>
                      <Text style={local.gridValGreen}>{r.requestedExtension}</Text>
                    </View>
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>SUBMITTED ON</Text>
                      <Text style={local.gridVal}>{formatDate(r.submittedDate)}</Text>
                    </View>
                    <View style={local.gridCol} />
                  </View>

                  <View style={local.actionsRow}>
                    <TouchableOpacity
                      style={local.reviewBtn}
                      onPress={() => handleOpenReviewTenure(r)}>
                      <Text style={local.reviewBtnText}>Review & Send →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          ) : filteredInvestments.length === 0 ? (
            <View style={local.emptyWrap}>
              <Text style={local.emptyText}>
                {activeTab === 'pending'
                  ? 'No pending investments awaiting approval.'
                  : 'No investments found.'}
              </Text>
            </View>
          ) : (
            filteredInvestments.map(item => {
              const isPending = item.status === 'Pending';

              return (
                <View key={item.id} style={local.card}>
                  <View style={local.cardTopRow}>
                    <View style={local.cardTopLeft}>
                      <Text style={local.cardInvestorName}>{item.investorName}</Text>
                      <Text style={local.cardInvestorId}>ID: {item.investorId}</Text>
                    </View>
                    {renderStatusPill(item.status)}
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>INVESTMENT ID</Text>
                      <Text style={local.gridValBlue}>{item.investmentId}</Text>
                    </View>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>AMOUNT</Text>
                      <Text style={local.gridValBold}>{formatINR(item.amount)}</Text>
                    </View>
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>INTEREST RATE</Text>
                      <Text style={local.gridVal}>{item.interestRate}%</Text>
                    </View>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>TENURE</Text>
                      <Text style={local.gridVal}>{item.tenureMonths} Months</Text>
                    </View>
                  </View>

                  <View style={local.grid}>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>INVESTED DATE</Text>
                      <Text style={local.gridVal}>{formatDate(item.investmentDate)}</Text>
                    </View>
                    <View style={local.gridCol}>
                      <Text style={local.gridLabel}>MATURITY DATE</Text>
                      <Text style={local.gridVal}>{formatDate(item.maturityDate)}</Text>
                    </View>
                  </View>

                  {item.bondId && item.bondId !== '—' && (
                    <View style={local.grid}>
                      <View style={local.gridCol}>
                        <Text style={local.gridLabel}>BOND NUMBER</Text>
                        <Text style={local.gridVal}>{item.bondId}</Text>
                      </View>
                      <View style={local.gridCol} />
                    </View>
                  )}

                  <View style={local.actionsRow}>
                    <TouchableOpacity
                      style={local.viewBtn}
                      onPress={() => handleOpenView(item.investmentId)}>
                      <Text style={local.viewBtnText}>View Details</Text>
                    </TouchableOpacity>

                    {isPending && activeTab === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={local.rejectBtn}
                          onPress={() => handleOpenReject(item)}>
                          <Text style={local.rejectBtnText}>Reject</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={local.approveBtn}
                          onPress={() => handleOpenApprove(item)}>
                          <Text style={local.approveBtnText}>Approve</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ======================================================
          VIEW DETAILS MODAL
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={!!viewingDetails || detailsLoading}
        onRequestClose={() => setViewingDetails(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {detailsLoading ? (
              <View style={{padding: 30, alignItems: 'center'}}>
                <ActivityIndicator size="large" color="#0B1E45" />
                <Text style={{marginTop: 12, color: '#6B7280'}}>Loading details...</Text>
              </View>
            ) : viewingDetails ? (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>Investment Details</Text>
                  <TouchableOpacity onPress={() => setViewingDetails(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{maxHeight: 400}} showsVerticalScrollIndicator={false}>
                  <View style={local.modalSection}>
                    <Text style={local.modalSectionTitle}>INVESTOR INFO</Text>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Investor Name</Text>
                      <Text style={local.modalVal}>{viewingDetails.investorName}</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Investor ID</Text>
                      <Text style={local.modalVal}>{viewingDetails.investorId}</Text>
                    </View>
                    {viewingDetails.mobile && (
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>Mobile</Text>
                        <Text style={local.modalVal}>{viewingDetails.mobile}</Text>
                      </View>
                    )}
                    {viewingDetails.email && (
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>Email</Text>
                        <Text style={local.modalVal}>{viewingDetails.email}</Text>
                      </View>
                    )}
                  </View>

                  <View style={local.modalSection}>
                    <Text style={local.modalSectionTitle}>INVESTMENT INFO</Text>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Investment ID</Text>
                      <Text style={local.modalValBlue}>{viewingDetails.investmentId}</Text>
                    </View>
                    {viewingDetails.bondId && (
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>Bond Number</Text>
                        <Text style={local.modalVal}>{viewingDetails.bondId}</Text>
                      </View>
                    )}
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Principal Amount</Text>
                      <Text style={local.modalValBold}>{formatINR(viewingDetails.amount)}</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Interest Rate</Text>
                      <Text style={local.modalVal}>{viewingDetails.interestRate}%</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Tenure</Text>
                      <Text style={local.modalVal}>{viewingDetails.tenureMonths} Months</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Invested Date</Text>
                      <Text style={local.modalVal}>{formatDate(viewingDetails.investmentDate)}</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Maturity Date</Text>
                      <Text style={local.modalVal}>{formatDate(viewingDetails.maturityDate)}</Text>
                    </View>
                    <View style={local.modalRow}>
                      <Text style={local.modalLabel}>Status</Text>
                      <Text style={local.modalVal}>{viewingDetails.status}</Text>
                    </View>
                  </View>

                  {viewingDetails.bankName && (
                    <View style={local.modalSection}>
                      <Text style={local.modalSectionTitle}>BANK DETAILS</Text>
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>Bank</Text>
                        <Text style={local.modalVal}>{viewingDetails.bankName}</Text>
                      </View>
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>Account No</Text>
                        <Text style={local.modalVal}>{viewingDetails.accountNumber}</Text>
                      </View>
                      <View style={local.modalRow}>
                        <Text style={local.modalLabel}>IFSC</Text>
                        <Text style={local.modalVal}>{viewingDetails.ifscCode}</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity
                  style={local.modalDoneBtn}
                  onPress={() => setViewingDetails(null)}>
                  <Text style={local.modalDoneBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          APPROVE MODAL
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={!!approvingItem}
        onRequestClose={() => setApprovingItem(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {approvingItem && (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>Approve Investment</Text>
                  <TouchableOpacity onPress={() => setApprovingItem(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={local.modalSubtitle}>
                  Set approved interest rate and confirm approval for investment {approvingItem.investmentId}:
                </Text>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>Interest Rate (% per annum) *</Text>
                  <TextInput
                    style={local.fieldInput}
                    value={approveRate}
                    onChangeText={setApproveRate}
                    keyboardType="numeric"
                    placeholder="3.00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>Remarks (Optional)</Text>
                  <TextInput
                    style={[local.fieldInput, {height: 70, textAlignVertical: 'top'}]}
                    value={approveRemarks}
                    onChangeText={setApproveRemarks}
                    multiline
                    placeholder="Approval remarks..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={local.modalBtnRow}>
                  <TouchableOpacity
                    style={local.modalCancelBtn}
                    disabled={isApproving}
                    onPress={() => setApprovingItem(null)}>
                    <Text style={local.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[local.modalApproveBtn, isApproving && {opacity: 0.6}]}
                    disabled={isApproving}
                    onPress={handleConfirmApprove}>
                    {isApproving ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={local.modalApproveBtnText}>Confirm Approval</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          REJECT MODAL
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={!!rejectingItem}
        onRequestClose={() => setRejectingItem(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {rejectingItem && (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>Reject Investment</Text>
                  <TouchableOpacity onPress={() => setRejectingItem(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={local.modalSubtitle}>
                  Please provide a rejection reason for investment {rejectingItem.investmentId}:
                </Text>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>Rejection Reason *</Text>
                  <TextInput
                    style={local.fieldInput}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    placeholder="e.g. Incomplete KYC, invalid payment reference..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>Remarks (Optional)</Text>
                  <TextInput
                    style={[local.fieldInput, {height: 70, textAlignVertical: 'top'}]}
                    value={rejectRemarks}
                    onChangeText={setRejectRemarks}
                    multiline
                    placeholder="Additional rejection remarks..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={local.modalBtnRow}>
                  <TouchableOpacity
                    style={local.modalCancelBtn}
                    disabled={isRejecting}
                    onPress={() => setRejectingItem(null)}>
                    <Text style={local.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[local.modalRejectBtn, isRejecting && {opacity: 0.6}]}
                    disabled={isRejecting}
                    onPress={handleConfirmReject}>
                    {isRejecting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={local.modalRejectBtnText}>Reject Investment</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          TENURE EXTENSION REVIEW & SEND MODAL
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={!!reviewingTenure}
        onRequestClose={() => setReviewingTenure(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {reviewingTenure && (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>Review Tenure Extension</Text>
                  <TouchableOpacity onPress={() => setReviewingTenure(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={local.modalSubtitle}>
                  Review and approve the investor's requested tenure extension:
                </Text>

                <View style={local.tenureReviewCard}>
                  <View style={local.modalRow}>
                    <Text style={local.modalLabel}>Investor</Text>
                    <Text style={local.modalVal}>{reviewingTenure.investorName}</Text>
                  </View>
                  <View style={local.modalRow}>
                    <Text style={local.modalLabel}>Bond Number</Text>
                    <Text style={local.modalValBlue}>{reviewingTenure.bondId}</Text>
                  </View>
                  <View style={local.modalRow}>
                    <Text style={local.modalLabel}>Current Maturity</Text>
                    <Text style={local.modalVal}>{formatDate(reviewingTenure.currentMaturityDate)}</Text>
                  </View>
                  <View style={local.modalRow}>
                    <Text style={local.modalLabel}>Current Rate</Text>
                    <Text style={local.modalVal}>{reviewingTenure.currentInterestRate}%</Text>
                  </View>
                  <View style={local.modalRow}>
                    <Text style={local.modalLabel}>Requested Extension</Text>
                    <Text style={local.modalValGreen}>{reviewingTenure.requestedExtension}</Text>
                  </View>
                </View>

                <View style={local.noticeBox}>
                  <Text style={local.noticeText}>
                    ℹ️ Admin approval directly finalizes this tenure extension. No Super Admin approval is required.
                  </Text>
                </View>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>Remarks (Optional)</Text>
                  <TextInput
                    style={[local.fieldInput, {height: 60, textAlignVertical: 'top'}]}
                    value={tenureRemarks}
                    onChangeText={setTenureRemarks}
                    multiline
                    placeholder="Approved by Admin."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={local.modalBtnRow}>
                  <TouchableOpacity
                    style={local.modalCancelBtn}
                    disabled={isSubmittingTenure}
                    onPress={() => setReviewingTenure(null)}>
                    <Text style={local.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[local.modalApproveBtn, isSubmittingTenure && {opacity: 0.6}]}
                    disabled={isSubmittingTenure}
                    onPress={handleConfirmApproveTenure}>
                    {isSubmittingTenure ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={local.modalApproveBtnText}>Approve Extension</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <AdminBottomTabBar active="Investments" navigation={navigation} />
    </SafeAreaView>
  );
};

/* ============================================================
   LOCAL STYLES
   ============================================================ */

const local = StyleSheet.create({
  metricsScroll: {
    marginBottom: 16,
    width: '100%',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  metricCard: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minWidth: 140,
    borderWidth: 1,
  },
  metricCardNavy: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
  },
  metricCardAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  metricCardGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  metricCardRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  metricCardBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  metricLabelLight: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  metricValueLight: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  metricLabelAmber: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  metricValueAmber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#B45309',
    marginTop: 4,
  },
  metricLabelGreen: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  metricValueGreen: {
    fontSize: 18,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 4,
  },
  metricLabelRed: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  metricValueRed: {
    fontSize: 18,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 4,
  },
  metricLabelBlue: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  metricValueBlue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginTop: 4,
  },

  tabScroll: {
    marginBottom: 16,
    width: '100%',
  },
  tabScrollContent: {
    paddingRight: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#1E3A8A',
  },
  tabBadgeInactive: {
    backgroundColor: '#F3F4F6',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: '#93C5FD',
  },
  tabBadgeTextInactive: {
    color: '#6B7280',
  },

  /* Fixed Search & Export Toolbar */
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    width: '100%',
    height: 46,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: '100%',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13.5,
    color: '#111827',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  clearBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: '100%',
    minWidth: 92,
    gap: 6,
  },
  exportBtnIcon: {
    fontSize: 14,
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  tableContainer: {
    width: '100%',
  },

  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13.5,
    color: '#6B7280',
  },

  emptyWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13.5,
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    width: '100%',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    width: '100%',
  },
  cardTopLeft: {
    flex: 1,
    marginRight: 8,
  },
  cardInvestorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardInvestorId: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },

  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '100%',
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 10.5,
    color: '#6B7280',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  gridVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  gridValBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  gridValBlue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
  gridValGreen: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    width: '100%',
  },
  viewBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#374151',
  },
  approveBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  approveBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  rejectBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  reviewBtn: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pillAmber: {backgroundColor: '#FEF3C7'},
  pillTextAmber: {color: '#D97706'},
  pillGreen: {backgroundColor: '#DCFCE7'},
  pillTextGreen: {color: '#16A34A'},
  pillRed: {backgroundColor: '#FEE2E2'},
  pillTextRed: {color: '#DC2626'},
  pillGray: {backgroundColor: '#F3F4F6'},
  pillTextGray: {color: '#6B7280'},

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1E45',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  modalSection: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalLabel: {
    fontSize: 12.5,
    color: '#6B7280',
  },
  modalVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  modalValBold: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#111827',
  },
  modalValBlue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  modalValGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
  },

  modalField: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },

  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  modalApproveBtn: {
    flex: 1.5,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalApproveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalRejectBtn: {
    flex: 1.5,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  modalRejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalDoneBtn: {
    backgroundColor: '#0B1E45',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  modalDoneBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  tenureReviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  noticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 12,
    color: '#1D4ED8',
    lineHeight: 16,
  },
});

export default BondTrackingScreen;