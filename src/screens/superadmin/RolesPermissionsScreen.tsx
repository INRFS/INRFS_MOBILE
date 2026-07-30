import React, {useState, useEffect} from 'react';
import {View, Text, ScrollView, TouchableOpacity,  Alert} from 'react-native';
// const styles = require('../../styles/superadmin/RolesPermissionsScreen.styles');
import {useAppData, SystemRole, PermissionKey} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {styles} from '../../styles/superadmin/RolesPermissionsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const permissionLabels: PermissionKey[] = [
  'View Dashboard', 'Approve KYC', 'Generate Bond', 'Process Settlement', 'Export Reports',
  'Manage Branches', 'Email Settings', 'Audit Logs', 'Manage Investors', 'Add Investment',
  'Mark Interest Paid', 'View Reports', 'Manage Admins', 'System Settings', 'SMS Settings', 'Delete Records',
];

const RolesPermissionsScreen = ({navigation}: any) => {
  const {systemRoles, updateRolePermissions} = useAppData();
  const [selectedRoleName, setSelectedRoleName] = useState<SystemRole['name']>('Admin');
  const selectedRole = systemRoles.find(r => r.name === selectedRoleName) as SystemRole;
  const [draftPerms, setDraftPerms] = useState<Record<PermissionKey, boolean>>(selectedRole.permissions);

  useEffect(() => {
    setDraftPerms(selectedRole.permissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleName]);

  const grantedCount = Object.values(draftPerms).filter(Boolean).length;

  const togglePerm = (key: PermissionKey) => {
    if (selectedRoleName === 'Super Admin') return; // Super Admin always has all permissions
    setDraftPerms(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleSave = () => {
    updateRolePermissions(selectedRoleName, draftPerms);
    Alert.alert('Saved', `Permissions updated for ${selectedRoleName}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Roles & Permissions" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>System Roles</Text>
        {systemRoles.map(role => (
          <TouchableOpacity
            key={role.name}
            style={[styles.roleCard, selectedRoleName === role.name && styles.roleCardActive]}
            onPress={() => setSelectedRoleName(role.name)}>
            <Text style={[styles.roleName, selectedRoleName === role.name && styles.roleNameActive]}>
              {role.name}
            </Text>
            <View style={styles.roleTagsRow}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>{role.usersCount} Users</Text>
              </View>
              <View style={[styles.roleTag, styles.permsTag]}>
                <Text style={[styles.roleTagText, styles.permsTagText]}>
                  {role.name === 'Super Admin'
                    ? 'All Permissions'
                    : `${Object.values(role.permissions).filter(Boolean).length}/${role.totalPerms} Permissions`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.matrixCard}>
          <View style={styles.matrixHeader}>
            <Text style={styles.matrixTitle}>Permission Matrix</Text>
            <View style={styles.matrixRolePill}>
              <Text style={styles.matrixRolePillText}>{selectedRoleName} Role</Text>
            </View>
          </View>
          <Text style={styles.matrixCount}>{grantedCount}/16 permissions granted</Text>

          {permissionLabels.map(perm => (
            <TouchableOpacity
              key={perm}
              style={styles.permRow}
              activeOpacity={0.7}
              disabled={selectedRoleName === 'Super Admin'}
              onPress={() => togglePerm(perm)}>
              <View
                style={[
                  styles.checkbox,
                  draftPerms[perm] && styles.checkboxChecked,
                  selectedRoleName === 'Super Admin' && styles.checkboxDisabled,
                ]}>
                {draftPerms[perm] ? <Text style={styles.checkmark}>✓</Text> : null}
              </View>
              <Text style={styles.permLabel}>{perm}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.saveBtn, selectedRoleName === 'Super Admin' && styles.saveBtnDisabled]}
            disabled={selectedRoleName === 'Super Admin'}
            onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Permissions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RolesPermissionsScreen;