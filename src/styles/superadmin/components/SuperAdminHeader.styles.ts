import {StyleSheet, Platform} from 'react-native';

export const styles = StyleSheet.create({
  /*
   * ============================================================
   * MAIN HEADER
   * ============================================================
   */

  container: {
    minHeight: Platform.OS === 'ios' ? 58 : 56,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: 16,

    paddingVertical: 10,

    backgroundColor: '#FFFFFF',

    borderBottomWidth: 1,

    borderBottomColor: '#E5E7EB',

    shadowColor: '#101828',

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.04,

    shadowRadius: 3,

    elevation: 2,
  },

  /*
   * ============================================================
   * LEFT
   * ============================================================
   */

  left: {
    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    minWidth: 0,
  },

  /*
   * ============================================================
   * BACK BUTTON
   * ============================================================
   */

  backBtn: {
    width: 34,
    height: 34,

    borderRadius: 17,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 8,
  },

  backArrow: {
    fontSize: 25,

    lineHeight: 28,

    color: '#101828',

    fontWeight: '400',
  },

  /*
   * ============================================================
   * TITLE
   * ============================================================
   */

  title: {
    flexShrink: 1,

    fontSize: 18,

    lineHeight: 23,

    fontWeight: '700',

    color: '#101828',
  },

  /*
   * ============================================================
   * RIGHT
   * ============================================================
   */

  right: {
    flexDirection: 'row',

    alignItems: 'center',

    marginLeft: 10,
  },

  /*
   * ============================================================
   * AVATAR
   * ============================================================
   */

  avatar: {
    width: 36,
    height: 36,

    borderRadius: 18,

    backgroundColor: '#155EEF',

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor: '#EAF0FE',
  },

  avatarText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '700',

    textAlign: 'center',
  },

  /*
   * ============================================================
   * OPTIONAL NOTIFICATION STYLES
   * ============================================================
   */

  bellWrap: {
    position: 'relative',

    width: 36,
    height: 36,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 8,
  },

  bellIcon: {
    fontSize: 20,

    color: '#475467',
  },

  dot: {
    position: 'absolute',

    top: 1,
    right: 1,

    minWidth: 16,
    height: 16,

    borderRadius: 8,

    backgroundColor: '#DC2626',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: 3,
  },

  dotText: {
    color: '#FFFFFF',

    fontSize: 9,

    fontWeight: '700',

    textAlign: 'center',
  },
});