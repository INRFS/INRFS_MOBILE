import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/MyInvestmentsScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';

import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

export type BondStatus =
  | 'Active'
  | 'Matured'
  | 'Pending Approval'
  | 'Pending Extension'
  | 'Pending Settlement';

export type Investment = {
  id: string;
  name: string;
  status: BondStatus;
  amount: number;
  rate: number;
  tenureMonths: number;
  investedOn: string;
  maturesOn: string;
  monthlyInterest: number;
  earned: number;
  // optional meta for pending action requests
  requestType?: 'investment' | 'extension' | 'settlement';
  extensionMonths?: number;
  penalty?: number;
  netAmount?: number;
};

const parseDisplayDate = (s: string): Date => {
  // support both "DD-MM-YYYY" and ISO-ish strings
  if (s.includes('-') && s.split('-')[0].length === 2) {
    const [d, m, y] = s.split('-').map(Number);
    if (!Number.isNaN(d) && !Number.isNaN(m) && !Number.isNaN(y)) {
      return new Date(y, m - 1, d);
    }
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const monthsBetween = (start: Date, end: Date): number => {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(months, 1);
};

export function useInvestments(investorId?: string): Investment[] {
  const {
    bonds,
    investmentRequests,
    investors,
    tenureExtensionRequests,
    preSettlementRequests,
  } = useAppData();

  const bondItems: Investment[] = bonds
    .filter(b => !investorId || b.investorId === investorId)
    .map(b => {
      const investedDate = parseDisplayDate(b.investedDate);
      const maturityDate = parseDisplayDate(b.maturityDate);
      const tenureMonths = b.tenureMonths ?? monthsBetween(investedDate, maturityDate);
      const years = tenureMonths / 12;
      const totalInterest = b.amount * (b.interestRate / 100) * years;

      // Check if this bond already has a pending extension / settlement
      const hasPendingExtension = tenureExtensionRequests.some(
        r =>
          r.bondSeriesId === b.seriesId &&
          r.status === 'Pending' &&
          (!investorId || r.investorId === investorId),
      );
      const hasPendingSettlement = preSettlementRequests.some(
        r =>
          r.bondSeriesId === b.seriesId &&
          r.status === 'Pending' &&
          (!investorId || r.investorId === investorId),
      );

      let status: BondStatus = b.status === 'Settled' ? 'Matured' : 'Active';
      if (hasPendingExtension) status = 'Pending Extension';
      if (hasPendingSettlement) status = 'Pending Settlement';

      return {
        id: b.seriesId,
        name: `INRFS Bond — ${b.seriesId}`,
        status,
        amount: b.amount,
        rate: b.interestRate,
        tenureMonths,
        investedOn: b.investedDate,
        maturesOn: b.maturityDate,
        monthlyInterest: totalInterest / tenureMonths,
        earned: 0,
        requestType: hasPendingExtension
          ? 'extension'
          : hasPendingSettlement
          ? 'settlement'
          : undefined,
      };
    });

  const pendingInvestmentItems: Investment[] = investmentRequests
    .filter(r => r.status === 'Pending' && (!investorId || r.investorId === investorId))
    .map(r => ({
      id: r.id,
      name: `INRFS Bond — ${r.tenureMonths}M (Pending)`,
      status: 'Pending Approval' as BondStatus,
      amount: r.amount,
      rate: r.interestRate,
      tenureMonths: r.tenureMonths,
      investedOn: r.requestedOn,
      maturesOn: '—',
      monthlyInterest: 0,
      earned: 0,
      requestType: 'investment' as const,
    }));

  // Stand-alone pending extension cards (in case bond list is filtered differently)
  const pendingExtensionItems: Investment[] = tenureExtensionRequests
    .filter(r => r.status === 'Pending' && (!investorId || r.investorId === investorId))
    .filter(r => !bondItems.some(b => b.id === r.bondSeriesId)) // avoid duplicates
    .map(r => ({
      id: r.bondSeriesId,
      name: `INRFS Bond — ${r.bondSeriesId}`,
      status: 'Pending Extension' as BondStatus,
      amount: 0,
      rate: 0,
      tenureMonths: r.currentTenureMonths,
      investedOn: r.requestedOn,
      maturesOn: '—',
      monthlyInterest: 0,
      earned: 0,
      requestType: 'extension' as const,
      extensionMonths: r.extensionMonths,
    }));

  const pendingSettlementItems: Investment[] = preSettlementRequests
    .filter(r => r.status === 'Pending' && (!investorId || r.investorId === investorId))
    .filter(r => !bondItems.some(b => b.id === r.bondSeriesId))
    .map(r => ({
      id: r.bondSeriesId,
      name: `INRFS Bond — ${r.bondSeriesId}`,
      status: 'Pending Settlement' as BondStatus,
      amount: r.principal,
      rate: 0,
      tenureMonths: 0,
      investedOn: r.requestedOn,
      maturesOn: '—',
      monthlyInterest: 0,
      earned: r.earned,
      requestType: 'settlement' as const,
      penalty: r.penalty,
      netAmount: r.netAmount,
    }));

  return [
    ...pendingInvestmentItems,
    ...pendingExtensionItems,
    ...pendingSettlementItems,
    ...bondItems,
  ];
}

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const EXTENSION_OPTIONS = [12, 24, 36];
const EARLY_EXIT_PENALTY_RATE = 0.02; // 2%

type FilterKey = 'all' | 'pending';

const MyInvestmentsScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const {
    requestTenureExtension,
    requestPreSettlement,
    investors,
  } = useAppData();

  const items = useInvestments(investorId);

  const investorName =
    investors.find(inv => inv.id === investorId)?.name || 'Investor';

  // ---- Tenure extension modal state ----
  const [tenureModalBond, setTenureModalBond] = useState<Investment | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<number>(EXTENSION_OPTIONS[0]);

  // ---- Settlement (pre-settlement) modal state ----
  const [settlementModalBond, setSettlementModalBond] = useState<Investment | null>(null);

  const filtered = useMemo(() => {
    let list = items;

    if (filter === 'pending') {
      list = list.filter(
        inv =>
          inv.status === 'Pending Approval' ||
          inv.status === 'Pending Extension' ||
          inv.status === 'Pending Settlement',
      );
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        inv =>
          inv.id.toLowerCase().includes(q) ||
          inv.name.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query, items, filter]);

  const totalValue = useMemo(
    () => items.reduce((sum, inv) => sum + inv.amount + inv.earned, 0),
    [items],
  );

  const pendingCount = useMemo(
    () =>
      items.filter(
        inv =>
          inv.status === 'Pending Approval' ||
          inv.status === 'Pending Extension' ||
          inv.status === 'Pending Settlement',
      ).length,
    [items],
  );

  // ---------- Export to Excel ----------
  const handleExport = async () => {
    try {
      const rows = items.map(inv => ({
        'Bond Number': inv.id,
        'Bond Name': inv.name,
        Status: inv.status,
        'Amount (₹)': inv.amount,
        'Rate (% p.a.)': inv.rate,
        'Tenure (Months)': inv.tenureMonths,
        'Invested On': inv.investedOn,
        'Matures On': inv.maturesOn,
        'Monthly Interest (₹)': inv.monthlyInterest,
        'Earned (₹)': inv.earned,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'My Investments');
      const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});

      const fileName = `INRFS_My_Investments_${Date.now()}.xlsx`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64, 'base64');

      await RNShare.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
      });
    } catch (err: any) {
      if (err?.message && !/user did not share/i.test(err.message)) {
        Alert.alert('Export failed', 'Could not generate the Excel file. Please try again.');
      }
    }
  };

  // ---------- Tenure extension ----------
  const openTenureModal = (inv: Investment) => {
    if (
      inv.status === 'Pending Extension' ||
      inv.status === 'Pending Settlement' ||
      inv.status === 'Pending Approval'
    ) {
      return;
    }
    setSelectedExtension(EXTENSION_OPTIONS[0]);
    setTenureModalBond(inv);
  };

  const handleConfirmExtension = () => {
    if (!tenureModalBond || !investorId) return;

    requestTenureExtension({
      bondSeriesId: tenureModalBond.id,
      investorId,
      investorName,
      currentTenureMonths: tenureModalBond.tenureMonths,
      extensionMonths: selectedExtension,
    });

    Alert.alert(
      'Request submitted',
      `Your request to extend ${tenureModalBond.id} by ${selectedExtension} months has been sent to the admin for approval.`,
    );
    setTenureModalBond(null);
  };

  // ---------- Pre-settlement ----------
  const openSettlementModal = (inv: Investment) => {
    if (
      inv.status === 'Pending Extension' ||
      inv.status === 'Pending Settlement' ||
      inv.status === 'Pending Approval'
    ) {
      return;
    }
    setSettlementModalBond(inv);
  };

  const handleRequestSettlement = () => {
    if (!settlementModalBond || !investorId) return;

    const penalty = settlementModalBond.amount * EARLY_EXIT_PENALTY_RATE;
    const net = settlementModalBond.amount + settlementModalBond.earned - penalty;

    requestPreSettlement({
      bondSeriesId: settlementModalBond.id,
      investorId,
      investorName,
      principal: settlementModalBond.amount,
      earned: settlementModalBond.earned,
      penalty,
      netAmount: net,
    });

    Alert.alert(
      'Settlement requested',
      `Your pre-settlement request for ${settlementModalBond.id} has been sent to the admin for approval.`,
    );
    setSettlementModalBond(null);
  };

  const settlementPenalty = settlementModalBond
    ? settlementModalBond.amount * EARLY_EXIT_PENALTY_RATE
    : 0;
  const settlementNet = settlementModalBond
    ? settlementModalBond.amount + settlementModalBond.earned - settlementPenalty
    : 0;

  const statusBadgeStyle = (status: BondStatus) => {
    switch (status) {
      case 'Active':
        return styles.statusBadgeActive;
      case 'Matured':
        return styles.statusBadgeMatured;
      case 'Pending Approval':
      case 'Pending Extension':
      case 'Pending Settlement':
        return styles.statusBadgePending;
      default:
        return styles.statusBadgeMatured;
    }
  };

  const statusTextStyle = (status: BondStatus) => {
    switch (status) {
      case 'Active':
        return styles.statusBadgeTextActive;
      case 'Matured':
        return styles.statusBadgeTextMatured;
      case 'Pending Approval':
      case 'Pending Extension':
      case 'Pending Settlement':
        return styles.statusBadgeTextPending;
      default:
        return styles.statusBadgeTextMatured;
    }
  };

  const canShowActions = (status: BondStatus) =>
    status === 'Active' || status === 'Matured';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={{uri: 'https://i.pravatar.cc/64?img=5'}} style={styles.avatar} />
          <Text style={styles.headerTitle}>My Investments</Text>
        </View>
        <TouchableOpacity>
          <Icon name="bell-outline" size={20} color="#1A1A18" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.heroValue}>{formatINR(totalValue)}</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={18} color="#9C9689" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search bonds..."
              placeholderTextColor="#9C9689"
            />
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Icon name="export-variant" size={16} color="#1A1A18" />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        {/* ---------- Filter tabs (All / Pending) ---------- */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}>
            <Text style={[styles.filterChipText, filter === 'all' && styles.filterChipTextActive]}>
              All Investments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
            onPress={() => setFilter('pending')}>
            <Text
              style={[
                styles.filterChipText,
                filter === 'pending' && styles.filterChipTextActive,
              ]}>
              Pending Investments
              {pendingCount > 0 ? ` (${pendingCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Investment details</Text>
          <Text style={styles.recordCount}>
            Showing {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="briefcase-outline" size={40} color="#9C9689" />
            <Text style={styles.emptyTitle}>
              {filter === 'pending' ? 'No pending requests' : 'No investments yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'pending'
                ? 'Tenure extensions and pre-settlements awaiting admin will appear here.'
                : 'Start by creating a new investment.'}
            </Text>
          </View>
        ) : (
          filtered.map((inv, i) => (
            <View
              key={`${inv.id}-${inv.status}-${i}`}
              style={[styles.investmentCard, i === 0 && styles.investmentCardFirst]}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.idLabel}>INVESTMENT ID</Text>
                  <Text
                    style={[
                      styles.bondId,
                      (inv.status === 'Pending Approval' ||
                        inv.status === 'Pending Extension' ||
                        inv.status === 'Pending Settlement') &&
                        styles.bondIdPending,
                    ]}>
                    {inv.status === 'Pending Approval' ? 'Pending' : inv.id}
                  </Text>
                </View>
                <View style={[styles.statusBadge, statusBadgeStyle(inv.status)]}>
                  <Text style={[styles.statusBadgeText, statusTextStyle(inv.status)]}>
                    {inv.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.bondName}>{inv.name}</Text>

              <View style={styles.metaGrid}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>AMOUNT</Text>
                  <Text style={styles.metaValue}>{formatINR(inv.amount)}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>RATE</Text>
                  <Text style={styles.metaValueGold}>{inv.rate}% p.a.</Text>
                </View>
              </View>
              <View style={styles.metaGrid}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>INVESTED ON</Text>
                  <Text style={styles.metaValue}>{inv.investedOn}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>MATURES ON</Text>
                  <Text style={styles.metaValue}>{inv.maturesOn}</Text>
                </View>
              </View>
              <View style={styles.metaGrid}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>MONTHLY INT.</Text>
                  <Text style={styles.metaValue}>{formatINR(inv.monthlyInterest)}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>EARNED</Text>
                  <Text style={styles.metaValueGreen}>{formatINR(inv.earned)}</Text>
                </View>
              </View>

              {inv.status === 'Pending Approval' ||
              inv.status === 'Pending Extension' ||
              inv.status === 'Pending Settlement' ? (
                <Text style={styles.pendingHint}>
                  {inv.status === 'Pending Extension'
                    ? `Waiting for Admin Approval — extension of ${
                        inv.extensionMonths ?? '—'
                      } months requested.`
                    : inv.status === 'Pending Settlement'
                    ? 'Waiting for Admin Approval — pre-settlement request submitted.'
                    : 'Waiting for Admin Approval — actions unlock once approved.'}
                </Text>
              ) : canShowActions(inv.status) ? (
                <View style={styles.actionIconRow}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() =>
                      navigation.navigate('BondDetails', {investorId, bondId: inv.id})
                    }>
                    <Icon name="eye-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openTenureModal(inv)}>
                    <Icon name="calendar-clock" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Tenure</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openSettlementModal(inv)}>
                    <Icon name="cash-refund" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Settle</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))
        )}

        <TouchableOpacity
          style={styles.newInvestmentBtn}
          onPress={() => navigation.navigate('InvestNow', {investorId})}>
          <Icon name="plus-circle-outline" size={18} color="#8A6D2F" />
          <Text style={styles.newInvestmentBtnText}>New Investment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Tenure Extension modal ---------- */}
      <Modal
        visible={!!tenureModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setTenureModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Extend Tenure — {tenureModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setTenureModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>Extension Period</Text>
            <View style={styles.modalChipRow}>
              {EXTENSION_OPTIONS.map(months => {
                const active = selectedExtension === months;
                return (
                  <TouchableOpacity
                    key={months}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSelectedExtension(months)}>
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {months} Months
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setTenureModalBond(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmExtension}>
                <Text style={styles.modalConfirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Settlement (pre-settlement) modal ---------- */}
      <Modal
        visible={!!settlementModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setSettlementModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Settlement — {settlementModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setSettlementModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {settlementModalBond && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Principal</Text>
                  <Text style={styles.modalRowValue}>
                    {formatINR(settlementModalBond.amount)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Interest Earned</Text>
                  <Text style={styles.modalRowValueGreen}>
                    {formatINR(settlementModalBond.earned)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Early Exit Penalty (2%)</Text>
                  <Text style={styles.modalRowValueRed}>-{formatINR(settlementPenalty)}</Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalNetLabel}>Net Settlement</Text>
                  <Text style={styles.modalNetValue}>{formatINR(settlementNet)}</Text>
                </View>
              </>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSettlementModalBond(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleRequestSettlement}>
                <Text style={styles.modalConfirmBtnText}>Request Settlement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar active="My Investments" navigation={navigation} investorId={investorId} />
    </SafeAreaView>
  );
};

export default MyInvestmentsScreen;