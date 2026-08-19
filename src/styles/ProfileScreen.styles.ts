import {StyleSheet} from 'react-native';

const PAGE_BG = '#F3F4F6';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6B7280';
const BLUE = '#2563EB';
const BLUE_LIGHT = '#EEF2FF';
const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const RED = '#DC2626';
const RED_LIGHT = '#FEE2E2';
const NAVY = '#131B4D';
const KYC_BG = 'rgba(16,185,129,0.22)';
const KYC_TEXT = '#34D399';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: PAGE_BG},
  scrollContent: {paddingBottom: 110, paddingTop: 54},

  // ---------- Header ----------
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {color: TEXT_DARK, fontSize: 19, fontWeight: '800'},
  headerActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // ---------- Hero / avatar card ----------
  heroCard: {
    backgroundColor: NAVY,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 22,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {position: 'relative'},
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4F5BD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {color: '#fff', fontSize: 28, fontWeight: '700'},
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    borderWidth: 2,
    borderColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextCol: {flexShrink: 1},
  name: {color: '#fff', fontSize: 20, fontWeight: '700'},
  email: {color: '#B9C0DE', fontSize: 13, marginTop: 2},
  kycPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: KYC_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  kycPillText: {color: KYC_TEXT, fontSize: 11, fontWeight: '700', letterSpacing: 0.4},

  // ---------- White info cards ----------
  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderIconWrapGreen: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {fontSize: 15, fontWeight: '800', color: TEXT_DARK},
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {color: BLUE, fontSize: 13, fontWeight: '700'},
  divider: {height: 1, backgroundColor: BORDER, marginVertical: 14},

  fieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconWrapGreen: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoRow: {flexDirection: 'row', marginBottom: 18},
  infoCol: {flex: 1, flexDirection: 'row', gap: 10, alignItems: 'flex-start'},
  infoTextCol: {flex: 1},
  fullWidthCol: {flex: 1, width: '100%'},
  infoLabel: {fontSize: 12, color: TEXT_GRAY, marginBottom: 3},
  infoValue: {fontSize: 14.5, fontWeight: '700', color: TEXT_DARK},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  statusDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN},

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
    backgroundColor: '#fff',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: RED_LIGHT,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 14,
  },
  logoutBtnText: {color: RED, fontSize: 14, fontWeight: '700'},
  profileToolbar: {
  height: 58,
  paddingHorizontal: 18,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F5F6FA',
},

profileBackButton: {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAF1',
  alignItems: 'center',
  justifyContent: 'center',
},

profileToolbarTitle: {
  flex: 1,
  marginLeft: 12,
  fontSize: 19,
  fontWeight: '800',
  color: '#102A56',
},

profileToolbarActions: {
  flexDirection: 'row',
  alignItems: 'center',
},

profileActionButton: {
  width: 38,
  height: 38,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5EAF1',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: 8,
},
});