import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../components/AdminBottomTabBar.styles';

export type AdminTabKey =
  | 'Home'
  | 'Investments'
  | 'Payments'
  | 'Profile'
  | 'More';

const tabs: {
  key: AdminTabKey;
  label: string;
  icon: string;
  route: string | null;
}[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: 'home-outline',
    route: 'AdminDashboard',
  },
{
  key: 'Investments',
  label: 'Investments',
  icon: 'chart-box-outline',
  route: 'BondTracking',
},
  {
    key: 'Payments',
    label: 'Monthly Payouts',
    icon: 'cash-multiple',
    route: 'InterestPayouts',
  },
];

const moreItems: {
  key: string;
  label: string;
  icon: string;
  route: string | null;
}[] = [
  {
    key: 'InvestorRegistry',
    label: 'Investor Management',
    icon: 'account-group-outline',
    route: 'InvestorRegistry',
  },
  {
    key: 'BondTracking',
    label: 'Investments',
    icon: 'chart-timeline-variant',
    route: 'BondTracking',
  },
   {
    key: 'Payments',
    label: 'Monthly Payouts',
    icon: 'cash-multiple',
    route: 'InterestPayouts',
  },
//   {
//     key: 'KycApprovals',
//     label: 'KYC Approvals',
//     icon: 'card-account-details-outline',
//     route: 'KycApprovals',
//   },
  {
    key: 'SettlementCalculator',
    label: 'Settlement',
    icon: 'calculator-variant-outline',
    route: 'SettlementCalculator',
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: 'file-chart-outline',
    route: 'AdminReports',
  },
//   {
//     key: 'Notifications',
//     label: 'Notifications',
//     icon: 'bell-outline',
//     route: 'Notifications',
//   },
  {
    key: 'Profile',
    label: 'Profile',
    icon: 'account-outline',
    route: 'AdminProfile',
  },
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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

  const slideAnim = useRef(new Animated.Value(500)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const activeScale = useRef(new Animated.Value(1)).current;

  const isMoreActive =
    active === 'More' ||
    [
      'Profile',
    ].includes(active);

  const activeIndex =
    active === 'Home'
      ? 0
      : active === 'Investments'
      ? 1
      : active === 'Payments'
      ? 2
      : 3;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(indicatorAnim, {
        toValue: activeIndex,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.7,
      }),

      Animated.sequence([
        Animated.timing(activeScale, {
          toValue: 0.94,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(activeScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 180,
        }),
      ]),
    ]).start();
  }, [activeIndex, indicatorAnim, activeScale]);

  const openMore = () => {
    setMoreVisible(true);
    slideAnim.setValue(500);

    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 24,
      stiffness: 190,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeMore = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setMoreVisible(false));
  };

  const goTo = (route: string | null) => {
    if (!route) {
      return;
    }

    closeMore();
    navigation.navigate(route);
  };

  const handleMainTab = (route: string | null) => {
    if (!route) {
      return;
    }

    navigation.navigate(route);
  };

  const handleLogout = () => {
    closeMore();

    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}],
    });
  };

  const tabWidth = SCREEN_WIDTH / 4;

  const indicatorTranslateX = indicatorAnim.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      -tabWidth * 1.5,
      -tabWidth * 0.5,
      tabWidth * 0.5,
      tabWidth * 1.5,
    ],
  });

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* FIXED ADMIN BOTTOM BAR                                       */}
      {/* ------------------------------------------------------------- */}

      <View style={styles.container}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            {
              width: Math.max(54, tabWidth - 28),
              transform: [{translateX: indicatorTranslateX}],
            },
          ]}
        />

        {tabs.map(tab => {
          const isActive = tab.key === active;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.82}
              onPress={() => handleMainTab(tab.route)}>
              <Animated.View
                style={[
                  styles.iconWrap,
                  isActive && styles.iconWrapActive,
                  isActive && {
                    transform: [{scale: activeScale}],
                  },
                ]}>
                <Icon
                  name={tab.icon}
                  size={22}
                  color={isActive ? '#155EEF' : '#98A2B3'}
                />
              </Animated.View>

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* MORE */}

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.82}
          onPress={openMore}>
          <Animated.View
            style={[
              styles.iconWrap,
              isMoreActive && styles.iconWrapActive,
              isMoreActive && {
                transform: [{scale: activeScale}],
              },
            ]}>
            <Icon
              name="dots-horizontal"
              size={23}
              color={isMoreActive ? '#155EEF' : '#98A2B3'}
            />
          </Animated.View>

          <Text
            style={[
              styles.label,
              isMoreActive && styles.labelActive,
            ]}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* ------------------------------------------------------------- */}
      {/* MORE SHEET                                                    */}
      {/* ------------------------------------------------------------- */}

      <Modal
        visible={moreVisible}
        transparent
        animationType="none"
        onRequestClose={closeMore}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={closeMore}
          />

          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{translateY: slideAnim}],
              },
            ]}>
            <View style={styles.grabber} />

            {/* HEADER */}

            <View style={styles.sheetHeader}>
              <View style={styles.sheetBrandRow}>
                <View style={styles.sheetLogoWrap}>
                  <Image
                    source={require('../assets/logo.jpeg')}
                    style={styles.sheetLogo}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.sheetBrandText}>
                  <Text style={styles.sheetHeaderTitle}>
                    INRFS
                  </Text>

                  <Text style={styles.sheetHeaderSubtitle}>
                    Admin Portal
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeMore}
                activeOpacity={0.7}>
                <Icon
                  name="close"
                  size={20}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetDivider} />

            {/* MENU ITEMS */}

            {moreItems.map(item => {
              const isActive =
                item.key === active ||
                (item.key === 'Profile' &&
                  active === 'Profile');

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sheetItem,
                    isActive && styles.sheetItemActive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => goTo(item.route)}>
                  <View
                    style={[
                      styles.sheetItemIconWrap,
                      isActive &&
                        styles.sheetItemIconWrapActive,
                    ]}>
                    <Icon
                      name={item.icon}
                      size={21}
                      color={
                        isActive
                          ? '#155EEF'
                          : '#475467'
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.sheetItemText,
                      isActive &&
                        styles.sheetItemTextActive,
                    ]}>
                    {item.label}
                  </Text>

                  <Icon
                    name="chevron-right"
                    size={20}
                    color={
                      isActive
                        ? '#155EEF'
                        : '#98A2B3'
                    }
                  />
                </TouchableOpacity>
              );
            })}

            {/* FOOTER */}

            <View style={styles.sheetFooter}>
              <View style={styles.sheetUserRow}>
                <View style={styles.sheetAvatar}>
                  <Text style={styles.sheetAvatarText}>
                    {(adminName || 'AD')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.sheetUserInfo}>
                  <Text style={styles.sheetUserName}>
                    {adminName || 'Administrator'}
                  </Text>

                  <Text style={styles.sheetUserSub}>
                    Admin Account
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}>
                <Icon
                  name="logout"
                  size={20}
                  color="#155EEF"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default AdminBottomTabBar;