import React from 'react';
import {View, Text, ScrollView, TouchableOpacity,  Alert} from 'react-native';
// Use require to import styles file which may not be recognized as a TS module
const {styles} = require('../../styles/superadmin/SuperAdminReportsScreen.styles');
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
const monthlyPerformance = [
  {month: 'Jan', invested: 18, interest: 3},
  {month: 'Feb', invested: 22, interest: 4},
  {month: 'Mar', invested: 27, interest: 5},
  {month: 'Apr', invested: 33, interest: 6},
  {month: 'May', invested: 44, interest: 7},
  {month: 'Jun', invested: 49, interest: 8},
  {month: 'Jul', invested: 57, interest: 9},
];

const MAX_VALUE = 60; // ₹60.0L axis ceiling, matches the web chart
const CHART_HEIGHT = 140;

const SuperAdminReportsScreen = ({navigation}: any) => {
  const handleExport = (type: string) => {
    Alert.alert('Export started', `Preparing ${type} export...`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Super Admin Reports" showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('Excel')}>
            <Text style={styles.exportBtnText}>⬇ Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportBtn, styles.exportBtnPrimary]} onPress={() => handleExport('PDF')}>
            <Text style={[styles.exportBtnText, styles.exportBtnTextPrimary]}>⬇ Export PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NEW INVESTMENTS</Text>
            <Text style={styles.statValue}>₹4.8Cr</Text>
            <Text style={styles.statChangeUp}>↑ +18% vs last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>INTEREST PAID</Text>
            <Text style={styles.statValue}>₹48.2L</Text>
            <Text style={styles.statChangeUp}>↑ +12% vs last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SETTLEMENTS</Text>
            <Text style={styles.statValue}>₹8.4L</Text>
            <Text style={styles.statChangeDown}>↓ -5% vs last month</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Performance</Text>
          <View style={styles.chartArea}>
            {monthlyPerformance.map(m => (
              <View key={m.month} style={styles.barGroup}>
                <View style={styles.barsWrap}>
                  <View
                    style={[
                      styles.bar,
                      styles.barInvested,
                      {height: (m.invested / MAX_VALUE) * CHART_HEIGHT},
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.barInterest,
                      {height: (m.interest / MAX_VALUE) * CHART_HEIGHT},
                    ]}
                  />
                </View>
                <Text style={styles.barMonthLabel}>{m.month}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.barInterest]} />
              <Text style={styles.legendText}>Interest</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.barInvested]} />
              <Text style={styles.legendText}>Invested</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Reports" />
    </SafeAreaView>
  );
};

export default SuperAdminReportsScreen;