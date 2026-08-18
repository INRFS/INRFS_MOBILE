import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#e6e8f3'},
  container: {padding: 16, paddingBottom: 100},

  title: {fontSize: 20, fontWeight: '800', color: '#0B1E45', letterSpacing: -0.3},
  subtitle: {fontSize: 12.5, color: '#6B7280', marginTop: 3, marginBottom: 16},

  // Pending total banner — premium shadow + red accent
  pendingCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    shadowColor: '#1E293B',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  pendingLabel: {color: '#DC2626', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase'},
  pendingValue: {color: '#0B1E45', fontSize: 22, fontWeight: '800', marginTop: 5, letterSpacing: -0.4},

  tabsRow: {marginBottom: 16},
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

  // Card — premium floating shadow + status-based left accent
  // (set borderLeftColor per-card inline via payoutAccentColor(item.status),
  // e.g. Pending → '#D97706', Approved/Paid → '#16A34A', Rejected → '#DC2626')
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#1E293B',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  investorName: {fontSize: 16, fontWeight: '800', color: '#0F172A', letterSpacing: -0.2},

  pill: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8},
  pillText: {fontSize: 10.5, fontWeight: '700'},
  pillPending: {backgroundColor: '#FEF3C7'},
  pillTextPending: {color: '#D97706'},
  pillApproved: {backgroundColor: '#DCFCE7'},
  pillTextApproved: {color: '#16A34A'},
  pillRejected: {backgroundColor: '#FEE2E2'},
  pillTextRejected: {color: '#DC2626'},
  pillPaid: {backgroundColor: '#E5E7EB'},
  pillTextPaid: {color: '#6B7280'},

  typePillRow: {marginTop: 10, marginBottom: 12},
  typePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typePillText: {color: '#1D4ED8', fontSize: 10, fontWeight: '700'},

  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
  },
  cardCol: {flex: 1},
  cardLabel: {fontSize: 9.5, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase'},
  cardValue: {fontSize: 14.5, fontWeight: '700', color: '#111827', marginTop: 4},
  cardValueLink: {fontSize: 14.5, fontWeight: '700', color: '#1D4ED8', marginTop: 4},
  cardValueSm: {fontSize: 12.5, color: '#374151', fontWeight: '500', marginTop: 4},

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  rejectBtnText: {color: '#DC2626', fontSize: 12, fontWeight: '700'},
  approveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#16A34A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  approveBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},

  markPaidBtn: {
    backgroundColor: '#0B1E45',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
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

  // ---------------------------------------------------------------------
  // NEW: styles for the "Review & Approve Payment" detail sheet and the
  // generic "are you sure?" confirmation popup. No existing style above
  // this line was changed.
  // ---------------------------------------------------------------------

  reviewIntroRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  reviewIntroIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewIntroIconText: {fontSize: 16},
  reviewIntroTitle: {fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 3},
  reviewIntroSubtext: {fontSize: 11.5, color: '#6B7280', lineHeight: 16},

  amountBoxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountBoxLabel: {fontSize: 9.5, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase'},
  amountBoxValue: {fontSize: 22, fontWeight: '800', color: '#0B1E45', marginTop: 4, letterSpacing: -0.4},

  noteBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  noteText: {fontSize: 11.5, color: '#1D4ED8', lineHeight: 16},

  reviewActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {color: '#374151', fontSize: 12, fontWeight: '700'},

  // Solid red "Reject" used inside the confirmation popup (distinct from
  // the outlined rejectBtn used on cards / the review sheet).
  confirmRejectBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#DC2626',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmRejectBtnText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},

  confirmIconWrapGreen: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmIconTextGreen: {color: '#16A34A', fontSize: 24, fontWeight: '800'},

  confirmIconWrapRed: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmIconTextRed: {color: '#DC2626', fontSize: 24, fontWeight: '800'},

  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  confirmMessage: {
    fontSize: 12.5,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  confirmSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },

  confirmInfoRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  confirmInfoCol: {flex: 1},
  confirmInfoLabel: {fontSize: 9, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.3, marginBottom: 3},
  confirmInfoValue: {fontSize: 12.5, fontWeight: '700', color: '#111827'},
});