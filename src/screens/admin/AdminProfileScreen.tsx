import React from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Image, Alert} from 'react-native';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminProfileScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const AdminProfileScreen = ({navigation}: any) => {
  const {adminProfile} = useAppData();

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>INRFS</Text>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <Image source={{uri: adminProfile.avatarUri}} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraBadge}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{adminProfile.name}</Text>
        <Text style={styles.email}>{adminProfile.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>🛡  {adminProfile.role}</Text>
        </View>

       <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconWrap}>
              <Text>✎</Text>
            </View>
            <Text style={styles.actionLabel}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminSettings')}>
            <View style={[styles.actionIconWrap, {backgroundColor: '#DBEAFE'}]}>
              <Text>⚙️</Text>
            </View>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🧑</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>FULL NAME</Text>
              <Text style={styles.infoValue}>{adminProfile.name}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>MOBILE</Text>
              <Text style={styles.infoValue}>{adminProfile.mobile}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉️</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.infoValue}>{adminProfile.email}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💼</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>ROLE</Text>
              <Text style={styles.infoValue}>Admin Portal</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏢</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>BRANCH</Text>
              <Text style={styles.infoValue}>{adminProfile.branch}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✓</Text>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>STATUS</Text>
              <Text style={styles.infoValue}>{adminProfile.status}</Text>
            </View>
            <View style={[styles.statusDot, {backgroundColor: adminProfile.status === 'Active' ? '#16A34A' : '#9CA3AF'}]} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>⎋  Logout Session</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 2.4.0 (Enterprise Build)</Text>
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('BondTracking')}>
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>Portfolio</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InterestPayouts')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Payouts</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>👤</Text>
          <Text style={styles.tabLabelActive}>Profile</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminProfileScreen;