import React from 'react';
import {View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image} from 'react-native';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/AdminDashboardScreen.styles';

const weeklyGrowth = [40, 62, 48, 70, 58, 88, 82]; // relative heights, purely visual
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const iconFor = (icon: 'investor' | 'bond' | 'transaction') => {
  if (icon === 'investor') return '👤';
  if (icon === 'bond') return '📄';
  return '↔';
};

const AdminDashboardScreen = ({navigation}: any) => {
  const {investors, activities, kycPendingCount} = useAppData();

  const totalAUM = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const activeInvestors = investors.filter(inv => inv.status === 'Active').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏦  INRFS</Text>
        <View style={styles.headerIcons}>
          <Text style={styles.bell}>🔔</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.aumCard}>
          <Text style={styles.aumLabel}>Total AUM</Text>
          <Text style={styles.aumValue}>
            ${totalAUM.toLocaleString(undefined, {minimumFractionDigits: 2})}
          </Text>
          <Text style={styles.aumChange}>↑ +12.4%  vs last quarter</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIconWrap, {backgroundColor: '#E7ECFB'}]}>
                <Text>👥</Text>
              </View>
              <View style={styles.badgeActive}>
                <Text style={styles.badgeActiveText}>Active</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>Investors</Text>
            <Text style={styles.statValue}>{investors.length.toLocaleString()}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statTopRow}>
              <View style={[styles.statIconWrap, {backgroundColor: '#FBE8E8'}]}>
                <Text>🛡</Text>
              </View>
              <View style={styles.badgeUrgent}>
                <Text style={styles.badgeUrgentText}>Urgent</Text>
              </View>
            </View>
            <Text style={styles.statLabel}>KYC Pending</Text>
            <Text style={styles.statValue}>{kycPendingCount}</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.chartTitle}>Weekly Investment Growth</Text>
            <Text style={styles.chartMenu}>•••</Text>
          </View>
          <View style={styles.chartBarsRow}>
            {weeklyGrowth.map((h, i) => (
              <View key={i} style={styles.chartBarCol}>
                <View style={[styles.chartBar, {height: h}]} />
              </View>
            ))}
          </View>
          <View style={styles.chartLabelsRow}>
            <Text style={styles.chartLabel}>{days[0]}</Text>
            <Text style={styles.chartLabel}>{days[2]}</Text>
            <Text style={styles.chartLabel}>{days[4]}</Text>
            <Text style={styles.chartLabel}>{days[6]}</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <TouchableOpacity>
            <Text style={styles.viewLogs}>View Logs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {activities.slice(0, 5).map((a, idx) => (
            <View
              key={a.id}
              style={[styles.activityRow, idx !== activities.slice(0, 5).length - 1 && styles.activityRowBorder]}>
              <View style={styles.activityIconWrap}>
                <Text>{iconFor(a.icon)}</Text>
              </View>
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityTitle}>{a.title}</Text>
                <Text style={styles.activitySubtitle}>{a.subtitle}</Text>
              </View>
              <Text style={styles.activityTime}>{a.time}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.riskCard}>
          <Text style={styles.riskIcon}>🛡</Text>
          <View style={styles.riskTextWrap}>
            <Text style={styles.riskTitle}>Quarterly Risk Assessment</Text>
            <Text style={styles.riskSubtitle}>Due in 4 days</Text>
          </View>
          <Text style={styles.riskArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Home</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('InvestorRegistry')}>
          <Text style={styles.tabIcon}>👥</Text>
          <Text style={styles.tabLabel}>Investors</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('BondTracking')}>
          <Text style={styles.tabIcon}>📁</Text>
          <Text style={styles.tabLabel}>Portfolio</Text>
        </TouchableOpacity>
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

export default AdminDashboardScreen;