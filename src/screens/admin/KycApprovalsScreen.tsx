import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, StyleSheet} from 'react-native';
import {useAppData, KycRequest, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/KycApprovalsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const kycStatusColors = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {bg: '#DCFCE7', text: '#16A34A'};
  if (status === 'Pending') return {bg: '#FEF3C7', text: '#B45309'};
  return {bg: '#FEE2E2', text: '#DC2626'};
};

// Small helper so missing profile fields render consistently instead of
// showing "undefined" or a blank box.
const orNotProvided = (v?: string) => (v && v.trim() ? v : 'Not provided');

const KycApprovalsScreen = ({navigation, route}: any) => {
  const {investors, kycRequests, kycStats, approveKyc, rejectKyc, escalateKyc, approveInvestorKyc, rejectInvestorKyc} =
    useAppData();
  const [visibleCount, setVisibleCount] = useState(3);

  // Local-only remarks draft for the focused review. There's no backend
  // field to persist this to yet, so it's UI-only for now — let me know if
  // you want remarks stored against the investor/KYC record.
  const [remarks, setRemarks] = useState('');

  // If we arrived here from Investor Management -> View Profile, we're
  // given that investor's id. When present, show THAT investor's KYC
  // review instead of the generic queue.
  const focusedInvestorId: string | undefined = route?.params?.investorId;

  const focusedInvestor = focusedInvestorId
    ? investors.find(inv => inv.id === focusedInvestorId)
    : undefined;
  const focusedKycRequest = focusedInvestorId
    ? kycRequests.find(k => k.investorId === focusedInvestorId)
    : undefined;

  const pendingCount = kycRequests.filter(k => k.category === 'pending').length;

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
              <View style={[local.statusPill, {backgroundColor: kycStatusColors(focusedInvestor.kycStatus).bg}]}>
                <Text style={[local.statusPillText, {color: kycStatusColors(focusedInvestor.kycStatus).text}]}>
                  {focusedInvestor.kycStatus}
                </Text>
              </View>
            </View>

            {/* Row 1: Full Name / Mobile */}
            <View style={local.fieldRow}>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>FULL NAME</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{focusedInvestor.name}</Text>
                </View>
              </View>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>MOBILE</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{focusedInvestor.mobile}</Text>
                </View>
              </View>
            </View>

            {/* Row 2: Email / Date of Birth */}
            <View style={local.fieldRow}>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>EMAIL</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{focusedInvestor.email}</Text>
                </View>
              </View>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>DATE OF BIRTH</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{orNotProvided(focusedInvestor.dob)}</Text>
                </View>
              </View>
            </View>

            {/* Row 3: Aadhaar Number / Branch */}
            <View style={local.fieldRow}>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>AADHAAR NUMBER</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{focusedKycRequest?.aadhaarNumber ?? 'Not submitted'}</Text>
                </View>
              </View>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>BRANCH</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{focusedInvestor.branch}</Text>
                </View>
              </View>
            </View>

            {/* Row 4: Address / City */}
            <View style={local.fieldRow}>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>ADDRESS</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{orNotProvided(focusedInvestor.address)}</Text>
                </View>
              </View>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>CITY</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{orNotProvided(focusedInvestor.city)}</Text>
                </View>
              </View>
            </View>

            {/* Row 5: State / Pin Code */}
            <View style={local.fieldRow}>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>STATE</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{orNotProvided(focusedInvestor.state)}</Text>
                </View>
              </View>
              <View style={[styles.docCol, local.fieldCol]}>
                <Text style={styles.docLabel}>PIN CODE</Text>
                <View style={local.pillBox}>
                  <Text style={local.pillText}>{orNotProvided(focusedInvestor.pincode)}</Text>
                </View>
              </View>
            </View>

            {/* Remarks box, matching the web layout */}
            <View style={[styles.docCol, local.remarksWrap]}>
              <Text style={styles.docLabel}>REMARKS</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Add remarks..."
                placeholderTextColor="#9CA3AF"
                multiline
                style={local.remarksInput}
              />
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

            <View style={styles.docCol}>
              <Text style={styles.docLabel}>AADHAAR NUMBER</Text>
              <View style={local.pillBox}>
                <Text style={local.pillText}>{req.aadhaarNumber}</Text>
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

// ---------------------------------------------------------------------------
// Local styles for the pieces added to match the web reference design.
// Kept local to this screen (rather than editing the unseen
// KycApprovalsScreen.styles.ts) so nothing in the shared style file is
// touched. Merge these into that file later if you'd rather centralize them.
// ---------------------------------------------------------------------------
const local = StyleSheet.create({
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldCol: {
    flex: 1,
  },
  pillBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remarksWrap: {
    marginTop: 8,
  },
  remarksInput: {
    marginTop: 4,
    minHeight: 70,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
    textAlignVertical: 'top',
  },
});

export default KycApprovalsScreen;