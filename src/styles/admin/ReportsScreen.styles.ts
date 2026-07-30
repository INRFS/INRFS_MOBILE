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
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  avatar: {width: 34, height: 34, borderRadius: 17, backgroundColor: '#E5E7EB'},
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#111827'},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 40},

  statRow: {gap: 12, paddingRight: 20},
  statCard: {
    width: 190,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EBF0',
    padding: 16,
  },
  statLabel: {fontSize: 11, fontWeight: '700', color: GRAY, letterSpacing: 0.3, marginBottom: 8},
  statValue: {fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8},
  statDeltaGood: {fontSize: 11.5, color: '#16A34A', fontWeight: '700'},
  statDeltaBad: {fontSize: 11.5, color: '#DC2626', fontWeight: '700'},

  exportRow: {flexDirection: 'row', gap: 10, marginTop: 18, marginBottom: 20},
  exportBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  exportBtnOutlineText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  exportBtnFilled: {
    flex: 1,
    backgroundColor: NAVY,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  exportBtnFilledText: {fontSize: 13, fontWeight: '700', color: '#fff'},

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9EBF0',
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 18},
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 8,
  },
  chartBarCol: {flex: 1, alignItems: 'center'},
  chartBarPair: {flexDirection: 'row', alignItems: 'flex-end', gap: 3},
  chartBarInterest: {width: 5, borderRadius: 3, backgroundColor: '#4ADE80'},
  chartBarInvested: {width: 9, borderRadius: 3, backgroundColor: NAVY},
  chartLabelsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14},
  chartLabel: {color: GRAY, fontSize: 10.5, flex: 1, textAlign: 'center'},

  legendRow: {flexDirection: 'row', justifyContent: 'center', gap: 24},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendLabel: {fontSize: 11, fontWeight: '700', color: GRAY, letterSpacing: 0.3},

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  seeAll: {color: '#2563EB', fontSize: 13, fontWeight: '600'},

  activityCard: {backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14},
  activityRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  activityRowBorder: {borderBottomWidth: 1, borderBottomColor: '#F1F2F5'},
  activityIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E7ECFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityTextWrap: {flex: 1},
  activityTitle: {fontSize: 14, fontWeight: '600', color: '#111827'},
  activitySubtitle: {fontSize: 12, color: GRAY, marginTop: 2},
  activityTime: {fontSize: 12, color: GRAY},
  emptyText: {fontSize: 13, color: GRAY, textAlign: 'center', paddingVertical: 20},
});