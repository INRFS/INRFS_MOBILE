import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
 
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestNowScreen.styles';
import {addInvestment} from './MyInvestmentsscreen';
import {SafeAreaView} from 'react-native-safe-area-context';
type Step = 'details' | 'payment' | 'confirmation';

const TENURE_OPTIONS = [
  {months: 6, rate: 11},
  {months: 12, rate: 12},
  {months: 24, rate: 12.5},
  {months: 36, rate: 13},
];

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2500000];

const BOND = {
  min: 10000,
  max: 2500000,
  upiId: 'inrfs@ybl',
};

const STEP_LABELS: {key: Step; label: string}[] = [
  {key: 'details', label: 'Investment Details'},
  {key: 'payment', label: 'Payment'},
  {key: 'confirmation', label: 'Confirmation'},
];

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const InvestNowScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  const [step, setStep] = useState<Step>('details');
  const [amountText, setAmountText] = useState('500000');
  const [tenureIndex, setTenureIndex] = useState(1); // default: 12 months
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const amount = Number(amountText.replace(/[^0-9]/g, '')) || 0;
  const tenure = TENURE_OPTIONS[tenureIndex];
  const stepIndex = STEP_LABELS.findIndex(s => s.key === step);

  const {totalInterest, monthlyPayout, maturityValue} = useMemo(() => {
    const years = tenure.months / 12;
    const interest = amount * (tenure.rate / 100) * years;
    return {
      totalInterest: interest,
      monthlyPayout: interest / tenure.months,
      maturityValue: amount + interest,
    };
  }, [amount, tenure]);

  const goToPayment = () => {
    if (amount < BOND.min || amount > BOND.max) {
      Alert.alert(
        'Check amount',
        `Investment amount must be between ${formatINR(BOND.min)} and ${formatINR(
          BOND.max,
        )}.`,
      );
      return;
    }
    setStep('payment');
  };

  const pickScreenshot = () => {
    launchImageLibrary({mediaType: 'photo', quality: 0.7}, response => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets && response.assets[0];
      if (asset?.uri) setScreenshotUri(asset.uri);
    });
  };

  const handleSubmit = () => {
    if (!transactionRef.trim()) {
      Alert.alert('Missing details', 'Please enter the transaction reference number.');
      return;
    }
    if (!screenshotUri) {
      Alert.alert('Missing screenshot', 'Please upload your payment screenshot.');
      return;
    }
    setSubmitting(true);
    // TODO: replace with your real "submit for admin verification" API call.
    // Once you have a backend, do this inside the API success callback instead.
    setTimeout(() => {
      setSubmitting(false);
      console.log('Submit Investment', {
        investorId,
        amount,
        tenureMonths: tenure.months,
        rate: tenure.rate,
        transactionRef,
        screenshotUri,
      });

      // Record the investment so it immediately shows up on My Investments.
      addInvestment({
        amount,
        rate: tenure.rate,
        tenureMonths: tenure.months,
      });

      setStep('confirmation');
    }, 500);
  };

  // ---------- Step indicator ----------
  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {STEP_LABELS.map((s, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <React.Fragment key={s.key}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, (done || active) && styles.stepCircleActive]}>
                {done ? (
                  <Icon name="check" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepCircleText, active && styles.stepCircleTextActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{s.label}</Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View style={[styles.stepLine, done && styles.stepLineActive]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ---------- Shared investment summary card ----------
  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>INVESTMENT SUMMARY</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Principal Amount</Text>
        <Text style={styles.summaryValue}>{formatINR(amount)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Annual Interest Rate</Text>
        <Text style={styles.summaryValue}>{tenure.rate}% per annum</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tenure</Text>
        <Text style={styles.summaryValue}>{tenure.months} months</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Monthly Interest</Text>
        <Text style={styles.summaryValue}>{formatINR(monthlyPayout)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total Interest</Text>
        <Text style={styles.summaryValue}>{formatINR(totalInterest)}</Text>
      </View>

      <View style={styles.summaryDivider} />

      <View style={styles.summaryRow}>
        <Text style={styles.maturityLabel}>Maturity Amount</Text>
        <Text style={styles.maturityValue}>{formatINR(maturityValue)}</Text>
      </View>
    </View>
  );

  // ---------- Step 1: Investment Details ----------
  const renderDetailsStep = () => (
    <>
      <Text style={styles.fieldLabel}>Investment Amount (₹)</Text>
      <View style={styles.amountInputWrap}>
        <Text style={styles.rupeeSymbol}>₹</Text>
        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          value={amountText}
          onChangeText={setAmountText}
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.quickAmountRow}>
        {QUICK_AMOUNTS.map(a => {
          const active = amount === a;
          return (
            <TouchableOpacity
              key={a}
              style={[styles.quickAmountChip, active && styles.quickAmountChipActive]}
              onPress={() => setAmountText(String(a))}>
              <Text
                style={[styles.quickAmountChipText, active && styles.quickAmountChipTextActive]}>
                {formatINR(a)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>Min: {formatINR(BOND.min)}</Text>
        <Text style={styles.minMaxText}>Max: {formatINR(BOND.max)}</Text>
      </View>

      <Text style={styles.fieldLabel}>Investment Tenure</Text>
      <View style={styles.tenureGrid}>
        {TENURE_OPTIONS.map((t, i) => {
          const active = i === tenureIndex;
          return (
            <TouchableOpacity
              key={t.months}
              style={[styles.tenureCard, active && styles.tenureCardActive]}
              activeOpacity={0.8}
              onPress={() => setTenureIndex(i)}>
              <Text style={[styles.tenureMonths, active && styles.tenureMonthsActive]}>
                {t.months}
              </Text>
              <Text style={styles.tenureMonthsLabel}>Months</Text>
              <Text style={styles.tenureRate}>{t.rate}% p.a.</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {renderSummaryCard()}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85} onPress={goToPayment}>
          <Text style={styles.confirmBtnText}>Continue to Payment</Text>
          <Icon name="chevron-right" size={19} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );

  // ---------- Step 2: Payment ----------
  const renderPaymentStep = () => {
    const canSubmit = !!transactionRef.trim() && !!screenshotUri && !submitting;
    return (
      <>
        <View style={styles.upiBox}>
          <Text style={styles.upiPayLabel}>Pay via UPI</Text>
          <Text style={styles.upiIdText}>UPI ID: {BOND.upiId}</Text>
          <Text style={styles.upiAmountText}>{formatINR(amount)}</Text>
        </View>

        <Text style={styles.fieldLabel}>Transaction Reference Number</Text>
        <TextInput
          style={styles.textInput}
          value={transactionRef}
          onChangeText={setTransactionRef}
          placeholder="Enter UTR / Transaction ID"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.fieldLabel}>Upload Payment Screenshot</Text>
        <TouchableOpacity
          style={[styles.uploadBox, screenshotUri && styles.uploadBoxFilled]}
          activeOpacity={0.8}
          onPress={pickScreenshot}>
          {screenshotUri ? (
            <Image source={{uri: screenshotUri}} style={styles.uploadPreview} />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={26} color="#6B7280" />
              <Text style={styles.uploadText}>Click to upload payment screenshot</Text>
            </>
          )}
        </TouchableOpacity>

        {renderSummaryCard()}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('details')}>
            <Text style={styles.cancelBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, !canSubmit && styles.confirmBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={!canSubmit}>
            <Text style={styles.confirmBtnText}>
              {submitting ? 'Submitting...' : 'Submit Investment'}
            </Text>
            {!submitting && <Icon name="chevron-right" size={19} color="#fff" />}
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ---------- Step 3: Confirmation ----------
  const renderConfirmationStep = () => (
    <>
      <View style={styles.confirmationBox}>
        <View style={styles.confirmIconWrap}>
          <Icon name="check-circle-outline" size={54} color="#16A34A" />
        </View>
        <Text style={styles.confirmationTitle}>Investment Submitted!</Text>
        <Text style={styles.confirmationSubtitle}>
          Your investment is pending admin verification. You'll be notified once approved.
        </Text>

        <TouchableOpacity
          style={styles.dashboardBtn}
          onPress={() => navigation.navigate('InvestorDashboard', {investorId})}>
          <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewInvestmentsBtn}
          onPress={() => navigation.navigate('MyInvestments', {investorId})}>
          <Text style={styles.viewInvestmentsBtnText}>View Investments</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={{uri: 'https://i.pravatar.cc/64?img=5'}} style={styles.avatar} />
          <Text style={styles.headerTitle}>INRFS</Text>
        </View>
        <TouchableOpacity>
          <Icon name="bell-outline" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
            <Icon name="arrow-left" size={20} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Invest Now</Text>
        </View>

        {renderStepIndicator()}

        {step === 'details' && renderDetailsStep()}
        {step === 'payment' && renderPaymentStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </ScrollView>

      <BottomTabBar active="Invest" navigation={navigation} />
    </SafeAreaView>
  );
};

export default InvestNowScreen;