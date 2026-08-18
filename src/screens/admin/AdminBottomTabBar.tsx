import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, Pressable, Animated, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../../styles/admin/Adminbottomtabbar.styles';

export type AdminTabKey = 'Home' | 'Investors' | 'Investments' | 'More' | 'Profile';

// The 3 tabs that get their own slot in the bar. "More" is handled
// separately below since it opens a sheet instead of navigating directly.
const tabs: {key: AdminTabKey; label: string; icon: string; route: string}[] = [
  {key: 'Home', label: 'Home', icon: 'view-dashboard-outline', route: 'AdminDashboard'},
  {key: 'Investors', label: 'Investors', icon: 'account-group-outline', route: 'InvestorRegistry'},
  {key: 'Investments', label: 'Investments', icon: 'chart-donut', route: 'BondTracking'},
];

// Everything that used to live on the standalone AdminMoreScreen (Payouts,
// Settlement Calculator, Profile) plus the rest of the admin surface now
// lives in this sheet — one tap in from "More", same as the investor side.
const moreItems: {
  key: AdminTabKey | 'Payouts' | 'Settlement' | 'Kyc' | 'Reports' | 'Notifications' | 'Settings';
  label: string;
  icon: string;
  route: string | null;
  disabled?: boolean;
}[] = [
  {key: 'Home', label: 'Home', icon: 'view-dashboard-outline', route: 'AdminDashboard'},
  {key: 'Investors', label: 'Investors', icon: 'account-group-outline', route: 'InvestorRegistry'},
  {key: 'Investments', label: 'Investments', icon: 'chart-donut', route: 'BondTracking'},
  {key: 'Payouts', label: 'Monthly Payouts', icon: 'cash-multiple', route: 'InterestPayouts'},
  {key: 'Settlement', label: 'Settlement Calculator', icon: 'calculator-variant-outline', route: 'SettlementCalculator'},
  // {key: 'Kyc', label: 'KYC Approvals', icon: 'shield-check-outline', route: 'KycApprovals'},
  {key: 'Reports', label: 'Reports', icon: 'file-chart-outline', route: 'AdminReports'},
  // {key: 'Notifications', label: 'Notifications', icon: 'bell-outline', route: 'AdminNotifications'},
  // {key: 'Settings', label: 'Settings', icon: 'cog-outline', route: 'AdminSettings'},
  {key: 'Profile', label: 'Profile', icon: 'account-outline', route: 'AdminProfile'},
];

const AdminBottomTabBar = ({
  active,
  navigation,
  adminName,
}: {
  active: AdminTabKey;
  navigation: any;
  adminName?: string;
}) => {
  const [moreVisible, setMoreVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // "More" lights up whenever the active screen is one of the items that
  // now only live inside the sheet (Payouts, Settlement, Profile, etc.) —
  // anything that isn't one of the 3 primary tabs.
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
    navigation.navigate(route);
  };

  const handleLogout = () => {
    closeMore();
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(tab.route)}>
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

          <View style={styles.sheetHeader}>
            <View style={styles.sheetLogoWrap}>
              <Image
                source={require('../../assets/logo.jpeg')}
                style={styles.sheetLogo}
                resizeMode="contain"
              />
            </View>
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
                  {(adminName || 'AD').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sheetUserName}>{adminName || 'Admin'}</Text>
                <Text style={styles.sheetUserSub}>Admin Account</Text>
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

export default AdminBottomTabBar;