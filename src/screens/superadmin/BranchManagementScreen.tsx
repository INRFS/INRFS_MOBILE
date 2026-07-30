import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/BranchManagementScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
const BranchManagementScreen = ({navigation}: any) => {
  const {branches, addBranch, toggleBranchStatus, deleteBranch} = useAppData();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [adminName, setAdminName] = useState('');

  const filtered = branches.filter(
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
    addBranch({name: name.trim(), city: city.trim(), adminName: adminName.trim()});
    setName('');
    setCity('');
    setAdminName('');
    setModalVisible(false);
  };

  const confirmDelete = (id: string, branchName: string) => {
    Alert.alert('Delete branch', `Remove ${branchName}? This cannot be undone.`, [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Delete', style: 'destructive', onPress: () => deleteBranch(id)},
    ]);
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
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
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
              <TouchableOpacity style={styles.actionChip} onPress={() => toggleBranchStatus(branch.id)}>
                <Text style={styles.actionChipText}>
                  {branch.status === 'Active' ? 'Suspend' : 'Activate'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionChip, styles.deleteChip]}
                onPress={() => confirmDelete(branch.id, branch.name)}>
                <Text style={[styles.actionChipText, styles.deleteChipText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {filtered.length === 0 ? <Text style={styles.emptyText}>No branches match your search.</Text> : null}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Branch</Text>

            <Text style={styles.modalLabel}>Branch Name</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Hyderabad" value={name} onChangeText={setName} />

            <Text style={styles.modalLabel}>City</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Hyderabad" value={city} onChangeText={setCity} />

            <Text style={styles.modalLabel}>Branch Admin</Text>
            <TextInput style={styles.modalInput} placeholder="Admin name" value={adminName} onChangeText={setAdminName} />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
                <Text style={styles.modalSaveBtnText}>Save Branch</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BranchManagementScreen;