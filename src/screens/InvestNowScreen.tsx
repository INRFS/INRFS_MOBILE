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
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestNowScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
// 'review' is a sub-step shown after the UTR is entered and before final
// submit — mirrors the web portal's "Review Your Investment" screen.
type Step = 'details' | 'payment' | 'review' | 'confirmation';

// Default interest rate shown on this form. Flat across every tenure —
// the admin can adjust it per-request when approving from Admin > Investments.
const DEFAULT_INTEREST_RATE = 3;

const TENURE_OPTIONS = [
  {months: 3},
  {months: 6},
  {months: 12},
  {months: 24},
  {months: 36},
];

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2500000];

const BOND = {
  min: 10000,
  max: 2500000,
  upiId: 'inrfs@ybl',
};

// The step indicator only shows 3 nodes (Details / Payment / Confirmation).
// 'review' is visually grouped under 'payment' — same as the web portal,
// where "Review Your Investment" appears after the Payment step is marked
// done but before Confirmation.
const STEP_LABELS: {key: 'details' | 'payment' | 'confirmation'; label: string}[] = [
  {key: 'details', label: 'Investment Details'},
  {key: 'payment', label: 'Payment'},
  {key: 'confirmation', label: 'Confirmation'},
];

const indicatorKeyFor = (step: Step): 'details' | 'payment' | 'confirmation' =>
  step === 'review' ? 'payment' : step;

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const InvestNowScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};
  const {investors, submitInvestmentRequest} = useAppData();
  const investorName = investors.find(inv => inv.id === investorId)?.name || investorId || 'Investor';

  const [step, setStep] = useState<Step>('details');
  const [amountText, setAmountText] = useState('500000');
  const [tenureIndex, setTenureIndex] = useState(2); // default: 12 months
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const amount = Number(amountText.replace(/[^0-9]/g, '')) || 0;
  const tenure = TENURE_OPTIONS[tenureIndex];
  const rate = DEFAULT_INTEREST_RATE; // % PER MONTH, not annual
  const stepIndex = STEP_LABELS.findIndex(s => s.key === indicatorKeyFor(step));

  // Rate is a flat monthly rate (e.g. 3% per month), matching the web
  // portal: Monthly Interest = Principal x rate%, Total Interest = Monthly x
  // tenure months, Maturity = Principal + Total Interest.
  const {totalInterest, monthlyPayout, maturityValue} = useMemo(() => {
    const monthly = amount * (rate / 100);
    const total = monthly * tenure.months;
    return {
      totalInterest: total,
      monthlyPayout: monthly,
      maturityValue: amount + total,
    };
  }, [amount, tenure, rate]);

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

  // Step 2 (Payment) -> Review: just needs the UTR, no screenshot required.
  const goToReview = () => {
    if (!transactionRef.trim()) {
      Alert.alert('Missing details', 'Please enter the transaction reference number.');
      return;
    }
    setStep('review');
  };

  const handleSubmit = () => {
    setSubmitting(true);

    // Submit for admin approval — do NOT generate a bond here. The bond is
    // only created once an admin approves this request from
    // Admin > Investments (see AdminInvestmentsScreen / approveInvestmentRequest).
    setTimeout(() => {
      setSubmitting(false);
      console.log('Submit Investment Request', {
        investorId,
        investorName,
        amount,
        tenureMonths: tenure.months,
        rate,
        transactionRef,
      });

      submitInvestmentRequest({
        investorId,
        investorName,
        amount,
        tenureMonths: tenure.months,
        interestRate: rate,
        transactionRef,
        screenshotUri: null,
      });

      setStep('confirmation');
    }, 500);
  };

  // ---------- Step indicator ----------
  // On the 'review' sub-step, both Details and Payment show as done
  // (checkmarks) — matches the web portal's "Review Your Investment" view.
  const doneCount = step === 'review' ? 2 : stepIndex;
  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {STEP_LABELS.map((s, i) => {
        const done = i < doneCount;
        const active = i === doneCount && step !== 'review';
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
        <Text style={styles.summaryLabel}>Tenure</Text>
        <Text style={styles.summaryValue}>{tenure.months} months</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Initial Rate</Text>
        <Text style={styles.summaryValue}>{rate}% per month</Text>
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
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>⚠️</Text>
        <Text style={styles.infoBannerText}>
          <Text style={styles.infoBannerBold}>Initial interest rate: {rate}% per month.</Text>{' '}
          Your branch admin will review and may adjust the rate before final approval. Your
          investment becomes active only after admin approval.
        </Text>
      </View>

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

  // ---------- Step 2: Payment (UTR only — screenshot upload removed) ----------
  const renderPaymentStep = () => {
    const canContinue = !!transactionRef.trim();
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

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('details')}>
            <Text style={styles.cancelBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmBtn, !canContinue && styles.confirmBtnDisabled]}
            activeOpacity={0.85}
            onPress={goToReview}
            disabled={!canContinue}>
            <Text style={styles.confirmBtnText}>Continue to Review</Text>
            <Icon name="chevron-right" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ---------- Step 2b: Review Your Investment ----------
  const renderReviewStep = () => (
    <>
      <View style={styles.reviewCard}>
        <Text style={styles.reviewCardTitle}>Review Your Investment</Text>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Principal Amount</Text>
          <Text style={styles.reviewValue}>{formatINR(amount)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Initial Rate</Text>
          <Text style={styles.reviewValue}>{rate}% per month</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Tenure</Text>
          <Text style={styles.reviewValue}>{tenure.months} months</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Expected Monthly Interest</Text>
          <Text style={styles.reviewValue}>{formatINR(monthlyPayout)}</Text>
        </View>
        <View style={[styles.reviewRow, {borderBottomWidth: 0}]}>
          <Text style={styles.reviewLabel}>Transaction Ref</Text>
          <Text style={styles.reviewValue}>{transactionRef}</Text>
        </View>
      </View>

      <View style={styles.reviewNote}>
        <Text style={styles.reviewNoteText}>
          After you submit, your branch admin will review this request. They may adjust the
          interest rate. Your investment will be activated and a bond certificate generated only
          after admin approval.
        </Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setStep('payment')}>
          <Text style={styles.cancelBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, submitting && styles.confirmBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.confirmBtnText}>
            {submitting ? 'Submitting...' : 'Submit Investment Request'}
          </Text>
          {!submitting && <Icon name="chevron-right" size={19} color="#fff" />}
        </TouchableOpacity>
      </View>
    </>
  );

  // ---------- Step 3: Confirmation ----------
  const renderConfirmationStep = () => (
    <>
      <View style={styles.confirmationBox}>
        <View style={styles.confirmIconWrap}>
          <Icon name="check-circle-outline" size={54} color="#16A34A" />
        </View>
        <Text style={styles.confirmationTitle}>Investment Submitted!</Text>
        <Text style={styles.confirmationSubtitle}>
          Your investment is pending admin verification. You'll be notified once approved, and the
          bond will be generated only after approval.
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
        {step === 'review' && renderReviewStep()}
        {step === 'confirmation' && renderConfirmationStep()}
      </ScrollView>

      <BottomTabBar active="Invest" navigation={navigation} investorId={investorId} />
    </SafeAreaView>
  );
};

export default InvestNowScreen;