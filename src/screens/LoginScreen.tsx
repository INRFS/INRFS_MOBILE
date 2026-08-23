import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Path, Circle} from 'react-native-svg';
import {styles, ICON_TINT} from '../styles/LoginScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';

type Role = 'investor' | 'admin' | 'superadmin';

const API_BASE_URL = 'http://187.52.115.32:8000';

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

const LoginScreen = ({navigation}: any) => {
  const {setAdminProfile} = useAppData();

  const [selectedRole, setSelectedRole] =
    useState<Role>('investor');

  const [investorId, setInvestorId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
      if (!investorId.trim() || !password.trim()) {
        setErrorMsg(
          'Please enter Investor ID and password.',
        );
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/auth/investor/login`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              investor_id: investorId.trim(),
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

        console.log('Investor Login Response:', data);

        if (!response.ok) {
          throw new Error(
            data?.detail ||
              data?.message ||
              'Investor login failed.',
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

       // Store the logged-in investor's token
       await AsyncStorage.setItem(
         'access_token',
         accessToken,
       );

       // Store investor ID as well if needed by other screens
       await AsyncStorage.setItem(
         'investor_id',
         investorId.trim(),
       );

       setLoading(false);

       navigation.navigate('InvestorDashboard');
      } catch (error: any) {
        setLoading(false);

        console.log('Investor Login Error:', error);

        setErrorMsg(
          error?.message ||
            'Investor login failed. Please check your credentials.',
        );
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
      if (!username.trim() || !password.trim()) {
        setErrorMsg(
          'Please enter username and password.',
        );
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
              username: username.trim(),
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
            username.trim(),

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

        setErrorMsg(
          error?.message ||
            'Admin login failed. Please check your credentials.',
        );
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
      if (!username.trim() || !password.trim()) {
        setErrorMsg(
          'Please enter username and password.',
        );
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
              username: username.trim(),
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
            username.trim(),

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

        setErrorMsg(
          error?.message ||
            'Super Admin login failed. Please check your credentials.',
        );
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
                onChangeText={setInvestorId}
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
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
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
                onChangeText={setUsername}
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
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
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
    </SafeAreaView>
  );
};

export default LoginScreen;