import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backArrow: {fontSize: 20, color: '#111827'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 16},

  filterRow: {flexDirection: 'row', backgroundColor: '#F1F2F5', borderRadius: 12, padding: 4, marginBottom: 16},
  filterPill: {flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center'},
  filterPillActive: {backgroundColor: NAVY},
  filterPillText: {fontSize: 12, fontWeight: '700', color: '#4B5563'},
  filterPillTextActive: {color: '#fff'},

  statCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EEF0F4',
  },
  statIcon: {fontSize: 18, marginRight: 12},
  statTextWrap: {flex: 1},
  statLabel: {fontSize: 12, color: GRAY, marginBottom: 2},
  statValue: {fontSize: 16, fontWeight: '700', color: '#111827'},
  statChangeGood: {fontSize: 12, color: '#16A34A', fontWeight: '600'},
  statValueWarn: {fontSize: 16, fontWeight: '700', color: '#DC2626'},

  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 14, marginBottom: 4, borderWidth: 1, borderColor: '#EEF0F4'},
  cardTopRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  avatarWrap: {marginRight: 12},
  avatar: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB'},
  flagBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  flagBadgeIcon: {color: '#fff', fontSize: 10, fontWeight: '700'},
  nameWrap: {flex: 1},
  name: {fontSize: 15, fontWeight: '700', color: '#111827'},
  location: {fontSize: 12, color: GRAY, marginTop: 2},

  docsRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
  docCol: {flex: 1},
  docLabel: {fontSize: 10, color: GRAY, fontWeight: '700', letterSpacing: 0.4, marginBottom: 6},
  docBadge: {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8},
  docBadgeText: {fontSize: 11, fontWeight: '700'},

  amlBox: {backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginTop: 6, marginBottom: 4},
  amlText: {fontSize: 12, color: '#B91C1C', lineHeight: 17},

  cardBottomRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F2F5',
  },
  avgWaitLabel: {fontSize: 11, color: GRAY},
  avgWaitValue: {fontSize: 14, fontWeight: '700', color: '#B45309'},
  archivedText: {fontSize: 13, color: GRAY, fontStyle: 'italic'},

  actionBtnsRow: {flexDirection: 'row', gap: 8},
  approveBtn: {backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10},
  approveBtnText: {color: '#fff', fontWeight: '700', fontSize: 13},
  rejectBtn: {borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10},
  rejectBtnText: {color: '#DC2626', fontWeight: '700', fontSize: 13},
  escalateBtn: {backgroundColor: '#111827', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10},
  escalateBtnText: {color: '#fff', fontWeight: '700', fontSize: 13},
  moreBtn: {width: 36, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  btnDisabled: {opacity: 0.4},

  emptyWrap: {alignItems: 'center', paddingVertical: 30},
  emptyText: {fontSize: 14, color: GRAY},

  loadMoreBtn: {
    marginTop: 18, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff',
  },
  loadMoreBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  showingText: {textAlign: 'center', fontSize: 12, color: GRAY, marginTop: 10},

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