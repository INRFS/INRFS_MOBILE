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

  // Branches available for the Investor flow are filtered by the
  // selected state. Admin / Super Admin can pick from every branch.
  const availableBranches = useMemo(() => {
    if (role !== 'investor' || !form.stateId) return BRANCH_OPTIONS;
    return BRANCH_OPTIONS.filter(b => b.stateId === form.stateId);
  }, [role, form.stateId]);

  const selectRole = (next: Role) => {
    setRole(next);
    setErrorMessage(null);
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
    if (!form.fullName.trim()) return 'Full name is required.';
    if (!form.mobile.trim()) return 'Mobile number is required.';
    if (!form.password.trim()) return 'Password is required.';

    if (role === 'investor') {
      if (!form.dob.trim()) return 'Date of birth is required.';
      if (!toApiDate(form.dob)) return 'Date of birth must be in DD-MM-YYYY format.';
      if (!form.aadhaar.trim()) return 'Aadhaar number is required.';
      if (!form.address.trim()) return 'Address is required.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.pin.trim()) return 'PIN code is required.';
      if (!form.stateId) return 'Please select a state.';
      if (!form.branchId) return 'Please select a branch.';
    } else {
      if (!form.username.trim()) return 'Username is required.';
      if (!form.branchId) return 'Please select a branch.';
    }
    return null;
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
                onChangeText={v => update('fullName', v)}
              />
            </View>

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
                value={form.mobile}
                onChangeText={v => update('mobile', v)}
              />
            </View>

            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email-outline" size={18} color="#3B5BFF" />
              <TextInput
                style={styles.inputField}
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={form.email}
                onChangeText={v => update('email', v)}
              />
            </View>

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
                onChangeText={v => update('password', v)}
              />
            </View>

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
                    onChangeText={v => update('username', v)}
                  />
                </View>
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
                    value={form.dob}
                    onChangeText={v => update('dob', v)}
                  />
                  <Icon name="calendar-month-outline" size={18} color="#9CA3AF" />
                </View>

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
                    value={form.aadhaar}
                    onChangeText={v => update('aadhaar', v)}
                  />
                </View>

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
                    onChangeText={v => update('address', v)}
                  />
                </View>

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
                        onChangeText={v => update('city', v)}
                      />
                    </View>
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
                        value={form.pin}
                        onChangeText={v => update('pin', v)}
                      />
                    </View>
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
                      setBranchDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{opt.name}</Text>
                  </TouchableOpacity>
                ))}
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