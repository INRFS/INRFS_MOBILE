import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#e6e8f3';
const GRAY = '#6B7280';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backArrow: {fontSize: 20, color: '#111827'},
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},

  container: {padding: 20, paddingBottom: 40, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 20},

  fieldLabel: {fontSize: 12, color: GRAY, fontWeight: '600', marginBottom: 8, marginTop: 4},
  selectBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
  },
  selectBoxText: {fontSize: 14, color: '#111827', fontWeight: '600', flex: 1},
  chevron: {fontSize: 14, color: GRAY},

  dropdown: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    marginBottom: 12, overflow: 'hidden',
  },
  dropdownItem: {paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F2F5'},
  dropdownItemText: {fontSize: 13, color: '#111827'},

  breakdownCard: {backgroundColor: '#fff', borderRadius: 16, padding: 18, marginTop: 12, marginBottom: 20, borderWidth: 1, borderColor: '#EEF0F4'},
  breakdownTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F2F5'},
  breakdownTitle: {fontSize: 15, fontWeight: '700', color: '#111827'},
  calculatedBadge: {backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  calculatedBadgeText: {color: '#16A34A', fontSize: 10, fontWeight: '700'},

  breakdownRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12},
  breakdownLabel: {fontSize: 13, color: GRAY},
  breakdownValue: {fontSize: 14, fontWeight: '700', color: '#111827'},
  breakdownValuePositive: {fontSize: 14, fontWeight: '700', color: '#16A34A'},
  breakdownValueNegative: {fontSize: 14, fontWeight: '700', color: '#DC2626'},

  divider: {height: 1, backgroundColor: '#F1F2F5', marginVertical: 4, marginBottom: 12},

  netLabel: {fontSize: 12, color: GRAY, fontWeight: '700', letterSpacing: 0.5},
  netValue: {fontSize: 26, fontWeight: '700', color: NAVY, marginTop: 2},

  journeyLabel: {fontSize: 12, color: GRAY, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12},
  journeyRow: {flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 18, justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: '#EEF0F4'},
  journeyItem: {alignItems: 'center', flex: 1},
  journeyPill: {width: 46, height: 30, borderRadius: 15, backgroundColor: NAVY, marginBottom: 8},
  journeyLabelText: {fontSize: 12, color: GRAY},
  journeyLabelTextActive: {color: NAVY, fontWeight: '700'},

  maturityNote: {fontSize: 12, color: '#16A34A', marginBottom: 24},

  approveBtn: {backgroundColor: NAVY, borderRadius: 14, paddingVertical: 16, alignItems: 'center'},
  approveBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
});