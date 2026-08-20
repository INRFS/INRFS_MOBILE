import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {styles} from '../../styles/superadmin/PaymentQueueScreen.styles';
import AppHeader from '../../components/AppHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData, Payout} from '../../navigation/AppNavigator';

type TabKey = 'All' | 'Monthly Interest' | 'Tenure Settlement' | 'Pre-Close Settlement';

const TABS: TabKey[] = ['All', 'Monthly Interest', 'Tenure Settlement', 'Pre-Close Settlement'];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// Only payouts that have actually entered the Super Admin approval flow
// belong on this screen — 'overdue'/'upcoming' haven't been sent yet.
const QUEUE_STATUSES: Payout['status'][] = ['pending_approval', 'approved', 'rejected', 'paid'];

const displayStatus = (status: Payout['status']) => {
  switch (status) {
    case 'pending_approval':
      return 'Pending';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'paid':
      return 'Paid';
    default:
      return 'Pending';
  }
};

const statusStyleFor = (status: string) => {
  switch (status) {
    case 'Approved':
      return {pill: styles.pillApproved, text: styles.pillTextApproved};
    case 'Rejected':
      return {pill: styles.pillRejected, text: styles.pillTextRejected};
    case 'Paid':
      return {pill: styles.pillPaid, text: styles.pillTextPaid};
    default:
      return {pill: styles.pillPending, text: styles.pillTextPending};
  }
};

// Tenure Extension / Maturity Settlement / Pre-Close requests all share the
// same status shape once they reach this screen: 'PendingSuperAdmin' |
// 'Approved' | 'Rejected'. There's no separate "mark paid" step for these
// three (superAdminApprove... already settles the bond in one action), so
// the underlying status value is always 'Approved' — but the button that
// triggers it isn't always labeled "Approve": Maturity Settlement and
// Pre-Close use "Mark as Paid", so their resulting pill should read "Paid"
// (Tenure Extension uses "Approve Extension", so it keeps "Approved").
const settlementStatusInfo = (
  status: 'PendingSuperAdmin' | 'Approved' | 'Rejected',
  approvedAs: 'Approved' | 'Paid' = 'Approved',
) => {
  switch (status) {
    case 'Approved':
      return approvedAs === 'Paid'
        ? {label: 'Paid', pill: styles.pillPaid, text: styles.pillTextPaid}
        : {label: 'Approved', pill: styles.pillApproved, text: styles.pillTextApproved};
    case 'Rejected':
      return {label: 'Rejected', pill: styles.pillRejected, text: styles.pillTextRejected};
    default:
      return {label: 'Pending', pill: styles.pillPending, text: styles.pillTextPending};
  }
};

// ---- Generic "are you sure?" confirmation popup config ----------------
// Every approve / reject / mark-paid action now routes through this same
// small confirm step instead of firing immediately. Nothing about the
// underlying context calls (approvePayoutRequest, rejectPayoutRequest,
// markPayoutPaid, superAdminApprove/RejectTenureExtension,
// superAdminApprove/RejectMaturitySettlement,
// superAdminApprove/RejectPreSettlement) has changed — they're only
// invoked one step later, inside onConfirm.
type ConfirmVariant = 'approve' | 'reject' | 'markPaid';

type ConfirmState = {
  title: string;
  message: string;
  note?: string;
  infoRows: {label: string; value: string}[];
  confirmLabel: string;
  variant: ConfirmVariant;
  onConfirm: () => void;
};

const confirmBtnStyleFor = (variant: ConfirmVariant) => {
  switch (variant) {
    case 'approve':
      return {btn: styles.approveBtn, text: styles.approveBtnText};
    case 'reject':
      return {btn: styles.confirmRejectBtn, text: styles.confirmRejectBtnText};
    case 'markPaid':
    default:
      return {btn: styles.markPaidBtn, text: styles.markPaidBtnText};
  }
};

const confirmIconStyleFor = (variant: ConfirmVariant) => {
  switch (variant) {
    case 'reject':
      return {wrap: styles.confirmIconWrapRed, text: styles.confirmIconTextRed, glyph: '✕'};
    default:
      return {wrap: styles.confirmIconWrapGreen, text: styles.confirmIconTextGreen, glyph: '✓'};
  }
};

const PaymentQueueScreen = ({navigation}: any) => {
const {
    payouts,
    saNotifications,
    approvePayoutRequest,
    rejectPayoutRequest,
    markPayoutPaid,
    preSettlementRequests,
    superAdminApprovePreSettlement,
    superAdminRejectPreSettlement,
    tenureExtensionRequests,
    superAdminApproveTenureExtension,
    superAdminRejectTenureExtension,
    maturitySettlementRequests,
    superAdminApproveMaturitySettlement,
    superAdminRejectMaturitySettlement,
    bonds,
    investors,
    branches,
  } = useAppData();
  const [activeTab, setActiveTab] = useState<TabKey>('Monthly Interest');
  const [receiptRow, setReceiptRow] = useState<Payout | null>(null);

  // Step 1 of the Approve flow for Monthly Interest rows: shows the full
  // "Review & Approve Payment" detail sheet (mirrors the web reference).
  const [reviewPayout, setReviewPayout] = useState<Payout | null>(null);

  // Step 2 (and the only step for Reject / Mark Paid everywhere else):
  // a small "are you sure?" confirmation popup.
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  // NEW: "Requested By" / "Approved By Admin" — matches the web table's
  // columns of the same name. There's no per-payout admin identity stored
  // on Payout itself, so this derives the branch admin the same way the
  // web reference does: bond -> investor -> the investor's branch -> that
  // branch's adminName. Requested By and Approved By Admin show the same
  // derived name (the web reference shows identical values in both
  // columns for every row too), since a branch's own admin is both who
  // requests payouts for their branch and whose name is recorded as
  // approving them.
  const adminForPayout = (row: Payout): string => {
    const bond = bonds.find(b => b.seriesId === row.bondId);
    const investor = bond ? investors.find(i => i.id === bond.investorId) : undefined;
    const branch = investor ? branches.find(b => b.name === investor.branch) : undefined;
    return branch?.adminName || '—';
  };

  // Monthly Interest = real payouts. Tenure Settlement / Pre-Close
  // Settlement are placeholders for now (Option B).
  const monthlyInterestRows = payouts.filter(p => QUEUE_STATUSES.includes(p.status));

 const rows =
    activeTab === 'All' || activeTab === 'Monthly Interest' ? monthlyInterestRows : [];

  // Pre-close / tenure extension / maturity settlement requests the admin
  // has already forwarded — this is the Super Admin's queue for these.
  // FIX: previously this only kept rows still 'PendingSuperAdmin', so the
  // moment Approve/Reject fired the row's status changed and it silently
  // fell out of this filter — the request just vanished instead of
  // sticking around with an Approved/Rejected pill, unlike Monthly
  // Interest rows (which stay visible via QUEUE_STATUSES above). Now these
  // three keep any row that has reached the Super Admin stage at all.
  const SETTLEMENT_QUEUE_STATUSES = ['PendingSuperAdmin', 'Approved', 'Rejected'];
  const precloseRows = preSettlementRequests.filter(r => SETTLEMENT_QUEUE_STATUSES.includes(r.status));
  const tenureExtensionRows = tenureExtensionRequests.filter(r => SETTLEMENT_QUEUE_STATUSES.includes(r.status));
  const maturitySettlementRows = maturitySettlementRequests.filter(r => SETTLEMENT_QUEUE_STATUSES.includes(r.status));
  const pendingRows = payouts.filter(p => p.status === 'pending_approval');
  const pendingTotal = pendingRows.reduce((sum, p) => sum + p.amount, 0);

  // Finds the saNotification tied to a payout, so approve/reject can call
  // the existing context functions (which key off notification id, not
  // payout id directly).
  const findNotificationForPayout = (payoutId: string) =>
    saNotifications.find(
      n =>
        !n.payoutActionTaken &&
        (n.relatedPayoutId === payoutId || n.relatedPayoutIds?.includes(payoutId)),
    );

  const handleApprove = (payout: Payout) => {
    const note = findNotificationForPayout(payout.id);
    if (note) approvePayoutRequest(note.id);
  };

  const handleReject = (payout: Payout) => {
    const note = findNotificationForPayout(payout.id);
    if (note) rejectPayoutRequest(note.id);
  };

  const handleMarkPaid = (payout: Payout) => {
    markPayoutPaid(payout.id);
  };

  const closeConfirm = () => setConfirm(null);

  // ---- Popup openers (Monthly Interest rows) ---------------------------
  const openApproveConfirm = (row: Payout) => {
    setConfirm({
      title: 'Approve Payment?',
      message: `Are you sure you want to approve this payment of ${formatINR(row.amount)} for ${row.investorName}?`,
      note: 'After approval, this payment can be marked as paid.',
      confirmLabel: 'Approve Payment',
      variant: 'approve',
      infoRows: [
        {label: 'INVESTOR', value: row.investorName},
        {label: 'AMOUNT', value: formatINR(row.amount)},
        {label: 'PAYMENT ID', value: row.id},
      ],
      onConfirm: () => {
        handleApprove(row);
        setReviewPayout(null);
        closeConfirm();
      },
    });
  };

  const openRejectConfirm = (row: Payout, fromReview?: boolean) => {
    setConfirm({
      title: 'Reject Payment?',
      message: `Are you sure you want to reject this payment of ${formatINR(row.amount)} for ${row.investorName}?`,
      note: 'This action cannot be undone.',
      confirmLabel: 'Reject Payment',
      variant: 'reject',
      infoRows: [
        {label: 'INVESTOR', value: row.investorName},
        {label: 'AMOUNT', value: formatINR(row.amount)},
        {label: 'PAYMENT ID', value: row.id},
      ],
      onConfirm: () => {
        handleReject(row);
        if (fromReview) setReviewPayout(null);
        closeConfirm();
      },
    });
  };

  const openMarkPaidConfirm = (row: Payout) => {
    setConfirm({
      title: 'Mark Payment as Paid?',
      message: `Confirm that the payment of ${formatINR(row.amount)} for ${row.investorName} has been paid?`,
      note: 'Once confirmed, the payment status will change to Paid.',
      confirmLabel: 'Mark Paid',
      variant: 'markPaid',
      infoRows: [
        {label: 'INVESTOR', value: row.investorName},
        {label: 'AMOUNT', value: formatINR(row.amount)},
        {label: 'PAYMENT ID', value: row.id},
      ],
      onConfirm: () => {
        handleMarkPaid(row);
        closeConfirm();
      },
    });
  };

  // ---- Popup openers (Tenure Extension / Maturity Settlement / Pre-Close) --
  const openTenureExtensionApproveConfirm = (r: (typeof tenureExtensionRows)[number]) => {
    setConfirm({
      title: 'Approve Tenure Extension?',
      message: `Approve extending ${r.investorName}'s bond ${r.bondSeriesId} by ${r.extensionMonths} months?`,
      confirmLabel: 'Approve Extension',
      variant: 'approve',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
        {label: 'EXTEND BY', value: `${r.extensionMonths} months`},
      ],
      onConfirm: () => {
        superAdminApproveTenureExtension(r.id);
        closeConfirm();
      },
    });
  };

  const openTenureExtensionRejectConfirm = (r: (typeof tenureExtensionRows)[number]) => {
    setConfirm({
      title: 'Reject Tenure Extension?',
      message: `Are you sure you want to reject the tenure extension request for ${r.investorName}?`,
      confirmLabel: 'Reject Extension',
      variant: 'reject',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
      ],
      onConfirm: () => {
        superAdminRejectTenureExtension(r.id);
        closeConfirm();
      },
    });
  };

  const openMaturitySettlementApproveConfirm = (r: (typeof maturitySettlementRows)[number]) => {
    setConfirm({
      title: 'Mark Payment as Paid?',
      message: `Confirm that the maturity settlement of ${formatINR(r.netSettlement)} for ${r.investorName} has been paid?`,
      note: 'Once confirmed, the payment status will change to Paid.',
      confirmLabel: 'Mark Paid',
      variant: 'markPaid',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
        {label: 'NET SETTLEMENT', value: formatINR(r.netSettlement)},
      ],
      onConfirm: () => {
        superAdminApproveMaturitySettlement(r.id);
        closeConfirm();
      },
    });
  };

  const openMaturitySettlementRejectConfirm = (r: (typeof maturitySettlementRows)[number]) => {
    setConfirm({
      title: 'Reject Settlement?',
      message: `Are you sure you want to reject the maturity settlement for ${r.investorName}?`,
      confirmLabel: 'Reject Settlement',
      variant: 'reject',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
      ],
      onConfirm: () => {
        superAdminRejectMaturitySettlement(r.id);
        closeConfirm();
      },
    });
  };

  const openPrecloseApproveConfirm = (r: (typeof precloseRows)[number]) => {
    setConfirm({
      title: 'Mark Payment as Paid?',
      message: `Confirm that the pre-close settlement of ${formatINR(r.netAmount)} for ${r.investorName} has been paid?`,
      note: 'Once confirmed, the payment status will change to Paid.',
      confirmLabel: 'Mark Paid',
      variant: 'markPaid',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
        {label: 'NET PAYABLE', value: formatINR(r.netAmount)},
      ],
      onConfirm: () => {
        superAdminApprovePreSettlement(r.id);
        closeConfirm();
      },
    });
  };

  const openPrecloseRejectConfirm = (r: (typeof precloseRows)[number]) => {
    setConfirm({
      title: 'Reject Settlement?',
      message: `Are you sure you want to reject the pre-close settlement for ${r.investorName}?`,
      confirmLabel: 'Reject Settlement',
      variant: 'reject',
      infoRows: [
        {label: 'INVESTOR', value: r.investorName},
        {label: 'BOND', value: r.bondSeriesId},
      ],
      onConfirm: () => {
        superAdminRejectPreSettlement(r.id);
        closeConfirm();
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Payment Queue" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Payment Queue</Text>
        <Text style={styles.subtitle}>Approved payment requests from all branch admins</Text>

        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>{pendingRows.length} PENDING</Text>
          <Text style={styles.pendingValue}>{formatINR(pendingTotal)}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

           {activeTab === 'Tenure Settlement' && (
          <>
            {maturitySettlementRows.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No tenure settlements awaiting approval.</Text>
              </View>
            )}

            {maturitySettlementRows.map(r => {
              const statusInfo = settlementStatusInfo(r.status as 'PendingSuperAdmin' | 'Approved' | 'Rejected', 'Paid');
              return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.investorName}>{r.investorName}</Text>
                  <View style={[styles.pill, statusInfo.pill]}>
                    <Text style={[styles.pillText, statusInfo.text]}>{statusInfo.label}</Text>
                  </View>
                </View>

                <View style={styles.typePillRow}>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>Bond Maturity Settlement</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>BOND</Text>
                    <Text style={styles.cardValueLink}>{r.bondSeriesId}</Text>
                  </View>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>NET SETTLEMENT</Text>
                    <Text style={styles.cardValue}>{formatINR(r.netSettlement)}</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>PRINCIPAL</Text>
                    <Text style={styles.cardValueSm}>{formatINR(r.principal)}</Text>
                  </View>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>INTEREST EARNED</Text>
                    <Text style={styles.cardValueSm}>{formatINR(r.totalInterest)}</Text>
                  </View>
                </View>

                {r.status === 'PendingSuperAdmin' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => openMaturitySettlementRejectConfirm(r)}>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.markPaidBtn}
                      onPress={() => openMaturitySettlementApproveConfirm(r)}>
                      <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              );
            })}
          </>
        )}

         

        {activeTab === 'Pre-Close Settlement' && (
          <>
            {precloseRows.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No pre-close requests awaiting settlement.</Text>
              </View>
            )}
            {precloseRows.map(r => {
              const statusInfo = settlementStatusInfo(r.status as 'PendingSuperAdmin' | 'Approved' | 'Rejected', 'Paid');
              return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.investorName}>{r.investorName}</Text>
                  <View style={[styles.pill, statusInfo.pill]}>
                    <Text style={[styles.pillText, statusInfo.text]}>{statusInfo.label}</Text>
                  </View>
                </View>

                <View style={styles.typePillRow}>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>Pre-Close Settlement</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>BOND</Text>
                    <Text style={styles.cardValueLink}>{r.bondSeriesId}</Text>
                  </View>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>NET PAYABLE</Text>
                    <Text style={styles.cardValue}>{formatINR(r.netAmount)}</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>PRINCIPAL</Text>
                    <Text style={styles.cardValueSm}>{formatINR(r.principal)}</Text>
                  </View>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>PENALTY</Text>
                    <Text style={styles.cardValueSm}>{formatINR(r.penalty)}</Text>
                  </View>
                </View>

                {r.reason ? (
                  <View style={styles.cardGrid}>
                    <View style={styles.cardCol}>
                      <Text style={styles.cardLabel}>REASON</Text>
                      <Text style={styles.cardValueSm}>{r.reason}</Text>
                    </View>
                  </View>
                ) : null}

                {r.status === 'PendingSuperAdmin' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => openPrecloseRejectConfirm(r)}>
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.markPaidBtn}
                      onPress={() => openPrecloseApproveConfirm(r)}>
                      <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              );
            })}
          </>
        )}
        {rows.length === 0 && (activeTab === 'All' || activeTab === 'Monthly Interest') && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No payments in this category</Text>
          </View>
        )}

        {rows.map(row => {
          const status = displayStatus(row.status);
          const statusStyle = statusStyleFor(status);
          const adminName = adminForPayout(row);
          return (
            <View key={row.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.investorName}>{row.investorName}</Text>
                <View style={[styles.pill, statusStyle.pill]}>
                  <Text style={[styles.pillText, statusStyle.text]}>{status}</Text>
                </View>
              </View>

              <View style={styles.typePillRow}>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>Monthly Interest</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>BOND</Text>
                  <Text style={styles.cardValueLink}>{row.bondId}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>AMOUNT</Text>
                  <Text style={styles.cardValue}>{formatINR(row.amount)}</Text>
                </View>
              </View>

              {/* NEW: Requested By / Approved By Admin — matches the web
                  table's columns of the same name (replaces the old Due
                  Date / Reference row; Reference has been removed). */}
              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>REQUESTED BY</Text>
                  <Text style={styles.cardValueSm}>{adminName}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>APPROVED BY ADMIN</Text>
                  <Text style={styles.cardValueSm}>{adminName}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>DATE</Text>
                  <Text style={styles.cardValueSm}>{row.dueDate}</Text>
                </View>
              </View>

              {status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => openRejectConfirm(row)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  {/* Opens the Review & Approve Payment detail sheet first,
                      same as the web reference — the actual approve call
                      only fires once the user confirms inside it. */}
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => setReviewPayout(row)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}

              {status === 'Approved' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => openMarkPaidConfirm(row)}>
                    <Text style={styles.markPaidBtnText}>Mark Paid</Text>
                  </TouchableOpacity>
                </View>
              )}

              {status === 'Paid' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.receiptBtn} onPress={() => setReceiptRow(row)}>
                    <Text style={styles.receiptBtnText}>📄  Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ---- Step 1: Review & Approve Payment detail sheet (Monthly Interest) ---- */}
      <Modal
        visible={!!reviewPayout}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewPayout(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Review & Approve Payment</Text>
              <TouchableOpacity onPress={() => setReviewPayout(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewIntroRow}>
              <View style={styles.reviewIntroIconWrap}>
                <Text style={styles.reviewIntroIconText}>🛡️</Text>
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.reviewIntroTitle}>Payment approval request</Text>
                <Text style={styles.reviewIntroSubtext}>
                  Review the payment details submitted by the branch admin before approving this
                  request.
                </Text>
              </View>
            </View>

            {reviewPayout && (
              <>
                <View style={styles.amountBoxRow}>
                  <View>
                    <Text style={styles.amountBoxLabel}>PAYMENT AMOUNT</Text>
                    <Text style={styles.amountBoxValue}>{formatINR(reviewPayout.amount)}</Text>
                  </View>
                  <View style={[styles.pill, styles.pillPending]}>
                    <Text style={[styles.pillText, styles.pillTextPending]}>Pending</Text>
                  </View>
                </View>

                <View style={styles.modalGrid}>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>INVESTOR</Text>
                    <Text style={styles.modalValue}>{reviewPayout.investorName}</Text>
                  </View>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>BOND NUMBER</Text>
                    <Text style={styles.modalValue}>{reviewPayout.bondId}</Text>
                  </View>
                </View>

                <View style={styles.modalGrid}>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>PAYMENT TYPE</Text>
                    <View style={styles.modalTypePill}>
                      <Text style={styles.modalTypePillText}>Monthly Interest</Text>
                    </View>
                  </View>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>REQUEST DATE</Text>
                    <Text style={styles.modalValue}>{reviewPayout.dueDate}</Text>
                  </View>
                </View>

                <View style={styles.modalGrid}>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>REQUESTED BY</Text>
                    <Text style={styles.modalValue}>{adminForPayout(reviewPayout)}</Text>
                  </View>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>BRANCH ADMIN APPROVAL</Text>
                    <Text style={styles.modalValue}>{adminForPayout(reviewPayout)}</Text>
                  </View>
                </View>

                <View style={styles.modalGrid}>
                  <View style={styles.modalCol}>
                    <Text style={styles.modalLabel}>PAYMENT REQUEST ID</Text>
                    <Text style={styles.modalValue}>{reviewPayout.id}</Text>
                  </View>
                </View>

                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>
                    Approving this request will move it to Approved. The payment can then be
                    processed using Mark Paid.
                  </Text>
                </View>

                <View style={styles.reviewActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setReviewPayout(null)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => openRejectConfirm(reviewPayout, true)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => openApproveConfirm(reviewPayout)}>
                    <Text style={styles.approveBtnText}>Approve Payment</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ---- Step 2: generic "are you sure?" confirmation popup ---- */}
      <Modal visible={!!confirm} transparent animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{flex: 1}} />
              <TouchableOpacity onPress={closeConfirm}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {confirm && (
              <>
                <View style={confirmIconStyleFor(confirm.variant).wrap}>
                  <Text style={confirmIconStyleFor(confirm.variant).text}>
                    {confirmIconStyleFor(confirm.variant).glyph}
                  </Text>
                </View>

                <Text style={styles.confirmTitle}>{confirm.title}</Text>
                <Text style={styles.confirmMessage}>{confirm.message}</Text>
                {confirm.note ? <Text style={styles.confirmSubtext}>{confirm.note}</Text> : null}

                <View style={styles.confirmInfoRow}>
                  {confirm.infoRows.map(item => (
                    <View key={item.label} style={styles.confirmInfoCol}>
                      <Text style={styles.confirmInfoLabel}>{item.label}</Text>
                      <Text style={styles.confirmInfoValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.reviewActionRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={closeConfirm}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={confirmBtnStyleFor(confirm.variant).btn}
                    onPress={confirm.onConfirm}>
                    <Text style={confirmBtnStyleFor(confirm.variant).text}>
                      {confirm.confirmLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={!!receiptRow} transparent animationType="fade" onRequestClose={() => setReceiptRow(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{receiptRow?.bondId}</Text>
              <TouchableOpacity onPress={() => setReceiptRow(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>INVESTOR</Text>
                <Text style={styles.modalValue}>{receiptRow?.investorName}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>BOND</Text>
                <Text style={styles.modalValue}>{receiptRow?.bondId}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>PAYMENT TYPE</Text>
                <View style={styles.modalTypePill}>
                  <Text style={styles.modalTypePillText}>Monthly Interest</Text>
                </View>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>AMOUNT</Text>
                <Text style={styles.modalValue}>{receiptRow ? formatINR(receiptRow.amount) : ''}</Text>
              </View>
            </View>

            {/* NEW: Requested By / Approved By Admin — replaces the old
                Due Date / Reference row; Reference has been removed. */}
            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>REQUESTED BY</Text>
                <Text style={styles.modalValue}>{receiptRow ? adminForPayout(receiptRow) : ''}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>APPROVED BY ADMIN</Text>
                <Text style={styles.modalValue}>{receiptRow ? adminForPayout(receiptRow) : ''}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>DATE</Text>
                <Text style={styles.modalValue}>{receiptRow?.dueDate}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>STATUS</Text>
                <View style={styles.modalStatusPill}>
                  <Text style={styles.modalStatusPillText}>Paid</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* <SuperAdminBottomTabBar navigation={navigation} active="Notifications" /> */}
    </SafeAreaView>
  );
};

export default PaymentQueueScreen;