import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e6e8f3',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },

  // Stats grid — premium 2-per-row cards with colored accent border
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5', // overridden per-card via inline style
    shadowColor: '#1E293B',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  statCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B95A5',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
    marginRight: 8,
    lineHeight: 15,
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTrendUp: {
    fontSize: 10,
    color: '#16A34A',
    marginRight: 3,
  },
  statTrendNeutral: {
    fontSize: 10,
    color: '#94A3B8',
    marginRight: 3,
  },
  statSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
  },

  // Chart cards — soft floating shadow, no border
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#1E293B',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    alignSelf: 'flex-start',
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  chartStyle: {
    borderRadius: 8,
    marginLeft: -16,
  },

  // Section cards (kept in case other parts of the app still reference these)
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  manageBtn: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logRowLeft: {
    flex: 1,
    marginRight: 8,
  },
  logUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  logMeta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  logAction: {
    fontSize: 13,
    color: '#374151',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  statusPillTextFailed: {
    color: '#DC2626',
  },
});