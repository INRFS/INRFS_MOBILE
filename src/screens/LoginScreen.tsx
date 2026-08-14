import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, ScrollView, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Path, Circle} from 'react-native-svg';
import {styles, ICON_TINT} from '../styles/LoginScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
type Role = 'investor' | 'admin' | 'superadmin';

const roles: {key: Role; label: string; sub: string; icon: string}[] = [
  {key: 'investor', label: 'Investor', sub: 'Access your portfolio', icon: 'account'},
  {key: 'admin', label: 'Admin', sub: 'Manage investors', icon: 'shield-outline'},
  {key: 'superadmin', label: 'Super admin', sub: 'Full system access', icon: 'lock'},
];

// Per-role color theme for the icon badge, card wave accent, and arrow button.
const roleTheme: Record<Role, {iconBg: string; iconColor: string; wave: string}> = {
  investor: {iconBg: '#E5EEFF', iconColor: '#2563EB', wave: '#BFD3FF'},
  admin: {iconBg: '#F1E9FF', iconColor: '#7C3AED', wave: '#D9C7FF'},
  superadmin: {iconBg: '#FFF4DC', iconColor: '#D97706', wave: '#FFE1A8'},
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
      <Circle cx="150" cy="120" r="150" fill="#E3E8FB" opacity={0.85} />
      <Path d="M20 95 Q 140 45 260 105" stroke="#FFFFFF" strokeWidth={2} opacity={0.55} fill="none" />
      <Path d="M10 145 Q 140 95 270 155" stroke="#FFFFFF" strokeWidth={2} opacity={0.4} fill="none" />
      <Path d="M0 195 Q 140 155 280 205" stroke="#FFFFFF" strokeWidth={2} opacity={0.3} fill="none" />
    </Svg>
  </View>
);

// Layered wavy gradient along the bottom of the screen, with a subtle
// rim-light line tracing the crest of the front-most layer.
const BottomWaveDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <Svg width="100%" height="260" viewBox="0 0 400 260" preserveAspectRatio="none">
      <Path d="M0 95 C 110 40, 300 145, 400 75 L400 260 L0 260 Z" fill="#C9CEF6" opacity={0.35} />
      <Path d="M0 135 C 120 80, 280 175, 400 115 L400 260 L0 260 Z" fill="#DCE0FA" opacity={0.6} />
      <Path d="M0 168 C 130 122, 270 202, 400 152 L400 260 L0 260 Z" fill="#EEF0FC" opacity={0.97} />
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

  // Basic local validation for investor login (fallback when context doesn't provide one)
  const validateInvestorLogin = (id: string, mobileNum: string) => {
    const cleanedMobile = mobileNum.replace(/\D/g, '');
    return id.trim().length > 0 && cleanedMobile.length >= 10;
  };
  const [selectedRole, setSelectedRole] = useState<Role>('investor');
  const [investorId, setInvestorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    if (selectedRole === 'investor') {
      if (!investorId.trim() || !mobile.trim()) {
        setErrorMsg('Please enter both Investor ID and mobile number.');
        return;
      }

      if (!validateInvestorLogin(investorId, mobile)) {
        setErrorMsg('Invalid credentials. Please check your Investor ID and mobile number.');
        return;
      }

      setErrorMsg('');
      console.log('Send OTP for', investorId, mobile);
      navigation.navigate('OtpVerification', {investorId, mobile});
    } else {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('Please enter both username and password.');
        return;
      }
      setErrorMsg('');

      if (selectedRole === 'admin') {
        // TODO: replace with real auth call once backend is available
        console.log('Login as admin', username, password);
        // NOTE: name/email are placeholders derived from the entered username
        // until a real backend returns the logged-in admin's actual profile.
        setAdminProfile({
          name: username,
          email: `${username.toLowerCase().replace(/\s+/g, '.')}@inrfs.in`,
          role: 'Admin',
        });
        navigation.navigate('AdminDashboard');
        return;
      }

      if (selectedRole === 'superadmin') {
        // TODO: replace with real auth call once backend is available
        console.log('Login as superadmin', username, password);
        // Same shared profile object the Admin flow uses — the Super Admin
        // screens key their header/profile off of `role: 'Super Admin'`.
        setAdminProfile({
          name: username,
          email: `${username.toLowerCase().replace(/\s+/g, '.')}@inrfs.in`,
          role: 'Super Admin',
        });
        navigation.navigate('SuperAdminDashboard');
        return;
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative background — sits behind everything else */}
      <TopRightDecor />
      <BottomWaveDecor />
      <DotGrid style={{left: 20, bottom: 26}} />
      <DotGrid style={{right: 20, bottom: 26}} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        {/* Logo + tagline */}
        <View style={styles.logoWrap}>
          <Image source={require('../assets/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandSubtitle}>INRFS Platform</Text>
        </View>

        <Text style={styles.title}>
          Welcome <Text style={styles.titleAccent}>back</Text>
        </Text>
        <Text style={styles.subtitle}>Sign in to your INRFS account</Text>

        <Text style={styles.label}>Login as</Text>
        <View style={styles.roleGrid}>
          {roles.map(role => {
            const active = selectedRole === role.key;
            const theme = roleTheme[role.key];
            return (
              <TouchableOpacity
                key={role.key}
                style={[styles.roleCard, active && styles.roleCardActive]}
                onPress={() => {
                  setSelectedRole(role.key);
                  setErrorMsg('');
                }}>
                <View style={[styles.roleCardWave, {backgroundColor: theme.wave}]} pointerEvents="none" />
                <View style={[styles.roleIconBox, {backgroundColor: theme.iconBg}]}>
                  <Icon name={role.icon} size={22} color={theme.iconColor} />
                </View>
                <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                  {role.label}
                </Text>
                <Text style={styles.roleSub} numberOfLines={2}>
                  {role.sub}
                </Text>
                {/* <View style={[styles.roleArrowBtn, {backgroundColor: theme.iconColor}]}>
                  <Icon name="arrow-right" size={15} color="#fff" />
                </View> */}
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRole === 'investor' ? (
          <>
            <Text style={styles.label}>Investor ID</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon name="account-outline" size={18} color={ICON_TINT} />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Enter your investor ID"
                placeholderTextColor="#9CA3AF"
                value={investorId}
                onChangeText={setInvestorId}
              />
            </View>

            <Text style={styles.label}>Registered mobile number</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon name="phone-outline" size={18} color={ICON_TINT} />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
              />
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <View style={styles.submitIconBox}>
                <Icon name="shield-check-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.submitBtnText}>Send OTP</Text>
              <Icon name="arrow-right" size={18} color="#fff" style={styles.submitBtnArrow} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
              <Text style={styles.footerText}>
                New investor? <Text style={styles.footerLink}>Register now</Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon name="account-outline" size={18} color={ICON_TINT} />
              </View>
              <TextInput
                style={styles.inputField}
                placeholder="Enter username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}>
                <Icon name="lock-outline" size={18} color={ICON_TINT} />
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
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <View style={styles.submitIconBox}>
                <Icon name="shield-check-outline" size={16} color="#fff" />
              </View>
              <Text style={styles.submitBtnText}>Login to Dashboard</Text>
              <Icon name="arrow-right" size={18} color="#fff" style={styles.submitBtnArrow} />
            </TouchableOpacity>
          </>
        )}

        {/* Trust badges */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#E5EEFF'}]}>
              <Icon name="shield-check" size={14} color="#2563EB" />
            </View>
            <Text style={styles.trustLabel}>Bank-grade{'\n'}security</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#E6F7EE'}]}>
              <Icon name="certificate-outline" size={14} color="#16A34A" />
            </View>
            <Text style={styles.trustLabel}>SEBI{'\n'}registered</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#FFF4E5'}]}>
              <Icon name="lock-outline" size={14} color="#D97706" />
            </View>
            <Text style={styles.trustLabel}>Secure &{'\n'}Trusted</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom shield badge, ringed and sitting on the wave's crest */}
      {/* <View pointerEvents="none" style={styles.bottomBadgeRingOuter}>
        <View style={styles.bottomBadgeRingInner}>
          <View style={styles.bottomBadge}>
            <Icon name="shield-check-outline" size={26} color="#0E2A5E" />
          </View>
        </View>
      </View> */}
    </SafeAreaView>
  );
};

export default LoginScreen;