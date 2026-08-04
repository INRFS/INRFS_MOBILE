import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {useAppData, Bond, InvestmentRequest} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/BondTrackingScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

type TopTab = 'Pending Approval' | 'All Investments';
type RowStatus = 'Active' | 'Upcoming' | 'Settled' | 'Pending';
type FilterKey = 'All Bonds' | 'Active' | 'Upcoming' | 'Settled' | 'Pending';
const filters: FilterKey[] = ['All Bonds', 'Active', 'Upcoming', 'Settled', 'Pending'];
const RATE_QUICK_SELECT = [2, 2.5, 3, 3.5, 4];

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const statusStyle = (status: RowStatus) => {
  if (status === 'Active') return {bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A'};
  if (status === 'Upcoming') return {bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB'};
  if (status === 'Pending') return {bg: '#FEF3C7', text: '#D97706', dot: '#D97706'};
  return {bg: '#E5E7EB', text: '#6B7280', dot: '#6B7280'};
};

// ---- Unified row type so "All Investments" can show both generated bonds
// AND still-pending investment requests (matching the reference design,
// where a pending request shows up here too with an "Awaiting Approval"
// status instead of a bond number). ----
type UnifiedRow = {
  key: string;
  seriesId: string;
  investorName: string;
  amount: number;
  interestRate: number;
  investedDate: string;
  maturityDate: string;
  subscriptionPercent: number;
  status: RowStatus;
  bond?: Bond;
  request?: InvestmentRequest;
};

const BondTrackingScreen = ({navigation}: any) => {
  const {
    bonds,
    investors,
    investmentRequests,
    updateInvestmentRequestRate,
    approveInvestmentRequest,
    rejectInvestmentRequest,
  } = useAppData();

  const [topTab, setTopTab] = useState<TopTab>('Pending Approval');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All Bonds');

  // ---------- Review & Approve modal state ----------
  const [reviewReq, setReviewReq] = useState<InvestmentRequest | null>(null);
  const [rateDraft, setRateDraft] = useState<string>('');

  const pendingRequests = investmentRequests.filter(r => r.status === 'Pending');

  // ---------- Unified rows for "All Investments" ----------
  const unifiedRows: UnifiedRow[] = [
    ...bonds.map(b => ({
      key: b.seriesId,
      seriesId: b.seriesId,
      investorName: b.investorName,
      amount: b.amount,
      interestRate: b.interestRate,
      investedDate: b.investedDate,
      maturityDate: b.maturityDate,
      subscriptionPercent: b.subscriptionPercent,
      status: b.status as RowStatus,
      bond: b,
    })),
    ...pendingRequests.map(r => ({
      key: r.id,
      seriesId: 'Pending…',
      investorName: r.investorName,
      amount: r.amount,
      interestRate: r.interestRate,
      investedDate: r.requestedOn,
      maturityDate: '—',
      subscriptionPercent: 0,
      status: 'Pending' as RowStatus,
      request: r,
    })),
  ];

  const filteredRows = unifiedRows.filter(
    row => activeFilter === 'All Bonds' || row.status === activeFilter,
  );

  // ---------- View Bond routing (unchanged) ----------
  const handleViewBond = (bond: Bond) => {
    const investor = investors.find(inv => inv.name === bond.investorName);
    navigation.navigate('BondDetails', {
      investorId: investor?.id,
      bondId: bond.seriesId,
    });
  };

  // ---------- Pending approval actions ----------
  const openReview = (req: InvestmentRequest) => {
    setReviewReq(req);
    setRateDraft(String(req.interestRate));
  };

  const closeReview = () => {
    setReviewReq(null);
    setRateDraft('');
  };

  const commitRateIfValid = (req: InvestmentRequest, text: string) => {
    const parsed = parseFloat(text);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      updateInvestmentRequestRate(req.id, parsed);
    }
  };

  const handleConfirmApprove = () => {
    if (!reviewReq) return;
    commitRateIfValid(reviewReq, rateDraft);
    const rateForMessage = !Number.isNaN(parseFloat(rateDraft)) ? rateDraft : String(reviewReq.interestRate);
    Alert.alert(
      'Approve investment',
      `Approve ${formatINR(reviewReq.amount)} from ${reviewReq.investorName} at ${rateForMessage}% p.a.? This will generate the bond immediately.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: () => {
            approveInvestmentRequest(reviewReq.id);
            closeReview();
          },
        },
      ],
    );
  };

  const handleReject = (req: InvestmentRequest) => {
    Alert.alert('Reject investment', `Reject the request from ${req.investorName}?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Reject', style: 'destructive', onPress: () => rejectInvestmentRequest(req.id)},
    ]);
  };

  const monthlyPreview = (amount: number, rateText: string) => {
    const rate = parseFloat(rateText);
    if (Number.isNaN(rate) || rate < 0) return 0;
    return Math.round((amount * (rate / 100)) / 12);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bond Tracking</Text>
        <Text style={styles.subtitle}>Manage and monitor institutional digital bond series.</Text>

        {/* ---------- Top-level tabs: Pending Approval / All Investments ---------- */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentPill, topTab === 'Pending Approval' && styles.segmentPillActive]}
            onPress={() => setTopTab('Pending Approval')}>
            <Text style={[styles.segmentText, topTab === 'Pending Approval' && styles.segmentTextActive]}>
              Pending Approval
            </Text>
            {pendingRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentPill, topTab === 'All Investments' && styles.segmentPillActive]}
            onPress={() => setTopTab('All Investments')}>
            <Text style={[styles.segmentText, topTab === 'All Investments' && styles.segmentTextActive]}>
              All Investments
            </Text>
          </TouchableOpacity>
        </View>

        {/* ---------- PENDING APPROVAL TAB ---------- */}
        {topTab === 'Pending Approval' && (
          <>
            {pendingRequests.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No pending investment requests.</Text>
              </View>
            )}

            {pendingRequests.map(req => (
              <View key={req.id} style={styles.pendingCard}>
                <View style={styles.pendingTopRow}>
                  <View>
                    <Text style={styles.pendingInvestorName}>{req.investorName}</Text>
                    <Text style={styles.pendingReqId}>{req.investorId} • {req.requestedOn}</Text>
                  </View>
                </View>

                <View style={styles.pendingMetaGrid}>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>AMOUNT</Text>
                    <Text style={styles.pendingMetaValue}>{formatINR(req.amount)}</Text>
                  </View>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>TENURE</Text>
                    <Text style={styles.pendingMetaValue}>{req.tenureMonths} months</Text>
                  </View>
                </View>

                <View style={styles.pendingMetaGrid}>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>INITIAL RATE</Text>
                    <Text style={styles.pendingMetaValue}>{req.interestRate}% p.a.</Text>
                  </View>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>TXN REF</Text>
                    <Text style={styles.pendingMetaValue}>{req.transactionRef || '—'}</Text>
                  </View>
                </View>

                <View style={styles.pendingActionsRow}>
                  <TouchableOpacity style={styles.pendingRejectBtn} onPress={() => handleReject(req)}>
                    <Text style={styles.pendingRejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.pendingReviewBtn} onPress={() => openReview(req)}>
                    <Text style={styles.pendingReviewText}>Review & Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ---------- ALL INVESTMENTS TAB ----------
            Now shows both generated bonds AND still-pending requests, so a
            request submitted by an investor is visible here immediately
            with a "Pending" status badge and an "Awaiting Approval" action,
            matching the reference design. ---------- */}
        {topTab === 'All Investments' && (
          <>
            <View style={styles.filterRow}>
              {filters.map(f => {
                const active = f === activeFilter;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterPill, active && styles.filterPillActive]}
                    onPress={() => setActiveFilter(f)}>
                    <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{f}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredRows.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No investments to show.</Text>
              </View>
            )}

            {filteredRows.map(row => {
              const s = statusStyle(row.status);
              return (
                <View key={row.key} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.seriesLabel}>SERIES ID</Text>
                      <Text style={styles.seriesId}>{row.seriesId}</Text>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: s.bg}]}>
                      <View style={[styles.statusDot, {backgroundColor: s.dot}]} />
                      <Text style={[styles.statusText, {color: s.text}]}>{row.status}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Investor</Text>
                      <Text style={styles.detailValueDark}>{row.investorName}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValueDark}>{formatINR(row.amount)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Interest Rate</Text>
                      <Text style={styles.detailValue}>{row.interestRate}% p.a.</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>
                        {row.status === 'Pending' ? 'Submitted' : 'Invested'}
                      </Text>
                      <Text style={styles.detailValueDark}>{row.investedDate}</Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Maturity Date</Text>
                      <Text style={styles.detailValueDark}>{row.maturityDate}</Text>
                    </View>
                  </View>

                  {row.status !== 'Pending' && (
                    <>
                      <View style={styles.progressHeaderRow}>
                        <Text style={styles.progressLabel}>Subscription %</Text>
                        <Text style={styles.progressValue}>{row.subscriptionPercent}%</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${row.subscriptionPercent}%`,
                              backgroundColor: row.status === 'Settled' ? '#9CA3AF' : '#0B1E45',
                            },
                          ]}
                        />
                      </View>
                    </>
                  )}

                  <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12}}>
                    {row.status === 'Pending' && row.request ? (
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#FEF3C7',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                        onPress={() => openReview(row.request!)}>
                        <Text style={{color: '#D97706', fontSize: 13, fontWeight: '600'}}>
                          Awaiting Approval
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          backgroundColor: '#0B1E45',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 8,
                        }}
                        onPress={() => handleViewBond(row.bond!)}>
                        <Text style={{color: '#FFFFFF', fontSize: 13, fontWeight: '600'}}>View Bond</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>📁</Text>
          <Text style={styles.tabLabelActive}>Investments</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InterestPayouts')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Payouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminProfile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* ---------- Review & Approve modal ---------- */}
      <Modal visible={!!reviewReq} transparent animationType="fade" onRequestClose={closeReview}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {reviewReq && (
              <>
                <Text style={styles.modalTitle}>Review Investment</Text>
                <Text style={styles.modalAmountText}>
                  {reviewReq.investorName} • {formatINR(reviewReq.amount)} • {reviewReq.tenureMonths} months
                </Text>

                <Text style={styles.modalLabel}>Interest Rate (% p.a.)</Text>
                <View style={styles.rateChipsRow}>
                  {RATE_QUICK_SELECT.map(r => {
                    const active = parseFloat(rateDraft) === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[styles.rateChip, active && styles.rateChipActive]}
                        onPress={() => setRateDraft(String(r))}>
                        <Text style={[styles.rateChipText, active && styles.rateChipTextActive]}>{r}%</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TextInput
                  style={styles.rateInput}
                  keyboardType="decimal-pad"
                  value={rateDraft}
                  onChangeText={setRateDraft}
                />

                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>Estimated monthly interest</Text>
                  <Text style={styles.previewValue}>
                    {formatINR(monthlyPreview(reviewReq.amount, rateDraft))}
                  </Text>
                </View>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={closeReview}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalApproveBtn} onPress={handleConfirmApprove}>
                    <Text style={styles.modalApproveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BondTrackingScreen;