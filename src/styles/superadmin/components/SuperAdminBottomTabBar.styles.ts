import {StyleSheet, Platform} from 'react-native';

export const styles = StyleSheet.create({
  /* ============================================================
     BOTTOM TAB BAR
     ============================================================ */

  tabBar: {
    height: Platform.OS === 'ios' ? 82 : 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#EAECF0',

    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 18 : 6,

    elevation: 10,

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },

  tabItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    minHeight: 54,

    position: 'relative',
  },

  /* ============================================================
     ICON
     ============================================================ */

  iconWrap: {
    width: 38,
    height: 34,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',
  },

  iconWrapActive: {
    backgroundColor: '#EAF0FE',
  },

  /* ============================================================
     LABEL
     ============================================================ */

  label: {
    marginTop: 3,

    fontSize: 11,
    lineHeight: 14,

    color: '#98A2B3',

    fontWeight: '500',

    textAlign: 'center',
  },

  labelActive: {
    color: '#155EEF',
    fontWeight: '700',
  },

  /* ============================================================
     NOTIFICATION DOT
     ============================================================ */

  dot: {
    position: 'absolute',

    top: -2,
    right: -5,

    minWidth: 16,
    height: 16,

    paddingHorizontal: 3,

    borderRadius: 8,

    backgroundColor: '#EF4444',

    alignItems: 'center',
    justifyContent: 'center',
  },

  dotText: {
    color: '#FFFFFF',

    fontSize: 9,
    fontWeight: '700',

    textAlign: 'center',
  },

  /* ============================================================
     MODAL
     ============================================================ */

  backdrop: {
    flex: 1,

    backgroundColor: 'rgba(16, 24, 40, 0.42)',
  },

  /* ============================================================
     MORE SHEET
     ============================================================ */

  sheet: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,

    paddingHorizontal: 16,
    paddingTop: 10,

    paddingBottom: Platform.OS === 'ios' ? 30 : 20,

    maxHeight: '82%',

    shadowColor: '#101828',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    elevation: 18,
  },

  /* ============================================================
     SHEET GRABBER
     ============================================================ */

  grabber: {
    width: 42,
    height: 4,

    borderRadius: 2,

    backgroundColor: '#D0D5DD',

    alignSelf: 'center',

    marginBottom: 14,
  },

  /* ============================================================
     SHEET HEADER
     ============================================================ */

  sheetHeader: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'flex-start',

    marginBottom: 14,
  },

  sheetLogoWrap: {
    width: 100,
    height: 42,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    overflow: 'hidden',

    backgroundColor: '#FFFFFF',
  },

  sheetLogo: {
    width: '100%',
    height: '100%',
  },

  /* ============================================================
     SHEET MENU ITEMS
     ============================================================ */

  sheetItem: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 12,
    paddingHorizontal: 10,

    borderRadius: 10,

    marginBottom: 2,
  },

  sheetItemActive: {
    backgroundColor: '#EAF0FE',
  },

  sheetItemIcon: {
    width: 28,

    marginRight: 10,

    textAlign: 'center',
  },

  sheetItemText: {
    flex: 1,

    fontSize: 14,
    lineHeight: 20,

    color: '#475467',

    fontWeight: '500',
  },

  sheetItemTextActive: {
    color: '#155EEF',

    fontWeight: '700',
  },

  sheetItemTextDisabled: {
    color: '#D0D5DD',
  },

  /* ============================================================
     SHEET FOOTER
     ============================================================ */

  sheetFooter: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginTop: 8,

    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: '#EAECF0',
  },

  sheetUserRow: {
    flexDirection: 'row',

    alignItems: 'center',

    flex: 1,
  },

  sheetAvatar: {
    width: 38,
    height: 38,

    borderRadius: 19,

    backgroundColor: '#155EEF',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  sheetAvatarText: {
    color: '#FFFFFF',

    fontSize: 13,
    fontWeight: '700',
  },

  sheetUserName: {
    fontSize: 14,

    lineHeight: 20,

    fontWeight: '700',

    color: '#101828',
  },

  sheetUserSub: {
    marginTop: 1,

    fontSize: 12,

    lineHeight: 18,

    color: '#98A2B3',

    fontWeight: '500',
  },
});