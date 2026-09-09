import {StyleSheet} from 'react-native';

// Same design-token palette as InvestorDashboardScreen.styles.ts, so the
// admin dashboard reads as part of the same visual system as the investor
// side. Every key below matches what AdminDashboardScreen.tsx already
// references — only the values changed, nothing was added or removed.
const NAVY = '#0E2A5E';
const PRIMARY = '#1955F0';
const GRAY = '#6B7280';
const BORDER = '#E2E4E9';
const BG = '#e6e8f3';
const GREEN = '#16A34A';
const GREEN_BG = '#DCFCE7';
const RED = '#EF4444';
const RED_BG = '#FEE2E2';

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
  headerTitle: {fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3},
  headerIcons: {flexDirection: 'row', alignItems: 'center', gap: 16},
  bell: {fontSize: 20},

  container: {paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110},

  greetingTitle: {fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2},
  greetingSubtitle: {fontSize: 12.5, color: GRAY, marginBottom: 16},

  topActionsRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  topActionBtnOutline: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  topActionBtnOutlineText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  topActionBtnFilled: {
    flex: 1,
    height: 46,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topActionBtnFilledText: {fontSize: 13, fontWeight: '700', color: '#fff'},

  // ---- AUM hero card — same navy + spacing rhythm as the investor
  // dashboard's portfolioCard / heroCard ----
  aumCard: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  aumLabel: {color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 6},
  aumValue: {color: '#fff', fontSize: 27, fontWeight: '800', marginBottom: 8},
  aumChange: {color: '#D9F99D', fontSize: 12.5, fontWeight: '700'},

  // ---- Stat grid — premium elevated card: soft shadow instead of a flat
  // border, rounded 16, and a colored left accent stripe (color passed
  // inline per card, same pattern already used for statGridIconWrap's
  // bg color) so each metric reads as its own colored category at a
  // glance instead of 5 identical white boxes. ----
  statGrid: {flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 10, marginBottom: 16},
  statGridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: PRIMARY,
    padding: 14,
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statGridIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statGridLabel: {fontSize: 10, color: GRAY, fontWeight: '700', letterSpacing: 0.5, marginBottom: 5, textTransform: 'uppercase'},
  statGridValue: {fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4, letterSpacing: -0.3},
  statGridDeltaGood: {fontSize: 10.5, color: GREEN, fontWeight: '600'},
  statGridDeltaBad: {fontSize: 10.5, color: RED, fontWeight: '600'},
  statGridDeltaNeutral: {fontSize: 10.5, color: GRAY, fontWeight: '600'},

  statsRow: {flexDirection: 'row', gap: 12, marginBottom: 16},
  statCard: {flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, padding: 12},
  statTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18},
  statIconWrap: {width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
  statLabel: {color: GRAY, fontSize: 13, marginBottom: 4},
  statValue: {fontSize: 20, fontWeight: '700', color: '#111827'},

  badgeActive: {backgroundColor: GREEN_BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
  badgeActiveText: {color: GREEN, fontSize: 11, fontWeight: '700'},
  badgeUrgent: {backgroundColor: RED_BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
  badgeUrgentText: {color: RED, fontSize: 11, fontWeight: '700'},

  // ---- Trend charts — premium card: strong soft shadow (no flat border),
  // bars sit inside a light rounded "track" so they read as meters rather
  // ---- Trend charts — premium fintech smooth line/area chart styling:
  // identical dimensions, subtle fill shadow gradient, minimal gridlines,
  // responsive width, and interactive touch points. ----
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitleWrap: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  chartSubtitle: {
    fontSize: 11.5,
    color: GRAY,
    fontWeight: '500',
  },
  chartBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chartBadgeActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chartBadgeGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  chartBadgeActiveGreen: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  chartBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  chartBadgeTextActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chartBadgeTextGreen: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
  },
  chartBadgeTextActiveGreen: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chartTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GREEN_BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  chartTrendText: {color: GREEN, fontSize: 11.5, fontWeight: '800'},
  chartMenu: {color: GRAY, fontSize: 16},

  chartStyle: {
    marginVertical: 4,
    borderRadius: 12,
    marginLeft: -10,
  },

  chartEmptyWrap: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  chartEmptyText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },

  // ---- Line chart (SVG-based) — wraps the <Svg> so the value callout
  // bubble can be absolutely positioned over the current/last point.
  lineChartWrap: {position: 'relative', marginBottom: 6},
  lineChartBubble: {
    position: 'absolute',
    minWidth: 34,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -17,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  lineChartBubbleText: {fontSize: 10.5, fontWeight: '800'},

  sectionHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4},
  sectionTitle: {fontSize: 16, fontWeight: '800', color: '#111827'},
  viewLogs: {color: PRIMARY, fontSize: 13, fontWeight: '700'},

  // ---- Recent activity — same border-card + circular icon pattern as
  // investor's txCard/txRow ----
  activityCard: {backgroundColor: '#fff', borderWidth: 1, borderColor: BORDER, borderRadius: 14, paddingHorizontal: 14, marginBottom: 16},
  activityRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  activityRowBorder: {borderBottomWidth: 1, borderBottomColor: BORDER},
  activityIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInitial: {fontSize: 14, fontWeight: '700', color: PRIMARY},
  activityTextWrap: {flex: 1},
  activityTitle: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  activitySubtitle: {fontSize: 11.5, color: GRAY, marginTop: 2},
  activityTime: {fontSize: 11.5, color: GRAY},

  miniBadge: {paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20},
  miniBadgeText: {fontSize: 10, fontWeight: '700'},

  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  riskIcon: {fontSize: 20, marginRight: 12},
  riskTextWrap: {flex: 1},
  riskTitle: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  riskSubtitle: {fontSize: 11.5, color: GRAY, marginTop: 2},
  riskArrow: {
    fontSize: 18, color: '#fff', backgroundColor: NAVY, width: 32, height: 32,
    borderRadius: 16, textAlign: 'center', textAlignVertical: 'center',
  },

  /* ---- Add Investment / Generate Bond modal — same radius/border
     language as investor screens' modals ---- */
  modalOverlay: {flex: 1, backgroundColor: 'rgba(17, 24, 39, 0.55)', justifyContent: 'flex-end'},
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  modalHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4},
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#111827'},
  modalClose: {fontSize: 16, color: GRAY, padding: 4},
  modalSubtitle: {fontSize: 12.5, color: GRAY, marginBottom: 18},

  inputLabel: {fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14},
  textInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },

  investorResultsBox: {borderWidth: 1, borderColor: BORDER, borderRadius: 10, marginTop: 8, overflow: 'hidden'},
  investorResultRow: {paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: BORDER},
  investorResultName: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  investorResultMeta: {fontSize: 11.5, color: GRAY, marginTop: 2},
  noResultsText: {fontSize: 12, color: GRAY, marginTop: 8},

  selectedInvestorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFD3FE',
    backgroundColor: '#EEF3FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedInvestorName: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  selectedInvestorMeta: {fontSize: 11.5, color: GRAY, marginTop: 2},
  changeInvestorLink: {fontSize: 12.5, fontWeight: '700', color: PRIMARY},

  tenureRow: {flexDirection: 'row', gap: 8},
  tenureOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tenureOptionActive: {borderColor: PRIMARY, backgroundColor: PRIMARY},
  tenureOptionMonths: {fontSize: 13, fontWeight: '800', color: '#111827'},
  tenureOptionMonthsActive: {color: '#fff'},
  tenureOptionRate: {fontSize: 11, color: GRAY, marginTop: 2, fontWeight: '600'},
  tenureOptionRateActive: {color: '#DBEAFE'},

  summaryBox: {backgroundColor: BG, borderRadius: 10, padding: 14, marginTop: 16, gap: 8},
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryLabel: {fontSize: 12.5, color: GRAY, fontWeight: '600'},
  summaryValue: {fontSize: 13, color: '#111827', fontWeight: '700'},

  modalButtonsRow: {flexDirection: 'row', gap: 10, marginTop: 22},
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalCancelBtnText: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  modalSaveBtn: {flex: 1.4, backgroundColor: PRIMARY, borderRadius: 10, paddingVertical: 13, alignItems: 'center'},
  modalSaveBtnText: {fontSize: 13.5, fontWeight: '700', color: '#fff'},

  // Activity action buttons
  activityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  actionBtnApprove: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  actionBtnApproveText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionBtnReject: {
    backgroundColor: RED_BG,
    borderColor: '#FECACA',
  },
  actionBtnRejectText: {
    color: RED,
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Detail Modal styles
  detailModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  detailLabel: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  detailConfirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  detailConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectTextarea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    color: '#111827',
    textAlignVertical: 'top',
    fontSize: 14,
    backgroundColor: '#fff',
    marginTop: 8,
    marginBottom: 16,
  },
});