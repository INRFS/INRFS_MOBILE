import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#F5F6FA'},
  container: {padding: 16, paddingBottom: 32},

  title: {fontSize: 20, fontWeight: '800', color: '#0B1E45'},
  subtitle: {fontSize: 12, color: '#6B7280', marginTop: 2, marginBottom: 14},

  pendingCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  pendingLabel: {color: '#DC2626', fontSize: 11, fontWeight: '700', letterSpacing: 0.3},
  pendingValue: {color: '#0B1E45', fontSize: 20, fontWeight: '800', marginTop: 4},

  tabsRow: {marginBottom: 14},
  tabChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  tabChipActive: {backgroundColor: '#0B1E45', borderColor: '#0B1E45'},
  tabChipText: {fontSize: 12, fontWeight: '600', color: '#6B7280'},
  tabChipTextActive: {color: '#FFFFFF'},

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
    alignItems: 'center',
  },
  investorName: {fontSize: 15, fontWeight: '700', color: '#111827'},

  pill: {paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8},
  pillText: {fontSize: 10, fontWeight: '700'},
  pillPending: {backgroundColor: '#FEF3C7'},
  pillTextPending: {color: '#D97706'},
  pillApproved: {backgroundColor: '#DCFCE7'},
  pillTextApproved: {color: '#16A34A'},
  pillRejected: {backgroundColor: '#FEE2E2'},
  pillTextRejected: {color: '#DC2626'},
  pillPaid: {backgroundColor: '#E5E7EB'},
  pillTextPaid: {color: '#6B7280'},

  typePillRow: {marginTop: 8, marginBottom: 10},
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typePillText: {color: '#1D4ED8', fontSize: 10, fontWeight: '700'},

  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardCol: {flex: 1},
  cardLabel: {fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.3},
  cardValue: {fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 2},
  cardValueLink: {fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginTop: 2},
  cardValueSm: {fontSize: 12, color: '#374151', marginTop: 2},

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 8,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rejectBtnText: {color: '#DC2626', fontSize: 12, fontWeight: '700'},
  approveBtn: {backgroundColor: '#16A34A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8},
  approveBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},

  markPaidBtn: {backgroundColor: '#0B1E45', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8},
  markPaidBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {fontSize: 17, fontWeight: '800', color: '#111827'},
  modalClose: {fontSize: 18, color: '#6B7280', paddingHorizontal: 4},

  modalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalCol: {flex: 1},
  modalLabel: {fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.3, marginBottom: 3},
  modalValue: {fontSize: 14, fontWeight: '700', color: '#111827'},

  modalTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalTypePillText: {color: '#1D4ED8', fontSize: 11, fontWeight: '700'},

  modalStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modalStatusPillText: {color: '#16A34A', fontSize: 11, fontWeight: '700'},
  receiptBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  receiptBtnText: {color: '#374151', fontSize: 12, fontWeight: '700'},
});