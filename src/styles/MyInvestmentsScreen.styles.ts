import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
export const PRIMARY = '#1955F0';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';
export const SLATE = '#374151';
export const SLATE_BG = '#F0F1F4';

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
  avatar: {width: 28, height: 28, borderRadius: 14},
  headerTitle: {fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3},

  container: {padding: 16, paddingBottom: 24},

  heroCard: {
    backgroundColor: NAVY,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '700',
    marginBottom: 8,
  },
  heroValue: {fontSize: 26, fontWeight: '800', color: '#fff'},

  searchRow: {flexDirection: 'row', gap: 10, marginBottom: 20},
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  searchInput: {flex: 1, fontSize: 13.5, color: '#111827'},
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  exportBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {fontSize: 16, fontWeight: '800', color: '#111827'},
  recordCount: {fontSize: 12, color: GRAY},

  investmentCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
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
  bondId: {fontSize: 12.5, fontWeight: '700', color: PRIMARY, letterSpacing: 0.2},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20},
  statusBadgeActive: {backgroundColor: GREEN_BG},
  statusBadgeMatured: {backgroundColor: SLATE_BG},
  statusBadgeText: {fontSize: 11, fontWeight: '700', letterSpacing: 0.2},
  statusBadgeTextActive: {color: GREEN},
  statusBadgeTextMatured: {color: SLATE},

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

  viewBondBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EDEFF4',
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
    borderColor: BORDER,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 52,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  newInvestmentBtnText: {fontSize: 14, fontWeight: '700', color: PRIMARY},
});