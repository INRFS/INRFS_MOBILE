import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity,  TextInput, Modal, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/UserManagementScreen.styles';
import {useAppData, SystemUser} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
const roleOptions: SystemUser['role'][] = ['Investor', 'Admin', 'Branch Manager', 'Super Admin'];

const UserManagementScreen = ({navigation}: any) => {
  const {systemUsers, branches, addSystemUser, deleteSystemUser} = useAppData();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [role, setRole] = useState<SystemUser['role']>('Investor');

  const filtered = systemUsers.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = () => {
    if (!name.trim() || !email.trim() || !branch.trim()) {
      Alert.alert('Missing details', 'Please fill in name, email and branch.');
      return;
    }
    addSystemUser({name: name.trim(), email: email.trim(), branch: branch.trim(), role});
    setName('');
    setEmail('');
    setBranch('');
    setRole('Investor');
    setModalVisible(false);
  };

  const confirmDelete = (id: string, userName: string) => {
    Alert.alert('Delete user', `Remove ${userName}'s account?`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteSystemUser(id)},
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="User Management" />
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {filtered.map(user => (
          <View key={user.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <Text style={styles.name}>{user.name}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{user.status}</Text>
              </View>
            </View>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{user.branch}</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{user.role}</Text>
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
                onPress={() => confirmDelete(user.id, user.name)}>
                <Text style={[styles.actionChipText, styles.deleteChipText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 ? <Text style={styles.emptyText}>No users match your search.</Text> : null}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add User</Text>

            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Divya Menon" value={name} onChangeText={setName} />

            <Text style={styles.modalLabel}>Email</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="name@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.modalLabel}>Branch</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Mumbai HQ" value={branch} onChangeText={setBranch} />
            <View style={styles.branchChipsRow}>
              {branches.map(b => (
                <TouchableOpacity key={b.id} style={styles.branchChip} onPress={() => setBranch(b.name)}>
                  <Text style={styles.branchChipText}>{b.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Role</Text>
            <View style={styles.roleChipsRow}>
              {roleOptions.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, role === r && styles.roleChipActive]}
                  onPress={() => setRole(r)}>
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveBtnText}>Save User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserManagementScreen;