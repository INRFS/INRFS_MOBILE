import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './BottomTabBar.styles';

export type TabKey = 'Home' | 'Invest' | 'Portfolio' | 'Settings';

// NOTE: 'Home' and 'Portfolio' both point at InvestorDashboard for now since
// this scope only covers Login -> OTP -> Dashboard -> Invest. Wire these to
// real separate screens once you build them, and register a 'Settings'
// route in AppNavigator before enabling that tab's navigation.
const tabs: {key: TabKey; label: string; icon: string; route: string | null}[] = [
  {key: 'Home', label: 'Home', icon: 'home-outline', route: 'InvestorDashboard'},
  {key: 'Invest', label: 'Invest', icon: 'wallet-outline', route: 'InvestNow'},
  {key: 'Portfolio', label: 'Portfolio', icon: 'chart-donut', route: 'InvestorDashboard'},
  {key: 'Settings', label: 'Settings', icon: 'cog-outline', route: null},
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