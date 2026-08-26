import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },

  // ============================================================
  // HEADER (Executive Super Admin)
  // ============================================================
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B1E45',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },

  // ============================================================
  // HERO PORTFOLIO VALUE BANNER
  // ============================================================
  heroCard: {
    backgroundColor: '#0B1E45',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroStatVal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  heroStatValGreen: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4ADE80',
    marginTop: 2,
  },

  // ============================================================
  // STAT CARDS (Responsive 2-Column Grid)
  // ============================================================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
    marginRight: 4,
  },
  statIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  statSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },

  // ============================================================
  // REPORT CATEGORY TABS (Horizontal Segmented Selector)
  // ============================================================
  tabBarWrap: {
    marginBottom: 14,
  },
  tabScroll: {
    gap: 8,
    paddingRight: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  tabChipIcon: {
    fontSize: 13,
  },
  tabChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ============================================================
  // SEARCH & FILTER BAR
  // ============================================================
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  searchBoxWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 46,
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  filterToggleBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  filterToggleIcon: {
    fontSize: 14,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  filterToggleTextActive: {
    color: '#2563EB',
  },
  filterBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // ============================================================
  // ACTIVE FILTER CHIPS ROW
  // ============================================================
  activeFilterScroll: {
    marginBottom: 12,
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  activePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#1E40AF',
  },
  activePillClose: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
    marginLeft: 2,
  },
  resetAllLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resetAllLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },

  // ============================================================
  // EXPORT ACTION ROW
  // ============================================================
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  exportBtnPrimary: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
  },
  exportBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  exportBtnTextPrimary: {
    color: '#FFFFFF',
  },

  // ============================================================
  // SECTION HEADERS & BADGES
  // ============================================================
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B1E45',
    letterSpacing: -0.2,
  },
  sectionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },

  // ============================================================
  // VISUALIZATION CARDS (Overview, Branches & Tabs)
  // ============================================================
  vizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  vizTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  vizSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
  },
  vizBarRow: {
    marginBottom: 10,
  },
  vizBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vizBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  vizBarValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  vizTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  vizFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Admin Pipeline Counters Grid
  pipelineGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pipelineBox: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  pipelineBoxPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pipelineValPending: {
    color: '#B45309',
  },
  pipelineLabelPending: {
    color: '#B45309',
  },
  pipelineBoxApproved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  pipelineValApproved: {
    color: '#15803D',
  },
  pipelineLabelApproved: {
    color: '#15803D',
  },
  pipelineBoxRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  pipelineValRejected: {
    color: '#DC2626',
  },
  pipelineLabelRejected: {
    color: '#DC2626',
  },
  pipelineBoxSettled: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  pipelineValSettled: {
    color: '#1D4ED8',
  },
  pipelineLabelSettled: {
    color: '#1D4ED8',
  },
  pipelineVal: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  pipelineLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ============================================================
  // PREMIUM REPORT CARDS
  // ============================================================
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: 8,
  },
  cardIdTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    letterSpacing: 0.2,
  },
  cardDateTag: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardEmailText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '500',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 12,
  },

  // Financial Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  metricValGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  metricValGold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },

  // Card Bottom Meta & Actions Row
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  cardMetaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  cardActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cardActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  // ============================================================
  // STATUS PILL BADGES
  // ============================================================
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // ============================================================
  // SPECIALIZED PILLS & BADGES
  // ============================================================
  rankBadge: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  maturityDateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  maturityDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  maturityDateIcon: {
    fontSize: 12,
  },
  maturityDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.3,
  },
  settlementTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  settlementTypePreclose: {
    backgroundColor: '#FEF3C7',
  },
  settlementTypeMaturity: {
    backgroundColor: '#EFF6FF',
  },
  settlementTypePillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  extensionBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  extensionBadgeText: {
    color: '#B45309',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ============================================================
  // EMPTY, ERROR & LOADING SKELETONS
  // ============================================================
  emptyWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 20,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearFiltersBtn: {
    backgroundColor: '#0B1E45',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    flex: 1,
    marginRight: 10,
    fontWeight: '500',
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  loadingBox: {
    paddingVertical: 10,
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  skeletonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonLineShort: {
    height: 12,
    width: '35%',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  skeletonPill: {
    height: 16,
    width: 60,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
  },
  skeletonTitle: {
    height: 16,
    width: '65%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    height: 11,
    width: '45%',
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    marginBottom: 14,
  },
  skeletonGrid: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },

  // ============================================================
  // UNIFIED FILTER BOTTOM SHEET
  // ============================================================
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -6},
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0B1E45',
  },
  sheetClose: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94A3B8',
    padding: 4,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
    maxHeight: 480,
  },
  sheetSection: {
    marginBottom: 18,
  },
  sheetSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sheetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sheetFilterChipActive: {
    backgroundColor: '#0B1E45',
    borderColor: '#0B1E45',
  },
  sheetFilterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sheetFilterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  dateInputCol: {
    flex: 1,
  },
  dateInputSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 42,
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 12.5,
    color: '#0F172A',
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sheetResetBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  sheetApplyBtn: {
    flex: 2,
    backgroundColor: '#0B1E45',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetApplyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ============================================================
  // INVESTMENT DETAILS MODAL
  // ============================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B1E45',
  },
  modalClose: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
    padding: 4,
  },
  detailGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Theme Accent Badges
  bgIndigo: {
    backgroundColor: '#EEF2FF',
  },
  bgSky: {
    backgroundColor: '#F0F9FF',
  },
  bgFuchsia: {
    backgroundColor: '#FDF4FF',
  },
  bgEmerald: {
    backgroundColor: '#F0FDF4',
  },
  bgBlue: {
    backgroundColor: '#2563EB',
  },
  bgGreen: {
    backgroundColor: '#10B981',
  },

  // Details Loading & Scroll
  detailsLoadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  detailsLoadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  detailsScrollView: {
    maxHeight: 400,
  },

  modalCloseBtn: {
    backgroundColor: '#0B1E45',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});