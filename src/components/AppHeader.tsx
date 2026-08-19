import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

const NAVY = '#102A56';
const MUTED = '#7B8798';
const BORDER = '#E8ECF2';

const BRAND_BLUE = '#1677E8';
const BRAND_GREEN = '#12B95A';
const BRAND_ORANGE = '#F59E0B';
const BRAND_PINK = '#F43F5E';
const BRAND_PURPLE = '#8B5CF6';

const INRFSLogo = () => {
  return (
    <View style={logoStyles.logo}>
      {/* Top */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalTop,
          {backgroundColor: BRAND_BLUE},
        ]}
      />

      {/* Top right */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalTopRight,
          {backgroundColor: BRAND_GREEN},
        ]}
      />

      {/* Right */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalRight,
          {backgroundColor: BRAND_ORANGE},
        ]}
      />

      {/* Bottom right */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalBottomRight,
          {backgroundColor: BRAND_PINK},
        ]}
      />

      {/* Bottom left */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalBottomLeft,
          {backgroundColor: BRAND_PURPLE},
        ]}
      />

      {/* Left */}
      <View
        style={[
          logoStyles.petal,
          logoStyles.petalLeft,
          {backgroundColor: '#0EA5E9'},
        ]}
      />

      {/* Center */}
      <View style={logoStyles.center} />
    </View>
  );
};

type AppHeaderProps = {
  subtitle?: string;
};

const AppHeader = ({
  subtitle = 'Investment Portal',
}: AppHeaderProps) => {
  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <View style={styles.logoContainer}>
          <INRFSLogo />
        </View>

        <View style={styles.brandText}>
          <Text style={styles.brandTitle}>INRFS</Text>
          <Text style={styles.brandSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
};

const logoStyles = StyleSheet.create({
  logo: {
    width: 34,
    height: 34,
    position: 'relative',
  },

  petal: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
  },

  petalTop: {
    top: 0,
    left: 10,
  },

  petalTopRight: {
    top: 5,
    right: 1,
  },

  petalRight: {
    top: 15,
    right: 0,
  },

  petalBottomRight: {
    bottom: 1,
    right: 6,
  },

  petalBottomLeft: {
    bottom: 2,
    left: 5,
  },

  petalLeft: {
    top: 10,
    left: 0,
  },

  center: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FBBF24',
    top: 11,
    left: 11,
  },
});

const styles = StyleSheet.create({
  header: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingHorizontal: 18,

    flexDirection: 'row',
    alignItems: 'center',

    // Premium subtle elevation
    shadowColor: '#0F172A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoContainer: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brandText: {
    justifyContent: 'center',
  },

  brandTitle: {
    color: NAVY,
    fontSize: width < 380 ? 18 : 19,
    fontWeight: '900',
    letterSpacing: 0.25,
    lineHeight: 22,
  },

  brandSubtitle: {
    color: MUTED,
    fontSize: width < 380 ? 10.5 : 11,
    fontWeight: '500',
    letterSpacing: 0.15,
    marginTop: 1,
  },
});

export default AppHeader;