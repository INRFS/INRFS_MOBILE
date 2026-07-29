import {StyleSheet} from 'react-native';

const GOLD = '#8A6D2F';
const DARK = '#1A1A18';
const MUTED = '#9C9689';
const GREEN = '#16A34A';
const CREAM = '#FBF8F1';
const CARD_BORDER = '#E7DFC9';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EEE7',
  },
  backIconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },

  // ---- Certificate card ----
  certificateCard: {
    backgroundColor: CREAM,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 20,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  bondIdBadge: {
    alignSelf: 'center',
    backgroundColor: '#EFE7D2',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  bondIdBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: GOLD,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: CARD_BORDER,
    marginVertical: 16,
  },

  principalBox: {
    backgroundColor: DARK,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  principalLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C9C2AE',
    letterSpacing: 1,
    marginBottom: 8,
  },
  principalValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  principalWords: {
    fontSize: 12,
    color: '#D9D3C2',
    marginTop: 6,
    textAlign: 'center',
  },

  metaGrid: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
  },
  metaValueGold: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
  metaValueGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: GREEN,
  },

  // ---- QR ----
  qrWrap: {
    alignItems: 'center',
    marginTop: 4,
  },
  qrBox: {
    width: 112,
    height: 112,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  qrCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: DARK,
  },
  qrLink: {
    fontSize: 11,
    color: GOLD,
    marginTop: 2,
  },

  // ---- Note ----
  noteBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#5B5648',
  },

  // ---- Signatures ----
  signRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  signCol: {
    flex: 1,
    alignItems: 'center',
  },
  signLine: {
    width: '90%',
    height: 1,
    backgroundColor: '#C9C2AE',
    marginBottom: 6,
  },
  signLabel: {
    fontSize: 10,
    color: MUTED,
    textAlign: 'center',
  },
  sealWrap: {
    paddingHorizontal: 8,
  },
  sealCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealText: {
    fontSize: 8,
    fontWeight: '700',
    color: GOLD,
    textAlign: 'center',
    lineHeight: 10,
  },

  footerText: {
    fontSize: 9,
    color: MUTED,
    textAlign: 'center',
    marginTop: 4,
  },

  // ---- Not found ----
  notFoundWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  notFoundText: {
    fontSize: 14,
    color: MUTED,
    marginTop: 10,
  },

  // ---- Actions ----
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  closeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
  },
  shareBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: DARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  downloadBtn: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D9B8',
    backgroundColor: '#FBF3DE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  downloadBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD,
  },
});