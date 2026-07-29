import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const PRIMARY = '#1955F0';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F3F5F9';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {padding: 2},
  headerTitle: {fontSize: 18, fontWeight: '800', color: NAVY, letterSpacing: 0.5},

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E4E9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 10},
  subtitle: {
    fontSize: 13.5,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  mobileText: {color: '#111827', fontWeight: '700'},

  otpCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
    marginBottom: 20,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  otpBox: {
    width: 44,
    height: 54,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 10,
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

  verifyBtn: {
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},

  resendRow: {marginBottom: 22},
  resendText: {fontSize: 13, color: GRAY},
  resendTimer: {color: PRIMARY, fontWeight: '700'},

  secureRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  secureText: {fontSize: 10.5, color: GRAY, letterSpacing: 0.6, fontWeight: '600'},
});