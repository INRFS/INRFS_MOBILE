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
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 16},

  searchRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  filterBtn: {
    width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },

  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F4'},
  cardTopRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  avatarWrap: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: '#F1F2F5',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: {fontSize: 18},
  nameWrap: {flex: 1},
  name: {fontSize: 15, fontWeight: '700', color: '#111827'},
  invId: {fontSize: 12, color: GRAY, marginTop: 2},
  email: {fontSize: 12, color: GRAY, marginTop: 2},

  infoRow: {flexDirection: 'row', marginBottom: 12},
  infoCol: {flex: 1},
  infoLabel: {fontSize: 11, color: GRAY, marginBottom: 4},
  infoValue: {fontSize: 13, fontWeight: '600', color: '#111827'},

  pill: {alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10},
  pillText: {fontSize: 11, fontWeight: '700'},

  divider: {height: 1, backgroundColor: '#F1F2F5', marginBottom: 12},

  statsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14},
  statLabel: {fontSize: 12, color: GRAY, marginBottom: 4},
  statValue: {fontSize: 15, fontWeight: '700', color: '#111827'},
  statusRow: {flexDirection: 'row', alignItems: 'center'},
  dot: {width: 7, height: 7, borderRadius: 4, marginRight: 6},
  statusText: {fontSize: 13, fontWeight: '600'},

  actionsRow: {flexDirection: 'row', gap: 10},
  viewProfileBtn: {flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingVertical: 12, alignItems: 'center'},
  viewProfileText: {color: '#fff', fontWeight: '700', fontSize: 13},
  editBtn: {
    width: 44, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },

  fab: {
    position: 'absolute', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  fabIcon: {color: '#fff', fontSize: 26, fontWeight: '400', marginTop: -2},

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

  // ---------------------------------------------------------------------
  // Export button (searchRow) — appended, doesn't affect existing keys
  // ---------------------------------------------------------------------
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  exportBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},

  // ---------------------------------------------------------------------
  // Active / Pending status filter chips — appended
  // ---------------------------------------------------------------------
  statusFilterRow: {flexDirection: 'row', gap: 8, marginBottom: 18},
  statusFilterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusFilterChipActive: {backgroundColor: NAVY, borderColor: NAVY},
  statusFilterChipText: {fontSize: 12.5, fontWeight: '700', color: '#111827'},
  statusFilterChipTextActive: {color: '#fff'},
});