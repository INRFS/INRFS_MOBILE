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
  StyleSheet,
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
  // NEW: which stage a pending pre-close request is at — lets the UI show
  // "Waiting for Admin Approval" vs "Waiting for Super Admin Approval"
  // even though both stages share the same 'Pending Settlement' badge.
  settlementStage?: 'Pending' | 'PendingSuperAdmin';
   extensionStage?: 'Pending' | 'PendingSuperAdmin';
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
      const linkedExtensionReq = tenureExtensionRequests.find(
        r =>
          r.bondSeriesId === b.seriesId &&
          (r.status === 'Pending' || r.status === 'PendingSuperAdmin') &&
          (!investorId || r.investorId === investorId),
      );
      const hasPendingExtension = !!linkedExtensionReq;
   const linkedSettlementReq = preSettlementRequests.find(
        r =>
          r.bondSeriesId === b.seriesId &&
          (r.status === 'Pending' || r.status === 'PendingSuperAdmin') &&
          (!investorId || r.investorId === investorId),
      );
      const hasPendingSettlement = !!linkedSettlementReq;

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
      settlementStage: linkedSettlementReq?.status as
          | 'Pending'
          | 'PendingSuperAdmin'
          | undefined,
        extensionStage: linkedExtensionReq?.status as
          | 'Pending'
          | 'PendingSuperAdmin'
          | undefined,
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
    .filter(
      r =>
        (r.status === 'Pending' || r.status === 'PendingSuperAdmin') &&
        (!investorId || r.investorId === investorId),
    )
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
      extensionStage: r.status as 'Pending' | 'PendingSuperAdmin',
    }));

const pendingSettlementItems: Investment[] = preSettlementRequests
    .filter(
      r =>
        (r.status === 'Pending' || r.status === 'PendingSuperAdmin') &&
        (!investorId || r.investorId === investorId),
    )
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
    settlementStage: r.status as 'Pending' | 'PendingSuperAdmin',
    }));

  return [
    ...pendingInvestmentItems,
    ...pendingExtensionItems,
    ...pendingSettlementItems,
    ...bondItems,
  ];
}

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// FIX: was [12, 24, 36] — the web "Request Tenure Extension" modal offers
// 3 / 6 / 12 / 36 months, so mobile now matches it exactly.
const EXTENSION_OPTIONS = [3, 6, 12, 36];
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

  // ---- View details modal state ----
  const [viewModalBond, setViewModalBond] = useState<Investment | null>(null);

  // ---- Tenure extension modal state ----
  const [tenureModalBond, setTenureModalBond] = useState<Investment | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<number>(EXTENSION_OPTIONS[0]);

  // ---- Settlement (pre-close) modal state ----
  const [settlementModalBond, setSettlementModalBond] = useState<Investment | null>(null);
  // Matches the web "REASON FOR PRE-CLOSE" field — investor must state
  // why they're closing early, and this is what shows up on the admin's
  // Settlement screen under each Pre-Close request.
  const [preCloseReason, setPreCloseReason] = useState('');

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

  // ---------- View details ----------
  const openViewModal = (inv: Investment) => {
    setViewModalBond(inv);
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

  // ---------- Pre-Close (pre-settlement) ----------
  const openSettlementModal = (inv: Investment) => {
    if (
      inv.status === 'Pending Extension' ||
      inv.status === 'Pending Settlement' ||
      inv.status === 'Pending Approval'
    ) {
      return;
    }
    setPreCloseReason(''); // reset each time the modal opens
    setSettlementModalBond(inv);
  };

  const handleRequestSettlement = () => {
    if (!settlementModalBond || !investorId) return;

    // Reason is required, matching web's disabled-until-filled button
    if (!preCloseReason.trim()) {
      Alert.alert(
        'Reason required',
        'Please briefly state your reason for pre-closing this investment.',
      );
      return;
    }

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
      reason: preCloseReason.trim(), // NEW: surfaced on admin's Settlement screen
    });

    Alert.alert(
      'Pre-Close requested',
      `Your pre-close request for ${settlementModalBond.id} has been sent to the admin for approval.`,
    );
    setSettlementModalBond(null);
    setPreCloseReason('');
  };

  // ---------- Bond download (matured investments) ----------
  const handleDownloadBond = (inv: Investment) => {
    // TODO: wire up real bond-certificate generation/download for matured bonds
    Alert.alert('Download Bond', `Downloading certificate for ${inv.id}...`);
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
                    ? inv.extensionStage === 'PendingSuperAdmin'
                      ? `Waiting for Super Admin Approval — your ${
                          inv.extensionMonths ?? '—'
                        }-month extension has been approved by the admin and sent for final approval.`
                      : `Waiting for Admin Approval — extension of ${
                          inv.extensionMonths ?? '—'
                        } months requested.`
                    : inv.status === 'Pending Settlement'
                    ? inv.settlementStage === 'PendingSuperAdmin'
                      ? 'Waiting for Super Admin Approval — your pre-close request has been approved by the admin and sent for final settlement.'
                      : 'Waiting for Admin Approval — pre-close request submitted.'
                    : 'Waiting for Admin Approval — actions unlock once approved.'}
                </Text>
              ) : inv.status === 'Matured' ? (
                // Matured: only View + Bond — nothing left to extend or
                // pre-close once the bond has already reached maturity.
                <View style={styles.actionIconRow}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openViewModal(inv)}>
                    <Icon name="eye-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() =>
                      navigation.navigate('BondDetails', {investorId, bondId: inv.id})
                    }>
                    <Icon name="download-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Bond</Text>
                  </TouchableOpacity>
                </View>
              ) : inv.status === 'Active' ? (
                // FIX: Active bonds were missing the "Bond" (download)
                // action — the web portal shows View / Bond / Extend /
                // Pre-Close for an Active row, but this branch previously
                // only rendered View, Extend, and Pre-Close. Added Bond
                // in between to match.
                <View style={styles.actionIconRow}>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openViewModal(inv)}>
                    <Icon name="eye-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() =>
                      navigation.navigate('BondDetails', {investorId, bondId: inv.id})
                    }>
                    <Icon name="download-outline" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Bond</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openTenureModal(inv)}>
                    <Icon name="calendar-clock" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Extend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIconBtn}
                    onPress={() => openSettlementModal(inv)}>
                    <Icon name="cash-refund" size={18} color="#1A1A18" />
                    <Text style={styles.actionIconBtnText}>Pre-Close</Text>
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

      {/* ---------- View details modal ---------- */}
      <Modal
        visible={!!viewModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>{viewModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setViewModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {viewModalBond && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Status</Text>
                  <View style={[styles.statusBadge, statusBadgeStyle(viewModalBond.status)]}>
                    <Text style={[styles.statusBadgeText, statusTextStyle(viewModalBond.status)]}>
                      {viewModalBond.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Principal Amount</Text>
                  <Text style={styles.modalRowValue}>{formatINR(viewModalBond.amount)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Interest Rate</Text>
                  <Text style={styles.modalRowValue}>{viewModalBond.rate}% p.a.</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Invested On</Text>
                  <Text style={styles.modalRowValue}>{viewModalBond.investedOn}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Matures On</Text>
                  <Text style={styles.modalRowValue}>{viewModalBond.maturesOn}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Monthly Interest</Text>
                  <Text style={styles.modalRowValue}>
                    {formatINR(viewModalBond.monthlyInterest)}
                  </Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalNetLabel}>Total Earned</Text>
                  <Text style={styles.modalRowValueGreen}>
                    {formatINR(viewModalBond.earned)}
                  </Text>
                </View>
              </>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setViewModalBond(null)}>
                <Text style={styles.modalCancelBtnText}>Close</Text>
              </TouchableOpacity>
              {viewModalBond?.status === 'Matured' && (
                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={() => {
                    handleDownloadBond(viewModalBond);
                    setViewModalBond(null);
                  }}>
                  <Text style={styles.modalConfirmBtnText}>Download Bond</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Tenure Extension modal ---------- */}
      <Modal
        visible={!!tenureModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setTenureModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>
                Request Tenure Extension — {tenureModalBond?.id}
              </Text>
              <TouchableOpacity onPress={() => setTenureModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>
              Select how many months you would like to extend this investment. The request will
              be sent to your branch admin for approval.
            </Text>
            <Text style={styles.modalFieldLabel}>EXTENSION PERIOD</Text>
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
                <Text style={styles.modalConfirmBtnText}>Submit Extension Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Pre-Close (pre-settlement) modal ---------- */}
      <Modal
        visible={!!settlementModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setSettlementModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Request Pre-Close — {settlementModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setSettlementModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {settlementModalBond && (
              <>
                {/* NEW: matches web's "Early Closure Notice" banner */}
                <View style={localStyles.noticeBox}>
                  <Text style={localStyles.noticeTitle}>Early Closure Notice</Text>
                  <Text style={localStyles.noticeText}>
                    Pre-closing your investment before maturity may attract a penalty. Your
                    request will be reviewed by the admin and moved to the settlement queue.
                  </Text>
                </View>

                {/* NEW: matches web's "REASON FOR PRE-CLOSE" field */}
                <Text style={localStyles.reasonLabel}>REASON FOR PRE-CLOSE</Text>
                <TextInput
                  style={localStyles.reasonInput}
                  value={preCloseReason}
                  onChangeText={setPreCloseReason}
                  placeholder="Briefly state your reason..."
                  placeholderTextColor="#9C9689"
                  multiline
                />

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
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  !preCloseReason.trim() && localStyles.modalConfirmBtnDisabled,
                ]}
                disabled={!preCloseReason.trim()}
                onPress={handleRequestSettlement}>
                <Text style={styles.modalConfirmBtnText}>Submit Pre-Close Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar active="My Investments" navigation={navigation} investorId={investorId} />
    </SafeAreaView>
  );
};

// NEW: local styles for the Pre-Close reason UI (kept local since these
// aren't part of the shared MyInvestmentsScreen.styles.ts sheet)
const localStyles = StyleSheet.create({
  noticeBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noticeTitle: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  noticeText: {
    color: '#7F1D1D',
    fontSize: 12,
    textAlign: 'center',
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    fontSize: 13,
    color: '#1A1A18',
    marginBottom: 16,
  },
  modalConfirmBtnDisabled: {
    opacity: 0.5,
  },
});

export default MyInvestmentsScreen;