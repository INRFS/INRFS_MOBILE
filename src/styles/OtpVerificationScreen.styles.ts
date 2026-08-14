import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const PRIMARY = '#3D5CF0';
export const PRIMARY_DARK = '#2A45D6';
export const PRIMARY_LIGHT = '#6E86FF';
export const GRAY = '#6B7280';
export const BORDER = '#E7E9F0';
export const BG = '#F4F6FB';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {padding: 2, width: 26},
  headerLogo: {width: 150, height: 46},
  headerSpacer: {width: 26},

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // ---- Ringed icon badge ----
  iconRingOuter: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 1,
    borderColor: 'rgba(61,92,240,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#E7ECFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY_LIGHT,
  },

  title: {fontSize: 25, fontWeight: '800', color: NAVY, marginBottom: 10},
  subtitle: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
  mobileRow: {flexDirection: 'row', marginTop: 4, marginBottom: 28},
  mobilePrefix: {fontSize: 16, fontWeight: '700', color: NAVY},
  mobileMasked: {fontSize: 16, fontWeight: '700', color: '#B9BFD1'},
  mobileLast3: {fontSize: 16, fontWeight: '800', color: PRIMARY},

  otpCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 16,
    shadowColor: '#3949AB',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 3,
    marginBottom: 22,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    width: 46,
    height: 58,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#fff',
  },
  otpBoxActive: {
    borderColor: PRIMARY,
  },
  otpBoxFilled: {
    borderColor: NAVY,
    backgroundColor: '#F5F7FD',
  },

  // ---- Gradient-look verify button (layered views, no gradient lib) ----
  verifyBtn: {
    height: 54,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 5,
  },
  verifyBtnShadeDark: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '55%',
    backgroundColor: PRIMARY_DARK,
    opacity: 0.55,
  },
  verifyBtnShadeLight: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: PRIMARY_LIGHT,
    opacity: 0.45,
  },
  verifyBtnShine: {
    position: 'absolute',
    right: -10,
    bottom: 6,
    width: '70%',
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{rotate: '-14deg'}],
  },
  verifyBtnContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyBtnText: {color: '#fff', fontWeight: '700', fontSize: 15.5},

  resendRow: {marginBottom: 26},
  resendText: {fontSize: 13.5, color: GRAY},
  resendTimer: {color: PRIMARY, fontWeight: '700'},

  secureRow: {flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 1},
  secureText: {fontSize: 10.5, color: GRAY, letterSpacing: 0.6, fontWeight: '600'},

  // ---- Decorative bottom wave ----
  bottomDecorWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  bgWaveDeep: {
    position: 'absolute',
    bottom: -160,
    left: -50,
    right: -50,
    height: 260,
    borderRadius: 999,
    backgroundColor: '#D3DAF8',
    opacity: 0.4,
  },
  bgWaveFront: {
    position: 'absolute',
    bottom: -135,
    left: -30,
    right: -30,
    height: 220,
    borderRadius: 999,
    backgroundColor: '#E4E9FB',
    opacity: 0.75,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});