import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/BranchManagementScreen.styles';
import {useAppData, Branch} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';

const BranchManagementScreen = ({navigation}: any) => {
  const {branches, addBranch, toggleBranchStatus, deleteBranch} = useAppData();
  const [search, setSearch] = useState('');

  // ---- Add Branch modal ----
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [adminName, setAdminName] = useState('');
  const [addStatus, setAddStatus] = useState<'Active' | 'Suspended'>('Active');
const [addAum, setAddAum] = useState('');
  // ---- View Details modal ----
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

  // ---- Edit Branch modal ----
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAdmin, setEditAdmin] = useState('');
  const [editAum, setEditAum] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended'>('Active');

  // ---- Delete confirm modal ----
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  // NOTE: context has no updateBranch() yet, so Name/City/Admin/AUM edits
  // are kept here as local overrides (session-only) merged on top of the
  // branches coming from context. Status edits use toggleBranchStatus and
  // persist normally through AsyncStorage.
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Branch>>>({});

  const displayBranches: Branch[] = branches.map(b =>
    localOverrides[b.id] ? {...b, ...localOverrides[b.id]} : b,
  );

  const filtered = displayBranches.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.adminName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!name.trim() || !city.trim() || !adminName.trim()) {
      Alert.alert('Missing details', 'Please fill in branch name, city and admin.');
      return;
    }
    // addBranch always creates the branch as Active in context today;
    // addStatus is captured for UI parity with the web Add modal.
    addBranch({name: name.trim(), city: city.trim(), adminName: adminName.trim()});
    setName('');
    setCity('');
    setAdminName('');
    setAddStatus('Active');
    setAddModalVisible(false);
  };

  const openView = (branch: Branch) => {
    setViewingBranch(branch);
    setViewModalVisible(true);
  };

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setEditName(branch.name);
    setEditCity(branch.city);
    setEditAdmin(branch.adminName);
    setEditAum(branch.aum);
    setEditStatus(branch.status);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingBranch) return;
    if (!editName.trim() || !editCity.trim() || !editAdmin.trim()) {
      Alert.alert('Missing details', 'Please fill in branch name, city and admin.');
      return;
    }

    // Persist status through the real context action so it's saved to
    // AsyncStorage and reflected everywhere else in the app.
    if (editStatus !== editingBranch.status) {
      toggleBranchStatus(editingBranch.id);
    }

    // Keep the rest as a local override until updateBranch exists in
    // AppNavigator.tsx.
    setLocalOverrides(prev => ({
      ...prev,
      [editingBranch.id]: {
        name: editName.trim(),
        city: editCity.trim(),
        adminName: editAdmin.trim(),
        aum: editAum.trim(),
      },
    }));

    setEditModalVisible(false);
    setEditingBranch(null);
    Alert.alert('Saved', 'Branch details updated.');
  };

  const openDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingBranch) return;
    deleteBranch(deletingBranch.id);
    setDeleteModalVisible(false);
    setDeletingBranch(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Branch Management" />
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search branches..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Branch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {filtered.map(branch => (
          <View key={branch.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <View style={[styles.statusPill, branch.status === 'Suspended' && styles.statusPillSuspended]}>
                <Text style={[styles.statusPillText, branch.status === 'Suspended' && styles.statusPillTextSuspended]}>
                  {branch.status}
                </Text>
              </View>
            </View>
            <Text style={styles.cardMeta}>{branch.city} • Admin: {branch.adminName}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBlock}>
                <Text style={styles.statBlockValue}>{branch.investors}</Text>
                <Text style={styles.statBlockLabel}>Investors</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statBlockValue}>{branch.aum}</Text>
                <Text style={styles.statBlockLabel}>AUM</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openView(branch)}>
                <Text style={styles.iconText}>👁️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(branch)}>
                <Text style={styles.iconText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, styles.iconBtnDelete]} onPress={() => openDelete(branch)}>
                <Text style={styles.iconText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 ? <Text style={styles.emptyText}>No branches match your search.</Text> : null}
      </ScrollView>

      {/* ---- View Details modal ---- */}
      <Modal visible={viewModalVisible} transparent animationType="fade" onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Branch Details</Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            {viewingBranch ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Branch</Text>
                  <Text style={styles.detailValue}>{viewingBranch.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>City</Text>
                  <Text style={styles.detailValue}>{viewingBranch.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Admin</Text>
                  <Text style={styles.detailValue}>{viewingBranch.adminName}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Investors</Text>
                  <Text style={styles.detailValue}>{viewingBranch.investors}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>AUM</Text>
                  <Text style={styles.detailValue}>{viewingBranch.aum}</Text>
                </View>
                <View style={[styles.detailRow, {borderBottomWidth: 0}]}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={styles.detailValue}>{viewingBranch.status}</Text>
                </View>
              </>
            ) : null}

            <TouchableOpacity style={styles.closeBtn} onPress={() => setViewModalVisible(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---- Edit Branch modal ---- */}
      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Edit Branch</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Branch Name</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} />

            <Text style={styles.modalLabel}>City</Text>
            <TextInput style={styles.modalInput} value={editCity} onChangeText={setEditCity} />

            <Text style={styles.modalLabel}>Admin</Text>
            <TextInput style={styles.modalInput} value={editAdmin} onChangeText={setEditAdmin} />

            <Text style={styles.modalLabel}>AUM</Text>
            <TextInput style={styles.modalInput} value={editAum} onChangeText={setEditAum} />

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[styles.statusToggleBtn, editStatus === 'Active' && styles.statusToggleBtnActive]}
                onPress={() => setEditStatus('Active')}>
                <Text style={[styles.statusToggleText, editStatus === 'Active' && styles.statusToggleTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusToggleBtn, editStatus === 'Suspended' && styles.statusToggleBtnActive]}
                onPress={() => setEditStatus('Suspended')}>
                <Text style={[styles.statusToggleText, editStatus === 'Suspended' && styles.statusToggleTextActive]}>
                  Suspended
                </Text>
              </TouchableOpacity>
            </View>

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
              <Text style={styles.modalTitle}>Remove Branch</Text>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.deleteMessage}>
              Are you sure you want to remove <Text style={styles.deleteMessageBold}>{deletingBranch?.name}</Text>?
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

      {/* ---- Add Branch modal ---- */}
      {/* <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}> */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.centeredCard}>
            <View style={styles.centeredHeaderRow}>
              <Text style={styles.modalTitle}>Add Branch</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Branch Name</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Hyderabad" value={name} onChangeText={setName} />

            <Text style={styles.modalLabel}>City</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Hyderabad" value={city} onChangeText={setCity} />

            <Text style={styles.modalLabel}>Admin</Text>
            <TextInput style={styles.modalInput} placeholder="Admin name" value={adminName} onChangeText={setAdminName} />

            <Text style={styles.modalLabel}>AUM</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. ₹3.5Cr" value={addAum} onChangeText={setAddAum} />

            <Text style={styles.modalLabel}>Status</Text>
            <View style={styles.statusToggleRow}>
              <TouchableOpacity
                style={[styles.statusToggleBtn, addStatus === 'Active' && styles.statusToggleBtnActive]}
                onPress={() => setAddStatus('Active')}>
                <Text style={[styles.statusToggleText, addStatus === 'Active' && styles.statusToggleTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statusToggleBtn, addStatus === 'Suspended' && styles.statusToggleBtnActive]}
                onPress={() => setAddStatus('Suspended')}>
                <Text style={[styles.statusToggleText, addStatus === 'Suspended' && styles.statusToggleTextActive]}>
                  Suspended
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveBtnText}>Add Branch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BranchManagementScreen;