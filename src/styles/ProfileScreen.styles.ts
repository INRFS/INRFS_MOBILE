import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const GRAY = '#6B7280';
const BORDER = '#E5E7EB';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F4F6FA'},
  scrollContent: {paddingBottom: 110},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: NAVY,
  },
  backBtn: {padding: 4},
  headerTitle: {color: '#fff', fontSize: 17, fontWeight: '700'},
  editText: {color: '#93C5FD', fontSize: 13, fontWeight: '700'},

  avatarBlock: {
    backgroundColor: NAVY,
    alignItems: 'center',
    paddingBottom: 28,
  },
  avatarWrap: {position: 'relative', marginBottom: 12},
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {color: '#fff', fontSize: 32, fontWeight: '700'},
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {color: '#fff', fontSize: 20, fontWeight: '700'},
  email: {color: '#B9C4DA', fontSize: 13, marginTop: 2},
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 12,
  },
  kycPillText: {color: '#059669', fontSize: 11, fontWeight: '700', letterSpacing: 0.4},

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeaderRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cardHeaderText: {fontSize: 12, fontWeight: '700', color: '#374151', letterSpacing: 0.5},
  divider: {height: 1, backgroundColor: BORDER, marginVertical: 12},

  infoRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16},
  infoCol: {flex: 1},
  infoLabel: {fontSize: 10, color: GRAY, letterSpacing: 0.4, marginBottom: 4},
  infoValue: {fontSize: 14, fontWeight: '600', color: '#111827'},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  statusDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: '#059669'},

  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: NAVY,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 14,
  },
  downloadBtnText: {color: '#fff', fontSize: 14, fontWeight: '700'},
headerActions: {
  flexDirection: 'row',
  alignItems: 'center',
},
settingsBtn: {
  marginLeft: 14,
},
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: 14,
  },
  logoutBtnText: {color: '#DC2626', fontSize: 14, fontWeight: '700'},
});