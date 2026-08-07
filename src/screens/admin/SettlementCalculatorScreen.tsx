import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/SettlementCalculatorScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// This screen is a queue of REAL pending settlement work, split into the
// same two tabs as web:
//   - "Tenure Timeout"   → bonds that have matured (maturityDate has
//                          passed) and are still 'Active', awaiting the
//                          admin's final settlement approval. This now
//                          reacts purely to the date — no investor request
//                          is required for a bond to land here.
//   - "Pre-Close Requests" → investor-submitted early-exit requests, each
//                            carrying the reason the investor entered in
//                            the mobile/web Pre-Close modal.
// ---------------------------------------------------------------------------

type Tab = 'timeout' | 'preclose';

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Maturity date handling
// AppNavigator stores maturityDate as dd-mm-yyyy (see formatDDMMYYYY /
// parseDDMMYYYY there). parseAppDate mirrors that exact format so this
// screen agrees with the rest of the app on what a stored date means.
// isMaturityCrossed compares only calendar dates (time zeroed out) so a
// bond becomes "Tenure Timeout" starting the day it matures, not before.
// ---------------------------------------------------------------------------
const parseAppDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null;
  const [d, m, y] = parts;
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
};

const isMaturityCrossed = (maturityDate?: string): boolean => {
  const dt = parseAppDate(maturityDate);
  if (!dt) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime() <= today.getTime();
};

const SettlementCalculatorScreen = ({navigation}: any) => {
  const {
    bonds,
    investors,
    preSettlementRequests,
    approvePreSettlement,
    rejectPreSettlement,
    settleMaturedBond,
  } = useAppData();

  const [tab, setTab] = useState<Tab>('timeout');

  // Same lookup pattern BondTrackingScreen uses — match on id first, fall
  // back to name, so branch/investor-id display works whichever field a
  // given record happens to have populated.
  const norm = (s?: string) => (s || '').trim().toLowerCase();
  const getInvestor = (id?: string, name?: string) =>
    investors.find(i => (id && i.id === id) || (name && norm(i.name) === norm(name)));

  // ---- Tenure Timeout: bonds whose maturity date has passed ----
  // A bond belongs here the moment its maturityDate is today or earlier,
  // as long as it's still 'Active' — i.e. nobody has settled it yet,
  // whether via this tab's Approve Settlement or via a pre-close approval
  // (both of which flip status to 'Settled', which removes it from here).
  const timeoutBonds = bonds.filter(
    b => b.status === 'Active' && isMaturityCrossed(b.maturityDate),
  );

  const timeoutRows = timeoutBonds.map(b => {
    const inv = getInvestor(b.investorId, b.investorName);
    const tenureMonths =
      b.tenureMonths ??
      Math.max(
        (new Date(b.maturityDate).getFullYear() - new Date(b.investedDate).getFullYear()) * 12 +
          (new Date(b.maturityDate).getMonth() - new Date(b.investedDate).getMonth()),
        1,
      );
    const totalInterest = b.amount * (b.interestRate / 100) * (tenureMonths / 12);
    const netSettlement = b.amount + totalInterest;
    return {
      bond: b,
      investorName: inv?.name || b.investorName,
      investorRefId: inv?.id || '—',
      branch: inv?.branch && inv.branch !== '—' ? inv.branch : '—',
      principal: b.amount,
      totalInterest,
      netSettlement,
    };
  });

  // ---- Pre-Close Requests: investor-submitted early exits ----
  const pendingPreClose = preSettlementRequests.filter(r => r.status === 'Pending');

  const handleApproveTimeout = (bondSeriesId: string, netSettlement: number, investorName: string) => {
    Alert.alert(
      'Approve settlement',
      `Approve ${formatINR(netSettlement)} settlement for ${investorName} (${bondSeriesId})?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Approve',
          onPress: () => settleMaturedBond(bondSeriesId),
        },
      ],
    );
  };

  const handleApprovePreClose = (id: string, bondSeriesId: string, netAmount: number, investorName: string) => {
    Alert.alert(
      'Approve pre-close',
      `Settle ${bondSeriesId} and pay out ${formatINR(netAmount)} to ${investorName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Approve', onPress: () => approvePreSettlement(id)},
      ],
    );
  };

  const handleRejectPreClose = (id: string, bondSeriesId: string) => {
    Alert.alert(
      'Reject pre-close',
      `Reject the pre-close request for ${bondSeriesId}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', style: 'destructive', onPress: () => rejectPreSettlement(id)},
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏦  INRFS</Text>
        <View style={{width: 20}} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settlement Management</Text>
        <Text style={styles.subtitle}>Review and approve settlement requests</Text>

        <View style={local.tabRow}>
          <TouchableOpacity
            style={[local.tabPill, tab === 'timeout' && local.tabPillActive]}
            onPress={() => setTab('timeout')}>
            <Text style={[local.tabText, tab === 'timeout' && local.tabTextActive]}>
              Tenure Timeout
            </Text>
            {timeoutRows.length > 0 && (
              <View style={local.tabBadge}>
                <Text style={local.tabBadgeText}>{timeoutRows.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[local.tabPill, tab === 'preclose' && local.tabPillActive]}
            onPress={() => setTab('preclose')}>
            <Text style={[local.tabText, tab === 'preclose' && local.tabTextActive]}>
              Pre-Close Requests
            </Text>
            {pendingPreClose.length > 0 && (
              <View style={local.tabBadge}>
                <Text style={local.tabBadgeText}>{pendingPreClose.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ===================== TENURE TIMEOUT ===================== */}
        {tab === 'timeout' && (
          <>
            {timeoutRows.length === 0 && (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>No matured bonds awaiting settlement.</Text>
              </View>
            )}
            {timeoutRows.map(row => (
              <View key={row.bond.seriesId} style={local.card}>
                <View style={local.cardTopRow}>
                  <View style={local.cardTopLeft}>
                    <Text style={local.bondId}>{row.bond.seriesId}</Text>
                    <View style={local.pendingBadge}>
                      <Text style={local.pendingBadgeText}>Pending</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={local.approveBtn}
                    onPress={() =>
                      handleApproveTimeout(row.bond.seriesId, row.netSettlement, row.investorName)
                    }>
                    <Text style={local.approveBtnText}>↗  Approve Settlement</Text>
                  </TouchableOpacity>
                </View>

                <View style={local.metaGrid}>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Investor</Text>
                    <Text style={local.metaValue}>{row.investorName}</Text>
                  </View>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Investor ID</Text>
                    <Text style={local.metaValue}>{row.investorRefId}</Text>
                  </View>
                </View>
                <View style={local.metaGrid}>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Branch</Text>
                    <Text style={local.metaValue}>{row.branch}</Text>
                  </View>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Matured On</Text>
                    <Text style={local.metaValue}>{row.bond.maturityDate}</Text>
                  </View>
                </View>

                <View style={local.breakdown}>
                  <View style={local.breakdownRow}>
                    <Text style={local.breakdownLabel}>Principal</Text>
                    <Text style={local.breakdownValue}>{formatINR(row.principal)}</Text>
                  </View>
                  <View style={local.breakdownRow}>
                    <Text style={local.breakdownLabel}>Total Interest Earned</Text>
                    <Text style={local.breakdownValue}>{formatINR(row.totalInterest)}</Text>
                  </View>
                  <View style={local.breakdownRowLast}>
                    <Text style={local.netLabel}>Net Settlement Amount</Text>
                    <Text style={local.netValue}>{formatINR(row.netSettlement)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ===================== PRE-CLOSE REQUESTS ===================== */}
        {tab === 'preclose' && (
          <>
            {pendingPreClose.length === 0 && (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>No pre-close requests pending.</Text>
              </View>
            )}
            {pendingPreClose.map(r => {
              const inv = getInvestor(r.investorId, r.investorName);
              const branch = inv?.branch && inv.branch !== '—' ? inv.branch : '—';
              // `reason` is a first-class field on PreSettlementRequest
              // (populated from the investor's Pre-Close modal).
              const reason = r.reason;
              return (
                <View key={r.id} style={local.card}>
                  <View style={local.cardTopRow}>
                    <View style={local.cardTopLeft}>
                      <Text style={local.bondId}>{r.bondSeriesId}</Text>
                      <View style={local.pendingBadge}>
                        <Text style={local.pendingBadgeText}>Pending</Text>
                      </View>
                      <View style={local.precloseBadge}>
                        <Text style={local.precloseBadgeText}>Pre-Close</Text>
                      </View>
                    </View>
                  </View>

                  <View style={local.metaGrid}>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Investor</Text>
                      <Text style={local.metaValue}>{r.investorName}</Text>
                    </View>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Branch</Text>
                      <Text style={local.metaValue}>{branch}</Text>
                    </View>
                  </View>
                  <View style={local.metaGrid}>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Requested On</Text>
                      <Text style={local.metaValue}>{r.requestedOn}</Text>
                    </View>
                  </View>

                  {reason ? (
                    <View style={local.reasonBox}>
                      <Text style={local.reasonLabel}>Reason: </Text>
                      <Text style={local.reasonText}>{reason}</Text>
                    </View>
                  ) : null}

                  <View style={local.breakdown}>
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Principal</Text>
                      <Text style={local.breakdownValue}>{formatINR(r.principal)}</Text>
                    </View>
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Interest Earned</Text>
                      <Text style={local.breakdownValue}>{formatINR(r.earned)}</Text>
                    </View>
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Early Penalty</Text>
                      <Text style={local.breakdownValueNegative}>-{formatINR(r.penalty)}</Text>
                    </View>
                    <View style={local.breakdownRowLast}>
                      <Text style={local.netLabel}>Net Pre-Close Amount</Text>
                      <Text style={local.netValue}>{formatINR(r.netAmount)}</Text>
                    </View>
                  </View>

                  <View style={local.actionsRow}>
                    <TouchableOpacity
                      style={local.rejectBtn}
                      onPress={() => handleRejectPreClose(r.id, r.bondSeriesId)}>
                      <Text style={local.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={local.approveBtn}
                      onPress={() =>
                        handleApprovePreClose(r.id, r.bondSeriesId, r.netAmount, r.investorName)
                      }>
                      <Text style={local.approveBtnText}>✓  Approve</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const local = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginTop: 16,
    marginBottom: 16,
  },
  tabPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabPillActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0B1E45',
  },
  tabBadge: {
    backgroundColor: '#0B1E45',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyWrap: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  bondId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  precloseBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  precloseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  reasonBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  reasonText: {
    fontSize: 12,
    color: '#374151',
  },
  breakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakdownRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  breakdownValueNegative: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  netValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  approveBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default SettlementCalculatorScreen;