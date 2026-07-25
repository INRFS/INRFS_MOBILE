import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {styles} from '../styles/SplashScreen.styles';

const SplashScreen = ({navigation}: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Landing');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <View style={styles.roof} />
        <View style={styles.pillarsRow}>
          <View style={styles.pillar} />
          <View style={styles.pillar} />
          <View style={styles.pillar} />
        </View>
        <View style={styles.base} />
      </View>
      <Text style={styles.title}>INRFS</Text>
      <Text style={styles.subtitle}>INSTITUTIONAL FINANCIAL SERVICES</Text>
    </View>
  );
};

export default SplashScreen;