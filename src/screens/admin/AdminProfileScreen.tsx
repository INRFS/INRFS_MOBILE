import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminProfileScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
import AdminBottomTabBar from '../../components/AdminBottomTabBar';
import AppHeader from '../../components/AppHeader';

/**
 * Backend API
 */
const API_BASE_URL = 'http://187.52.115.32:8000';

/**
 * Admin Profile API response type
 *
 * The Swagger screenshot shows the response wrapped approximately like:
 *
 * {
 *   "success": true,
 *   "data": {...}
 * }
 *
 * We normalize the data below so the screen can handle the response safely.
 */
interface AdminProfile {
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

const AdminProfileScreen = ({navigation}: any) => {
  const {adminProfile: contextAdminProfile} = useAppData();

  /**
   * Local profile state.
   *
   * We use the existing AppNavigator profile as the initial value,
   * then replace it with the actual backend GET response.
   */
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: contextAdminProfile?.name || 'Admin',
    email: contextAdminProfile?.email || '',
    mobile: contextAdminProfile?.mobile || '',
    role: contextAdminProfile?.role || 'Admin',
    branch: contextAdminProfile?.branch || 'Main Branch',
    status: contextAdminProfile?.status || 'Active',
    avatarUri: contextAdminProfile?.avatarUri || DEFAULT_AVATAR,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);

  /**
   * Form state used by PUT /admin/profile
   */
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');

  /**
   * ============================================================
   * GET AUTH TOKEN
   * ============================================================
   *
   * Your Swagger APIs are protected.
   *
   * This tries a few common AsyncStorage keys.
   *
   * If your Login API stores the token under a different key,
   * change the keys below to match your project.
   */
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('access_token');
  } catch (error) {
    console.log('Error getting access token:', error);
    return null;
  }
};

  /**
   * ============================================================
   * NORMALIZE PROFILE RESPONSE
   * ============================================================
   *
   * Since the Swagger screenshot does not show the exact backend
   * response properties, this supports both:
   *
   * response.data
   * response.data.data
   *
   * and common property names.
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
        contextAdminProfile?.role ||
        'Admin',

      branch:
        data?.branch ||
        data?.branch_name ||
        contextAdminProfile?.branch ||
        'Main Branch',

      status:
        data?.status ||
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

  /**
   * ============================================================
   * GET /admin/profile
   * ============================================================
   */
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);

      const token = await getAccessToken();

      if (!token) {
        console.log('No access token found in AsyncStorage.');

        Alert.alert(
          'Authentication Error',
          'Your login session could not be found. Please log in again.',
        );

        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      let responseData: any = {};

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.log('Invalid JSON response:', responseText);
      }

      console.log('GET /admin/profile status:', response.status);
      console.log('GET /admin/profile response:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert(
            'Session Expired',
            'Your admin session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                },
              },
            ],
          );

          return;
        }

        throw new Error(
          responseData?.detail ||
            responseData?.message ||
            'Unable to fetch admin profile.',
        );
      }

      const normalizedProfile = normalizeProfile(responseData);

      setAdminProfile(normalizedProfile);
    } catch (error: any) {
      console.log('GET admin profile error:', error);

      Alert.alert(
        'Unable to Load Profile',
        error?.message ||
          'Something went wrong while loading your admin profile.',
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================================================
   * PUT /admin/profile
   * ============================================================
   */
  const updateAdminProfile = async () => {
    /**
     * Basic validation
     */
    if (!editName.trim()) {
      Alert.alert('Validation', 'Please enter your full name.');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Validation', 'Please enter your email.');
      return;
    }

    if (!editMobile.trim()) {
      Alert.alert('Validation', 'Please enter your mobile number.');
      return;
    }

    /**
     * Simple email validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(editEmail.trim())) {
      Alert.alert('Validation', 'Please enter a valid email address.');
      return;
    }

    try {
      setSaving(true);

      const token = await getAccessToken();

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Your login session could not be found. Please log in again.',
        );
        return;
      }

      /**
       * This exactly matches the Swagger PUT request body:
       *
       * {
       *   "name": "string",
       *   "email": "string",
       *   "mobile": "string"
       * }
       */
      const requestBody = {
        name: editName.trim(),
        email: editEmail.trim(),
        mobile: editMobile.trim(),
      };

      console.log('PUT /admin/profile request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      let responseData: any = {};

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (error) {
        console.log('Invalid PUT response JSON:', responseText);
      }

      console.log('PUT /admin/profile status:', response.status);
      console.log('PUT /admin/profile response:', responseData);

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert(
            'Session Expired',
            'Your admin session has expired. Please log in again.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{name: 'Login'}],
                  });
                },
              },
            ],
          );

          return;
        }

        throw new Error(
          responseData?.detail ||
            responseData?.message ||
            'Unable to update admin profile.',
        );
      }

      /**
       * Some APIs return the updated object in:
       *
       * responseData.data
       *
       * Some return the updated object directly.
       *
       * We support both.
       */
      const returnedProfile = normalizeProfile(responseData);

      /**
       * Update UI immediately.
       *
       * If backend returned only {success: true, data: {}},
       * preserve the values we just submitted.
       */
      setAdminProfile(prev => ({
        ...prev,
        name: returnedProfile.name || editName.trim(),
        email: returnedProfile.email || editEmail.trim(),
        mobile: returnedProfile.mobile || editMobile.trim(),
      }));

      setEditModalVisible(false);

      Alert.alert('Success', 'Your profile has been updated successfully.');

      /**
       * Optional:
       * Fetch once again from backend so the screen always contains
       * the actual server-side values.
       */
      await fetchAdminProfile();
    } catch (error: any) {
      console.log('PUT admin profile error:', error);

      Alert.alert(
        'Update Failed',
        error?.message ||
          'Something went wrong while updating your admin profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * ============================================================
   * OPEN EDIT PROFILE
   * ============================================================
   */
  const openEditProfile = () => {
    setEditName(adminProfile.name || '');
    setEditEmail(adminProfile.email || '');
    setEditMobile(adminProfile.mobile || '');

    setEditModalVisible(true);
  };

  /**
   * ============================================================
   * FETCH PROFILE ON SCREEN LOAD
   * ============================================================
   */
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  /**
   * ============================================================
   * LOGOUT
   * ============================================================
   */
  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          /**
           * Remove token from storage.
           *
           * If your login stores additional authentication data,
           * you can clear those here as well.
           */
        try {
  await AsyncStorage.removeItem('access_token');
} catch (error) {
  console.log('Logout storage error:', error);
}

          navigation.reset({
            index: 0,
            routes: [{name: 'Login'}],
          });
        },
      },
    ]);
  };

  /**
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppHeader subtitle="Admin Portal" />

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text
            style={{
              marginTop: 12,
              fontSize: 15,
              color: '#6B7280',
            }}>
            Loading profile...
          </Text>
        </View>

        <AdminBottomTabBar
          active="Profile"
          navigation={navigation}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="Admin Portal" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {/* =====================================================
            PROFILE AVATAR
        ====================================================== */}
        <View style={styles.avatarWrap}>
          <Image
            source={{
              uri: adminProfile.avatarUri || DEFAULT_AVATAR,
            }}
            style={styles.avatar}
          />

          <TouchableOpacity
            style={styles.cameraBadge}
            onPress={() => {
              Alert.alert(
                'Profile Photo',
                'Profile photo upload is not included because the backend profile APIs shown in Swagger only support name, email and mobile.',
              );
            }}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>

        {/* =====================================================
            BASIC PROFILE
        ====================================================== */}
        <Text style={styles.name}>{adminProfile.name}</Text>

        <Text style={styles.email}>{adminProfile.email}</Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            🛡 {adminProfile.role}
          </Text>
        </View>

        {/* =====================================================
            ACTIONS
        ====================================================== */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={openEditProfile}>
            <View style={styles.actionIconWrap}>
              <Text>✎</Text>
            </View>

            <Text style={styles.actionLabel}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminSettings')}>
            <View
              style={[
                styles.actionIconWrap,
                {backgroundColor: '#DBEAFE'},
              ]}>
              <Text>⚙️</Text>
            </View>

            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* =====================================================
            PERSONAL INFORMATION
        ====================================================== */}
        <Text style={styles.sectionTitle}>
          Personal Information
        </Text>

        <View style={styles.infoCard}>
          {/* NAME */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🧑</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>FULL NAME</Text>

              <Text style={styles.infoValue}>
                {adminProfile.name || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* MOBILE */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>MOBILE</Text>

              <Text style={styles.infoValue}>
                {adminProfile.mobile || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* EMAIL */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉️</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>EMAIL</Text>

              <Text style={styles.infoValue}>
                {adminProfile.email || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* ROLE */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💼</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>ROLE</Text>

              <Text style={styles.infoValue}>
                {adminProfile.role || 'Admin'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* BRANCH */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏢</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>BRANCH</Text>

              <Text style={styles.infoValue}>
                {adminProfile.branch || '-'}
              </Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          {/* STATUS */}
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✓</Text>

            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>STATUS</Text>

              <Text style={styles.infoValue}>
                {adminProfile.status || '-'}
              </Text>
            </View>

            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    adminProfile.status?.toLowerCase() ===
                    'active'
                      ? '#16A34A'
                      : '#9CA3AF',
                },
              ]}
            />
          </View>
        </View>

        {/* =====================================================
            LOGOUT
        ====================================================== */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>
            ⎋ Logout Session
          </Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          Version 2.4.0 (Enterprise Build)
        </Text>
      </ScrollView>

      {/* =======================================================
          EDIT PROFILE MODAL
      ======================================================== */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setEditModalVisible(false);
          }
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
          }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 30,
            }}>
            {/* MODAL HEADER */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#111827',
                }}>
                Edit Profile
              </Text>

              <TouchableOpacity
                disabled={saving}
                onPress={() => setEditModalVisible(false)}>
                <Text
                  style={{
                    fontSize: 26,
                    color: '#6B7280',
                  }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* NAME */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 7,
              }}>
              FULL NAME
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              editable={!saving}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 10,
                paddingHorizontal: 14,
                fontSize: 15,
                color: '#111827',
                marginBottom: 16,
              }}
            />

            {/* EMAIL */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 7,
              }}>
              EMAIL
            </Text>

            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 10,
                paddingHorizontal: 14,
                fontSize: 15,
                color: '#111827',
                marginBottom: 16,
              }}
            />

            {/* MOBILE */}
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 7,
              }}>
              MOBILE
            </Text>

            <TextInput
              value={editMobile}
              onChangeText={setEditMobile}
              placeholder="Enter your mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              editable={!saving}
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 10,
                paddingHorizontal: 14,
                fontSize: 15,
                color: '#111827',
                marginBottom: 22,
              }}
            />

            {/* BUTTONS */}
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
              }}>
              <TouchableOpacity
                disabled={saving}
                onPress={() => setEditModalVisible(false)}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={saving}
                onPress={updateAdminProfile}
                style={{
                  flex: 1,
                  height: 50,
                  borderRadius: 10,
                  backgroundColor: '#2563EB',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '700',
                      color: '#FFFFFF',
                    }}>
                    Save Changes
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          BOTTOM TAB
      ======================================================== */}
      <AdminBottomTabBar
        active="Profile"
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

export default AdminProfileScreen;