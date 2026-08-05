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
import {styles} from '../styles/RegistrartionScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const steps = ['Personal info', 'Review & submit'];

// Matches the states currently offered on the web portal.
const STATE_OPTIONS = ['Telangana', 'Andhra Pradesh', 'Chennai'];

// Matches the branches currently offered on the web portal.
const BRANCH_OPTIONS = ['Vijayawada', 'Hyderabad', 'Bengaluru', 'Chennai'];

const RegistrationScreen = ({navigation}: any) => {
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

  // Uploaded document photos (Aadhaar photo + passport size photo)
  // const [aadhaarPhoto, setAadhaarPhoto] = useState<string | null>(null);
  // const [passportPhoto, setPassportPhoto] = useState<string | null>(null);

  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const [agreed, setAgreed] = useState(false);

  // Shown after Submit. No Investor ID is generated here — that only
  // happens once a Branch Admin approves the request (see admin approval
  // flow). Until then the request sits as "Pending".
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
    // TODO: replace with real "submit registration for admin review" API
    // call once a backend exists. The Investor ID is generated server-side
    // only after a Branch Admin approves this request.
    console.log('Submit registration for admin review', form);
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>IN</Text>
          </View>
          <Text style={styles.brand}>INRFS</Text>
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
                  <Text style={styles.stepLabel}>{label}</Text>
                </View>
                {idx < steps.length - 1 && <View style={styles.stepLine} />}
              </React.Fragment>
            );
          })}
        </View>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Full name *</Text>
            <TextInput
              style={styles.input}
              placeholder="As per Aadhaar card"
              placeholderTextColor="#9CA3AF"
              value={form.fullName}
              onChangeText={v => update('fullName', v)}
            />
            <Text style={styles.label}>Mobile number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={form.mobile}
              onChangeText={v => update('mobile', v)}
            />
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              value={form.email}
              onChangeText={v => update('email', v)}
            />
            <Text style={styles.label}>Date of birth *</Text>
            <TextInput
              style={styles.input}
              placeholder="dd-mm-yyyy"
              placeholderTextColor="#9CA3AF"
              value={form.dob}
              onChangeText={v => update('dob', v)}
            />
            <Text style={styles.label}>Aadhaar number *</Text>
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              value={form.aadhaar}
              onChangeText={v => update('aadhaar', v)}
            />

            

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              placeholderTextColor="#9CA3AF"
              value={form.address}
              onChangeText={v => update('address', v)}
            />
            <View style={styles.row3}>
              <View style={styles.col}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                  value={form.city}
                  onChangeText={v => update('city', v)}
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>PIN code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="400001"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  value={form.pin}
                  onChangeText={v => update('pin', v)}
                />
              </View>
            </View>

            <Text style={styles.label}>State</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setStateDropdownOpen(prev => !prev);
                setBranchDropdownOpen(false);
              }}>
              <Text style={{color: form.state ? '#111827' : '#9CA3AF'}}>
                {form.state || 'Select state'}
              </Text>
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

            <Text style={styles.label}>Branch *</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setBranchDropdownOpen(prev => !prev);
                setStateDropdownOpen(false);
              }}>
              <Text style={{color: form.branch ? '#111827' : '#9CA3AF'}}>
                {form.branch || 'Select branch'}
              </Text>
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
              <Text style={styles.prevBtnText}>← Previous</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.prevBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.prevBtnText}>← Back to login</Text>
            </TouchableOpacity>
          )}

          {step < 2 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextBtnText}>Next step →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextBtn, !agreed && styles.nextBtnDisabled]}
              disabled={!agreed}
              onPress={handleSubmit}>
              <Text style={styles.nextBtnText}>Submit application →</Text>
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