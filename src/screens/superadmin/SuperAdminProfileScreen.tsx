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
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {styles} from '../../styles/superadmin/SuperAdminProfileScreen.styles';
import {
  getSuperAdminProfile,
  updateSuperAdminProfile,
  getErrorMessage,
  SuperAdminProfile,
} from '../../services/superadmin/superAdminProfileService';

interface ProfileFormData {
  fullName: string;
  email: string;
  mobile: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^[0-9+\s-]{10,15}$/;

const SuperAdminProfileScreen = ({navigation}: any) => {
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    mobile: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  /* ==========================================================
     LOAD PROFILE (GET /superadmin/profile)
     ========================================================== */

  const loadProfileData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      setApiError('');

      const res = await getSuperAdminProfile();
      setProfile(res);
      setFormData({
        fullName: res.fullName !== '—' ? res.fullName : '',
        email: res.email !== '—' ? res.email : '',
        mobile: res.mobile !== '—' ? res.mobile : '',
      });
    } catch (err: any) {
      console.log('Error loading superadmin profile:', err);
      setApiError(getErrorMessage(err) || 'Unable to load profile. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData(true);
  }, [loadProfileData]);

  /* ==========================================================
     EDIT MODE TOGGLES
     ========================================================== */

  const handleStartEdit = () => {
    if (!profile) return;
    setFormData({
      fullName: profile.fullName !== '—' ? profile.fullName : '',
      email: profile.email !== '—' ? profile.email : '',
      mobile: profile.mobile !== '—' ? profile.mobile : '',
    });
    setErrors({});
    setApiError('');
    setSuccessMsg('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName !== '—' ? profile.fullName : '',
        email: profile.email !== '—' ? profile.email : '',
        mobile: profile.mobile !== '—' ? profile.mobile : '',
      });
    }
    setErrors({});
    setApiError('');
    setIsEditing(false);
  };

  /* ==========================================================
     FIELD-LEVEL VALIDATION
     ========================================================== */

  const handleFieldChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    // Clear field-level error dynamically when user modifies the input
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
    if (apiError) setApiError('');
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!MOBILE_REGEX.test(formData.mobile.trim().replace(/\s+/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number (min 10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ==========================================================
     SAVE CHANGES (PUT /superadmin/profile)
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

      await updateSuperAdminProfile({
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      });

      // Re-fetch the live updated profile from backend
      const updatedProfile = await getSuperAdminProfile();

      setProfile(updatedProfile);
      setFormData({
        fullName: updatedProfile.fullName !== '—' ? updatedProfile.fullName : '',
        email: updatedProfile.email !== '—' ? updatedProfile.email : '',
        mobile: updatedProfile.mobile !== '—' ? updatedProfile.mobile : '',
      });

      setIsEditing(false);
      setSuccessMsg('✓ Profile updated successfully!');

      // Auto-hide success message after 4 seconds
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err: any) {
      console.log('Error updating superadmin profile:', err);
      setApiError(getErrorMessage(err) || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /* ==========================================================
     LOGOUT HANDLER
     ========================================================== */

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of the Super Admin portal?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('SUPERADMIN_ACCESS_TOKEN');
            await AsyncStorage.removeItem('superadmin_token');
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('jwt');
          } catch {}
          navigation.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="My Profile" />

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
          ) : profile ? (
            <>
              {/* ---------- Hero Summary Card ---------- */}
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
                            {profile.fullName?.charAt(0)?.toUpperCase() || 'S'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.avatarBadge}>
                        <Text style={styles.avatarBadgeIcon}>✓</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.heroTextCol}>
                    <Text style={styles.name}>{profile.fullName}</Text>
                    <Text style={styles.email}>{profile.email || profile.username}</Text>
                    <View style={styles.rolePill}>
                      <Text style={styles.rolePillText}>{profile.role?.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.goldDivider} />

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatCol}>
                    <Text style={styles.heroStatLabel}>BRANCH</Text>
                    <Text style={styles.heroStatValue}>{profile.branchName}</Text>
                  </View>
                  <View style={styles.heroStatCol}>
                    <Text style={styles.heroStatLabel}>ACCOUNT STATUS</Text>
                    <Text style={styles.heroStatValue}>{profile.status}</Text>
                  </View>
                </View>
              </View>

              {/* ---------- Personal Information Card ---------- */}
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

                {/* FULL NAME (Editable) */}
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
                      <Text style={styles.infoValue}>{profile.fullName}</Text>
                    )}
                  </View>
                </View>

                {/* MOBILE (Editable) */}
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

                {/* EMAIL (Editable) */}
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
                    <Text style={styles.infoValue}>{profile.role}</Text>
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
                    <Text style={styles.infoValue}>{profile.branchName}</Text>
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
                        {profile.status}
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

              {/* ---------- Logout button ---------- */}
              {!isEditing && (
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                  <Text style={styles.logoutIcon}>🚪</Text>
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              )}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SuperAdminBottomTabBar navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
};

export default SuperAdminProfileScreen;