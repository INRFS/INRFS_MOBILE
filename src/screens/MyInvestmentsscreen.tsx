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


import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://187.52.115.32:8000';

type ApiInvestment = {
  id: number;
  investment_id: string;
  investor_registration_id?: number | string | null;
  investor_id?: string | null;
  investor_name?: string | null;
  tenure_id?: number | null;
  tenure_months?: number | null;
  investment_amount?: string | number | null;
  amount?: string | number | null;
  interest_rate?: string | number | null;
  rate?: string | number | null;
  expected_interest_amount?: string | number | null;
  maturity_amount?: string | number | null;
  investment_status_id?: number | string | null;
  investment_status?: string | null;
  status?: string | null;
  investment_date?: string | null;
  maturity_date?: string | null;
  approved_by?: string | number | null;
  approved_date?: string | null;
  remarks?: string | null;
  rejection_reason?: string | null;
  bond_id?: string | null;
  bond_number?: string | null;
};

type ApiEnvelope<T> = {data?: T; message?: string; success?: boolean; total?: number};

type ApiBond = ApiInvestment & {
  investment_code?: string | null;
  mobile?: string | null;
  email?: string | null;
  aadhar?: string | null;
  aadhaar?: string | null;
  bank?: {
    name?: string; accountNumber?: string; account_number?: string; ifsc?: string;
    accountType?: string; account_type?: string;
  } | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
  investor?: any;
};

async function getToken(): Promise<string> {
  const token =
    (await AsyncStorage.getItem('access_token')) ||
    (await AsyncStorage.getItem('accessToken')) ||
    (await AsyncStorage.getItem('authToken')) ||
    (await AsyncStorage.getItem('token'));
  if (!token) throw new Error('Authentication token not found. Please log in again.');
  return token;
}

function apiError(data: any, fallback: string) {
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) return data.detail.map((x: any) => x?.msg || String(x)).join(', ');
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  return fallback;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {})},
  });
  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) throw new Error(apiError(data, `Request failed with status ${response.status}.`));
  return data as T;
}

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in (response as any) && (response as any).data !== undefined) return (response as any).data as T;
  return response as T;
}

async function getMyInvestments(): Promise<ApiInvestment[]> {
  const response = await requestJson<ApiInvestment[] | ApiEnvelope<ApiInvestment[]>>('/investments/my-investments', {method: 'GET'});
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
}

async function getMyInvestment(investmentDbId: number): Promise<ApiInvestment> {
  const response = await requestJson<ApiInvestment | ApiEnvelope<ApiInvestment>>(`/investments/my-investments/${investmentDbId}`, {method: 'GET'});
  return unwrap(response);
}

async function requestTenureExtension(investmentDbId: number, extensionMonths: number, remarks = '') {
  return requestJson(`/investments/my-investments/${investmentDbId}/tenure-extension`, {method: 'POST', body: JSON.stringify({extension_months: extensionMonths, remarks})});
}

async function requestPreclose(investmentDbId: number, reason: string) {
  return requestJson(`/investments/my-investments/${investmentDbId}/preclose`, {method: 'POST', body: JSON.stringify({reason})});
}

async function getMyInvestmentBond(investmentDbId: number): Promise<ApiBond> {
  const response = await requestJson<ApiBond | ApiEnvelope<ApiBond>>(`/investments/my-investments/${investmentDbId}/bond`, {method: 'GET'});
  return unwrap(response);
}

type BondStatus =
  | 'Active'
  | 'Matured'
  | 'Pending Approval'
  | 'Pending Extension'
  | 'Pending Settlement';

type Investment = {
  id: string;
  investmentDbId: number;
  name: string;
  status: BondStatus;
  amount: number;
  rate: number;
  tenureMonths: number;
  investedOn: string;
  maturesOn: string;
  monthlyInterest: number;
  earned: number;
  expectedInterestAmount: number;
  maturityAmount: number;
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

function apiStatus(item: ApiInvestment): BondStatus {
  const raw = String(
    item.status || item.investment_status || '',
  ).trim().toLowerCase();

  // Prefer an explicit status returned by the backend.
  if (raw.includes('pending') && raw.includes('extension')) {
    return 'Pending Extension';
  }
  if (raw.includes('pending') && (raw.includes('settlement') || raw.includes('preclose'))) {
    return 'Pending Settlement';
  }
  if (raw.includes('pending') || raw.includes('approval')) {
    return 'Pending Approval';
  }
  if (raw.includes('rejected') || raw.includes('cancelled')) {
    return 'Pending Approval';
  }
  if (raw.includes('matur') || raw.includes('settled')) {
    return 'Matured';
  }
  if (raw.includes('active') || raw.includes('approved')) {
    return 'Active';
  }

  // The Swagger response supplied for /investments/my-investments shows:
  // investment_status_id = 2 together with approved_by/approved_date and
  // a future maturity date. Therefore status 2 is an approved/active
  // investment in the current backend, not Matured.
  const statusId = n(item.investment_status_id);
  if (statusId === 2) return 'Active';

  // Never mark an investment Matured merely because an unknown status id
  // was returned. The maturity date is the reliable fallback.
  const maturity = parseDate(item.maturity_date);
  if (maturity && maturity.getTime() <= Date.now()) return 'Matured';

  if (item.approved_by != null || item.approved_date) return 'Active';

  // Current API does not expose a separate pending-status endpoint.
  // If the record has not been approved and no explicit status was sent,
  // treat it as pending approval rather than inventing a local state.
  if (item.approved_by == null && !item.approved_date && statusId === 1) {
    return 'Pending Approval';
  }

  return 'Active';
}

function mapInvestment(item: ApiInvestment): Investment {
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

  return {
    id: String(item.investment_id ?? item.id),
    investmentDbId: n(item.id),
    name: `INRFS Bond — ${String(item.investment_id ?? item.id)}`,
    status: apiStatus(item),
    amount,
    rate,
    tenureMonths: tenure,
    investedOn: item.investment_date || '—',
    maturesOn: item.maturity_date || '—',
    monthlyInterest: tenure > 0 ? expected / tenure : 0,
    earned,
    expectedInterestAmount: expected,
    maturityAmount,
  };
}

const money = (value: number) =>
  '₹' + Math.round(value).toLocaleString('en-IN');

const statusColor = (status: BondStatus) => {
  switch (status) {
    case 'Active':
      return {bg: '#DCFCE7', fg: '#15803D'};
    case 'Matured':
      return {bg: '#E5E7EB', fg: '#374151'};
    default:
      return {bg: '#FEF3C7', fg: '#B45309'};
  }
};

const MyInvestmentsScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [pendingOnly, setPendingOnly] = useState(false);

  const [view, setView] = useState<Investment | null>(null);
  const [extension, setExtension] = useState<Investment | null>(null);
  const [extensionMonths, setExtensionMonths] = useState(3);
  const [preclose, setPreclose] = useState<Investment | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await getMyInvestments();
      setItems(response.map(mapInvestment));
    } catch (e: any) {
      setError(e?.message || 'Unable to load investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter(item => {
      const pending =
        item.status === 'Pending Approval' ||
        item.status === 'Pending Extension' ||
        item.status === 'Pending Settlement';

      if (pendingOnly && !pending) return false;
      if (!q) return true;

      return (
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q)
      );
    });
  }, [items, pendingOnly, query]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.amount + x.earned, 0),
    [items],
  );

  const pendingCount = useMemo(
    () =>
      items.filter(
        x =>
          x.status === 'Pending Approval' ||
          x.status === 'Pending Extension' ||
          x.status === 'Pending Settlement',
      ).length,
    [items],
  );

  const openDetails = async (item: Investment) => {
    setView(item);
    try {
      const detail = await getMyInvestment(item.investmentDbId);
      setView(mapInvestment(detail));
    } catch (e: any) {
      Alert.alert('Unable to load details', e?.message || 'Try again.');
    }
  };

  const submitExtension = async () => {
    if (!extension) return;

    try {
      setBusy(true);
      await requestTenureExtension(
        extension.investmentDbId,
        extensionMonths,
        '',
      );

      setExtension(null);
      await load();

      Alert.alert(
        'Request submitted',
        `${extension.id}: ${extensionMonths}-month tenure extension request sent to admin.`,
      );
    } catch (e: any) {
      Alert.alert(
        'Extension failed',
        e?.message || 'Could not submit the extension request.',
      );
    } finally {
      setBusy(false);
    }
  };

  const submitPreclose = async () => {
    if (!preclose || !reason.trim()) return;

    try {
      setBusy(true);
      await requestPreclose(preclose.investmentDbId, reason.trim());

      setPreclose(null);
      setReason('');
      await load();

      Alert.alert(
        'Pre-close requested',
        `${preclose.id}: request sent to admin for approval.`,
      );
    } catch (e: any) {
      Alert.alert(
        'Pre-close failed',
        e?.message || 'Could not submit the pre-close request.',
      );
    } finally {
      setBusy(false);
    }
  };

  const exportExcel = async () => {
    try {
      const rows = items.map(x => ({
        'Investment ID': x.id,
        Status: x.status,
        Amount: x.amount,
        'Interest Rate': x.rate,
        'Tenure Months': x.tenureMonths,
        'Invested On': x.investedOn,
        'Matures On': x.maturesOn,
        'Monthly Interest': x.monthlyInterest,
        'Expected Interest': x.expectedInterestAmount,
        'Maturity Amount': x.maturityAmount,
      }));

      const sheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, 'My Investments');

      const base64 = XLSX.write(workbook, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileName = `INRFS_My_Investments_${Date.now()}.xlsx`;
      const path = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(path, base64, 'base64');

      await RNShare.open({
        url: `file://${path}`,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
      });
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Could not export.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Investment Portal" />

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

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              !pendingOnly && styles.filterChipActive,
            ]}
            onPress={() => setPendingOnly(false)}>
            <Text
              style={[
                styles.filterChipText,
                !pendingOnly && styles.filterChipTextActive,
              ]}>
              All Investments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              pendingOnly && styles.filterChipActive,
            ]}
            onPress={() => setPendingOnly(true)}>
            <Text
              style={[
                styles.filterChipText,
                pendingOnly && styles.filterChipTextActive,
              ]}>
              Pending Investments{pendingCount ? ` (${pendingCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{padding: 40, alignItems: 'center'}}>
            <ActivityIndicator />
            <Text style={{marginTop: 10}}>Loading investments...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Unable to load investments</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
            <TouchableOpacity
              style={styles.newInvestmentBtn}
              onPress={load}>
              <Text style={styles.newInvestmentBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="briefcase-outline"
              size={40}
              color="#9C9689"
            />
            <Text style={styles.emptyTitle}>
              {pendingOnly ? 'No pending investments' : 'No investments yet'}
            </Text>
          </View>
        ) : (
          filtered.map((item, index) => {
            const colors = statusColor(item.status);
            const isPending =
              item.status === 'Pending Approval' ||
              item.status === 'Pending Extension' ||
              item.status === 'Pending Settlement';

            return (
              <View
                key={`${item.investmentDbId}-${index}`}
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
                        isPending && styles.bondIdPending,
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
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.bondName}>{item.name}</Text>

                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>AMOUNT</Text>
                    <Text style={styles.metaValue}>
                      {money(item.amount)}
                    </Text>
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
                    <Text style={styles.metaValue}>
                      {item.investedOn}
                    </Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>MATURES ON</Text>
                    <Text style={styles.metaValue}>
                      {item.maturesOn}
                    </Text>
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

                {isPending ? (
                  <Text style={styles.pendingHint}>
                    {item.status === 'Pending Approval'
                      ? 'Waiting for Admin Approval — actions unlock once approved.'
                      : item.status === 'Pending Extension'
                      ? 'Waiting for Admin Approval — tenure extension request submitted.'
                      : 'Waiting for Admin Approval — pre-close request submitted.'}
                  </Text>
                ) : (
                  <View style={styles.actionIconRow}>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => openDetails(item)}>
                      <Icon name="eye-outline" size={18} color="#1A1A18" />
                      <Text style={styles.actionIconBtnText}>View</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() =>
                        navigation.navigate('BondDetails', {
                          investorId,
                          bondId: item.investmentDbId,
                          bondDisplayId: item.id,
                        })
                      }>
                      <Icon name="file-certificate-outline" size={18} color="#1A1A18" />
                      <Text style={styles.actionIconBtnText}>Bond</Text>
                    </TouchableOpacity>

                    {item.status === 'Active' && (
                      <>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => {
                            setExtension(item);
                            setExtensionMonths(3);
                          }}>
                          <Icon name="calendar-clock" size={18} color="#1A1A18" />
                          <Text style={styles.actionIconBtnText}>Extend</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => {
                            setPreclose(item);
                            setReason('');
                          }}>
                          <Icon name="cash-refund" size={18} color="#1A1A18" />
                          <Text style={styles.actionIconBtnText}>Pre-Close</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
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

      <Modal visible={!!view} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {view && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>{view.id}</Text>
                  <TouchableOpacity onPress={() => setView(null)}>
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
                  ['Expected Interest', money(view.expectedInterestAmount)],
                  ['Maturity Amount', money(view.maturityAmount)],
                ].map(([label, value]) => (
                  <View style={styles.modalRow} key={label}>
                    <Text style={styles.modalRowLabel}>{label}</Text>
                    <Text style={styles.modalRowValue}>{value}</Text>
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

      <Modal visible={!!extension} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Request Tenure Extension</Text>
              <TouchableOpacity onPress={() => setExtension(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              Select the extension period for {extension?.id}.
            </Text>

            <View style={styles.modalChipRow}>
              {EXTENSION_OPTIONS.map(months => (
                <TouchableOpacity
                  key={months}
                  style={[
                    styles.modalChip,
                    extensionMonths === months && styles.modalChipActive,
                  ]}
                  onPress={() => setExtensionMonths(months)}>
                  <Text
                    style={[
                      styles.modalChipText,
                      extensionMonths === months &&
                        styles.modalChipTextActive,
                    ]}>
                    {months} Months
                  </Text>
                </TouchableOpacity>
              ))}
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

      <Modal visible={!!preclose} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Request Pre-Close</Text>
              <TouchableOpacity onPress={() => setPreclose(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              REASON FOR PRE-CLOSE
            </Text>
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