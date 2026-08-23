import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestNowScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppHeader from '../components/AppHeader';

// ---------------------------------------------------------
// API CONFIG
// ---------------------------------------------------------

const API_BASE_URL = 'http://187.52.115.32:8000';

// ---------------------------------------------------------
// TYPES
// ---------------------------------------------------------

type Step = 'details' | 'payment' | 'review' | 'confirmation';

type PaymentMethod = 'upi' | 'netbanking';

type TenureOption = {
  months: number;
  tenureId: number;
};

// ---------------------------------------------------------
// CONSTANTS
// ---------------------------------------------------------

// Default interest rate shown on this form.
// The backend/admin can adjust this during approval.
const DEFAULT_INTEREST_RATE = 3;

// IMPORTANT:
// tenureId is the ID sent to the backend.
// Change these IDs only if your backend master tenure IDs
// are different.
const TENURE_OPTIONS: TenureOption[] = [
  {
    months: 3,
    tenureId: 1,
  },
  {
    months: 6,
    tenureId: 2,
  },
  {
    months: 12,
    tenureId: 3,
  },
  {
    months: 24,
    tenureId: 4,
  },
  {
    months: 36,
    tenureId: 5,
  },
];

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2500000];

const BOND = {
  min: 10000,
  max: 2500000,
  upiId: 'inrfs@ybl',
};

// Banks shown in Net Banking dropdown.
const BANK_OPTIONS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Punjab National Bank',
  'Canara Bank',
  'Union Bank',
];

// Static company bank account details.
const COMPANY_BANK_ACCOUNT = {
  accountName: 'INRFS Pvt Ltd',
  accountNo: '123456789012',
  ifsc: 'INRF0001234',
};

const STEP_LABELS: {
  key: 'details' | 'payment' | 'confirmation';
  label: string;
}[] = [
  {
    key: 'details',
    label: 'Investment Details',
  },
  {
    key: 'payment',
    label: 'Payment',
  },
  {
    key: 'confirmation',
    label: 'Confirmation',
  },
];

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

const indicatorKeyFor = (
  step: Step,
): 'details' | 'payment' | 'confirmation' => {
  return step === 'review' ? 'payment' : step;
};

const formatINR = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

// ---------------------------------------------------------
// AUTH TOKEN
// ---------------------------------------------------------

const getAuthToken = async (): Promise<string> => {
  /*
   * IMPORTANT:
   * Change 'access_token' if your login API stores the JWT
   * under another AsyncStorage key.
   */
  const token = await AsyncStorage.getItem('access_token');

  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  return token;
};

// ---------------------------------------------------------
// API 1 - CALCULATE INVESTMENT
// POST /investments/calculate
// ---------------------------------------------------------

const calculateInvestmentApi = async (
  investmentAmount: number,
  tenureId: number,
) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/investments/calculate`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        investment_amount: investmentAmount,
        tenure_id: tenureId,
      }),
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        'Unable to calculate investment.',
    );
  }

  return data;
};

// ---------------------------------------------------------
// API 2 - CREATE INVESTMENT
// POST /investments/
// ---------------------------------------------------------

const createInvestmentApi = async (
  investmentAmount: number,
  tenureId: number,
) => {
  const token = await getAuthToken();

  const response = await fetch(
    `${API_BASE_URL}/investments/`,
    {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        investment_amount: investmentAmount,
        tenure_id: tenureId,
      }),
    },
  );

  let data: any = null;

  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        'Unable to create investment.',
    );
  }

  return data;
};

// ---------------------------------------------------------
// SCREEN
// ---------------------------------------------------------

const InvestNowScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  const {
    investors,
    submitInvestmentRequest,
  } = useAppData();

  // -------------------------------------------------------
  // INVESTOR DATA
  // -------------------------------------------------------

  const matchedInvestor = investors.find(
    inv => inv.id === investorId,
  );

  const investorName =
    matchedInvestor?.name || 'Investor';

  const investorBranch =
    matchedInvestor?.branch;

  // -------------------------------------------------------
  // STEP STATE
  // -------------------------------------------------------

  const [step, setStep] =
    useState<Step>('details');

  // -------------------------------------------------------
  // INVESTMENT STATE
  // -------------------------------------------------------

  const [amountText, setAmountText] =
    useState('500000');

  const [tenureIndex, setTenureIndex] =
    useState(2);

  // -------------------------------------------------------
  // PAYMENT STATE
  // -------------------------------------------------------

  const [transactionRef, setTransactionRef] =
    useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('upi');

  const [selectedBank, setSelectedBank] =
    useState('');

  const [showBankDropdown, setShowBankDropdown] =
    useState(false);

  // -------------------------------------------------------
  // UI STATE
  // -------------------------------------------------------

  const [submitting, setSubmitting] =
    useState(false);

  const [calculating, setCalculating] =
    useState(false);

  const [showBankModal, setShowBankModal] =
    useState(false);

  // -------------------------------------------------------
  // API CALCULATION RESULT
  // -------------------------------------------------------

  const [calculationData, setCalculationData] =
    useState<any>(null);

  // -------------------------------------------------------
  // CURRENT VALUES
  // -------------------------------------------------------

  const amount =
    Number(amountText.replace(/[^0-9]/g, '')) || 0;

  const tenure =
    TENURE_OPTIONS[tenureIndex];

  const rate =
    DEFAULT_INTEREST_RATE;

  const stepIndex =
    STEP_LABELS.findIndex(
      s => s.key === indicatorKeyFor(step),
    );

  // -------------------------------------------------------
  // INVESTMENT CALCULATION
  // -------------------------------------------------------
  //
  // Before API calculation:
  // use existing local calculation.
  //
  // After API calculation:
  // use backend calculation values.
  //
  // This does not change the UI.
  // -------------------------------------------------------

  const {
    totalInterest,
    monthlyPayout,
    maturityValue,
  } = useMemo(() => {
    if (calculationData) {
      return {
        totalInterest:
          Number(
            calculationData?.total_interest ??
              calculationData?.expected_interest_amount ??
              0,
          ),

        monthlyPayout:
          Number(
            calculationData?.expected_monthly_interest ??
              calculationData?.monthly_interest ??
              0,
          ),

        maturityValue:
          Number(
            calculationData?.maturity_amount ??
              0,
          ),
      };
    }

    // Existing local calculation.
    const monthly =
      amount * (rate / 100);

    const total =
      monthly * tenure.months;

    return {
      totalInterest: total,
      monthlyPayout: monthly,
      maturityValue: amount + total,
    };
  }, [
    calculationData,
    amount,
    tenure,
    rate,
  ]);

  // ---------------------------------------------------------
  // AMOUNT CHANGE
  // ---------------------------------------------------------

  const handleAmountChange = (
    value: string,
  ) => {
    setAmountText(value);

    // Existing backend calculation is no longer
    // valid when amount changes.
    setCalculationData(null);
  };

  // ---------------------------------------------------------
  // TENURE CHANGE
  // ---------------------------------------------------------

  const handleTenureChange = (
    index: number,
  ) => {
    setTenureIndex(index);

    // Existing backend calculation is no longer
    // valid when tenure changes.
    setCalculationData(null);
  };

  // ---------------------------------------------------------
  // QUICK AMOUNT
  // ---------------------------------------------------------

  const handleQuickAmount = (
    value: number,
  ) => {
    setAmountText(String(value));

    setCalculationData(null);
  };

  // ---------------------------------------------------------
  // STEP 1 -> PAYMENT
  // ---------------------------------------------------------
  //
  // First call:
  //
  // POST /investments/calculate
  //
  // Then preserve the existing modal flow.
  // ---------------------------------------------------------

  const goToPayment = async () => {
    if (
      amount < BOND.min ||
      amount > BOND.max
    ) {
      Alert.alert(
        'Check amount',
        `Investment amount must be between ${formatINR(
          BOND.min,
        )} and ${formatINR(BOND.max)}.`,
      );

      return;
    }

    try {
      setCalculating(true);

      const result =
        await calculateInvestmentApi(
          amount,
          tenure.tenureId,
        );

      console.log(
        'Calculate Investment API Response:',
        result,
      );

      // Store backend calculation.
      setCalculationData(result);

      // IMPORTANT:
      // Existing flow remains unchanged.
      setShowBankModal(true);
    } catch (error: any) {
      console.error(
        'Calculate Investment API Error:',
        error,
      );

      Alert.alert(
        'Calculation Failed',
        error?.message ||
          'Unable to calculate investment. Please try again.',
      );
    } finally {
      setCalculating(false);
    }
  };

  // ---------------------------------------------------------
  // BANK DETAILS -> PROFILE
  // ---------------------------------------------------------

  const handleUpdateBankDetails = () => {
    setShowBankModal(false);

    navigation.navigate(
      'Profile',
      {
        investorId,
      },
    );
  };

  // ---------------------------------------------------------
  // BANK DETAILS -> PAYMENT
  // ---------------------------------------------------------

  const handleContinueToPayment = () => {
    setShowBankModal(false);

    setStep('payment');
  };

  // ---------------------------------------------------------
  // PAYMENT -> REVIEW
  // ---------------------------------------------------------

  const goToReview = () => {
    if (
      paymentMethod === 'netbanking' &&
      !selectedBank
    ) {
      Alert.alert(
        'Missing details',
        'Please select a bank to pay from.',
      );

      return;
    }

    if (!transactionRef.trim()) {
      Alert.alert(
        'Missing details',
        'Please enter the transaction reference number.',
      );

      return;
    }

    setStep('review');
  };

  // ---------------------------------------------------------
  // REVIEW -> CREATE INVESTMENT
  // ---------------------------------------------------------
  //
  // POST /investments/
  //
  // Backend request:
  //
  // {
  //   investment_amount: amount,
  //   tenure_id: tenure.tenureId
  // }
  //
  // ---------------------------------------------------------

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const result =
        await createInvestmentApi(
          amount,
          tenure.tenureId,
        );

      console.log(
        'Create Investment API Response:',
        result,
      );

      /*
       * Keep existing local request submission if your app
       * still needs it for local/admin UI state.
       *
       * This does NOT replace the backend API.
       *
       * If submitInvestmentRequest is only mock/local data
       * and you don't want the local duplicate card anymore,
       * you can remove this block.
       */
      submitInvestmentRequest({
        investorId,
        investorName,
        amount,
        tenureMonths: tenure.months,
        interestRate: rate,
        transactionRef,
        screenshotUri: null,
        branch: investorBranch,
      });

      // Existing confirmation flow.
      setStep('confirmation');
    } catch (error: any) {
      console.error(
        'Create Investment API Error:',
        error,
      );

      Alert.alert(
        'Investment Submission Failed',
        error?.message ||
          'Unable to submit your investment. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // STEP INDICATOR
  // ---------------------------------------------------------

  const doneCount =
    step === 'review'
      ? 2
      : stepIndex;

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      {STEP_LABELS.map((s, i) => {
        const done =
          i < doneCount;

        const active =
          i === doneCount &&
          step !== 'review';

        return (
          <React.Fragment
            key={s.key}>
            <View
              style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  (done || active) &&
                    styles.stepCircleActive,
                ]}>
                {done ? (
                  <Icon
                    name="check"
                    size={14}
                    color="#fff"
                  />
                ) : (
                  <Text
                    style={[
                      styles.stepCircleText,
                      active &&
                        styles.stepCircleTextActive,
                    ]}>
                    {i + 1}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.stepLabel,
                  active &&
                    styles.stepLabelActive,
                ]}>
                {s.label}
              </Text>
            </View>

            {i <
              STEP_LABELS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  done &&
                    styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ---------------------------------------------------------
  // SUMMARY CARD
  // ---------------------------------------------------------

  const renderSummaryCard = () => (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>
        INVESTMENT SUMMARY
      </Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Principal Amount
        </Text>

        <Text style={styles.summaryValue}>
          {formatINR(amount)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Tenure
        </Text>

        <Text style={styles.summaryValue}>
          {tenure.months} months
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Initial Rate
        </Text>

        <Text style={styles.summaryValue}>
          {rate}% per month
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Monthly Interest
        </Text>

        <Text style={styles.summaryValue}>
          {formatINR(monthlyPayout)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Total Interest
        </Text>

        <Text style={styles.summaryValue}>
          {formatINR(totalInterest)}
        </Text>
      </View>

      <View
        style={styles.summaryDivider}
      />

      <View style={styles.summaryRow}>
        <Text style={styles.maturityLabel}>
          Maturity Amount
        </Text>

        <Text style={styles.maturityValue}>
          {formatINR(maturityValue)}
        </Text>
      </View>
    </View>
  );

  // ---------------------------------------------------------
  // STEP 1 - DETAILS
  // ---------------------------------------------------------

  const renderDetailsStep = () => (
    <>
      <View
        style={styles.infoBanner}>
        <Text
          style={styles.infoBannerIcon}>
          ⚠️
        </Text>

        <Text
          style={styles.infoBannerText}>
          <Text
            style={styles.infoBannerBold}>
            Initial interest rate: {rate}% per month.
          </Text>{' '}
          Your branch admin will review and may adjust the
          rate before final approval. Your investment becomes
          active only after admin approval.
        </Text>
      </View>

      <Text
        style={styles.fieldLabel}>
        Investment Amount (₹)
      </Text>

      <View
        style={styles.amountInputWrap}>
        <Text
          style={styles.rupeeSymbol}>
          ₹
        </Text>

        <TextInput
          style={styles.amountInput}
          keyboardType="number-pad"
          value={amountText}
          onChangeText={
            handleAmountChange
          }
          placeholder="0"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View
        style={styles.quickAmountRow}>
        {QUICK_AMOUNTS.map(a => {
          const active =
            amount === a;

          return (
            <TouchableOpacity
              key={a}
              style={[
                styles.quickAmountChip,
                active &&
                  styles.quickAmountChipActive,
              ]}
              onPress={() =>
                handleQuickAmount(a)
              }>
              <Text
                style={[
                  styles.quickAmountChipText,
                  active &&
                    styles.quickAmountChipTextActive,
                ]}>
                {formatINR(a)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        style={styles.minMaxRow}>
        <Text
          style={styles.minMaxText}>
          Min: {formatINR(BOND.min)}
        </Text>

        <Text
          style={styles.minMaxText}>
          Max: {formatINR(BOND.max)}
        </Text>
      </View>

      <Text
        style={styles.fieldLabel}>
        Investment Tenure
      </Text>

      <View
        style={styles.tenureGrid}>
        {TENURE_OPTIONS.map(
          (t, i) => {
            const active =
              i === tenureIndex;

            return (
              <TouchableOpacity
                key={t.months}
                style={[
                  styles.tenureCard,
                  active &&
                    styles.tenureCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() =>
                  handleTenureChange(i)
                }>
                <Text
                  style={[
                    styles.tenureMonths,
                    active &&
                      styles.tenureMonthsActive,
                  ]}>
                  {t.months}
                </Text>

                <Text
                  style={
                    styles.tenureMonthsLabel
                  }>
                  Months
                </Text>
              </TouchableOpacity>
            );
          },
        )}
      </View>

      {renderSummaryCard()}

      <View
        style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() =>
            navigation.goBack()
          }>
          <Text
            style={styles.cancelBtnText}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            calculating &&
              styles.confirmBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={goToPayment}
          disabled={calculating}>
          <Text
            style={styles.confirmBtnText}>
            {calculating
              ? 'Calculating...'
              : 'Continue to Payment'}
          </Text>

          {!calculating && (
            <Icon
              name="chevron-right"
              size={19}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  // ---------------------------------------------------------
  // STEP 2 - PAYMENT
  // ---------------------------------------------------------

  const renderPaymentStep = () => {
    const canContinue =
      !!transactionRef.trim() &&
      (paymentMethod === 'upi' ||
        !!selectedBank);

    return (
      <>
        <Text
          style={styles.fieldLabel}>
          Select Payment Method
        </Text>

        <View
          style={styles.paymentMethodRow}>
          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              paymentMethod === 'upi' &&
                styles.paymentMethodOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() => {
              setPaymentMethod('upi');
              setShowBankDropdown(false);
            }}>
            <View
              style={[
                styles.radioCircle,
                paymentMethod === 'upi' &&
                  styles.radioCircleActive,
              ]}>
              {paymentMethod ===
                'upi' && (
                <View
                  style={styles.radioDot}
                />
              )}
            </View>

            <Text
              style={[
                styles.paymentMethodLabel,
                paymentMethod === 'upi' &&
                  styles.paymentMethodLabelActive,
              ]}>
              UPI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              paymentMethod ===
                'netbanking' &&
                styles.paymentMethodOptionActive,
            ]}
            activeOpacity={0.85}
            onPress={() =>
              setPaymentMethod(
                'netbanking',
              )
            }>
            <View
              style={[
                styles.radioCircle,
                paymentMethod ===
                  'netbanking' &&
                  styles.radioCircleActive,
              ]}>
              {paymentMethod ===
                'netbanking' && (
                <View
                  style={styles.radioDot}
                />
              )}
            </View>

            <Text
              style={[
                styles.paymentMethodLabel,
                paymentMethod ===
                  'netbanking' &&
                  styles.paymentMethodLabelActive,
              ]}>
              Net Banking
            </Text>
          </TouchableOpacity>
        </View>

        {paymentMethod === 'upi' && (
          <View
            style={styles.upiBox}>
            <Text
              style={styles.upiPayLabel}>
              Pay via UPI
            </Text>

            <Text
              style={styles.upiIdText}>
              UPI ID: {BOND.upiId}
            </Text>

            <Text
              style={styles.upiAmountText}>
              {formatINR(amount)}
            </Text>
          </View>
        )}

        {paymentMethod ===
          'netbanking' && (
          <>
            <Text
              style={styles.fieldLabel}>
              Select Bank to Pay From
            </Text>

            <TouchableOpacity
              style={styles.bankSelectBox}
              activeOpacity={0.85}
              onPress={() =>
                setShowBankDropdown(
                  v => !v,
                )
              }>
              <Text
                style={[
                  styles.bankSelectText,
                  !selectedBank &&
                    styles.bankSelectPlaceholder,
                ]}>
                {selectedBank ||
                  'Choose Bank'}
              </Text>

              <Icon
                name={
                  showBankDropdown
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {showBankDropdown && (
              <View
                style={
                  styles.bankDropdownList
                }>
                {BANK_OPTIONS.map(
                  (bank, i) => (
                    <TouchableOpacity
                      key={bank}
                      style={[
                        styles.bankDropdownItem,
                        i ===
                          BANK_OPTIONS.length -
                            1 &&
                          styles.bankDropdownItemLast,
                      ]}
                      onPress={() => {
                        setSelectedBank(
                          bank,
                        );

                        setShowBankDropdown(
                          false,
                        );
                      }}>
                      <Text
                        style={
                          styles.bankDropdownItemText
                        }>
                        {bank}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}

            {!!selectedBank && (
              <View
                style={
                  styles.bankDetailsCard
                }>
                <Text
                  style={
                    styles.bankDetailsRow
                  }>
                  <Text
                    style={
                      styles.bankDetailsLabel
                    }>
                    Account Name:{' '}
                  </Text>
                  {
                    COMPANY_BANK_ACCOUNT.accountName
                  }
                </Text>

                <Text
                  style={
                    styles.bankDetailsRow
                  }>
                  <Text
                    style={
                      styles.bankDetailsLabel
                    }>
                    Bank:{' '}
                  </Text>
                  {selectedBank}
                </Text>

                <Text
                  style={
                    styles.bankDetailsRow
                  }>
                  <Text
                    style={
                      styles.bankDetailsLabel
                    }>
                    Account No:{' '}
                  </Text>
                  {
                    COMPANY_BANK_ACCOUNT.accountNo
                  }
                </Text>

                <Text
                  style={
                    styles.bankDetailsRow
                  }>
                  <Text
                    style={
                      styles.bankDetailsLabel
                    }>
                    IFSC:{' '}
                  </Text>
                  {
                    COMPANY_BANK_ACCOUNT.ifsc
                  }
                </Text>

                <Text
                  style={
                    styles.bankDetailsRow
                  }>
                  <Text
                    style={
                      styles.bankDetailsLabel
                    }>
                    Amount:{' '}
                  </Text>
                  {formatINR(amount)}
                </Text>
              </View>
            )}
          </>
        )}

        <Text
          style={styles.fieldLabel}>
          Transaction Reference Number
        </Text>

        <TextInput
          style={styles.textInput}
          value={transactionRef}
          onChangeText={
            setTransactionRef
          }
          placeholder="Enter UTR / Transaction ID"
          placeholderTextColor="#9CA3AF"
        />

        <View
          style={styles.actionRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() =>
              setStep('details')
            }>
            <Text
              style={styles.cancelBtnText}>
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              !canContinue &&
                styles.confirmBtnDisabled,
            ]}
            activeOpacity={0.85}
            onPress={goToReview}
            disabled={!canContinue}>
            <Text
              style={styles.confirmBtnText}>
              Continue to Review
            </Text>

            <Icon
              name="chevron-right"
              size={19}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  // ---------------------------------------------------------
  // STEP 2B - REVIEW
  // ---------------------------------------------------------

  const renderReviewStep = () => (
    <>
      <View
        style={styles.reviewCard}>
        <Text
          style={styles.reviewCardTitle}>
          Review Investment Details
        </Text>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Principal Amount
          </Text>

          <Text
            style={styles.reviewValue}>
            {formatINR(amount)}
          </Text>
        </View>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Tenure
          </Text>

          <Text
            style={styles.reviewValue}>
            {tenure.months} months
          </Text>
        </View>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Initial Rate
          </Text>

          <Text
            style={styles.reviewValue}>
            {rate}% per month
          </Text>
        </View>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Expected Monthly Interest
          </Text>

          <Text
            style={styles.reviewValue}>
            {formatINR(monthlyPayout)}
          </Text>
        </View>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Total Interest (est.)
          </Text>

          <Text
            style={styles.reviewValue}>
            {formatINR(totalInterest)}
          </Text>
        </View>

        <View
          style={styles.reviewRow}>
          <Text
            style={styles.reviewLabel}>
            Payment Method
          </Text>

          <Text
            style={styles.reviewValue}>
            {paymentMethod ===
            'netbanking'
              ? 'Net Banking'
              : 'UPI'}
          </Text>
        </View>

        {paymentMethod ===
          'netbanking' && (
          <View
            style={styles.reviewRow}>
            <Text
              style={styles.reviewLabel}>
              Bank Paid From
            </Text>

            <Text
              style={styles.reviewValue}>
              {selectedBank}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.reviewRow,
            {
              borderBottomWidth: 0,
            },
          ]}>
          <Text
            style={styles.reviewLabel}>
            Transaction Ref / UTR
          </Text>

          <Text
            style={styles.reviewValue}>
            {transactionRef}
          </Text>
        </View>
      </View>

      <View
        style={styles.reviewNote}>
        <Text
          style={styles.reviewNoteText}>
          <Text
            style={styles.infoBannerBold}>
            Please review carefully.
          </Text>{' '}
          Once submitted, your request will be sent to your
          branch admin for review and approval, and the rate
          may be adjusted at that stage. Payouts will be made
          only to the bank account on your profile.
        </Text>
      </View>

      <View
        style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() =>
            setStep('payment')
          }>
          <Text
            style={styles.cancelBtnText}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            submitting &&
              styles.confirmBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text
            style={styles.confirmBtnText}>
            {submitting
              ? 'Submitting...'
              : 'Submit Investment'}
          </Text>

          {!submitting && (
            <Icon
              name="chevron-right"
              size={19}
              color="#fff"
            />
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  // ---------------------------------------------------------
  // STEP 3 - CONFIRMATION
  // ---------------------------------------------------------

  const renderConfirmationStep =
    () => (
      <>
        <View
          style={styles.confirmationBox}>
          <View
            style={styles.confirmIconWrap}>
            <Icon
              name="check-circle-outline"
              size={54}
              color="#16A34A"
            />
          </View>

          <Text
            style={
              styles.confirmationTitle
            }>
            Investment Submitted!
          </Text>

          <Text
            style={
              styles.confirmationSubtitle
            }>
            Your investment is pending admin verification.
            You'll be notified once approved, and the bond will
            be generated only after approval.
          </Text>

          <TouchableOpacity
            style={styles.dashboardBtn}
            onPress={() =>
              navigation.navigate(
                'InvestorDashboard',
                {
                  investorId,
                },
              )
            }>
            <Text
              style={
                styles.dashboardBtnText
              }>
              Go to Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              styles.viewInvestmentsBtn
            }
            onPress={() =>
              navigation.navigate(
                'MyInvestments',
                {
                  investorId,
                },
              )
            }>
            <Text
              style={
                styles.viewInvestmentsBtnText
              }>
              View Investments
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );

  // ---------------------------------------------------------
  // BANK DETAILS MODAL
  // ---------------------------------------------------------

  const renderBankDetailsModal =
    () => (
      <Modal
        visible={showBankModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowBankModal(false)
        }>
        <View
          style={
            styles.bankModalOverlay
          }>
          <View
            style={styles.bankModalCard}>
            <View
              style={
                styles.bankModalIconWrap
              }>
              <Icon
                name="bank-outline"
                size={28}
                color="#2563EB"
              />
            </View>

            <Text
              style={styles.bankModalTitle}>
              Confirm Your Bank Details
            </Text>

            <Text
              style={
                styles.bankModalSubtitle
              }>
              Your interest and maturity amount will be credited
              to the bank account on your profile. Please make
              sure it's up to date before proceeding.
            </Text>

            <TouchableOpacity
              style={
                styles.bankModalUpdateBtn
              }
              activeOpacity={0.85}
              onPress={
                handleUpdateBankDetails
              }>
              <Text
                style={
                  styles.bankModalUpdateBtnText
                }>
                Update Bank Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.bankModalContinueBtn
              }
              activeOpacity={0.85}
              onPress={
                handleContinueToPayment
              }>
              <Text
                style={
                  styles.bankModalContinueBtnText
                }>
                Continue ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <SafeAreaView
      style={styles.safeArea}>
      <AppHeader
        subtitle="Investment Portal"
      />

      <ScrollView
        contentContainerStyle={
          styles.container
        }
        showsVerticalScrollIndicator={
          false
        }>
        <View
          style={styles.titleRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.goBack()
            }
            style={
              styles.backIconBtn
            }>
            <Icon
              name="arrow-left"
              size={20}
              color="#111827"
            />
          </TouchableOpacity>

          <Text
            style={styles.titleText}>
            Invest Now
          </Text>
        </View>

        {renderStepIndicator()}

        {step === 'details' &&
          renderDetailsStep()}

        {step === 'payment' &&
          renderPaymentStep()}

        {step === 'review' &&
          renderReviewStep()}

        {step === 'confirmation' &&
          renderConfirmationStep()}
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