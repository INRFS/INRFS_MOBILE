import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Image, Alert} from 'react-native';
import {useAppData, KycRequest, DocStatus} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/KycApprovalsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
type FilterKey = 'pending' | 'flagged' | 'archive';
const filters: {key: FilterKey; label: string}[] = [
  {key: 'pending', label: 'Pending'},
  {key: 'flagged', label: 'Flagged'},
  {key: 'archive', label: 'Archive'},
];

const docBadgeStyle = (status: DocStatus) => {
  if (status === 'Verified') return {bg: '#DCFCE7', text: '#16A34A'};
  if (status === 'Flagged') return {bg: '#FEE2E2', text: '#DC2626'};
  if (status === 'Uploading') return {bg: '#DBEAFE', text: '#2563EB'};
  return {bg: '#FEF3C7', text: '#B45309'};
};

const DocBadge = ({label, status}: {label: string; status: DocStatus}) => {
  const s = docBadgeStyle(status);
  return (
    <View style={styles.docCol}>
      <Text style={styles.docLabel}>{label}</Text>
      <View style={[styles.docBadge, {backgroundColor: s.bg}]}>
        <Text style={[styles.docBadgeText, {color: s.text}]}>{status}</Text>
      </View>
    </View>
  );
};

const KycApprovalsScreen = ({navigation}: any) => {
  const {kycRequests, kycStats, approveKyc, rejectKyc, escalateKyc} = useAppData();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('pending');
  const [visibleCount, setVisibleCount] = useState(3);

  const pendingCount = kycRequests.filter(k => k.category === 'pending').length;
  const flaggedCount = kycRequests.filter(k => k.category === 'flagged').length;

  const filtered = kycRequests.filter(k => k.category === activeFilter);
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
        <Text style={styles.title}>Verification Queue</Text>
        <Text style={styles.subtitle}>Reviewing {pendingCount} pending high-priority investor applications.</Text>

        <View style={styles.filterRow}>
          {filters.map(f => {
            const active = f.key === activeFilter;
            const count = f.key === 'pending' ? pendingCount : f.key === 'flagged' ? flaggedCount : undefined;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => {
                  setActiveFilter(f.key);
                  setVisibleCount(3);
                }}>
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {f.label}
                  {count !== undefined ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

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

            <View style={styles.docsRow}>
              <DocBadge label="AADHAAR" status={req.aadhaar} />
              <DocBadge label="PAN CARD" status={req.pan} />
            </View>
            <DocBadge label="BANK STMT." status={req.bankStmt} />

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

              {req.category === 'archive' ? (
                <Text style={styles.archivedText}>Archived</Text>
              ) : req.overallFlag === 'flagged' ? (
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
                    style={[styles.approveBtn, req.overallFlag === 'uploading' && styles.btnDisabled]}
                    disabled={req.overallFlag === 'uploading'}
                    onPress={() => confirmAction('approve', req)}>
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectBtn, req.overallFlag === 'uploading' && styles.btnDisabled]}
                    disabled={req.overallFlag === 'uploading'}
                    onPress={() => confirmAction('reject', req)}>
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </TouchableOpacity>
                  {req.overallFlag !== 'uploading' && (
                    <TouchableOpacity style={styles.moreBtn}>
                      <Text>⋮</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Nothing here right now.</Text>
          </View>
        )}

        {visibleCount < filtered.length && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={() => setVisibleCount(v => v + 10)}>
            <Text style={styles.loadMoreBtnText}>Load Next 10 Requests</Text>
          </TouchableOpacity>
        )}

        {filtered.length > 0 && (
          <Text style={styles.showingText}>
            Showing {visible.length} of {filtered.length} {activeFilter} requests
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

export default KycApprovalsScreen;