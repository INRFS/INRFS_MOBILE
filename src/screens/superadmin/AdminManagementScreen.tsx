import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, StyleSheet} from 'react-native';
import {styles} from '../../styles/superadmin/AdminManagementScreen.styles';
import {useAppData, SAAdmin} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';

const AdminManagementScreen = ({navigation}: any) => {
  const {saAdmins, branches, addSAAdmin, updateSAAdmin, deleteSAAdmin} = useAppData();
  const [search, setSearch] = useState('');

  // ---- Add Admin modal ----
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [branch, setBranch] = useState('');
  const [role, setRole] = useState<SAAdmin['role']>('Admin');
  const [addStatus, setAddStatus] = useState<'Active' | 'Inactive'>('Active');

  // ---- View Details modal ----
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<SAAdmin | null>(null);

  // ---- Edit Admin modal ----
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SAAdmin | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editRole, setEditRole] = useState<SAAdmin['role']>('Admin');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');

  // ---- Delete confirm modal ----
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<SAAdmin | null>(null);

  const filtered = saAdmins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.branch.toLowerCase().includes(search.toLowerCase()),
  );

  // FIX: mobile number is now required, same as name/email/branch. Before,
  // it was optional and silently fell back to '—' if left blank, so the
  // value shown everywhere downstream (card list, View Details, Edit modal)
  // wasn't guaranteed to be the number the person actually entered here.
  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !mobile.trim() || !branch.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email, mobile number and branch.');
      return;
    }
    addSAAdmin({name: name.trim(), email: email.trim(), mobile: mobile.trim(), branch: branch.trim(), role});
    setName('');
    setEmail('');
    setMobile('');
    setBranch('');
    setRole('Admin');
    setAddStatus('Active');
    setAddModalVisible(false);
  };

  const openView = (admin: SAAdmin) => {
    setViewingAdmin(admin);
    setViewModalVisible(true);
  };

  const openEdit = (admin: SAAdmin) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditMobile(admin.mobile === '—' ? '' : admin.mobile);
    setEditBranch(admin.branch);
    setEditRole(admin.role);
    setEditStatus(admin.status);
    setEditModalVisible(true);
  };

  // FIX: mobile is now required on Edit too, so a previously blank/'—'
  // record can't be re-saved without a real number, and can't be cleared
  // back out to '—' either.
  const handleSaveEdit = () => {
    if (!editingAdmin) return;
    if (!editName.trim() || !editEmail.trim() || !editMobile.trim() || !editBranch.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email, mobile number and branch.');
      return;
    }

    updateSAAdmin(editingAdmin.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      mobile: editMobile.trim(),
      branch: editBranch.trim(),
      role: editRole,
      status: editStatus,
    });

    setEditModalVisible(false);
    setEditingAdmin(null);
    Alert.alert('Saved', 'Admin details updated.');
  };

  const openDelete = (admin: SAAdmin) => {
    setDeletingAdmin(admin);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingAdmin) return;
    deleteSAAdmin(deletingAdmin.id);
    setDeleteModalVisible(false);
    setDeletingAdmin(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Admin Management" />
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search admins..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Admin</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {filtered.map(admin => (
          <View
            key={admin.id}
            style={[
              styles.card,
              {borderLeftColor: admin.status === 'Active' ? '#075370' : '#DC2626'},
            ]}>
            <View style={styles.cardTopRow}>
              <Text style={styles.name}>{admin.name}</Text>
              <View style={[styles.statusPill, admin.status === 'Inactive' && styles.statusPillInactive]}>
                <Text style={[styles.statusPillText, admin.status === 'Inactive' && styles.statusPillTextInactive]}>
                  {admin.status}
                </Text>
              </View>
            </View>

            <View style={styles.cardGrid}>
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>EMAIL</Text>
                <Text style={styles.cardValueSm}>{admin.email}</Text>
              </View>
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>MOBILE</Text>
                <Text style={styles.cardValueSm}>{admin.mobile}</Text>
              </View>
            </View>

            <View style={styles.cardGrid}>
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>BRANCH</Text>
                <Text style={styles.cardValueSm}>{admin.branch}</Text>
              </View>
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>ROLE</Text>
                <Text style={styles.cardValueSm}>{admin.role}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openView(admin)}>
                <Text style={styles.iconText}>👁️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(admin)}>
                <Text style={styles.iconText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDelete]} onPress={() => openDelete(admin)}>
                <Text style={styles.iconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 ? <Text style={styles.emptyText}>No admins match your search.</Text> : null}
      </ScrollView>

      {/* ---- View Details modal ---- */}
      {/* Restyled to match InvestorManagementScreen's details popup: a
          2-column label/value grid (uppercase, letter-spaced label on top,
          bold value below) instead of the old single-column detailRow list. */}
      <Modal visible={viewModalVisible} transparent animationType="fade" onRequestClose={() => setViewModalVisible(false)}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={() => setViewModalVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={modalStyles.card} onPress={() => {}}>
            {viewingAdmin ? (
              <>
                <View style={modalStyles.headerRow}>
                  <Text style={modalStyles.headerTitle}>{viewingAdmin.name}</Text>
                  <TouchableOpacity onPress={() => setViewModalVisible(false)} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={modalStyles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>EMAIL</Text>
                    <Text style={modalStyles.value}>{viewingAdmin.email}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>MOBILE</Text>
                    <Text style={modalStyles.value}>{viewingAdmin.mobile}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>BRANCH</Text>
                    <Text style={modalStyles.value}>{viewingAdmin.branch}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>ROLE</Text>
                    <Text style={modalStyles.value}>{viewingAdmin.role}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>STATUS</Text>
                    <View
                      style={[
                        modalStyles.pill,
                        viewingAdmin.status === 'Active' ? modalStyles.pillActive : modalStyles.pillInactive,
                        modalStyles.pillSpacing,
                      ]}>
                      <Text
                        style={[
                          modalStyles.pillText,
                          viewingAdmin.status === 'Active' ? modalStyles.pillTextActive : modalStyles.pillTextInactive,
                        ]}>
                        {viewingAdmin.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ---- Edit Admin modal ---- */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Edit Admin</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editScroll}>
              <Text style={styles.modalLabel}>Name</Text>
              <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                value={editEmail}
                onChangeText={setEditEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.modalLabel}>Mobile</Text>
              <TextInput
                style={styles.modalInput}
                value={editMobile}
                onChangeText={setEditMobile}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
              />

              <Text style={styles.modalLabel}>Branch</Text>
              <View style={styles.branchChipsRow}>
                {branches.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.branchChip, editBranch === b.name && styles.branchChipActive]}
                    onPress={() => setEditBranch(b.name)}>
                    <Text style={[styles.branchChipText, editBranch === b.name && styles.branchChipTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Role</Text>
              <View style={styles.roleToggleRow}>
                {(['Admin', 'Branch Manager'] as SAAdmin['role'][]).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleToggle, editRole === r && styles.roleToggleActive]}
                    onPress={() => setEditRole(r)}>
                    <Text style={[styles.roleToggleText, editRole === r && styles.roleToggleTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.roleToggleRow}>
                {(['Active', 'Inactive'] as const).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.roleToggle, editStatus === s && styles.roleToggleActive]}
                    onPress={() => setEditStatus(s)}>
                    <Text style={[styles.roleToggleText, editStatus === s && styles.roleToggleTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---- Delete confirm modal ---- */}
      <Modal visible={deleteModalVisible} transparent animationType="fade" onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Remove Admin</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteMessage}>
              Are you sure you want to remove <Text style={styles.deleteMessageBold}>{deletingAdmin?.name}</Text>?
              This can't be undone.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalRemoveBtn} onPress={handleConfirmDelete}>
                <Text style={styles.modalRemoveBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---- Add Admin modal ---- */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Add Admin</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editScroll}>
              <Text style={styles.modalLabel}>Name</Text>
              <TextInput style={styles.modalInput} placeholder="Full name" value={name} onChangeText={setName} />

              <Text style={styles.modalLabel}>Email</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="name@inrfs.in"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.modalLabel}>Mobile</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />

              <Text style={styles.modalLabel}>Branch</Text>
              <View style={styles.branchChipsRow}>
                {branches.map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.branchChip, branch === b.name && styles.branchChipActive]}
                    onPress={() => setBranch(b.name)}>
                    <Text style={[styles.branchChipText, branch === b.name && styles.branchChipTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Role</Text>
              <View style={styles.roleToggleRow}>
                {(['Admin', 'Branch Manager'] as SAAdmin['role'][]).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleToggle, role === r && styles.roleToggleActive]}
                    onPress={() => setRole(r)}>
                    <Text style={[styles.roleToggleText, role === r && styles.roleToggleTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.roleToggleRow}>
                {(['Active', 'Inactive'] as const).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.roleToggle, addStatus === s && styles.roleToggleActive]}
                    onPress={() => setAddStatus(s)}>
                    <Text style={[styles.roleToggleText, addStatus === s && styles.roleToggleTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveBtnText}>Add Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Same label/value grid pattern as InvestorManagementScreen's details
// popup, so both "View Details" modals across Admin Management and
// Investor Management look and align the same way.
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  grid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  pillSpacing: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillActive: {
    backgroundColor: '#DCFCE7',
  },
  pillInactive: {
    backgroundColor: '#FEE2E2',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#16A34A',
  },
  pillTextInactive: {
    color: '#DC2626',
  },
});

export default AdminManagementScreen;