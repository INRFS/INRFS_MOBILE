import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {useAppData} from '../../navigation/AppNavigator';
import {
  styles,
  local,
} from '../../styles/admin/SettlementCalculatorScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';
import {
  getTenureTimeoutSettlements,
  getPrecloseRequests,
  getClosedSettlements,
  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,
  approvePrecloseRequest,
  rejectPrecloseRequest,
  getErrorMessage,
  SettlementRecord,
} from '../../services/admin/settlementService';

type Tab = 'timeout' | 'preclose' | 'closed';

const formatINR = (n: number) =>
  '₹' + Math.round(Number(n) || 0).toLocaleString('en-IN');

const formatDate = (dateStr?: string) => {
  if (!dateStr || dateStr === '—' || dateStr === '-') return '—';
  try {
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch {}
  return dateStr;
};

/* ============================================================
   SCREEN COMPONENT
   ============================================================ */

const SettlementCalculatorScreen = ({navigation}: any) => {
  const {
    approvePreSettlement,
    rejectPreSettlement,
    requestMaturitySettlement,
  } = useAppData();

  const [tab, setTab] = useState<Tab>('timeout');

  const [timeoutRows, setTimeoutRows] = useState<SettlementRecord[]>([]);
  const [preCloseRows, setPreCloseRows] = useState<SettlementRecord[]>([]);
  const [closedRows, setClosedRows] = useState<SettlementRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | number | null>(null);
  const [error, setError] = useState('');

  /* ==========================================================
     LOAD ALL 3 SETTLEMENT APIs FROM BACKEND
     ========================================================== */

  const loadSettlementData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const [timeoutRes, preCloseRes, closedRes] = await Promise.all([
        getTenureTimeoutSettlements({limit: 100, offset: 0}),
        getPrecloseRequests({limit: 100, offset: 0}),
        getClosedSettlements({limit: 100, offset: 0}),
      ]);

      setTimeoutRows(timeoutRes.items || []);
      setPreCloseRows(preCloseRes.items || []);
      setClosedRows(closedRes.items || []);
    } catch (err: any) {
      console.error('Settlement API error:', err);
      setError(getErrorMessage(err) || 'Unable to load settlement data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettlementData(true);
  }, [loadSettlementData]);

  /* ==========================================================
     ACTION HANDLERS
     ========================================================== */

  // 1. TENURE TIMEOUT APPROVAL (SEND TO SUPER ADMIN)
  const handleApproveTimeout = (row: SettlementRecord) => {
    const settlementId = row.settlementId || row.id;

    Alert.alert(
      'Approve settlement',
      `Send ${formatINR(
        row.netSettlementAmount,
      )} settlement for ${row.investorName} (${row.bondNumber}) to Super Admin for final approval?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send to Super Admin',
          onPress: async () => {
            try {
              setActionLoadingId(row.id);
              if (settlementId) {
                await approveTenureTimeoutSettlement(settlementId);
              }

              if (requestMaturitySettlement) {
                requestMaturitySettlement({
                  bondSeriesId: row.bondNumber,
                  investorId: row.investorId,
                  investorName: row.investorName,
                  principal: row.principal,
                  totalInterest: row.interestEarned,
                  netSettlement: row.netSettlementAmount,
                });
              }

              await loadSettlementData(false);
              Alert.alert(
                'Success',
                `Settlement for ${row.investorName} sent to Super Admin.`,
              );
            } catch (apiErr: any) {
              console.log('Approve tenure timeout error:', apiErr);
              Alert.alert('Action Failed', getErrorMessage(apiErr));
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  // 2. PRE-CLOSE APPROVAL (SEND TO SUPER ADMIN)
  const handleApprovePreClose = (r: SettlementRecord) => {
    const requestId = r.requestId || r.id;

    Alert.alert(
      'Approve pre-close',
      `Send ${r.bondNumber} (${formatINR(r.netSettlementAmount)} to ${
        r.investorName
      }) to Super Admin for final settlement?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Send to Super Admin',
          onPress: async () => {
            try {
              setActionLoadingId(r.id);
              if (requestId) {
                await approvePrecloseRequest(requestId);
              }

              if (approvePreSettlement) {
                approvePreSettlement(String(r.id));
              }

              await loadSettlementData(false);
              Alert.alert(
                'Success',
                `Pre-close request for ${r.investorName} sent to Super Admin.`,
              );
            } catch (apiErr: any) {
              console.log('Approve pre-close error:', apiErr);
              Alert.alert('Action Failed', getErrorMessage(apiErr));
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  // 3. PRE-CLOSE REJECTION
  const handleRejectPreClose = (r: SettlementRecord) => {
    const requestId = r.requestId || r.id;

    Alert.alert(
      'Reject pre-close',
      `Reject the pre-close request for ${r.bondNumber} (${r.investorName})?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoadingId(r.id);
              if (requestId) {
                await rejectPrecloseRequest(requestId);
              }

              if (rejectPreSettlement) {
                rejectPreSettlement(String(r.id));
              }

              await loadSettlementData(false);
              Alert.alert('Success', 'Pre-close request rejected.');
            } catch (apiErr: any) {
              console.log('Reject pre-close error:', apiErr);
              Alert.alert('Action Failed', getErrorMessage(apiErr));
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ],
    );
  };

  /* ==========================================================
     RENDER HELPER: STATUS BADGE
     ========================================================== */

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('paid') || s.includes('settled') || s.includes('completed')) {
      return (
        <View style={local.closedBadge}>
          <Text style={local.closedBadgeText}>Settled</Text>
        </View>
      );
    }
    if (s.includes('pending super admin') || s.includes('awaiting')) {
      return (
        <View style={local.pendingBadge}>
          <Text style={local.pendingBadgeText}>Pending Super Admin</Text>
        </View>
      );
    }
    if (s.includes('rejected')) {
      return (
        <View style={[local.pendingBadge, {backgroundColor: '#FEE2E2'}]}>
          <Text style={[local.pendingBadgeText, {color: '#DC2626'}]}>Rejected</Text>
        </View>
      );
    }
    if (s.includes('approved')) {
      return (
        <View style={[local.pendingBadge, {backgroundColor: '#DCFCE7'}]}>
          <Text style={[local.pendingBadgeText, {color: '#16A34A'}]}>Approved</Text>
        </View>
      );
    }
    return (
      <View style={local.pendingBadge}>
        <Text style={local.pendingBadgeText}>Pending</Text>
      </View>
    );
  };

  /* ==========================================================
     MAIN RENDER
     ========================================================== */

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader subtitle="Settlement Management" />
        <View style={local.loadingWrap}>
          <ActivityIndicator size="large" color="#0B1E45" />
          <Text style={local.loadingText}>Loading settlement data...</Text>
        </View>
        <AdminBottomTabBar active="More" navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Settlement Management" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSettlementData(false)}
            colors={['#0B1E45', '#2563EB']}
          />
        }>
        <Text style={styles.title}>Settlement Management</Text>
        <Text style={styles.subtitle}>
          Review and approve settlement requests
        </Text>

        {error ? (
          <View style={local.errorBox}>
            <Text style={local.errorTitle}>Unable to load settlements</Text>
            <Text style={local.errorText}>{error}</Text>
            <TouchableOpacity
              style={local.retryButton}
              onPress={() => loadSettlementData(true)}>
              <Text style={local.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ----------------- TABS ----------------- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={local.tabScroll}
          contentContainerStyle={local.tabScrollContent}>
          <View style={local.tabRow}>
            {/* Tab 1: Tenure Timeout */}
            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'timeout' && local.tabPillActive,
              ]}
              onPress={() => setTab('timeout')}>
              <Text
                style={[
                  local.tabText,
                  tab === 'timeout' && local.tabTextActive,
                ]}>
                Tenure Timeout
              </Text>
              {timeoutRows.length > 0 && (
                <View style={local.tabBadge}>
                  <Text style={local.tabBadgeText}>{timeoutRows.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Tab 2: Pre-Close Requests */}
            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'preclose' && local.tabPillActive,
              ]}
              onPress={() => setTab('preclose')}>
              <Text
                style={[
                  local.tabText,
                  tab === 'preclose' && local.tabTextActive,
                ]}>
                Pre-Close Requests
              </Text>
              {preCloseRows.length > 0 && (
                <View style={local.tabBadge}>
                  <Text style={local.tabBadgeText}>
                    {preCloseRows.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Tab 3: Closed Settlements */}
            <TouchableOpacity
              style={[
                local.tabPill,
                tab === 'closed' && local.tabPillActive,
              ]}
              onPress={() => setTab('closed')}>
              <Text
                style={[
                  local.tabText,
                  tab === 'closed' && local.tabTextActive,
                ]}>
                Closed Settlements
              </Text>
              {closedRows.length > 0 && (
                <View style={local.tabBadge}>
                  <Text style={local.tabBadgeText}>
                    {closedRows.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ================================================================
            TAB 1: TENURE TIMEOUT
        ================================================================ */}
        {tab === 'timeout' && (
          <>
            {timeoutRows.length === 0 && (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>
                  No matured bonds awaiting settlement.
                </Text>
              </View>
            )}

            {timeoutRows.map(row => {
              const isActionLoading = actionLoadingId === row.id;
              const isPending = row.status === 'Pending';

              return (
                <View key={String(row.id)} style={local.card}>
                  <View style={local.cardTopRow}>
                    <View style={local.cardTopLeft}>
                      <Text style={local.bondId}>{row.bondNumber}</Text>
                      {renderStatusBadge(row.status)}
                    </View>

                    {isPending && (
                      <TouchableOpacity
                        disabled={isActionLoading}
                        style={[
                          local.approveBtn,
                          isActionLoading && {opacity: 0.6},
                        ]}
                        onPress={() => handleApproveTimeout(row)}>
                        {isActionLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={local.approveBtnText}>
                            → Send to Super Admin
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={local.metaGrid}>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Investor</Text>
                      <Text style={local.metaValue}>{row.investorName}</Text>
                    </View>

                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Investor ID</Text>
                      <Text style={local.metaValue}>{row.investorId}</Text>
                    </View>
                  </View>

                  <View style={local.metaGrid}>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Branch</Text>
                      <Text style={local.metaValue}>{row.branch}</Text>
                    </View>

                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Matured On</Text>
                      <Text style={local.metaValue}>
                        {formatDate(row.maturedOn)}
                      </Text>
                    </View>
                  </View>

                  <View style={local.breakdown}>
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Principal</Text>
                      <Text style={local.breakdownValue}>
                        {formatINR(row.principal)}
                      </Text>
                    </View>

                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Total Interest Earned</Text>
                      <Text style={local.breakdownValue}>
                        {formatINR(row.interestEarned)}
                      </Text>
                    </View>

                    {row.gstAmount > 0 && (
                      <View style={local.breakdownRow}>
                        <Text style={local.breakdownLabel}>GST (18%)</Text>
                        <Text style={local.breakdownValueNegative}>
                          -{formatINR(row.gstAmount)}
                        </Text>
                      </View>
                    )}

                    <View style={local.breakdownRowLast}>
                      <Text style={local.netLabel}>Net Settlement Amount</Text>
                      <Text style={local.netValue}>
                        {formatINR(row.netSettlementAmount)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* ================================================================
            TAB 2: PRE-CLOSE REQUESTS
        ================================================================ */}
        {tab === 'preclose' && (
          <>
            {preCloseRows.length === 0 && (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>
                  No pre-close requests pending.
                </Text>
              </View>
            )}

            {preCloseRows.map(r => {
              const isActionLoading = actionLoadingId === r.id;
              const isPending = r.status === 'Pending';

              return (
                <View key={String(r.id)} style={local.card}>
                  <View style={local.cardTopRow}>
                    <View style={local.cardTopLeft}>
                      <Text style={local.bondId}>{r.bondNumber}</Text>
                      {renderStatusBadge(r.status)}
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
                      <Text style={local.metaLabel}>Investor ID</Text>
                      <Text style={local.metaValue}>{r.investorId}</Text>
                    </View>
                  </View>

                  <View style={local.metaGrid}>
                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Branch</Text>
                      <Text style={local.metaValue}>{r.branch}</Text>
                    </View>

                    <View style={local.metaCol}>
                      <Text style={local.metaLabel}>Requested On</Text>
                      <Text style={local.metaValue}>
                        {formatDate(r.requestedDate)}
                      </Text>
                    </View>
                  </View>

                  {r.reason && r.reason !== '—' ? (
                    <View style={local.reasonBox}>
                      <Text style={local.reasonLabel}>Reason: </Text>
                      <Text style={local.reasonText}>{r.reason}</Text>
                    </View>
                  ) : null}

                  <View style={local.breakdown}>
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Principal</Text>
                      <Text style={local.breakdownValue}>
                        {formatINR(r.principal)}
                      </Text>
                    </View>

                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Interest Earned</Text>
                      <Text style={local.breakdownValue}>
                        {formatINR(r.interestEarned)}
                      </Text>
                    </View>

                    {r.penalty > 0 && (
                      <View style={local.breakdownRow}>
                        <Text style={local.breakdownLabel}>Early Penalty</Text>
                        <Text style={local.breakdownValueNegative}>
                          -{formatINR(r.penalty)}
                        </Text>
                      </View>
                    )}

                    {r.gstAmount > 0 && (
                      <View style={local.breakdownRow}>
                        <Text style={local.breakdownLabel}>GST (18%)</Text>
                        <Text style={local.breakdownValueNegative}>
                          -{formatINR(r.gstAmount)}
                        </Text>
                      </View>
                    )}

                    <View style={local.breakdownRowLast}>
                      <Text style={local.netLabel}>Net Pre-Close Amount</Text>
                      <Text style={local.netValue}>
                        {formatINR(r.netSettlementAmount)}
                      </Text>
                    </View>
                  </View>

                  {isPending && (
                    <View style={local.actionsRow}>
                      <TouchableOpacity
                        disabled={isActionLoading}
                        style={[
                          local.rejectBtn,
                          isActionLoading && {opacity: 0.6},
                        ]}
                        onPress={() => handleRejectPreClose(r)}>
                        <Text style={local.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        disabled={isActionLoading}
                        style={[
                          local.approveBtn,
                          isActionLoading && {opacity: 0.6},
                        ]}
                        onPress={() => handleApprovePreClose(r)}>
                        {isActionLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={local.approveBtnText}>
                            → Send to Super Admin
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {/* ================================================================
            TAB 3: CLOSED SETTLEMENTS
        ================================================================ */}
        {tab === 'closed' && (
          <>
            {closedRows.length === 0 && (
              <View style={local.emptyWrap}>
                <Text style={local.emptyText}>
                  No closed settlements yet.
                </Text>
              </View>
            )}

            {closedRows.map(row => (
              <View key={String(row.id)} style={local.card}>
                <View style={local.cardTopRow}>
                  <View style={local.cardTopLeft}>
                    <Text style={local.bondId}>{row.bondNumber}</Text>
                    {renderStatusBadge(row.status)}
                    {row.type === 'PRECLOSE' && (
                      <View style={local.precloseBadge}>
                        <Text style={local.precloseBadgeText}>Pre-Close</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={local.metaGrid}>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Investor</Text>
                    <Text style={local.metaValue}>{row.investorName}</Text>
                  </View>

                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Investor ID</Text>
                    <Text style={local.metaValue}>{row.investorId}</Text>
                  </View>
                </View>

                <View style={local.metaGrid}>
                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Branch</Text>
                    <Text style={local.metaValue}>{row.branch}</Text>
                  </View>

                  <View style={local.metaCol}>
                    <Text style={local.metaLabel}>Settlement Date</Text>
                    <Text style={local.metaValue}>
                      {formatDate(row.date)}
                    </Text>
                  </View>
                </View>

                <View style={local.breakdown}>
                  <View style={local.breakdownRow}>
                    <Text style={local.breakdownLabel}>Principal</Text>
                    <Text style={local.breakdownValue}>
                      {formatINR(row.principal)}
                    </Text>
                  </View>

                  <View style={local.breakdownRow}>
                    <Text style={local.breakdownLabel}>Total Interest</Text>
                    <Text style={local.breakdownValue}>
                      {formatINR(row.interestEarned)}
                    </Text>
                  </View>

                  {row.penalty > 0 && (
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>Early Penalty</Text>
                      <Text style={local.breakdownValueNegative}>
                        -{formatINR(row.penalty)}
                      </Text>
                    </View>
                  )}

                  {row.gstAmount > 0 && (
                    <View style={local.breakdownRow}>
                      <Text style={local.breakdownLabel}>GST (18%)</Text>
                      <Text style={local.breakdownValueNegative}>
                        -{formatINR(row.gstAmount)}
                      </Text>
                    </View>
                  )}

                  <View style={local.breakdownRowLast}>
                    <Text style={local.netLabel}>Net Settled Amount</Text>
                    <Text style={local.netValue}>
                      {formatINR(row.netSettlementAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <AdminBottomTabBar active="More" navigation={navigation} />
    </SafeAreaView>
  );
};

export default SettlementCalculatorScreen;