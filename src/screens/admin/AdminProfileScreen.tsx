import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AppHeader from '../../components/AppHeader';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminProfileScreen.styles';
import {validation} from '../../utils/validation';
import {
  getAdminProfile,
  updateAdminProfile,
  getErrorMessage,
} from '../../services/admin/adminProfileService';

export interface AdminProfile {
  name: string;
  email: string;
  mobile: string;
  role: string;
  branch: string;
  status: string;
  avatarUri: string;
}

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Admin&background=E5E7EB&color=374151&size=256';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminProfileScreen = ({navigation}: any) => {
  const {adminProfile: contextAdminProfile} = useAppData();

  const [profile, setProfile] = useState<AdminProfile>({
    name: contextAdminProfile?.name || 'Admin',
    email: contextAdminProfile?.email || '',
    mobile: contextAdminProfile?.mobile || '',
    role: contextAdminProfile?.role || 'Admin',
    branch: contextAdminProfile?.branch || 'Main Branch',
    status: contextAdminProfile?.status || 'Active',
    avatarUri: contextAdminProfile?.avatarUri || DEFAULT_AVATAR,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Mode state (matching Super Admin Profile)
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  /**
   * ============================================================
   * NORMALIZE PROFILE RESPONSE
   * ============================================================
   */
  const normalizeProfile = (response: any): AdminProfile => {
    const data =
      response?.data?.data ||
      response?.data ||
      response?.profile ||
      response ||
      {};

    return {
      name:
        data?.name ||
        data?.full_name ||
        data?.fullName ||
        contextAdminProfile?.name ||
        'Admin',

      email:
        data?.email ||
        contextAdminProfile?.email ||
        '',

      mobile:
        data?.mobile ||
        data?.phone ||
        data?.phone_number ||
        data?.mobile_number ||
        contextAdminProfile?.mobile ||
        '',

      role:
        data?.role ||
        data?.user_role ||
        data?.role_name ||
        contextAdminProfile?.role ||
        'Admin',

      branch:
        data?.branch ||
        data?.branch_name ||
        data?.branchName ||
        contextAdminProfile?.branch ||
        'Main Branch',

      status:
        data?.status ||
        data?.status_name ||
        contextAdminProfile?.status ||
        'Active',

      avatarUri:
        data?.avatar ||
        data?.avatar_url ||
        data?.profile_image ||
        data?.profile_image_url ||
        contextAdminProfile?.avatarUri ||
        DEFAULT_AVATAR,
    };
  };

  /* ==========================================================
     LOAD PROFILE (GET /admin/profile)
     ========================================================== */

  const loadProfileData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setApiError('');

      const res = await getAdminProfile();
      const normalized = normalizeProfile(res);
      setProfile(normalized);
      setFormData({
        fullName: normalized.name !== '—' ? normalized.name : '',
        email: normalized.email !== '—' ? normalized.email : '',
        mobile: normalized.mobile !== '—' ? normalized.mobile : '',
      });
    } catch (err: any) {
      console.log('Error loading admin profile:', err);
      // If error occurs, keep context fallback if available
      setApiError(
        getErrorMessage(err) || 'Unable to load profile. Please check your connection.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contextAdminProfile]);

  useEffect(() => {
    loadProfileData(true);
  }, [loadProfileData]);

  /* ==========================================================
     EDIT MODE TOGGLES
     ========================================================== */

  const handleStartEdit = () => {
    setFormData({
      fullName: profile.name !== '—' ? profile.name : '',
      email: profile.email !== '—' ? profile.email : '',
      mobile: profile.mobile !== '—' ? profile.mobile : '',
    });
    setErrors({});
    setApiError('');
    setSuccessMsg('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profile.name !== '—' ? profile.name : '',
      email: profile.email !== '—' ? profile.email : '',
      mobile: profile.mobile !== '—' ? profile.mobile : '',
    });
    setErrors({});
    setApiError('');
    setIsEditing(false);
  };

  /* ==========================================================
     FIELD-LEVEL VALIDATION
     ========================================================== */

  const handleFieldChange = (field: 'fullName' | 'email' | 'mobile', value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors(prev => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
    if (apiError) setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validation.isValidName(formData.fullName.trim());
    if (!nameCheck.isValid) {
      newErrors.fullName = nameCheck.error || 'Name should contain only letters and spaces.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (/\D/.test(formData.mobile.trim()) || formData.mobile.trim().length !== 10) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==========================================================
     SAVE CHANGES (PUT /admin/profile)
     ========================================================== */

  const handleSave = async () => {
    if (isSaving) return;

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setApiError('');
      setSuccessMsg('');

      await updateAdminProfile({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      });

      // Re-fetch profile from backend
      const res = await getAdminProfile();
      const updated = normalizeProfile(res);

      setProfile(updated);
      setFormData({
        fullName: updated.name !== '—' ? updated.name : '',
        email: updated.email !== '—' ? updated.email : '',
        mobile: updated.mobile !== '—' ? updated.mobile : '',
      });

      setIsEditing(false);
      setSuccessMsg('✓ Profile updated successfully!');

      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err: any) {
      console.log('Error updating admin profile:', err);
      setApiError(getErrorMessage(err) || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ==========================================================
     LOGOUT HANDLER
     ========================================================== */

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of the Admin portal?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('admin_token');
            await AsyncStorage.removeItem('jwt');
          } catch (error) {
            console.log('Logout storage error:', error);
          }
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfileData(false)}
              colors={['#0B1E45', '#2563EB']}
            />
          }>
          {/* SUCCESS BANNER */}
          {successMsg ? (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}

          {/* ERROR BANNER */}
          {apiError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{apiError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadProfileData(true)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* LOADING SPINNER */}
          {loading ? (
            <View style={{paddingVertical: 50, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#0B1E45" />
              <Text style={{marginTop: 14, color: '#6B7280', fontSize: 14, fontWeight: '500'}}>
                Loading profile...
              </Text>
            </View>
          ) : (
            <>
              {/* ---------- Hero Summary Card (Matching Super Admin) ---------- */}
              <View style={styles.heroCard}>
                <View style={styles.heroGlow} pointerEvents="none" />

                <View style={styles.heroTopRow}>
                  <View style={styles.avatarRing}>
                    <View style={styles.avatarWrap}>
                      <View style={styles.avatarCircle}>
                        {profile.avatarUri ? (
                          <Image source={{uri: profile.avatarUri}} style={styles.avatarImage} />
                        ) : (
                          <Text style={styles.avatarInitial}>
                            {profile.name?.charAt(0)?.toUpperCase() || 'A'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.avatarBadge}>
                        <Text style={styles.avatarBadgeIcon}>✓</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.heroTextCol}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <Text style={styles.email}>{profile.email || '-'}</Text>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{profile.role?.toUpperCase() || 'ADMIN'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.goldDivider} />

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatCol}>
                    <Text style={styles.heroStatLabel}>BRANCH</Text>
                    <Text style={styles.heroStatValue}>{profile.branch || 'Main Branch'}</Text>
                  </View>
                  <View style={styles.heroStatCol}>
                    <Text style={styles.heroStatLabel}>ACCOUNT STATUS</Text>
                    <Text style={styles.heroStatValue}>{profile.status || 'Active'}</Text>
                  </View>
                </View>
              </View>

              {/* ---------- Personal Information Card (Matching Super Admin) ---------- */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.cardHeaderIconWrap}>
                      <Text style={styles.cardHeaderIcon}>👤</Text>
                    </View>
                    <Text style={styles.cardHeaderText}>Personal Information</Text>
                  </View>

                  {!isEditing && (
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={handleStartEdit}>
                      <Text style={styles.editText}>✏️ Edit Profile</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.divider} />

                {/* FULL NAME */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrap}>
                    <Text style={styles.fieldIcon}>👤</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>FULL NAME *</Text>
                    </View>
                    {isEditing ? (
                      <>
                        <TextInput
                          style={[styles.input, errors.fullName && styles.inputError]}
                          value={formData.fullName}
                          onChangeText={val => handleFieldChange('fullName', val)}
                          placeholder="Enter your full name"
                          placeholderTextColor="#9CA3AF"
                          autoCapitalize="words"
                        />
                        {errors.fullName ? (
                          <Text style={styles.errorTextSmall}>{errors.fullName}</Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={styles.infoValue}>{profile.name || '-'}</Text>
                    )}
                  </View>
                </View>

                {/* MOBILE */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrapGreen}>
                    <Text style={styles.fieldIcon}>📞</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>MOBILE *</Text>
                    </View>
                    {isEditing ? (
                      <>
                        <TextInput
                          style={[styles.input, errors.mobile && styles.inputError]}
                          value={formData.mobile}
                          onChangeText={val => handleFieldChange('mobile', val)}
                          placeholder="Enter mobile number"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="phone-pad"
                        />
                        {errors.mobile ? (
                          <Text style={styles.errorTextSmall}>{errors.mobile}</Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={styles.infoValue}>{profile.mobile || '—'}</Text>
                    )}
                  </View>
                </View>

                {/* EMAIL */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrap}>
                    <Text style={styles.fieldIcon}>✉️</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>EMAIL ADDRESS *</Text>
                    </View>
                    {isEditing ? (
                      <>
                        <TextInput
                          style={[styles.input, errors.email && styles.inputError]}
                          value={formData.email}
                          onChangeText={val => handleFieldChange('email', val)}
                          placeholder="Enter email address"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                        {errors.email ? (
                          <Text style={styles.errorTextSmall}>{errors.email}</Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={styles.infoValue}>{profile.email || '—'}</Text>
                    )}
                  </View>
                </View>

                {/* ROLE (Read-only) */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrapGold}>
                    <Text style={styles.fieldIcon}>🛡️</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>ROLE</Text>
                      {isEditing && <Text style={styles.readOnlyBadge}>🔒 Read-only</Text>}
                    </View>
                    <Text style={styles.infoValue}>{profile.role || 'Admin'}</Text>
                  </View>
                </View>

                {/* BRANCH (Read-only) */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrapPurple}>
                    <Text style={styles.fieldIcon}>🏢</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>BRANCH</Text>
                      {isEditing && <Text style={styles.readOnlyBadge}>🔒 Read-only</Text>}
                    </View>
                    <Text style={styles.infoValue}>{profile.branch || 'Main Branch'}</Text>
                  </View>
                </View>

                {/* STATUS (Read-only) */}
                <View style={styles.infoRow}>
                  <View style={styles.fieldIconWrapGreen}>
                    <Text style={styles.fieldIcon}>✓</Text>
                  </View>
                  <View style={styles.infoTextCol}>
                    <View style={styles.infoLabelRow}>
                      <Text style={styles.infoLabel}>STATUS</Text>
                      {isEditing && <Text style={styles.readOnlyBadge}>🔒 Read-only</Text>}
                    </View>
                    <View style={styles.statusRow}>
                      <View style={styles.statusDot} />
                      <Text style={[styles.infoValue, {color: '#059669'}]}>
                        {profile.status || 'Active'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* EDIT MODE ACTIONS: CANCEL & SAVE CHANGES */}
                {isEditing && (
                  <View style={styles.editActionsRow}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      disabled={isSaving}
                      onPress={handleCancelEdit}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                      disabled={isSaving}
                      onPress={handleSave}>
                      {isSaving ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ---------- Logout button (Matching Super Admin) ---------- */}
              {!isEditing && (
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AdminBottomTabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
};

export default AdminProfileScreen;