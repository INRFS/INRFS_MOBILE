import React from 'react';
import {View, Text, TouchableOpacity,} from 'react-native';
import {styles} from '../styles/LandingScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const LandingScreen = ({navigation}: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>IN</Text>
        </View>
        <Text style={styles.brand}>INRFS</Text>

        <View style={styles.heroPlaceholder} />

        <Text style={styles.title}>Secure investor management, in your pocket</Text>
        <Text style={styles.subtitle}>
          Track investments and manage your portfolio from anywhere
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryBtnText}>Login  →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Registration')}>
          <Text style={styles.secondaryBtnText}>Register as investor</Text>
        </TouchableOpacity>

        <View style={styles.trustRow}>
          <Text style={styles.trustText}>🛡 Bank-grade security</Text>
          <Text style={styles.trustText}>📜 SEBI registered</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingScreen;