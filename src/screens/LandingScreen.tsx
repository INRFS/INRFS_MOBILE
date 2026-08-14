import React from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../styles/LandingScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';

// Soft blurred blob with layered ring outlines, top-right corner —
// plain Views only, no native SVG dependency required.
const TopRightDecor = () => (
  <View pointerEvents="none" style={styles.topDecorWrap}>
    <View style={styles.topDecorBlob} />
    <View style={styles.topDecorArcFar} />
    <View style={styles.topDecorArcOuter} />
    <View style={styles.topDecorArcInner} />
  </View>
);

// Layered wavy gradient along the bottom of the screen.
const BottomWaveDecor = () => (
  <View pointerEvents="none" style={styles.bottomDecorWrap}>
    <View style={styles.bgWaveDeep} />
    <View style={styles.bgWaveMid} />
    <View style={styles.bgWaveFront} />
  </View>
);

const LandingScreen = ({navigation}: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopRightDecor />
      <BottomWaveDecor />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <Image source={require('../assets/logo.jpeg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brand}>Financer Platform</Text>
        </View>

        <Text style={styles.title}>
          Secure investor management, <Text style={styles.titleAccent}>in your pocket</Text>
        </Text>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.subtitle}>
          Track investments and manage your portfolio from anywhere
        </Text>

        <View style={styles.cardRow}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Login')}>
            <View style={[styles.cardWaveBack, {backgroundColor: '#E2E9FE'}]} pointerEvents="none" />
            <View style={[styles.cardWaveMid, {backgroundColor: '#CFDBFC'}]} pointerEvents="none" />
            <View style={[styles.cardWaveFront, {backgroundColor: '#BFD3FA'}]} pointerEvents="none" />
            <View style={[styles.cardIconBox, {backgroundColor: '#E5EEFF'}]}>
              <Icon name="account" size={28} color="#3B5BFF" />
            </View>
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardSubtitle}>
              Access your portfolio{'\n'}and manage investments
            </Text>
            <View style={[styles.cardArrowBtn, {backgroundColor: '#3B5BFF'}]}>
              <Icon name="arrow-right" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Registration')}>
            <View style={[styles.cardWaveBack, {backgroundColor: '#EDE6FC'}]} pointerEvents="none" />
            <View style={[styles.cardWaveMid, {backgroundColor: '#DED0FA'}]} pointerEvents="none" />
            <View style={[styles.cardWaveFront, {backgroundColor: '#D0BFF7'}]} pointerEvents="none" />
            <View style={[styles.cardIconBox, {backgroundColor: '#F1E9FF'}]}>
              <Icon name="lock" size={26} color="#6D3BEB" />
            </View>
            <Text style={styles.cardTitle}>Register as investor</Text>
            <Text style={styles.cardSubtitle}>
              Create your account{'\n'}and start investing
            </Text>
            <View style={[styles.cardArrowBtn, {backgroundColor: '#6D3BEB'}]}>
              <Icon name="arrow-right" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#E5EEFF'}]}>
              <Icon name="shield-check" size={16} color="#3B5BFF" />
            </View>
            <Text style={styles.trustLabel}>Bank-grade{'\n'}security</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#F1E9FF'}]}>
              <Icon name="certificate-outline" size={16} color="#6D3BEB" />
            </View>
            <Text style={styles.trustLabel}>SEBI{'\n'}registered</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={[styles.trustIconBox, {backgroundColor: '#E6F7EE'}]}>
              <Icon name="check-decagram-outline" size={16} color="#16A34A" />
            </View>
            <Text style={styles.trustLabel}>Secure &{'\n'}Trusted</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LandingScreen;