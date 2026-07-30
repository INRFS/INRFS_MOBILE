import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';

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
    borderBottomColor: '#EEF0F4',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  headerIcons: {flexDirection: 'row', alignItems: 'center'},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110},

  aumCard: {
    backgroundColor: NAVY,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  aumLabel: {color: '#C6CEE0', fontSize: 13, marginBottom: 6},
  aumValue: {color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 6},
  aumChange: {color: '#4ADE80', fontSize: 13, fontWeight: '600'},

  statsRow: {flexDirection: 'row', gap: 12, marginBottom: 16},
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },
  statTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18},
  statIconWrap: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  statLabel: {color: GRAY, fontSize: 13, marginBottom: 4},
  statValue: {fontSize: 20, fontWeight: '700', color: '#111827'},

  badgeActive: {backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  badgeActiveText: {color: '#16A34A', fontSize: 11, fontWeight: '700'},
  badgeUrgent: {backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  badgeUrgentText: {color: '#DC2626', fontSize: 11, fontWeight: '700'},

  chartCard: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16},
  chartHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  chartTitle: {fontSize: 15, fontWeight: '700', color: '#111827'},
  chartMenu: {color: GRAY, fontSize: 16},
  chartBarsRow: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginBottom: 8},
  chartBarCol: {flex: 1, alignItems: 'center'},
  chartBar: {width: 8, borderRadius: 4, backgroundColor: '#2563EB'},
  chartLabelsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  chartLabel: {color: GRAY, fontSize: 11},

  sectionHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  viewLogs: {color: '#2563EB', fontSize: 13, fontWeight: '600'},

  activityCard: {backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, marginBottom: 16},
  activityRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  activityRowBorder: {borderBottomWidth: 1, borderBottomColor: '#F1F2F5'},
  activityIconWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1F2F5',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  activityTextWrap: {flex: 1},
  activityTitle: {fontSize: 14, fontWeight: '600', color: '#111827'},
  activitySubtitle: {fontSize: 12, color: GRAY, marginTop: 2},
  activityTime: {fontSize: 12, color: GRAY},

  riskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9EBF0',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  riskIcon: {fontSize: 20, marginRight: 12},
  riskTextWrap: {flex: 1},
  riskTitle: {fontSize: 14, fontWeight: '700', color: '#111827'},
  riskSubtitle: {fontSize: 12, color: GRAY, marginTop: 2},
  riskArrow: {
    fontSize: 18, color: '#fff', backgroundColor: NAVY, width: 32, height: 32,
    borderRadius: 16, textAlign: 'center', textAlignVertical: 'center',
  },

  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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