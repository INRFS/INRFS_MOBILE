import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
export const PRIMARY = '#1955F0';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerBrand: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatar: {width: 28, height: 28, borderRadius: 14},
  headerTitle: {fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3},

  container: {padding: 16, paddingBottom: 24},

  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10},
  backIconBtn: {padding: 2},
  titleText: {fontSize: 19, fontWeight: '800', color: '#111827'},

  // ---------- Step indicator ----------
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  stepItem: {alignItems: 'center', width: 78},
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {backgroundColor: PRIMARY},
  stepCircleText: {fontSize: 12, fontWeight: '700', color: GRAY},
  stepCircleTextActive: {color: '#fff'},
  stepLabel: {fontSize: 10.5, color: GRAY, textAlign: 'center', fontWeight: '600'},
  stepLabelActive: {color: PRIMARY},
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 12,
    marginHorizontal: -6,
  },
  stepLineActive: {backgroundColor: PRIMARY},

  // ---------- Form fields ----------
  fieldLabel: {fontSize: 12.5, color: GRAY, marginBottom: 8, marginTop: 4, fontWeight: '600'},

  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 58,
    marginBottom: 12,
  },
  rupeeSymbol: {fontSize: 20, color: GRAY, marginRight: 8, fontWeight: '600'},
  amountInput: {flex: 1, fontSize: 20, fontWeight: '700', color: '#111827'},

  quickAmountRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8},
  quickAmountChip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  quickAmountChipActive: {backgroundColor: PRIMARY, borderColor: PRIMARY},
  quickAmountChipText: {fontSize: 12.5, fontWeight: '700', color: '#111827'},
  quickAmountChipTextActive: {color: '#fff'},

  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  minMaxText: {fontSize: 12, color: GRAY},

  // ---------- Tenure selection ----------
  tenureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tenureCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  tenureCardActive: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FF',
  },
  tenureMonths: {fontSize: 22, fontWeight: '800', color: '#111827'},
  tenureMonthsActive: {color: PRIMARY},
  tenureMonthsLabel: {fontSize: 11.5, color: GRAY, marginTop: 2, marginBottom: 6},
  tenureRate: {fontSize: 12.5, fontWeight: '700', color: GREEN},

  // ---------- Investment summary ----------
  summaryCard: {
    backgroundColor: '#EDEFF4',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {fontSize: 13, color: GRAY},
  summaryValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  summaryDivider: {height: 1, backgroundColor: '#D6D9E1', marginVertical: 8},
  maturityLabel: {fontSize: 14.5, fontWeight: '800', color: '#111827'},
  maturityValue: {fontSize: 16.5, fontWeight: '800', color: NAVY},

  // ---------- Action buttons ----------
  actionRow: {flexDirection: 'row', gap: 12, marginBottom: 14},
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {color: '#111827', fontWeight: '700', fontSize: 15},
  confirmBtn: {
    flex: 1.4,
    flexDirection: 'row',
    backgroundColor: NAVY_DARK,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: {backgroundColor: '#9CA3AF'},
  confirmBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},

  // ---------- Payment step ----------
  upiBox: {
    backgroundColor: '#EDEFF4',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  upiPayLabel: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6},
  upiIdText: {fontSize: 12.5, color: GRAY, marginBottom: 14},
  upiAmountText: {fontSize: 28, fontWeight: '800', color: PRIMARY},

  textInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: '#fff',
    height: 52,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: '#111827',
    marginBottom: 20,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadBoxFilled: {borderStyle: 'solid', padding: 8},
  uploadText: {fontSize: 12.5, color: GRAY, marginTop: 8, textAlign: 'center'},
  uploadPreview: {width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover'},

  // ---------- Confirmation step ----------
  confirmationBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  confirmIconWrap: {marginBottom: 12},
  confirmationTitle: {fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8},
  confirmationSubtitle: {
    fontSize: 13,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  dashboardBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dashboardBtnText: {color: '#fff', fontWeight: '700', fontSize: 14.5},
  viewInvestmentsBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewInvestmentsBtnText: {color: '#111827', fontWeight: '700', fontSize: 14.5},
});