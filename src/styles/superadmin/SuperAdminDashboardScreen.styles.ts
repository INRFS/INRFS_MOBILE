import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
  },

  // ============================================================
  // HEADER SECTION
  // ============================================================
  headerSection: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0B1E45',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
  },

  // ============================================================
  // STATS GRID (2 columns, balanced, equal height)
  // ============================================================
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3.5,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 115,
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
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 6,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  statSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendUp: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginRight: 3,
  },
  statTrendNeutral: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    marginRight: 3,
  },
  statSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },

  // ============================================================
  // SECTION HEADERS
  // ============================================================
  sectionBlock: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitleHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B1E45',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  // ============================================================
  // CHART CARDS
  // ============================================================
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  chartHeader: {
    marginBottom: 8,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  chartBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  chartBadgeBlue: {
    backgroundColor: '#EFF6FF',
  },
  chartBadgeGreen: {
    backgroundColor: '#ECFDF5',
  },
  chartBadgeTextBlue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  chartBadgeTextGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  chartStyle: {
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'center',
    marginLeft: -10,
  },

  // ============================================================
  // RECENT ITEMS SECTIONS (Admins / Investors)
  // ============================================================
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  manageBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0B1E45',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemAvatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  itemLeft: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  itemDate: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },

  statusPill: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPillInactive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  statusPillTextActive: {
    color: '#059669',
  },
  statusPillTextPending: {
    color: '#D97706',
  },
  statusPillTextInactive: {
    color: '#DC2626',
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 12.5,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // ============================================================
  // ERROR & LOADING STATES
  // ============================================================
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  retryBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 13.5,
    fontWeight: '500',
  },
});