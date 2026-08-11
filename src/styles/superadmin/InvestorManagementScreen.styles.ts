import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F5F6FA'},
  container: {padding: 16, paddingBottom: 32},

  headerRow: {marginBottom: 12},
  title: {fontSize: 20, fontWeight: '800', color: '#0B1E45'},
  subtitle: {fontSize: 12, color: '#6B7280', marginTop: 2},

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
    marginBottom: 16,
  },

  emptyWrap: {paddingVertical: 40, alignItems: 'center'},
  emptyText: {color: '#9CA3AF', fontSize: 13},

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  investorId: {fontSize: 11, fontWeight: '700', color: '#1D4ED8'},
  investorName: {fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2},
  eyeBtn: {padding: 6, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6},

  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardCol: {flex: 1},
  cardLabel: {fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.3},
  cardValue: {fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 2},
  cardValueSm: {fontSize: 12, color: '#374151', marginTop: 2},

  pillRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 20,
  },
  pillGroup: {alignItems: 'flex-start'},
  pillGroupLabel: {fontSize: 9, color: '#9CA3AF', fontWeight: '700', marginBottom: 4},

  pill: {paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8},
  pillText: {fontSize: 10, fontWeight: '700'},
  pillApproved: {backgroundColor: '#DCFCE7'},
  pillTextApproved: {color: '#16A34A'},
  pillRejected: {backgroundColor: '#FEE2E2'},
  pillTextRejected: {color: '#DC2626'},
  pillPending: {backgroundColor: '#FEF3C7'},
  pillTextPending: {color: '#D97706'},
});