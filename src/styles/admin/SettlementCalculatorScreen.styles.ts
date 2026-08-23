import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  container: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
});

export const local = StyleSheet.create({
  // ========================================================================
  // TABS
  // ========================================================================

  tabScroll: {
    marginBottom: 18,
  },

  tabScrollContent: {
    paddingRight: 10,
  },

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  tabPill: {
    minHeight: 42,
    paddingHorizontal: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabPillActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  tabBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    marginLeft: 7,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
  },

  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // ========================================================================
  // LOADING
  // ========================================================================

  loadingWrap: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // ========================================================================
  // ERROR
  // ========================================================================

  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },

  errorTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },

  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ========================================================================
  // EMPTY
  // ========================================================================

  emptyWrap: {
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ========================================================================
  // CARD
  // ========================================================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  // ========================================================================
  // CARD HEADER
  // ========================================================================

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },

  cardTopLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  bondId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  // ========================================================================
  // BADGES
  // ========================================================================

  pendingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  pendingBadgeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },

  precloseBadge: {
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  precloseBadgeText: {
    color: '#6D28D9',
    fontSize: 11,
    fontWeight: '700',
  },

  closedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  closedBadgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },

  // ========================================================================
  // META
  // ========================================================================

  metaGrid: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 12,
  },

  metaCol: {
    flex: 1,
    minWidth: 0,
  },

  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 5,
    letterSpacing: 0.4,
  },

  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  metaValueMuted: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // ========================================================================
  // BREAKDOWN
  // ========================================================================

  breakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingTop: 5,
    marginTop: 4,
  },

  breakdownRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },

  breakdownRowLast: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  breakdownLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'right',
  },

  breakdownValueNegative: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'right',
  },

  netLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  netValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
    textAlign: 'right',
  },

  // ========================================================================
  // REASON
  // ========================================================================

  reasonBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  reasonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },

  // ========================================================================
  // ACTIONS
  // ========================================================================

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },

  approveBtn: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  rejectBtn: {
    minHeight: 40,
    paddingHorizontal: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rejectBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});