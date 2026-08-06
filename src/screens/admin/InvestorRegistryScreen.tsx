import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Modal,
  StyleSheet,
} from 'react-native';
import {useAppData, Investor} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/InvestorRegistryScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

const tierIcon = (inv: Investor) => (inv.type === 'institution' ? '🏢' : '👤');

type StatusFilter = 'All' | 'Active' | 'Pending' | 'Suspended';
const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'Pending', 'Suspended'];

// Small helper so missing profile fields render consistently instead of
// showing "undefined" or a blank box (mirrors the helper in KycApprovalsScreen).
const orNotProvided = (v?: string) => (v && v.trim() ? v : 'Not provided');

// Investor ID must never be shown to the admin until the investor's
// investment/KYC has actually been approved. While Pending it shows
// "Pending"; once rejected/Suspended it shows "—", matching the web
// reference (Investor Management table).
const displayInvestorId = (inv: Investor) => {
  if (inv.status === 'Pending') return 'Pending';
  if (inv.status === 'Suspended') return '—';
  return inv.id;
};

const kycPillColor = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {backgroundColor: '#DCFCE7'};
  if (status === 'Pending') return {backgroundColor: '#FEF3C7'};
  return {backgroundColor: '#FEE2E2'};
};

const kycPillTextColor = (status: Investor['kycStatus']) => {
  if (status === 'Approved') return {color: '#16A34A'};
  if (status === 'Pending') return {color: '#B45309'};
  return {color: '#DC2626'};
};

// Small read-only field used inside the "View" details modal.
const DetailField = ({label, value}: {label: string; value: string}) => (
  <View style={local.fieldCol}>
    <Text style={local.docLabel}>{label}</Text>
    <View style={local.pillBox}>
      <Text style={local.pillText}>{value}</Text>
    </View>
  </View>
);

const InvestorRegistryScreen = ({navigation}: any) => {
  const {investors, bonds, rejectInvestorKyc, kycRequests} = useAppData();
  const [query, setQuery] = useState('');
  // Default to "Pending" instead of "All" so a new/unverified investor is
  // immediately visible to the admin the moment this screen opens, instead
  // of being buried in the full list.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Pending');

  // Investor currently shown in the read-only "View" details modal.
  const [viewingInvestor, setViewingInvestor] = useState<Investor | null>(null);
  // Name of the investor whose reject action was just confirmed — drives
  // the "Rejection Sent to Super Admin" popup (matches web reference).
  const [rejectedName, setRejectedName] = useState<string | null>(null);

  // Aadhaar lives on the linked KycRequest, not on Investor itself.
  const kycRequestFor = (investorId: string) => kycRequests.find(k => k.investorId === investorId);

  const filtered = investors.filter(inv => {
    const matchesQuery =
      inv.name.toLowerCase().includes(query.toLowerCase()) ||
      inv.id.toLowerCase().includes(query.toLowerCase()) ||
      inv.tier.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleExport = async () => {
    try {
      const rows = investors.map(inv => ({
        'Investor ID': displayInvestorId(inv),
        Name: inv.name,
        Email: inv.email,
        Mobile: inv.mobile,
        Branch: inv.branch,
        'KYC Status': inv.kycStatus,
        Status: inv.status,
        'Total Invested ($)': inv.totalInvested,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Investors');
      const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});

      const fileName = `INRFS_Investor_Management_${Date.now()}.xlsx`;
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

  // Approve -> opens the full KYC review/approve screen (unchanged
  // destination, just renamed from the old "View Profile" handler).
  const handleApprove = (inv: Investor) => {
    navigation.navigate('KycApprovals', {investorId: inv.id});
  };

  // View -> read-only details modal (name, contact, KYC/bank fields).
  const handleView = (inv: Investor) => {
    setViewingInvestor(inv);
  };

  // Reject -> confirm, fire the reject action, then show the
  // "Rejection Sent to Super Admin" popup. The investor's status/kycStatus
  // update (Pending -> Suspended/Rejected) is expected to happen inside
  // rejectInvestorKyc in AppNavigator, same as it already does for the
  // KycApprovalsScreen reject flow — so the row will move under the
  // "Suspended" filter automatically once that state updates.
  const handleReject = (inv: Investor) => {
    Alert.alert('Reject request', `Reject verification for ${inv.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          rejectInvestorKyc(inv.id);
          setRejectedName(inv.name);
        },
      },
    ]);
  };

  const renderActions = (inv: Investor) => {
    if (inv.status === 'Pending') {
      return (
        <View style={local.actionsRow}>
          <TouchableOpacity style={local.approveBtn} onPress={() => handleApprove(inv)}>
            <Text style={local.approveBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={local.rejectBtn} onPress={() => handleReject(inv)}>
            <Text style={local.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={local.viewBtn} onPress={() => handleView(inv)}>
            <Text style={local.viewBtnIcon}>👁</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={local.actionsRow}>
        <TouchableOpacity style={local.viewBtn} onPress={() => handleView(inv)}>
          <Text style={local.viewBtnIcon}>👁</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>INRFS</Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Investor Management</Text>
        <Text style={styles.subtitle}>Manage and monitor {investors.length.toLocaleString()} registered entities.</Text>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ID, name, or tier..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
          />
          <View style={styles.filterBtn}>
            <Text>⇅</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusFilterRow}>
          {STATUS_FILTERS.map(f => {
            const active = f === statusFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.statusFilterChip, active && styles.statusFilterChipActive]}
                onPress={() => setStatusFilter(f)}>
                <Text
                  style={[
                    styles.statusFilterChipText,
                    active && styles.statusFilterChipTextActive,
                  ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.map(inv => (
          <View key={inv.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarText}>{tierIcon(inv)}</Text>
              </View>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{inv.name}</Text>
                {/* Real Investor ID is withheld until admin approval, and
                    hidden again ("—") once rejected/Suspended. */}
                <Text style={styles.invId}>{displayInvestorId(inv)}</Text>
                <Text style={styles.email}>{inv.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>{inv.mobile}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Branch</Text>
                <Text style={styles.infoValue}>{inv.branch}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>KYC</Text>
                <View style={[styles.pill, kycPillColor(inv.kycStatus)]}>
                  <Text style={[styles.pillText, kycPillTextColor(inv.kycStatus)]}>{inv.kycStatus}</Text>
                </View>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          inv.status === 'Active' ? '#16A34A' : inv.status === 'Suspended' ? '#DC2626' : '#F59E0B',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: inv.status === 'Active' ? '#16A34A' : inv.status === 'Suspended' ? '#DC2626' : '#F59E0B',
                      },
                    ]}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Investment</Text>
                <Text style={styles.statValue}>
                  ${inv.totalInvested.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </Text>
              </View>
            </View>

            {renderActions(inv)}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

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

      {/* ---- View details modal (read-only, includes bank/KYC fields) ---- */}
      <Modal
        transparent
        animationType="fade"
        visible={!!viewingInvestor}
        onRequestClose={() => setViewingInvestor(null)}>
        <View style={local.modalOverlay}>
          {viewingInvestor && (
            <View style={local.modalCard}>
              <View style={local.modalHeaderRow}>
                <Text style={local.modalTitle}>Investor Details — {viewingInvestor.name}</Text>
                <TouchableOpacity onPress={() => setViewingInvestor(null)}>
                  <Text style={local.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={local.modalScroll}>
                <View style={local.fieldRow}>
                  <DetailField label="FULL NAME" value={viewingInvestor.name} />
                  <DetailField label="MOBILE" value={viewingInvestor.mobile} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField label="EMAIL" value={viewingInvestor.email} />
                  <DetailField label="DATE OF BIRTH" value={orNotProvided(viewingInvestor.dob)} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField
                    label="AADHAAR NUMBER"
                    value={orNotProvided(kycRequestFor(viewingInvestor.id)?.aadhaarNumber)}
                  />
                  <DetailField label="BRANCH" value={viewingInvestor.branch} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField label="ADDRESS" value={orNotProvided(viewingInvestor.address)} />
                  <DetailField label="CITY" value={orNotProvided(viewingInvestor.city)} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField label="STATE" value={orNotProvided(viewingInvestor.state)} />
                  <DetailField label="PIN CODE" value={orNotProvided(viewingInvestor.pincode)} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField
                    label="BANK ACCOUNT NUMBER"
                    value={orNotProvided(viewingInvestor.bankAccountNumber)}
                  />
                  <DetailField label="IFSC CODE" value={orNotProvided(viewingInvestor.ifscCode)} />
                </View>
                <View style={local.fieldRow}>
                  <DetailField label="BANK NAME" value={orNotProvided(viewingInvestor.bankName)} />
                  <DetailField
                    label="INVESTMENT AMOUNT"
                    value={`₹${viewingInvestor.totalInvested.toLocaleString()}`}
                  />
                </View>

                <View style={local.remarksWrap}>
                  <Text style={local.docLabel}>CURRENT KYC STATUS</Text>
                  <View style={[local.statusPill, kycPillColor(viewingInvestor.kycStatus)]}>
                    <Text style={[local.statusPillText, kycPillTextColor(viewingInvestor.kycStatus)]}>
                      {viewingInvestor.kycStatus}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity style={local.modalCloseBtn} onPress={() => setViewingInvestor(null)}>
                <Text style={local.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* ---- "Rejection Sent to Super Admin" popup ---- */}
      <Modal
        transparent
        animationType="fade"
        visible={!!rejectedName}
        onRequestClose={() => setRejectedName(null)}>
        <View style={local.modalOverlay}>
          <View style={local.rejectionCard}>
            <View style={local.rejectionIconWrap}>
              <Text style={local.rejectionIcon}>➤</Text>
            </View>
            <Text style={local.rejectionTitle}>Rejection Sent to Super Admin</Text>
            <Text style={local.rejectionMessage}>
              {rejectedName}'s KYC rejection request has been forwarded to the Super Admin for final review.
            </Text>
            <TouchableOpacity style={local.rejectionOkBtn} onPress={() => setRejectedName(null)}>
              <Text style={local.rejectionOkBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ---------------------------------------------------------------------------
// Local styles for the pieces added on top of the shared
// InvestorRegistryScreen.styles.ts (kept local so the shared file is
// untouched — merge in later if you'd rather centralize them).
// ---------------------------------------------------------------------------
const local = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  viewBtn: {
    width: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalScroll: {
    marginTop: 4,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
    paddingRight: 8,
  },
  modalClose: {
    fontSize: 16,
    color: '#6B7280',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  fieldCol: {
    flex: 1,
  },
  docLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.4,
  },
  pillBox: {
    alignSelf: 'stretch',
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
    marginTop: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  remarksWrap: {
    marginTop: 4,
    marginBottom: 4,
  },
  modalCloseBtn: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  rejectionCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  rejectionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rejectionIcon: {
    fontSize: 22,
    color: '#DC2626',
  },
  rejectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  rejectionMessage: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 18,
  },
  rejectionOkBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  rejectionOkBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default InvestorRegistryScreen;