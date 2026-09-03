import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppData } from '../navigation/AppNavigator';
import { styles } from '../styles/RegistrartionScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { investorService } from '../services/investorService';
import { authService } from '../services/authService';
import { formatErrorMessage } from '../api/client';
import { validation } from '../utils/validation';

const steps = ['Personal info', 'Review & submit'];

// Fallback initial master data
const STATE_OPTIONS: { id: number; name: string }[] = [
  { id: 1, name: 'Andhra Pradesh' },
  { id: 2, name: 'Telangana' },
  { id: 3, name: 'Tamil Nadu' },
  { id: 4, name: 'Karnataka' },
  { id: 5, name: 'Kerala' },
];

const BRANCH_OPTIONS: { id: number; name: string; stateId: number }[] = [
  { id: 1, name: 'Vijayawada Branch', stateId: 1 },
  { id: 2, name: 'Hyderabad Branch', stateId: 2 },
  { id: 3, name: 'Chennai Branch', stateId: 3 },
  { id: 4, name: 'Bangalore Branch', stateId: 4 },
];

// Soft blurred blob with layered ring outlines, top-right corner —
// plain Views only, no native SVG dependency required.
const TopRightDecor = () => (
  <View pointerEvents="none" style={styles.topDecorWrap}>
    <View style={styles.topDecorBlob} />
    <View style={styles.topDecorArcOuter} />
    <View style={styles.topDecorArcInner} />
  </View>
);

const BottomDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <View style={styles.bgWaveFront} />
  </View>
);

// Local styles for OTP buttons, inline error banners, and field errors.
const local = StyleSheet.create({
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 18,
  },
  fieldError: {
    color: '#B91C1C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
    fontWeight: '500',
  },
  otpBtn: {
    backgroundColor: '#EEF1FF',
    borderWidth: 1,
    borderColor: '#3B5BFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBtnDisabled: {
    opacity: 0.6,
  },
  otpBtnText: {
    color: '#3B5BFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EAF7F0',
    borderWidth: 1,
    borderColor: '#1E8F5F',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  verifiedBadgeText: {
    color: '#1E8F5F',
    fontSize: 12,
    fontWeight: '700',
  },
  otpContainer: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  otpInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E4E9',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    height: 44,
    gap: 8,
  },
  successNotice: {
    color: '#1E8F5F',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 2,
    fontWeight: '600',
  },
  resendBtnText: {
    color: '#3B5BFF',
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
});

const emptyForm = {
  fullName: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  dob: '',
  aadhaar: '',
  address: '',
  city: '',
  stateId: null as number | null,
  stateName: '',
  pin: '',
  branchId: null as number | null,
  branchName: '',
};

// Converts a DD-MM-YYYY string (as used by the existing UI) into the
// YYYY-MM-DD format required by the backend. Returns null if the input
// doesn't match the expected shape.
const toApiDate = (dob: string): string | null => {
  const match = dob.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
};

const RegistrationScreen = ({ navigation }: any) => {
  const { registerInvestor } = useAppData();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({ ...emptyForm });

  // Dynamic state & branch options loaded from backend API
  const [stateOptions, setStateOptions] = useState<{ id: number; name: string }[]>(STATE_OPTIONS);
  const [branchOptions, setBranchOptions] = useState<{ id: number; name: string; stateId?: number | null }[]>(BRANCH_OPTIONS);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  // Email OTP state
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);
  const [otpErrorMessage, setOtpErrorMessage] = useState<string | null>(null);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);

  const update = (key: keyof typeof form, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // =====================================================================
  // LOAD STATES FROM BACKEND API
  // =====================================================================
  useEffect(() => {
    let isMounted = true;
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const res = await investorService.getStates();
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const mapped = res.map(s => ({
            id: s.id,
            name: s.state_name,
          }));
          setStateOptions(mapped);
        }
      } catch (err) {
        console.warn('Could not load states from API, using fallback:', err);
      } finally {
        if (isMounted) setLoadingStates(false);
      }
    };
    fetchStates();
    return () => {
      isMounted = false;
    };
  }, []);

  // =====================================================================
  // LOAD BRANCHES BASED ON SELECTED STATE FROM BACKEND API
  // =====================================================================
  useEffect(() => {
    let isMounted = true;
    const fetchBranches = async () => {
      if (!form.stateId) {
        return;
      }
      try {
        setLoadingBranches(true);
        const res = await investorService.getBranches(form.stateId);
        if (isMounted && Array.isArray(res)) {
          const mapped = res.map(b => ({
            id: b.id,
            name: b.branch_name,
            stateId: b.state_id ?? form.stateId,
          }));
          setBranchOptions(mapped);
        }
      } catch (err) {
        console.warn('Could not load branches from API, using fallback:', err);
      } finally {
        if (isMounted) setLoadingBranches(false);
      }
    };
    fetchBranches();
    return () => {
      isMounted = false;
    };
  }, [form.stateId]);

  // Available branches for current selection
  const availableBranches = useMemo(() => {
    if (!form.stateId) return branchOptions;
    return branchOptions.filter(b => b.stateId === form.stateId);
  }, [form.stateId, branchOptions]);

  // Handlers that reject invalid characters and immediately show field error
  const handleFullNameChange = (val: string) => {
    if (/[^A-Za-z ]/.test(val)) {
      const msg = 'Full name can contain letters and spaces only.';
      setFieldErrors(prev => ({ ...prev, fullName: msg }));
      setErrorMessage(msg);
      const clean = val.replace(/[^A-Za-z ]/g, '').replace(/^\s+/, '').replace(/ {2,}/g, ' ');
      update('fullName', clean);
      return;
    }
    setFieldErrors(prev => {
      if (!prev.fullName) return prev;
      const next = { ...prev };
      delete next.fullName;
      return next;
    });
    setErrorMessage(null);
    const clean = val.replace(/^\s+/, '').replace(/ {2,}/g, ' ');
    update('fullName', clean);
  };

  const handleMobileChange = (val: string) => {
    if (/\D/.test(val)) {
      const msg = 'Mobile number must contain digits only.';
      setFieldErrors(prev => ({ ...prev, mobile: msg }));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 10);
      update('mobile', clean);
      return;
    }
    const clean = val.slice(0, 10);
    setFieldErrors(prev => {
      if (!prev.mobile) return prev;
      const next = { ...prev };
      delete next.mobile;
      return next;
    });
    setErrorMessage(null);
    update('mobile', clean);
  };

  const handleMobileBlur = () => {
    if (form.mobile && form.mobile.length > 0 && form.mobile.length !== 10) {
      const msg = 'Please enter a valid 10-digit mobile number.';
      setFieldErrors(prev => ({ ...prev, mobile: msg }));
      setErrorMessage(msg);
    }
  };

  const handleEmailChange = (val: string) => {
    const clean = val.replace(/\s/g, '');

    // If email changes after verification, require OTP verification again
    if (isEmailVerified || otpSent) {
      setIsEmailVerified(false);
      setOtpSent(false);
      setEmailOtp('');
      setOtpSuccessMessage(null);
      setOtpErrorMessage(null);
    }

    setFieldErrors(prev => {
      if (!prev.email) return prev;
      const next = { ...prev };
      delete next.email;
      return next;
    });
    setErrorMessage(null);
    update('email', clean);
  };

  const handleEmailBlur = () => {
    if (form.email && form.email.trim()) {
      const emailCheck = validation.isValidEmail(form.email.trim());
      if (!emailCheck.isValid) {
        const msg = emailCheck.error || 'Please enter a valid email address.';
        setFieldErrors(prev => ({ ...prev, email: msg }));
        setErrorMessage(msg);
      }
    }
  };

  // =====================================================================
  // EMAIL OTP FLOW
  // =====================================================================
  const handleSendOtp = async () => {
    setOtpErrorMessage(null);
    setOtpSuccessMessage(null);

    const cleanName = form.fullName.trim();
    if (!cleanName) {
      const msg = 'Full name is required before sending OTP.';
      setFieldErrors(prev => ({ ...prev, fullName: msg }));
      setErrorMessage(msg);
      return;
    }

    const cleanEmail = form.email.trim();
    if (!cleanEmail) {
      const msg = 'Please enter a valid email address.';
      setFieldErrors(prev => ({ ...prev, email: msg }));
      setErrorMessage(msg);
      return;
    }

    const emailCheck = validation.isValidEmail(cleanEmail);
    if (!emailCheck.isValid) {
      const msg = emailCheck.error || 'Please enter a valid email address.';
      setFieldErrors(prev => ({ ...prev, email: msg }));
      setErrorMessage(msg);
      return;
    }

    try {
      setOtpLoading(true);
      const res = await authService.sendEmailOtp(cleanEmail, cleanName);
      setOtpSent(true);
      setOtpSuccessMessage(res?.message || 'OTP sent successfully to your email.');
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
      setErrorMessage(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to send OTP. Please try again.';
      setOtpErrorMessage(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpErrorMessage(null);
    const cleanOtp = emailOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || /\D/.test(cleanOtp)) {
      setOtpErrorMessage('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await authService.verifyEmailOtp(form.email.trim(), cleanOtp);
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpSuccessMessage(res?.message || 'Email verified successfully.');
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
      setErrorMessage(null);
    } catch (err: any) {
      const msg = err?.message || 'Invalid OTP. Please check and try again.';
      setOtpErrorMessage(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleDobChange = (val: string) => {
    if (/[a-zA-Z]/.test(val)) {
      const msg = 'Please enter a valid date of birth (DD-MM-YYYY).';
      setFieldErrors(prev => ({ ...prev, dob: msg }));
      setErrorMessage(msg);
      const clean = val.replace(/[a-zA-Z]/g, '').slice(0, 10);
      update('dob', clean);
      return;
    }

    setFieldErrors(prev => {
      if (!prev.dob) return prev;
      const next = { ...prev };
      delete next.dob;
      return next;
    });
    setErrorMessage(null);
    update('dob', val.slice(0, 10));
  };

  const handleDobBlur = () => {
    if (form.dob && form.dob.trim()) {
      if (!toApiDate(form.dob)) {
        const msg = 'Please enter a valid date of birth (DD-MM-YYYY).';
        setFieldErrors(prev => ({ ...prev, dob: msg }));
        setErrorMessage(msg);
      }
    }
  };

  const handleAadhaarChange = (val: string) => {
    if (/\D/.test(val)) {
      const msg = 'Aadhaar number must contain digits only.';
      setFieldErrors(prev => ({ ...prev, aadhaar: msg }));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 12);
      update('aadhaar', clean);
      return;
    }

    const clean = val.slice(0, 12);
    setFieldErrors(prev => {
      if (!prev.aadhaar) return prev;
      const next = { ...prev };
      delete next.aadhaar;
      return next;
    });
    setErrorMessage(null);
    update('aadhaar', clean);
  };

  const handleAadhaarBlur = () => {
    if (form.aadhaar && form.aadhaar.length > 0 && form.aadhaar.length !== 12) {
      const msg = 'Please enter a valid 12-digit Aadhaar number.';
      setFieldErrors(prev => ({ ...prev, aadhaar: msg }));
      setErrorMessage(msg);
    }
  };

  const handlePincodeChange = (val: string) => {
    if (/\D/.test(val)) {
      const msg = 'Pincode must contain numbers only.';
      setFieldErrors(prev => ({ ...prev, pin: msg }));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 6);
      update('pin', clean);
      return;
    }

    const clean = val.slice(0, 6);
    setFieldErrors(prev => {
      if (!prev.pin) return prev;
      const next = { ...prev };
      delete next.pin;
      return next;
    });
    setErrorMessage(null);
    update('pin', clean);
  };

  const handlePincodeBlur = () => {
    if (form.pin && form.pin.length > 0 && form.pin.length !== 6) {
      const msg = 'Please enter a valid 6-digit PIN code.';
      setFieldErrors(prev => ({ ...prev, pin: msg }));
      setErrorMessage(msg);
    }
  };

  const pickPhoto = (setter: (uri: string) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8, selectionLimit: 1 },
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const uri = response.assets && response.assets[0]?.uri;
        if (uri) {
          setter(uri);
        }
      },
    );
  };

  // =====================================================================
  // STEP 1 DETERMINISTIC VALIDATION
  // =====================================================================
  const validateStep1 = (): string | null => {
    const errors: Record<string, string> = {};

    // 1. Full Name
    const fullNameClean = form.fullName.trim();
    if (!fullNameClean) {
      errors.fullName = 'Full name is required.';
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(fullNameClean)) {
      errors.fullName = 'Full name can contain letters and spaces only.';
    }

    // 2. Mobile
    if (!form.mobile.trim()) {
      errors.mobile = 'Mobile number is required.';
    } else if (/\D/.test(form.mobile) || form.mobile.length !== 10) {
      errors.mobile = 'Please enter a valid 10-digit mobile number.';
    }

    // 3. Email
    if (!form.email.trim()) {
      errors.email = 'Email address is required.';
    } else {
      const emailCheck = validation.isValidEmail(form.email.trim());
      if (!emailCheck.isValid) {
        errors.email = emailCheck.error || 'Please enter a valid email address.';
      }
    }

    // 4. Email OTP verification
    if (!errors.email && !isEmailVerified) {
      errors.email = 'Please verify your email with OTP before proceeding.';
    }

    // 5. Date of Birth
    if (!form.dob.trim()) {
      errors.dob = 'Date of birth is required.';
    } else if (!toApiDate(form.dob)) {
      errors.dob = 'Please enter a valid date of birth (DD-MM-YYYY).';
    }

    // 6. Aadhaar
    if (!form.aadhaar.trim()) {
      errors.aadhaar = 'Aadhaar number is required.';
    } else if (/\D/.test(form.aadhaar) || form.aadhaar.length !== 12) {
      errors.aadhaar = 'Please enter a valid 12-digit Aadhaar number.';
    }

    // 7. Password
    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errors.password = 'Password must contain at least 8 characters.';
    }

    // 8. Confirm Password
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    // 9. Address
    if (!form.address.trim()) {
      errors.address = 'Address is required.';
    }

    // 10. City
    if (!form.city.trim()) {
      errors.city = 'City is required.';
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(form.city.trim())) {
      errors.city = 'City should contain only letters and spaces.';
    }

    // 11. State
    if (!form.stateId) {
      errors.stateId = 'Please select a state.';
    }

    // 12. PIN
    if (!form.pin.trim()) {
      errors.pin = 'PIN code is required.';
    } else if (/\D/.test(form.pin) || form.pin.length !== 6) {
      errors.pin = 'Please enter a valid 6-digit PIN code.';
    }

    // 13. Branch
    if (!form.branchId) {
      errors.branchId = 'Please select a branch.';
    }

    setFieldErrors(errors);
    const firstError = Object.values(errors)[0] || null;
    return firstError;
  };

  // =====================================================================
  // FINAL REGISTRATION SUBMISSION
  // =====================================================================
  const handleSubmit = async () => {
    if (!agreed) {
      setErrorMessage('Please agree to the Terms & Conditions to submit your application.');
      return;
    }
    if (isSubmitting) return;

    const validationError = validateStep1();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload = {
        full_name: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        password: form.password,
        date_of_birth: toApiDate(form.dob)!,
        aadhaar_number: form.aadhaar.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state_id: form.stateId!,
        pincode: form.pin.trim(),
        branch_id: form.branchId!,
      };

      await authService.registerInvestor(payload);

      // Update local app context for demo/KYC screens
      registerInvestor({
        name: form.fullName.trim(),
        mobile: form.mobile.trim(),
        email: form.email.trim(),
        dob: form.dob.trim(),
        aadhaar: form.aadhaar.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.stateName || 'State',
        pincode: form.pin.trim(),
        branch: form.branchName || 'Branch',
      });

      setIsSubmitting(false);
      setSubmittedModalVisible(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(formatErrorMessage(err));
    }
  };

  const goToLogin = () => {
    setSubmittedModalVisible(false);
    navigation.replace('Login');
  };

  const goToHome = () => {
    setSubmittedModalVisible(false);
    navigation.navigate('Landing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopRightDecor />
      <BottomDecor />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image source={require('../assets/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Financer Platform</Text>
        </View>

        <Text style={styles.title}>Investor registration</Text>
        <Text style={styles.subtitle}> complete your KYC to start investing</Text>

        <View style={styles.stepperRow}>
          {steps.map((label, idx) => {
            const num = idx + 1;
            const done = num < step;
            const active = num === step;
            return (
              <React.Fragment key={label}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      done && styles.stepCircleDone,
                      active && styles.stepCircleActive,
                    ]}>
                    <Text
                      style={[
                        styles.stepNum,
                        (done || active) && styles.stepNumActive,
                      ]}>
                      {done ? '✓' : num}
                    </Text>
                  </View>
                  <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                    {label}
                  </Text>
                </View>
                {idx < steps.length - 1 && (
                  <View style={styles.stepLineWrap}>
                    <View
                      style={[
                        styles.stepLineFill,
                        { width: step > num ? '100%' : '35%' },
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>

        {step === 1 && (
          <View style={styles.card}>
            {/* 1. Full Name */}
            <Text style={styles.label}>
              Full name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="account-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="As per Aadhaar card"
                placeholderTextColor="#9CA3AF"
                value={form.fullName}
                onChangeText={handleFullNameChange}
              />
            </View>
            {fieldErrors.fullName ? (
              <Text style={local.fieldError}>{fieldErrors.fullName}</Text>
            ) : null}

            {/* 2. Mobile Number */}
            <Text style={styles.label}>
              Mobile number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                value={form.mobile}
                onChangeText={handleMobileChange}
                onBlur={handleMobileBlur}
              />
            </View>
            {fieldErrors.mobile ? (
              <Text style={local.fieldError}>{fieldErrors.mobile}</Text>
            ) : null}

            {/* 3. Email Address + OTP */}
            <Text style={styles.label}>
              Email address <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {isEmailVerified ? (
                <View style={local.verifiedBadge}>
                  <Icon name="check-circle" size={14} color="#1E8F5F" />
                  <Text style={local.verifiedBadgeText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[local.otpBtn, otpLoading && local.otpBtnDisabled]}
                  onPress={handleSendOtp}
                  disabled={otpLoading}>
                  {otpLoading ? (
                    <ActivityIndicator size="small" color="#3B5BFF" />
                  ) : (
                    <Text style={local.otpBtnText}>
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {fieldErrors.email ? (
              <Text style={local.fieldError}>{fieldErrors.email}</Text>
            ) : null}
            {otpSuccessMessage && !isEmailVerified ? (
              <Text style={local.successNotice}>{otpSuccessMessage}</Text>
            ) : null}
            {otpErrorMessage ? (
              <Text style={local.fieldError}>{otpErrorMessage}</Text>
            ) : null}

            {/* Email OTP Input Row (when OTP is sent and not yet verified) */}
            {otpSent && !isEmailVerified && (
              <View style={local.otpContainer}>
                <Text style={[styles.label, { marginTop: 0, marginBottom: 6, fontSize: 12 }]}>
                  Enter 6-Digit Email OTP <Text style={styles.required}>*</Text>
                </Text>
                <View style={local.otpRow}>
                  <View style={local.otpInputWrap}>
                    <Icon name="shield-key-outline" size={16} color="#3B5BFF" />
                    <TextInput
                      style={styles.inputField}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={emailOtp}
                      onChangeText={val => {
                        setOtpErrorMessage(null);
                        setEmailOtp(val.replace(/\D/g, ''));
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    style={[local.otpBtn, { backgroundColor: '#3B5BFF', paddingVertical: 11 }]}
                    onPress={handleVerifyOtp}
                    disabled={otpLoading}>
                    {otpLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={[local.otpBtnText, { color: '#fff' }]}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* 4. Password */}
            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="Choose a password (min. 8 characters)"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={v => {
                  setFieldErrors(prev => {
                    if (!prev.password) return prev;
                    const next = { ...prev };
                    delete next.password;
                    return next;
                  });
                  setErrorMessage(null);
                  update('password', v);
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
            {fieldErrors.password ? (
              <Text style={local.fieldError}>{fieldErrors.password}</Text>
            ) : null}

            {/* 5. Confirm Password */}
            <Text style={styles.label}>
              Confirm Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-check-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={form.confirmPassword}
                onChangeText={v => {
                  setFieldErrors(prev => {
                    if (!prev.confirmPassword) return prev;
                    const next = { ...prev };
                    delete next.confirmPassword;
                    return next;
                  });
                  setErrorMessage(null);
                  update('confirmPassword', v);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(prev => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.confirmPassword ? (
              <Text style={local.fieldError}>{fieldErrors.confirmPassword}</Text>
            ) : null}

            {/* 6. Date of Birth */}
            <Text style={styles.label}>
              Date of birth <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="calendar-blank-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="dd-mm-yyyy"
                placeholderTextColor="#9CA3AF"
                maxLength={10}
                value={form.dob}
                onChangeText={handleDobChange}
                onBlur={handleDobBlur}
              />
              <Icon name="calendar-month-outline" size={18} color="#9CA3AF" />
            </View>
            {fieldErrors.dob ? (
              <Text style={local.fieldError}>{fieldErrors.dob}</Text>
            ) : null}

            {/* 7. Aadhaar Number */}
            <Text style={styles.label}>
              Aadhaar number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="card-account-details-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="XXXX XXXX XXXX"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                maxLength={12}
                value={form.aadhaar}
                onChangeText={handleAadhaarChange}
                onBlur={handleAadhaarBlur}
              />
            </View>
            {fieldErrors.aadhaar ? (
              <Text style={local.fieldError}>{fieldErrors.aadhaar}</Text>
            ) : null}

            {/* 8. Address */}
            <Text style={styles.label}>
              Address <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="map-marker-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="Street address"
                placeholderTextColor="#9CA3AF"
                value={form.address}
                onChangeText={v => {
                  setFieldErrors(prev => {
                    if (!prev.address) return prev;
                    const next = { ...prev };
                    delete next.address;
                    return next;
                  });
                  setErrorMessage(null);
                  update('address', v);
                }}
              />
            </View>
            {fieldErrors.address ? (
              <Text style={local.fieldError}>{fieldErrors.address}</Text>
            ) : null}

            {/* 9. City & PIN */}
            <View style={styles.row3}>
              <View style={styles.col}>
                <Text style={styles.label}>
                  City <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="office-building-outline" size={18} color="#3B5BFF" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="City"
                    placeholderTextColor="#9CA3AF"
                    value={form.city}
                    onChangeText={v => {
                      setFieldErrors(prev => {
                        if (!prev.city) return prev;
                        const next = { ...prev };
                        delete next.city;
                        return next;
                      });
                      setErrorMessage(null);
                      update('city', v);
                    }}
                  />
                </View>
                {fieldErrors.city ? (
                  <Text style={local.fieldError}>{fieldErrors.city}</Text>
                ) : null}
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>
                  PIN code <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="numeric" size={18} color="#3B5BFF" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="400001"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={form.pin}
                    onChangeText={handlePincodeChange}
                    onBlur={handlePincodeBlur}
                  />
                </View>
                {fieldErrors.pin ? (
                  <Text style={local.fieldError}>{fieldErrors.pin}</Text>
                ) : null}
              </View>
            </View>

            {/* 10. State Dropdown (Loaded from API) */}
            <Text style={styles.label}>
              State <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => {
                setStateDropdownOpen(prev => !prev);
                setBranchDropdownOpen(false);
              }}>
              <Icon name="map-outline" size={18} color="#3B5BFF" />
              <Text style={form.stateName ? styles.inputField : styles.inputPlaceholder}>
                {form.stateName || 'Select state'}
              </Text>
              {loadingStates ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            {fieldErrors.stateId ? (
              <Text style={local.fieldError}>{fieldErrors.stateId}</Text>
            ) : null}
            {stateDropdownOpen && (
              <View style={styles.dropdownList}>
                {stateOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.dropdownOption,
                      form.stateId === opt.id && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setForm(prev => ({
                        ...prev,
                        stateId: opt.id,
                        stateName: opt.name,
                        branchId: null,
                        branchName: '',
                      }));
                      setFieldErrors(prev => {
                        if (!prev.stateId) return prev;
                        const next = { ...prev };
                        delete next.stateId;
                        return next;
                      });
                      setErrorMessage(null);
                      setStateDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 11. Branch Dropdown (Loaded for selected State) */}
            <Text style={styles.label}>
              Branch <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() => {
                setBranchDropdownOpen(prev => !prev);
                setStateDropdownOpen(false);
              }}>
              <Icon name="bank-outline" size={18} color="#3B5BFF" />
              <Text style={form.branchName ? styles.inputField : styles.inputPlaceholder}>
                {form.branchName || 'Select branch'}
              </Text>
              {loadingBranches ? (
                <ActivityIndicator size="small" color="#9CA3AF" />
              ) : (
                <Icon name="chevron-down" size={20} color="#9CA3AF" />
              )}
            </TouchableOpacity>
            {fieldErrors.branchId ? (
              <Text style={local.fieldError}>{fieldErrors.branchId}</Text>
            ) : null}
            {branchDropdownOpen && (
              <View style={styles.dropdownList}>
                {availableBranches.length === 0 && (
                  <View style={styles.dropdownOption}>
                    <Text style={styles.dropdownOptionText}>
                      No branches available for this state
                    </Text>
                  </View>
                )}
                {availableBranches.map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.dropdownOption,
                      form.branchId === opt.id && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setForm(prev => ({
                        ...prev,
                        branchId: opt.id,
                        branchName: opt.name,
                      }));
                      setFieldErrors(prev => {
                        if (!prev.branchId) return prev;
                        const next = { ...prev };
                        delete next.branchId;
                        return next;
                      });
                      setErrorMessage(null);
                      setBranchDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {errorMessage && (
              <View style={local.errorBox}>
                <Text style={local.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: REVIEW & SUBMIT */}
        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCheck}>✅</Text>
              <Text style={styles.reviewTitle}>Review your application</Text>
            </View>

            {[
              ['Full name', form.fullName || '—'],
              ['Mobile number', form.mobile || '—'],
              ['Email address', form.email || '—'],
              ['Date of birth', form.dob || '—'],
              ['Aadhaar number', form.aadhaar || '—'],
              ['Address', form.address || '—'],
              ['City', form.city || '—'],
              ['State', form.stateName || '—'],
              ['PIN code', form.pin || '—'],
              ['Branch', form.branchName || '—'],
              ['Password', '••••••••'],
            ].map(([label, value]) => (
              <View key={label} style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>{label}</Text>
                <Text style={styles.reviewValue}>{value}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.agreeRow}
              onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.agreeText}>
                I agree to the <Text style={styles.agreeLink}>Terms & Conditions</Text> and <Text style={styles.agreeLink}>KYC Policy</Text>
              </Text>
            </TouchableOpacity>

            {errorMessage && (
              <View style={local.errorBox}>
                <Text style={local.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        )}

        {/* NAVIGATION BUTTONS */}
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity
              style={styles.prevBtn}
              onPress={() => {
                setErrorMessage(null);
                setFieldErrors({});
                setStep(step - 1);
              }}>
              <Icon name="arrow-left" size={16} color="#3B5BFF" />
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.prevBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={16} color="#3B5BFF" />
              <Text style={styles.prevBtnText}>Back to login</Text>
            </TouchableOpacity>
          )}

          {step < 2 ? (
            <TouchableOpacity
              style={styles.nextBtn}
              onPress={() => {
                const validationError = validateStep1();
                if (validationError) {
                  setErrorMessage(validationError);
                  return;
                }
                setErrorMessage(null);
                setFieldErrors({});
                setStep(step + 1);
              }}>
              <Text style={styles.nextBtnText}>Next step</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.nextBtn,
                (!agreed || isSubmitting) && styles.nextBtnDisabled,
              ]}
              disabled={!agreed || isSubmitting}
              onPress={handleSubmit}>
              <Text style={styles.nextBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit application'}
              </Text>
              {!isSubmitting && <Icon name="arrow-right" size={16} color="#fff" />}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ---------- Registration Submitted popup ---------- */}
      <Modal
        visible={submittedModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIconText}>⏳</Text>
            </View>
            <Text style={styles.modalTitle}>Registration Submitted!</Text>
            <Text style={styles.modalSubtitle}>
              Your registration request has been sent to the Branch Admin for review. You will
              receive a notification once your account is approved and your Investor ID is
              generated.
            </Text>

            <View style={styles.checklistCard}>
              <Text style={styles.checklistHeading}>What happens next?</Text>

              <View style={styles.checklistItem}>
                <Text style={styles.checklistCheck}>✓</Text>
                <View style={styles.checklistTextWrap}>
                  <Text style={styles.checklistTitle}>1. Branch Admin Reviews</Text>
                  <Text style={styles.checklistDesc}>
                    Your selected branch admin will verify your details.
                  </Text>
                </View>
              </View>

              <View style={styles.checklistItem}>
                <Text style={styles.checklistCheck}>✓</Text>
                <View style={styles.checklistTextWrap}>
                  <Text style={styles.checklistTitle}>2. Approval & Investor ID</Text>
                  <Text style={styles.checklistDesc}>
                    Once approved, your unique Investor ID is generated automatically.
                  </Text>
                </View>
              </View>

              <View style={[styles.checklistItem, { marginBottom: 0 }]}>
                <Text style={styles.checklistCheck}>✓</Text>
                <View style={styles.checklistTextWrap}>
                  <Text style={styles.checklistTitle}>3. Login Enabled</Text>
                  <Text style={styles.checklistDesc}>
                    You can log in using your Investor ID and registered password.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnOutline} onPress={goToHome}>
                <Text style={styles.modalBtnOutlineText}>Back to Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={goToLogin}>
                <Text style={styles.modalBtnPrimaryText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegistrationScreen;