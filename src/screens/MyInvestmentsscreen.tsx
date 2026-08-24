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
  | 'Matured'
  | 'Pending Approval'
  | 'Pending Extension'
  | 'Pending Settlement';

type FilterTab = 'all' | 'active' | 'pending' | 'others';

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

function apiStatus(item: ApiInvestment): BondStatus {
  const raw = String(
    item.status || item.investment_status || '',
  ).trim().toLowerCase();

  // Prefer an explicit status returned by the backend.
  if (raw.includes('pending') && raw.includes('extension')) {
    return 'Pending Extension';
  }
  if (
    raw.includes('pending') &&
    (raw.includes('settlement') || raw.includes('preclose') || raw.includes('close'))
  ) {
    return 'Pending Settlement';
  }
  if (raw.includes('pre-close') || raw.includes('preclose')) {
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

  // If the record has not been approved and status is 1, treat as pending approval.
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
  const bondNum = String(item.bond_number ?? item.bond_id ?? '').trim();

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
    bondNumber: bondNum || undefined,
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
    case 'Pending Extension':
    case 'Pending Settlement':
    case 'Pending Approval':
      return {bg: '#FEF3C7', fg: '#B45309'};
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
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const [view, setView] = useState<Investment | null>(null);
  const [extension, setExtension] = useState<Investment | null>(null);
  const [extensionMonths, setExtensionMonths] = useState(3);
  const [preclose, setPreclose] = useState<Investment | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const response = await investorService.getMyInvestments();
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

  const counts = useMemo(() => {
    let active = 0;
    let pending = 0;
    let others = 0;

    items.forEach(item => {
      if (item.status === 'Active') {
        active++;
      } else if (item.status === 'Pending Approval') {
        pending++;
      } else {
        others++;
      }
    });

    return {
      all: items.length,
      active,
      pending,
      others,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter(item => {
      const isActive = item.status === 'Active';
      const isPending = item.status === 'Pending Approval';
      const isOther = !isActive && !isPending;

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
  }, [items, activeTab, query]);

  const total = useMemo(
    () => items.reduce((sum, x) => sum + x.amount + x.earned, 0),
    [items],
  );

  const openDetails = async (item: Investment) => {
    setView(item);
    try {
      const detail = await investorService.getInvestmentDetails(item.investmentDbId);
      if (detail) {
        setView(mapInvestment(detail));
      }
    } catch (e: any) {
      console.log('Could not fetch rich investment details:', e?.message);
    }
  };

  const submitExtension = async () => {
    if (!extension) return;

    if (!validation.isValidExtensionMonths(extensionMonths)) {
      Alert.alert('Invalid Duration', 'Please select a valid extension tenure.');
      return;
    }

    try {
      setBusy(true);
      await investorService.requestTenureExtension(
        extension.investmentDbId,
        extensionMonths,
        '',
      );

      setExtension(null);
      await load();

      Alert.alert(
        'Request Submitted',
        `${extension.id}: ${extensionMonths}-month tenure extension request sent to admin for approval.`,
      );
    } catch (e: any) {
      Alert.alert(
        'Extension Failed',
        e?.message || 'Could not submit the extension request.',
      );
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
      await investorService.requestPreclose(preclose.investmentDbId, reason.trim());

      setPreclose(null);
      setReason('');
      await load();

      Alert.alert(
        'Pre-Close Requested',
        `${preclose.id}: Request sent to admin for approval. Status is now Pending Approval.`,
      );
    } catch (e: any) {
      Alert.alert(
        'Pre-Close Failed',
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
        'Bond Number': x.bondNumber || '—',
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

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return 'No active investments';
      case 'pending':
        return 'No pending investments';
      case 'others':
        return 'No other investments';
      default:
        return 'No investments yet';
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
              {getEmptyMessage()}
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

                {item.status === 'Active' && item.bondNumber ? (
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
                    <Icon name="file-certificate-outline" size={14} color="#16A34A" />
                    <Text style={{fontSize: 12, fontWeight: '700', color: '#16A34A'}}>
                      Bond: {item.bondNumber}
                    </Text>
                  </TouchableOpacity>
                ) : isPending ? (
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
                    {/* View Action -> Investment Details */}
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => openDetails(item)}>
                      <Icon name="eye-outline" size={18} color="#1A1A18" />
                      <Text style={styles.actionIconBtnText}>View</Text>
                    </TouchableOpacity>

                    {/* Bond Action -> Bond Certificate */}
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() =>
                        navigation.navigate('BondDetails', {
                          investorId,
                          bondId: item.investmentDbId,
                          bondDisplayId: item.bondNumber || item.id,
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