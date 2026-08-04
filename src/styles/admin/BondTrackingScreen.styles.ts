import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 4},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 18},

  // ---- Top-level tabs: Pending Approval / All Investments ----
  segmentRow: {flexDirection: 'row', gap: 10, marginBottom: 18},
  segmentPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  segmentPillActive: {backgroundColor: NAVY, borderColor: NAVY},
  segmentText: {fontSize: 13, color: '#374151', fontWeight: '700'},
  segmentTextActive: {color: '#fff'},
  badge: {backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 18, alignItems: 'center'},
  badgeText: {fontSize: 10, color: '#fff', fontWeight: '700'},

  // ---- Sub-filter (All Bonds / Active / Upcoming / Settled) ----
  filterRow: {flexDirection: 'row', gap: 8, marginBottom: 18},
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterPillActive: {backgroundColor: NAVY, borderColor: NAVY},
  filterPillText: {fontSize: 12, color: '#4B5563', fontWeight: '600'},
  filterPillTextActive: {color: '#fff'},

  // ---- Bond card (All Investments tab) ----
  card: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F4'},
  cardTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16},
  seriesLabel: {fontSize: 11, color: GRAY, marginBottom: 4, letterSpacing: 0.5},
  seriesId: {fontSize: 17, fontWeight: '700', color: '#111827'},

  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12},
  statusDot: {width: 6, height: 6, borderRadius: 3, marginRight: 6},
  statusText: {fontSize: 11, fontWeight: '700'},

  detailsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18},
  detailLabel: {fontSize: 12, color: GRAY, marginBottom: 4},
  detailValue: {fontSize: 15, fontWeight: '700', color: '#2563EB'},
  detailValueDark: {fontSize: 15, fontWeight: '700', color: '#111827'},

  progressHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  progressLabel: {fontSize: 12, color: GRAY},
  progressValue: {fontSize: 13, fontWeight: '700', color: '#111827'},
  progressTrack: {height: 6, borderRadius: 3, backgroundColor: '#E5E7EB', overflow: 'hidden'},
  progressFill: {height: 6, borderRadius: 3},

  // ---- Pending approval card ----
  emptyWrap: {paddingVertical: 40, alignItems: 'center'},
  emptyText: {color: '#9CA3AF', fontSize: 14},
  pendingCard: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EEF0F4'},
  pendingTopRow: {marginBottom: 12},
  pendingInvestorName: {fontSize: 16, fontWeight: '700', color: '#111827'},
  pendingReqId: {fontSize: 12, color: '#9CA3AF', marginTop: 2},
  pendingMetaGrid: {flexDirection: 'row', marginBottom: 10},
  pendingMetaCol: {flex: 1},
  pendingMetaLabel: {fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 2},
  pendingMetaValue: {fontSize: 14, color: '#111827', fontWeight: '600'},
  pendingActionsRow: {flexDirection: 'row', gap: 10, marginTop: 10},
  pendingRejectBtn: {flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#FEE2E2'},
  pendingRejectText: {color: '#DC2626', fontWeight: '700', fontSize: 13},
  pendingReviewBtn: {flex: 1.5, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: '#16A34A'},
  pendingReviewText: {color: '#fff', fontWeight: '700', fontSize: 13},

  // ---- Review & Approve modal ----
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20},
  modalCard: {backgroundColor: '#fff', borderRadius: 16, padding: 20},
  modalTitle: {fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6},
  modalAmountText: {fontSize: 13, color: GRAY, marginBottom: 18},
  modalLabel: {fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginBottom: 8},
  rateChipsRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  rateChip: {paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#F3F4F6'},
  rateChipActive: {backgroundColor: NAVY},
  rateChipText: {fontSize: 12, color: '#374151', fontWeight: '600'},
  rateChipTextActive: {color: '#fff'},
  rateInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#111827', marginBottom: 16,
  },
  previewBox: {backgroundColor: '#F4F6FA', borderRadius: 10, padding: 12, marginBottom: 20},
  previewText: {fontSize: 12, color: GRAY, marginBottom: 4},
  previewValue: {fontSize: 18, fontWeight: '700', color: NAVY},
  modalActionsRow: {flexDirection: 'row', gap: 10},
  modalCancelBtn: {flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#F3F4F6'},
  modalCancelText: {color: '#374151', fontWeight: '700', fontSize: 14},
  modalApproveBtn: {flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: NAVY},
  modalApproveText: {color: '#fff', fontWeight: '700', fontSize: 14},

  fab: {
    position: 'absolute', right: 20, bottom: 90, width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#2563EB', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  fabIcon: {color: '#fff', fontSize: 26, fontWeight: '400', marginTop: -2},

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