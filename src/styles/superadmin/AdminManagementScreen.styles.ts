import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e6e8f3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#e6e8f3',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#2563EB',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },

  // Card — premium floating shadow + status-based left accent
  // (set borderLeftColor per-card inline, e.g.
  // {borderLeftColor: user.status === 'Active' ? '#0c4566' : '#DC2626'})
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
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPillInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextInactive: {
    color: '#DC2626',
  },
  email: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  mobile: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e6e8f3',
  },
  metaText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  roleTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleTagText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },

  // ---- Field label/value grid, matches InvestorManagementScreen's card
  // layout (uppercase, letter-spaced label on top; bold value below;
  // two columns per row, divider between rows). Used for Email/Mobile and
  // Branch/Role on each admin card.
  cardGrid: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e8f3',
  },
  cardCol: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardValueSm: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  // ---- Actions row: icon buttons, matches web ----
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnDelete: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FEE2E2',
  },
  iconText: {
    fontSize: 15,
  },

  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
  },

  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 10,
  },
  modalInput: {
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  branchChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  branchChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
  },
  branchChipActive: {
    backgroundColor: '#2563EB',
  },
  branchChipText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  branchChipTextActive: {
    color: '#FFFFFF',
  },
  roleToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  roleToggle: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  roleToggleActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  roleToggleTextActive: {
    color: '#FFFFFF',
  },

  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  modalRemoveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  modalRemoveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // ---- Centered modals: View / Edit / Delete / Add ----
  centeredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centeredCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  centeredHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeX: {
    fontSize: 18,
    color: '#6B7280',
    paddingHorizontal: 4,
  },
  editScroll: {
    maxHeight: 420,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  deleteMessageBold: {
    fontWeight: '700',
    color: '#111827',
  },
});