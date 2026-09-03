import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {InternalAxiosRequestConfig} from 'axios';

import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/ProfileScreen.styles';
import AppHeader from '../components/AppHeader';
import {
  investorService,
  InvestorProfileResponse,
  UpdateProfileRequest,
} from '../services/investorService';
import {validation} from '../utils/validation';

/**
 * UI model
 */
type Investor = {
  investorId: string;
  name: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  address: string;
  city: string;
  stateId: number;
  stateName: string;
  pincode: string;
  branchId: number;
  branchName: string;
  status: string;

  bank: {
    id?: number;
    accountHolderName: string;
    name: string;
    accountTypeId: number;
    accountType: string;
    accountNumber: string;
    ifsc: string;
    isPrimary?: boolean;
  };
};

/**
 * ============================================================
 * API RESPONSE -> UI MODEL
 * ============================================================
 */

const mapApiProfileToInvestor = (
  data: InvestorProfileResponse,
): Investor => {
  return {
    investorId: data.investor_id ?? '',
    name: data.full_name ?? '',
    mobile: data.mobile ?? '',
    email: data.email ?? '',
    dateOfBirth: data.date_of_birth ?? '',
    aadhaarNumber: data.aadhaar_number ?? '',
    address: data.address ?? '',
    city: data.city ?? '',
    stateId: data.state_id ?? 0,
    stateName: data.state_name ?? '',
    pincode: data.pincode ?? '',
    branchId: data.branch_id ?? 0,
    branchName: data.branch_name ?? '',
    status: data.status ?? 'Active',

    bank: {
      id: data.bank?.id ?? undefined,
      accountHolderName: data.bank?.account_holder_name ?? '',
      name: data.bank?.bank_name ?? '',
      accountTypeId: data.bank?.account_type_id ?? 0,
      accountType: data.bank?.account_type ?? '',
      accountNumber: data.bank?.account_number ?? '',
      ifsc: data.bank?.ifsc_code ?? '',
      isPrimary: data.bank?.is_primary ?? false,
    },
  };
};

/**
 * ============================================================
 * UI MODEL -> PUT REQUEST
 * ============================================================
 */

const mapInvestorToUpdateRequest = (
  investor: Investor,
): UpdateProfileRequest => {
  return {
    full_name: investor.name.trim(),
    mobile: investor.mobile.trim(),
    email: investor.email.trim(),
    date_of_birth: investor.dateOfBirth.trim(),
    address: investor.address.trim(),
    city: investor.city.trim(),
    state_id: Number(investor.stateId),
    pincode: investor.pincode.trim(),
    branch_id: Number(investor.branchId),

    bank: {
      account_holder_name: investor.bank.accountHolderName.trim(),
      bank_name: investor.bank.name.trim(),
      account_type_id: Number(investor.bank.accountTypeId),
      account_number: investor.bank.accountNumber.trim(),
      ifsc_code: investor.bank.ifsc.trim().toUpperCase(),
    },
  };
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ProfileScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route?: any;
}) => {
  /**
   * We intentionally DO NOT use investorId to fetch the profile.
   *
   * The API:
   * GET /investors/profile
   *
   * gets the profile belonging to the authenticated user.
   */
  const routeInvestorId = route?.params?.investorId;

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [draft, setDraft] = useState<Investor | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * ==========================================================
   * LOAD PROFILE
   * ==========================================================
   */

  const fetchProfile = useCallback(async () => {
    try {
      const data = await investorService.getProfile();
      const profile = mapApiProfileToInvestor(data);

      setInvestor(profile);
      setDraft(profile);
    } catch (error: any) {
      console.log('GET /investors/profile error:', error);
      Alert.alert(
        'Unable to load profile',
        error?.message || 'Could not fetch your profile. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Load profile when screen opens.
   */
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Pull-to-refresh.
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  /**
   * ==========================================================
   * EDIT
   * ==========================================================
   */

  const handleStartEdit = () => {
    if (!investor) {
      return;
    }

    setDraft({...investor});
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (investor) {
      setDraft({...investor});
    }
    setFieldErrors({});
    setIsEditing(false);
  };

  /**
   * ==========================================================
   * VALIDATION
   * ==========================================================
   */

  const validateProfile = (data: Investor): boolean => {
    const errors: Record<string, string> = {};

    const nameCheck = validation.isValidName(data.name);
    if (!nameCheck.isValid) {
      errors.name = nameCheck.error || 'Please enter a valid full name.';
    }

    const mobileCheck = validation.isValidIndianMobile(data.mobile);
    if (!mobileCheck.isValid) {
      errors.mobile = mobileCheck.error || 'Please enter a valid 10-digit mobile number.';
    }

    const emailCheck = validation.isValidEmail(data.email);
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error || 'Please enter a valid email address.';
    }

    if (!data.dateOfBirth.trim()) {
      errors.dateOfBirth = 'Date of birth cannot be empty.';
    }

    if (!data.address.trim()) {
      errors.address = 'Address cannot be empty.';
    }

    const cityCheck = validation.isValidCity(data.city);
    if (!cityCheck.isValid) {
      errors.city = cityCheck.error || 'Please enter a valid city name.';
    }

    if (!data.stateId || Number(data.stateId) <= 0) {
      errors.stateId = 'State is required.';
    }

    const pinCheck = validation.isValidPincode(data.pincode);
    if (!pinCheck.isValid) {
      errors.pincode = pinCheck.error || 'Please enter a valid 6-digit PIN code.';
    }

    if (!data.branchId || Number(data.branchId) <= 0) {
      errors.branchId = 'Branch is required.';
    }

    const holderCheck = validation.isValidName(data.bank.accountHolderName);
    if (!holderCheck.isValid) {
      errors.accountHolderName =
        holderCheck.error || 'Bank account holder name should contain only letters and spaces.';
    }

    if (!data.bank.name.trim()) {
      errors.bankName = 'Bank name cannot be empty.';
    }

    if (
      !data.bank.accountTypeId ||
      Number(data.bank.accountTypeId) <= 0
    ) {
      errors.accountTypeId = 'Bank account type is required.';
    }

    const accCheck = validation.isValidAccountNumber(data.bank.accountNumber);
    if (!accCheck.isValid) {
      errors.accountNumber = accCheck.error || 'Invalid bank account number.';
    }

    const ifscCheck = validation.isValidIFSC(data.bank.ifsc);
    if (!ifscCheck.isValid) {
      errors.ifsc = ifscCheck.error || 'Invalid IFSC code.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * ==========================================================
   * UPDATE PROFILE
   * ==========================================================
   */

  const handleSaveChanges = async () => {
    if (!draft) {
      return;
    }

    if (!validateProfile(draft)) {
      return;
    }

    try {
      setSaving(true);

      const requestBody = mapInvestorToUpdateRequest(draft);

      const updated = await investorService.updateProfile(requestBody);

      if (updated) {
        const updatedProfile = mapApiProfileToInvestor(updated);
        setInvestor(updatedProfile);
        setDraft(updatedProfile);
      } else {
        await fetchProfile();
      }

      setIsEditing(false);

      Alert.alert(
        'Profile updated',
        'Your profile changes have been saved successfully.',
      );
    } catch (error: any) {
      console.log('PUT /investors/profile error:', error);
      Alert.alert('Update failed', error?.message || 'Could not update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * ==========================================================
   * DRAFT UPDATES
   * ==========================================================
   */

  const updateDraft = (
    field: keyof Investor,
    value: string | number,
  ) => {
    setFieldErrors(prev => {
      if (!prev[field]) return prev;
      const next = {...prev};
      delete next[field];
      return next;
    });
    setDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const updateBankDraft = (
    field: keyof Investor['bank'],
    value: string | number,
  ) => {
    const errKey = field === 'accountHolderName' ? 'accountHolderName' : field === 'name' ? 'bankName' : field;
    setFieldErrors(prev => {
      if (!prev[errKey]) return prev;
      const next = {...prev};
      delete next[errKey];
      return next;
    });
    setDraft(prev => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        bank: {
          ...prev.bank,
          [field]: value,
        },
      };
    });
  };

  /**
   * ==========================================================
   * LOGOUT
   * ==========================================================
   */

  const handleLogout = async () => {
    try {
      await Promise.all(
        [
          'access_token',
          'accessToken',
          'token',
          'authToken',
          'jwt_token',
        ].map(key => AsyncStorage.removeItem(key)),
      );
    } catch (error) {
      console.log('Logout storage error:', error);
    }

    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  /**
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading) {
    return (
      <View
        style={[
          styles.safeArea,
          {
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <ActivityIndicator size="large" color="#1955F0" />

        <Text
          style={{
            marginTop: 12,
            color: '#64748B',
            fontSize: 14,
          }}>
          Loading your profile...
        </Text>
      </View>
    );
  }

  /**
   * ==========================================================
   * ERROR / EMPTY PROFILE
   * ==========================================================
   */

  if (!investor || !draft) {
    return (
      <View
        style={[
          styles.safeArea,
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}>
        <Icon
          name="account-alert-outline"
          size={54}
          color="#94A3B8"
        />

        <Text
          style={{
            marginTop: 16,
            fontSize: 18,
            fontWeight: '700',
            color: '#102A56',
          }}>
          Profile unavailable
        </Text>

        <TouchableOpacity
          onPress={fetchProfile}
          style={{
            marginTop: 20,
            backgroundColor: '#1955F0',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}>
          <Text
            style={{
              color: '#fff',
              fontWeight: '700',
            }}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }>
        {/* Header */}
        <AppHeader subtitle="Investment Portal" />

        {/* Toolbar */}
        <View style={styles.profileToolbar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.profileBackButton}>
            <Icon
              name="arrow-left"
              size={20}
              color="#102A56"
            />
          </TouchableOpacity>

          <Text style={styles.profileToolbarTitle}>
            My Profile
          </Text>

          <View style={styles.profileToolbarActions}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  onPress={handleCancelEdit}
                  style={styles.profileActionButton}
                  disabled={saving}>
                  <Icon
                    name="close"
                    size={20}
                    color="#DC2626"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveChanges}
                  style={styles.profileActionButton}
                  disabled={saving}>
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#059669"
                    />
                  ) : (
                    <Icon
                      name="check"
                      size={20}
                      color="#059669"
                    />
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={handleStartEdit}
                style={styles.profileActionButton}>
                <Icon
                  name="pencil-outline"
                  size={19}
                  color="#1955F0"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* =====================================================
            HERO CARD
        ====================================================== */}

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>
                  {investor.name
                    ? investor.name.charAt(0).toUpperCase()
                    : 'I'}
                </Text>
              </View>

              <View style={styles.avatarBadge}>
                <Icon
                  name="check"
                  size={14}
                  color="#fff"
                />
              </View>
            </View>

            <View style={styles.heroTextCol}>
              <Text style={styles.name}>
                {investor.name}
              </Text>

              <Text style={styles.email}>
                {investor.email}
              </Text>

              <View style={styles.kycPill}>
                <Icon
                  name="shield-check"
                  size={13}
                  color="#34D399"
                />

                <Text style={styles.kycPillText}>
                  {investor.status === 'Verified'
                    ? 'KYC VERIFIED'
                    : investor.status?.toUpperCase() ||
                      'VERIFIED'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.cardHeaderIconWrap}>
                <Icon
                  name="account-outline"
                  size={16}
                  color="#2563EB"
                />
              </View>

              <Text style={styles.cardHeaderText}>
                Personal Information
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Full Name */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="account-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Full Name
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.name}
                      onChangeText={v =>
                        updateDraft('name', v)
                      }
                      placeholder="Full name"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.name ? (
                      <Text style={styles.fieldError}>{fieldErrors.name}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.name}
                  </Text>
                )}
              </View>
            </View>

            {/* Mobile */}
            <View style={styles.infoCol}>
              <FieldIcon name="phone-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Mobile Number
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.mobile}
                      onChangeText={v =>
                        updateDraft('mobile', v)
                      }
                      keyboardType="phone-pad"
                      placeholder="Mobile number"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.mobile ? (
                      <Text style={styles.fieldError}>{fieldErrors.mobile}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.mobile}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Email + DOB */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="email-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Email Address
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.email}
                      onChangeText={v =>
                        updateDraft('email', v)
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Email address"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.email ? (
                      <Text style={styles.fieldError}>{fieldErrors.email}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.email}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <FieldIcon name="calendar-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Date of Birth
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.dateOfBirth}
                      onChangeText={v =>
                        updateDraft('dateOfBirth', v)
                      }
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.dateOfBirth ? (
                      <Text style={styles.fieldError}>{fieldErrors.dateOfBirth}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.dateOfBirth}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Address */}
          <View style={styles.infoRow}>
            <View
              style={[
                styles.infoCol,
                styles.fullWidthCol,
              ]}>
              <FieldIcon name="map-marker-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Address
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.address}
                      onChangeText={v =>
                        updateDraft('address', v)
                      }
                      placeholder="Address"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.address ? (
                      <Text style={styles.fieldError}>{fieldErrors.address}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.address}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* City + Pincode */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="city-variant-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  City
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.city}
                      onChangeText={v =>
                        updateDraft('city', v)
                      }
                      placeholder="City"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.city ? (
                      <Text style={styles.fieldError}>{fieldErrors.city}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.city}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <FieldIcon name="map-marker-radius-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Pincode
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.pincode}
                      onChangeText={v =>
                        updateDraft('pincode', v)
                      }
                      keyboardType="number-pad"
                      placeholder="Pincode"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.pincode ? (
                      <Text style={styles.fieldError}>{fieldErrors.pincode}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.pincode}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* State ID + Branch ID */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon name="map-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  State
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={String(draft.stateId)}
                      onChangeText={v =>
                        updateDraft(
                          'stateId',
                          Number(v.replace(/[^0-9]/g, '')) || 0,
                        )
                      }
                      keyboardType="number-pad"
                      placeholder="State ID"
                      placeholderTextColor="#9CA3AF"
                    />

                    {fieldErrors.stateId ? (
                      <Text style={styles.fieldError}>{fieldErrors.stateId}</Text>
                    ) : null}

                    {!!draft.stateName && (
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#64748B',
                        }}>
                        Current: {draft.stateName}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.stateName ||
                      `State ID: ${investor.stateId}`}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <FieldIcon name="office-building-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Branch
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={String(draft.branchId)}
                      onChangeText={v =>
                        updateDraft(
                          'branchId',
                          Number(v.replace(/[^0-9]/g, '')) || 0,
                        )
                      }
                      keyboardType="number-pad"
                      placeholder="Branch ID"
                      placeholderTextColor="#9CA3AF"
                    />

                    {fieldErrors.branchId ? (
                      <Text style={styles.fieldError}>{fieldErrors.branchId}</Text>
                    ) : null}

                    {!!draft.branchName && (
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#64748B',
                        }}>
                        Current: {draft.branchName}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.branchName ||
                      `Branch ID: ${investor.branchId}`}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Aadhaar */}
          <View
            style={[
              styles.infoRow,
              {marginBottom: 0},
            ]}>
            <View
              style={[
                styles.infoCol,
                styles.fullWidthCol,
              ]}>
              <FieldIcon name="card-account-details-outline" />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Aadhaar Number
                </Text>

                <Text style={styles.infoValue}>
                  {investor.aadhaarNumber
                    ? `XXXX XXXX ${investor.aadhaarNumber.slice(-4)}`
                    : 'Not available'}
                </Text>

                <Text
                  style={{
                    marginTop: 3,
                    fontSize: 11,
                    color: '#64748B',
                  }}>
                  Aadhaar cannot be edited from this screen.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            BANK DETAILS
        ====================================================== */}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={styles.cardHeaderIconWrapGreen}>
                <Icon
                  name="bank-outline"
                  size={16}
                  color="#059669"
                />
              </View>

              <Text style={styles.cardHeaderText}>
                Bank Details
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Account Holder + Bank Name */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon
                name="account-outline"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Account Holder Name
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={
                        draft.bank.accountHolderName
                      }
                      onChangeText={v =>
                        updateBankDraft(
                          'accountHolderName',
                          v,
                        )
                      }
                      placeholder="Account holder name"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.accountHolderName ? (
                      <Text style={styles.fieldError}>{fieldErrors.accountHolderName}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.bank.accountHolderName}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <FieldIcon
                name="bank-outline"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Bank Name
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.bank.name}
                      onChangeText={v =>
                        updateBankDraft('name', v)
                      }
                      placeholder="Bank name"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.bankName ? (
                      <Text style={styles.fieldError}>{fieldErrors.bankName}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.bank.name}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Account Number */}
          <View style={styles.infoRow}>
            <View style={styles.infoCol}>
              <FieldIcon
                name="credit-card-outline"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Account Number
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={
                        draft.bank.accountNumber
                      }
                      onChangeText={v =>
                        updateBankDraft(
                          'accountNumber',
                          v,
                        )
                      }
                      keyboardType="number-pad"
                      placeholder="Account number"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.accountNumber ? (
                      <Text style={styles.fieldError}>{fieldErrors.accountNumber}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.bank.accountNumber}
                  </Text>
                )}
              </View>
            </View>

            {/* IFSC */}
            <View style={styles.infoCol}>
              <FieldIcon
                name="qrcode"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  IFSC Code
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={draft.bank.ifsc}
                      onChangeText={v =>
                        updateBankDraft(
                          'ifsc',
                          v.toUpperCase(),
                        )
                      }
                      autoCapitalize="characters"
                      placeholder="IFSC code"
                      placeholderTextColor="#9CA3AF"
                    />
                    {fieldErrors.ifsc ? (
                      <Text style={styles.fieldError}>{fieldErrors.ifsc}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.bank.ifsc}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Account Type */}
          <View
            style={[
              styles.infoRow,
              {marginBottom: 0},
            ]}>
            <View style={styles.infoCol}>
              <FieldIcon
                name="folder-account-outline"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Account Type
                </Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={String(
                        draft.bank.accountTypeId,
                      )}
                      onChangeText={v =>
                        updateBankDraft(
                          'accountTypeId',
                          Number(
                            v.replace(
                              /[^0-9]/g,
                              '',
                            ),
                          ) || 0,
                        )
                      }
                      keyboardType="number-pad"
                      placeholder="Account Type ID"
                      placeholderTextColor="#9CA3AF"
                    />

                    {fieldErrors.accountTypeId ? (
                      <Text style={styles.fieldError}>{fieldErrors.accountTypeId}</Text>
                    ) : null}

                    {!!draft.bank.accountType && (
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#64748B',
                        }}>
                        Current: {draft.bank.accountType}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.infoValue}>
                    {investor.bank.accountType ||
                      `Type ID: ${investor.bank.accountTypeId}`}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoCol}>
              <FieldIcon
                name="check-circle-outline"
                variant="green"
              />

              <View style={styles.infoTextCol}>
                <Text style={styles.infoLabel}>
                  Primary Account
                </Text>

                <Text style={styles.infoValue}>
                  {investor.bank.isPrimary
                    ? 'Yes'
                    : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            LOGOUT
        ====================================================== */}

        {!isEditing && (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.85}
            onPress={handleLogout}>
            <Icon
              name="logout"
              size={18}
              color="#DC2626"
            />

            <Text style={styles.logoutBtnText}>
              Logout
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomTabBar
        active="Profile"
        navigation={navigation}
        investorId={
          investor.investorId || routeInvestorId
        }
      />
    </View>
  );
};

const FieldIcon = ({
  name,
  variant = 'blue',
}: {
  name: string;
  variant?: 'blue' | 'green';
}) => (
  <View
    style={
      variant === 'green'
        ? styles.fieldIconWrapGreen
        : styles.fieldIconWrap
    }>
    <Icon
      name={name}
      size={16}
      color={
        variant === 'green'
          ? '#059669'
          : '#2563EB'
      }
    />
  </View>
);

export default ProfileScreen;