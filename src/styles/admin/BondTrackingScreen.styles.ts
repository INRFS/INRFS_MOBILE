import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 18},

  filterRow: {flexDirection: 'row', gap: 8, marginBottom: 18},
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterPillActive: {backgroundColor: NAVY, borderColor: NAVY},
  filterPillText: {fontSize: 12, color: '#4B5563', fontWeight: '600'},
  filterPillTextActive: {color: '#fff'},

  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F4'},
  cardTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16},
  seriesLabel: {fontSize: 11, color: GRAY, marginBottom: 4, letterSpacing: 0.5},
  seriesId: {fontSize: 17, fontWeight: '700', color: '#111827'},

  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusText: {fontSize: 11, fontWeight: '700'},

  detailsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18},
  detailLabel: {fontSize: 12, color: GRAY, marginBottom: 4},
  detailValue: {fontSize: 15, fontWeight: '700', color: '#2563EB'},
  detailValueDark: {fontSize: 15, fontWeight: '700', color: '#111827'},

  progressHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  progressLabel: {fontSize: 12, color: GRAY},
  progressValue: {fontSize: 13, fontWeight: '700', color: '#111827'},
  progressTrack: {height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden'},
  progressFill: {height: 6, borderRadius: 3},

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
});