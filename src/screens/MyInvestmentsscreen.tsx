import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

import BottomTabBar from '../components/BottomTabBar';
import AppHeader from '../components/AppHeader';
import {styles} from '../styles/MyInvestmentsScreen.styles';
import {
  investorService,
  ApiInvestment,
} from '../services/investorService';
import {validation} from '../utils/validation';

type BondStatus =
  | 'Active'
  | 'Extension Requested'
  | 'Pre-Close Requested'
  | 'Pending Approval'
  | 'Pending Extension'
  | 'Pending Settlement'
  | 'Settled'
  | 'Closed'
  | 'Matured'
  | 'Rejected'
  | 'Refunded';

type LocalActionState =
  | 'Extension Requested'
  | 'Pre-Close Requested'
  | '';

type FilterTab = 'all' | 'active' | 'pending' | 'others';

type Investment = {
  id: string;
  investmentDbId: number;
  name: string;
  status: BondStatus;
  stage?: string;
  amount: number;
  rate: number;
  tenureMonths: number;
  investedOn: string;
  maturesOn: string;
  monthlyInterest: number;
  earned: number;
  expectedInterestAmount: number;
  maturityAmount: number;
  bondNumber?: string;
};

const EXTENSION_OPTIONS = [3, 6, 12, 36];

const n = (v: any, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
};

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  if (/^\d{2}-\d{2}-\d{4}/.test(value)) {
    const [d, m, y] = value.substring(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthsBetween(
  start?: string | null,
  end?: string | null,
) {
  const s = parseDate(start);
  const e = typeof end === 'string' ? parseDate(end) : null;
  if (!s || !e) return 0;
  return Math.max(
    1,
    (e.getFullYear() - s.getFullYear()) * 12 +
      (e.getMonth() - s.getMonth()),
  );
}

export function resolveInvestmentStatus(item: ApiInvestment): BondStatus {
  const anyItem = item as any;

  const extractString = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val.trim().toLowerCase();
    if (typeof val === 'object') {
      return String(
        val.status ||
        val.request_status ||
        val.settlement_status ||
        val.status_name ||
        val.approval_status ||
        '',
      ).trim().toLowerCase();
    }
    return String(val).trim().toLowerCase();
  };

  const rawStatus = String(
    anyItem.status_name ||
    anyItem.investment_status_name ||
    item.status ||
    item.investment_status ||
    anyItem.status_code ||
    '',
  ).trim().toLowerCase();

  const statusId = n(item.investment_status_id ?? anyItem.status_id);

  const precloseValues = [
    extractString(anyItem.preclose_request_status),
    extractString(anyItem.pre_close_request_status),
    extractString(anyItem.preclose_status),
    extractString(anyItem.pre_close_status),
    extractString(anyItem.settlement_request_status),
    extractString(anyItem.settlement_status),
    extractString(anyItem.payout_status),
    extractString(anyItem.payment_status),
    extractString(anyItem.preclose_request),
    extractString(anyItem.pre_close_request),
    extractString(anyItem.preclose),
    extractString(anyItem.settlement),
    extractString(anyItem.workflow_status),
    extractString(anyItem.workflow_status_name),
    extractString(anyItem.request_status),
    extractString(anyItem.approval_status),
    extractString(anyItem.action_status),
  ].filter(Boolean);

  const extensionValues = [
    extractString(anyItem.extension_request_status),
    extractString(anyItem.tenure_extension_request_status),
    extractString(anyItem.extension_status),
    extractString(anyItem.tenure_extension_status),
    extractString(anyItem.extension_request),
    extractString(anyItem.extension),
  ].filter(Boolean);

  const hasSettlementDate = Boolean(
    anyItem.settled_date ||
    anyItem.settlement_date ||
    anyItem.closed_date ||
    anyItem.paid_date ||
    anyItem.settled_on ||
    anyItem.closed_on ||
    anyItem.paid_on,
  );

  const hasSettlementFlag = Boolean(
    anyItem.is_settled === true ||
    anyItem.is_closed === true ||
    anyItem.is_preclosed === true ||
    anyItem.is_paid === true,
  );

  const isPrecloseSettled = precloseValues.some(
    s =>
      !s.includes('pending') &&
      !s.includes('requested') &&
      !s.includes('reject') &&
      (s.includes('settled') ||
        s.includes('closed') ||
        s.includes('paid') ||
        s.includes('completed') ||
        s.includes('approved')),
  );

  // =========================================================================
  // 1. FINAL SETTLED / CLOSED / PAID / COMPLETED STATE (HIGHEST PRIORITY)
  // Evaluated strictly before Active.
  // =========================================================================
  if (
    statusId === 3 ||
    rawStatus === 'settled' ||
    rawStatus.includes('settled') ||
    rawStatus === 'closed' ||
    rawStatus.includes('closed') ||
    rawStatus.includes('paid') ||
    rawStatus.includes('completed') ||
    hasSettlementDate ||
    hasSettlementFlag ||
    isPrecloseSettled
  ) {
    return 'Settled';
  }

  // =========================================================================
  // 2. FINAL REJECTED / CANCELLED / REFUNDED STATES
  // =========================================================================
  if (
    statusId === 4 ||
    rawStatus.includes('reject') ||
    rawStatus.includes('cancel') ||
    precloseValues.some(s => s.includes('reject') || s.includes('cancel'))
  ) {
    return 'Rejected';
  }
  if (
    statusId === 5 ||
    rawStatus.includes('refund') ||
    precloseValues.some(s => s.includes('refund'))
  ) {
    return 'Refunded';
  }

  // =========================================================================
  // 3. PENDING PRE-CLOSE / SETTLEMENT REQUEST
  // =========================================================================
  if (
    precloseValues.some(
      s =>
        s.includes('pending') ||
        s.includes('requested') ||
        s.includes('preclose') ||
        s.includes('pre close') ||
        s.includes('settlement'),
    ) ||
    rawStatus.includes('pre-close') ||
    rawStatus.includes('preclose')
  ) {
    return 'Pre-Close Requested';
  }

  // =========================================================================
  // 4. PENDING TENURE EXTENSION REQUEST
  // =========================================================================
  const isExtensionApproved = extensionValues.some(
    s =>
      s === 'approved' ||
      s === 'completed' ||
      s === 'active' ||
      s.includes('approved') ||
      s.includes('completed'),
  );

  const isExtensionSuperAdmin = extensionValues.some(
    s =>
      s === 'pendingsuperadmin' ||
      s.includes('superadmin') ||
      s.includes('super admin'),
  );

  // If extension is already approved/completed, or if it reflects SuperAdmin stage,
  // do NOT mark it as pending extension — it resolves directly to Active.
  if (!isExtensionApproved && !isExtensionSuperAdmin) {
    const isExtensionPending =
      extensionValues.some(
        s =>
          s.includes('pending') ||
          s.includes('requested') ||
          (s.includes('extension') && !s.includes('reject') && !s.includes('active')),
      ) ||
      (rawStatus.includes('extension') &&
        (rawStatus.includes('pending') ||
         rawStatus.includes('requested') ||
         rawStatus === 'extension requested'));

    if (isExtensionPending) {
      return 'Extension Requested';
    }
  }

  // =========================================================================
  // 5. PENDING INITIAL INVESTMENT APPROVAL
  // =========================================================================
  if (
    statusId === 1 ||
    rawStatus === 'pending' ||
    rawStatus === 'pending approval' ||
    rawStatus.includes('pending approval') ||
    rawStatus.includes('waiting for admin approval') ||
    rawStatus.includes('submitted') ||
    rawStatus.includes('under review')
  ) {
    return 'Pending Approval';
  }

  // =========================================================================
  // 6. MATURED (Past maturity date)
  // =========================================================================
  if (rawStatus === 'matured' || rawStatus.includes('matur')) {
    return 'Matured';
  }
  const maturity = parseDate(item.maturity_date);
  if (maturity && maturity.getTime() <= Date.now()) {
    return 'Matured';
  }

  // =========================================================================
  // 7. ACTIVE (Approved & ongoing)
  // =========================================================================
  if (
    statusId === 2 ||
    rawStatus.includes('active') ||
    rawStatus.includes('approved') ||
    item.approved_by != null ||
    item.approved_date
  ) {
    return 'Active';
  }

  return 'Active';
}

function mapInvestment(item: ApiInvestment): Investment {
  const anyItem = item as any;
  const amount = n(item.investment_amount ?? item.amount);
  const rate = n(item.interest_rate ?? item.rate);
  const expected = n(item.expected_interest_amount);
  const maturityAmount = n(
    item.maturity_amount,
    amount + expected,
  );

  const tenure =
    n(item.tenure_months) ||
    monthsBetween(item.investment_date, item.maturity_date) ||
    1;

  const investedDate = parseDate(item.investment_date);
  const now = new Date();
  const elapsedMonths = investedDate
    ? Math.max(
        0,
        Math.min(
          tenure,
          (now.getFullYear() - investedDate.getFullYear()) * 12 +
            (now.getMonth() - investedDate.getMonth()),
        ),
      )
    : 0;
  const earned = Math.min(expected, (expected / tenure) * elapsedMonths);
  const bondNum = String(item.bond_number ?? item.bond_id ?? '').trim();

  const stage =
    anyItem.stage ||
    (anyItem.request_status === 'PendingSuperAdmin' ||
    anyItem.approval_status === 'PendingSuperAdmin' ||
    anyItem.status === 'PendingSuperAdmin'
      ? 'SuperAdmin'
      : 'Admin');

  return {
    id: String(item.investment_id ?? item.id),
    investmentDbId: n(item.id),
    name: `INRFS Bond — ${String(item.investment_id ?? item.id)}`,
    status: resolveInvestmentStatus(item),
    stage,
    amount,
    rate,
    tenureMonths: tenure,
    investedOn: item.investment_date || '—',
    maturesOn: item.maturity_date || '—',
    monthlyInterest: tenure > 0 ? expected / tenure : 0,
    earned,
    expectedInterestAmount: expected,
    maturityAmount,
    bondNumber: bondNum || undefined,
  };
}

const money = (value: number) =>
  '₹' + Math.round(value).toLocaleString('en-IN');

const statusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return {bg: '#DCFCE7', fg: '#15803D'};
    case 'Settled':
    case 'Closed':
    case 'Matured':
      return {bg: '#E5E7EB', fg: '#374151'};
    case 'Extension Requested':
    case 'Pre-Close Requested':
    case 'Pending Extension':
    case 'Pending Settlement':
    case 'Pending Approval':
    case 'Pending':
      return {bg: '#FEF3C7', fg: '#B45309'};
    case 'Rejected':
    case 'Refunded':
      return {bg: '#FEF2F2', fg: '#DC2626'};
    default:
      return {bg: '#FEF3C7', fg: '#B45309'};
  }
};

const isPendingStatus = (s: BondStatus) =>
  s === 'Pending Approval' ||
  s === 'Extension Requested' ||
  s === 'Pre-Close Requested' ||
  s === 'Pending Extension' ||
  s === 'Pending Settlement';

const isOthersStatus = (s: BondStatus) =>
  s === 'Settled' ||
  s === 'Closed' ||
  s === 'Matured' ||
  s === 'Rejected' ||
  s === 'Refunded';

const isActiveStatus = (s: BondStatus) => s === 'Active';

const MyInvestmentsScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  const [items, setItems] = useState<Investment[]>([]);
  const [localActionState, setLocalActionState] = useState<
    Record<string, LocalActionState>
  >({});
  const [targetTenures, setTargetTenures] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const [view, setView] = useState<Investment | null>(null);
  const [extension, setExtension] = useState<Investment | null>(null);
  const [extensionMonths, setExtensionMonths] = useState(6);
  const [preclose, setPreclose] = useState<Investment | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const getActionState = (item: Investment): LocalActionState => {
    // If backend returns a definitive final status, clear local requested state
    if (
      item.status === 'Settled' ||
      item.status === 'Closed' ||
      item.status === 'Matured' ||
      item.status === 'Rejected' ||
      item.status === 'Refunded'
    ) {
      return '';
    }
    const idKey = String(item.investmentDbId);
    const target = targetTenures[idKey];
    // If backend tenure has reached or exceeded the requested target tenure, Admin has approved!
    if (target && item.tenureMonths >= target) {
      return '';
    }
    return localActionState[idKey] || '';
  };

  const getItemEffectiveStatus = (item: Investment): BondStatus => {
    if (
      item.status === 'Settled' ||
      item.status === 'Closed' ||
      item.status === 'Matured' ||
      item.status === 'Rejected' ||
      item.status === 'Refunded'
    ) {
      return item.status === 'Closed' ? 'Settled' : item.status;
    }
    const actionState = getActionState(item);
    return (actionState || item.status) as BondStatus;
  };

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await investorService.getMyInvestments();
      const mapped = response.map(mapInvestment);
      setItems(mapped);

      // Once a fresh backend response confirms that:
      // - investment status is Active (with tenure updated to/past target), OR
      // - backend tenure is equal to/greater than the requested target tenure,
      // clear the local 'Extension Requested' state.
      setLocalActionState(previous => {
        let changed = false;
        const next = {...previous};
        mapped.forEach(item => {
          const idKey = String(item.investmentDbId);
          if (next[idKey] === 'Extension Requested') {
            const target = targetTenures[idKey];
            if (target && item.tenureMonths >= target) {
              delete next[idKey];
              changed = true;
            }
          }
        });
        return changed ? next : previous;
      });
    } catch (e: any) {
      setError(e?.message || 'Unable to load investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetTenures]);

  useEffect(() => {
    load();
  }, [load]);

  // Focus listener and periodic refresh
  useEffect(() => {
    const unsubscribe = navigation?.addListener?.('focus', () => {
      load();
    });

    const interval = setInterval(() => {
      load();
    }, 15000);

    return () => {
      if (unsubscribe) unsubscribe();
      clearInterval(interval);
    };
  }, [navigation, load]);

  const counts = useMemo(() => {
    let active = 0;
    let pending = 0;
    let others = 0;

    items.forEach(item => {
      const status = getItemEffectiveStatus(item);
      if (isActiveStatus(status)) {
        active++;
      } else if (isPendingStatus(status)) {
        pending++;
      } else if (isOthersStatus(status)) {
        others++;
      }
    });

    return {
      all: items.length,
      active,
      pending,
      others,
    };
  }, [items, localActionState]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter(item => {
      const status = getItemEffectiveStatus(item);
      const isActive = isActiveStatus(status);
      const isPending = isPendingStatus(status);
      const isOther = isOthersStatus(status);

      if (activeTab === 'active' && !isActive) return false;
      if (activeTab === 'pending' && !isPending) return false;
      if (activeTab === 'others' && !isOther) return false;

      if (!q) return true;

      return (
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.bondNumber && item.bondNumber.toLowerCase().includes(q))
      );
    });
  }, [items, activeTab, query, localActionState]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.amount + x.earned, 0),
    [items],
  );

  const exportExcel = async () => {
    try {
      const exportData = filtered.map(x => ({
        'Investment ID': x.id,
        'Bond Number': x.bondNumber || '—',
        'Amount (₹)': x.amount,
        'Interest Rate (%)': x.rate,
        'Tenure (Months)': x.tenureMonths,
        'Invested On': x.investedOn,
        'Matures On': x.maturesOn,
        'Monthly Interest (₹)': x.monthlyInterest,
        'Earned (₹)': x.earned,
        Status: getItemEffectiveStatus(x),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'My Investments');

      const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
      const cleanFilename = `INRFS_My_Investments_${Date.now()}.xlsx`;
      const dir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
      const path = `${dir}/${cleanFilename}`;

      await RNFS.writeFile(path, wbout, 'base64');

      const exists = await RNFS.exists(path);
      if (!exists) {
        Alert.alert('Export Error', 'Export file could not be created on the device.');
        return;
      }

      const fileUrl = `file://${path}`;
      if (!fileUrl) {
        Alert.alert('Export Error', 'Generated file URI is null or invalid.');
        return;
      }

      await RNShare.open({
        url: fileUrl,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        title: 'Share My Investments Report',
        subject: cleanFilename,
        useInternalStorage: true,
        failOnCancel: false,
      });
    } catch (e: any) {
      if (
        e?.message !== 'User did not share' &&
        !e?.message?.includes('DISMISSED') &&
        !e?.message?.includes('cancel')
      ) {
        Alert.alert('Export Error', e?.message || 'Unable to export report.');
      }
    }
  };

  const openDetails = async (item: Investment) => {
    const currentStatus = getItemEffectiveStatus(item);
    setView({...item, status: currentStatus});

    try {
      const details = await investorService.getInvestmentDetails(
        item.investmentDbId,
      );
      if (details) {
        const mapped = mapInvestment(details);
        const mappedStatus = getItemEffectiveStatus(mapped);
        setView({...mapped, status: mappedStatus});
      }
    } catch (e: any) {
      console.log('Could not fetch rich investment details:', e?.message);
    }
  };

  const submitExtension = async () => {
    if (!extension) return;

    const selectedTarget = Number(extensionMonths);
    if (!validation.isValidExtensionMonths(selectedTarget)) {
      Alert.alert('Invalid Duration', 'Please select a valid extension tenure.');
      return;
    }

    const currentTenure = Number(extension.tenureMonths) || 3;
    // Calculate increment so backend computes (currentTenure + deltaMonths = selectedTarget)
    const deltaMonths =
      selectedTarget > currentTenure ? selectedTarget - currentTenure : selectedTarget;

    try {
      setBusy(true);
      await investorService.requestTenureExtension(
        extension.investmentDbId,
        deltaMonths,
        '',
      );

      // Set local requested state immediately
      setLocalActionState(previous => ({
        ...previous,
        [String(extension.investmentDbId)]: 'Extension Requested',
      }));
      setTargetTenures(previous => ({
        ...previous,
        [String(extension.investmentDbId)]: selectedTarget,
      }));

      setExtension(null);
      await load();

      Alert.alert(
        'Request Submitted',
        `${extension.id}: ${selectedTarget}-month tenure extension request sent to admin for approval.`,
      );
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Unable to submit tenure extension.';
      Alert.alert('Extension Request Failed', errMsg);
    } finally {
      setBusy(false);
    }
  };

  const submitPreclose = async () => {
    if (!preclose) return;

    const check = validation.isValidPrecloseReason(reason);
    if (!check.isValid) {
      Alert.alert('Validation Error', check.error || 'Please enter a valid reason.');
      return;
    }

    try {
      setBusy(true);
      await investorService.requestPreclose(
        preclose.investmentDbId,
        reason.trim(),
      );

      // Set local requested state immediately
      setLocalActionState(previous => ({
        ...previous,
        [String(preclose.investmentDbId)]: 'Pre-Close Requested',
      }));

      setPreclose(null);
      setReason('');
      await load();

      Alert.alert(
        'Request Submitted',
        `${preclose.id}: Pre-close request submitted to admin for approval.`,
      );
    } catch (e: any) {
      const errMsg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Unable to submit pre-close request.';
      Alert.alert('Pre-Close Request Failed', errMsg);
    } finally {
      setBusy(false);
    }
  };

  const getEmptyMessage = () => {
    if (query) return `No investments match "${query}"`;
    switch (activeTab) {
      case 'active':
        return 'No active investments found.';
      case 'pending':
        return 'No pending approval investments.';
      case 'others':
        return 'No other investments found.';
      default:
        return 'No investments found in your portfolio.';
    }
  };

  const getPendingHintText = (item: Investment, status: BondStatus) => {
    if (status === 'Pending Approval') {
      return 'Waiting for Admin Approval — actions unlock once approved.';
    }
    if (status === 'Extension Requested' || status === 'Pending Extension') {
      return 'Waiting for Admin Approval — tenure extension request submitted.';
    }
    if (status === 'Pre-Close Requested' || status === 'Pending Settlement') {
      if (item.stage === 'SuperAdmin') {
        return 'Waiting for Super Admin Approval — your pre-close request has been approved by the admin and sent for final settlement.';
      }
      return 'Waiting for Admin Approval — pre-close request submitted.';
    }
    return 'Waiting for Admin Approval.';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.heroValue}>{money(total)}</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={18} color="#9C9689" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search investments..."
              placeholderTextColor="#9C9689"
            />
          </View>

          <TouchableOpacity style={styles.exportBtn} onPress={exportExcel}>
            <Icon name="export-variant" size={16} color="#1A1A18" />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* 4 FILTER TABS: All Investments | Active | Pending | Others */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeTab === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setActiveTab('all')}>
            <Text
              style={[
                styles.filterChipText,
                activeTab === 'all' && styles.filterChipTextActive,
              ]}>
              All Investments ({counts.all})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeTab === 'active' && styles.filterChipActive,
            ]}
            onPress={() => setActiveTab('active')}>
            <Text
              style={[
                styles.filterChipText,
                activeTab === 'active' && styles.filterChipTextActive,
              ]}>
              Active ({counts.active})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeTab === 'pending' && styles.filterChipActive,
            ]}
            onPress={() => setActiveTab('pending')}>
            <Text
              style={[
                styles.filterChipText,
                activeTab === 'pending' && styles.filterChipTextActive,
              ]}>
              Pending ({counts.pending})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeTab === 'others' && styles.filterChipActive,
            ]}
            onPress={() => setActiveTab('others')}>
            <Text
              style={[
                styles.filterChipText,
                activeTab === 'others' && styles.filterChipTextActive,
              ]}>
              Others ({counts.others})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {loading ? (
          <View style={{padding: 40, alignItems: 'center'}}>
            <ActivityIndicator />
            <Text style={{marginTop: 10}}>Loading investments...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Unable to load investments</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={styles.newInvestmentBtn} onPress={load}>
              <Text style={styles.newInvestmentBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="briefcase-outline" size={40} color="#9C9689" />
            <Text style={styles.emptyTitle}>{getEmptyMessage()}</Text>
          </View>
        ) : (
          filtered.map((item, index) => {
            const displayStatus = getItemEffectiveStatus(item);
            const colors = statusColor(displayStatus);
            const isPending = isPendingStatus(displayStatus);
            const isSettledOrOther = isOthersStatus(displayStatus);

            return (
              <View
                key={`investment-${item.id || item.investmentDbId}-${index}`}
                style={[
                  styles.investmentCard,
                  index === 0 && styles.investmentCardFirst,
                ]}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.idLabel}>INVESTMENT ID</Text>
                    <Text
                      style={[
                        styles.bondId,
                        displayStatus === 'Pending Approval' &&
                          styles.bondIdPending,
                      ]}>
                      {item.id}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: colors.bg},
                    ]}>
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {color: colors.fg},
                      ]}>
                      {displayStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Bond Badge / Link */}
                {displayStatus !== 'Pending Approval' && item.bondNumber ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('BondDetails', {
                        investorId,
                        bondId: item.investmentDbId,
                        bondDisplayId: item.bondNumber,
                      })
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                      marginBottom: 6,
                    }}>
                    <Icon
                      name="file-certificate-outline"
                      size={14}
                      color="#16A34A"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: '#16A34A',
                      }}>
                      Bond: {item.bondNumber}
                    </Text>
                  </TouchableOpacity>
                ) : displayStatus === 'Pending Approval' ? (
                  <Text
                    style={{
                      fontSize: 11.5,
                      color: '#9CA3AF',
                      marginTop: 2,
                      marginBottom: 6,
                      fontStyle: 'italic',
                    }}>
                    Bond: Pending...
                  </Text>
                ) : null}

                <Text style={styles.bondName}>{item.name}</Text>

                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>AMOUNT</Text>
                    <Text style={styles.metaValue}>{money(item.amount)}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>RATE</Text>
                    <Text style={styles.metaValueGold}>
                      {item.rate}% p.a.
                    </Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>INVESTED ON</Text>
                    <Text style={styles.metaValue}>{item.investedOn}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>MATURES ON</Text>
                    <Text style={styles.metaValue}>{item.maturesOn}</Text>
                  </View>
                </View>

                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>MONTHLY INT.</Text>
                    <Text style={styles.metaValue}>
                      {money(item.monthlyInterest)}
                    </Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>EXPECTED INTEREST</Text>
                    <Text style={styles.metaValueGreen}>
                      {money(item.expectedInterestAmount)}
                    </Text>
                  </View>
                </View>

                {/* Pending Status Hint Message */}
                {isPending && (
                  <Text style={styles.pendingHint}>
                    {getPendingHintText(item, displayStatus)}
                  </Text>
                )}

                {/* Actions Row */}
                <View style={styles.actionIconRow}>
                  {/* View Action -> Investment Details (Available across all) */}
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openDetails(item)}>
                    <Icon name="eye-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>View</Text>
                  </TouchableOpacity>

                  {/* Bond Action -> Bond Certificate (Available once approved) */}
                  {displayStatus !== 'Pending Approval' && (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() =>
                        navigation.navigate('BondDetails', {
                          investorId,
                          bondId: item.investmentDbId,
                          bondDisplayId: item.bondNumber || item.id,
                        })
                      }>
                      <Icon
                        name="file-certificate-outline"
                        size={18}
                        color="#1A1A18"
                      />
                      <Text style={styles.actionIconBtnText}>Bond</Text>
                    </TouchableOpacity>
                  )}

                  {/* Extend & Pre-Close Actions (Available ONLY when status is strictly Active) */}
                  {displayStatus === 'Active' && !isPending && !isSettledOrOther && (
                    <>
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => {
                          setExtension(item);
                          const curr = Number(item.tenureMonths) || 3;
                          const defaultOpt =
                            EXTENSION_OPTIONS.find(m => m > curr) || 6;
                          setExtensionMonths(defaultOpt);
                        }}>
                        <Icon
                          name="calendar-clock"
                          size={18}
                          color="#1A1A18"
                        />
                        <Text style={styles.actionIconBtnText}>Extend</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => {
                          setPreclose(item);
                          setReason('');
                        }}>
                        <Icon
                          name="cash-refund"
                          size={18}
                          color="#1A1A18"
                        />
                        <Text style={styles.actionIconBtnText}>Pre-Close</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}

        <TouchableOpacity
          style={styles.newInvestmentBtn}
          onPress={() => navigation.navigate('InvestNow', {investorId})}>
          <Icon name="plus-circle-outline" size={18} color="#8A6D2F" />
          <Text style={styles.newInvestmentBtnText}>New Investment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* INVESTMENT DETAILS MODAL */}
      <Modal
        visible={!!view}
        transparent
        animationType="fade"
        onRequestClose={() => setView(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {view && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>{view.id}</Text>
                    {view.bondNumber && view.bondNumber !== '—' && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                          marginTop: 2,
                          fontWeight: '600',
                        }}>
                        Bond: {view.bondNumber}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setView(null)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Icon name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {[
                  ['Status', view.status],
                  ['Principal Amount', money(view.amount)],
                  ['Interest Rate', `${view.rate}% p.a.`],
                  ['Tenure', `${view.tenureMonths} months`],
                  ['Invested On', view.investedOn],
                  ['Matures On', view.maturesOn],
                  ['Monthly Interest', money(view.monthlyInterest)],
                  ['Expected Interest', money(view.expectedInterestAmount)],
                  ['Maturity Amount', money(view.maturityAmount)],
                  ...(view.bondNumber && view.bondNumber !== '—'
                    ? [['Bond Number', view.bondNumber]]
                    : []),
                ].map(([label, val]) => (
                  <View style={styles.modalRow} key={label}>
                    <Text style={styles.modalRowLabel}>{label}</Text>
                    <Text style={styles.modalRowValue}>{val}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => setView(null)}>
                  <Text style={styles.modalConfirmBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* TENURE EXTENSION MODAL */}
      <Modal
        visible={!!extension}
        transparent
        animationType="fade"
        onRequestClose={() => setExtension(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Request Tenure Extension</Text>
              <TouchableOpacity
                onPress={() => setExtension(null)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              Select the new total tenure for {extension?.id} (Current:{' '}
              {extension?.tenureMonths}M):
            </Text>

            <View style={styles.modalChipRow}>
              {EXTENSION_OPTIONS.map(months => {
                const isSelected = extensionMonths === months;
                return (
                  <TouchableOpacity
                    key={months}
                    style={[
                      styles.modalChip,
                      isSelected && styles.modalChipActive,
                    ]}
                    onPress={() => setExtensionMonths(months)}>
                    <Text
                      style={[
                        styles.modalChipText,
                        isSelected && styles.modalChipTextActive,
                      ]}>
                      {months} Months
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setExtension(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                disabled={busy}
                onPress={submitExtension}>
                <Text style={styles.modalConfirmBtnText}>
                  {busy ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* PRE-CLOSE MODAL */}
      <Modal
        visible={!!preclose}
        transparent
        animationType="fade"
        onRequestClose={() => setPreclose(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Request Pre-Close</Text>
              <TouchableOpacity
                onPress={() => setPreclose(null)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>REASON FOR PRE-CLOSE</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 10,
                padding: 10,
                minHeight: 90,
                color: '#111827',
                textAlignVertical: 'top',
              }}
              multiline
              value={reason}
              onChangeText={setReason}
              placeholder="Briefly state your reason..."
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPreclose(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !reason.trim() && {opacity: 0.5},
                ]}
                disabled={!reason.trim() || busy}
                onPress={submitPreclose}>
                <Text style={styles.modalConfirmBtnText}>
                  {busy ? 'Submitting...' : 'Submit Pre-Close'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar
        active="My Investments"
        navigation={navigation}
        investorId={investorId}
      />
    </SafeAreaView>
  );
};

export default MyInvestmentsScreen;
