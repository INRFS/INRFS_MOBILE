import React from 'react';
import {View, Text, ScrollView, Dimensions} from 'react-native';
import {LineChart, BarChart, PieChart} from 'react-native-chart-kit';
import {styles} from '../../styles/superadmin/SuperAdminDashboardScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32 - 32; // container padding + card padding

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  propsForDots: {r: '3', strokeWidth: '2', stroke: '#2563EB'},
  propsForBackgroundLines: {stroke: '#F0F1F3'},
};

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const investmentPerformanceData = {
  labels: monthLabels,
  datasets: [{data: [8, 10, 12, 14, 16, 18, 20]}],
};

const investorGrowthData = {
  labels: monthLabels,
  datasets: [
    {
      data: [820, 880, 930, 980, 1050, 1120, 1200],
      color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
    },
  ],
};

const branchPerformanceData = {
  labels: ['Hyderabad', 'Bengaluru', 'Chennai', 'Vijayawada', 'Pune'],
  datasets: [{data: [300, 260, 220, 180, 90]}],
};

const investmentStatusData = [
  {name: 'Active', population: 62, color: '#2563EB', legendFontColor: '#374151', legendFontSize: 12},
  {name: 'Pending', population: 16, color: '#F59E0B', legendFontColor: '#374151', legendFontSize: 12},
  {name: 'Closed', population: 14, color: '#16A34A', legendFontColor: '#374151', legendFontSize: 12},
  {name: 'Rejected', population: 8, color: '#DC2626', legendFontColor: '#374151', legendFontSize: 12},
];

const SuperAdminDashboardScreen = ({navigation}: any) => {
  const {branches, saAdmins, investors, systemUsers} = useAppData();

  const totalBranches = branches.length;
  const totalAdmins = saAdmins.length;
  const totalInvestors = investors.length > 0 ? 1247 : 0; // matches web total (mock investor list here is a small sample)
  const systemAum = '₹58.4Cr';
  const activeSessions = systemUsers.filter(u => u.status === 'Active').length + 38; // approximated to match web sample
  const systemHealth = '99.9%';

  const statCards = [
    {label: 'Total Branches', value: String(totalBranches || 14), sub: '+2 this year', trend: 'up', icon: '🏢', bg: '#EEF2FF', color: '#4F46E5'},
    {label: 'Total Admins', value: String(totalAdmins || 28), sub: '24 active', trend: 'neutral', icon: '🛡️', bg: '#F0F9FF', color: '#0284C7'},
    {label: 'Total Investors', value: totalInvestors.toLocaleString(), sub: '+8.1% growth', trend: 'up', icon: '👥', bg: '#FDF4FF', color: '#A21CAF'},
    {label: 'System AUM', value: systemAum, sub: '+6.2% this month', trend: 'up', icon: '💰', bg: '#F0FDF4', color: '#16A34A'},
    {label: 'Active Sessions', value: String(activeSessions), sub: 'Stable', trend: 'neutral', icon: '📶', bg: '#FFFBEB', color: '#D97706'},
    {label: 'System Health', value: systemHealth, sub: 'All systems operational', trend: 'up', icon: '✅', bg: '#ECFDF5', color: '#059669'},
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Super Admin Dashboard" showBack={false} />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Complete system oversight and configuration</Text>

        <View style={styles.statsGrid}>
          {statCards.map(stat => (
            <View key={stat.label} style={[styles.statCard, {borderLeftColor: stat.color}]}>
              <View style={styles.statCardTopRow}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <View style={[styles.statIconBadge, {backgroundColor: stat.bg}]}>
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <View style={styles.statSubRow}>
                <Text style={stat.trend === 'up' ? styles.statTrendUp : styles.statTrendNeutral}>
                  {stat.trend === 'up' ? '↑' : '•'}
                </Text>
                <Text style={styles.statSub}>{stat.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Investment Performance */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Investment Performance</Text>
          <Text style={styles.chartSubtitle}>Monthly investment activity and value</Text>
          <LineChart
            data={investmentPerformanceData}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            bezier
            withInnerLines={true}
            withOuterLines={false}
            style={styles.chartStyle}
          />
        </View>

        {/* Investment Status */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Investment Status</Text>
          <Text style={styles.chartSubtitle}>Current portfolio distribution</Text>
          <PieChart
            data={investmentStatusData}
            width={chartWidth}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="12"
            hasLegend={true}
          />
        </View>

        {/* Investor Growth */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Investor Growth</Text>
          <Text style={styles.chartSubtitle}>Registered investors over time</Text>
          <LineChart
            data={investorGrowthData}
            width={chartWidth}
            height={180}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
              propsForDots: {r: '3', strokeWidth: '2', stroke: '#16A34A'},
            }}
            bezier
            withInnerLines={true}
            withOuterLines={false}
            style={styles.chartStyle}
          />
        </View>

        {/* Branch Performance */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Branch Performance</Text>
          <Text style={styles.chartSubtitle}>Investor distribution across major branches</Text>
          <BarChart
            data={branchPerformanceData}
            width={chartWidth}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
              barPercentage: 0.6,
            }}
            fromZero
            showValuesOnTopOfBars
            withInnerLines={true}
            style={styles.chartStyle}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Dashboard" />
    </SafeAreaView>
  );
};

export default SuperAdminDashboardScreen;