import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import {useAppData, Payout} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InterestPayoutsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN', {minimumFractionDigits: 2});
const formatINRWhole = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Due-date grouping
// Payout.dueDate is stored as dd-mm-yyyy (see formatDDMMYYYY in
// AppNavigator). These helpers mirror that exact format so "today" and
// group ordering agree with the rest of the app.
// ---------------------------------------------------------------------------
const parseDueDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null;
  const [d, m, y] = parts;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatGroupHeading = (dt: Date, today: Date) => {
  const day = String(dt.getDate()).padStart(2, '0');
  const label = `${day} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  return isSameDay(dt, today) ? `Today — ${label}` : label;
};

type DueDateGroup = {
  key: string;
  date: Date | null;
  isToday: boolean;
  isOverdue: boolean;
  payouts: Payout[];
  total: number;
};

const InterestPayoutsScreen = ({navigation}: any) => {
  const {payouts, markPayoutPaid, markAllPayoutsPaid, requestPayoutApproval, requestAllPayoutsApproval} = useAppData();
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // dd-mm-yyyy, optional

  const filtered = payouts.filter(
    p =>
      p.investorName.toLowerCase().includes(query.toLowerCase()) ||
      p.bondId.toLowerCase().includes(query.toLowerCase()),
  );

  const dateFiltered = dateFilter.trim()
    ? filtered.filter(p => p.dueDate === dateFilter.trim())
    : filtered;

  const totalPending = payouts
    .filter(p => p.status !== 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const needsApprovalCount = payouts.filter(p => p.status === 'overdue' || p.status === 'upcoming').length;
  const approvedCount = payouts.filter(p => p.status === 'approved').length;

  // ---------------------------------------------------------------------
  // Group by due date (matches web's "Today — DD Mon YYYY" / "DD Mon
  // YYYY" sections), sorted chronologically. Paid entries are still
  // included in their due-date group so the date view stays complete —
  // their row just shows a "Paid" state instead of an action button.
  // ---------------------------------------------------------------------
  const groups: DueDateGroup[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const byKey = new Map<string, Payout[]>();
    dateFiltered.forEach(p => {
      const list = byKey.get(p.dueDate) || [];
      list.push(p);
      byKey.set(p.dueDate, list);
    });

    const built: DueDateGroup[] = Array.from(byKey.entries()).map(([key, list]) => {
      const dt = parseDueDate(key);
      const isToday = dt ? isSameDay(dt, today) : false;
      const isOverdue = dt ? dt.getTime() < today.getTime() : false;
      return {
        key,
        date: dt,
        isToday,
        isOverdue,
        payouts: list,
        total: list.reduce((sum, p) => sum + p.amount, 0),
      };
    });

    built.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    });

    return built;
  }, [dateFiltered]);

  const confirmSendForApproval = (p: Payout) => {
    Alert.alert(
      'Send for approval',
      `Send ${formatINR(p.amount)} payout for ${p.investorName} (${p.bondId}) to Super Admin for approval?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Send', onPress: () => requestPayoutApproval(p.id)},
      ],
    );
  };

  const confirmMarkPaid = (p: Payout) => {
    Alert.alert(
      'Mark as paid',
      `Mark ${formatINR(p.amount)} for ${p.investorName} (${p.bondId}) as paid?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: () => markPayoutPaid(p.id)},
      ],
    );
  };

  const confirmResendApproval = (p: Payout) => {
    Alert.alert(
      'Resend for approval',
      `Resend ${formatINR(p.amount)} payout for ${p.investorName} (${p.bondId}) to Super Admin?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Resend', onPress: () => requestPayoutApproval(p.id)},
      ],
    );
  };

  const handleBulkAction = () => {
    if (needsApprovalCount > 0) {
      Alert.alert(
        'Approve all pending',
        `Send ${needsApprovalCount} pending payout${needsApprovalCount === 1 ? '' : 's'} to Super Admin for approval?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Send', onPress: requestAllPayoutsApproval},
        ],
      );
      return;
    }
    if (approvedCount > 0) {
      Alert.alert('Mark all paid', `Mark all ${approvedCount} approved payouts as paid?`, [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Confirm', onPress: markAllPayoutsPaid},
      ]);
    }
  };

  const bulkBtnLabel =
    needsApprovalCount > 0 ? 'Approve All Pending' : approvedCount > 0 ? 'Mark All Paid' : 'All Settled';
  const bulkBtnDisabled = needsApprovalCount === 0 && approvedCount === 0;

  // Small status pill shown per row (mirrors web's "Pending" chip, plus
  // the extra states this app already tracks).
  const StatusPill = ({p}: {p: Payout}) => {
    if (p.status === 'paid') {
      return (
        <View style={[local.pill, local.pillPaid]}>
          <Text style={[local.pillText, local.pillTextPaid]}>Paid</Text>
        </View>
      );
    }
    if (p.status === 'approved') {
      return (
        <View style={[local.pill, local.pillApproved]}>
          <Text style={[local.pillText, local.pillTextApproved]}>Approved</Text>
        </View>
      );
    }
    if (p.status === 'pending_approval') {
      return (
        <View style={[local.pill, local.pillPending]}>
          <Text style={[local.pillText, local.pillTextPending]}>Pending</Text>
        </View>
      );
    }
    if (p.status === 'rejected') {
      return (
        <View style={[local.pill, local.pillRejected]}>
          <Text style={[local.pillText, local.pillTextRejected]}>Rejected</Text>
        </View>
      );
    }
    if (p.status === 'overdue') {
      return (
        <View style={[local.pill, local.pillOverdue]}>
          <Text style={[local.pillText, local.pillTextOverdue]}>
            Overdue{p.overdueDays ? ` ${p.overdueDays}d` : ''}
          </Text>
        </View>
      );
    }
    return (
      <View style={[local.pill, local.pillPending]}>
        <Text style={[local.pillText, local.pillTextPending]}>Pending</Text>
      </View>
    );
  };

  // Action button per row — SAME functions as before, just restyled to
  // match the web's icon-button look.
  const RowAction = ({p}: {p: Payout}) => {
    if (p.status === 'overdue' || p.status === 'upcoming') {
      return (
        <TouchableOpacity style={local.approveBtn} onPress={() => confirmSendForApproval(p)}>
          <Text style={local.approveBtnText}>✓  Approve</Text>
        </TouchableOpacity>
      );
    }
    if (p.status === 'pending_approval') {
      return <Text style={styles.waitingText}>Waiting for Super Admin</Text>;
    }
    if (p.status === 'approved') {
      return (
        <TouchableOpacity style={local.markPaidBtn} onPress={() => confirmMarkPaid(p)}>
          <Text style={local.markPaidBtnText}>Mark as Paid</Text>
        </TouchableOpacity>
      );
    }
    if (p.status === 'rejected') {
      return (
        <TouchableOpacity style={local.resendBtn} onPress={() => confirmResendApproval(p)}>
          <Text style={local.resendBtnText}>Resend for Approval</Text>
        </TouchableOpacity>
      );
    }
    // paid
    return <Text style={styles.doneText}>✓ Done</Text>;
  };

const renderRow = (p: Payout) => {
  // Display-only computation — GST/Net Payable are derived from the
  // existing p.amount for presentation, matching the web Admin Portal's
  // "GST (18%)" / "NET PAYABLE" columns. Nothing here touches state or
  // any existing payout logic.
  const gstAmount = Math.round(p.amount * 0.18);
  const netPayable = p.amount - gstAmount;

  return (
    <View key={p.id} style={local.row}>
      <View style={local.rowTopLine}>
        <Text style={local.investorName}>{p.investorName}</Text>
        <StatusPill p={p} />
      </View>
      <View style={local.rowGrid}>
        <View style={local.rowCol}>
          <Text style={local.rowLabel}>BOND NUMBER</Text>
          <Text style={local.rowValueBlue}>{p.bondId}</Text>
        </View>
        <View style={local.rowCol}>
          <Text style={local.rowLabel}>MONTHLY INTEREST</Text>
          <Text style={local.rowValue}>{formatINRWhole(p.amount)}</Text>
        </View>
      </View>
      <View style={local.rowGrid}>
        <View style={local.rowCol}>
          <Text style={local.rowLabel}>GST (18%)</Text>
          <Text style={local.rowValueRed}>-{formatINRWhole(gstAmount)}</Text>
        </View>
        <View style={local.rowCol}>
          <Text style={local.rowLabel}>NET PAYABLE</Text>
          <Text style={local.rowValueGreen}>{formatINRWhole(netPayable)}</Text>
        </View>
      </View>
      <View style={local.rowGrid}>
        <View style={local.rowCol}>
          <Text style={local.rowLabel}>DUE DATE</Text>
          <Text style={local.rowValue}>{p.dueDate}</Text>
        </View>
      </View>
      {p.reference !== '–' && <Text style={local.refText}>Ref: {p.reference}</Text>}
      <View style={local.rowActionRow}>
        <RowAction p={p} />
      </View>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.safeArea}>
    <AppHeader subtitle="Admin Portal" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Monthly Interest</Text>
        <Text style={styles.subtitle}>Investments with interest payments due — grouped by due date</Text>

        <View style={styles.pendingCard}>
          <View style={styles.pendingTopRow}>
            <Text style={styles.pendingLabel}>TOTAL PENDING</Text>
            <View style={styles.processingBadge}>
              <Text style={styles.processingBadgeText}>Processing</Text>
            </View>
          </View>
          <Text style={styles.pendingValue}>{formatINR(totalPending)}</Text>
          <TouchableOpacity
            style={[styles.markAllBtn, bulkBtnDisabled && styles.markAllBtnDisabled]}
            disabled={bulkBtnDisabled}
            onPress={handleBulkAction}>
            <Text style={styles.markAllBtnText}>{bulkBtnLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search investor or Bond ID"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.filterBtn}>
            <Text>⇅</Text>
          </View>
        </View>

        {/* NEW: date filter — matches web's dd-mm-yyyy filter field. Empty
            means "show every group", same as no filter applied. */}
        <View style={local.dateFilterRow}>
          <TextInput
            style={local.dateFilterInput}
            placeholder="dd-mm-yyyy"
            placeholderTextColor="#9CA3AF"
            value={dateFilter}
            onChangeText={setDateFilter}
          />
          {dateFilter.length > 0 && (
            <TouchableOpacity style={local.dateFilterClear} onPress={() => setDateFilter('')}>
              <Text style={local.dateFilterClearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {groups.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No payouts found</Text>
          </View>
        )}

        {groups.map(group => (
          <View key={group.key} style={local.groupBlock}>
            <View style={local.groupHeadingRow}>
              <Text style={local.groupHeading}>
                {group.date ? formatGroupHeading(group.date, new Date()) : group.key}
              </Text>
              {group.isToday && (
                <View style={local.dueTodayBadge}>
                  <Text style={local.dueTodayBadgeText}>Due Today</Text>
                </View>
              )}
            </View>
            <Text style={local.groupSubheading}>
              {group.payouts.length} payment{group.payouts.length === 1 ? '' : 's'} · {formatINRWhole(group.total)} total
            </Text>

            {group.payouts.map(renderRow)}
          </View>
        ))}

        <Text style={styles.securityText}>🛡  Security standard PCI-DSS Level 1 compliant</Text>
      </ScrollView>

     
<AdminBottomTabBar
  active="Payments"
  navigation={navigation}
/>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Local styles — new date-group layout pieces not present in the shared
// InterestPayoutsScreen.styles.ts sheet. Anything already covered by that
// sheet (header, pendingCard, searchRow, waitingText, doneText,
// emptyWrap/emptyText, securityText) is reused as-is above.
// ---------------------------------------------------------------------------
const local = StyleSheet.create({
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  dateFilterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  dateFilterClear: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateFilterClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  groupBlock: {
    marginTop: 20,
  },
  groupHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1E45',
  },
  dueTodayBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueTodayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  groupSubheading: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 10,
  },
  row: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  investorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  rowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 10,
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  rowValueBlue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
    rowValueRed: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  rowValueGreen: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  refText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  rowActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  approveBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  markPaidBtn: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  markPaidBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resendBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  resendBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pillPending: {backgroundColor: '#FEF3C7'},
  pillTextPending: {color: '#D97706'},
  pillApproved: {backgroundColor: '#DCFCE7'},
  pillTextApproved: {color: '#16A34A'},
  pillPaid: {backgroundColor: '#E5E7EB'},
  pillTextPaid: {color: '#6B7280'},
  pillRejected: {backgroundColor: '#FEE2E2'},
  pillTextRejected: {color: '#DC2626'},
  pillOverdue: {backgroundColor: '#FEE2E2'},
  pillTextOverdue: {color: '#DC2626'},
});

export default InterestPayoutsScreen;