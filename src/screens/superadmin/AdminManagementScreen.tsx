import React, {useCallback, useEffect, useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';

import AppHeader from '../../components/AppHeader';
import {styles} from '../../styles/superadmin/AdminManagementScreen.styles';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  suspendAdmin,
  getAdminBranchesFilter,
  getAdminRolesFilter,
  getAdminStatusesFilter,
  getErrorMessage,
  AdminRecord,
  AdminFilterOption,
} from '../../services/superadmin/superAdminAdminService';

const AdminManagementScreen = ({navigation}: any) => {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [branches, setBranches] = useState<AdminFilterOption[]>([]);
  const [roles, setRoles] = useState<AdminFilterOption[]>([]);
  const [statuses, setStatuses] = useState<AdminFilterOption[]>([]);

  // ---- Add Admin modal ----
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // ---- View Details modal ----
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<AdminRecord | null>(null);

  // ---- Edit Admin modal ----
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editBranchId, setEditBranchId] = useState<number | null>(null);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [editStatusId, setEditStatusId] = useState<number>(2); // 2 = Active
  const [isUpdating, setIsUpdating] = useState(false);

  // ---- Suspend Confirm Modal ----
  const [suspendModalVisible, setSuspendModalVisible] = useState(false);
  const [suspendingAdmin, setSuspendingAdmin] = useState<AdminRecord | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setError('');

      const [adminRes, bRes, rRes, sRes] = await Promise.all([
        getAdmins({limit: 100, offset: 0, search: search.trim() || undefined}),
        getAdminBranchesFilter(),
        getAdminRolesFilter(),
        getAdminStatusesFilter(),
      ]);

      setAdmins(adminRes.records || []);
      setBranches(bRes || []);
      setRoles(rRes || []);
      setStatuses(sRes || []);
    } catch (err: any) {
      console.log('Error loading admins:', err);
      setError(getErrorMessage(err) || 'Failed to load admins.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const filtered = admins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.branchName.toLowerCase().includes(search.toLowerCase()) ||
      a.mobile.includes(search),
  );

  /* ==========================================================
     HANDLERS
     ========================================================== */

  const handleAdd = async () => {
    if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email, mobile and password.');
      return;
    }
    if (!selectedBranchId) {
      Alert.alert('Validation Error', 'Please select a branch.');
      return;
    }

    try {
      setIsCreating(true);
      await createAdmin({
        full_name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
        branch_id: selectedBranchId,
        role_id: selectedRoleId || 2,
        status_id: 2,
        password: password.trim(),
      });

      setName('');
      setEmail('');
      setMobile('');
      setPassword('');
      setSelectedBranchId(null);
      setSelectedRoleId(null);
      setAddModalVisible(false);
      await loadData(false);
      Alert.alert('Success', 'Admin created successfully.');
    } catch (err: any) {
      Alert.alert('Creation Failed', getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const openView = (admin: AdminRecord) => {
    setViewingAdmin(admin);
    setViewModalVisible(true);
  };

  const openEdit = (admin: AdminRecord) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditMobile(admin.mobile === '—' ? '' : admin.mobile);
    setEditBranchId(admin.branchId || (branches[0]?.id ?? 1));
    setEditRoleId(admin.roleId || (roles[0]?.id ?? 2));
    setEditStatusId(admin.statusId || (admin.status.toLowerCase() === 'active' ? 2 : 3));
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAdmin) return;
    if (!editName.trim() || !editEmail.trim() || !editMobile.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email, and mobile number.');
      return;
    }

    try {
      setIsUpdating(true);
      await updateAdmin(editingAdmin.id, {
        full_name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
        branch_id: editBranchId || 1,
        role_id: editRoleId || 2,
        status_id: editStatusId,
      });

      setEditModalVisible(false);
      setEditingAdmin(null);
      await loadData(false);
      Alert.alert('Success', 'Admin details updated.');
    } catch (err: any) {
      Alert.alert('Update Failed', getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const openSuspend = (admin: AdminRecord) => {
    setSuspendingAdmin(admin);
    setSuspendModalVisible(true);
  };

  const handleConfirmSuspend = async () => {
    if (!suspendingAdmin) return;
    try {
      setIsSuspending(true);
      await suspendAdmin(suspendingAdmin.id);
      setSuspendModalVisible(false);
      setSuspendingAdmin(null);
      await loadData(false);
      Alert.alert('Success', `Admin ${suspendingAdmin.name} suspended.`);
    } catch (err: any) {
      Alert.alert('Action Failed', getErrorMessage(err));
    } finally {
      setIsSuspending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Management" />

      {/* HEADER TITLE & SUMMARY */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Admin Management</Text>
        <Text style={styles.headerSubtitle}>
          Administrators & branch managers — {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </Text>
      </View>

      {/* TOP SEARCH & ACTION TOOLBAR */}
      <View style={styles.topBar}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, branch..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => setSearch('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* ERROR BANNER */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData(true)}>
            <Text style={styles.retryBtnText}>Retry</Text>
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
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0B1E45" />
            <Text style={styles.loadingText}>Loading administrators...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyIcon}>👤</Text>
            </View>
            <Text style={styles.emptyTitle}>No administrators found</Text>
            <Text style={styles.emptyText}>
              {search
                ? 'No admin records match your search criteria.'
                : 'No administrators registered in the system.'}
            </Text>
            {search ? (
              <TouchableOpacity
                style={styles.clearFilterBtn}
                onPress={() => setSearch('')}>
                <Text style={styles.clearFilterBtnText}>Clear Search</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filtered.map(admin => {
            const isActive = admin.status.toLowerCase() === 'active';
            const initial =
              admin.name && admin.name !== '—'
                ? admin.name.trim().charAt(0).toUpperCase()
                : 'A';

            return (
              <View
                key={String(admin.id)}
                style={[
                  styles.card,
                  {borderLeftColor: isActive ? '#059669' : '#DC2626'},
                ]}>
                {/* CARD HEADER: AVATAR INITIAL + NAME / EMAIL + STATUS BADGE */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initial}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={styles.adminName} numberOfLines={1}>
                      {admin.name}
                    </Text>
                    <Text style={styles.adminEmail} numberOfLines={1}>
                      {admin.email}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      isActive
                        ? styles.statusBadgeActive
                        : styles.statusBadgeInactive,
                    ]}>
                    <View
                      style={[
                        styles.statusDot,
                        {backgroundColor: isActive ? '#059669' : '#DC2626'},
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        isActive
                          ? styles.statusTextActive
                          : styles.statusTextInactive,
                      ]}>
                      {admin.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* INFO GRID: BRANCH & ROLE */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>BRANCH</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {admin.branchName}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>ROLE</Text>
                    <View style={styles.roleTag}>
                      <Text style={styles.roleTagText} numberOfLines={1}>
                        {admin.role}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* INFO GRID: MOBILE */}
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>MOBILE</Text>
                    <Text style={styles.infoValue} numberOfLines={1}>
                      {admin.mobile}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                {/* ACTION BUTTONS */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionBtnView}
                    activeOpacity={0.7}
                    onPress={() => openView(admin)}>
                    <Text style={styles.actionBtnViewText}>👁️ View</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnEdit}
                    activeOpacity={0.7}
                    onPress={() => openEdit(admin)}>
                    <Text style={styles.actionBtnEditText}>✏️ Edit</Text>
                  </TouchableOpacity>

                  {isActive && (
                    <TouchableOpacity
                      style={styles.actionBtnSuspend}
                      activeOpacity={0.7}
                      onPress={() => openSuspend(admin)}>
                      <Text style={styles.actionBtnSuspendText}>⛔ Suspend</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ======================================================
          VIEW ADMIN DETAILS MODAL
          ====================================================== */}
      <Modal
        visible={viewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {viewingAdmin && (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Admin Details</Text>
                  <TouchableOpacity
                    onPress={() => setViewModalVisible(false)}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{maxHeight: 380}}>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>FULL NAME</Text>
                    <Text style={styles.detailVal}>{viewingAdmin.name}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>EMAIL</Text>
                    <Text style={styles.detailVal}>{viewingAdmin.email}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>MOBILE</Text>
                    <Text style={styles.detailVal}>{viewingAdmin.mobile}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>BRANCH</Text>
                    <Text style={styles.detailVal}>{viewingAdmin.branchName}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>ROLE</Text>
                    <Text style={styles.detailVal}>{viewingAdmin.role}</Text>
                  </View>
                  <View style={styles.detailField}>
                    <Text style={styles.detailLabel}>STATUS</Text>
                    <Text
                      style={[
                        styles.detailVal,
                        {
                          color:
                            viewingAdmin.status.toLowerCase() === 'active'
                              ? '#059669'
                              : '#DC2626',
                          fontWeight: '700',
                        },
                      ]}>
                      {viewingAdmin.status}
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.doneBtn}
                  activeOpacity={0.8}
                  onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.doneBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ======================================================
          ADD ADMIN MODAL
          ====================================================== */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Create New Admin</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. rahul@inrfs.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Text style={styles.inputLabel}>Assign Branch *</Text>
              <View style={styles.pillRow}>
                {branches.map(b => (
                  <TouchableOpacity
                    key={String(b.id)}
                    style={[
                      styles.selectPill,
                      selectedBranchId === b.id && styles.selectPillActive,
                    ]}
                    onPress={() => setSelectedBranchId(b.id)}>
                    <Text
                      style={[
                        styles.selectPillText,
                        selectedBranchId === b.id && styles.selectPillTextActive,
                      ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isCreating && {opacity: 0.6}]}
                disabled={isCreating}
                activeOpacity={0.8}
                onPress={handleAdd}>
                {isCreating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Admin</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          EDIT ADMIN MODAL
          ====================================================== */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Admin</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{maxHeight: 380}} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="email-address"
                autoCapitalize="none"
                value={editEmail}
                onChangeText={setEditEmail}
              />

              <Text style={styles.inputLabel}>Mobile Number *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                value={editMobile}
                onChangeText={setEditMobile}
              />

              <Text style={styles.inputLabel}>Branch *</Text>
              <View style={styles.pillRow}>
                {branches.map(b => (
                  <TouchableOpacity
                    key={String(b.id)}
                    style={[
                      styles.selectPill,
                      editBranchId === b.id && styles.selectPillActive,
                    ]}
                    onPress={() => setEditBranchId(b.id)}>
                    <Text
                      style={[
                        styles.selectPillText,
                        editBranchId === b.id && styles.selectPillTextActive,
                      ]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    editStatusId === 2 && styles.statusToggleBtnActiveGreen,
                  ]}
                  onPress={() => setEditStatusId(2)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      editStatusId === 2 && styles.statusToggleTextActiveGreen,
                    ]}>
                    ✓ Active
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    editStatusId === 3 && styles.statusToggleBtnActiveRed,
                  ]}
                  onPress={() => setEditStatusId(3)}>
                  <Text
                    style={[
                      styles.statusToggleText,
                      editStatusId === 3 && styles.statusToggleTextActiveRed,
                    ]}>
                    ✕ Inactive
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, isUpdating && {opacity: 0.6}]}
                disabled={isUpdating}
                activeOpacity={0.8}
                onPress={handleSaveEdit}>
                {isUpdating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================
          SUSPEND CONFIRM MODAL
          ====================================================== */}
      <Modal
        visible={suspendModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSuspendModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, {color: '#DC2626'}]}>
                Suspend Admin
              </Text>
              <TouchableOpacity
                onPress={() => setSuspendModalVisible(false)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmText}>
              Are you sure you want to suspend administrator{' '}
              <Text style={{fontWeight: '800', color: '#0F172A'}}>
                {suspendingAdmin?.name}
              </Text>
              ? They will no longer be able to log in to the admin portal.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                disabled={isSuspending}
                onPress={() => setSuspendModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dangerBtn, isSuspending && {opacity: 0.6}]}
                disabled={isSuspending}
                activeOpacity={0.8}
                onPress={handleConfirmSuspend}>
                {isSuspending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.dangerBtnText}>Suspend</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminManagementScreen;