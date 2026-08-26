import {StyleSheet, Dimensions, Platform} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const COLORS = {
  navy: '#0B1E45',
  navyDark: '#071530',
  navyLight: '#1E293B',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#EFF6FF',
  teal: '#0D9488',
  tealLight: '#F0FDFA',
  green: '#059669',
  greenLight: '#ECFDF5',
  greenBorder: '#A7F3D0',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  amberBorder: '#FDE68A',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  red: '#DC2626',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
  slate: '#475569',
  slateLight: '#F1F5F9',
  slateBorder: '#CBD5E1',
  gray: '#64748B',
  grayLight: '#F8FAFC',
  border: '#E2E8F0',
  borderSubtle: '#EDF2F7',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  bg: '#F8FAFC',
  card: '#FFFFFF',
};

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

const HERO_SHADOW = Platform.select({
  ios: {
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
  default: {},
});

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    paddingBottom: 48,
  },

  /* ============================================================
     HEADER SECTION
     ============================================================ */
  headerWrap: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...CARD_SHADOW,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.gray,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  controlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    minHeight: 40,
    borderRadius: 10,
    gap: 6,
    justifyContent: 'center',
  },
  controlPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.blue,
  },
  exportHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    minHeight: 40,
    borderRadius: 10,
    gap: 6,
    marginLeft: 'auto',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  exportHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  /* ============================================================
     ERROR BANNER
     ============================================================ */
  errorBanner: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    backgroundColor: COLORS.redLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.red,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 12.5,
    color: '#991B1B',
    flex: 1,
    fontWeight: '500',
    lineHeight: 18,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red,
    marginLeft: 10,
    textDecorationLine: 'underline',
  },

  /* ============================================================
     TABS (PREMIUM HORIZONTAL PILLS)
     ============================================================ */
  tabBarScroll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  tabBtn: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...CARD_SHADOW,
  },
  tabBtnActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* ============================================================
     FINANCIAL SUMMARY METRIC CARDS
     ============================================================ */
  statRowScroll: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 12,
  },
  statCard: {
    width: Math.max(165, SCREEN_WIDTH * 0.43),
    minHeight: 118,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    justifyContent: 'space-between',
    ...CARD_SHADOW,
  },
  statLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navy,
    marginVertical: 4,
    letterSpacing: -0.4,
  },
  statSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  /* ============================================================
     SEARCH & FILTERS
     ============================================================ */
  filterCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
    ...CARD_SHADOW,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    paddingVertical: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  filterPickerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    flex: 1,
  },
  clearFiltersBtn: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },

  /* ============================================================
     SECTIONS & PANELS
     ============================================================ */
  panel: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  panelEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.blue,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 3,
    letterSpacing: -0.2,
  },
  panelSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  panelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueLight,
    paddingHorizontal: 12,
    minHeight: 34,
    borderRadius: 8,
    gap: 4,
  },
  panelActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blue,
  },

  /* ============================================================
     HERO CARD (OVERVIEW TAB)
     ============================================================ */
  heroOverviewCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    ...HERO_SHADOW,
  },
  heroHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#93C5FD',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#34D399',
    letterSpacing: 0.2,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginTop: 3,
    marginBottom: 18,
  },
  heroMetricsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  heroMetricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* ============================================================
     CHARTS
     ============================================================ */
  chartContainer: {
    marginTop: 8,
  },
  chartBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 150,
    paddingTop: 24,
    gap: 8,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: '100%',
    maxWidth: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: COLORS.blue,
    minHeight: 6,
  },
  chartBarAlt: {
    backgroundColor: COLORS.teal,
  },
  chartBarLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  chartLegendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLegendLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  /* ============================================================
     MINI METRIC STRIP
     ============================================================ */
  miniMetricStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  miniMetricBox: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gray,
    letterSpacing: 0.4,
  },
  miniMetricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.navy,
    marginTop: 3,
    letterSpacing: -0.2,
  },

  /* ============================================================
     DATA CARDS (MOBILE FINANCIAL CARDS)
     ============================================================ */
  itemCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
    gap: 10,
    ...CARD_SHADOW,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
  },
  itemTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.1,
  },
  itemSubText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.grayLight,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  itemDetailCell: {
    width: '50%',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  itemDetailCell3: {
    width: '33.33%',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  itemDetailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  itemDetailValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 2,
  },
  itemDetailValueGreen: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.green,
    marginTop: 2,
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
    paddingTop: 10,
  },
  itemActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 14,
    minHeight: 36,
    borderRadius: 8,
    gap: 4,
    justifyContent: 'center',
  },
  itemActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    minHeight: 36,
    borderRadius: 8,
    gap: 4,
    justifyContent: 'center',
  },
  itemSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
  },

  /* ============================================================
     STATUS BADGES (POLISHED PILLS)
     ============================================================ */
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: COLORS.greenLight,
    borderColor: COLORS.greenBorder,
  },
  statusBadgePending: {
    backgroundColor: COLORS.amberLight,
    borderColor: COLORS.amberBorder,
  },
  statusBadgeClosed: {
    backgroundColor: COLORS.slateLight,
    borderColor: COLORS.slateBorder,
  },
  statusBadgeRejected: {
    backgroundColor: COLORS.redLight,
    borderColor: COLORS.redBorder,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusTextActive: {
    color: COLORS.green,
  },
  statusTextPending: {
    color: COLORS.amber,
  },
  statusTextClosed: {
    color: COLORS.slate,
  },
  statusTextRejected: {
    color: COLORS.red,
  },

  /* ============================================================
     PROGRESS / DISTRIBUTION BARS
     ============================================================ */
  distBarRow: {
    marginBottom: 12,
  },
  distBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distBarLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.navy,
  },
  distBarValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  distBarTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.slateLight,
    overflow: 'hidden',
  },
  distBarFill: {
    height: '100%',
    borderRadius: 5,
  },

  /* ============================================================
     EMPTY & LOADING STATES
     ============================================================ */
  emptyCard: {
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '600',
  },

  /* ============================================================
     MODALS (BOTTOM SHEET STYLE)
     ============================================================ */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 22,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.navy,
    letterSpacing: -0.2,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modalDetailsList: {
    gap: 8,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  modalDetailLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.navy,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalPrimaryBtn: {
    flex: 1,
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modalPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalSecondaryBtn: {
    flex: 1,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalSecondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.blue,
  },

  /* ============================================================
     PICKER MODAL
     ============================================================ */
  pickerItem: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: COLORS.blueLight,
    borderRadius: 8,
  },
  pickerItemText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  pickerItemTextActive: {
    color: COLORS.blue,
    fontWeight: '700',
  },
});