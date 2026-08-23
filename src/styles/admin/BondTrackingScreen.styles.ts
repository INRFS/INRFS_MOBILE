import {StyleSheet} from 'react-native';

const NAVY = '#5c74aa';
const PRIMARY = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const BG = '#e6e8f3';
const GRAY = '#6B7280';
const BORDER = '#EEF0F4';

const GREEN = '#16A34A';
const GREEN_BG = '#DCFCE7';
const BLUE = '#2563EB';
const BLUE_BG = '#DBEAFE';
const AMBER = '#7773cb';
const AMBER_BG = '#FEF3C7';
const SLATE = '#6B7280';
const SLATE_BG = '#E5E7EB';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  bell: {
    fontSize: 18,
  },

  container: {
    padding: 20,
    paddingBottom: 110,
    backgroundColor: BG,
    flexGrow: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 18,
  },

  /* ============================================================
     TOP LEVEL TABS
     ============================================================ */

  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },

  segmentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  segmentPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  segmentPillPressed: {
    backgroundColor: '#F3F4F6',
  },

  segmentPillActivePressed: {
    backgroundColor: '#081A3D',
  },

  segmentText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },

  segmentTextActive: {
    color: '#fff',
  },

  badge: {
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },

  /* ============================================================
     FILTER
     ============================================================ */

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterPillActive: {
    backgroundColor: NAVY,
    borderColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  filterPillPressed: {
    backgroundColor: '#F3F4F6',
  },

  filterPillActivePressed: {
    backgroundColor: '#081A3D',
  },

  filterPillText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },

  filterPillTextActive: {
    color: '#fff',
  },

  /* ============================================================
     BOND CARD
     ============================================================ */

  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: BLUE,
    shadowColor: '#0B1E45',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  cardAccentActive: {
    borderLeftColor: GREEN,
  },

  cardAccentUpcoming: {
    borderLeftColor: BLUE,
  },

  cardAccentPending: {
    borderLeftColor: AMBER,
  },

  cardAccentSettled: {
    borderLeftColor: SLATE,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  seriesLabel: {
    fontSize: 10.5,
    color: GRAY,
    marginBottom: 4,
    letterSpacing: 0.6,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  seriesId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
  },

  /* ============================================================
     STATUS
     ============================================================ */

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusBadgeActive: {
    backgroundColor: GREEN_BG,
  },

  statusBadgeUpcoming: {
    backgroundColor: BLUE_BG,
  },

  statusBadgePending: {
    backgroundColor: AMBER_BG,
  },

  statusBadgeSettled: {
    backgroundColor: SLATE_BG,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  statusDotGlowActive: {
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },

  statusDotGlowUpcoming: {
    backgroundColor: BLUE,
    shadowColor: BLUE,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },

  statusDotGlowPending: {
    backgroundColor: AMBER,
    shadowColor: AMBER,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 3,
  },

  statusDotGlowSettled: {
    backgroundColor: SLATE,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* ============================================================
     DETAILS
     ============================================================ */

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  detailLabel: {
    fontSize: 11.5,
    color: GRAY,
    marginBottom: 4,
    fontWeight: '600',
  },

  detailValue: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },

  detailValueDark: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 12,
    color: GRAY,
  },

  progressValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  progressFill: {
    height: 6,
    borderRadius: 3,
  },

  /* ============================================================
     EMPTY / PENDING
     ============================================================ */

  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },

  pendingCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: AMBER,
    shadowColor: '#0B1E45',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },

  pendingTopRow: {
    marginBottom: 12,
  },

  pendingInvestorName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  pendingReqId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  pendingMetaGrid: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  pendingMetaCol: {
    flex: 1,
  },

  pendingMetaLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 2,
  },

  pendingMetaValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  pendingActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  pendingRejectBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },

  pendingRejectBtnPressed: {
    backgroundColor: '#FCA5A5',
  },

  pendingRejectText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },

  pendingReviewBtn: {
    flex: 1.5,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  pendingReviewBtnPressed: {
    backgroundColor: '#128038',
  },

  pendingReviewText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ============================================================
     CARD ACTION BUTTONS
     ============================================================ */

  detailsBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  detailsBtnPressed: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },

  detailsBtnText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },

  bondBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },

  bondBtnPressed: {
    backgroundColor: '#081A3D',
  },

  bondBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  tenureBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  tenureBtnPressed: {
    backgroundColor: '#DBEAFE',
    borderColor: PRIMARY,
  },

  tenureBtnText: {
    color: PRIMARY_DARK,
    fontSize: 13,
    fontWeight: '700',
  },

  tenureBtnFlagged: {
    backgroundColor: AMBER_BG,
    borderColor: '#FDE68A',
  },

  tenureBtnFlaggedPressed: {
    backgroundColor: '#FDE68A',
    borderColor: AMBER,
  },

  tenureBtnTextFlagged: {
    color: '#B45309',
  },

  tenureBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },

  tenureBtnTextDisabled: {
    color: '#9CA3AF',
  },

  awaitingBtn: {
    backgroundColor: AMBER_BG,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
  },

  awaitingBtnPressed: {
    backgroundColor: '#FDE68A',
  },

  awaitingBtnText: {
    color: AMBER,
    fontSize: 13,
    fontWeight: '700',
  },

  /* ============================================================
     MODALS
     ============================================================ */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  modalAmountText: {
    fontSize: 13,
    color: GRAY,
    marginBottom: 18,
  },

  modalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '700',
    marginBottom: 8,
  },

  rateChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },

  rateChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },

  rateChipActive: {
    backgroundColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },

  rateChipPressed: {
    backgroundColor: '#E5E7EB',
  },

  rateChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
  },

  rateChipTextActive: {
    color: '#fff',
  },

  rateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },

  previewBox: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  previewText: {
    fontSize: 12,
    color: GRAY,
    marginBottom: 4,
  },

  previewValue: {
    fontSize: 19,
    fontWeight: '800',
    color: NAVY,
  },

  /*
   * REQUIRED BY BondTrackingScreen.tsx
   */
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },

  modalCancelBtnPressed: {
    backgroundColor: '#E5E7EB',
  },

  modalCancelText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 14,
  },

  modalApproveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: NAVY,
    shadowColor: NAVY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  modalApproveBtnPressed: {
    backgroundColor: '#081A3D',
  },

  modalApproveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* ============================================================
     FAB
     ============================================================ */

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 6,
  },

  fabPressed: {
    backgroundColor: PRIMARY_DARK,
  },

  fabIcon: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
    marginTop: -2,
  },

  /* ============================================================
     TAB BAR
     ============================================================ */

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 10,
    paddingBottom: 18,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
  },

  tabIcon: {
    fontSize: 18,
    color: GRAY,
    marginBottom: 2,
  },

  tabIconActive: {
    fontSize: 18,
    marginBottom: 2,
  },

  tabLabel: {
    fontSize: 11,
    color: GRAY,
  },

  tabLabelActive: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '700',
  },

  /* ============================================================
     THESE FOUR WERE MISSING IN YOUR CURRENT FILE
     ============================================================ */

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },

  modalActionsRow3: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },

  rejectBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },

  rejectBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 13,
  },
});