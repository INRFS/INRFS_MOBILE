import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
// Shifted from a flat blue to an indigo-blue to match the circles, chips,
// borders and primary buttons in the reference screens.
export const PRIMARY = '#4F46E5';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';

export const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: '#F5F6FA',
},
  scrollContent: {paddingBottom: 0, paddingTop: 90},
header: {
  height: 64,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 18,
  backgroundColor: '#FFFFFF',
  borderBottomWidth: 1,
  borderBottomColor: '#EEF0F4',
  zIndex: 50,
  elevation: 3,
},
container: {padding: 16, paddingBottom: 110},

  titleRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10},
  backIconBtn: {padding: 2},
  titleText: {fontSize: 20, fontWeight: '800', color: '#111827'},

  // ---------- Step indicator ----------
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  stepItem: {alignItems: 'center', width: 78},
  stepCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {backgroundColor: PRIMARY},
  stepCircleText: {fontSize: 13, fontWeight: '700', color: GRAY},
  stepCircleTextActive: {color: '#fff'},
  stepLabel: {fontSize: 11, color: GRAY, textAlign: 'center', fontWeight: '600'},
  stepLabelActive: {color: PRIMARY, fontWeight: '800'},
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E5E7EB',
    marginTop: 16,
    marginHorizontal: -6,
    borderRadius: 2,
  },
  stepLineActive: {backgroundColor: PRIMARY},

  // ---------- Form fields ----------
  fieldLabel: {fontSize: 13, color: '#374151', marginBottom: 10, marginTop: 4, fontWeight: '700'},

  amountInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E4E6F5',
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 64,
    marginBottom: 14,
  },
  rupeeSymbol: {fontSize: 22, color: GRAY, marginRight: 8, fontWeight: '600'},
  amountInput: {flex: 1, fontSize: 26, fontWeight: '800', color: '#111827'},

  quickAmountRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10},
  quickAmountChip: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  quickAmountChipActive: {backgroundColor: PRIMARY, borderColor: PRIMARY},
  quickAmountChipText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  quickAmountChipTextActive: {color: '#fff'},

  minMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  minMaxText: {fontSize: 12, color: GRAY, fontWeight: '600'},

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
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  tenureCardActive: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FF',
  },
  tenureMonths: {fontSize: 23, fontWeight: '800', color: '#111827'},
  tenureMonthsActive: {color: PRIMARY},
  tenureMonthsLabel: {fontSize: 11.5, color: GRAY, marginTop: 2, marginBottom: 6},
  tenureRate: {fontSize: 12.5, fontWeight: '700', color: GREEN},

  // ---------- Investment summary ----------
  summaryCard: {
    backgroundColor: '#EDEFF4',
    borderRadius: 16,
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
    height: 54,
    borderRadius: 14,
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
    // Was NAVY_DARK — the reference screens show a bright indigo/blue button,
    // not a near-black one, so this now follows PRIMARY.
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnDisabled: {backgroundColor: '#9CA3AF'},
  confirmBtnText: {color: '#fff', fontWeight: '700', fontSize: 15.5},

  // ---------- Payment step ----------
  upiBox: {
    backgroundColor: '#EEF0FC',
    borderRadius: 16,
    paddingVertical: 26,
    alignItems: 'center',
    marginBottom: 20,
  },
  upiPayLabel: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6},
  upiIdText: {fontSize: 12.5, color: GRAY, marginBottom: 14},
  upiAmountText: {fontSize: 30, fontWeight: '800', color: PRIMARY},

  // "Select Payment Method" radio row (UPI / Net Banking)
  paymentMethodRow: {flexDirection: 'row', gap: 12, marginBottom: 20},
  paymentMethodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 14,
  },
  paymentMethodOptionActive: {
    borderColor: PRIMARY,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FF',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {borderColor: PRIMARY},
  radioDot: {width: 9, height: 9, borderRadius: 4.5, backgroundColor: PRIMARY},
  paymentMethodLabel: {fontSize: 14, fontWeight: '600', color: '#111827'},
  paymentMethodLabelActive: {color: PRIMARY, fontWeight: '700'},

  // "Select Bank to Pay From" dropdown trigger + list
  bankSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  bankSelectText: {fontSize: 14.5, fontWeight: '600', color: '#111827'},
  bankSelectPlaceholder: {color: '#9CA3AF', fontWeight: '500'},
  bankDropdownList: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    marginTop: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bankDropdownItem: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F5',
  },
  bankDropdownItemLast: {borderBottomWidth: 0},
  bankDropdownItemText: {fontSize: 14, color: '#111827'},

  // Static company account details card shown after picking a bank
  bankDetailsCard: {
    backgroundColor: '#EEF0FC',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  bankDetailsRow: {
    fontSize: 13.5,
    color: '#111827',
    lineHeight: 24,
  },
  bankDetailsLabel: {fontWeight: '800', color: '#111827'},

  textInput: {
    borderWidth: 1.5,
    borderColor: '#E4E6F5',
    borderRadius: 14,
    backgroundColor: '#fff',
    height: 54,
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: '#111827',
    marginBottom: 20,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadBoxFilled: {borderStyle: 'solid', padding: 8},
  uploadText: {fontSize: 12.5, color: GRAY, marginTop: 8, textAlign: 'center'},
  uploadPreview: {width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover'},

  // ---------- Info / warning banner ----------
  infoBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#FDECD8',
    borderWidth: 1,
    borderColor: '#F7D9B0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  infoBannerIcon: {fontSize: 18, marginTop: 1},
  infoBannerText: {flex: 1, fontSize: 12.5, color: '#9A3412', lineHeight: 18.5},
  infoBannerBold: {fontWeight: '800'},

  // ---------- Review Your Investment (sub-step) ----------
  reviewCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  reviewCardTitle: {fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 14},
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F5',
  },
  reviewLabel: {fontSize: 13, color: GRAY},
  reviewValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  reviewNote: {
    backgroundColor: '#FDECD8',
    borderWidth: 1,
    borderColor: '#F7D9B0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  reviewNoteText: {fontSize: 12.5, color: '#9A3412', lineHeight: 18.5},

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
    height: 52,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dashboardBtnText: {color: '#fff', fontWeight: '700', fontSize: 14.5},
  viewInvestmentsBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewInvestmentsBtnText: {color: '#111827', fontWeight: '700', fontSize: 14.5},

  bankModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bankModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  bankModalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  bankModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  bankModalSubtitle: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  bankModalUpdateBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankModalUpdateBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#111827',
  },
  bankModalContinueBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 10,
    // Was hardcoded '#2563EB' — now follows PRIMARY so it stays consistent
    // with the rest of the indigo-blue accent.
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  bankModalContinueBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#fff',
  },
});