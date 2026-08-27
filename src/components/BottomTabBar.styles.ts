import {StyleSheet, Platform} from 'react-native';

const BG = '#FFFFFF';
const BORDER = '#E7EAF0';
const BLUE = '#155EEF';
const TEXT = '#101828';
const MUTED = '#98A2B3';

export const styles = StyleSheet.create({
  /*
   * =========================================================
   * BOTTOM NAVIGATION
   * =========================================================
   */

  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    height:
      Platform.OS === 'ios'
        ? 82
        : 68,

    backgroundColor: BG,

    borderTopWidth: 1,
    borderTopColor: BORDER,

    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',

    paddingTop: 7,

    paddingBottom:
      Platform.OS === 'ios'
        ? 8
        : 5,

    elevation: 14,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,

    zIndex: 100,
  },

  /*
   * =========================================================
   * ACTIVE INDICATOR
   * =========================================================
   */

  activeIndicator: {
    position: 'absolute',

    top: 0,
    left: 0,

    height: 3,

    borderRadius: 3,

    backgroundColor: BLUE,

    zIndex: 2,
  },

  /*
   * =========================================================
   * TAB ITEM
   * =========================================================
   */

  tabItem: {
    width: '25%',
    height: '100%',

    alignItems: 'center',
    justifyContent: 'flex-start',

    paddingTop: 2,
    paddingHorizontal: 3,
  },

  /*
   * =========================================================
   * ICON
   * =========================================================
   */

  iconWrap: {
    width: 42,
    height: 34,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',
  },

  iconWrapActive: {
    backgroundColor: '#EEF4FF',
  },

  /*
   * =========================================================
   * LABEL
   * =========================================================
   */

  label: {
    marginTop: 4,

    maxWidth: 88,

    textAlign: 'center',

    fontSize: 10.5,
    lineHeight: 14,

    fontWeight: '600',

    color: MUTED,
  },

  labelActive: {
    color: BLUE,
    fontWeight: '800',
  },

  /* ---------------------------------------------------------- */
  /* MORE MODAL                                                  */
  /* ---------------------------------------------------------- */

  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,

    backgroundColor: 'rgba(15,23,42,0.42)',
  },

  sheet: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,

    paddingHorizontal: 18,
    paddingTop: 9,

    paddingBottom:
      Platform.OS === 'ios' ? 28 : 18,

    elevation: 24,

    shadowColor: '#101828',

    shadowOffset: {
      width: 0,
      height: -6,
    },

    shadowOpacity: 0.16,
    shadowRadius: 18,
  },

  /*
   * =========================================================
   * GRABBER
   * =========================================================
   */

  grabber: {
    alignSelf: 'center',

    width: 42,
    height: 4,

    borderRadius: 4,

    backgroundColor: '#D0D5DD',

    marginBottom: 18,
  },

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  sheetHeader: {
    minHeight: 48,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sheetBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sheetLogoWrap: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    marginRight: 10,
  },

  sheetLogo: {
    width: 34,
    height: 34,
  },

  sheetBrandText: {
    justifyContent: 'center',
  },

  sheetHeaderTitle: {
    fontSize: 16,

    fontWeight: '900',

    color: TEXT,

    letterSpacing: 0.2,
  },

  sheetHeaderSubtitle: {
    marginTop: 1,

    fontSize: 11,

    color: '#667085',

    fontWeight: '600',
  },

  /*
   * =========================================================
   * CLOSE BUTTON
   * =========================================================
   */

  closeButton: {
    width: 38,
    height: 38,

    borderRadius: 12,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',
    justifyContent: 'center',
  },

  /*
   * =========================================================
   * DIVIDER
   * =========================================================
   */

  sheetDivider: {
    height: 1,

    backgroundColor: BORDER,

    marginVertical: 14,
  },

  /*
   * =========================================================
   * MENU ITEM
   * =========================================================
   */

  sheetItem: {
    minHeight: 54,

    borderRadius: 15,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 10,

    marginBottom: 5,
  },

  sheetItemActive: {
    backgroundColor: '#EEF4FF',
  },

  /*
   * =========================================================
   * MENU ICON
   * =========================================================
   */

  sheetItemIconWrap: {
    width: 38,
    height: 38,

    borderRadius: 11,

    backgroundColor: '#F2F4F7',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  sheetItemIconWrapActive: {
    backgroundColor: '#DCE9FF',
  },

  /*
   * =========================================================
   * MENU TEXT
   * =========================================================
   */

  sheetItemText: {
    flex: 1,

    fontSize: 14,

    fontWeight: '700',

    color: '#344054',
  },

  sheetItemTextActive: {
    color: BLUE,
  },

  sheetItemTextDisabled: {
    color: '#D0D5DD',
  },

  /*
   * =========================================================
   * FOOTER
   * =========================================================
   */

  sheetFooter: {
    borderTopWidth: 1,
    borderTopColor: BORDER,

    marginTop: 12,

    paddingTop: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sheetUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sheetAvatar: {
    width: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor: '#EEF4FF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  sheetAvatarText: {
    color: BLUE,

    fontSize: 13,

    fontWeight: '900',
  },

  sheetUserInfo: {
    justifyContent: 'center',
  },

  sheetUserName: {
    fontSize: 13.5,

    fontWeight: '800',

    color: TEXT,
  },

  sheetUserSub: {
    marginTop: 2,

    fontSize: 11,

    color: '#667085',
  },

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  logoutButton: {
    width: 42,
    height: 42,

    borderRadius: 12,

    backgroundColor: '#EEF4FF',

    alignItems: 'center',
    justifyContent: 'center',
  },
});