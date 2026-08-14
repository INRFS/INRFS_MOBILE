import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
// Shifted from blue to a violet/indigo to match the hero card, filter chip,
// bond-id text, and rate values in the reference screen.
export const PRIMARY = '#6C4CE0';
export const PRIMARY_DARK = '#5B3FD1';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';
export const SLATE = '#374151';
export const SLATE_BG = '#F0F1F4';
export const RED = '#DC2626';
export const AMBER = '#B45309';
export const AMBER_BG = '#FEF3C7';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerBrand: {flexDirection: 'row', alignItems: 'center'},
  // marginRight (not `gap`) — some RN/Yoga versions silently ignore flex
  // `gap`, which was collapsing spacing throughout this screen.
  avatar: {width: 34, height: 34, borderRadius: 17, marginRight: 10},
  headerTitle: {fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: 0.2},

 container: {padding: 16, paddingBottom: 100},

  // Was flat NAVY — the reference screen shows a vivid purple hero card, so
  // this now follows PRIMARY.
  heroCard: {
    backgroundColor: PRIMARY,
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '700',
    marginBottom: 8,
  },
  heroValue: {fontSize: 28, fontWeight: '800', color: '#fff'},

  searchRow: {flexDirection: 'row', marginBottom: 16},
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    // Internal icon-to-text gap can't be fixed via styles alone since the
    // Icon element in this row isn't given a style prop in the component —
    // only the box itself gets the marginRight fix here.
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 48,
    marginRight: 10,
  },
  searchInput: {flex: 1, fontSize: 13.5, color: '#111827'},
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 26,
    paddingHorizontal: 16,
    height: 48,
  },
  exportBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},

  // ---------- Filter chips ----------
  filterRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#fff',
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {fontSize: 17, fontWeight: '800', color: '#111827'},
  recordCount: {fontSize: 12.5, color: GRAY},

  investmentCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  investmentCardFirst: {},

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bondId: {fontSize: 13, fontWeight: '800', color: PRIMARY, letterSpacing: 0.2},
  statusBadge: {paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20},
  statusBadgeActive: {backgroundColor: GREEN_BG},
  statusBadgeMatured: {backgroundColor: GREEN_BG},
  statusBadgePending: {backgroundColor: AMBER_BG},
  statusBadgeText: {fontSize: 11, fontWeight: '800', letterSpacing: 0.3},
  statusBadgeTextActive: {color: GREEN},
  statusBadgeTextMatured: {color: GREEN},
  statusBadgeTextPending: {color: AMBER},

  idLabel: {fontSize: 10, color: GRAY, fontWeight: '700', letterSpacing: 0.4, marginBottom: 2},
  bondIdPending: {fontStyle: 'italic', color: PRIMARY},

  bondName: {fontSize: 14.5, fontWeight: '700', color: '#111827', marginBottom: 14},

  metaGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 10,
    marginBottom: 2,
  },
  metaCol: {flex: 1},
  metaLabel: {fontSize: 10, letterSpacing: 0.3, color: GRAY, marginBottom: 4, fontWeight: '600'},
  metaValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  metaValueGold: {fontSize: 13.5, fontWeight: '700', color: PRIMARY},
  metaValueGreen: {fontSize: 13.5, fontWeight: '700', color: GREEN},

  // Boxed look (background + padding + radius) so the hint reads as its own
  // callout instead of a bare line of text, matching the reference screen.
  pendingHint: {
    marginTop: 14,
    fontSize: 12.5,
    color: AMBER,
    fontWeight: '600',
    lineHeight: 18,
    backgroundColor: AMBER_BG,
    borderWidth: 1,
    borderColor: '#FDE3A7',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },

  viewBondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF0FC',
    borderRadius: 10,
    height: 42,
    marginTop: 14,
  },
  viewBondBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},

  newInvestmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#C9BFF7',
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 54,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  newInvestmentBtnText: {fontSize: 14.5, fontWeight: '700', color: PRIMARY},

  actionIconRow: {flexDirection: 'row', marginTop: 14},
  actionIconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Internal icon-to-text gap can't be fixed via styles alone (the Icon
    // element here has no style prop in the component) — marginRight below
    // is what actually separates each button from the next.
    gap: 6,
    backgroundColor: '#EEF0FC',
    borderRadius: 10,
    height: 44,
    marginRight: 8,
  },
  actionIconBtnText: {fontSize: 12.5, fontWeight: '700', color: PRIMARY_DARK},

  // empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 19,
  },

  // modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#111827',
    flexShrink: 1,
    paddingRight: 10,
  },
  modalFieldLabel: {fontSize: 12.5, color: GRAY, marginBottom: 10, fontWeight: '600'},
  modalChipRow: {flexDirection: 'row', marginBottom: 20},
  modalChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  modalChipActive: {backgroundColor: PRIMARY, borderColor: PRIMARY},
  modalChipText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  modalChipTextActive: {color: '#fff'},

  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalRowLabel: {fontSize: 13, color: GRAY},
  modalRowValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  modalRowValueGreen: {fontSize: 13.5, fontWeight: '700', color: GREEN},
  modalRowValueRed: {fontSize: 13.5, fontWeight: '700', color: RED},
  modalDivider: {height: 1, backgroundColor: BORDER, marginVertical: 6},
  modalNetLabel: {fontSize: 14.5, fontWeight: '800', color: '#111827'},
  modalNetValue: {fontSize: 15.5, fontWeight: '800', color: PRIMARY_DARK},

  modalActionRow: {flexDirection: 'row', marginTop: 18},
  modalCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalCancelBtnText: {color: '#111827', fontWeight: '700', fontSize: 14},
  modalConfirmBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {color: '#fff', fontWeight: '700', fontSize: 14},
});