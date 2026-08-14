import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
export const PRIMARY = '#1955F0';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';
export const PURPLE = '#7C3AED';
export const PURPLE_BG = '#EDE9FE';
export const ORANGE = '#F59E0B';
export const ORANGE_BG = '#FEF3C7';
export const BLUE_BG = '#DBEAFE';
export const RED = '#EF4444';
export const RED_BG = '#FEE2E2';

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
  headerBrand: {flexDirection: 'row', alignItems: 'center', gap: 10},
  brandIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {flexDirection: 'column'},
  headerTitle: {fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3, lineHeight: 20},
  headerSubtitle: {fontSize: 11, color: GRAY, fontWeight: '500', marginTop: 1},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 16},

  // Notification bell with numbered badge (replaces the old plain dot)
  bellWrap: {position: 'relative', padding: 2},
  bellBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  bellBadgeText: {color: '#fff', fontSize: 9.5, fontWeight: '800'},

  avatar: {width: 34, height: 34, borderRadius: 17},

  container: {paddingBottom: 110, paddingTop: 54},

  greetingTitle: {fontSize: 19, fontWeight: '800', color: '#111827', marginBottom: 2},
  greetingSubtitle: {fontSize: 12.5, color: GRAY, marginBottom: 16},

  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14},
  // Base card style. Each card additionally gets `borderLeftColor` set inline
  // per-stat (see STAT_ACCENTS in the screen) to match the colored left rail
  // in the design.
  statGridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderLeftWidth: 4,
    borderRadius: 14,
    padding: 12,
  },
  statGridIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statGridLabel: {fontSize: 10, color: GRAY, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4},
  statGridValue: {fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4},
  statGridDeltaGood: {fontSize: 10.5, color: GREEN, fontWeight: '600'},
  statGridDeltaNeutral: {fontSize: 10.5, color: GRAY, fontWeight: '600'},

  portfolioCard: {
    backgroundColor: NAVY,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  portfolioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GREEN_BG,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  trendText: {color: GREEN, fontSize: 11, fontWeight: '700'},
  portfolioValue: {color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 14},

  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 60,
    marginBottom: 18,
  },
  chartBar: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
  },
  chartBarHighlight: {backgroundColor: 'rgba(255,255,255,0.65)'},

  portfolioBtnRow: {flexDirection: 'row', gap: 10},
  investBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: PRIMARY,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  investBtnText: {color: '#fff', fontWeight: '700', fontSize: 14},
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  withdrawBtnText: {color: '#fff', fontWeight: '700', fontSize: 14},

  statRow: {flexDirection: 'row', gap: 12, marginBottom: 20},
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
  },
  statLabel: {color: GRAY, fontSize: 12, marginTop: 8, marginBottom: 4},
  statValue: {color: '#111827', fontSize: 17, fontWeight: '800'},

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {fontSize: 16, fontWeight: '800', color: '#111827'},
  viewAllLink: {color: PRIMARY, fontSize: 13, fontWeight: '700'},

  // ---- Portfolio Distribution: donut + legend (replaces the bar-list card) ----
  distributionCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  distributionBody: {flexDirection: 'row', alignItems: 'center', gap: 16},
  donutWrap: {alignItems: 'center', justifyContent: 'center'},
  legendWrap: {flex: 1, gap: 10},
  legendRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  legendLabelRow: {flexDirection: 'row', alignItems: 'center', flex: 1},
  legendDot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  legendLabel: {fontSize: 13, fontWeight: '600', color: '#111827'},
  legendPct: {fontSize: 12, fontWeight: '700', color: GRAY},
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  viewDetailsText: {color: PRIMARY, fontSize: 13, fontWeight: '700'},

  // Legacy bar-style rows (kept in case the bar layout is needed elsewhere)
  distributionRow: {marginBottom: 12},
  distributionLabelRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4},
  distributionDot: {width: 8, height: 8, borderRadius: 4, marginRight: 8},
  distributionLabel: {fontSize: 13, fontWeight: '600', color: '#111827', flex: 1},
  distributionPct: {fontSize: 12, fontWeight: '700', color: GRAY},
  distributionBarTrackWrap: {marginTop: 4},
  distributionBarTrack: {height: 6, borderRadius: 3, backgroundColor: '#F1F2F5', overflow: 'hidden'},
  distributionBarFill: {height: 6, borderRadius: 3},

  bondCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  bondTopRow: {flexDirection: 'row', alignItems: 'center'},
  bondIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF1F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  bondTitleWrap: {flex: 1},
  bondId: {fontSize: 14.5, fontWeight: '700', color: '#111827'},
  bondType: {fontSize: 12, color: GRAY, marginTop: 2},
  statusBadge: {
    backgroundColor: GREEN_BG,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeMuted: {backgroundColor: '#E5E7EB'},
  statusBadgeText: {color: GREEN, fontSize: 11.5, fontWeight: '700'},
  statusBadgeTextMuted: {color: GRAY},
  bondDivider: {height: 1, backgroundColor: BORDER, marginVertical: 12},
  bondBottomRow: {flexDirection: 'row', justifyContent: 'space-between'},
  bondMetaLabel: {fontSize: 11.5, color: GRAY, marginBottom: 3},
  bondMetaValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  bondReturnValue: {fontSize: 13.5, fontWeight: '800', color: GREEN},

  // Quick actions get a colored top rail (see QUICK_ACTION_ACCENTS in the screen)
  quickActionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20},
  quickActionBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderTopWidth: 3,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  quickActionLabel: {fontSize: 12.5, fontWeight: '700', color: '#111827', textAlign: 'center'},

  txCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  txRowBorder: {borderBottomWidth: 1, borderBottomColor: BORDER},
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  // Colored notification icon variants (each notification picks one inline
  // via NOTIF_ACCENTS in the screen, instead of every icon using green)
  txIconGreen: {backgroundColor: GREEN_BG},
  txIconBlue: {backgroundColor: BLUE_BG},
  txIconPurple: {backgroundColor: PURPLE_BG},
  txIconOrange: {backgroundColor: ORANGE_BG},
  txIconCredit: {backgroundColor: '#E8F8ED'},
  txIconDebit: {backgroundColor: '#F0F1F4'},
  txTitleWrap: {flex: 1},
  txTitle: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  txDate: {fontSize: 11.5, color: GRAY, marginTop: 2},
  txAmount: {fontSize: 13.5, fontWeight: '800', color: '#111827'},
  txAmountCredit: {color: GREEN},
  txStatus: {fontSize: 11, color: GRAY, marginTop: 2},
  txChevron: {color: GRAY},
});