import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Modal} from 'react-native';
import {styles} from '../../styles/superadmin/PaymentQueueScreen.styles';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';

type PaymentType = 'Monthly Interest' | 'Tenure Settlement' | 'Pre-Close Settlement';
type PaymentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid';
type TabKey = 'All' | PaymentType;

interface PaymentRow {
  id: string;
  investor: string;
  bond: string;
  paymentType: PaymentType;
  amount: string;
  requestedBy: string;
  approvedBy: string;
  date: string;
  status: PaymentStatus;
}

// STATIC SEED DATA — this becomes the screen's local state below, so
// Approve/Reject/Mark Paid actually change status on screen.
const SEED_PAYMENTS: PaymentRow[] = [
  {id: '1', investor: 'Arjun Sharma', bond: 'BND-2025-001', paymentType: 'Monthly Interest', amount: '₹15,000', requestedBy: 'Ravi Mehta', approvedBy: 'Ravi Mehta', date: '05 Aug 2026', status: 'Rejected'},
  {id: '2', investor: 'Neha Gupta', bond: 'BND-2025-003', paymentType: 'Monthly Interest', amount: '₹18,000', requestedBy: 'Anita Rao', approvedBy: 'Anita Rao', date: '05 Aug 2026', status: 'Approved'},
  {id: '3', investor: 'Sunita Verma', bond: 'BND-2025-008', paymentType: 'Monthly Interest', amount: '₹4,500', requestedBy: 'Mohan Das', approvedBy: 'Mohan Das', date: '02 Aug 2026', status: 'Paid'},
  {id: '4', investor: 'Rahul Kumar', bond: 'BND-2025-002', paymentType: 'Tenure Settlement', amount: '₹10,32,500', requestedBy: 'Anita Rao', approvedBy: 'Anita Rao', date: '04 Aug 2026', status: 'Pending'},
  {id: '5', investor: 'Arjun Sharma', bond: 'BND-2025-001', paymentType: 'Pre-Close Settlement', amount: '₹5,15,000', requestedBy: 'Ravi Mehta', approvedBy: 'Ravi Mehta', date: '03 Aug 2026', status: 'Approved'},
];

const TABS: TabKey[] = ['All', 'Monthly Interest', 'Tenure Settlement', 'Pre-Close Settlement'];

const statusStyleFor = (status: PaymentStatus) => {
  switch (status) {
    case 'Approved':
      return {pill: styles.pillApproved, text: styles.pillTextApproved};
    case 'Rejected':
      return {pill: styles.pillRejected, text: styles.pillTextRejected};
    case 'Paid':
      return {pill: styles.pillPaid, text: styles.pillTextPaid};
    case 'Pending':
    default:
      return {pill: styles.pillPending, text: styles.pillTextPending};
  }
};

const PaymentQueueScreen = ({navigation}: any) => {
  const [payments, setPayments] = useState<PaymentRow[]>(SEED_PAYMENTS);
  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [receiptRow, setReceiptRow] = useState<PaymentRow | null>(null);

  const rows =
    activeTab === 'All' ? payments : payments.filter(p => p.paymentType === activeTab);

  const pendingRows = payments.filter(p => p.status === 'Pending');
  const pendingTotal = pendingRows.reduce(
    (sum, p) => sum + Number(p.amount.replace(/[₹,]/g, '')),
    0,
  );

  // ---- Actions: Pending -> Approved/Rejected -> Paid -> Receipt ----
  const handleApprove = (id: string) => {
    setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Approved'} : p)));
  };

  const handleReject = (id: string) => {
    setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Rejected'} : p)));
  };

  const handleMarkPaid = (id: string) => {
    setPayments(prev => prev.map(p => (p.id === id ? {...p, status: 'Paid'} : p)));
  };

  const openReceipt = (row: PaymentRow) => setReceiptRow(row);
  const closeReceipt = () => setReceiptRow(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Payments" showBack={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Payment Queue</Text>
        <Text style={styles.subtitle}>Approved payment requests from all branch admins</Text>

        <View style={styles.pendingCard}>
          <Text style={styles.pendingLabel}>{pendingRows.length} PENDING</Text>
          <Text style={styles.pendingValue}>₹{pendingTotal.toLocaleString('en-IN')}</Text>
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

        {rows.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No payments in this category</Text>
          </View>
        )}

        {rows.map(row => {
          const statusStyle = statusStyleFor(row.status);
          return (
            <View key={row.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.investorName}>{row.investor}</Text>
                <View style={[styles.pill, statusStyle.pill]}>
                  <Text style={[styles.pillText, statusStyle.text]}>{row.status}</Text>
                </View>
              </View>

              <View style={styles.typePillRow}>
                <View style={styles.typePill}>
                  <Text style={styles.typePillText}>{row.paymentType}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>BOND</Text>
                  <Text style={styles.cardValueLink}>{row.bond}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>AMOUNT</Text>
                  <Text style={styles.cardValue}>{row.amount}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>REQUESTED BY</Text>
                  <Text style={styles.cardValueSm}>{row.requestedBy}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>DATE</Text>
                  <Text style={styles.cardValueSm}>{row.date}</Text>
                </View>
              </View>

              {/* Pending -> Approve / Reject */}
              {row.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(row.id)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(row.id)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Approved -> Mark Paid */}
              {row.status === 'Approved' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.markPaidBtn} onPress={() => handleMarkPaid(row.id)}>
                    <Text style={styles.markPaidBtnText}>Mark Paid</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Paid -> Receipt */}
              {row.status === 'Paid' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.receiptBtn} onPress={() => openReceipt(row)}>
                    <Text style={styles.receiptBtnText}>📄  Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Rejected -> no action, matches web */}
            </View>
          );
        })}
      </ScrollView>

      {/* Receipt popup — same fields as the web's eye-icon modal */}
      <Modal visible={!!receiptRow} transparent animationType="fade" onRequestClose={closeReceipt}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{receiptRow?.bond}</Text>
              <TouchableOpacity onPress={closeReceipt}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>INVESTOR</Text>
                <Text style={styles.modalValue}>{receiptRow?.investor}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>BOND</Text>
                <Text style={styles.modalValue}>{receiptRow?.bond}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>PAYMENT TYPE</Text>
                <View style={styles.modalTypePill}>
                  <Text style={styles.modalTypePillText}>{receiptRow?.paymentType}</Text>
                </View>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>AMOUNT</Text>
                <Text style={styles.modalValue}>{receiptRow?.amount}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>REQUESTED BY</Text>
                <Text style={styles.modalValue}>{receiptRow?.requestedBy}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>APPROVED BY ADMIN</Text>
                <Text style={styles.modalValue}>{receiptRow?.approvedBy}</Text>
              </View>
            </View>

            <View style={styles.modalGrid}>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>DATE</Text>
                <Text style={styles.modalValue}>{receiptRow?.date}</Text>
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.modalLabel}>STATUS</Text>
                <View style={styles.modalStatusPill}>
                  <Text style={styles.modalStatusPillText}>{receiptRow?.status}</Text>
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