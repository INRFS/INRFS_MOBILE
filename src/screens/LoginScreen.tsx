import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Path, Circle} from 'react-native-svg';
import {styles, ICON_TINT} from '../styles/LoginScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ENV} from '../config/env';
import {authService} from '../services/authService';
import {formatErrorMessage} from '../api/client';
import {validation} from '../utils/validation';

type Role = 'investor' | 'admin' | 'superadmin';

const API_BASE_URL = ENV.API_BASE_URL;

const roles: {
  key: Role;
  label: string;
  sub: string;
  icon: string;
}[] = [
  {
    key: 'investor',
    label: 'Investor',
    sub: 'Access your portfolio',
    icon: 'account',
  },
  {
    key: 'admin',
    label: 'Admin',
    sub: 'Manage investors',
    icon: 'shield-outline',
  },
  {
    key: 'superadmin',
    label: 'Super admin',
    sub: 'Full system access',
    icon: 'lock',
  },
];

// Per-role color theme for the icon badge, card wave accent, and arrow button.
const roleTheme: Record<
  Role,
  {iconBg: string; iconColor: string; wave: string}
> = {
  investor: {
    iconBg: '#E5EEFF',
    iconColor: '#2563EB',
    wave: '#BFD3FF',
  },
  admin: {
    iconBg: '#F1E9FF',
    iconColor: '#7C3AED',
    wave: '#D9C7FF',
  },
  superadmin: {
    iconBg: '#FFF4DC',
    iconColor: '#D97706',
    wave: '#FFE1A8',
  },
};

// Small dot-texture cluster used to decorate the bottom wave corners.
const DotGrid = ({style}: {style?: any}) => (
  <View style={[styles.dotGrid, style]} pointerEvents="none">
    {Array.from({length: 20}).map((_, i) => (
      <View key={i} style={styles.dot} />
    ))}
  </View>
);

// Soft blurred blob with faint flowing line texture, top-right corner.
const TopRightDecor = () => (
  <View pointerEvents="none" style={styles.topDecorWrap}>
    <Svg width="280" height="280" viewBox="0 0 280 280">
      <Circle
        cx="150"
        cy="120"
        r="150"
        fill="#E3E8FB"
        opacity={0.85}
      />

      <Path
        d="M20 95 Q 140 45 260 105"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.55}
        fill="none"
      />

      <Path
        d="M10 145 Q 140 95 270 155"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.4}
        fill="none"
      />

      <Path
        d="M0 195 Q 140 155 280 205"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.3}
        fill="none"
      />
    </Svg>
  </View>
);

// Layered wavy gradient along the bottom of the screen.
const BottomWaveDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <Svg
      width="100%"
      height="260"
      viewBox="0 0 400 260"
      preserveAspectRatio="none"
    >
      <Path
        d="M0 95 C 110 40, 300 145, 400 75 L400 260 L0 260 Z"
        fill="#C9CEF6"
        opacity={0.35}
      />

      <Path
        d="M0 135 C 120 80, 280 175, 400 115 L400 260 L0 260 Z"
        fill="#DCE0FA"
        opacity={0.6}
      />

      <Path
        d="M0 168 C 130 122, 270 202, 400 152 L400 260 L0 260 Z"
        fill="#EEF0FC"
        opacity={0.97}
      />

      <Path
        d="M0 168 C 130 122, 270 202, 400 152"
        stroke="#FFFFFF"
        strokeWidth={2}
        opacity={0.7}
        fill="none"
      />
    </Svg>
  </View>
);

// -----------------------------------------------------------------------
// Backend error message formatters
// Transforms backend responses to user-friendly messages without exposing
// technical error details.
// -----------------------------------------------------------------------
const formatInvestorBackendError = (rawError: any): string => {
  const detail = (
    rawError?.data?.detail ||
    rawError?.originalError?.response?.data?.detail ||
    rawError?.response?.data?.detail ||
    rawError?.message ||
    ''
  ).toLowerCase();

  // Network / timeout
  if (
    detail.includes('network') ||
    detail.includes('unable to reach') ||
    detail.includes('timeout') ||
    detail.includes('connection')
  ) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  // If combined/ambiguous (e.g. "invalid investor ID or password"), return standard ambiguous message
  if (detail.includes(' or ') || detail.includes('credential')) {
    return 'Invalid Investor ID or password.';
  }

  // Clearly incorrect/invalid password
  if (
    detail.includes('password') &&
    (detail.includes('incorrect') || detail.includes('wrong') || detail.includes('invalid'))
  ) {
    return 'Invalid password.';
  }

  // Clearly investor ID not found / does not exist
  if (
    detail.includes('not found') ||
    detail.includes('does not exist') ||
    detail.includes('no user') ||
    detail.includes('invalid investor')
  ) {
    return 'Invalid Investor ID.';
  }

  // Default fallback when ambiguous or generic
  return 'Invalid Investor ID or password.';
};

const formatAdminBackendError = (rawError: any): string => {
  const detail = (
    rawError?.detail ||
    rawError?.data?.detail ||
    rawError?.message ||
    ''
  ).toLowerCase();

  // Network / timeout
  if (
    detail.includes('network') ||
    detail.includes('unable to reach') ||
    detail.includes('timeout') ||
    detail.includes('connection')
  ) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  // If combined/ambiguous, return standard ambiguous message
  if (detail.includes(' or ') || detail.includes('credential')) {
    return 'Invalid username or password.';
  }

  // Clearly incorrect/invalid password
  if (
    detail.includes('password') &&
    (detail.includes('incorrect') || detail.includes('wrong') || detail.includes('invalid'))
  ) {
    return 'Invalid password.';
  }

  // Clearly username not found / does not exist
  if (
    detail.includes('not found') ||
    detail.includes('does not exist') ||
    detail.includes('no user') ||
    detail.includes('invalid admin') ||
    detail.includes('invalid username')
  ) {
    return 'Invalid username.';
  }

  // Default fallback when ambiguous or generic
  return 'Invalid username or password.';
};

const formatSuperAdminBackendError = (rawError: any): string => {
  const detail = (
    rawError?.detail ||
    rawError?.data?.detail ||
    rawError?.message ||
    ''
  ).toLowerCase();

  // Network / timeout
  if (
    detail.includes('network') ||
    detail.includes('unable to reach') ||
    detail.includes('timeout') ||
    detail.includes('connection')
  ) {
    return 'Unable to reach the server. Please check your internet connection.';
  }

  // If combined/ambiguous, return standard ambiguous message
  if (detail.includes(' or ') || detail.includes('credential')) {
    return 'Invalid username or password.';
  }

  // Clearly incorrect/invalid password
  if (
    detail.includes('password') &&
    (detail.includes('incorrect') || detail.includes('wrong') || detail.includes('invalid'))
  ) {
    return 'Invalid password.';
  }

  // Clearly username not found / does not exist
  if (
    detail.includes('not found') ||
    detail.includes('does not exist') ||
    detail.includes('no user') ||
    detail.includes('invalid superadmin') ||
    detail.includes('invalid admin') ||
    detail.includes('invalid username')
  ) {
    return 'Invalid username.';
  }

  // Default fallback when ambiguous or generic
  return 'Invalid username or password.';
};

const LoginScreen = ({navigation}: any) => {
  const {setAdminProfile} = useAppData();

  const [selectedRole, setSelectedRole] =
    useState<Role>('investor');

  const [investorId, setInvestorId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // ---- Forgot Password State ----
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const openForgotPassword = () => {
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccess('');
    setForgotStep('email');
    setForgotModalVisible(true);
  };

  const closeForgotPassword = () => {
    setForgotModalVisible(false);
    setForgotError('');
    setForgotSuccess('');
    setForgotStep('email');
  };

  const handleSendOtp = async () => {
    setForgotError('');
    setForgotSuccess('');
    const trimmedEmail = forgotEmail.trim().toLowerCase();
    if (!trimmedEmail) {
      setForgotError('Please enter your email address.');
      return;
    }
    const emailCheck = validation.isValidEmail(trimmedEmail);
    if (!emailCheck.isValid) {
      setForgotError(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authService.sendForgotPasswordOtp(trimmedEmail);
      setForgotSuccess(res?.message || 'OTP has been sent to your email.');
      setForgotStep('otp');
    } catch (err: any) {
      setForgotError(err?.message || 'Unable to send OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotError('');
    const trimmedOtp = forgotOtp.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6 || /\D/.test(trimmedOtp)) {
      setForgotError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authService.verifyForgotPasswordOtp(forgotEmail, trimmedOtp);
      setForgotSuccess(res?.message || 'OTP verified successfully.');
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err?.message || 'Invalid OTP. Please check and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    const cleanNewPassword = forgotNewPassword;
    const cleanConfirmPassword = forgotConfirmPassword;

    if (!cleanNewPassword) {
      setForgotError('Please enter a new password.');
      return;
    }

    if (cleanNewPassword.length < 8) {
      setForgotError('Password must contain at least 8 characters.');
      return;
    }

    if (!cleanConfirmPassword) {
      setForgotError('Please confirm your new password.');
      return;
    }

    if (cleanNewPassword !== cleanConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await authService.resetForgotPassword(
        forgotEmail,
        forgotOtp,
        cleanNewPassword,
      );
      const successMsg = res?.message || 'Password reset successfully.';
      closeForgotPassword();
      setErrorMsg('');
      Alert.alert('Success', successMsg);
    } catch (err: any) {
      setForgotError(err?.message || 'Password reset failed. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');

    // =========================================================
    // INVESTOR LOGIN
    // Backend:
    // POST /auth/investor/login
    //
    // {
    //   "investor_id": "string",
    //   "password": "string"
    // }
    // =========================================================
    if (selectedRole === 'investor') {
      const trimmedInvestorId = investorId.trim();
      if (!trimmedInvestorId) {
        setErrorMsg('Please enter your Investor ID.');
        return;
      }
      if (!trimmedInvestorId.startsWith('INV')) {
        setErrorMsg('Invalid Investor ID. Investor ID must start with INV.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your password.');
        return;
      }

      try {
        setLoading(true);

        const data = await authService.loginInvestor(
          trimmedInvestorId,
          password,
        );

        setLoading(false);
        navigation.navigate('InvestorDashboard');
      } catch (error: any) {
        setLoading(false);
        setErrorMsg(formatInvestorBackendError(error));
      }

      return;
    }

    // =========================================================
    // ADMIN LOGIN
    // Backend:
    // POST /auth/admin/login
    //
    // {
    //   "username": "string",
    //   "password": "string"
    // }
    // =========================================================
    if (selectedRole === 'admin') {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        setErrorMsg('Please enter your username.');
        return;
      }
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(trimmedUsername)) {
        setErrorMsg('Invalid Admin username. Username must contain letters only.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your password.');
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/auth/admin/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: trimmedUsername,
              password: password,
            }),
          },
        );

        const responseText = await response.text();

        let data: any;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          data = {
            detail: responseText,
          };
        }

        console.log('Admin Login Response:', data);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              'Admin login failed.',
          );
        }
        const accessToken =
          data?.access_token ||
          data?.token ||
          data?.accessToken;

        if (!accessToken) {
          throw new Error(
            'Login successful, but no access token was returned by the server.',
          );
        }

        await AsyncStorage.setItem(
          'access_token',
          accessToken,
        );

        setLoading(false);

        setAdminProfile({
          name:
            data?.full_name ||
            data?.name ||
            trimmedUsername,

          email:
            data?.email ||
            '',

          role: 'Admin',
        });

        navigation.navigate('AdminDashboard', {
          loginResponse: data,
        });
      } catch (error: any) {
        setLoading(false);

        console.log('Admin Login Error:', error);

        setErrorMsg(formatAdminBackendError(error));
      }

      return;
    }

    // =========================================================
    // SUPER ADMIN LOGIN
    // Backend:
    // POST /auth/superadmin/login
    //
    // {
    //   "username": "string",
    //   "password": "string"
    // }
    // =========================================================
    if (selectedRole === 'superadmin') {
      const trimmedUsername = username.trim();
      if (!trimmedUsername) {
        setErrorMsg('Please enter your username.');
        return;
      }
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(trimmedUsername)) {
        setErrorMsg('Invalid Super Admin username. Username must contain letters only.');
        return;
      }
      if (!password.trim()) {
        setErrorMsg('Please enter your password.');
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/auth/superadmin/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: trimmedUsername,
              password: password,
            }),
          },
        );

        const responseText = await response.text();

        let data: any;

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          data = {
            detail: responseText,
          };
        }

        console.log(
          'Super Admin Login Response:',
          data,
        );

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              'Super Admin login failed.',
          );
        }
        const accessToken =
          data?.access_token ||
          data?.token ||
          data?.accessToken;

        if (!accessToken) {
          throw new Error(
            'Login successful, but no access token was returned by the server.',
          );
        }

        await AsyncStorage.setItem(
          'access_token',
          accessToken,
        );
        setLoading(false);

        setAdminProfile({
          name:
            data?.full_name ||
            data?.name ||
            trimmedUsername,

          email:
            data?.email ||
            '',

          role: 'Super Admin',
        });

        navigation.navigate('SuperAdminDashboard', {
          loginResponse: data,
        });
      } catch (error: any) {
        setLoading(false);

        console.log(
          'Super Admin Login Error:',
          error,
        );

        setErrorMsg(formatSuperAdminBackendError(error));
      }

      return;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative background */}
      <TopRightDecor />
      <BottomWaveDecor />

      <DotGrid style={{left: 20, bottom: 26}} />
      <DotGrid style={{right: 20, bottom: 26}} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Logo + tagline */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.brandSubtitle}>
            INRFS Platform
          </Text>
        </View>

        <Text style={styles.title}>
          Welcome{' '}
          <Text style={styles.titleAccent}>back</Text>
        </Text>

        <Text style={styles.subtitle}>
          Sign in to your INRFS account
        </Text>

        <Text style={styles.label}>Login as</Text>

        <View style={styles.roleGrid}>
          {roles.map(role => {
            const active = selectedRole === role.key;
            const theme = roleTheme[role.key];

            return (
              <TouchableOpacity
                key={role.key}
                style={[
                  styles.roleCard,
                  active && styles.roleCardActive,
                ]}
                onPress={() => {
                  setSelectedRole(role.key);
                  setErrorMsg('');

                  // Clear role-specific fields
                  setInvestorId('');
                  setUsername('');
                  setPassword('');
                }}>
                <View
                  style={[
                    styles.roleCardWave,
                    {
                      backgroundColor: theme.wave,
                    },
                  ]}
                  pointerEvents="none"
                />

                <View
                  style={[
                    styles.roleIconBox,
                    {
                      backgroundColor: theme.iconBg,
                    },
                  ]}>
                  <Icon
                    name={role.icon}
                    size={22}
                    color={theme.iconColor}
                  />
                </View>

                <Text
                  style={[
                    styles.roleLabel,
                    active && styles.roleLabelActive,
                  ]}>
                  {role.label}
                </Text>

                <Text
                  style={styles.roleSub}
                  numberOfLines={2}>
                  {role.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* =====================================================
            INVESTOR LOGIN
            Backend fields:
            investor_id
            password
        ====================================================== */}
        {selectedRole === 'investor' ? (
          <>
            <Text style={styles.label}>
              Investor ID
            </Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon
                  name="account-outline"
                  size={18}
                  color={ICON_TINT}
                />
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Enter your investor ID"
                placeholderTextColor="#9CA3AF"
                value={investorId}
                onChangeText={text => {
                  setErrorMsg('');
                  setInvestorId(text);
                }}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon
                  name="lock-outline"
                  size={18}
                  color={ICON_TINT}
                />
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={text => {
                  setErrorMsg('');
                  setPassword(text);
                }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordBtn}
              onPress={openForgotPassword}
              activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}>
              <View style={styles.submitIconBox}>
                <Icon
                  name="shield-check-outline"
                  size={16}
                  color="#fff"
                />
              </View>

              <Text style={styles.submitBtnText}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>

              {!loading && (
                <Icon
                  name="arrow-right"
                  size={18}
                  color="#fff"
                  style={styles.submitBtnArrow}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Registration')
              }>
              <Text style={styles.footerText}>
                New investor?{' '}
                <Text style={styles.footerLink}>
                  Register now
                </Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* =================================================
                ADMIN / SUPER ADMIN LOGIN
                Backend fields:
                username
                password
            ================================================== */}

            <Text style={styles.label}>
              Username
            </Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon
                  name="account-outline"
                  size={18}
                  color={ICON_TINT}
                />
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  if (text && !/^[A-Za-z ]*$/.test(text)) {
                    setErrorMsg(
                      selectedRole === 'admin'
                        ? 'Invalid Admin username. Username must contain letters only.'
                        : 'Invalid Super Admin username. Username must contain letters only.',
                    );
                  } else {
                    setErrorMsg('');
                  }
                }}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>
              Password
            </Text>

            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon
                  name="lock-outline"
                  size={18}
                  color={ICON_TINT}
                />
              </View>

              <TextInput
                style={styles.inputField}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={text => {
                  setErrorMsg('');
                  setPassword(text);
                }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}>
              <View style={styles.submitIconBox}>
                <Icon
                  name="shield-check-outline"
                  size={16}
                  color="#fff"
                />
              </View>

              <Text style={styles.submitBtnText}>
                {loading
                  ? 'Logging in...'
                  : 'Login to Dashboard'}
              </Text>

              {!loading && (
                <Icon
                  name="arrow-right"
                  size={18}
                  color="#fff"
                  style={styles.submitBtnArrow}
                />
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Trust badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <View
              style={[
                styles.trustIconBox,
                {backgroundColor: '#E5EEFF'},
              ]}>
              <Icon
                name="shield-check"
                size={14}
                color="#2563EB"
              />
            </View>

            <Text style={styles.trustLabel}>
              Bank-grade{'\n'}security
            </Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustItem}>
            <View
              style={[
                styles.trustIconBox,
                {backgroundColor: '#E6F7EE'},
              ]}>
              <Icon
                name="certificate-outline"
                size={14}
                color="#16A34A"
              />
            </View>

            <Text style={styles.trustLabel}>
              SEBI{'\n'}registered
            </Text>
          </View>

          <View style={styles.trustDivider} />

          <View style={styles.trustItem}>
            <View
              style={[
                styles.trustIconBox,
                {backgroundColor: '#FFF4E5'},
              ]}>
              <Icon
                name="lock-outline"
                size={14}
                color="#D97706"
              />
            </View>

            <Text style={styles.trustLabel}>
              Secure &{'\n'}Trusted
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* =====================================================
          INVESTOR FORGOT PASSWORD MODAL
      ====================================================== */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeForgotPassword}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: '#E5EEFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Icon name="lock-reset" size={20} color="#2563EB" />
                </View>
                <Text style={styles.modalTitle}>Forgot Password</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={closeForgotPassword}
                activeOpacity={0.7}>
                <Icon name="close" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.stepIndicatorRow}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Text style={[styles.stepCircleText, styles.stepCircleTextActive]}>1</Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  (forgotStep === 'otp' || forgotStep === 'reset') && styles.stepLineActive,
                ]}
              />
              <View
                style={[
                  styles.stepCircle,
                  (forgotStep === 'otp' || forgotStep === 'reset') && styles.stepCircleActive,
                ]}>
                <Text
                  style={[
                    styles.stepCircleText,
                    (forgotStep === 'otp' || forgotStep === 'reset') && styles.stepCircleTextActive,
                  ]}>
                  2
                </Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  forgotStep === 'reset' && styles.stepLineActive,
                ]}
              />
              <View
                style={[
                  styles.stepCircle,
                  forgotStep === 'reset' && styles.stepCircleActive,
                ]}>
                <Text
                  style={[
                    styles.stepCircleText,
                    forgotStep === 'reset' && styles.stepCircleTextActive,
                  ]}>
                  3
                </Text>
              </View>
            </View>

            {/* Error Message Display */}
            {forgotError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{forgotError}</Text>
              </View>
            ) : null}

            {/* Success Message Display */}
            {forgotSuccess && !forgotError ? (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{forgotSuccess}</Text>
              </View>
            ) : null}

            {/* STEP 1: ENTER EMAIL */}
            {forgotStep === 'email' && (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter your registered email address to receive a 6-digit OTP.
                </Text>

                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <Icon name="email-outline" size={18} color={ICON_TINT} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={forgotEmail}
                    onChangeText={text => {
                      setForgotError('');
                      setForgotEmail(text);
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSendOtp}
                  disabled={forgotLoading}>
                  <View style={styles.submitIconBox}>
                    <Icon name="email-fast-outline" size={16} color="#fff" />
                  </View>
                  <Text style={styles.submitBtnText}>
                    {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                  {!forgotLoading && (
                    <Icon
                      name="arrow-right"
                      size={18}
                      color="#fff"
                      style={styles.submitBtnArrow}
                    />
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: ENTER OTP */}
            {forgotStep === 'otp' && (
              <>
                <Text style={styles.modalSubtitle}>
                  Please enter the 6-digit OTP sent to <Text style={{fontWeight: '700', color: '#111'}}>{forgotEmail}</Text>.
                </Text>

                <Text style={styles.label}>Enter 6-Digit OTP</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <Icon name="shield-key-outline" size={18} color={ICON_TINT} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="e.g. 123456"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={forgotOtp}
                    onChangeText={text => {
                      setForgotError('');
                      setForgotOtp(text.replace(/[^0-9]/g, ''));
                    }}
                  />
                </View>

                <View style={styles.resendRow}>
                  <TouchableOpacity
                    onPress={() => {
                      setForgotStep('email');
                      setForgotError('');
                      setForgotSuccess('');
                    }}>
                    <Text style={styles.resendLink}>Change Email</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={forgotLoading}>
                    <Text style={styles.resendLink}>
                      {forgotLoading ? 'Sending...' : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleVerifyOtp}
                  disabled={forgotLoading}>
                  <View style={styles.submitIconBox}>
                    <Icon name="check-circle-outline" size={16} color="#fff" />
                  </View>
                  <Text style={styles.submitBtnText}>
                    {forgotLoading ? 'Verifying OTP...' : 'Verify OTP'}
                  </Text>
                  {!forgotLoading && (
                    <Icon
                      name="arrow-right"
                      size={18}
                      color="#fff"
                      style={styles.submitBtnArrow}
                    />
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {forgotStep === 'reset' && (
              <>
                <Text style={styles.modalSubtitle}>
                  Create a new password of at least 8 characters for your account.
                </Text>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <Icon name="lock-outline" size={18} color={ICON_TINT} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Enter new password (min. 8 characters)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={forgotNewPassword}
                    onChangeText={text => {
                      setForgotError('');
                      setForgotNewPassword(text);
                    }}
                  />
                </View>

                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconBox}>
                    <Icon name="lock-check-outline" size={18} color={ICON_TINT} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Re-enter your new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry
                    value={forgotConfirmPassword}
                    onChangeText={text => {
                      setForgotError('');
                      setForgotConfirmPassword(text);
                    }}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleResetPassword}
                  disabled={forgotLoading}>
                  <View style={styles.submitIconBox}>
                    <Icon name="lock-reset" size={16} color="#fff" />
                  </View>
                  <Text style={styles.submitBtnText}>
                    {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Text>
                  {!forgotLoading && (
                    <Icon
                      name="arrow-right"
                      size={18}
                      color="#fff"
                      style={styles.submitBtnArrow}
                    />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default LoginScreen;