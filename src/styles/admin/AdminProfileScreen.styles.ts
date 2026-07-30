import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';
const BLUE = '#2563EB';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backArrow: {fontSize: 20, color: '#111827'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1, alignItems: 'center'},

  avatarWrap: {marginTop: 8, marginBottom: 14},
  avatar: {width: 96, height: 96, borderRadius: 48, backgroundColor: '#E5E7EB'},
  cameraBadge: {
    position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15,
    backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  cameraIcon: {fontSize: 13},

  name: {fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 2},
  email: {fontSize: 13, color: GRAY, marginBottom: 12},

  roleBadge: {backgroundColor: '#E7ECFB', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginBottom: 22},
  roleBadgeText: {fontSize: 12, fontWeight: '700', color: '#3730A3'},

  actionsRow: {flexDirection: 'row', gap: 12, width: '100%', marginBottom: 26},
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#EEF0F4',
    alignItems: 'center', paddingVertical: 16,
  },
  actionIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F2F5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  actionLabel: {fontSize: 13, fontWeight: '600', color: '#111827'},

  sectionTitle: {fontSize: 15, fontWeight: '700', color: '#111827', alignSelf: 'flex-start', marginBottom: 10},

  infoCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EEF0F4',
    paddingHorizontal: 16, marginBottom: 24,
  },
  infoRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  infoIcon: {fontSize: 16, width: 30},
  infoTextWrap: {flex: 1},
  infoLabel: {fontSize: 10, color: GRAY, letterSpacing: 0.5, marginBottom: 3},
  infoValue: {fontSize: 14, fontWeight: '600', color: '#111827'},
  infoDivider: {height: 1, backgroundColor: '#F1F2F5'},
  statusDot: {width: 9, height: 9, borderRadius: 5},

  logoutBtn: {
    width: '100%', backgroundColor: '#FEE2E2', borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 14,
  },
  logoutBtnText: {color: '#DC2626', fontWeight: '700', fontSize: 14},

  versionText: {fontSize: 11, color: '#9CA3AF', marginBottom: 10},

  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#EEF0F4',
    paddingVertical: 10, paddingBottom: 18,
  },
  tabItem: {flex: 1, alignItems: 'center'},
  tabIcon: {fontSize: 18, color: GRAY, marginBottom: 2},
  tabIconActive: {fontSize: 18, marginBottom: 2},
  tabLabel: {fontSize: 11, color: GRAY},
  tabLabelActive: {fontSize: 11, color: NAVY, fontWeight: '700'},
});