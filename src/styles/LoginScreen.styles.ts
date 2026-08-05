import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},
  container: {padding: 20},
  backBtn: {marginBottom: 14},
  backArrow: {fontSize: 20, color: '#111'},
  title: {fontSize: 22, fontWeight: '700', color: '#111'},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 20},
  label: {fontSize: 12, color: GRAY, marginBottom: 6, marginTop: 4},

  roleGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  roleCard: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCardActive: {
    borderColor: NAVY,
    borderWidth: 1.5,
    backgroundColor: '#EEF2FA',
  },
  roleIcon: {fontSize: 18, marginBottom: 4},
  roleLabel: {fontSize: 11.5, fontWeight: '600', color: GRAY, textAlign: 'center'},
  roleLabelActive: {color: NAVY},

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 14,
    color: '#111',
    marginBottom: 14,
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

  submitBtn: {
    backgroundColor: NAVY,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  submitBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},

  footerText: {textAlign: 'center', fontSize: 12, color: GRAY},
  footerLink: {color: NAVY, fontWeight: '700'},
});