import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppData} from '../navigation/AppNavigator';
import {styles} from '../styles/RegistrartionScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const steps = ['Personal info', 'Review & submit'];

// -----------------------------------------------------------------------
// Backend config
// -----------------------------------------------------------------------
const API_BASE_URL = 'http://187.52.115.32:8000';

// Keys used by LoginScreen.tsx to persist the access_token returned by
// POST /auth/admin/login and POST /auth/superadmin/login. Registration
// for these two roles is a protected endpoint and needs this token sent
// as `Authorization: Bearer <token>`.
const ADMIN_TOKEN_KEY = 'ADMIN_ACCESS_TOKEN';
const SUPERADMIN_TOKEN_KEY = 'SUPERADMIN_ACCESS_TOKEN';

type Role = 'investor' | 'admin' | 'superadmin';

const ROLE_OPTIONS: {key: Role; label: string}[] = [
  {key: 'investor', label: 'Investor'},
  {key: 'admin', label: 'Admin'},
  {key: 'superadmin', label: 'Super Admin'},
];

// Source of truth: GET /masters/states
const STATE_OPTIONS: {id: number; name: string}[] = [
  {id: 1, name: 'Andhra Pradesh'},
  {id: 2, name: 'Telangana'},
  {id: 3, name: 'Tamil Nadu'},
  {id: 4, name: 'Karnataka'},
  {id: 5, name: 'Kerala'},
];

// Source of truth: GET /masters/branches
const BRANCH_OPTIONS: {id: number; name: string; stateId: number}[] = [
  {id: 1, name: 'Vijayawada Branch', stateId: 1},
  {id: 2, name: 'Hyderabad Branch', stateId: 2},
  {id: 3, name: 'Chennai Branch', stateId: 3},
  {id: 4, name: 'Bangalore Branch', stateId: 4},
  // Note: backend currently returns no branch for Kerala (state_id 5).
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

// Local styles for the small number of new elements (role selector,
// username field spacing, error banner). Kept separate from the existing
// styles file so the original design system is untouched.
const local = StyleSheet.create({
  roleRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  roleBtnLast: {
    marginRight: 0,
  },
  roleBtnActive: {
    borderColor: '#3B5BFF',
    backgroundColor: '#EEF1FF',
  },
  roleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleBtnTextActive: {
    color: '#3B5BFF',
  },
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
});

const emptyForm = {
  fullName: '',
  mobile: '',
  email: '',
  password: '',
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

const RegistrationScreen = ({navigation}: any) => {
  const {registerInvestor} = useAppData();
  const [step, setStep] = useState(1);

  const [role, setRole] = useState<Role>('investor');

  const [form, setForm] = useState({...emptyForm});

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Shown after Submit succeeds against the real backend. No Investor ID
  // is generated here — that only happens once a Branch Admin approves
  // the request (see admin approval flow). Until then the request sits
  // as "Pending". Per team decision, the ID is NOT surfaced to the
  // investor at this step even in demo mode — it stays hidden until the
  // real approval/notification flow delivers it, matching production
  // behavior.
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);

  const update = (key: keyof typeof form, value: any) =>
    setForm(prev => ({...prev, [key]: value}));

  // Handlers that reject invalid characters and immediately show field error
  const handleFullNameChange = (val: string) => {
    if (/[^A-Za-z ]/.test(val)) {
      const msg = 'Full name can contain letters and spaces only.';
      setFieldErrors(prev => ({...prev, fullName: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/[^A-Za-z ]/g, '').replace(/^\s+/, '').replace(/ {2,}/g, ' ');
      update('fullName', clean);
      return;
    }
    setFieldErrors(prev => {
      if (!prev.fullName) return prev;
      const next = {...prev};
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
      setFieldErrors(prev => ({...prev, mobile: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 10);
      update('mobile', clean);
      return;
    }
    const clean = val.slice(0, 10);
    setFieldErrors(prev => {
      if (!prev.mobile) return prev;
      const next = {...prev};
      delete next.mobile;
      return next;
    });
    setErrorMessage(null);
    update('mobile', clean);
  };

  const handleMobileBlur = () => {
    if (form.mobile && form.mobile.length > 0 && form.mobile.length !== 10) {
      const msg = 'Mobile number must be exactly 10 digits.';
      setFieldErrors(prev => ({...prev, mobile: msg}));
      setErrorMessage(msg);
    }
  };

  const handleEmailChange = (val: string) => {
    if (/[A-Z]/.test(val) || /\s/.test(val)) {
      const msg = 'Email must use lowercase letters and end with @gmail.com.';
      setFieldErrors(prev => ({...prev, email: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/[A-Z\s]/g, '');
      update('email', clean);
      return;
    }

    if (val.includes('@')) {
      const parts = val.split('@');
      const domain = parts[1] || '';
      if (domain.includes('.') && !domain.endsWith('gmail.com')) {
        const msg = 'Please enter a valid Gmail address ending with @gmail.com.';
        setFieldErrors(prev => ({...prev, email: msg}));
        setErrorMessage(msg);
        update('email', val);
        return;
      }
    }

    setFieldErrors(prev => {
      if (!prev.email) return prev;
      const next = {...prev};
      delete next.email;
      return next;
    });
    setErrorMessage(null);
    update('email', val);
  };

  const handleEmailBlur = () => {
    if (form.email && form.email.trim()) {
      if (/[A-Z]/.test(form.email)) {
        const msg = 'Email must use lowercase letters and end with @gmail.com.';
        setFieldErrors(prev => ({...prev, email: msg}));
        setErrorMessage(msg);
      } else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(form.email.trim())) {
        const msg = 'Please enter a valid Gmail address ending with @gmail.com.';
        setFieldErrors(prev => ({...prev, email: msg}));
        setErrorMessage(msg);
      }
    }
  };

  const handleDobChange = (val: string) => {
    if (/[a-zA-Z]/.test(val)) {
      const msg = 'Please enter a valid date of birth.';
      setFieldErrors(prev => ({...prev, dob: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/[a-zA-Z]/g, '').slice(0, 10);
      update('dob', clean);
      return;
    }

    setFieldErrors(prev => {
      if (!prev.dob) return prev;
      const next = {...prev};
      delete next.dob;
      return next;
    });
    setErrorMessage(null);
    update('dob', val.slice(0, 10));
  };

  const handleDobBlur = () => {
    if (form.dob && form.dob.trim()) {
      if (!toApiDate(form.dob)) {
        const msg = 'Please enter a valid date of birth.';
        setFieldErrors(prev => ({...prev, dob: msg}));
        setErrorMessage(msg);
      }
    }
  };

  const handleAadhaarChange = (val: string) => {
    if (/\D/.test(val)) {
      const msg = 'Aadhaar number must contain digits only.';
      setFieldErrors(prev => ({...prev, aadhaar: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 12);
      update('aadhaar', clean);
      return;
    }

    const clean = val.slice(0, 12);
    setFieldErrors(prev => {
      if (!prev.aadhaar) return prev;
      const next = {...prev};
      delete next.aadhaar;
      return next;
    });
    setErrorMessage(null);
    update('aadhaar', clean);
  };

  const handleAadhaarBlur = () => {
    if (form.aadhaar && form.aadhaar.length > 0 && form.aadhaar.length !== 12) {
      const msg = 'Aadhaar number must be exactly 12 digits.';
      setFieldErrors(prev => ({...prev, aadhaar: msg}));
      setErrorMessage(msg);
    }
  };

  const handlePincodeChange = (val: string) => {
    if (/\D/.test(val)) {
      const msg = 'Pincode must contain numbers only.';
      setFieldErrors(prev => ({...prev, pin: msg}));
      setErrorMessage(msg);
      const clean = val.replace(/\D/g, '').slice(0, 6);
      update('pin', clean);
      return;
    }

    const clean = val.slice(0, 6);
    setFieldErrors(prev => {
      if (!prev.pin) return prev;
      const next = {...prev};
      delete next.pin;
      return next;
    });
    setErrorMessage(null);
    update('pin', clean);
  };

  const handlePincodeBlur = () => {
    if (form.pin && form.pin.length > 0 && form.pin.length !== 6) {
      const msg = 'Pincode must be exactly 6 digits.';
      setFieldErrors(prev => ({...prev, pin: msg}));
      setErrorMessage(msg);
    }
  };

  // Branches available for the Investor flow are filtered by the
  // selected state. Admin / Super Admin can pick from every branch.
  const availableBranches = useMemo(() => {
    if (role !== 'investor' || !form.stateId) return BRANCH_OPTIONS;
    return BRANCH_OPTIONS.filter(b => b.stateId === form.stateId);
  }, [role, form.stateId]);

  const selectRole = (next: Role) => {
    setRole(next);
    setErrorMessage(null);
    setFieldErrors({});
    // Reset role-specific fields so a leftover value from one role never
    // gets sent to another role's endpoint.
    setForm(prev => ({
      ...emptyForm,
      fullName: prev.fullName,
      mobile: prev.mobile,
      email: prev.email,
      password: prev.password,
    }));
    setStateDropdownOpen(false);
    setBranchDropdownOpen(false);
  };

  // Opens the phone's photo/file picker so the user can upload an image
  const pickPhoto = (setter: (uri: string) => void) => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8, selectionLimit: 1},
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

  // Pulls a human-readable message out of a FastAPI-style error body.
  // Handles both `{"detail": "..."}` and `{"detail": [{"msg": "..."}]}`.
  const extractErrorMessage = (status: number, data: any): string => {
    const detail = data?.detail;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((d: any) => (typeof d?.msg === 'string' ? d.msg : JSON.stringify(d)))
        .join('\n');
    }
    switch (status) {
      case 400:
        return 'Some of the details you entered are invalid. Please check and try again.';
      case 401:
        return 'You are not authorized to perform this action.';
      case 403:
        return 'This action is not permitted.';
      case 409:
        return 'An account with these details already exists.';
      case 422:
        return 'Some fields failed validation. Please check your entries.';
      case 500:
        return 'The server ran into a problem. Please try again later.';
      default:
        return 'Registration failed. Please try again.';
    }
  };

  const validateStep1 = (): string | null => {
    const errors: Record<string, string> = {};

    const fullNameClean = form.fullName.trim();
    if (!fullNameClean) {
      errors.fullName = 'Full name is required.';
    } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(fullNameClean)) {
      errors.fullName = 'Full name can contain letters and spaces only.';
    }

    if (!form.mobile.trim()) {
      errors.mobile = 'Mobile number is required.';
    } else if (/\D/.test(form.mobile)) {
      errors.mobile = 'Mobile number must contain digits only.';
    } else if (form.mobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits.';
    }

    if (!form.email.trim()) {
      errors.email = 'Enter a valid lowercase Gmail address ending with @gmail.com.';
    } else if (/[A-Z]/.test(form.email) || /\s/.test(form.email)) {
      errors.email = 'Email must use lowercase letters and end with @gmail.com.';
    } else if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid Gmail address ending with @gmail.com.';
    }

    if (!form.password.trim()) {
      errors.password = 'Password is required.';
    }

    if (role === 'investor') {
      if (!form.dob.trim()) {
        errors.dob = 'Date of birth is required.';
      } else if (!toApiDate(form.dob)) {
        errors.dob = 'Please enter a valid date of birth.';
      }

      if (!form.aadhaar.trim()) {
        errors.aadhaar = 'Aadhaar number is required.';
      } else if (/\D/.test(form.aadhaar)) {
        errors.aadhaar = 'Aadhaar number must contain digits only.';
      } else if (form.aadhaar.length !== 12) {
        errors.aadhaar = 'Aadhaar number must be exactly 12 digits.';
      }

      if (!form.address.trim()) {
        errors.address = 'Address is required.';
      }

      if (!form.city.trim()) {
        errors.city = 'City is required.';
      } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(form.city.trim())) {
        errors.city = 'City should contain only letters and spaces.';
      }

      if (!form.pin.trim()) {
        errors.pin = 'PIN code is required.';
      } else if (/\D/.test(form.pin)) {
        errors.pin = 'Pincode must contain numbers only.';
      } else if (form.pin.length !== 6) {
        errors.pin = 'Pincode must be exactly 6 digits.';
      }

      if (!form.stateId) {
        errors.stateId = 'Please select a state.';
      }

      if (!form.branchId) {
        errors.branchId = 'Please select a branch.';
      }
    } else {
      if (!form.username.trim()) {
        errors.username = 'Username is required.';
      } else if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(form.username.trim())) {
        errors.username = 'Username must contain letters only.';
      }

      if (!form.branchId) {
        errors.branchId = 'Please select a branch.';
      }
    }

    setFieldErrors(errors);
    const firstError = Object.values(errors)[0] || null;
    return firstError;
  };

  const buildPayload = () => {
    if (role === 'investor') {
      return {
        full_name: form.fullName,
        mobile: form.mobile,
        email: form.email,
        password: form.password,
        date_of_birth: toApiDate(form.dob),
        aadhaar_number: form.aadhaar,
        address: form.address,
        city: form.city,
        state_id: form.stateId,
        pincode: form.pin,
        branch_id: form.branchId,
      };
    }
    // Admin and Super Admin share the same payload shape.
    return {
      full_name: form.fullName,
      mobile: form.mobile,
      email: form.email,
      username: form.username,
      password: form.password,
      branch_id: form.branchId,
    };
  };

  const endpointForRole = (r: Role) => {
    if (r === 'investor') return '/auth/investor/register';
    if (r === 'admin') return '/auth/admin/register';
    return '/auth/superadmin/register';
  };

  // Admin and Super Admin registration are protected endpoints — the
  // caller must already be logged in as that role. Investor registration
  // needs no token, so this resolves to `undefined` for that role.
  const resolveAuthToken = async (r: Role): Promise<string | null | undefined> => {
    if (r === 'investor') return undefined;
    const key = r === 'admin' ? ADMIN_TOKEN_KEY : SUPERADMIN_TOKEN_KEY;
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      // Treat a storage read failure the same as "no token found" —
      // registration must not proceed without a confirmed token.
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!agreed || isSubmitting) return;

    const validationError = validateStep1();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage(null);

    // For Admin / Super Admin, fetch the stored access_token *before*
    // entering the submitting state. If it's missing, do NOT call the
    // registration API — show a clear error and let the user re-login.
    const token = await resolveAuthToken(role);
    if (role !== 'investor' && !token) {
      setErrorMessage(
        role === 'admin'
          ? 'Admin authentication required. Please login again.'
          : 'Super Admin authentication required. Please login again.',
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = endpointForRole(role);
      const payload = buildPayload();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Surface "Not authenticated" / 401 explicitly rather than
        // hiding it behind a generic message, per the auth requirement.
        if (response.status === 401) {
          setErrorMessage(
            data?.detail ||
              (role === 'admin'
                ? 'Admin authentication required. Please login again.'
                : role === 'superadmin'
                ? 'Super Admin authentication required. Please login again.'
                : 'You are not authorized to perform this action.'),
          );
        } else {
          setErrorMessage(extractErrorMessage(response.status, data));
        }
        setIsSubmitting(false);
        return;
      }

      // Success — only now do we touch local app state / show the modal.
      if (role === 'investor') {
        // registerInvestor() still updates local UI state (e.g. for the
        // Investor Management / KYC Approval screens in this demo app),
        // but it is no longer the source of truth for registration —
        // the backend call above is.
        registerInvestor({
          name: form.fullName,
          mobile: form.mobile,
          email: form.email,
          dob: form.dob,
          aadhaar: form.aadhaar,
          address: form.address,
          city: form.city,
          state: form.stateName,
          pincode: form.pin,
          branch: form.branchName,
        });
      }

      setIsSubmitting(false);
      setSubmittedModalVisible(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(
        err?.message
          ? `Network error: ${err.message}`
          : 'Could not reach the server. Please check your connection and try again.',
      );
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

  const roleLabel = ROLE_OPTIONS.find(r => r.key === role)?.label ?? 'Investor';

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
        <Text style={styles.subtitle}>Complete your KYC to start investing</Text>

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
                        {width: step > num ? '100%' : '35%'},
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
            <Text style={styles.label}>
              Register as <Text style={styles.required}>*</Text>
            </Text>
            <View style={local.roleRow}>
              {ROLE_OPTIONS.map((opt, idx) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    local.roleBtn,
                    idx === ROLE_OPTIONS.length - 1 && local.roleBtnLast,
                    role === opt.key && local.roleBtnActive,
                  ]}
                  onPress={() => selectRole(opt.key)}>
                  <Text
                    style={[
                      local.roleBtnText,
                      role === opt.key && local.roleBtnTextActive,
                    ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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

            <Text style={styles.label}>Email address</Text>
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
            </View>
            {fieldErrors.email ? (
              <Text style={local.fieldError}>{fieldErrors.email}</Text>
            ) : null}

            <Text style={styles.label}>
              Password <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="Choose a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={form.password}
                onChangeText={v => {
                  setFieldErrors(prev => {
                    if (!prev.password) return prev;
                    const next = {...prev};
                    delete next.password;
                    return next;
                  });
                  setErrorMessage(null);
                  update('password', v);
                }}
              />
            </View>
            {fieldErrors.password ? (
              <Text style={local.fieldError}>{fieldErrors.password}</Text>
            ) : null}

            {role !== 'investor' && (
              <>
                <Text style={styles.label}>
                  Username <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="account-key-outline" size={18} color="#3B5BFF" />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Login username"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    value={form.username}
                    onChangeText={v => {
                      setFieldErrors(prev => {
                        if (!prev.username) return prev;
                        const next = {...prev};
                        delete next.username;
                        return next;
                      });
                      setErrorMessage(null);
                      update('username', v);
                    }}
                  />
                </View>
                {fieldErrors.username ? (
                  <Text style={local.fieldError}>{fieldErrors.username}</Text>
                ) : null}
              </>
            )}

            {role === 'investor' && (
              <>
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
                        const next = {...prev};
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
                            const next = {...prev};
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
                  <Icon name="chevron-down" size={20} color="#9CA3AF" />
                </TouchableOpacity>
                {fieldErrors.stateId ? (
                  <Text style={local.fieldError}>{fieldErrors.stateId}</Text>
                ) : null}
                {stateDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {STATE_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.dropdownOption,
                          form.stateId === opt.id && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          // Changing state invalidates any previously
                          // selected branch from a different state.
                          setForm(prev => ({
                            ...prev,
                            stateId: opt.id,
                            stateName: opt.name,
                            branchId: null,
                            branchName: '',
                          }));
                          setFieldErrors(prev => {
                            if (!prev.stateId) return prev;
                            const next = {...prev};
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
              </>
            )}

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
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
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
                        const next = {...prev};
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

        {step === 2 && (
          <View style={styles.card}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCheck}>✅</Text>
              <Text style={styles.reviewTitle}>Review your application</Text>
            </View>

            {[
              ['Register as', roleLabel],
              ['Full name', form.fullName || '—'],
              ['Mobile number', form.mobile || '—'],
              ['Email address', form.email || '—'],
              ...(role !== 'investor' ? [['Username', form.username || '—']] : []),
              ...(role === 'investor'
                ? [
                    ['Date of birth', form.dob || '—'],
                    ['Aadhaar number', form.aadhaar || '—'],
                    ['Address', form.address || '—'],
                    ['City', form.city || '—'],
                    ['State', form.stateName || '—'],
                    ['PIN code', form.pin || '—'],
                  ]
                : []),
              ['Branch', form.branchName || '—'],
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
                I agree to the <Text style={styles.agreeLink}>Terms & Conditions</Text>
              </Text>
            </TouchableOpacity>

            {errorMessage && (
              <View style={local.errorBox}>
                <Text style={local.errorText}>{errorMessage}</Text>
              </View>
            )}
          </View>
        )}

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
        onRequestClose={() => {}}>
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

              <View style={[styles.checklistItem, {marginBottom: 0}]}>
                <Text style={styles.checklistCheck}>✓</Text>
                <View style={styles.checklistTextWrap}>
                  <Text style={styles.checklistTitle}>3. Login Enabled</Text>
                  <Text style={styles.checklistDesc}>
                    You can log in using your Investor ID and registered mobile number.
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