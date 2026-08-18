import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Modal, Pressable, Animated, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../../../styles/superadmin/components/SuperAdminBottomTabBar.styles';
import {useAppData} from '../../../navigation/AppNavigator';

export type SuperAdminTabKey = 'Dashboard' | 'Investors' | 'Investments' | 'More' | 'Profile';

// The 3 tabs that get their own slot in the bar. "More" opens a sheet
// instead of navigating directly, same as the admin side.
const tabs: {key: SuperAdminTabKey; label: string; icon: string; route: string}[] = [
  {key: 'Dashboard', label: 'Dashboard', icon: 'view-dashboard-outline', route: 'SuperAdminDashboard'},
  {key: 'Investors', label: 'Investors', icon: 'account-group-outline', route: 'InvestorManagement'},
  {key: 'Investments', label: 'Investments', icon: 'chart-donut', route: 'InvestmentManagement'},
];

// Everything on the superadmin surface lives in this sheet — the 3
// primary tabs again, plus every other superadmin screen, plus Profile.
const moreItems: {
  key: SuperAdminTabKey | 'AdminManagement' | 'AuditLogs' | 'BranchManagement' | 'PaymentQueue' | 'RolesPermissions' | 'Reports' | 'Notifications' | 'SystemSettings' | 'UserManagement';
  label: string;
  icon: string;
  route: string | null;
  disabled?: boolean;
}[] = [
  {key: 'Dashboard', label: 'Dashboard', icon: 'view-dashboard-outline', route: 'SuperAdminDashboard'},
  {key: 'Investors', label: 'Investors', icon: 'account-group-outline', route: 'InvestorManagement'},
  {key: 'Investments', label: 'Investments', icon: 'chart-donut', route: 'InvestmentManagement'},
  // {key: 'UserManagement', label: 'User Management', icon: 'account-multiple-outline', route: 'UserManagement'},
  {key: 'AdminManagement', label: 'Admin Management', icon: 'account-tie-outline', route: 'AdminManagement'},
  // {key: 'RolesPermissions', label: 'Roles & Permissions', icon: 'shield-key-outline', route: 'RolesPermissions'},
  {key: 'BranchManagement', label: 'Branch Management', icon: 'office-building-outline', route: 'BranchManagement'},
  // {key: 'PaymentQueue', label: 'Payment Queue', icon: 'cash-multiple', route: 'PaymentQueue'},
  // {key: 'AuditLogs', label: 'Audit Logs', icon: 'file-document-outline', route: 'AuditLogs'},
  {key: 'Reports', label: 'Reports', icon: 'file-chart-outline', route: 'SuperAdminReports'},
  {key: 'Notifications', label: 'Payments', icon: 'bell-outline', route: 'Notifications'},
  // {key: 'SystemSettings', label: 'System Settings', icon: 'cog-outline', route: 'SystemSettings'},
  {key: 'Profile', label: 'Profile', icon: 'account-outline', route: 'SuperAdminProfile'},
];

const SuperAdminBottomTabBar = ({
  active,
  navigation,
  superAdminName,
}: {
  active: SuperAdminTabKey;
  navigation: any;
  superAdminName?: string;
}) => {
  const {saNotifications} = useAppData();
  const unreadCount = saNotifications.filter(n => n.isNew).length;

  const [moreVisible, setMoreVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  // "More" lights up whenever the active screen is one of the items that
  // only live inside the sheet — anything that isn't one of the 3 primary tabs.
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
          {/* {unreadCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{unreadCount}</Text>
            </View>
          ) : null} */}
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
                source={require('../../../assets/logo.jpeg')}
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
                {/* {item.key === 'Notifications' && unreadCount > 0 ? (
                  <View style={styles.dot}>
                    <Text style={styles.dotText}>{unreadCount}</Text>
                  </View>
                ) : null} */}
              </TouchableOpacity>
            );
          })}

          <View style={styles.sheetFooter}>
            <View style={styles.sheetUserRow}>
              <View style={styles.sheetAvatar}>
                <Text style={styles.sheetAvatarText}>
                  {(superAdminName || 'SA').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.sheetUserName}>{superAdminName || 'Super Admin'}</Text>
                <Text style={styles.sheetUserSub}>Super Admin Account</Text>
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

export default SuperAdminBottomTabBar;