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
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  calcIcon: {fontSize: 20},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 16},

  pendingCard: {backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#EEF0F4'},
  pendingTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  pendingLabel: {fontSize: 11, color: GRAY, letterSpacing: 0.5},
  processingBadge: {backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  processingBadgeText: {color: '#B45309', fontSize: 11, fontWeight: '700'},
  pendingValue: {fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 14},
  markAllBtn: {backgroundColor: BLUE, borderRadius: 12, paddingVertical: 14, alignItems: 'center'},
  markAllBtnText: {color: '#fff', fontWeight: '700', fontSize: 14},

  searchRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  filterBtn: {
    width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },

  sectionLabel: {fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 10, marginTop: 4},

  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEF0F4'},
  cardTopRow: {flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12},
  avatarWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#F1F2F5',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  nameWrap: {flex: 1},
  name: {fontSize: 14, fontWeight: '700', color: '#111827'},
  bondId: {fontSize: 12, color: GRAY, marginTop: 2},
  amount: {fontSize: 15, fontWeight: '700', color: '#111827'},
  amountOverdue: {color: '#DC2626'},
  overdueText: {fontSize: 11, color: '#DC2626', marginTop: 2},
  paidText: {fontSize: 11, color: '#16A34A', fontWeight: '700', marginTop: 2},
  refText: {fontSize: 11, color: GRAY, marginTop: 2},
  doneText: {color: '#16A34A', fontSize: 13, fontWeight: '700'},

  cardBottomRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F2F5'},
  dueText: {fontSize: 12, color: GRAY},
  processPaymentText: {color: BLUE, fontSize: 13, fontWeight: '700'},
  processEarlyBtn: {borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6},
  processEarlyText: {color: '#4B5563', fontSize: 12, fontWeight: '600'},

  emptyWrap: {alignItems: 'center', paddingVertical: 30},
  emptyText: {fontSize: 14, color: GRAY},

  securityText: {textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24, marginBottom: 10},

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