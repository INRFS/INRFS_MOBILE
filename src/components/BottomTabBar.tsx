import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './BottomTabBar.styles';

// export type TabKey = 'Home' | 'Invest' | 'Portfolio' | 'Settings';
export type TabKey = 'Home' | 'Invest' | 'My Investments' | 'Profile';

// NOTE: 'Home' points at InvestorDashboard and 'Portfolio' points at
// MyInvestments. Register a 'Settings' route in AppNavigator before
// enabling that tab's navigation if you add it later.
const tabs: {key: TabKey; label: string; icon: string; route: string | null}[] = [
  {key: 'Home', label: 'Home', icon: 'home-outline', route: 'InvestorDashboard'},
  {key: 'Invest', label: 'Invest', icon: 'wallet-outline', route: 'InvestNow'},
  {key: 'My Investments', label: 'My Investments', icon: 'chart-donut', route: 'MyInvestments'},
  {key: 'Profile', label: 'Profile', icon: 'account-outline', route: 'Profile'},
];

const BottomTabBar = ({active, navigation}: {active: TabKey; navigation: any}) => {
  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => {
              if (tab.route) navigation.navigate(tab.route);
            }}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon name={tab.icon} size={20} color={isActive ? '#1955F0' : '#9CA3AF'} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomTabBar;