import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/SuperAdminProfileScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
const SuperAdminProfileScreen = ({navigation}: any) => {
  const {adminProfile, setAdminProfile} = useAppData();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [mobile, setMobile] = useState(adminProfile.mobile);
  const [branch, setBranch] = useState(adminProfile.branch);

  const handleSave = () => {
    setAdminProfile({name, email, mobile, branch});
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.reset({index: 0, routes: [{name: 'Login'}]}),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Profile" showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <Image source={{uri: adminProfile.avatarUri}} style={styles.avatar} />
          <Text style={styles.name}>{adminProfile.name}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{adminProfile.role}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Account Details</Text>
            <TouchableOpacity onPress={() => (editing ? handleSave() : setEditing(true))}>
              <Text style={styles.editText}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          {editing ? (
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          ) : (
            <Text style={styles.value}>{adminProfile.name}</Text>
          )}

          <Text style={styles.label}>Email</Text>
          {editing ? (
            <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
          ) : (
            <Text style={styles.value}>{adminProfile.email}</Text>
          )}

          <Text style={styles.label}>Mobile</Text>
          {editing ? (
            <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          ) : (
            <Text style={styles.value}>{adminProfile.mobile}</Text>
          )}

          <Text style={styles.label}>Branch / Office</Text>
          {editing ? (
            <TextInput style={styles.input} value={branch} onChangeText={setBranch} />
          ) : (
            <Text style={styles.value}>{adminProfile.branch}</Text>
          )}

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{adminProfile.status}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
};

export default SuperAdminProfileScreen;