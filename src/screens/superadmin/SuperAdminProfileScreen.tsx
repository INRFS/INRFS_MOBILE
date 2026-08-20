import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/SuperAdminProfileScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import AppHeader from '../../components/AppHeader';
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
      <AppHeader subtitle="Profile" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ---------- Hero card ---------- */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} pointerEvents="none" />

          <View style={styles.heroTopRow}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarWrap}>
                <View style={styles.avatarCircle}>
                  {adminProfile.avatarUri ? (
                    <Image source={{uri: adminProfile.avatarUri}} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarInitial}>
                      {adminProfile.name?.charAt(0)?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.avatarBadge}>
                  <Text style={styles.avatarBadgeIcon}>✓</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroTextCol}>
              <Text style={styles.name}>{adminProfile.name}</Text>
              <Text style={styles.email}>{adminProfile.email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.rolePillText}>{adminProfile.role?.toUpperCase()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.goldDivider} />

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Branch</Text>
              <Text style={styles.heroStatValue}>{adminProfile.branch}</Text>
            </View>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Status</Text>
              <Text style={styles.heroStatValue}>{adminProfile.status}</Text>
            </View>
          </View>
        </View>

        {/* ---------- Account details card ---------- */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIconWrap}>
                <Text style={styles.cardHeaderIcon}>👤</Text>
              </View>
              <Text style={styles.cardHeaderText}>Account Details</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => (editing ? handleSave() : setEditing(true))}
            >
              <Text style={styles.editText}>{editing ? 'Save' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.fieldIconWrap}>
              <Text style={styles.fieldIcon}>🧑</Text>
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {editing ? (
                <TextInput style={styles.input} value={name} onChangeText={setName} />
              ) : (
                <Text style={styles.infoValue}>{adminProfile.name}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.fieldIconWrap}>
              <Text style={styles.fieldIcon}>✉️</Text>
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Email</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.infoValue}>{adminProfile.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.fieldIconWrap}>
              <Text style={styles.fieldIcon}>📱</Text>
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Mobile</Text>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{adminProfile.mobile}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.fieldIconWrapGold}>
              <Text style={styles.fieldIcon}>🏢</Text>
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Branch / Office</Text>
              {editing ? (
                <TextInput style={styles.input} value={branch} onChangeText={setBranch} />
              ) : (
                <Text style={styles.infoValue}>{adminProfile.branch}</Text>
              )}
            </View>
          </View>

          <View style={[styles.infoRow, {marginBottom: 0}]}>
            <View style={styles.fieldIconWrapGreen}>
              <Text style={styles.fieldIcon}>●</Text>
            </View>
            <View style={styles.infoTextCol}>
              <Text style={styles.infoLabel}>Status</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.infoValue}>{adminProfile.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity> */}
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
};

export default SuperAdminProfileScreen;