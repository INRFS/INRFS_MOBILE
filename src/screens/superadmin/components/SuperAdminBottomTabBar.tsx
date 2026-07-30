import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from '../../../styles/superadmin/components/SuperAdminBottomTabBar.styles';
// import {styles} from '../../../styles/superadmin/SuperAdminBottomTabBar.styles';
import {useAppData} from '../../../navigation/AppNavigator';

type TabKey = 'Dashboard' | 'Reports' | 'Notifications' | 'Profile';

const tabs: {key: TabKey; label: string; icon: string; route: string}[] = [
  {key: 'Dashboard', label: 'Dashboard', icon: '⬛', route: 'SuperAdminDashboard'},
  {key: 'Reports', label: 'Reports', icon: '📊', route: 'SuperAdminReports'},
  {key: 'Notifications', label: 'Alerts', icon: '🔔', route: 'Notifications'},
  {key: 'Profile', label: 'Profile', icon: '👤', route: 'SuperAdminProfile'},
];

type Props = {
  navigation: any;
  active: TabKey;
};

const SuperAdminBottomTabBar = ({navigation, active}: Props) => {
  const {saNotifications} = useAppData();
  const unreadCount = saNotifications.filter(n => n.isNew).length;

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => {
              if (!isActive) {
                navigation.navigate(tab.route);
              }
            }}>
            <View>
              <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
              {tab.key === 'Notifications' && unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default SuperAdminBottomTabBar;