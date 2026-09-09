import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {styles} from '../../styles/admin/InterestPayoutsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';
import {
  getMonthlyInterest,
  sendMonthlyInterestForApproval,
  sendAllMonthlyInterestForApproval,
  getErrorMessage,
  MonthlyInterestRecord,
  PayoutStatus,
  formatDate,
  toISODate,
} from '../../services/admin/monthlyInterestService';
import {useAppData} from '../../navigation/AppNavigator';

/* ============================================================
   FORMATTING & DATE HELPERS
   ============================================================ */

const formatINR = (n: number) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

const parseDueDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr === '—' || dateStr === '-') return null;
  const parts = dateStr.split(/[-/]/).map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) {
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // Support YYYY-MM-DD or DD-MM-YYYY
  if (parts[0] > 1000) {
    const [y, m, d] = parts;
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  const [d, m, y] = parts;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CAL_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
};

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
  payouts: MonthlyInterestRecord[];
  total: number;
};

type TabKey = 'All' | 'Pending' | 'Approved' | 'Rejected';
const STATUS_TABS: TabKey[] = ['All', 'Pending', 'Approved', 'Rejected'];

const matchesStatusTab = (p: MonthlyInterestRecord, tab: TabKey): boolean => {
  if (tab === 'All') return true;
  if (tab === 'Pending') {
    return (
      p.status === 'Pending' ||
      p.status === 'Awaiting Approval'
    );
  }
  if (tab === 'Approved') {
    return p.status === 'Approved' || p.status === 'Paid';
  }
  if (tab === 'Rejected') {
    return p.status === 'Rejected';
  }
  return true;
};

/* ============================================================
   COMPONENT
   ============================================================ */

const InterestPayoutsScreen = ({navigation}: any) => {
  const appData = useAppData();

  const [records, setRecords] = useState<MonthlyInterestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>('All');
  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

  // Calendar Picker Modal state
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calViewYear, setCalViewYear] = useState(() => new Date().getFullYear());
  const [calViewMonth, setCalViewMonth] = useState(() => new Date().getMonth());

  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [confirmingPayout, setConfirmingPayout] =
    useState<MonthlyInterestRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync calendar picker month/year when modal opens
  useEffect(() => {
    if (datePickerVisible) {
      if (dateFilter) {
        const dt = parseDueDate(dateFilter);
        if (dt) {
          setCalViewYear(dt.getFullYear());
          setCalViewMonth(dt.getMonth());
          return;
        }
      }
      const now = new Date();
      setCalViewYear(now.getFullYear());
      setCalViewMonth(now.getMonth());
    }
  }, [datePickerVisible, dateFilter]);

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const selectedIso = useMemo(() => {
    return dateFilter ? toISODate(dateFilter) : '';
  }, [dateFilter]);

  const calendarGridDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calViewYear, calViewMonth);
    const firstDayIndex = getFirstDayOfMonth(calViewYear, calViewMonth); // 0 = Sunday

    const prevMonthDays =
      calViewMonth === 0
        ? getDaysInMonth(calViewYear - 1, 11)
        : getDaysInMonth(calViewYear, calViewMonth - 1);

    const cells: {day: number; isCurrentMonth: boolean; iso: string}[] = [];

    // Prev month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = calViewMonth === 0 ? 12 : calViewMonth;
      const y = calViewMonth === 0 ? calViewYear - 1 : calViewYear;
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({day: d, isCurrentMonth: false, iso});
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const m = calViewMonth + 1;
      const iso = `${calViewYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({day: d, isCurrentMonth: true, iso});
    }

    // Next month leading days to complete grid to multiple of 7
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = calViewMonth === 11 ? 1 : calViewMonth + 2;
      const y = calViewMonth === 11 ? calViewYear + 1 : calViewYear;
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({day: d, isCurrentMonth: false, iso});
    }

    return cells;
  }, [calViewYear, calViewMonth]);

  const handlePrevMonth = () => {
    if (calViewMonth === 0) {
      setCalViewYear(prev => prev - 1);
      setCalViewMonth(11);
    } else {
      setCalViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calViewMonth === 11) {
      setCalViewYear(prev => prev + 1);
      setCalViewMonth(0);
    } else {
      setCalViewMonth(prev => prev + 1);
    }
  };

  const handleSelectCalendarDate = (iso: string) => {
    setDateFilter(iso);
    setDatePickerVisible(false);
  };

  /* ==========================================================
     LOAD DATA FROM BACKEND
     ========================================================== */

  const loadData = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) setLoading(true);
        else setRefreshing(true);

        const response = await getMonthlyInterest({
          limit: 100,
          offset: 0,
        });

        if (Array.isArray(response?.records)) {
          setRecords(response.records);
        } else {
          setRecords([]);
        }
      } catch (error: any) {
        console.log('Error loading monthly interest from backend:', error);
        setRecords([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  /* ==========================================================
     FILTERING & SUMMARY METRICS (Matching Web Exactly)
     ========================================================== */

  const dateFiltered = useMemo(() => {
    const d = dateFilter.trim();
    if (!d) return records;
    const filterIso = toISODate(d);
    return records.filter(p => {
      if (!p.dueDate) return false;
      const rowIso = toISODate(p.dueDate);
      return (filterIso && rowIso === filterIso) || p.dueDate.includes(d);
    });
  }, [records, dateFilter]);

  const searchFiltered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return dateFiltered;
    return dateFiltered.filter(
      p =>
        (p.investorName && p.investorName.toLowerCase().includes(q)) ||
        (p.investor && p.investor.toLowerCase().includes(q)) ||
        (p.bondId && p.bondId.toLowerCase().includes(q)),
    );
  }, [dateFiltered, query]);

  const tabFiltered = useMemo(() => {
    return searchFiltered.filter(p => matchesStatusTab(p, activeTab));
  }, [searchFiltered, activeTab]);

  const stats = useMemo(() => {
    let totalInterest = 0;
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    dateFiltered.forEach(p => {
      totalInterest += p.amount;
      if (
        p.status === 'Pending' ||
        p.status === 'Awaiting Approval'
      ) {
        pending += p.amount;
      } else if (p.status === 'Approved' || p.status === 'Paid') {
        approved += p.amount;
      } else if (p.status === 'Rejected') {
        rejected += p.amount;
      }
    });

    const totalGst = Math.round(totalInterest * 0.18);
    const netPayable = totalInterest - totalGst;

    return {
      totalInterest,
      pending,
      approved,
      rejected,
      netPayable,
    };
  }, [dateFiltered]);

  const needsApprovalCount = useMemo(() => {
    return dateFiltered.filter(p => p.status === 'Pending').length;
  }, [dateFiltered]);

  /* ==========================================================
     GROUP BY DUE DATE
     ========================================================== */

  const groups: DueDateGroup[] = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const byKey = new Map<string, MonthlyInterestRecord[]>();
    tabFiltered.forEach(p => {
      const list = byKey.get(p.dueDate) || [];
      list.push(p);
      byKey.set(p.dueDate, list);
    });

    const built: DueDateGroup[] = Array.from(byKey.entries()).map(
      ([key, list]) => {
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
      },
    );

    built.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return a.date.getTime() - b.date.getTime();
    });

    return built;
  }, [tabFiltered]);

  /* ==========================================================
     ACTION HANDLERS
     ========================================================== */

  const handleOpenConfirm = (p: MonthlyInterestRecord) => {
    setConfirmingPayout(p);
  };

  const handleConfirmSendForApproval = async () => {
    if (!confirmingPayout) return;
    const p = confirmingPayout;

    const scheduleId = p.interestScheduleId || Number(p.id);
    if (!scheduleId) {
      Alert.alert(
        'Action Error',
        'Unable to identify interest schedule ID for this payout.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setActionLoadingId(p.id);

      await sendMonthlyInterestForApproval(scheduleId);

      if (appData?.requestPayoutApproval) {
        appData.requestPayoutApproval(String(p.id));
      }

      setConfirmingPayout(null);
      setActiveTab('Pending');
      await loadData(false);

      Alert.alert(
        'Sent for Approval',
        `Monthly interest payout of ${formatINR(
          p.amount,
        )} for ${p.investorName || p.investor} (${p.bondId}) has been sent to Super Admin for approval.`,
      );
    } catch (error: any) {
      console.log('Send for approval error:', error);
      Alert.alert('Action Failed', getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setActionLoadingId(null);
    }
  };

  const handleBulkAction = () => {
    if (needsApprovalCount === 0) return;

    Alert.alert(
      'Send All for Approval',
      `Send ${needsApprovalCount} pending payout${
        needsApprovalCount === 1 ? '' : 's'
      } to Super Admin for approval?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send All',
          onPress: async () => {
            try {
              setLoading(true);
              const isoDate = dateFilter.trim() ? toISODate(dateFilter.trim()) : undefined;
              await sendAllMonthlyInterestForApproval(isoDate);

              if (appData?.requestAllPayoutsApproval) {
                appData.requestAllPayoutsApproval();
              }

              setActiveTab('Pending');
              await loadData(false);
              Alert.alert(
                'Success',
                `${needsApprovalCount} payouts sent to Super Admin for approval.`,
              );
            } catch (error: any) {
              Alert.alert('Bulk Action Failed', getErrorMessage(error));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const bulkBtnLabel =
    needsApprovalCount > 0
      ? `Send All for Approval (${needsApprovalCount})`
      : 'All Sent for Approval';
  const bulkBtnDisabled = needsApprovalCount === 0;

  /* ==========================================================
     STATUS PILL (Matching Web Badges)
     ========================================================== */

  const StatusPill = ({p}: {p: MonthlyInterestRecord}) => {
    if (p.status === 'Paid') {
      return (
        <View style={[local.pill, local.pillPaid]}>
          <Text style={[local.pillText, local.pillTextPaid]}>Paid</Text>
        </View>
      );
    }
    if (p.status === 'Approved') {
      return (
        <View style={[local.pill, local.pillApproved]}>
          <Text style={[local.pillText, local.pillTextApproved]}>Approved</Text>
        </View>
      );
    }
    if (p.status === 'Awaiting Approval') {
      return (
        <View style={[local.pill, local.pillAwaiting]}>
          <Text style={[local.pillText, local.pillTextAwaiting]}>
            Awaiting Approval
          </Text>
        </View>
      );
    }
    if (p.status === 'Rejected') {
      return (
        <View style={[local.pill, local.pillRejected]}>
          <Text style={[local.pillText, local.pillTextRejected]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[local.pill, local.pillPending]}>
        <Text style={[local.pillText, local.pillTextPending]}>Pending</Text>
      </View>
    );
  };

  /* ==========================================================
     ROW ACTIONS (Matching Web Exactly)
     ========================================================== */

  const RowAction = ({p}: {p: MonthlyInterestRecord}) => {
    const isLoading = actionLoadingId === p.id;

    if (p.status === 'Pending') {
      return (
        <TouchableOpacity
          disabled={isLoading}
          style={[local.sendApprovalBtn, isLoading && local.disabledBtn]}
          onPress={() => handleOpenConfirm(p)}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={local.sendApprovalBtnText}>Send for Approval</Text>
          )}
        </TouchableOpacity>
      );
    }

    if (p.status === 'Awaiting Approval') {
      return (
        <View style={local.waitingPillWrap}>
          <Text style={local.waitingPillText}>
            Waiting for Super Admin Approval
          </Text>
        </View>
      );
    }

    if (p.status === 'Approved') {
      return (
        <View style={[local.pill, local.pillApproved]}>
          <Text style={[local.pillText, local.pillTextApproved]}>✓ Approved</Text>
        </View>
      );
    }

    if (p.status === 'Rejected') {
      return (
        <View style={[local.pill, local.pillRejected]}>
          <Text style={[local.pillText, local.pillTextRejected]}>✕ Rejected</Text>
        </View>
      );
    }

    if (p.status === 'Paid') {
      return (
        <View style={[local.pill, local.pillPaid]}>
          <Text style={[local.pillText, local.pillTextPaid]}>✓ Paid</Text>
        </View>
      );
    }

    return null;
  };

  /* ==========================================================
     ROW RENDER
     ========================================================== */

  const renderRow = (p: MonthlyInterestRecord) => {
    return (
      <View key={p.id || `${p.bondId}-${p.dueDate}`} style={local.row}>
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
            <Text style={local.rowValue}>{formatINR(p.amount)}</Text>
          </View>
        </View>

        <View style={local.rowGrid}>
          <View style={local.rowCol}>
            <Text style={local.rowLabel}>GST (18%)</Text>
            <Text style={local.rowValueRed}>-{formatINR(p.gstAmount)}</Text>
          </View>
          <View style={local.rowCol}>
            <Text style={local.rowLabel}>NET PAYABLE</Text>
            <Text style={local.rowValueGreen}>{formatINR(p.netPayable)}</Text>
          </View>
        </View>

        <View style={local.rowGrid}>
          <View style={local.rowCol}>
            <Text style={local.rowLabel}>DUE DATE</Text>
            <Text style={local.rowValue}>{formatDate(p.dueDate)}</Text>
          </View>
        </View>

        {p.reference && p.reference !== '–' && p.reference !== '-' ? (
          <Text style={local.refText}>Ref: {p.reference}</Text>
        ) : null}

        <View style={local.rowActionRow}>
          <RowAction p={p} />
        </View>
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
        <Text style={styles.title}>Monthly Interest</Text>
        <Text style={styles.subtitle}>
          Investments with interest payments due — grouped by due date
        </Text>

        {/* ----------------- SUMMARY CARDS ----------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={local.metricsScroll}
          contentContainerStyle={local.metricsContainer}>
          <View style={[local.metricCard, local.metricCardNavy]}>
            <Text style={local.metricLabelLight}>TOTAL INTEREST</Text>
            <Text style={local.metricValueLight}>
              {formatINR(stats.totalInterest)}
            </Text>
          </View>

          <View style={[local.metricCard, local.metricCardAmber]}>
            <Text style={local.metricLabelAmber}>PENDING</Text>
            <Text style={local.metricValueAmber}>
              {formatINR(stats.pending)}
            </Text>
          </View>

          <View style={[local.metricCard, local.metricCardGreen]}>
            <Text style={local.metricLabelGreen}>APPROVED</Text>
            <Text style={local.metricValueGreen}>
              {formatINR(stats.approved)}
            </Text>
          </View>

          <View style={[local.metricCard, local.metricCardRed]}>
            <Text style={local.metricLabelRed}>REJECTED</Text>
            <Text style={local.metricValueRed}>
              {formatINR(stats.rejected)}
            </Text>
          </View>

          <View style={[local.metricCard, local.metricCardBlue]}>
            <Text style={local.metricLabelBlue}>NET PAYABLE</Text>
            <Text style={local.metricValueBlue}>
              {formatINR(stats.netPayable)}
            </Text>
          </View>
        </ScrollView>

        {/* ----------------- BULK ACTION CARD ----------------- */}
        <View style={styles.pendingCard}>
          <View style={styles.pendingTopRow}>
            <Text style={styles.pendingLabel}>TOTAL PENDING INTEREST</Text>
            <View style={styles.processingBadge}>
              <Text style={styles.processingBadgeText}>Processing</Text>
            </View>
          </View>
          <Text style={styles.pendingValue}>{formatINR(stats.pending)}</Text>
          <TouchableOpacity
            style={[
              styles.markAllBtn,
              bulkBtnDisabled && styles.markAllBtnDisabled,
            ]}
            disabled={bulkBtnDisabled}
            onPress={handleBulkAction}>
            <Text style={styles.markAllBtnText}>{bulkBtnLabel}</Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- STATUS TABS ----------------- */}
        <View style={local.tabBarRow}>
          {STATUS_TABS.map(tab => {
            const isActive = activeTab === tab;
            let count = 0;
            if (tab === 'All') count = dateFiltered.length;
            else count = dateFiltered.filter(p => matchesStatusTab(p, tab)).length;

            return (
              <TouchableOpacity
                key={tab}
                style={[local.tabBtn, isActive && local.tabBtnActive]}
                onPress={() => setActiveTab(tab)}>
                <Text
                  style={[local.tabBtnText, isActive && local.tabBtnTextActive]}>
                  {tab}
                </Text>
                <View
                  style={[
                    local.tabBadge,
                    isActive ? local.tabBadgeActive : local.tabBadgeInactive,
                  ]}>
                  <Text
                    style={[
                      local.tabBadgeText,
                      isActive
                        ? local.tabBadgeTextActive
                        : local.tabBadgeTextInactive,
                    ]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ----------------- SEARCH & DATE FILTER ----------------- */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search investor or Bond ID"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={local.dateFilterRow}>
          <TouchableOpacity
            style={local.dateFilterBtn}
            activeOpacity={0.7}
            onPress={() => setDatePickerVisible(true)}>
            <Text style={local.dateFilterIcon}>📅</Text>
            <Text
              style={[
                local.dateFilterText,
                !dateFilter && local.dateFilterPlaceholder,
              ]}>
              {dateFilter ? formatDate(dateFilter) : 'Filter by due date'}
            </Text>
          </TouchableOpacity>
          {dateFilter.length > 0 && (
            <TouchableOpacity
              style={local.dateFilterClear}
              onPress={() => setDateFilter('')}>
              <Text style={local.dateFilterClearText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ----------------- LOADER / LISTING ----------------- */}
        {loading ? (
          <View style={local.loadingWrap}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={local.loadingText}>Loading monthly interest payouts...</Text>
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {dateFilter.trim()
                ? `No interest payments found for ${formatDate(dateFilter.trim())}.`
                : 'No interest payments found.'}
            </Text>
          </View>
        ) : (
          groups.map(group => (
            <View key={group.key} style={local.groupBlock}>
              <View style={local.groupHeadingRow}>
                <Text style={local.groupHeading}>
                  {group.date
                    ? formatGroupHeading(group.date, new Date())
                    : formatDate(group.key)}
                </Text>
                {group.isToday && (
                  <View style={local.dueTodayBadge}>
                    <Text style={local.dueTodayBadgeText}>Due Today</Text>
                  </View>
                )}
              </View>
              <Text style={local.groupSubheading}>
                {group.payouts.length} payment
                {group.payouts.length === 1 ? '' : 's'} ·{' '}
                {formatINR(group.total)} total
              </Text>

              {group.payouts.map(renderRow)}
            </View>
          ))
        )}

        <Text style={styles.securityText}>
          🛡 Security standard PCI-DSS Level 1 compliant
        </Text>
      </ScrollView>

      {/* ======================================================
          CALENDAR DATE PICKER MODAL (Matching Web)
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={datePickerVisible}
        onRequestClose={() => setDatePickerVisible(false)}>
        <TouchableOpacity
          style={local.calModalOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}>
          <TouchableOpacity
            activeOpacity={1}
            style={local.calCard}
            onPress={e => e.stopPropagation()}>
            {/* Header: Month & Year + Controls */}
            <View style={local.calHeader}>
              <Text style={local.calMonthYearText}>
                {CAL_MONTH_NAMES[calViewMonth]}, {calViewYear}
              </Text>
              <View style={local.calNavBtnRow}>
                <TouchableOpacity
                  style={local.calNavBtn}
                  onPress={handlePrevMonth}>
                  <Text style={local.calNavBtnText}>▲</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={local.calNavBtn}
                  onPress={handleNextMonth}>
                  <Text style={local.calNavBtnText}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekday Headers */}
            <View style={local.calWeekRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <View key={day} style={local.calWeekDayCol}>
                  <Text style={local.calWeekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Days Grid */}
            <View style={local.calDaysGrid}>
              {calendarGridDays.map((cell, idx) => {
                const isSelected = cell.iso === selectedIso;
                const isToday = cell.iso === todayIso;

                return (
                  <TouchableOpacity
                    key={`${cell.iso}-${idx}`}
                    style={[
                      local.calDayCell,
                      isSelected && local.calDayCellSelected,
                    ]}
                    onPress={() => handleSelectCalendarDate(cell.iso)}>
                    <Text
                      style={[
                        local.calDayText,
                        !cell.isCurrentMonth && local.calDayTextDimmed,
                        isToday && !isSelected && local.calDayTextToday,
                        isSelected && local.calDayTextSelected,
                      ]}>
                      {cell.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer Actions */}
            <View style={local.calFooter}>
              <TouchableOpacity
                style={local.calFooterBtn}
                onPress={() => {
                  setDateFilter('');
                  setDatePickerVisible(false);
                }}>
                <Text style={local.calClearText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={local.calFooterBtn}
                onPress={() => handleSelectCalendarDate(todayIso)}>
                <Text style={local.calTodayText}>Today</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================
          CONFIRM SEND FOR APPROVAL MODAL
          ====================================================== */}
      <Modal
        transparent
        animationType="fade"
        visible={!!confirmingPayout}
        onRequestClose={() => setConfirmingPayout(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {confirmingPayout && (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>
                    Confirm Send for Approval
                  </Text>
                  <TouchableOpacity
                    onPress={() => setConfirmingPayout(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={local.modalSubtitle}>
                  Please review the payout details before sending to Super Admin for approval:
                </Text>

                <View style={local.confirmDetailsCard}>
                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Investor</Text>
                    <Text style={local.confirmValue}>
                      {confirmingPayout.investorName}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Bond Number</Text>
                    <Text style={local.confirmValueBlue}>
                      {confirmingPayout.bondId}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Monthly Interest</Text>
                    <Text style={local.confirmValue}>
                      {formatINR(confirmingPayout.amount)}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>GST (18%)</Text>
                    <Text style={local.confirmValueRed}>
                      -{formatINR(confirmingPayout.gstAmount)}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Net Payable</Text>
                    <Text style={local.confirmValueGreen}>
                      {formatINR(confirmingPayout.netPayable)}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Due Date</Text>
                    <Text style={local.confirmValue}>
                      {formatDate(confirmingPayout.dueDate)}
                    </Text>
                  </View>

                  <View style={local.confirmRow}>
                    <Text style={local.confirmLabel}>Current Status</Text>
                    <Text style={local.confirmValueAmber}>
                      {confirmingPayout.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={local.modalBtnRow}>
                  <TouchableOpacity
                    style={local.modalCancelBtn}
                    disabled={isSubmitting}
                    onPress={() => setConfirmingPayout(null)}>
                    <Text style={local.modalCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      local.modalSubmitBtn,
                      isSubmitting && local.disabledBtn,
                    ]}
                    disabled={isSubmitting}
                    onPress={handleConfirmSendForApproval}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={local.modalSubmitBtnText}>
                        Send for Approval
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <AdminBottomTabBar active="Payments" navigation={navigation} />
    </SafeAreaView>
  );
};

/* ============================================================
   LOCAL STYLES
   ============================================================ */

const local = StyleSheet.create({
  metricsScroll: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 4,
    alignItems: 'center',
  },
  metricCard: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 135,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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

  tabBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabBtnTextActive: {
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

  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dateFilterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  dateFilterIcon: {
    fontSize: 16,
  },
  dateFilterText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#111827',
  },
  dateFilterPlaceholder: {
    fontWeight: '400',
    color: '#9CA3AF',
  },
  dateFilterClear: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  dateFilterClearText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#DC2626',
  },

  /* Calendar Modal */
  calModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  calMonthYearText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  calNavBtnRow: {
    flexDirection: 'row',
    gap: 6,
  },
  calNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavBtnText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '700',
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calWeekDayCol: {
    flex: 1,
    alignItems: 'center',
  },
  calWeekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    marginVertical: 2,
  },
  calDayCellSelected: {
    backgroundColor: '#2563EB',
  },
  calDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  calDayTextDimmed: {
    color: '#D1D5DB',
    fontWeight: '400',
  },
  calDayTextToday: {
    color: '#2563EB',
    fontWeight: '800',
  },
  calDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 4,
  },
  calFooterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  calClearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  calTodayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
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

  groupBlock: {
    marginBottom: 20,
  },
  groupHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupHeading: {
    fontSize: 15.5,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  rowTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  investorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  rowGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  rowCol: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 10.5,
    color: '#6B7280',
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  rowValueBlue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
  rowValueRed: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 2,
  },
  rowValueGreen: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  refText: {
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 10,
  },
  rowActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  sendApprovalBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendApprovalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  waitingPillWrap: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  waitingPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  markPaidBtn: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  resendBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.6,
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
  pillPending: {backgroundColor: '#FEF3C7'},
  pillTextPending: {color: '#D97706'},
  pillAwaiting: {backgroundColor: '#FEF3C7'},
  pillTextAwaiting: {color: '#B45309'},
  pillApproved: {backgroundColor: '#DCFCE7'},
  pillTextApproved: {color: '#16A34A'},
  pillPaid: {backgroundColor: '#E5E7EB'},
  pillTextPaid: {color: '#4B5563'},
  pillRejected: {backgroundColor: '#FEE2E2'},
  pillTextRejected: {color: '#DC2626'},
  pillOverdue: {backgroundColor: '#FEE2E2'},
  pillTextOverdue: {color: '#DC2626'},

  /* Modal */
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
  confirmDetailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  confirmValueBlue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  confirmValueRed: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  confirmValueGreen: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  confirmValueAmber: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#D97706',
  },

  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#374151',
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default InterestPayoutsScreen;