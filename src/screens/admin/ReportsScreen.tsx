import React from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Image, Alert} from 'react-native';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/ReportsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
/* Static monthly series for the "Monthly Performance" chart.
   Mirrors the shape of the web Admin Portal chart (Interest vs Invested).
   Swap for real aggregated data once historical records exist. */
const monthlyPerformance = [
  {label: 'Jan', invested: 30, interest: 8},
  {label: 'Feb', invested: 42, interest: 10},
  {label: 'Mar', invested: 52, interest: 12},
  {label: 'Apr', invested: 64, interest: 14},
  {label: 'May', invested: 78, interest: 16},
  {label: 'Jun', invested: 88, interest: 18},
  {label: 'Jul', invested: 98, interest: 20},
];

/** Formats a rupee amount the way the web dashboard does: ₹4.8Cr / ₹48.2L / ₹12,340 */
const formatINRCompact = (value: number): string => {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const activityIconFor = (icon: 'investor' | 'bond' | 'transaction') => {
  if (icon === 'investor') return '👤';
  if (icon === 'bond') return '📄';
  return '💳';
};

const ReportsScreen = ({navigation}: any) => {
  const {investors, bonds, payouts, activities, adminProfile} = useAppData();

  const newInvestments = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const interestPaid = payouts.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const settlements = bonds.filter(b => b.status === 'Settled').reduce((sum, b) => sum + b.amount, 0);

  const maxBar = Math.max(...monthlyPerformance.map(m => m.invested));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => navigation.navigate('AdminProfile')}>
          <Image source={{uri: adminProfile.avatarUri}} style={styles.avatar} />
          <Text style={styles.headerTitle}>Reports</Text>
        </TouchableOpacity>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stat cards — mirrors web: New Investments / Interest Paid / Settlements */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>NEW INVESTMENTS</Text>
            <Text style={styles.statValue}>{formatINRCompact(newInvestments)}</Text>
            <Text style={styles.statDeltaGood}>↗ +18% vs last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>INTEREST PAID</Text>
            <Text style={styles.statValue}>{formatINRCompact(interestPaid)}</Text>
            <Text style={styles.statDeltaGood}>↗ +12% vs last month</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SETTLEMENTS</Text>
            <Text style={styles.statValue}>{formatINRCompact(settlements)}</Text>
            <Text style={styles.statDeltaBad}>↘ -5% vs last month</Text>
          </View>
        </ScrollView>

        {/* Export actions */}
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportBtnOutline}
            onPress={() => Alert.alert('Export Excel', 'Wire this up to a real export once the backend is ready.')}>
            <Text style={styles.exportBtnOutlineText}>🗂  Export Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportBtnFilled}
            onPress={() => Alert.alert('Export PDF', 'Wire this up to a real export once the backend is ready.')}>
            <Text style={styles.exportBtnFilledText}>📄  Export PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Performance chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Monthly Performance</Text>
          <View style={styles.chartBarsRow}>
            {monthlyPerformance.map(m => (
              <View key={m.label} style={styles.chartBarCol}>
                <View style={styles.chartBarPair}>
                  <View
                    style={[
                      styles.chartBarInterest,
                      {height: Math.max(4, (m.interest / maxBar) * 100)},
                    ]}
                  />
                  <View
                    style={[
                      styles.chartBarInvested,
                      {height: Math.max(4, (m.invested / maxBar) * 100)},
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
          <View style={styles.chartLabelsRow}>
            {monthlyPerformance.map(m => (
              <Text key={m.label} style={styles.chartLabel}>{m.label}</Text>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#4ADE80'}]} />
              <Text style={styles.legendLabel}>INTEREST</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, {backgroundColor: '#0B1E45'}]} />
              <Text style={styles.legendLabel}>INVESTED</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('InvestorRegistry')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {activities.slice(0, 6).map((a, idx) => (
            <View
              key={a.id}
              style={[styles.activityRow, idx !== activities.slice(0, 6).length - 1 && styles.activityRowBorder]}>
              <View style={styles.activityIconWrap}>
                <Text>{activityIconFor(a.icon)}</Text>
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySubtitle}>{a.subtitle}</Text>
              </View>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          ))}
          {activities.length === 0 && (
            <Text style={styles.emptyText}>No recent activity yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;