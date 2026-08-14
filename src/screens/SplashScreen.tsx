import React, {useEffect} from 'react';
import {View, Text, Image} from 'react-native';
import {styles} from '../styles/SplashScreen.styles';
// import {SafeAreaView} from 'react-native-safe-area-context';

// Soft ambient glow with a thin gold arc segment, top-left corner.
const TopLeftGlow = () => (
  <View pointerEvents="none" style={styles.topGlowWrap}>
    <View style={styles.topGlowCore} />
    <View style={styles.topGlowArc} />
  </View>
);

// Layered navy wave with a thin diagonal gold highlight streak,
// anchored to the bottom of the screen.
const BottomWaveDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <View style={styles.waveDeep} />
    <View style={styles.waveMid} />
    <View style={styles.waveFront} />
    <View style={styles.waveGoldStreak} />
  </View>
);

const SplashScreen = ({navigation}: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Landing');
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <TopLeftGlow />

      <View style={styles.content}>
        <View style={styles.logoGlow} />
        <View style={styles.logoBox}>
          <Image source={require('../assets/logo.jpeg')} style={styles.logoImg} resizeMode="contain" />
        </View>

        <Text style={styles.title}>INRFS</Text>
        <Text style={styles.subtitle}>INSTITUTIONAL FINANCIAL SERVICES</Text>

        <View style={styles.taglineBlock}>
          <Text style={styles.taglineLine1}>Smarter Investments.</Text>
          <Text style={styles.taglineLine2}>A Stronger Tomorrow.</Text>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDiamond} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.trustRow}>TRUST  /  GROWTH  /  TOGETHER</Text>
      </View>

      <BottomWaveDecor />

      <View style={styles.footerWrap}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Text style={styles.footerCaption}>POWERING YOUR FINANCIAL FUTURE</Text>
      </View>
    </View>
  );
};

export default SplashScreen;