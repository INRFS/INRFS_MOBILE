import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 12,
  },

  // Export buttons
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  exportBtnPrimary: {
    backgroundColor: '#2563EB',
  },
  exportBtnTextPrimary: {
    color: '#FFFFFF',
  },

  // Stat cards
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  statChangeUp: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  statChangeDown: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Chart card
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingHorizontal: 4,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  barsWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
  },
  bar: {
    width: 10,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  barInvested: {
    backgroundColor: '#1E3A8A',
  },
  barInterest: {
    backgroundColor: '#16A34A',
  },
  barMonthLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
  },
});