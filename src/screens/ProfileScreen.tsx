import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Alert, TextInput} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/ProfileScreen.styles';

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

const FieldIcon = ({name, variant = 'blue'}: {name: string; variant?: 'blue' | 'green'}) => (
  <View style={variant === 'green' ? styles.fieldIconWrapGreen : styles.fieldIconWrap}>
    <Icon name={name} size={16} color={variant === 'green' ? '#059669' : '#2563EB'} />
  </View>
);

const ProfileScreen = ({navigation, route}: {navigation: any; route?: any}) => {
  const {investorId} = route?.params || {};

  const [investor, setInvestor] = useState(DEFAULT_INVESTOR);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(DEFAULT_INVESTOR);

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerActionsRow}>
            {isEditing ? (
              <>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.iconBtn}>
                  <Icon name="close" size={20} color="#DC2626" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveChanges} style={styles.iconBtn}>
                  <Icon name="check" size={20} color="#059669" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handleStartEdit} style={styles.iconBtn}>
                <Icon name="pencil-outline" size={18} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{investor.name.charAt(0)}</Text>
              </View>
              <View style={styles.avatarBadge}>
                <Icon name="check" size={14} color="#fff" />
              </View>
            </View>
            <View style={styles.heroTextCol}>
              <Text style={styles.name}>{investor.name}</Text>
              <Text style={styles.email}>{investor.email}</Text>
              {investor.kycVerified && (
                <View style={styles.kycPill}>
                  <Icon name="shield-check" size={13} color="#34D399" />
                  <Text style={styles.kycPillText}>KYC VERIFIED</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Personal Information card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIconWrap}>
                <Icon name="account-outline" size={16} color="#2563EB" />
              </View>
              <Text style={styles.cardHeaderText}>Personal Information</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="account-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Full Name</Text>
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
            </View>
            <View style={styles.infoCol}>
              <FieldIcon name="phone-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Mobile Number</Text>
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
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="email-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Email Address</Text>
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
            </View>
            <View style={styles.infoCol}>
              <FieldIcon name="briefcase-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{investor.role}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoCol, styles.fullWidthCol]}>
              <FieldIcon name="map-marker-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Address</Text>
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
          </View>

          <View style={[styles.infoRow, {marginBottom: 0}]}>
            <View style={styles.infoCol}>
              <FieldIcon name="office-building-outline" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Branch</Text>
                <Text style={styles.infoValue}>{investor.branch}</Text>
              </View>
            </View>
            <View style={styles.infoCol}>
              <View style={{width: 32}} />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusRow}>
                  <View style={styles.statusDot} />
                  <Text style={styles.infoValue}>{investor.status}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bank Details card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIconWrapGreen}>
                <Icon name="bank-outline" size={16} color="#059669" />
              </View>
              <Text style={styles.cardHeaderText}>Bank Details</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="credit-card-outline" variant="green" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Bank Name</Text>
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
            </View>
            <View style={styles.infoCol}>
              <FieldIcon name="credit-card-outline" variant="green" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Account Number</Text>
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
          </View>

          <View style={[styles.infoRow, {marginBottom: 0}]}>
            <View style={styles.infoCol}>
              <FieldIcon name="qrcode" variant="green" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>IFSC Code</Text>
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
            </View>
            <View style={styles.infoCol}>
              <FieldIcon name="folder-account-outline" variant="green" />
              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>Account Type</Text>
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
        </View>

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