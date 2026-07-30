import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity,  TextInput, Modal, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/AdminManagementScreen.styles';
import {useAppData, SAAdmin} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
const AdminManagementScreen = ({navigation}: any) => {
  const {saAdmins, branches, addSAAdmin, deleteSAAdmin} = useAppData();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [role, setRole] = useState<SAAdmin['role']>('Admin');

  const filtered = saAdmins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.branch.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !branch.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email and branch.');
      return;
    }
    addSAAdmin({name: name.trim(), email: email.trim(), branch: branch.trim(), role});
    setName('');
    setEmail('');
    setBranch('');
    setRole('Admin');
    setModalVisible(false);
  };

  const confirmDelete = (id: string, adminName: string) => {
    Alert.alert('Remove admin', `Remove ${adminName} from the system?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Remove', style: 'destructive', onPress: () => deleteSAAdmin(id)},
    ]);
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add Admin</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {filtered.map(admin => (
          <View key={admin.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.name}>{admin.name}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{admin.status}</Text>
              </View>
            </View>
            <Text style={styles.email}>{admin.email}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{admin.branch}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{admin.role}</Text>
              </View>
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionChip}>
                <Text style={styles.actionChipText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionChip}>
                <Text style={styles.actionChipText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionChip, styles.deleteChip]}
                onPress={() => confirmDelete(admin.id, admin.name)}>
                <Text style={[styles.actionChipText, styles.deleteChipText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 ? <Text style={styles.emptyText}>No admins match your search.</Text> : null}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Admin</Text>

            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Neha Kulkarni" value={name} onChangeText={setName} />

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="name@inrfs.in"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.modalLabel}>Branch</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Pune" value={branch} onChangeText={setBranch} />
            <View style={styles.branchChipsRow}>
              {branches.map(b => (
                <TouchableOpacity key={b.id} style={styles.branchChip} onPress={() => setBranch(b.name)}>
                  <Text style={styles.branchChipText}>{b.name}</Text>
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

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveBtnText}>Save Admin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminManagementScreen;