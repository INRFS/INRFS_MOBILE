import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppData} from '../navigation/AppNavigator';
import {styles} from '../styles/RegistrartionScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const steps = ['Personal info', 'Review & submit'];

// Matches the states currently offered on the web portal.
const STATE_OPTIONS = ['Telangana', 'Andhra Pradesh', 'Chennai'];

// Matches the branches currently offered on the web portal.
const BRANCH_OPTIONS = ['Vijayawada', 'Hyderabad', 'Bengaluru', 'Chennai'];

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

const RegistrationScreen = ({navigation}: any) => {
  const {registerInvestor} = useAppData();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    aadhaar: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    branch: '',
  });

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const [agreed, setAgreed] = useState(false);

  // Shown after Submit. No Investor ID is generated here — that only
  // happens once a Branch Admin approves the request (see admin approval
  // flow). Until then the request sits as "Pending". Per team decision,
  // the ID is NOT surfaced to the investor at this step even in demo mode
  // — it stays hidden until the real approval/notification flow delivers
  // it, matching production behavior.
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({...prev, [key]: value}));

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

  const handleSubmit = () => {
    if (!agreed) return;
    // Actually persist the registration into the shared app data so it
    // shows up correctly (name, mobile, branch, address, etc.) on the
    // Investor Management and KYC Approval screens, instead of being
    // dropped on the floor with a console.log. registerInvestor() still
    // returns the real Investor ID internally (needed so admin approval /
    // login validation works later) — it's just no longer shown here.
    registerInvestor({
      name: form.fullName,
      mobile: form.mobile,
      email: form.email,
      dob: form.dob,
      aadhaar: form.aadhaar,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pin,
      branch: form.branch,
    });
    setSubmittedModalVisible(true);
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
              <Text style={form.state ? styles.inputField : styles.inputPlaceholder}>
                {form.state || 'Select state'}
              </Text>
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {stateDropdownOpen && (
              <View style={styles.dropdownList}>
                {STATE_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.dropdownOption,
                      form.state === opt && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      update('state', opt);
                      setStateDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <Text style={form.branch ? styles.inputField : styles.inputPlaceholder}>
                {form.branch || 'Select branch'}
              </Text>
              <Icon name="chevron-down" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            {branchDropdownOpen && (
              <View style={styles.dropdownList}>
                {BRANCH_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.dropdownOption,
                      form.branch === opt && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      update('branch', opt);
                      setBranchDropdownOpen(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{opt}</Text>
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
              ['Full name', form.fullName || '—'],
              ['Mobile number', form.mobile || '—'],
              ['Email address', form.email || '—'],
              ['Date of birth', form.dob || '—'],
              ['Aadhaar number', form.aadhaar || '—'],
              ['Address', form.address || '—'],
              ['City', form.city || '—'],
              ['State', form.state || '—'],
              ['PIN code', form.pin || '—'],
              ['Branch', form.branch || '—'],
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
          </View>
        )}

        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(step - 1)}>
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
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextBtnText}>Next step</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, !agreed && styles.nextBtnDisabled]}
              disabled={!agreed}
              onPress={handleSubmit}>
              <Text style={styles.nextBtnText}>Submit application</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
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