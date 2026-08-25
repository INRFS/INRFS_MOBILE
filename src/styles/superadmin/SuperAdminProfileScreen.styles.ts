import {StyleSheet, Platform} from 'react-native';

const PAGE_BG = '#F5F6FA';
const CARD_BG = '#FFFFFF';
const BORDER = '#EEF0F3';
const TEXT_DARK = '#0F1424';
const TEXT_GRAY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BLUE = '#2563EB';
const BLUE_LIGHT = '#EEF2FF';
const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const RED = '#DC2626';
const RED_LIGHT = '#FEF2F2';
const NAVY = '#0D1442';
const NAVY_SOFT = '#1A2158';
const GOLD = '#D4AF37';
const GOLD_SOFT = 'rgba(212,175,55,0.16)';
const ROLE_BG = 'rgba(16,185,129,0.18)';
const ROLE_TEXT = '#4ADE80';

const premiumShadow = Platform.select({
  ios: {
    shadowColor: '#0F1424',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  android: {elevation: 4},
});

const heroShadow = Platform.select({
  ios: {
    shadowColor: NAVY,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  android: {elevation: 8},
});

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: PAGE_BG},
  scrollContent: {paddingBottom: 110, paddingTop: 8},

  // ---------- Success & Error Banners ----------
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  successIcon: {
    fontSize: 16,
    color: '#059669',
  },
  successText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },

  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorIcon: {
    fontSize: 16,
    color: '#DC2626',
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
    flex: 1,
    marginRight: 8,
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // ---------- Hero / avatar card ----------
  heroCard: {
    backgroundColor: NAVY,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    ...heroShadow,
  },
  heroGlow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: NAVY_SOFT,
    opacity: 0.6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  avatarWrap: {position: 'relative'},
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4F5BD5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarInitial: {color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 0.5},
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GREEN,
    borderWidth: 2.5,
    borderColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeIcon: {color: '#fff', fontSize: 11, fontWeight: '800'},
  heroTextCol: {flex: 1, flexShrink: 1},
  name: {color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 0.2},
  email: {color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 3},
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: ROLE_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.25)',
  },
  rolePillText: {color: ROLE_TEXT, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.8},
  goldDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 20,
    marginBottom: 16,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStatCol: {flex: 1},
  heroStatLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  heroStatValue: {color: '#fff', fontSize: 13.5, fontWeight: '700'},

  // ---------- White info card ----------
  card: {
    backgroundColor: CARD_BG,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    ...premiumShadow,
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
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderIcon: {fontSize: 14, color: BLUE},
  cardHeaderText: {fontSize: 15.5, fontWeight: '800', color: TEXT_DARK, letterSpacing: 0.1},
  editBtn: {
    backgroundColor: BLUE_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.15)',
  },
  editText: {color: BLUE, fontSize: 12.5, fontWeight: '700'},
  divider: {height: 1, backgroundColor: BORDER, marginVertical: 16},

  // ---------- Field rows ----------
  fieldIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconWrapGreen: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GREEN_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconWrapGold: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: GOLD_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIconWrapPurple: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldIcon: {fontSize: 14},

  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  infoTextCol: {flex: 1},
  infoLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  readOnlyBadge: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  infoValue: {fontSize: 15, fontWeight: '700', color: TEXT_DARK, letterSpacing: 0.1},
  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2},
  statusDot: {width: 8, height: 8, borderRadius: 4, backgroundColor: GREEN},

  input: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    fontSize: 14.5,
    fontWeight: '600',
    color: TEXT_DARK,
    backgroundColor: '#FAFAFA',
    marginTop: 2,
  },
  inputFocused: {
    borderColor: BLUE,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: RED,
    backgroundColor: '#FEF2F2',
  },
  errorTextSmall: {
    color: RED,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
  },

  // ---------- Edit Mode Action Buttons ----------
  editActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  saveButton: {
    flex: 1.5,
    backgroundColor: '#0B1E45',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ---------- Logout ----------
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: RED_LIGHT,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.12)',
  },
  logoutIcon: {fontSize: 15, color: RED},
  logoutText: {color: RED, fontSize: 14.5, fontWeight: '800', letterSpacing: 0.2},
});