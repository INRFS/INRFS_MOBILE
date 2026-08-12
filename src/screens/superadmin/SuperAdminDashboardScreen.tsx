import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, } from 'react-native';
import {styles} from '../../styles/superadmin/SuperAdminDashboardScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
const SuperAdminDashboardScreen = ({navigation}: any) => {
  const {branches, saAdmins, investors, systemUsers, auditLogs} = useAppData();

  const totalBranches = branches.length;
  const totalAdmins = saAdmins.length;
  const totalInvestors = investors.length > 0 ? 1247 : 0; // matches web total (mock investor list here is a small sample)
  const systemAum = '₹58.4Cr';
  const activeSessions = systemUsers.filter(u => u.status === 'Active').length + 38; // approximated to match web sample
  const systemHealth = '99.9%';

  const statCards = [
    {label: 'Total Branches', value: String(totalBranches || 14), icon: '🏢'},
    {label: 'Total Admins', value: String(totalAdmins || 28), icon: '🛡'},
    {label: 'Total Investors', value: totalInvestors.toLocaleString(), icon: '👥'},
    {label: 'System AUM', value: systemAum, icon: '💰'},
    {label: 'Active Sessions', value: String(activeSessions), icon: '📶'},
    {label: 'System Health', value: systemHealth, icon: '✅'},
  ];

  const quickSections = [
    {
      title: 'Branch Management',
      icon: '🏢',
      route: 'BranchManagement',
      actions: ['Add Branch', 'Edit Branch', 'View Performance', 'Assign Admin'],
    },
    {
      title: 'Admin Management',
      icon: '🛡',
      route: 'AdminManagement',
      actions: ['Create Admin', 'Assign Role', 'Reset Password', 'Deactivate'],
    },
  ];

  const recentLogs = auditLogs.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Super Admin Dashboard" showBack={false} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>Complete system oversight and configuration</Text>

        <View style={styles.statsGrid}>
          {statCards.map(stat => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {quickSections.map(section => (
          <View key={section.title} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <Text style={styles.sectionIcon}>{section.icon}</Text>
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => navigation.navigate(section.route)}>
                <Text style={styles.manageBtnText}>Manage</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsGrid}>
              {section.actions.map(action => (
                <TouchableOpacity
                  key={action}
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate(section.route)}>
                  <Text style={styles.actionBtnText}>{action}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Audit Logs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AuditLogs')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentLogs.map(log => (
            <View key={log.id} style={styles.logRow}>
              <View style={styles.logRowLeft}>
                <Text style={styles.logUser}>{log.user}</Text>
                <Text style={styles.logMeta}>
                  {log.role} • {log.timestamp}
                </Text>
                <Text style={styles.logAction}>{log.action}</Text>
              </View>
              <View style={[styles.statusPill, log.status === 'Failed' && styles.statusPillFailed]}>
                <Text style={[styles.statusPillText, log.status === 'Failed' && styles.statusPillTextFailed]}>
                  {log.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Dashboard" />
    </SafeAreaView>
  );
};

export default SuperAdminDashboardScreen;