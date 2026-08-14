import {StyleSheet} from 'react-native';

export const NAVY_DARK = '#0A1638';
export const NAVY = '#0F2354';
export const NAVY_LIGHT = '#1B3A7A';
export const GOLD = '#F0B94D';
export const TEXT_MUTED = '#7C8AB8';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY_DARK,
  },

  // ---- Top-left ambient glow + gold arc ----
  topGlowWrap: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 300,
    height: 300,
  },
  topGlowCore: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#2A4FA8',
    opacity: 0.35,
  },
  topGlowArc: {
    position: 'absolute',
    top: 30,
    left: 30,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(240,185,77,0.55)',
  },

  // ---- Main content ----
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoGlow: {
    position: 'absolute',
    top: -18,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#3E5FC4',
    opacity: 0.35,
  },
  logoBox: {
    width: 112,
    height: 112,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowColor: '#3E5FC4',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
  },
  logoImg: {width: 78, height: 78},

  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    letterSpacing: 3,
    marginTop: 8,
    marginBottom: 46,
  },

  taglineBlock: {alignItems: 'center', marginBottom: 22},
  taglineLine1: {
    fontSize: 22,
    fontWeight: '400',
    color: '#EDEFF7',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  taglineLine2: {
    fontSize: 22,
    fontWeight: '400',
    color: GOLD,
    fontStyle: 'italic',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    gap: 10,
  },
  dividerLine: {width: 44, height: 1, backgroundColor: 'rgba(240,185,77,0.45)'},
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: GOLD,
    transform: [{rotate: '45deg'}],
  },

  trustRow: {
    fontSize: 12,
    color: TEXT_MUTED,
    letterSpacing: 3,
    fontWeight: '500',
  },

  // ---- Bottom wave decoration ----
  bottomDecorWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 260,
    overflow: 'hidden',
  },
  waveDeep: {
    position: 'absolute',
    bottom: -170,
    left: -60,
    right: -60,
    height: 320,
    borderRadius: 999,
    backgroundColor: NAVY,
    opacity: 0.9,
  },
  waveMid: {
    position: 'absolute',
    bottom: -130,
    left: -30,
    right: -30,
    height: 260,
    borderRadius: 999,
    backgroundColor: NAVY_LIGHT,
    opacity: 0.7,
  },
  waveFront: {
    position: 'absolute',
    bottom: -100,
    left: -10,
    right: -10,
    height: 210,
    borderRadius: 999,
    backgroundColor: '#24418C',
    opacity: 0.55,
  },
  // Thin diagonal gold streak crossing the wave crest, like the mockup's
  // shining highlight line.
  waveGoldStreak: {
    position: 'absolute',
    bottom: 96,
    left: -40,
    width: '150%',
    height: 1.5,
    backgroundColor: GOLD,
    opacity: 0.65,
    transform: [{rotate: '-9deg'}],
  },

  // ---- Footer ----
  footerWrap: {
    position: 'absolute',
    bottom: 34,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsRow: {flexDirection: 'row', gap: 6, marginBottom: 14},
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 16,
    backgroundColor: GOLD,
  },
  footerCaption: {
    fontSize: 10.5,
    color: TEXT_MUTED,
    letterSpacing: 2.5,
  },
});