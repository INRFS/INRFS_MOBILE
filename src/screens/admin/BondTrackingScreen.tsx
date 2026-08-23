import React, {useCallback, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {SafeAreaView} from 'react-native-safe-area-context';

import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';
import {styles} from '../../styles/admin/BondTrackingScreen.styles';
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

type ApiEnvelope<T> = {success?: boolean; data?: T; total?: number; message?: string};

type ApiBond = ApiInvestment & {
  investment_code?: string | null;
  mobile?: string | null;
  email?: string | null;
  aadhar?: string | null;
  aadhaar?: string | null;
  issue_date?: string | null;
  bank?: {
    name?: string;
    accountNumber?: string;
    account_number?: string;
    ifsc?: string;
    accountType?: string;
    account_type?: string;
  } | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
};

const API_BASE_URL = 'http://187.52.115.32:8000';

async function getAccessToken(): Promise<string> {
  const token =
    (await AsyncStorage.getItem('access_token')) ||
    (await AsyncStorage.getItem('accessToken')) ||
    (await AsyncStorage.getItem('authToken')) ||
    (await AsyncStorage.getItem('token'));

  if (!token) {
    throw new Error('Authentication token not found. Please log in again.');
  }
  return token;
}

function apiErrorMessage(data: any, fallback: string): string {
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) {
    return data.detail.map((x: any) => x?.msg || String(x)).join(', ');
  }
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  return fallback;
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!response.ok) {
    throw new Error(apiErrorMessage(data, `Request failed with status ${response.status}.`));
  }
  return data as T;
}

function unwrap<T>(response: T | ApiEnvelope<T>): T {
  if (response && typeof response === 'object' && 'data' in (response as any) && (response as any).data !== undefined) {
    return (response as any).data as T;
  }
  return response as T;
}

async function getAdminInvestments(params?: {bondId?: string; limit?: number; offset?: number}): Promise<ApiInvestment[]> {
  const query = new URLSearchParams();
  if (params?.bondId) query.set('bond_id', params.bondId);
  query.set('limit', String(params?.limit ?? 100));
  query.set('offset', String(params?.offset ?? 0));
  const response = await requestJson<ApiInvestment[] | ApiEnvelope<ApiInvestment[]>>(`/admin/investments?${query.toString()}`, {method: 'GET'});
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

async function getAdminPendingInvestments(): Promise<ApiInvestment[]> {
  const response = await requestJson<ApiInvestment[] | ApiEnvelope<ApiInvestment[]>>('/admin/investments/pending?limit=100&offset=0', {method: 'GET'});
  const data = unwrap(response);
  return Array.isArray(data) ? data : [];
}

async function getAdminInvestment(investmentId: string): Promise<ApiInvestment> {
  const response = await requestJson<ApiInvestment | ApiEnvelope<ApiInvestment>>(`/admin/investments/${encodeURIComponent(investmentId)}`, {method: 'GET'});
  return unwrap(response);
}

async function getAdminInvestmentBond(investmentId: string): Promise<ApiBond | null> {
  const response = await requestJson<ApiBond | ApiEnvelope<ApiBond> | null>(`/admin/investments/${encodeURIComponent(investmentId)}/bond`, {method: 'GET'});
  return unwrap(response as any) || null;
}

async function approveAdminInvestment(investmentId: string, interestRate: number, remarks = '') {
  return requestJson(`/admin/investments/${encodeURIComponent(investmentId)}/approve`, {
    method: 'PUT',
    body: JSON.stringify({interest_rate: interestRate, remarks}),
  });
}

async function rejectAdminInvestment(investmentId: string, rejectionReason: string, remarks = '') {
  return requestJson(`/admin/investments/${encodeURIComponent(investmentId)}/reject`, {
    method: 'PUT',
    body: JSON.stringify({rejection_reason: rejectionReason, remarks}),
  });
}

type Tab = 'Pending Approval' | 'All Investments';
type Filter = 'All' | 'Active' | 'Matured' | 'Pending';

const money = (value: number) =>
  '₹' + Math.round(value).toLocaleString('en-IN');

const num = (v: any) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const statusOf = (x: ApiInvestment) => {
  const raw = String(
    x.status || x.investment_status || '',
  ).toLowerCase();

  if (raw.includes('pending') || raw.includes('approval')) return 'Pending';
  if (raw.includes('matur') || raw.includes('settled')) return 'Matured';
  return 'Active';
};

const AdminInvestmentManagementScreen = ({navigation}: any) => {
  const [tab, setTab] = useState<Tab>('Pending Approval');
  const [filter, setFilter] = useState<Filter>('All');

  const [all, setAll] = useState<ApiInvestment[]>([]);
  const [pending, setPending] = useState<ApiInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<ApiInvestment | null>(null);
  const [detail, setDetail] = useState<ApiInvestment | null>(null);
  const [selectedBond, setSelectedBond] = useState<ApiBond | null>(null);
  const [bondLoading, setBondLoading] = useState(false);

  const [rate, setRate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const [allRows, pendingRows] = await Promise.all([
        getAdminInvestments({limit: 100, offset: 0}),
        getAdminPendingInvestments(),
      ]);

      setAll(allRows);
      setPending(pendingRows);
    } catch (e: any) {
      setError(e?.message || 'Unable to load admin investments.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => {
    const source = tab === 'Pending Approval' ? pending : all;

    if (tab === 'Pending Approval') return source;

    if (filter === 'All') return source;
    return source.filter(x => statusOf(x) === filter);
  }, [all, pending, tab, filter]);

  const openReview = async (row: ApiInvestment) => {
    setSelected(row);
    setRate(String(num(row.interest_rate ?? row.rate)));
    setRemarks('');
    setRejectReason('');

    try {
      const latest = await getAdminInvestment(row.investment_id);
      setDetail(latest);
      setRate(String(num(latest.interest_rate ?? latest.rate)));
    } catch {
      setDetail(row);
    }
  };

  const approve = async () => {
    if (!selected) return;

    const parsedRate = Number(rate);
    if (!Number.isFinite(parsedRate) || parsedRate < 0) {
      Alert.alert('Invalid rate', 'Enter a valid interest rate.');
      return;
    }

    try {
      setActionBusy(true);

      await approveAdminInvestment(
        selected.investment_id,
        parsedRate,
        remarks.trim(),
      );

      setSelected(null);
      await load();

      Alert.alert(
        'Approved',
        `${selected.investment_id} was approved successfully.`,
      );
    } catch (e: any) {
      Alert.alert('Approval failed', e?.message || 'Could not approve.');
    } finally {
      setActionBusy(false);
    }
  };

  const reject = async () => {
    if (!selected) return;

    if (!rejectReason.trim()) {
      Alert.alert('Reason required', 'Enter a rejection reason.');
      return;
    }

    try {
      setActionBusy(true);

      await rejectAdminInvestment(
        selected.investment_id,
        rejectReason.trim(),
        remarks.trim(),
      );

      setSelected(null);
      await load();

      Alert.alert(
        'Rejected',
        `${selected.investment_id} was rejected successfully.`,
      );
    } catch (e: any) {
      Alert.alert('Rejection failed', e?.message || 'Could not reject.');
    } finally {
      setActionBusy(false);
    }
  };

  const openBond = async (row: ApiInvestment) => {
    try {
      setBondLoading(true);
      const bond = await getAdminInvestmentBond(row.investment_id);

      if (!bond) {
        Alert.alert(
          'Bond not generated',
          'This investment does not have a bond yet. Approve the investment first.',
        );
        return;
      }

      // Keep the admin flow inside this screen. The investor BondDetails
      // screen uses investor-scoped APIs, so navigating there with an admin
      // token can incorrectly call /investments/my-investments.
      setSelectedBond(bond);
    } catch (e: any) {
      Alert.alert('Unable to load bond', e?.message || 'Try again.');
    } finally {
      setBondLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

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
        }>
        <Text style={styles.title}>Investment Management</Text>
        <Text style={styles.subtitle}>
          Manage investments directly from the backend.
        </Text>

        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[
              styles.segmentPill,
              tab === 'Pending Approval' && styles.segmentPillActive,
            ]}
            onPress={() => setTab('Pending Approval')}>
            <Text
              style={[
                styles.segmentText,
                tab === 'Pending Approval' && styles.segmentTextActive,
              ]}>
              Pending Approval
            </Text>
            {pending.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentPill,
              tab === 'All Investments' && styles.segmentPillActive,
            ]}
            onPress={() => setTab('All Investments')}>
            <Text
              style={[
                styles.segmentText,
                tab === 'All Investments' && styles.segmentTextActive,
              ]}>
              All Investments
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'All Investments' && (
          <View style={styles.filterRow}>
            {(['All', 'Active', 'Matured', 'Pending'] as Filter[]).map(x => (
              <TouchableOpacity
                key={x}
                style={[
                  styles.filterPill,
                  filter === x && styles.filterPillActive,
                ]}
                onPress={() => setFilter(x)}>
                <Text
                  style={[
                    styles.filterPillText,
                    filter === x && styles.filterPillTextActive,
                  ]}>
                  {x}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading ? (
          <View style={{padding: 40, alignItems: 'center'}}>
            <ActivityIndicator />
            <Text style={{marginTop: 10}}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity
              style={styles.pendingReviewBtn}
              onPress={load}>
              <Text style={styles.pendingReviewText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {tab === 'Pending Approval'
                ? 'No pending investment requests.'
                : 'No investments to show.'}
            </Text>
          </View>
        ) : (
          rows.map(row => {
            const status = statusOf(row);

            return (
              <View key={`${row.id}-${row.investment_id}`} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View>
                    <Text style={styles.seriesLabel}>INVESTMENT ID</Text>
                    <Text style={styles.seriesId}>
                      {row.investment_id}
                    </Text>
                  </View>

                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{status}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.detailLabel}>Investor</Text>
                    <Text style={styles.detailValueDark}>
                      {row.investor_name || row.investor_id || '—'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Investor ID</Text>
                    <Text style={styles.detailValueDark}>
                      {row.investor_id || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.detailLabel}>Amount</Text>
                    <Text style={styles.detailValueDark}>
                      {money(num(row.investment_amount ?? row.amount))}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Interest Rate</Text>
                    <Text style={styles.detailValue}>
                      {num(row.interest_rate ?? row.rate)}% p.a.
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.detailLabel}>Tenure</Text>
                    <Text style={styles.detailValueDark}>
                      {num(row.tenure_months)} months
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Investment Date</Text>
                    <Text style={styles.detailValueDark}>
                      {row.investment_date || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View>
                    <Text style={styles.detailLabel}>Maturity Date</Text>
                    <Text style={styles.detailValueDark}>
                      {row.maturity_date || '—'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => openReview(row)}>
                    <Text style={styles.detailsBtnText}>View / Review</Text>
                  </TouchableOpacity>

                  {status !== 'Pending' && (
                    <TouchableOpacity
                      style={styles.bondBtn}
                      disabled={bondLoading}
                      onPress={() => openBond(row)}>
                      <Text style={styles.bondBtnText}>
                        {bondLoading ? 'Loading…' : 'Bond'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <AdminBottomTabBar active="Investments" navigation={navigation} />

      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {maxHeight: '90%'}]}>
            {selected && (
              <ScrollView>
                <Text style={styles.modalTitle}>
                  Review {selected.investment_id}
                </Text>

                <View style={{marginTop: 12}}>
                  <Text style={styles.detailLabel}>Investor</Text>
                  <Text style={styles.detailValueDark}>
                    {detail?.investor_name || selected.investor_name || '—'}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Amount
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {money(
                      num(
                        detail?.investment_amount ??
                          detail?.amount ??
                          selected.investment_amount ??
                          selected.amount,
                      ),
                    )}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Tenure
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {num(detail?.tenure_months ?? selected.tenure_months)} months
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Interest Rate (% p.a.)
                  </Text>
                  <TextInput
                    style={styles.rateInput}
                    keyboardType="decimal-pad"
                    value={rate}
                    onChangeText={setRate}
                  />

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Remarks
                  </Text>
                  <TextInput
                    style={[styles.rateInput, {height: 80}]}
                    multiline
                    textAlignVertical="top"
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Optional remarks"
                  />

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Rejection reason
                  </Text>
                  <TextInput
                    style={[styles.rateInput, {height: 80}]}
                    multiline
                    textAlignVertical="top"
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    placeholder="Required only for rejection"
                  />
                </View>

                <View style={styles.modalActionsRow3}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSelected(null)}>
                    <Text style={styles.modalCancelText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectBtn}
                    disabled={actionBusy}
                    onPress={reject}>
                    <Text style={styles.rejectBtnText}>
                      {actionBusy ? '...' : 'Reject'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalApproveBtn}
                    disabled={actionBusy}
                    onPress={approve}>
                    <Text style={styles.modalApproveText}>
                      {actionBusy ? '...' : 'Approve'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!selectedBond}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, {maxHeight: '90%'}]}>
            {selectedBond && (
              <ScrollView>
                <Text style={styles.modalTitle}>
                  Bond {selectedBond.bond_number || selectedBond.bond_id || selectedBond.investment_id}
                </Text>

                <View style={{marginTop: 12}}>
                  <Text style={styles.detailLabel}>Investment ID</Text>
                  <Text style={styles.detailValueDark}>
                    {selectedBond.investment_id || '—'}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Investor
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {selectedBond.investor_name || selectedBond.investor_id || '—'}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Principal Amount
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {money(num(selectedBond.investment_amount ?? selectedBond.amount))}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Interest Rate
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {num(selectedBond.interest_rate ?? selectedBond.rate)}% p.a.
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Tenure
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {num(selectedBond.tenure_months)} months
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Investment Date
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {selectedBond.investment_date || '—'}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Maturity Date
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {selectedBond.maturity_date || '—'}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Expected Interest
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {money(num(selectedBond.expected_interest_amount))}
                  </Text>

                  <Text style={[styles.detailLabel, {marginTop: 12}]}>
                    Maturity Amount
                  </Text>
                  <Text style={styles.detailValueDark}>
                    {money(num(selectedBond.maturity_amount))}
                  </Text>

                  {(selectedBond.bank_name ||
                    selectedBond.account_number ||
                    selectedBond.ifsc_code ||
                    selectedBond.bank) && (
                    <>
                      <Text style={[styles.detailLabel, {marginTop: 12}]}>
                        Bank
                      </Text>
                      <Text style={styles.detailValueDark}>
                        {selectedBond.bank_name || selectedBond.bank?.name || '—'}
                      </Text>
                      <Text style={[styles.detailLabel, {marginTop: 8}]}>
                        Account Number
                      </Text>
                      <Text style={styles.detailValueDark}>
                        {selectedBond.account_number ||
                          selectedBond.bank?.account_number ||
                          selectedBond.bank?.accountNumber ||
                          '—'}
                      </Text>
                      <Text style={[styles.detailLabel, {marginTop: 8}]}>
                        IFSC
                      </Text>
                      <Text style={styles.detailValueDark}>
                        {selectedBond.ifsc_code || selectedBond.bank?.ifsc || '—'}
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.modalActionsRow3}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setSelectedBond(null)}>
                    <Text style={styles.modalCancelText}>Close</Text>
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

export default AdminInvestmentManagementScreen;