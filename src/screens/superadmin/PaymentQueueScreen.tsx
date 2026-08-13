// import React, {useState} from 'react';
// import {View, Text, ScrollView, TouchableOpacity, Modal} from 'react-native';
// import {styles} from '../../styles/superadmin/PaymentQueueScreen.styles';
// import SuperAdminHeader from './components/SuperAdminHeader';
// import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
// import {SafeAreaView} from 'react-native-safe-area-context';

// type PaymentType = 'Monthly Interest' | 'Tenure Settlement' | 'Pre-Close Settlement';
// type PaymentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';
// type TabKey = 'All' | PaymentType;

// interface PaymentRow {
//   id: string;
//   investor: string;
//   bond: string;
//   paymentType: PaymentType;
//   amount: string;
//   requestedBy: string;
//   approvedBy: string;
//   date: string;
//   status: PaymentStatus;
// }

// // STATIC SEED DATA — this becomes the screen's local state below, so
// // Approve/Reject/Mark Paid actually change status on screen.
// const SEED_PAYMENTS: PaymentRow[] = [
//   {id: '1', investor: 'Arjun Sharma', bond: 'BND-2025-001', paymentType: 'Monthly Interest', amount: '₹15,000', requestedBy: 'Ravi Mehta', approvedBy: 'Ravi Mehta', date: '05 Aug 2026', status: 'Rejected'},
//   {id: '2', investor: 'Neha Gupta', bond: 'BND-2025-003', paymentType: 'Monthly Interest', amount: '₹18,000', requestedBy: 'Anita Rao', approvedBy: 'Anita Rao', date: '05 Aug 2026', status: 'Approved'},
//   {id: '3', investor: 'Sunita Verma', bond: 'BND-2025-008', paymentType: 'Monthly Interest', amount: '₹4,500', requestedBy: 'Mohan Das', approvedBy: 'Mohan Das', date: '02 Aug 2026', status: 'Paid'},
//   {id: '4', investor: 'Rahul Kumar', bond: 'BND-2025-002', paymentType: 'Tenure Settlement', amount: '₹10,32,500', requestedBy: 'Anita Rao', approvedBy: 'Anita Rao', date: '04 Aug 2026', status: 'Pending'},
//   {id: '5', investor: 'Arjun Sharma', bond: 'BND-2025-001', paymentType: 'Pre-Close Settlement', amount: '₹5,15,000', requestedBy: 'Ravi Mehta', approvedBy: 'Ravi Mehta', date: '03 Aug 2026', status: 'Approved'},
// ];

// const TABS: TabKey[] = ['All', 'Monthly Interest', 'Tenure Settlement', 'Pre-Close Settlement'];

// const statusStyleFor = (status: PaymentStatus) => {
//   switch (status) {
//     case 'Approved':
//       return {pill: styles.pillApproved, text: styles.pillTextApproved};
//     case 'Rejected':
//       return {pill: styles.pillRejected, text: styles.pillTextRejected};
//     case 'Paid':
//       return {pill: styles.pillPaid, text: styles.pillTextPaid};
//     case 'Pending':
//     default:
//       return {pill: styles.pillPending, text: styles.pillTextPending};
//   }
// };

// const PaymentQueueScreen = ({navigation}: any) => {
//   const [payments, setPayments] = useState<PaymentRow[]>(SEED_PAYMENTS);
//   const [activeTab, setActiveTab] = useState<TabKey>('All');
//   const [receiptRow, setReceiptRow] = useState<PaymentRow | null>(null);

//   const rows =
//     activeTab === 'All' ? payments : payments.filter(p => p.paymentType === activeTab);

//   const pendingRows = payments.filter(p => p.status === 'Pending');
//   const pendingTotal = pendingRows.reduce(
//     (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, '')),
//     0,
//   );

//   // ---- Actions: Pending -> Approved/Rejected -> Paid -> Receipt ----
//   const handleApprove = (id: string) => {
//     setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Approved'} : p)));
//   };

//   const handleReject = (id: string) => {
//     setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Rejected'} : p)));
//   };

//   const handleMarkPaid = (id: string) => {
//     setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Paid'} : p)));
//   };

//   const openReceipt = (row: PaymentRow) => setReceiptRow(row);
//   const closeReceipt = () => setReceiptRow(null);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <SuperAdminHeader navigation={navigation} title="Payments" showBack={false} />

//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <Text style={styles.title}>Payment Queue</Text>
//         <Text style={styles.subtitle}>Approved payment requests from all branch admins</Text>

//         <View style={styles.pendingCard}>
//           <Text style={styles.pendingLabel}>{pendingRows.length} PENDING</Text>
//           <Text style={styles.pendingValue}>₹{pendingTotal.toLocaleString('en-IN')}</Text>
//         </View>

//         <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
//           {TABS.map(tab => (
//             <TouchableOpacity
//               key={tab}
//               style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
//               onPress={() => setActiveTab(tab)}>
//               <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
//                 {tab}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         {rows.length === 0 && (
//           <View style={styles.emptyWrap}>
//             <Text style={styles.emptyText}>No payments in this category</Text>
//           </View>
//         )}

//         {rows.map(row => {
//           const statusStyle = statusStyleFor(row.status);
//           return (
//             <View key={row.id} style={styles.card}>
//               <View style={styles.cardTopRow}>
//                 <Text style={styles.investorName}>{row.investor}</Text>
//                 <View style={[styles.pill, statusStyle.pill]}>
//                   <Text style={[styles.pillText, statusStyle.text]}>{row.status}</Text>
//                 </View>
//               </View>

//               <View style={styles.typePillRow}>
//                 <View style={styles.typePill}>
//                   <Text style={styles.typePillText}>{row.paymentType}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>BOND</Text>
//                   <Text style={styles.cardValueLink}>{row.bond}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>AMOUNT</Text>
//                   <Text style={styles.cardValue}>{row.amount}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>REQUESTED BY</Text>
//                   <Text style={styles.cardValueSm}>{row.requestedBy}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>DATE</Text>
//                   <Text style={styles.cardValueSm}>{row.date}</Text>
//                 </View>
//               </View>

//               {/* Pending -> Approve / Reject */}
//               {row.status === 'Pending' && (
//                 <View style={styles.actionRow}>
//                   <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(row.id)}>
//                     <Text style={styles.rejectBtnText}>Reject</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(row.id)}>
//                     <Text style={styles.approveBtnText}>Approve</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {/* Approved -> Mark Paid */}
//               {row.status === 'Approved' && (
//                 <View style={styles.actionRow}>
//                   <TouchableOpacity style={styles.markPaidBtn} onPress={() => handleMarkPaid(row.id)}>
//                     <Text style={styles.markPaidBtnText}>Mark Paid</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {/* Paid -> Receipt */}
//               {row.status === 'Paid' && (
//                 <View style={styles.actionRow}>
//                   <TouchableOpacity style={styles.receiptBtn} onPress={() => openReceipt(row)}>
//                     <Text style={styles.receiptBtnText}>📄  Receipt</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {/* Rejected -> no action, matches web */}
//             </View>
//           );
//         })}
//       </ScrollView>

//       {/* Receipt popup — same fields as the web's eye-icon modal */}
//       <Modal visible={!!receiptRow} transparent animationType="fade" onRequestClose={closeReceipt}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>{receiptRow?.bond}</Text>
//               <TouchableOpacity onPress={closeReceipt}>
//                 <Text style={styles.modalClose}>✕</Text>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalGrid}>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>INVESTOR</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.investor}</Text>
//               </View>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>BOND</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.bond}</Text>
//               </View>
//             </View>

//             <View style={styles.modalGrid}>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>PAYMENT TYPE</Text>
//                 <View style={styles.modalTypePill}>
//                   <Text style={styles.modalTypePillText}>{receiptRow?.paymentType}</Text>
//                 </View>
//               </View>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>AMOUNT</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.amount}</Text>
//               </View>
//             </View>

//             <View style={styles.modalGrid}>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>REQUESTED BY</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.requestedBy}</Text>
//               </View>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>APPROVED BY ADMIN</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.approvedBy}</Text>
//               </View>
//             </View>

//             <View style={styles.modalGrid}>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>DATE</Text>
//                 <Text style={styles.modalValue}>{receiptRow?.date}</Text>
//               </View>
//               <View style={styles.modalCol}>
//                 <Text style={styles.modalLabel}>STATUS</Text>
//                 <View style={styles.modalStatusPill}>
//                   <Text style={styles.modalStatusPillText}>{receiptRow?.status}</Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <SuperAdminBottomTabBar navigation={navigation} active="Notifications" />
//     </SafeAreaView>
//   );
// };

// export default PaymentQueueScreen;

import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {styles} from '../../styles/superadmin/PaymentQueueScreen.styles';
import SuperAdminHeader from './components/SuperAdminHeader';
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
  } = useAppData();
  const [activeTab, setActiveTab] = useState<TabKey>('Monthly Interest');
  const [receiptRow, setReceiptRow] = useState<Payout | null>(null);

  // Monthly Interest = real payouts. Tenure Settlement / Pre-Close
  // Settlement are placeholders for now (Option B).
  const monthlyInterestRows = payouts.filter(p => QUEUE_STATUSES.includes(p.status));

 const rows =
    activeTab === 'All' || activeTab === 'Monthly Interest' ? monthlyInterestRows : [];

  // Pre-close requests the admin has already forwarded — this is the
  // Super Admin's action queue for settling early exits.
  const precloseRows = preSettlementRequests.filter(r => r.status === 'PendingSuperAdmin');
const tenureExtensionRows = tenureExtensionRequests.filter(r => r.status === 'PendingSuperAdmin');
  const maturitySettlementRows = maturitySettlementRequests.filter(r => r.status === 'PendingSuperAdmin');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Payments" showBack={false} />

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
            {tenureExtensionRows.length === 0 && maturitySettlementRows.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No tenure settlements awaiting approval.</Text>
              </View>
            )}

            {tenureExtensionRows.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.investorName}>{r.investorName}</Text>
                  <View style={[styles.pill, styles.pillPending]}>
                    <Text style={[styles.pillText, styles.pillTextPending]}>Pending</Text>
                  </View>
                </View>

                <View style={styles.typePillRow}>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>Tenure Extension</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>BOND</Text>
                    <Text style={styles.cardValueLink}>{r.bondSeriesId}</Text>
                  </View>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>EXTEND BY</Text>
                    <Text style={styles.cardValue}>{r.extensionMonths} months</Text>
                  </View>
                </View>

                <View style={styles.cardGrid}>
                  <View style={styles.cardCol}>
                    <Text style={styles.cardLabel}>CURRENT TENURE</Text>
                    <Text style={styles.cardValueSm}>{r.currentTenureMonths} months</Text>
                  </View>
                  {r.decidedRate !== undefined && (
                    <View style={styles.cardCol}>
                      <Text style={styles.cardLabel}>NEW RATE</Text>
                      <Text style={styles.cardValueSm}>{r.decidedRate}% p.a.</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => superAdminRejectTenureExtension(r.id)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => superAdminApproveTenureExtension(r.id)}>
                    <Text style={styles.markPaidBtnText}>Approve Extension</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {maturitySettlementRows.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.investorName}>{r.investorName}</Text>
                  <View style={[styles.pill, styles.pillPending]}>
                    <Text style={[styles.pillText, styles.pillTextPending]}>Pending</Text>
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

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => superAdminRejectMaturitySettlement(r.id)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => superAdminApproveMaturitySettlement(r.id)}>
                    <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'Pre-Close Settlement' && (
          <>
            {precloseRows.length === 0 && (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No pre-close requests awaiting settlement.</Text>
              </View>
            )}
            {precloseRows.map(r => (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.investorName}>{r.investorName}</Text>
                  <View style={[styles.pill, styles.pillPending]}>
                    <Text style={[styles.pillText, styles.pillTextPending]}>Pending</Text>
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

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => superAdminRejectPreSettlement(r.id)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => superAdminApprovePreSettlement(r.id)}>
                    <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>DUE DATE</Text>
                  <Text style={styles.cardValueSm}>{row.dueDate}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>REFERENCE</Text>
                  <Text style={styles.cardValueSm}>{row.reference !== '–' ? row.reference : '—'}</Text>
                </View>
              </View>

              {status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(row)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(row)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}

              {status === 'Approved' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.markPaidBtn} onPress={() => handleMarkPaid(row)}>
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

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>DUE DATE</Text>
                <Text style={styles.modalValue}>{receiptRow?.dueDate}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>REFERENCE</Text>
                <Text style={styles.modalValue}>{receiptRow?.reference !== '–' ? receiptRow?.reference : '—'}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
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

      <SuperAdminBottomTabBar navigation={navigation} active="Notifications" />
    </SafeAreaView>
  );
};

export default PaymentQueueScreen;