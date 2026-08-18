import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  useAppData,
  Bond,
  InvestmentRequest,
  TenureExtensionRequest,
} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/BondTrackingScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from './AdminBottomTabBar';

type TopTab = 'Pending Approval' | 'All Investments';
// 'Pending Extension' / 'Pending Settlement' so a bond's status badge in
// "All Investments" can reflect either an investor-submitted request OR a
// naturally-crossed maturity date that's awaiting admin action, instead of
// still showing 'Active'.
type RowStatus =
  | 'Active'
  | 'Upcoming'
  | 'Settled'
  | 'Pending'
  | 'Pending Extension'
  | 'Pending Settlement';
type FilterKey = 'All Bonds' | 'Active' | 'Upcoming' | 'Settled' | 'Pending';
const filters: FilterKey[] = ['All Bonds', 'Active', 'Upcoming', 'Settled', 'Pending'];
const RATE_QUICK_SELECT = [2, 2.5, 3, 3.5, 4];

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Maturity date handling — mirrors AppNavigator's storage format exactly
// (dd-mm-yyyy, via formatDDMMYYYY/parseDDMMYYYY there), so "has this bond
// matured?" means the same thing here as it does on the Settlement screen.
// ---------------------------------------------------------------------------
const parseAppDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null;
  const [d, m, y] = parts;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const isMaturityCrossed = (maturityDate?: string): boolean => {
  const dt = parseAppDate(maturityDate);
  if (!dt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime() <= today.getTime();
};

const statusStyle = (status: RowStatus) => {
  if (status === 'Active') return {bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A'};
  if (status === 'Upcoming') return {bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB'};
  // Pending Extension / Pending Settlement share the same amber styling as
  // a plain Pending (new-investment) request.
  if (
    status === 'Pending' ||
    status === 'Pending Extension' ||
    status === 'Pending Settlement'
  )
    return {bg: '#FEF3C7', text: '#D97706', dot: '#D97706'};
  return {bg: '#E5E7EB', text: '#6B7280', dot: '#6B7280'};
};

type UnifiedRow = {
  key: string;
  bondNumber: string;
  investorName: string;
  investorId: string;
  branch: string;
  amount: number;
  interestRate: number;
  investedDate: string;
  maturityDate: string;
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
    // Investor-submitted tenure extension / pre-close requests, and the
    // admin actions that resolve them.
    tenureExtensionRequests,
    approveTenureExtension,
    rejectTenureExtension,
    preSettlementRequests,
  } = useAppData();

  const [topTab, setTopTab] = useState<TopTab>('Pending Approval');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All Bonds');

  const [reviewReq, setReviewReq] = useState<InvestmentRequest | null>(null);
  const [rateDraft, setRateDraft] = useState<string>('');

  const [detailsRow, setDetailsRow] = useState<UnifiedRow | null>(null);

  // Tenure modal
  const [tenureRow, setTenureRow] = useState<UnifiedRow | null>(null);
  const [extendMonths, setExtendMonths] = useState('3');
  const [newRate, setNewRate] = useState('');
  const [remarks, setRemarks] = useState('');
  // The investor's original request behind this tenure modal, if any. When
  // set, "Review & Approve" also marks that request Approved.
  const [linkedTenureRequest, setLinkedTenureRequest] = useState<TenureExtensionRequest | null>(null);

  const pendingRequests = investmentRequests.filter(r => r.status === 'Pending');
  // Investor-submitted tenure extension / pre-close requests still awaiting
  // admin action.
  const pendingTenureRequests = tenureExtensionRequests.filter(r => r.status === 'Pending');
  // Still used for the "All Investments" tab badge count below — pre-close
  // requests no longer get their own action cards on this screen (see
  // SettlementCalculatorScreen for that), but the badge on "All
  // Investments" still reflects them.
  const pendingSettlementRequests = preSettlementRequests.filter(r => r.status === 'Pending');

// Normalizes so minor casing/whitespace differences don't break a match.
const norm = (s?: string) => (s || '').trim().toLowerCase();

// Checks BOTH id and name against the registry when both are available,
// instead of only ever getting one value to match against.
const getInvestor = (id?: string, name?: string) => {
  return investors.find(
    i => (id && i.id === id) || (name && norm(i.name) === norm(name)),
  );
};

const getInvestorName = (idOrName: string, fallback?: string) => {
  const inv = getInvestor(idOrName, fallback);
  if (inv?.name) return inv.name;
  if (fallback && !fallback.startsWith('INV-') && !fallback.startsWith('DB-') && !fallback.startsWith('BND-')) {
    return fallback;
  }
  return inv?.name || fallback || '—';
};

// FIX: now accepts an optional `explicitBranch` — the branch carried on the
// InvestmentRequest itself (submitted from Invest Now). If the live
// investor-registry lookup finds a match, that's still preferred (it's the
// source of truth and reflects any later profile edits). Only when the
// registry lookup comes up empty does this fall back to the branch that
// was captured on the request at submission time, instead of just
// returning '—'.
const getInvestorBranch = (investorId: string, fallbackName?: string, explicitBranch?: string) => {
  const inv = getInvestor(investorId, fallbackName);
  if (inv?.branch && inv.branch !== '—') return inv.branch;
  if (explicitBranch && explicitBranch !== '—') return explicitBranch;
  return '—';
};

  const unifiedRows: UnifiedRow[] = [
    ...bonds.map(b => {
      const inv =
        investors.find(i => i.id === b.investorId) ||
        investors.find(i => i.name === b.investorName);

      // Reflect a pending investor-submitted request — or a naturally
      // crossed maturity date — in the status badge itself (not just the
      // amber banner further down), so "All Investments" matches what the
      // investor sees on "My Investments" and what the admin sees on the
      // Settlement screen's "Tenure Timeout" tab. This flips back
      // automatically: for a request, once the admin approves/rejects it
      // leaves the Pending list and this check stops matching; for a
      // matured bond, once the admin approves settlement (or a pre-close
      // request is approved) the bond's own status becomes 'Settled' and
      // this check stops matching too — no extra state to manage either
      // way.
     const hasPendingTenureReq = tenureExtensionRequests.some(
        r =>
          r.bondSeriesId === b.seriesId &&
          (r.status === 'Pending' || r.status === 'PendingSuperAdmin'),
      );
      const hasPendingSettlementReq = preSettlementRequests.some(
        r =>
          r.bondSeriesId === b.seriesId &&
          (r.status === 'Pending' || r.status === 'PendingSuperAdmin'),
      );
      const maturityCrossed = b.status === 'Active' && isMaturityCrossed(b.maturityDate);
      let displayStatus: RowStatus = b.status as RowStatus;
      if (hasPendingTenureReq) displayStatus = 'Pending Extension';
      else if (hasPendingSettlementReq || maturityCrossed) displayStatus = 'Pending Settlement';

      return {
        key: b.seriesId,
        bondNumber: b.seriesId,
        investorName: inv?.name || b.investorName,
        investorId: b.investorId || inv?.id || '—',
        // FIX: branch was never being read into the "All Investments" card
        // at all before — it only showed up on the Pending Approval card.
        branch: inv?.branch && inv.branch !== '—' ? inv.branch : '—',
        amount: b.amount,
        interestRate: b.interestRate,
        investedDate: b.investedDate,
        maturityDate: b.maturityDate,
        status: displayStatus,
        bond: b,
      };
    }),
    ...pendingRequests.map(r => ({
      key: r.id,
      bondNumber: '—',
      investorName: getInvestorName(r.investorId, r.investorName),
      investorId: 'Pending',
     branch: getInvestorBranch(r.investorId, r.investorName, r.branch),
      amount: r.amount,
      interestRate: r.interestRate,
      investedDate: r.requestedOn,
      maturityDate: '—',
      status: 'Pending' as RowStatus,
      request: r,
    })),
  ];

  // "Investor ID" reference shown on the cards (INR-XXX), matching the web
  // Investment Management table. This is a DISPLAY-ONLY reference for the
  // investment record itself, distinct from the investor's real KYC/
  // registry ID (that's the "Investment ID" field below). It's derived
  // from each row's position in the combined bonds+pending list (same
  // order the web table uses), so it isn't persisted anywhere.
  const investorRefId = (key: string) => {
    const idx = unifiedRows.findIndex(r => r.key === key);
    return idx === -1 ? '—' : `INR-${String(idx + 1).padStart(3, '0')}`;
  };

  const filteredRows = unifiedRows.filter(
    row => activeFilter === 'All Bonds' || row.status === activeFilter,
  );

  const openReview = (req: InvestmentRequest) => {
    setReviewReq(req);
    setRateDraft(String(req.interestRate));
  };

  const closeReview = () => {
    setReviewReq(null);
    setRateDraft('');
  };

  const handleConfirmApprove = () => {
    if (!reviewReq) return;

    const parsed = parseFloat(rateDraft);
    const finalRate = !Number.isNaN(parsed) && parsed >= 0 ? parsed : reviewReq.interestRate;

    Alert.alert(
      'Approve investment',
      `Approve ${formatINR(reviewReq.amount)} from ${getInvestorName(
        reviewReq.investorId,
        reviewReq.investorName,
      )} at ${finalRate}% p.a.? This will generate the bond immediately.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: () => {
            // Passing the rate straight into approveInvestmentRequest
            // applies it in one atomic step, avoiding a stale-read race
            // between two separate state updates.
            approveInvestmentRequest(reviewReq.id, finalRate);
            closeReview();
          },
        },
      ],
    );
  };

  const handleReject = (req: InvestmentRequest) => {
    Alert.alert(
      'Reject investment',
      `Reject the request from ${getInvestorName(req.investorId, req.investorName)}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            rejectInvestmentRequest(req.id);
            if (reviewReq?.id === req.id) closeReview();
          },
        },
      ],
    );
  };

  const monthlyPreview = (amount: number, rateText: string) => {
    const rate = parseFloat(rateText);
    if (Number.isNaN(rate) || rate < 0) return 0;
    return Math.round((amount * (rate / 100)) / 12);
  };

  const currentRateForNotice = !Number.isNaN(parseFloat(rateDraft))
    ? rateDraft
    : reviewReq
    ? String(reviewReq.interestRate)
    : '';

  const openDetails = (row: UnifiedRow) => setDetailsRow(row);
  const closeDetails = () => setDetailsRow(null);

  // Detects whether this bond has a pending investor-submitted tenure
  // extension request and, if so, prefills the modal from it (months +
  // rate) and remembers the request id so approval can mark it Approved
  // and notify the investor's screen (via tenureExtensionRequests status
  // flipping, which useInvestments() already reacts to).
  const openTenure = (row: UnifiedRow) => {
    const linked = tenureExtensionRequests.find(
      r => r.bondSeriesId === row.bondNumber && r.status === 'Pending',
    );
    setTenureRow(row);
    setLinkedTenureRequest(linked || null);
    setExtendMonths(linked ? String(linked.extensionMonths) : '3');
    setNewRate(String(row.interestRate));
    setRemarks('');
  };

  // Jump straight into the Tenure modal for a given bond series id, used
  // by the "Review in Investments" shortcut on the Pending Approval info
  // card.
  const openTenureForBondSeries = (bondSeriesId: string) => {
    const row = unifiedRows.find(r => r.bondNumber === bondSeriesId);
    if (!row) return;
    setTopTab('All Investments');
    openTenure(row);
  };

  const calcNewMaturity = () => {
    if (!tenureRow) return '—';
    try {
      const parts = tenureRow.maturityDate.split(/[-/.\s]+/);
      let d = 1, m = 1, y = new Date().getFullYear();
      if (parts.length >= 3) {
        // try dd-mm-yyyy or yyyy-mm-dd
        if (parts[0].length === 4) {
          y = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          d = parseInt(parts[2], 10);
        } else {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = parseInt(parts[2], 10);
        }
      }
      const dt = new Date(y, (m || 1) - 1, d || 1);
      dt.setMonth(dt.getMonth() + (parseInt(extendMonths, 10) || 0));
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      return `${dd}-${mm}-${dt.getFullYear()}`;
    } catch {
      return '—';
    }
  };

  // Applies the extension to the bond via context, and — when this modal
  // was opened from an investor request — marks that request Approved so
  // the investor's MyInvestments screen flips the bond back from "Pending
  // Extension" to "Active" automatically.
  const handleApproveTenure = () => {
    if (!tenureRow) return;
    const months = parseInt(extendMonths, 10) || 0;
    const rate = parseFloat(newRate);

    approveTenureExtension(
      tenureRow.bondNumber,
      months,
      !Number.isNaN(rate) ? rate : undefined,
      linkedTenureRequest?.id,
    );
Alert.alert(
      'Sent to Super Admin',
      `${tenureRow.bondNumber}'s ${months}-month extension has been sent to the Super Admin for final approval. New maturity will be ${calcNewMaturity()} once approved.`,
    );
    setTenureRow(null);
    setLinkedTenureRequest(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Investment Management</Text>
        <Text style={styles.subtitle}>
          Manage and monitor institutional digital bond series.
        </Text>

        {/* Top tabs */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[
              styles.segmentPill,
              topTab === 'Pending Approval' && styles.segmentPillActive,
            ]}
            onPress={() => setTopTab('Pending Approval')}>
            <Text
              style={[
                styles.segmentText,
                topTab === 'Pending Approval' && styles.segmentTextActive,
              ]}>
              Pending Approval
            </Text>
            {(pendingRequests.length + pendingTenureRequests.length) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingRequests.length + pendingTenureRequests.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentPill,
              topTab === 'All Investments' && styles.segmentPillActive,
            ]}
            onPress={() => setTopTab('All Investments')}>
            <Text
              style={[
                styles.segmentText,
                topTab === 'All Investments' && styles.segmentTextActive,
              ]}>
              All Investments
            </Text>
             {(pendingTenureRequests.length + pendingSettlementRequests.length) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingTenureRequests.length + pendingSettlementRequests.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===================== PENDING APPROVAL ===================== */}
        {topTab === 'Pending Approval' && (
          <>
            {pendingRequests.length === 0 &&
              pendingTenureRequests.length === 0 && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No pending investment requests.</Text>
                </View>
              )}

            {pendingRequests.map(req => (
              <View key={req.id} style={styles.pendingCard}>
                <View style={styles.pendingTopRow}>
                  <View>
                    <Text style={styles.pendingInvestorName}>
                      {getInvestorName(req.investorId, req.investorName)}
                    </Text>
                    {/* Shows the INR-XXX reference, matching the web's
                        Investor ID column. */}
                    <Text style={styles.pendingReqId}>Investor ID: {investorRefId(req.id)}</Text>
                    {/* Investment ID — stays "Pending" until the admin
                        approves, matching the web reference. */}
                    <Text style={styles.pendingReqId}>Investment ID: Pending</Text>
                  </View>
                </View>

                <View style={{marginBottom: 12}}>
                  <Text style={styles.pendingMetaLabel}>SUBMITTED ON</Text>
                  <Text style={styles.pendingMetaValue}>{req.requestedOn}</Text>
                </View>

                <View style={styles.pendingMetaGrid}>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>AMOUNT</Text>
                    <Text style={styles.pendingMetaValue}>
                      {formatINR(req.amount)}
                    </Text>
                  </View>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>BRANCH</Text>
                   <Text style={styles.pendingMetaValue}>
  {getInvestorBranch(req.investorId, req.investorName, req.branch)}
</Text>
                  </View>
                </View>

                <View style={styles.pendingMetaGrid}>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>TENURE</Text>
                    <Text style={styles.pendingMetaValue}>
                      {req.tenureMonths} months
                    </Text>
                  </View>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>INITIAL RATE</Text>
                    <Text style={styles.pendingMetaValue}>
                      {req.interestRate}% p.a.
                    </Text>
                  </View>
                </View>

                <View style={styles.pendingMetaGrid}>
                  <View style={styles.pendingMetaCol}>
                    <Text style={styles.pendingMetaLabel}>TXN REF</Text>
                    <Text style={styles.pendingMetaValue}>
                      {req.transactionRef || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.pendingActionsRow}>
                  <TouchableOpacity
                    style={styles.pendingRejectBtn}
                    onPress={() => handleReject(req)}>
                    <Text style={styles.pendingRejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pendingReviewBtn}
                    onPress={() => openReview(req)}>
                    <Text style={styles.pendingReviewText}>Review & Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Tenure Extension requests: informational only. No
                approve/reject buttons here on purpose — the admin may want
                to adjust months/rate, so the actual approval happens in the
                existing Tenure modal (opened from "All Investments"), which
                auto-detects and prefills from this request. */}
            {pendingTenureRequests.map(r => (
              <View key={r.id} style={local.infoCard}>
                <View style={local.infoCardTopRow}>
                  <Text style={local.infoCardTitle}>{r.investorName}</Text>
                  <View style={local.infoBadge}>
                    <Text style={local.infoBadgeText}>TENURE EXTENSION</Text>
                  </View>
                </View>
                <Text style={local.infoCardBondId}>{r.bondSeriesId}</Text>
                <Text style={local.infoCardText}>
                  Waiting for your approval — requested +{r.extensionMonths} months (current tenure{' '}
                  {r.currentTenureMonths}M) on {r.requestedOn}.
                </Text>
                <TouchableOpacity
                  style={local.infoCardBtn}
                  onPress={() => openTenureForBondSeries(r.bondSeriesId)}>
                  <Text style={local.infoCardBtnText}>Review in All Investments →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ===================== ALL INVESTMENTS ===================== */}
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
                    <Text
                      style={[
                        styles.filterPillText,
                        active && styles.filterPillTextActive,
                      ]}>
                      {f}
                    </Text>
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
              // Flags rows that have a pending investor request, or that
              // have simply matured, so the admin can spot them at a
              // glance in "All Investments" too.
             const hasPendingTenureReq = tenureExtensionRequests.some(
                r =>
                  r.bondSeriesId === row.bondNumber &&
                  (r.status === 'Pending' || r.status === 'PendingSuperAdmin'),
              );
              // Whether the admin can still act on this — false once
              // it's been forwarded to Super Admin.
              const hasActionableTenureReq = tenureExtensionRequests.some(
                r => r.bondSeriesId === row.bondNumber && r.status === 'Pending',
              );
              const hasPendingSettlementReq = preSettlementRequests.some(
                r =>
                  r.bondSeriesId === row.bondNumber &&
                  (r.status === 'Pending' || r.status === 'PendingSuperAdmin'),
              );
              const maturityCrossed =
                row.bond?.status === 'Active' && isMaturityCrossed(row.bond?.maturityDate);
              // Matured (Settled) bonds only get View + Bond — no Tenure
              // action, since there's nothing left to extend/close on a
              // bond that has already been settled.
              const isMatured = row.bond?.status === 'Settled';
              return (
                <View key={row.key} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <View>
                      <Text style={styles.seriesLabel}>BOND NUMBER</Text>
                      <Text style={styles.seriesId}>{row.bondNumber}</Text>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: s.bg}]}>
                      <View style={[styles.statusDot, {backgroundColor: s.dot}]} />
                      <Text style={[styles.statusText, {color: s.text}]}>
                        {row.status}
                      </Text>
                    </View>
                  </View>

                  {(hasPendingTenureReq || hasPendingSettlementReq || maturityCrossed) && (
                    <View style={local.rowFlag}>
                      <Text style={local.rowFlagText}>
                       {hasPendingTenureReq
                          ? hasActionableTenureReq
                            ? 'Investor requested a tenure extension — awaiting your review'
                            : 'Tenure extension approved — awaiting Super Admin settlement'
                          : hasPendingSettlementReq
                          ? preSettlementRequests.find(
                              r => r.bondSeriesId === row.bondNumber && r.status === 'PendingSuperAdmin',
                            )
                            ? 'Pre-close approved — awaiting Super Admin settlement'
                            : 'Investor requested pre-close — awaiting your review'
                          : 'Bond has matured — awaiting settlement approval'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Investor</Text>
                      <Text style={styles.detailValueDark}>{row.investorName}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Investor ID</Text>
                      {/* Shows the INR-XXX reference (matching the web's
                          Investor ID column) instead of the raw investor
                          registry ID / literal "Pending". */}
                      <Text style={styles.detailValueDark}>{investorRefId(row.key)}</Text>
                    </View>
                  </View>

                  {/* Investment ID — the investor's real registry ID once
                      approved, "-" while still pending. Matches the web's
                      Investment ID column. */}
                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Investment ID</Text>
                      <Text style={styles.detailValueDark}>
                        {row.status === 'Pending' ? '-' : row.investorId}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Branch</Text>
                      <Text style={styles.detailValueDark}>{row.branch}</Text>
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Amount</Text>
                      <Text style={styles.detailValueDark}>
                        {formatINR(row.amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailsRow}>
                    <View>
                      <Text style={styles.detailLabel}>Interest Rate</Text>
                      <Text style={styles.detailValue}>
                        {row.interestRate}% p.a.
                      </Text>
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

                  <View style={local.actionsRow}>
                    {row.status === 'Pending' && row.request ? (
                      <TouchableOpacity
                        style={local.awaitingBtn}
                        onPress={() => openReview(row.request!)}>
                        <Text style={local.awaitingBtnText}>Awaiting Approval</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={local.detailsBtn}
                          onPress={() => openDetails(row)}>
                          <Text style={local.detailsBtnText}>View Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={local.bondBtn}
                          onPress={() => {
                            if (row.bond) {
                              navigation.navigate('BondDetails', {
                                investorId: row.investorId,
                                bondId: row.bondNumber,
                              });
                            }
                          }}>
                          <Text style={local.bondBtnText}>Bond</Text>
                        </TouchableOpacity>
                        {/* Tenure action hidden once the bond has matured
                            (isMatured) — only View + Bond remain for those.
                            For non-matured bonds, Tenure is only enabled
                            once the investor has actually submitted an
                            extension request for this bond — otherwise
                            it's shown disabled/greyed out so the admin
                            can't act on a request that doesn't exist. */}
                      {!isMatured && (
                          <TouchableOpacity
                            disabled={!hasActionableTenureReq}
                            style={[
                              local.tenureBtn,
                              hasActionableTenureReq && local.tenureBtnFlagged,
                              !hasActionableTenureReq && local.tenureBtnDisabled,
                            ]}
                            onPress={() => hasActionableTenureReq && openTenure(row)}>
                            <Text
                              style={[
                                local.tenureBtnText,
                                hasActionableTenureReq && local.tenureBtnTextFlagged,
                                !hasActionableTenureReq && local.tenureBtnTextDisabled,
                              ]}>
                              {hasActionableTenureReq
                                ? 'Tenure •'
                                : hasPendingTenureReq
                                ? 'Awaiting SA'
                                : 'Tenure'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
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

      <AdminBottomTabBar active="Investments" navigation={navigation} />

      {/* ========== Review & Approve Modal ========== */}
      <Modal
        visible={!!reviewReq}
        transparent
        animationType="fade"
        onRequestClose={closeReview}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {reviewReq && (
              <>
                <Text style={styles.modalTitle}>Review Investment</Text>

                <View style={local.detailsBlock}>
                  <Text style={local.detailsBlockTitle}>Investment Details</Text>

                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INVESTOR</Text>
                      <Text style={local.detailValueSmall}>
                        {getInvestorName(
                          reviewReq.investorId,
                          reviewReq.investorName,
                        )}
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INVESTOR ID</Text>
                      <Text style={local.detailValueWarn}>
                        Will be generated on approval
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>BRANCH</Text>
                     <Text style={local.detailValueSmall}>
  {getInvestorBranch(reviewReq.investorId, reviewReq.investorName, reviewReq.branch)}
</Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>AMOUNT</Text>
                      <Text style={local.detailValueSmall}>
                        {formatINR(reviewReq.amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRowLast}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>TENURE</Text>
                      <Text style={local.detailValueSmall}>
                        {reviewReq.tenureMonths} months
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>TRANSACTION REF</Text>
                      <Text style={local.detailValueSmall}>
                        {reviewReq.transactionRef || '—'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.modalLabel}>Interest Rate (% p.a.)</Text>
                <View style={styles.rateChipsRow}>
                  {RATE_QUICK_SELECT.map(r => {
                    const active = parseFloat(rateDraft) === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[styles.rateChip, active && styles.rateChipActive]}
                        onPress={() => setRateDraft(String(r))}>
                        <Text
                          style={[
                            styles.rateChipText,
                            active && styles.rateChipTextActive,
                          ]}>
                          {r}%
                        </Text>
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

                <View style={local.noticeBox}>
                  <Text style={local.noticeText}>
                    Approving will activate the investment, assign a bond number
                    (BND-YYYY-XXX), and generate the digital bond certificate at{' '}
                    {currentRateForNotice}% p.a. The investor will be notified
                    automatically.
                  </Text>
                </View>

                <View style={local.modalActionsRow3}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={closeReview}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={local.rejectBtn}
                    onPress={() => handleReject(reviewReq)}>
                    <Text style={local.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                <TouchableOpacity
   style={styles.modalApproveBtn}
   onPress={handleConfirmApprove}>
   <Text style={styles.modalApproveText}>Approve</Text>
 </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ========== View Details Modal ========== */}
      <Modal
        visible={!!detailsRow}
        transparent
        animationType="fade"
        onRequestClose={closeDetails}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {maxHeight: '85%'}]}>
            {detailsRow && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Investment Details</Text>

                <View style={local.detailsBlock}>
                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>BOND NUMBER</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.bondNumber}
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>STATUS</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.status}
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INVESTOR NAME</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.investorName}
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INVESTOR ID</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.investorId}
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>BRANCH</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.branch}
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INVESTMENT AMOUNT</Text>
                      <Text style={local.detailValueSmall}>
                        {formatINR(detailsRow.amount)}
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRow}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>INTEREST RATE</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.interestRate}% p.a.
                      </Text>
                    </View>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>
                        {detailsRow.status === 'Pending'
                          ? 'SUBMITTED ON'
                          : 'INVESTMENT DATE'}
                      </Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.investedDate}
                      </Text>
                    </View>
                  </View>

                  <View style={local.detailsRowLast}>
                    <View style={local.detailCol}>
                      <Text style={local.detailLabelSmall}>MATURITY DATE</Text>
                      <Text style={local.detailValueSmall}>
                        {detailsRow.maturityDate}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalApproveBtn,
                    {marginTop: 16, alignSelf: 'flex-end'},
                  ]}
                  onPress={closeDetails}>
                  <Text style={styles.modalApproveText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ========== Renew / Increase Tenure Modal ========== */}
      <Modal
        visible={!!tenureRow}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setTenureRow(null);
          setLinkedTenureRequest(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {tenureRow && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Renew / Increase Tenure</Text>

                {/* Shown only when this bond has a matching pending
                    investor request — tells the admin exactly what was
                    asked for, and the fields above are already prefilled
                    from it. */}
                {linkedTenureRequest && (
                  <View style={local.noticeBox}>
                    <Text style={local.noticeText}>
                      {tenureRow.investorName} requested a {linkedTenureRequest.extensionMonths}-month
                      extension on {linkedTenureRequest.requestedOn}. Adjust below if needed, then
                      approve to notify the investor.
                    </Text>
                  </View>
                )}

                <Text style={local.detailLabelSmall}>Investor</Text>
                <Text style={[local.detailValueSmall, {marginBottom: 14}]}>
                  {tenureRow.investorName} ({tenureRow.investorId})
                </Text>

                <View style={local.detailsRow}>
                  <View style={local.detailCol}>
                    <Text style={local.detailLabelSmall}>Current Tenure Ends</Text>
                    <Text style={local.detailValueSmall}>
                      {tenureRow.maturityDate}
                    </Text>
                  </View>
                  <View style={local.detailCol}>
                    <Text style={local.detailLabelSmall}>Current Rate</Text>
                    <Text style={local.detailValueSmall}>
                      {tenureRow.interestRate}% p.a.
                    </Text>
                  </View>
                </View>

                <View style={local.detailsRow}>
                  <View style={local.detailCol}>
                    <Text style={local.detailLabelSmall}>Extend By (months)</Text>
                    <TextInput
                      style={styles.rateInput}
                      keyboardType="number-pad"
                      value={extendMonths}
                      onChangeText={setExtendMonths}
                    />
                  </View>
                  <View style={local.detailCol}>
                    <Text style={local.detailLabelSmall}>New Rate (% p.a.)</Text>
                    <TextInput
                      style={styles.rateInput}
                      keyboardType="decimal-pad"
                      value={newRate}
                      onChangeText={setNewRate}
                    />
                  </View>
                </View>

                <Text style={local.detailLabelSmall}>New Maturity Date</Text>
                <Text style={[local.detailValueSmall, {marginBottom: 12}]}>
                  {calcNewMaturity()}
                </Text>

                <Text style={local.detailLabelSmall}>Remarks (optional)</Text>
                <TextInput
                  style={[
                    styles.rateInput,
                    {height: 70, textAlignVertical: 'top', marginBottom: 8},
                  ]}
                  multiline
                  placeholder="Add remarks..."
                  placeholderTextColor="#9CA3AF"
                  value={remarks}
                  onChangeText={setRemarks}
                />

                <View style={local.modalActionsRow3}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setTenureRow(null);
                      setLinkedTenureRequest(null);
                    }}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  {linkedTenureRequest && (
                    <TouchableOpacity
                      style={local.rejectBtn}
                      onPress={() => {
                        Alert.alert(
                          'Reject extension',
                          `Reject ${tenureRow.investorName}'s extension request for ${tenureRow.bondNumber}?`,
                          [
                            {text: 'Cancel', style: 'cancel'},
                            {
                              text: 'Reject',
                              style: 'destructive',
                              onPress: () => {
                                rejectTenureExtension(linkedTenureRequest.id);
                                setTenureRow(null);
                                setLinkedTenureRequest(null);
                              },
                            },
                          ],
                        );
                      }}>
                      <Text style={local.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.modalApproveBtn}
                    onPress={handleApproveTenure}>
                    <Text style={styles.modalApproveText}>Review & Approve</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const local = StyleSheet.create({
  detailsBlock: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  detailsBlockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B1E45',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailsRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabelSmall: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailValueSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  detailValueWarn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 2,
  },
  noticeBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  modalActionsRow3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  detailsBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  bondBtn: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bondBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tenureBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tenureBtnText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '600',
  },
  // Highlights the Tenure button when there's a pending investor request
  // behind this specific bond, so the admin doesn't have to open every
  // bond to find it.
  tenureBtnFlagged: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  tenureBtnTextFlagged: {
    color: '#B45309',
  },
  // Tenure button is disabled/greyed out when there's no pending
  // investor-submitted extension request for this bond — admin can't open
  // the extension flow until the investor actually asks for one.
  tenureBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  tenureBtnTextDisabled: {
    color: '#9CA3AF',
  },
  awaitingBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  awaitingBtnText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '600',
  },
  // Info card style for the Pending Approval tab — used for tenure
  // extension requests.
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3E8C7',
    padding: 14,
    marginBottom: 12,
  },
  infoCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  infoBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  infoCardBondId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  infoCardText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  infoCardBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  infoCardBtnText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  // Small flag shown on a bond's card in "All Investments" when it has a
  // pending investor request behind it, or has simply matured.
  rowFlag: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  rowFlagText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
});

export default BondTrackingScreen;