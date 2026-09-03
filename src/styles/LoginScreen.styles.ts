import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const BLUE = '#2563EB';
export const PURPLE = '#7C3AED';
export const ORANGE = '#D97706';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const ICON_BG = '#EEF1FA';
export const ICON_TINT = '#64748B';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F4F6FC'},
  container: {padding: 20, paddingBottom: 44},
  backBtn: {marginBottom: 14},
  backArrow: {fontSize: 20, color: '#111'},

  // ---- Decorative background ----
  topDecorWrap: {
    position: 'absolute',
    top: -50,
    right: -60,
    width: 280,
    height: 280,
  },

  bottomDecorWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
  },

  // Small dot-texture clusters, dropped into the wave's corners
  dotGrid: {
    position: 'absolute',
    width: 76,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(100,100,175,0.4)',
  },

  // Shield badge with concentric rings, sitting on the wave's crest
  bottomBadgeRingOuter: {
    position: 'absolute',
    bottom: 26,
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBadgeRingInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4C4FA0',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },

  // ---- Logo block ----
  logoWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logo: {
    width: 210,
    height: 68,
  },
  brandSubtitle: {
    fontSize: 13,
    color: GRAY,
    marginTop: 2,
  },

  title: {fontSize: 26, fontWeight: '800', color: NAVY},
  titleAccent: {color: BLUE},
  subtitle: {fontSize: 13.5, color: GRAY, marginBottom: 22, marginTop: 4},
  label: {fontSize: 12.5, color: GRAY, marginBottom: 8, marginTop: 4, fontWeight: '500'},

  // ---- Role cards: circular icon badge + title + subtitle + arrow button ----
  roleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    paddingTop: 16,
    paddingHorizontal: 6,
    paddingBottom: 14,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  roleCardActive: {
    borderColor: BLUE,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  // Soft colored wave sitting inside the bottom of each card
  roleCardWave: {
    position: 'absolute',
    bottom: -26,
    left: -14,
    right: -14,
    height: 56,
    borderRadius: 999,
    opacity: 0.55,
  },
  roleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleLabel: {fontSize: 13, fontWeight: '700', color: '#111', textAlign: 'center'},
  roleLabelActive: {color: NAVY},
  roleSub: {
    fontSize: 10,
    lineHeight: 13,
    color: GRAY,
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 12,
  },
  roleArrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },

  // ---- Inputs with leading icon chip ----
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingLeft: 6,
    paddingRight: 14,
    marginBottom: 16,
  },
  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: '#111',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '500',
  },

  // ---- Submit button: icon chip + label + trailing arrow ----
  submitBtn: {
    backgroundColor: NAVY,
    height: 54,
    borderRadius: 14,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: NAVY,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },
  submitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  submitBtnText: {color: '#fff', fontWeight: '700', fontSize: 15.5},
  submitBtnArrow: {marginLeft: 'auto', marginRight: 6},

  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '600',
  },

  footerText: {textAlign: 'center', fontSize: 12.5, color: GRAY, marginBottom: 22},
  footerLink: {color: BLUE, fontWeight: '700'},

  // ---- Forgot Password Modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: -4},
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
  },
  modalSubtitle: {
    fontSize: 13,
    color: GRAY,
    marginTop: 2,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    gap: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: BLUE,
  },
  stepCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepCircleTextActive: {
    color: '#fff',
  },
  stepLine: {
    height: 2,
    width: 36,
    backgroundColor: '#E2E8F0',
  },
  stepLineActive: {
    backgroundColor: BLUE,
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  successText: {
    color: '#059669',
    fontSize: 12.5,
    fontWeight: '600',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 16,
  },
  resendLink: {
    color: BLUE,
    fontSize: 12.5,
    fontWeight: '600',
  },

  // ---- Trust badges row ----
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  trustItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  trustIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trustLabel: {
    fontSize: 9.5,
    lineHeight: 12,
    color: GRAY,
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 26,
    backgroundColor: BORDER,
  },
});