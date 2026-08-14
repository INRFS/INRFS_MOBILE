import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../styles/OtpVerificationScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 52;

// Layered wave shapes anchored to the bottom of the screen — plain Views,
// no native SVG dependency required.
const BottomWaveDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <View style={styles.bgWaveDeep} />
    <View style={styles.bgWaveFront} />
  </View>
);

const OtpVerificationScreen = ({navigation, route}: any) => {
  const {mobile = '9876543892', investorId = ''} = route?.params || {};

  const last3 = mobile.slice(-3);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const formatTimer = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      Alert.alert('Enter complete OTP', 'Please fill all 6 digits to continue.');
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'InvestorDashboard', params: {investorId}}],
    });
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <Image source={require('../assets/logo.jpeg')} style={styles.headerLogo} resizeMode="contain" />
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <View style={styles.iconRingOuter}>
          <View style={[styles.ringDot, {top: 6, left: 14}]} />
          <View style={[styles.ringDot, {top: 18, right: 4}]} />
          <View style={[styles.ringDot, {bottom: 10, left: 8}]} />
          <View style={styles.iconCircle}>
            <Icon name="shield-lock-outline" size={30} color="#0E2A5E" />
          </View>
        </View>

        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your mobile</Text>
        <View style={styles.mobileRow}>
          <Text style={styles.mobilePrefix}>+91 </Text>
          <Text style={styles.mobileMasked}>••••• ••</Text>
          <Text style={styles.mobileLast3}>{last3}</Text>
        </View>

        <View style={styles.otpCard}>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => {
              const isActive = activeIndex === i;
              return (
                <TextInput
                  key={i}
                  ref={r => {
                    inputRefs.current[i] = r;
                  }}
                  style={[
                    styles.otpBox,
                    isActive && styles.otpBoxActive,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onFocus={() => setActiveIndex(i)}
                  onChangeText={t => handleChange(t, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                />
              );
            })}
          </View>

          <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} activeOpacity={0.85}>
            <View style={styles.verifyBtnShadeLight} pointerEvents="none" />
            <View style={styles.verifyBtnShadeDark} pointerEvents="none" />
            <View style={styles.verifyBtnShine} pointerEvents="none" />
            <View style={styles.verifyBtnContent}>
              <Text style={styles.verifyBtnText}>Verify & Proceed</Text>
              <Icon name="arrow-right" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleResend} disabled={timer > 0} style={styles.resendRow}>
          <Text style={styles.resendText}>
            Didn't receive code?{' '}
            <Text style={styles.resendTimer}>
              {timer > 0 ? formatTimer(timer) : 'Resend OTP'}
            </Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.secureRow}>
          <Icon name="shield-check-outline" size={14} color="#16A34A" />
          <Text style={styles.secureText}>SECURE 256-BIT ENCRYPTED VERIFICATION</Text>
        </View>
      </View>

      <BottomWaveDecor />
    </SafeAreaView>
  );
};

export default OtpVerificationScreen;