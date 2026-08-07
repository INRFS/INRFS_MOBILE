import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/ProfileScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

// Replace this with real investor data (from context/API) once available.
const DEFAULT_INVESTOR = {
  name: 'Arjun Sharma',
  email: 'arjun@inrfs.in',
  mobile: '+91 98765 43210',
  address: '204, Silver Oak Residency, Andheri West, Mumbai - 400058',
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

  // NEW: investor is now state (was a plain const) so Save Changes can
  // actually persist the edits locally. Swap this for a real API call /
  // context update once the backend is wired up.
  const [investor, setInvestor] = useState(DEFAULT_INVESTOR);

  // NEW: edit mode toggle + a draft copy of the fields being edited. The
  // draft is only committed to `investor` on Save, so Cancel can discard
  // changes cleanly.
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_INVESTOR);

  const handleLogout = () => {
    // Resets the stack so the user can't press back into the authenticated app
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  // NEW: EDIT button now actually starts edit mode instead of showing a
  // placeholder alert. Seeds the draft with the current saved values.
  const handleStartEdit = () => {
    setDraft(investor);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(investor);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    if (!draft.name.trim()) {
      Alert.alert('Missing details', 'Full name cannot be empty.');
      return;
    }
    if (!draft.email.trim()) {
      Alert.alert('Missing details', 'Email cannot be empty.');
      return;
    }
    setInvestor(draft);
    setIsEditing(false);
    Alert.alert('Profile updated', 'Your profile changes have been saved.');
  };

  const updateDraft = (field: keyof typeof draft, value: string) => {
    setDraft(prev => ({...prev, [field]: value}));
  };

  const updateBankDraft = (field: keyof typeof draft.bank, value: string) => {
    setDraft(prev => ({...prev, bank: {...prev.bank, [field]: value}}));
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
            {isEditing ? (
              <>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.headerActionBtn}>
                  <Icon name="close" size={15} color="#fff" />
                  <Text style={styles.editText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveChanges} style={styles.headerActionBtn}>
                  <Icon name="content-save-outline" size={15} color="#fff" />
                  <Text style={styles.editText}>SAVE</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleStartEdit}>
                  <Text style={styles.editText}>EDIT</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={() => navigation.navigate('InvestorSettings')}
                  style={styles.settingsBtn}>
                  <Icon name="cog-outline" size={20} color="#fff" />
                </TouchableOpacity> */}
              </>
            )}
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
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.name}
                  onChangeText={v => updateDraft('name', v)}
                  placeholder="Full name"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.name}</Text>
              )}
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>MOBILE</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.mobile}
                  onChangeText={v => updateDraft('mobile', v)}
                  keyboardType="phone-pad"
                  placeholder="Mobile number"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.mobile}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>EMAIL</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.email}
                  onChangeText={v => updateDraft('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.email}</Text>
              )}
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ROLE</Text>
              <Text style={styles.infoValue}>{investor.role}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoCol, styles.fullWidthCol]}>
              <Text style={styles.infoLabel}>ADDRESS</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.address}
                  onChangeText={v => updateDraft('address', v)}
                  placeholder="Address"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.address}</Text>
              )}
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
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.bank.name}
                  onChangeText={v => updateBankDraft('name', v)}
                  placeholder="Bank name"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.bank.name}</Text>
              )}
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ACCOUNT NUMBER</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.bank.accountNumber}
                  onChangeText={v => updateBankDraft('accountNumber', v)}
                  placeholder="Account number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.bank.accountNumber}</Text>
              )}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>IFSC CODE</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.bank.ifsc}
                  onChangeText={v => updateBankDraft('ifsc', v.toUpperCase())}
                  placeholder="IFSC code"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.bank.ifsc}</Text>
              )}
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>ACCOUNT TYPE</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={draft.bank.accountType}
                  onChangeText={v => updateBankDraft('accountType', v)}
                  placeholder="Savings / Current"
                  placeholderTextColor="#9CA3AF"
                />
              ) : (
                <Text style={styles.infoValue}>{investor.bank.accountType}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        {/* <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.85}>
          <Icon name="file-document-outline" size={18} color="#fff" />
          <Text style={styles.downloadBtnText}>Download KYC Documents</Text>
        </TouchableOpacity> */}

        {!isEditing && (
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.85} onPress={handleLogout}>
            <Icon name="logout" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomTabBar active="Profile" navigation={navigation} investorId={investorId} />
    </View>
  );
};

export default ProfileScreen;