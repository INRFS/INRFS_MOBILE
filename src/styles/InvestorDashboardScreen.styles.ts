import {StyleSheet} from 'react-native';

export const NAVY = '#0E2A5E';
export const NAVY_DARK = '#0A1F44';
export const PRIMARY = '#1955F0';
export const GRAY = '#6B7280';
export const BORDER = '#E2E4E9';
export const BG = '#F5F6FA';
export const GREEN = '#16A34A';
export const GREEN_BG = '#DCFCE7';

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
  headerBrand: {flexDirection: 'row', alignItems: 'center', gap: 8},
  brandIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: 0.3},
  headerActions: {flexDirection: 'row', alignItems: 'center', gap: 14},
  bellWrap: {position: 'relative'},
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatar: {width: 30, height: 30, borderRadius: 15},

  container: {padding: 16, paddingBottom: 24},

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
  statusBadgeText: {color: GREEN, fontSize: 11.5, fontWeight: '700'},
  bondDivider: {height: 1, backgroundColor: BORDER, marginVertical: 12},
  bondBottomRow: {flexDirection: 'row', justifyContent: 'space-between'},
  bondMetaLabel: {fontSize: 11.5, color: GRAY, marginBottom: 3},
  bondMetaValue: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  bondReturnValue: {fontSize: 13.5, fontWeight: '800', color: GREEN},

  txCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 14,
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
  txIconCredit: {backgroundColor: '#E8F8ED'},
  txIconDebit: {backgroundColor: '#F0F1F4'},
  txTitleWrap: {flex: 1},
  txTitle: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  txDate: {fontSize: 11.5, color: GRAY, marginTop: 2},
  txAmount: {fontSize: 13.5, fontWeight: '800', color: '#111827'},
  txAmountCredit: {color: GREEN},
  txStatus: {fontSize: 11, color: GRAY, marginTop: 2},
});