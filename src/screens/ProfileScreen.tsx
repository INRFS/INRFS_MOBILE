import React from 'react';
import {View, Text, ScrollView, TouchableOpacity,Alert, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/ProfileScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
// Replace this with real investor data (from context/API) once available.
const investor = {
  name: 'Arjun Sharma',
  email: 'arjun@inrfs.in',
  mobile: '+91 98765 43210',
  role: 'Investor Portal',
  branch: 'Mumbai HQ',
  status: 'Active',
  kycVerified: true,
  bank: {
    name: 'HDFC Bank',
    accountNumber: '50100XXXXXX4321',
    ifsc: 'HDFC0001234',
    accountType: 'Savings',
  },
};

const ProfileScreen = ({navigation, route}: {navigation: any; route?: any}) => {
  const {investorId} = route?.params || {};

  const handleLogout = () => {
    // Resets the stack so the user can't press back into the authenticated app
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
       <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
    <Icon name="arrow-left" size={22} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>My Profile</Text>
  <View style={styles.headerActions}>
    <TouchableOpacity onPress={() => Alert.alert('Edit Profile', 'Wire this up once the edit-profile screen is ready.')}>
      <Text style={styles.editText}>EDIT</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.navigate('InvestorSettings')} style={styles.settingsBtn}>
      <Icon name="cog-outline" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
</View>

        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{investor.name.charAt(0)}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Icon name="shield-check" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{investor.name}</Text>
          <Text style={styles.email}>{investor.email}</Text>
          {investor.kycVerified && (
            <View style={styles.kycPill}>
              <Icon name="check-circle" size={14} color="#059669" />
              <Text style={styles.kycPillText}>KYC VERIFIED</Text>
            </View>
          )}
        </View>

        {/* Personal Information card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Icon name="account-outline" size={16} color="#374151" />
            <Text style={styles.cardHeaderText}>PERSONAL INFORMATION</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>FULL NAME</Text>
              <Text style={styles.infoValue}>{investor.name}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>MOBILE</Text>
              <Text style={styles.infoValue}>{investor.mobile}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              <Text style={styles.infoValue}>{investor.email}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ROLE</Text>
              <Text style={styles.infoValue}>{investor.role}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>BRANCH</Text>
              <Text style={styles.infoValue}>{investor.branch}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>STATUS</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.infoValue}>{investor.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Details card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Icon name="bank-outline" size={16} color="#374151" />
            <Text style={styles.cardHeaderText}>BANK DETAILS</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>BANK NAME</Text>
              <Text style={styles.infoValue}>{investor.bank.name}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.infoValue}>{investor.bank.accountNumber}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>IFSC CODE</Text>
              <Text style={styles.infoValue}>{investor.bank.ifsc}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ACCOUNT TYPE</Text>
              <Text style={styles.infoValue}>{investor.bank.accountType}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {/* <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
          <Icon name="file-document-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>Download KYC Documents</Text>
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleLogout}>
          <Icon name="logout" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Profile" navigation={navigation} investorId={investorId} />
    </View>
  );
};

export default ProfileScreen;