import React, {useState} from 'react';
import {View, Text, ScrollView, SafeAreaView, TouchableOpacity} from 'react-native';
import {useAppData, Bond} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/BondTrackingScreen.styles';

type FilterKey = 'All Bonds' | 'Active' | 'Upcoming' | 'Settled';
const filters: FilterKey[] = ['All Bonds', 'Active', 'Upcoming', 'Settled'];

const statusStyle = (status: Bond['status']) => {
  if (status === 'Active') return {bg: '#DCFCE7', text: '#16A34A', dot: '#16A34A'};
  if (status === 'Upcoming') return {bg: '#DBEAFE', text: '#2563EB', dot: '#2563EB'};
  return {bg: '#E5E7EB', text: '#6B7280', dot: '#6B7280'};
};

const BondTrackingScreen = ({navigation}: any) => {
  const {bonds} = useAppData();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('All Bonds');

  const filtered = bonds.filter(b => activeFilter === 'All Bonds' || b.status === activeFilter);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.bell}>🔔</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Bond Tracking</Text>
        <Text style={styles.subtitle}>Manage and monitor institutional digital bond series.</Text>

        <View style={styles.filterRow}>
          {filters.map(f => {
            const active = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setActiveFilter(f)}>
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filtered.map(bond => {
          const s = statusStyle(bond.status);
          return (
            <View key={bond.seriesId} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.seriesLabel}>SERIES ID</Text>
                  <Text style={styles.seriesId}>{bond.seriesId}</Text>
                </View>
                <View style={[styles.statusBadge, {backgroundColor: s.bg}]}>
                  <View style={[styles.statusDot, {backgroundColor: s.dot}]} />
                  <Text style={[styles.statusText, {color: s.text}]}>{bond.status}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Investor</Text>
                  <Text style={styles.detailValueDark}>{bond.investorName}</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Amount</Text>
                  <Text style={styles.detailValueDark}>
                    ${bond.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Interest Rate</Text>
                  <Text style={styles.detailValue}>{bond.interestRate}% p.a.</Text>
                </View>
                <View>
                  <Text style={styles.detailLabel}>Invested</Text>
                  <Text style={styles.detailValueDark}>{bond.investedDate}</Text>
                </View>
              </View>

              <View style={styles.detailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Maturity Date</Text>
                  <Text style={styles.detailValueDark}>{bond.maturityDate}</Text>
                </View>
              </View>

              <View style={styles.progressHeaderRow}>
                <Text style={styles.progressLabel}>Subscription %</Text>
                <Text style={styles.progressValue}>{bond.subscriptionPercent}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${bond.subscriptionPercent}%`,
                      backgroundColor: bond.status === 'Settled' ? '#9CA3AF' : '#0B1E45',
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>📁</Text>
          <Text style={styles.tabLabelActive}>Portfolio</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InterestPayouts')}>
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Payouts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminProfile')}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BondTrackingScreen;