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
    backgroundColor: '#F5F6FA',
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
  // {borderLeftColor: branch.status === 'Suspended' ? '#DC2626' : '#16A34A'})
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
  branchName: {
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
  statusPillSuspended: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  statusPillTextSuspended: {
    color: '#DC2626',
  },
  cardMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  statBlock: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F2F6',
  },
  statBlockValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statBlockLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    fontWeight: '500',
  },

  // ---- Field label/value grid, matches AdminManagementScreen and
  // InvestorManagementScreen's card layout: uppercase, letter-spaced label
  // on top, bold value below, two columns per row, divider under each row.
  // Used here for City/Admin and Investors/AUM — mirrors the web table's
  // BRANCH | CITY | ADMIN | INVESTORS | AUM | STATUS columns.
  cardGrid: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6FA',
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

  // ---- Actions row: 3 icon buttons ----
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

  // ---- Add Branch (bottom sheet) modal ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
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
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
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

  // ---- Status segmented toggle (Add / Edit modals) ----
  statusToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  statusToggleBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusToggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  statusToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusToggleTextActive: {
    color: '#FFFFFF',
  },

  // ---- Centered modals: View Details / Edit / Delete confirm ----
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
  closeX: {
    fontSize: 18,
    color: '#6B7280',
    paddingHorizontal: 4,
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