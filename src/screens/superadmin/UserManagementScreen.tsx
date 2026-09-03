import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';
import {styles} from '../../styles/superadmin/UserManagementScreen.styles';
import {
  getInvestors,
  getErrorMessage,
  SuperAdminInvestorRecord,
} from '../../services/superadmin/superAdminInvestorService';
import {formatSuperAdminDate} from '../../services/superadmin/superAdminDashboardService';

const UserManagementScreen = ({navigation}: any) => {
  const [investors, setInvestors] = useState<SuperAdminInvestorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState<SuperAdminInvestorRecord | null>(null);

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const res = await getInvestors({limit: 100, offset: 0, search: search.trim() || undefined});
      setInvestors(res.records || []);
    } catch (err: any) {
      console.log('Error loading users:', err);
      setError(getErrorMessage(err) || 'Failed to load users.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const q = search.trim().toLowerCase();
  const filtered = investors.filter(
    u =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.branchName.toLowerCase().includes(q) ||
      u.investorId.toLowerCase().includes(q),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="User & Investor Management" />

      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, ID, branch..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdminManagement')}>
          <Text style={styles.addBtnText}>+ Admins</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR BOX */}
      {error ? (
        <View style={local.errorBox}>
          <Text style={local.errorText}>{error}</Text>
          <TouchableOpacity style={local.retryBtn} onPress={() => loadData(true)}>
            <Text style={local.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(false)}
            colors={['#0B1E45', '#2563EB']}
          />
        }>
        {loading ? (
          <View style={local.loadingBox}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={local.loadingText}>Loading registered users...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>
            {search.trim() ? 'Not found' : 'No users found.'}
          </Text>
        ) : (
          filtered.map(user => (
            <View key={String(user.id)} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View style={{flex: 1, marginRight: 8}}>
                  <Text style={styles.name}>{user.name}</Text>
                  <Text style={local.subText}>ID: {user.investorId} • {user.email}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{user.status}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{user.branchName}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>{user.kycStatus === 'Approved' ? 'KYC Verified' : 'KYC Pending'}</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionChip}
                  onPress={() => setSelectedUser(user)}>
                  <Text style={styles.actionChipText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* VIEW DETAILS MODAL */}
      <Modal
        visible={!!selectedUser}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedUser(null)}>
        <View style={local.modalOverlay}>
          <View style={local.modalCard}>
            {selectedUser && (
              <>
                <View style={local.modalHeaderRow}>
                  <Text style={local.modalTitle}>User Details</Text>
                  <TouchableOpacity onPress={() => setSelectedUser(null)}>
                    <Text style={local.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>FULL NAME</Text>
                  <Text style={local.fieldVal}>{selectedUser.name}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>INVESTOR ID</Text>
                  <Text style={local.fieldVal}>{selectedUser.investorId}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>EMAIL</Text>
                  <Text style={local.fieldVal}>{selectedUser.email}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>MOBILE</Text>
                  <Text style={local.fieldVal}>{selectedUser.mobile}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>BRANCH</Text>
                  <Text style={local.fieldVal}>{selectedUser.branchName}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>KYC STATUS</Text>
                  <Text style={local.fieldVal}>{selectedUser.kycStatus}</Text>
                </View>
                <View style={local.modalField}>
                  <Text style={local.fieldLabel}>REGISTERED</Text>
                  <Text style={local.fieldVal}>{formatSuperAdminDate(selectedUser.registeredDate)}</Text>
                </View>

                <TouchableOpacity
                  style={local.doneBtn}
                  onPress={() => setSelectedUser(null)}>
                  <Text style={local.doneBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const local = StyleSheet.create({
  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 13.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1E45',
  },
  modalClose: {
    fontSize: 18,
    color: '#6B7280',
    padding: 4,
  },
  modalField: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  fieldVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#0B1E45',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  doneBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default UserManagementScreen;