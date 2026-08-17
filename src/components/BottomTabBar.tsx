import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, Pressable, Animated, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './BottomTabBar.styles';

export type TabKey = 'Home' | 'Invest' | 'My Investments' | 'Profile';

const tabs: {key: TabKey; label: string; icon: string; route: string | null}[] = [
  {key: 'Home', label: 'Home', icon: 'home-outline', route: 'InvestorDashboard'},
  {key: 'Invest', label: 'Invest', icon: 'wallet-outline', route: 'InvestNow'},
  {key: 'My Investments', label: 'My Investments', icon: 'chart-donut', route: 'MyInvestments'},
];

const moreItems: {key: TabKey | 'Notifications' | 'Settings'; label: string; icon: string; route: string | null; disabled?: boolean}[] = [
  {key: 'Home', label: 'Home', icon: 'home-outline', route: 'InvestorDashboard'},
  {key: 'Invest', label: 'Invest', icon: 'wallet-outline', route: 'InvestNow'},
  {key: 'My Investments', label: 'My Investments', icon: 'chart-donut', route: 'MyInvestments'},
  {key: 'Notifications', label: 'Notifications', icon: 'bell-outline', route: 'InvestorNotifications'},
  {key: 'Profile', label: 'Profile', icon: 'account-outline', route: 'Profile'},
  // {key: 'Settings', label: 'Settings', icon: 'cog-outline', route: null, disabled: true},
];

const BottomTabBar = ({
  active,
  navigation,
  investorId,
  investorName,
}: {
  active: TabKey | 'More';
  navigation: any;
  investorId?: string;
  investorName?: string;
}) => {
  const [moreVisible, setMoreVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const isMoreActive = active === 'More' || active === 'Profile';

  const openMore = () => {
    setMoreVisible(true);
    Animated.timing(slideAnim, {toValue: 0, duration: 250, useNativeDriver: true}).start();
  };

  const closeMore = () => {
    Animated.timing(slideAnim, {toValue: 300, duration: 200, useNativeDriver: true}).start(() => {
      setMoreVisible(false);
    });
  };

  const goTo = (route: string | null) => {
    if (!route) return;
    closeMore();
    navigation.navigate(route, {investorId});
  };

  const handleLogout = () => {
    closeMore();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

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
              if (tab.route) navigation.navigate(tab.route, {investorId});
            }}>
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon name={tab.icon} size={20} color={isActive ? '#1955F0' : '#9CA3AF'} />
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.tabItem} activeOpacity={0.7} onPress={openMore}>
        <View style={[styles.iconWrap, isMoreActive && styles.iconWrapActive]}>
          <Icon name="dots-horizontal" size={20} color={isMoreActive ? '#1955F0' : '#9CA3AF'} />
        </View>
        <Text style={[styles.label, isMoreActive && styles.labelActive]}>More</Text>
      </TouchableOpacity>

      <Modal visible={moreVisible} transparent animationType="fade" onRequestClose={closeMore}>
        <Pressable style={styles.backdrop} onPress={closeMore} />
        <Animated.View style={[styles.sheet, {transform: [{translateY: slideAnim}]}]}>
          <View style={styles.grabber} />

          {/* Header — logo + app name, matching reference */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetLogoWrap}>
              <Image
                source={require('../assets/logo.jpeg')}
                style={styles.sheetLogo}
                resizeMode="contain"
              />
            </View>
            {/* <View>
              <Text style={styles.sheetHeaderTitle}>INRFS</Text>
              <Text style={styles.sheetHeaderSubtitle}>Financer Platform</Text>
            </View> */}
          </View>

          {moreItems.map(item => {
            const isActive = item.key === active;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.sheetItem, isActive && styles.sheetItemActive]}
                disabled={item.disabled}
                onPress={() => goTo(item.route)}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={item.disabled ? '#D1D5DB' : isActive ? '#1955F0' : '#4B5563'}
                  style={styles.sheetItemIcon}
                />
                <Text
                  style={[
                    styles.sheetItemText,
                    isActive && styles.sheetItemTextActive,
                    item.disabled && styles.sheetItemTextDisabled,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.sheetFooter}>
            <View style={styles.sheetUserRow}>
              <View style={styles.sheetAvatar}>
                <Text style={styles.sheetAvatarText}>
                  {(investorName || 'IN').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sheetUserName}>{investorName || 'Investor'}</Text>
                <Text style={styles.sheetUserSub}>Investor Account</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout}>
              <Icon name="logout" size={20} color="#1955F0" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

export default BottomTabBar;