import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './BottomTabBar.styles';

export type TabKey =
  | 'Home'
  | 'Invest'
  | 'My Investments'
  | 'Profile';

const tabs: {
  key: TabKey;
  label: string;
  icon: string;
  route: string | null;
}[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: 'home-outline',
    route: 'InvestorDashboard',
  },
  {
    key: 'Invest',
    label: 'Invest',
    icon: 'wallet-outline',
    route: 'InvestNow',
  },
  {
    key: 'My Investments',
    label: 'My Investments',
    icon: 'chart-donut',
    route: 'MyInvestments',
  },
];

const moreItems: {
  key: TabKey | 'Notifications' | 'Settings';
  label: string;
  icon: string;
  route: string | null;
  disabled?: boolean;
}[] = [
  {
    key: 'Home',
    label: 'Home',
    icon: 'home-outline',
    route: 'InvestorDashboard',
  },
  {
    key: 'Invest',
    label: 'Invest',
    icon: 'wallet-outline',
    route: 'InvestNow',
  },
  {
    key: 'My Investments',
    label: 'My Investments',
    icon: 'chart-donut',
    route: 'MyInvestments',
  },
  {
    key: 'Notifications',
    label: 'Notifications',
    icon: 'bell-outline',
    route: 'InvestorNotifications',
  },
  {
    key: 'Profile',
    label: 'Profile',
    icon: 'account-outline',
    route: 'Profile',
  },
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');

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

  const indicatorAnim = useRef(
    new Animated.Value(0),
  ).current;

  const activeScale = useRef(
    new Animated.Value(1),
  ).current;

  const isMoreActive =
    active === 'More' ||
    active === 'Profile';

  const activeIndex =
    active === 'Home'
      ? 0
      : active === 'Invest'
      ? 1
      : active === 'My Investments'
      ? 2
      : 3;

  /**
   * ============================================================
   * ACTIVE TAB ANIMATION
   * ============================================================
   */

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
  }, [
    activeIndex,
    indicatorAnim,
    activeScale,
  ]);

  /**
   * ============================================================
   * OPEN MORE
   * ============================================================
   */

  const openMore = () => {
    console.log('MORE BUTTON CLICKED');
    setMoreVisible(true);
  };

  /**
   * ============================================================
   * CLOSE MORE
   * ============================================================
   */

  const closeMore = () => {
    console.log('MORE MENU CLOSED');
    setMoreVisible(false);
  };

  /**
   * ============================================================
   * NAVIGATION FROM MORE
   * ============================================================
   */

  const goTo = (route: string | null) => {
    if (!route) {
      return;
    }

    console.log(
      'MORE MENU NAVIGATION:',
      route,
    );

    // Close menu first.
    setMoreVisible(false);

    // Navigate after the overlay is removed.
    requestAnimationFrame(() => {
      navigation.navigate(route, {
        investorId,
        investorName,
      });
    });
  };

  /**
   * ============================================================
   * MAIN TAB NAVIGATION
   * ============================================================
   */

  const handleMainTab = (
    route: string | null,
  ) => {
    if (!route) {
      return;
    }

    navigation.navigate(route, {
      investorId,
      investorName,
    });
  };

  /**
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    setMoreVisible(false);

    requestAnimationFrame(() => {
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    });
  };

  /**
   * ============================================================
   * ACTIVE INDICATOR
   * ============================================================
   */

  const tabWidth = SCREEN_WIDTH / 4;

  const indicatorTranslateX =
    indicatorAnim.interpolate({
      inputRange: [0, 1, 2, 3],

      outputRange: [
        -tabWidth * 1.5,
        -tabWidth * 0.5,
        tabWidth * 0.5,
        tabWidth * 1.5,
      ],
    });

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ========================================================
          BOTTOM NAVIGATION
      ========================================================= */}

      <View style={styles.container}>
        {/* Active indicator */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            {
              width: Math.max(
                54,
                tabWidth - 28,
              ),

              transform: [
                {
                  translateX:
                    indicatorTranslateX,
                },
              ],
            },
          ]}
        />

        {/* ======================================================
            HOME / INVEST / MY INVESTMENTS
        ======================================================= */}

        {tabs.map(tab => {
          const isActive =
            tab.key === active;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.75}
              onPress={() =>
                handleMainTab(tab.route)
              }>
              <Animated.View
                style={[
                  styles.iconWrap,

                  isActive &&
                    styles.iconWrapActive,

                  isActive && {
                    transform: [
                      {
                        scale: activeScale,
                      },
                    ],
                  },
                ]}>
                <Icon
                  name={tab.icon}
                  size={22}
                  color={
                    isActive
                      ? '#155EEF'
                      : '#98A2B3'
                  }
                />
              </Animated.View>

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  isActive &&
                    styles.labelActive,
                ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ======================================================
            MORE BUTTON
        ======================================================= */}

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.75}
          onPress={openMore}>
          <Animated.View
            style={[
              styles.iconWrap,

              isMoreActive &&
                styles.iconWrapActive,

              isMoreActive && {
                transform: [
                  {
                    scale: activeScale,
                  },
                ],
              },
            ]}>
            <Icon
              name="dots-horizontal"
              size={23}
              color={
                isMoreActive
                  ? '#155EEF'
                  : '#98A2B3'
              }
            />
          </Animated.View>

          <Text
            numberOfLines={1}
            style={[
              styles.label,
              isMoreActive &&
                styles.labelActive,
            ]}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* ========================================================
          MORE OVERLAY

          IMPORTANT:
          This is NOT a React Native Modal.
          It stays inside the same screen so Android touch
          handling remains reliable.
      ========================================================= */}

      {moreVisible && (
        <View
          style={styles.moreOverlay}
          pointerEvents="box-none">

          {/* ====================================================
              BACKDROP
          ===================================================== */}

          <Pressable
            style={styles.backdrop}
            onPress={closeMore}
          />

          {/* ====================================================
              SHEET
          ===================================================== */}

          <View style={styles.sheet}>
            {/* Grabber */}

            <View style={styles.grabber} />

            {/* ==================================================
                HEADER
            =================================================== */}

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
                  <Text
                    style={
                      styles.sheetHeaderTitle
                    }>
                    INRFS
                  </Text>

                  <Text
                    style={
                      styles.sheetHeaderSubtitle
                    }>
                    Investor Portal
                  </Text>
                </View>
              </View>

              {/* Close */}

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

            <View
              style={styles.sheetDivider}
            />

            {/* ==================================================
                MENU ITEMS
            =================================================== */}

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
                    isActive &&
                      styles.sheetItemActive,
                  ]}
                  disabled={item.disabled}
                  activeOpacity={0.7}
                  onPress={() =>
                    goTo(item.route)
                  }>

                  {/* Icon */}

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
                        item.disabled
                          ? '#D0D5DD'
                          : isActive
                          ? '#155EEF'
                          : '#475467'
                      }
                    />
                  </View>

                  {/* Label */}

                  <Text
                    style={[
                      styles.sheetItemText,
                      isActive &&
                        styles.sheetItemTextActive,
                      item.disabled &&
                        styles.sheetItemTextDisabled,
                    ]}>
                    {item.label}
                  </Text>

                  {/* Arrow */}

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

            {/* ==================================================
                FOOTER
            =================================================== */}

            <View style={styles.sheetFooter}>
              <View style={styles.sheetUserRow}>
                <View style={styles.sheetAvatar}>
                  <Text
                    style={
                      styles.sheetAvatarText
                    }>
                    {(investorName || 'IN')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.sheetUserInfo}>
                  <Text
                    style={
                      styles.sheetUserName
                    }>
                    {investorName ||
                      'Investor'}
                  </Text>

                  <Text
                    style={
                      styles.sheetUserSub
                    }>
                    Investor Account
                  </Text>
                </View>
              </View>

              {/* Logout */}

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
          </View>
        </View>
      )}
    </>
  );
};

export default BottomTabBar;