import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Image, Alert} from 'react-native';
import {useAppData, KycRequest, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/KycApprovalsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const kycStatusColors = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {bg: '#DCFCE7', text: '#16A34A'};
  if (status === 'Pending') return {bg: '#FEF3C7', text: '#B45309'};
  return {bg: '#FEE2E2', text: '#DC2626'};
};

const KycApprovalsScreen = ({navigation, route}: any) => {
  const {investors, kycRequests, kycStats, approveKyc, rejectKyc, escalateKyc, approveInvestorKyc, rejectInvestorKyc} =
    useAppData();
  const [visibleCount, setVisibleCount] = useState(3);

  // If we arrived here from Investor Management -> View Profile, we're
  // given that investor's id. When present, show THAT investor's KYC
  // review instead of the generic queue.
  const focusedInvestorId: string | undefined = route?.params?.investorId;

  // Focused lookup reads from `investors` directly — the source of truth
  // for KYC status — instead of filtering kycRequests by category==='pending'.
  // Previously, once a request was approved/rejected it moved to
  // category:'archive' and the focused view showed "No KYC request found"
  // even though the investor's record existed and had a real status.
  const focusedInvestor = focusedInvestorId
    ? investors.find(inv => inv.id === focusedInvestorId)
    : undefined;
  // Still look up a linked KycRequest (any category) so we can show the
  // Aadhaar number if one was submitted.
  const focusedKycRequest = focusedInvestorId
    ? kycRequests.find(k => k.investorId === focusedInvestorId)
    : undefined;

  const pendingCount = kycRequests.filter(k => k.category === 'pending').length;

  // Generic queue — unaffected, still pending-only.
  const filtered = kycRequests.filter(k => k.category === 'pending' && !focusedInvestorId);
  const visible = filtered.slice(0, visibleCount);

  const confirmAction = (action: 'approve' | 'reject' | 'escalate', req: KycRequest) => {
    const actionLabel = action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Escalate';
    Alert.alert(`${actionLabel} request`, `${actionLabel} verification for ${req.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: actionLabel,
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: () => {
          if (action === 'approve') approveKyc(req.id);
          if (action === 'reject') rejectKyc(req.id);
          if (action === 'escalate') escalateKyc(req.id);
        },
      },
    ]);
  };

  // Focused single-investor Approve/Reject. Uses the linked KycRequest if
  // one exists (so it stays consistent with the queue's own approve/reject
  // logic), otherwise falls back to updating the investor record directly.
  // Either way, once handled we move on to Investments.
  const confirmFocusedAction = (action: 'approve' | 'reject') => {
    if (!focusedInvestor) return;
    const actionLabel = action === 'approve' ? 'Approve' : 'Reject';
    Alert.alert(`${actionLabel} KYC`, `${actionLabel} KYC for ${focusedInvestor.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: actionLabel,
        style: action === 'reject' ? 'destructive' : 'default',
        onPress: () => {
          if (focusedKycRequest) {
            if (action === 'approve') approveKyc(focusedKycRequest.id);
            else rejectKyc(focusedKycRequest.id);
          } else {
            if (action === 'approve') approveInvestorKyc(focusedInvestor.id);
            else rejectInvestorKyc(focusedInvestor.id);
          }
          navigation.navigate('AdminInvestments');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INRFS</Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{focusedInvestorId ? 'Investor KYC' : 'Verification Queue'}</Text>
        <Text style={styles.subtitle}>
          {focusedInvestorId
            ? focusedInvestor
              ? `Reviewing KYC for ${focusedInvestor.name}.`
              : 'Investor not found.'
            : `Reviewing ${pendingCount} pending high-priority investor applications.`}
        </Text>

        {!focusedInvestorId && (
          <>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⏱</Text>
              <View style={styles.statTextWrap}>
                <Text style={styles.statLabel}>Avg. Review Time</Text>
                <Text style={styles.statValue}>
                  {kycStats.avgReviewTime}{' '}
                  <Text style={styles.statChangeGood}>({kycStats.avgReviewChangePct}%)</Text>
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📋</Text>
              <View style={styles.statTextWrap}>
                <Text style={styles.statLabel}>Today's Target</Text>
                <Text style={styles.statValue}>
                  {kycStats.todaysCompleted} / {kycStats.todaysTarget}
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⚠️</Text>
              <View style={styles.statTextWrap}>
                <Text style={styles.statLabel}>AML Alerts</Text>
                <Text style={styles.statValueWarn}>{kycStats.amlHighRiskCount} High Risk</Text>
              </View>
            </View>
          </>
        )}

        {/* ---- Focused single-investor review (from Investor Management -> View Profile) ---- */}
        {focusedInvestorId && focusedInvestor && (
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{focusedInvestor.name}</Text>
                <Text style={styles.location}>{focusedInvestor.id}</Text>
              </View>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: kycStatusColors(focusedInvestor.kycStatus).bg,
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: kycStatusColors(focusedInvestor.kycStatus).text,
                  }}>
                  {focusedInvestor.kycStatus}
                </Text>
              </View>
            </View>

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>FULL NAME</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>{focusedInvestor.name}</Text>
              </View>
            </View>

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>MOBILE</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>{focusedInvestor.mobile}</Text>
              </View>
            </View>

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>EMAIL</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>{focusedInvestor.email}</Text>
              </View>
            </View>

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>BRANCH</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>{focusedInvestor.branch}</Text>
              </View>
            </View>

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>AADHAAR NUMBER</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>
                  {focusedKycRequest?.aadhaarNumber ?? 'Not submitted'}
                </Text>
              </View>
            </View>

            {focusedInvestor.kycStatus === 'Pending' && (
              <View style={styles.cardBottomRow}>
                <View />
                <View style={styles.actionBtnsRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => confirmFocusedAction('approve')}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => confirmFocusedAction('reject')}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {focusedInvestorId && !focusedInvestor && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Investor not found.</Text>
          </View>
        )}

        {/* ---- Generic pending queue (unchanged) ---- */}
        {visible.map(req => (
          <View key={req.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.avatarWrap}>
                <Image source={{uri: req.avatarUri}} style={styles.avatar} />
                <View
                  style={[
                    styles.flagBadge,
                    {
                      backgroundColor:
                        req.overallFlag === 'verified' ? '#16A34A' : req.overallFlag === 'flagged' ? '#DC2626' : '#9CA3AF',
                    },
                  ]}>
                  <Text style={styles.flagBadgeIcon}>
                    {req.overallFlag === 'verified' ? '✓' : req.overallFlag === 'flagged' ? '!' : '↻'}
                  </Text>
                </View>
              </View>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{req.name}</Text>
                <Text style={styles.location}>📍 {req.location}</Text>
              </View>
            </View>

            {/* Verification shows only the Aadhaar Number for review — no
                Aadhaar image or Bank Statement uploads are displayed. */}
            <View style={styles.docCol}>
              <Text style={styles.docLabel}>AADHAAR NUMBER</Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: '#F3F4F6',
                  borderRadius: 8,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  marginTop: 2,
                }}>
                <Text style={{fontSize: 13, fontWeight: '700', color: '#111827'}}>
                  {req.aadhaarNumber}
                </Text>
              </View>
            </View>

            {req.amlNote && (
              <View style={styles.amlBox}>
                <Text style={styles.amlText}>⚠ {req.amlNote}</Text>
              </View>
            )}

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.avgWaitLabel}>Avg. Wait</Text>
                <Text style={styles.avgWaitValue}>{req.avgWait}</Text>
              </View>

              {req.overallFlag === 'flagged' ? (
                <View style={styles.actionBtnsRow}>
                  <TouchableOpacity style={styles.escalateBtn} onPress={() => confirmAction('escalate', req)}>
                    <Text style={styles.escalateBtnText}>◈ Escalate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => confirmAction('reject', req)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionBtnsRow}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => confirmAction('approve', req)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => confirmAction('reject', req)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.moreBtn}>
                    <Text>⋮</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}

        {!focusedInvestorId && filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Nothing here right now.</Text>
          </View>
        )}

        {!focusedInvestorId && visibleCount < filtered.length && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setVisibleCount(v => v + 10)}>
            <Text style={styles.loadMoreBtnText}>Load Next 10 Requests</Text>
          </TouchableOpacity>
        )}

        {!focusedInvestorId && filtered.length > 0 && (
          <Text style={styles.showingText}>
            Showing {visible.length} of {filtered.length} pending requests
          </Text>
        )}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>👥</Text>
          <Text style={styles.tabLabelActive}>Investors</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('BondTracking')}>
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>Portfolio</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminInvestments')}>
          <Text style={styles.tabIcon}>💵</Text>
          <Text style={styles.tabLabel}>Investments</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InterestPayouts')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Payouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminProfile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default KycApprovalsScreen;