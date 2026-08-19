import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestNowScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';

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

// NEW: banks shown in the "Select Bank to Pay From" dropdown when Net
// Banking is chosen — mirrors the list on the web portal's Payment step.
const BANK_OPTIONS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Canara Bank',
  'Union Bank',
];

// NEW: static company bank account shown once a bank is chosen for Net
// Banking — mirrors the "Account Name / Bank / Account No / IFSC / Amount"
// card on the web portal's Payment step.
const COMPANY_BANK_ACCOUNT = {
  accountName: 'INRFS Pvt Ltd',
  accountNo: '123456789012',
  ifsc: 'INRF0001234',
};

type PaymentMethod = 'upi' | 'netbanking';

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

  // FIX: previously fell back to `investorId` itself when no investor
  // record matched, so a manually-typed demo/login ID (e.g. "INV-567")
  // got treated as if it were the person's name and flowed downstream
  // into submitInvestmentRequest as investorName — that's what was
  // creating duplicate "ghost" cards on the Investor Registry screen.
  // Now it falls back to a generic placeholder instead of the raw ID.
  const matchedInvestor = investors.find(inv => inv.id === investorId);
  const investorName = matchedInvestor?.name || 'Investor';
  // FIX: branch was never being read here at all, so submitInvestmentRequest
  // was called without it — that's why the pending card on Admin >
  // Investment Management always showed "—" for branch, even when the
  // investor had a real registered branch. Same lookup pattern as
  // investorName above, just for branch.
  const investorBranch = matchedInvestor?.branch;

  const [step, setStep] = useState<Step>('details');
  const [amountText, setAmountText] = useState('500000');
  const [tenureIndex, setTenureIndex] = useState(2); // default: 12 months
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // NEW: Payment step now supports UPI or Net Banking, matching the web
  // portal. UPI is selected by default. Net Banking additionally requires
  // the investor to choose a bank from the dropdown.
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // NEW: controls the "Confirm Your Bank Details" modal shown between
  // Investment Details and Payment — mirrors the web portal's popup that
  // appears on "Continue to Payment" (see attached screenshot).
  const [showBankModal, setShowBankModal] = useState(false);

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

  // CHANGED: "Continue to Payment" no longer jumps straight to the Payment
  // step. It now opens the bank-details confirmation modal first — same as
  // the web portal. The modal itself decides whether to go to Profile
  // (Update Bank Details) or continue into Payment (Continue).
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
    setShowBankModal(true);
  };

  // NEW: "Update Bank Details" button inside the modal — closes the modal
  // and sends the investor to their Profile screen to update bank info.
  // Adjust the route name below if your Profile screen is registered
  // under a different name in the navigator.
  const handleUpdateBankDetails = () => {
    setShowBankModal(false);
    navigation.navigate('Profile', {investorId});
  };

  // NEW: "Continue" button inside the modal — closes the modal and moves
  // the wizard into the actual Payment step.
  const handleContinueToPayment = () => {
    setShowBankModal(false);
    setStep('payment');
  };

  // Step 2 (Payment) -> Review: needs the UTR, and if Net Banking is the
  // chosen method, also needs a bank selected.
  const goToReview = () => {
    if (paymentMethod === 'netbanking' && !selectedBank) {
      Alert.alert('Missing details', 'Please select a bank to pay from.');
      return;
    }
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
        // FIX: pass the investor's real registered branch through so the
        // pending InvestmentRequest carries it, instead of leaving it
        // undefined (which rendered as "—" on the admin screen).
        branch: investorBranch,
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

  // ---------- Step 2: Payment ----------
  // Supports UPI (existing flow) and Net Banking (bank dropdown + static
  // company account details card), matching the web portal.
  const renderPaymentStep = () => {
    const canContinue =
      !!transactionRef.trim() && (paymentMethod === 'upi' || !!selectedBank);

    return (
      <>
        <Text style={styles.fieldLabel}>Select Payment Method</Text>
        <View style={styles.paymentMethodRow}>
          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              paymentMethod === 'upi' && styles.paymentMethodOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              setPaymentMethod('upi');
              setShowBankDropdown(false);
            }}>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'upi' && styles.radioCircleActive,
              ]}>
              {paymentMethod === 'upi' && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.paymentMethodLabel,
                paymentMethod === 'upi' && styles.paymentMethodLabelActive,
              ]}>
              UPI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              paymentMethod === 'netbanking' && styles.paymentMethodOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() => setPaymentMethod('netbanking')}>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'netbanking' && styles.radioCircleActive,
              ]}>
              {paymentMethod === 'netbanking' && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.paymentMethodLabel,
                paymentMethod === 'netbanking' && styles.paymentMethodLabelActive,
              ]}>
              Net Banking
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'upi' && (
          <View style={styles.upiBox}>
            <Text style={styles.upiPayLabel}>Pay via UPI</Text>
            <Text style={styles.upiIdText}>UPI ID: {BOND.upiId}</Text>
            <Text style={styles.upiAmountText}>{formatINR(amount)}</Text>
          </View>
        )}

        {paymentMethod === 'netbanking' && (
          <>
            <Text style={styles.fieldLabel}>Select Bank to Pay From</Text>
            <TouchableOpacity
              style={styles.bankSelectBox}
              activeOpacity={0.85}
              onPress={() => setShowBankDropdown(v => !v)}>
              <Text
                style={[
                  styles.bankSelectText,
                  !selectedBank && styles.bankSelectPlaceholder,
                ]}>
                {selectedBank || 'Choose Bank'}
              </Text>
              <Icon
                name={showBankDropdown ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showBankDropdown && (
              <View style={styles.bankDropdownList}>
                {BANK_OPTIONS.map((bank, i) => (
                  <TouchableOpacity
                    key={bank}
                    style={[
                      styles.bankDropdownItem,
                      i === BANK_OPTIONS.length - 1 && styles.bankDropdownItemLast,
                    ]}
                    onPress={() => {
                      setSelectedBank(bank);
                      setShowBankDropdown(false);
                    }}>
                    <Text style={styles.bankDropdownItemText}>{bank}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {!!selectedBank && (
              <View style={styles.bankDetailsCard}>
                <Text style={styles.bankDetailsRow}>
                  <Text style={styles.bankDetailsLabel}>Account Name: </Text>
                  {COMPANY_BANK_ACCOUNT.accountName}
                </Text>
                <Text style={styles.bankDetailsRow}>
                  <Text style={styles.bankDetailsLabel}>Bank: </Text>
                  {selectedBank}
                </Text>
                <Text style={styles.bankDetailsRow}>
                  <Text style={styles.bankDetailsLabel}>Account No: </Text>
                  {COMPANY_BANK_ACCOUNT.accountNo}
                </Text>
                <Text style={styles.bankDetailsRow}>
                  <Text style={styles.bankDetailsLabel}>IFSC: </Text>
                  {COMPANY_BANK_ACCOUNT.ifsc}
                </Text>
                <Text style={styles.bankDetailsRow}>
                  <Text style={styles.bankDetailsLabel}>Amount: </Text>
                  {formatINR(amount)}
                </Text>
              </View>
            )}
          </>
        )}

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
        <Text style={styles.reviewCardTitle}>Review Investment Details</Text>

        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Principal Amount</Text>
          <Text style={styles.reviewValue}>{formatINR(amount)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Tenure</Text>
          <Text style={styles.reviewValue}>{tenure.months} months</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Initial Rate</Text>
          <Text style={styles.reviewValue}>{rate}% per month</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Expected Monthly Interest</Text>
          <Text style={styles.reviewValue}>{formatINR(monthlyPayout)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Total Interest (est.)</Text>
          <Text style={styles.reviewValue}>{formatINR(totalInterest)}</Text>
        </View>
        <View style={styles.reviewRow}>
          <Text style={styles.reviewLabel}>Payment Method</Text>
          <Text style={styles.reviewValue}>
            {paymentMethod === 'netbanking' ? 'Net Banking' : 'UPI'}
          </Text>
        </View>
        {paymentMethod === 'netbanking' && (
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Bank Paid From</Text>
            <Text style={styles.reviewValue}>{selectedBank}</Text>
          </View>
        )}
        <View style={[styles.reviewRow, {borderBottomWidth: 0}]}>
          <Text style={styles.reviewLabel}>Transaction Ref / UTR</Text>
          <Text style={styles.reviewValue}>{transactionRef}</Text>
        </View>
      </View>

      <View style={styles.reviewNote}>
        <Text style={styles.reviewNoteText}>
          <Text style={styles.infoBannerBold}>Please review carefully.</Text> Once submitted,
          your request will be sent to your branch admin for review and approval, and the rate
          may be adjusted at that stage. Payouts will be made only to the bank account on your
          profile.
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
            {submitting ? 'Submitting...' : 'Submit Investment'}
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

  // ---------- Bank details confirmation modal ----------
  const renderBankDetailsModal = () => (
    <Modal
      visible={showBankModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowBankModal(false)}>
      <View style={styles.bankModalOverlay}>
        <View style={styles.bankModalCard}>
          <View style={styles.bankModalIconWrap}>
            <Icon name="bank-outline" size={28} color="#2563EB" />
          </View>
          <Text style={styles.bankModalTitle}>Confirm Your Bank Details</Text>
          <Text style={styles.bankModalSubtitle}>
            Your interest and maturity amount will be credited to the bank account on your
            profile. Please make sure it's up to date before proceeding.
          </Text>

          <TouchableOpacity
            style={styles.bankModalUpdateBtn}
            activeOpacity={0.85}
            onPress={handleUpdateBankDetails}>
            <Text style={styles.bankModalUpdateBtnText}>Update Bank Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bankModalContinueBtn}
            activeOpacity={0.85}
            onPress={handleContinueToPayment}>
            <Text style={styles.bankModalContinueBtnText}>Continue ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
     <AppHeader subtitle="Investment Portal" />
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

     <BottomTabBar
  active="Invest"
  navigation={navigation}
  investorId={investorId}
/>

      {renderBankDetailsModal()}
    </SafeAreaView>
  );
};

export default InvestNowScreen;