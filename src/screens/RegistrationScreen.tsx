import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {styles} from '../styles/RegistrartionScreen.styles';

type DocKey = 'aadhaarFront' | 'aadhaarBack' | 'pan' | 'photo' | 'passbook';

const docs: {key: DocKey; label: string}[] = [
  {key: 'aadhaarFront', label: 'Aadhaar card (front)'},
  {key: 'aadhaarBack', label: 'Aadhaar card (back)'},
  {key: 'pan', label: 'PAN card'},
  {key: 'photo', label: 'Passport photo'},
  {key: 'passbook', label: 'Bank passbook'},
];

const steps = ['Personal info', 'Upload documents', 'Review & submit'];

const RegistrationScreen = ({navigation}: any) => {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dob: '',
    aadhaar: '',
    pan: '',
    address: '',
    city: '',
    state: '',
    pin: '',
  });

  type UploadedFile = {uri: string; fileName: string} | null;

  const [uploaded, setUploaded] = useState<Record<DocKey, UploadedFile>>({
    aadhaarFront: null,
    aadhaarBack: null,
    pan: null,
    photo: null,
    passbook: null,
  });

  const [agreed, setAgreed] = useState(false);

  const update = (key: keyof typeof form, value: string) =>
    setForm(prev => ({...prev, [key]: value}));

  const requestGalleryPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const granted = await PermissionsAndroid.request(permission);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

 const pickImage = async (key: DocKey) => {
  try {
    Alert.alert('Debug', 'pickImage called for ' + key);

    const hasPermission = await requestGalleryPermission();
    Alert.alert('Debug', 'Permission result: ' + hasPermission);

    if (!hasPermission) {
      Alert.alert('Permission required', 'Please allow gallery access to upload documents.');
      return;
    }

    launchImageLibrary(
      {mediaType: 'photo', selectionLimit: 1, quality: 0.8},
      response => {
        Alert.alert('Debug', 'Picker response: ' + JSON.stringify(response).slice(0, 200));

        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Picker error', response.errorMessage || response.errorCode);
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri) {
          setUploaded(prev => ({
            ...prev,
            [key]: {uri: asset.uri!, fileName: asset.fileName || 'image.jpg'},
          }));
        }
      },
    );
  } catch (err: any) {
    Alert.alert('Caught error', err?.message || String(err));
  }
};

  const handleSubmit = () => {
    if (!agreed) return;
    navigation.replace('Login');
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
            <Text style={styles.label}>PAN number *</Text>
            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              value={form.pan}
              onChangeText={v => update('pan', v)}
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
            <TextInput
              style={styles.input}
              placeholder="Select state"
              placeholderTextColor="#9CA3AF"
              value={form.state}
              onChangeText={v => update('state', v)}
            />
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            {/* <TouchableOpacity
  style={{padding: 16, backgroundColor: '#eee', marginBottom: 10, borderRadius: 10}}
  onPress={() => Alert.alert('Test', 'Button works!')}>
  <Text>Tap me to test</Text>
</TouchableOpacity> */}
            <Text style={styles.uploadHint}>
              Upload clear, legible scans. Max 5MB each.
            </Text>
            {docs.map(doc => {
              const file = uploaded[doc.key];
              return (
                <TouchableOpacity
                  key={doc.key}
                  style={[styles.uploadRow, file && styles.uploadRowDone]}
                  onPress={() => pickImage(doc.key)}>
                  {file ? (
                    <Image source={{uri: file.uri}} style={styles.thumb} />
                  ) : (
                    <Text style={styles.uploadIcon}>📤</Text>
                  )}
                 <View style={styles.uploadTextWrap}>
  <Text style={styles.uploadLabel}>{doc.label}</Text>
  <Text style={styles.uploadSub} numberOfLines={1}>
    {file ? file.fileName : 'Tap to choose from gallery — PNG, JPG'}
  </Text>
</View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCheck}>✅</Text>
              <Text style={styles.reviewTitle}>Review your application</Text>
            </View>
            {[
              ['Full name', form.fullName || '—'],
              ['Mobile', form.mobile || '—'],
              ['Email', form.email || '—'],
              ['PAN', form.pan || '—'],
              ['Aadhaar', form.aadhaar || '—'],
              [
                'Address',
                [form.address, form.city, form.state, form.pin]
                  .filter(Boolean)
                  .join(', ') || '—',
              ],
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

          {step < 3 ? (
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
    </SafeAreaView>
  );
};

export default RegistrationScreen;