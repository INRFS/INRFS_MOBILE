import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const BLUE = '#155EEF';
const MUTED = '#98A2B3';

export type SuperAdminTabKey =
  | 'Dashboard'
  | 'Investors'
  | 'Investments'
  | 'Payments'
  | 'More'
  | 'Profile';

/*
 * ============================================================
 * PRIMARY TABS
 * ============================================================
 */

const tabs: {
  key: SuperAdminTabKey;
  label: string;
  icon: string;
  route: string | null;
}[] = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    route: 'SuperAdminDashboard',
  },
  {
    key: 'Investors',
    label: 'Investors',
    icon: 'account-group-outline',
    route: 'InvestorManagement',
  },
  {
    key: 'Investments',
    label: 'Investments',
    icon: 'chart-donut',
    route: 'InvestmentManagement',
  },
];

/*
 * ============================================================
 * MORE MENU
 * ============================================================
 */

const moreItems: {
  key: string;
  label: string;
  icon: string;
  route: string | null;
}[] = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    route: 'SuperAdminDashboard',
  },

  {
    key: 'Investors',
    label: 'Investors',
    icon: 'account-group-outline',
    route: 'InvestorManagement',
  },

  {
    key: 'Investments',
    label: 'Investments',
    icon: 'chart-donut',
    route: 'InvestmentManagement',
  },

  {
    key: 'AdminManagement',
    label: 'Admin Management',
    icon: 'account-tie-outline',
    route: 'AdminManagement',
  },

  {
    key: 'BranchManagement',
    label: 'Branch Management',
    icon: 'office-building-outline',
    route: 'BranchManagement',
  },

  {
    key: 'Reports',
    label: 'Reports',
    icon: 'file-chart-outline',
    route: 'SuperAdminReports',
  },

  {
    key: 'PaymentQueue',
    label: 'Payments',
    icon: 'cash-multiple',
    route: 'PaymentQueue',
  },

  {
    key: 'Profile',
    label: 'Profile',
    icon: 'account-outline',
    route: 'SuperAdminProfile',
  },
];

/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const SuperAdminBottomTabBar = ({
  active,
  navigation,
  superAdminName,
}: {
  active: SuperAdminTabKey;
  navigation: any;
  superAdminName?: string;
}) => {
  const [moreVisible, setMoreVisible] =
    useState(false);

  /*
   * Same animation pattern as Admin.
   */

  const slideAnim = useRef(
    new Animated.Value(500),
  ).current;

  const indicatorAnim = useRef(
    new Animated.Value(0),
  ).current;

  const activeScale = useRef(
    new Animated.Value(1),
  ).current;

  /*
   * ============================================================
   * MORE ACTIVE
   * ============================================================
   */

  const isMoreActive =
    active === 'More' ||
    active === 'Profile';

  /*
   * ============================================================
   * ACTIVE INDEX
   * ============================================================
   */

  const activeIndex =
    active === 'Dashboard'
      ? 0
      : active === 'Investors'
      ? 1
      : active === 'Investments'
      ? 2
      : 3;

  /*
   * ============================================================
   * ACTIVE TAB ANIMATION
   * ============================================================
   */

  useEffect(() => {
    Animated.parallel([
      Animated.spring(
        indicatorAnim,
        {
          toValue: activeIndex,

          useNativeDriver: true,

          damping: 18,

          stiffness: 180,

          mass: 0.7,
        },
      ),

      Animated.sequence([
        Animated.timing(
          activeScale,
          {
            toValue: 0.94,

            duration: 80,

            useNativeDriver: true,
          },
        ),

        Animated.spring(
          activeScale,
          {
            toValue: 1,

            useNativeDriver: true,

            damping: 14,

            stiffness: 180,
          },
        ),
      ]),
    ]).start();
  }, [
    activeIndex,
    indicatorAnim,
    activeScale,
  ]);

  /*
   * ============================================================
   * OPEN MORE
   * ============================================================
   */

  const openMore = () => {
    setMoreVisible(true);

    slideAnim.setValue(500);

    Animated.spring(
      slideAnim,
      {
        toValue: 0,

        damping: 24,

        stiffness: 190,

        mass: 0.8,

        useNativeDriver: true,
      },
    ).start();
  };

  /*
   * ============================================================
   * CLOSE MORE
   * ============================================================
   */

  const closeMore = () => {
    Animated.timing(
      slideAnim,
      {
        toValue: 500,

        duration: 220,

        useNativeDriver: true,
      },
    ).start(() =>
      setMoreVisible(false),
    );
  };

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  const goTo = (
    route: string | null,
  ) => {
    if (!route) {
      return;
    }

    closeMore();

    navigation.navigate(route);
  };

  const handleMainTab = (
    route: string | null,
  ) => {
    if (!route) {
      return;
    }

    navigation.navigate(route);
  };

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  const handleLogout = () => {
    closeMore();

    navigation.reset({
      index: 0,

      routes: [
        {
          name: 'Login',
        },
      ],
    });
  };

  /*
   * ============================================================
   * INDICATOR
   *
   * Dashboard | Investors | Investments | More
   * ============================================================
   */

  const tabWidth =
    SCREEN_WIDTH / 4;

  const indicatorTranslateX =
    indicatorAnim.interpolate({
      inputRange: [
        0,
        1,
        2,
        3,
      ],

      outputRange: [
        -tabWidth * 1.5,
        -tabWidth * 0.5,
        tabWidth * 0.5,
        tabWidth * 1.5,
      ],
    });

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      {/* ====================================================== */}
      {/* BOTTOM BAR                                             */}
      {/* ====================================================== */}

      <View
        style={styles.container}>

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

        {/* ================================================== */}
        {/* PRIMARY TABS                                        */}
        {/* ================================================== */}

        {tabs.map(tab => {
          const isActive =
            tab.key === active;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={0.82}
              onPress={() =>
                handleMainTab(
                  tab.route,
                )
              }>

              <Animated.View
                style={[
                  styles.iconWrap,

                  isActive &&
                    styles.iconWrapActive,

                  isActive && {
                    transform: [
                      {
                        scale:
                          activeScale,
                      },
                    ],
                  },
                ]}>

                <Icon
                  name={tab.icon}
                  size={22}
                  color={
                    isActive
                      ? BLUE
                      : MUTED
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

        {/* ================================================== */}
        {/* MORE                                               */}
        {/* ================================================== */}

        <TouchableOpacity
          style={styles.tabItem}
          activeOpacity={0.82}
          onPress={openMore}>

          <Animated.View
            style={[
              styles.iconWrap,

              isMoreActive &&
                styles.iconWrapActive,

              isMoreActive && {
                transform: [
                  {
                    scale:
                      activeScale,
                  },
                ],
              },
            ]}>

            <Icon
              name="dots-horizontal"
              size={23}
              color={
                isMoreActive
                  ? BLUE
                  : MUTED
              }
            />
          </Animated.View>

          <Text
            style={[
              styles.label,

              isMoreActive &&
                styles.labelActive,
            ]}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* ====================================================== */}
      {/* MORE MODAL                                            */}
      {/* ====================================================== */}

      <Modal
        visible={moreVisible}
        transparent
        animationType="none"
        onRequestClose={
          closeMore
        }>

        <View
          style={styles.modalRoot}>

          <Pressable
            style={styles.backdrop}
            onPress={closeMore}
          />

          <Animated.View
            style={[
              styles.sheet,

              {
                transform: [
                  {
                    translateY:
                      slideAnim,
                  },
                ],
              },
            ]}>

            <View
              style={styles.grabber}
            />

            {/* ================================================= */}
            {/* SHEET HEADER                                      */}
            {/* ================================================= */}

            <View
              style={
                styles.sheetHeader
              }>

              <View
                style={
                  styles.sheetBrandRow
                }>

                <View
                  style={
                    styles.sheetLogoWrap
                  }>

                  <Image
                    source={require('../../../assets/logo.jpeg')}
                    style={
                      styles.sheetLogo
                    }
                    resizeMode="contain"
                  />
                </View>

                <View
                  style={
                    styles.sheetBrandText
                  }>
{/* 
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
                    Super Admin Portal
                  </Text> */}
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.closeButton
                }
                onPress={
                  closeMore
                }
                activeOpacity={0.7}>

                <Icon
                  name="close"
                  size={20}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <View
              style={
                styles.sheetDivider
              }
            />

            {/* ================================================= */}
            {/* MENU ITEMS                                        */}
            {/* ================================================= */}

            {moreItems.map(item => {
              const isActive =
                item.key === active;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sheetItem,

                    isActive &&
                      styles.sheetItemActive,
                  ]}
                  activeOpacity={0.75}
                  onPress={() =>
                    goTo(
                      item.route,
                    )
                  }>

                  <View
                    style={[
                      styles.sheetItemIconWrap,

                      isActive &&
                        styles.sheetItemIconWrapActive,
                    ]}>

                    <Icon
                      name={
                        item.icon
                      }
                      size={21}
                      color={
                        isActive
                          ? BLUE
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
                        ? BLUE
                        : '#98A2B3'
                    }
                  />
                </TouchableOpacity>
              );
            })}

            {/* ================================================= */}
            {/* FOOTER                                            */}
            {/* ================================================= */}

            <View
              style={
                styles.sheetFooter
              }>

              <View
                style={
                  styles.sheetUserRow
                }>

                <View
                  style={
                    styles.sheetAvatar
                  }>

                  <Text
                    style={
                      styles.sheetAvatarText
                    }>
                    {(
                      superAdminName ||
                      'SA'
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>

                <View
                  style={
                    styles.sheetUserInfo
                  }>

                  <Text
                    style={
                      styles.sheetUserName
                    }>
                    {superAdminName ||
                      'Super Admin'}
                  </Text>

                  <Text
                    style={
                      styles.sheetUserSub
                    }>
                    Super Admin Account
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.logoutButton
                }
                onPress={
                  handleLogout
                }
                activeOpacity={0.7}>

                <Icon
                  name="logout"
                  size={20}
                  color={BLUE}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

/*
 * =============================================================
 * STYLES
 * =============================================================
 */

const styles = StyleSheet.create({
  /*
   * ============================================================
   * BOTTOM BAR
   * ============================================================
   */

  container: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    height:
      Platform.OS === 'ios'
        ? 82
        : 68,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,

    borderTopColor: '#E7EAF0',

    flexDirection: 'row',

    alignItems: 'flex-start',

    justifyContent: 'space-around',

    paddingTop: 7,

    paddingBottom:
      Platform.OS === 'ios'
        ? 8
        : 5,

    elevation: 14,

    shadowColor: '#101828',

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 12,

    zIndex: 100,
  },

  /*
   * Same active indicator as Admin.
   */

  activeIndicator: {
    position: 'absolute',

    top: 0,

    left: 0,

    height: 3,

    borderRadius: 3,

    backgroundColor: BLUE,

    zIndex: 2,
  },

  /*
   * Four equal slots.
   */

  tabItem: {
    width: '25%',

    height: '100%',

    alignItems: 'center',

    justifyContent: 'flex-start',

    paddingTop: 2,

    paddingHorizontal: 3,
  },

  iconWrap: {
    width: 42,

    height: 34,

    borderRadius: 11,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'transparent',
  },

  iconWrapActive: {
    backgroundColor:
      '#EEF4FF',
  },

  label: {
    marginTop: 4,

    maxWidth: 88,

    textAlign: 'center',

    fontSize: 10.5,

    lineHeight: 14,

    fontWeight: '600',

    color: MUTED,
  },

  labelActive: {
    color: BLUE,

    fontWeight: '800',
  },

  /*
   * ============================================================
   * MODAL
   * ============================================================
   */

  modalRoot: {
    flex: 1,

    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFill,

    backgroundColor:
      'rgba(15,23,42,0.42)',
  },

  /*
   * ============================================================
   * SHEET
   * ============================================================
   */

  sheet: {
    width: '100%',

    backgroundColor: '#FFFFFF',

    borderTopLeftRadius: 26,

    borderTopRightRadius: 26,

    paddingHorizontal: 18,

    paddingTop: 9,

    paddingBottom:
      Platform.OS === 'ios'
        ? 28
        : 18,

    elevation: 24,

    shadowColor: '#101828',

    shadowOffset: {
      width: 0,
      height: -6,
    },

    shadowOpacity: 0.16,

    shadowRadius: 18,
  },

  grabber: {
    alignSelf: 'center',

    width: 42,

    height: 4,

    borderRadius: 4,

    backgroundColor: '#D0D5DD',

    marginBottom: 18,
  },

  /*
   * ============================================================
   * SHEET HEADER
   * ============================================================
   */

  sheetHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    marginBottom: 12,
  },

  sheetBrandRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  sheetLogoWrap: {
    width: 100,

    height: 40,

    borderRadius: 8,

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',

    backgroundColor: '#FFFFFF',

    marginRight: 10,
  },

  sheetLogo: {
    width: '100%',

    height: '100%',
  },

  sheetBrandText: {
    justifyContent: 'center',
  },

  sheetHeaderTitle: {
    fontSize: 16,

    fontWeight: '900',

    color: '#101828',

    letterSpacing: 0.2,
  },

  sheetHeaderSubtitle: {
    marginTop: 1,

    fontSize: 11,

    color: '#667085',

    fontWeight: '600',
  },

  closeButton: {
    width: 38,

    height: 38,

    borderRadius: 12,

    backgroundColor: '#F8FAFC',

    alignItems: 'center',

    justifyContent: 'center',
  },

  sheetDivider: {
    height: 1,

    backgroundColor: '#E7EAF0',

    marginVertical: 14,
  },

  /*
   * ============================================================
   * MENU ITEMS
   * ============================================================
   */

  sheetItem: {
    minHeight: 54,

    borderRadius: 15,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 10,

    marginBottom: 5,
  },

  sheetItemActive: {
    backgroundColor: '#EEF4FF',
  },

  sheetItemIconWrap: {
    width: 38,

    height: 38,

    borderRadius: 11,

    backgroundColor: '#F2F4F7',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,
  },

  sheetItemIconWrapActive: {
    backgroundColor: '#DCE9FF',
  },

  sheetItemText: {
    flex: 1,

    fontSize: 14,

    fontWeight: '700',

    color: '#344054',
  },

  sheetItemTextActive: {
    color: BLUE,
  },

  /*
   * ============================================================
   * FOOTER
   * ============================================================
   */

  sheetFooter: {
    borderTopWidth: 1,

    borderTopColor: '#E7EAF0',

    marginTop: 12,

    paddingTop: 15,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',
  },

  sheetUserRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  sheetAvatar: {
    width: 42,

    height: 42,

    borderRadius: 21,

    backgroundColor: '#EEF4FF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,
  },

  sheetAvatarText: {
    color: BLUE,

    fontSize: 13,

    fontWeight: '900',
  },

  sheetUserInfo: {
    justifyContent: 'center',
  },

  sheetUserName: {
    fontSize: 13.5,

    fontWeight: '800',

    color: '#101828',
  },

  sheetUserSub: {
    marginTop: 2,

    fontSize: 11,

    color: '#667085',
  },

  logoutButton: {
    width: 42,

    height: 42,

    borderRadius: 12,

    backgroundColor: '#EEF4FF',

    alignItems: 'center',

    justifyContent: 'center',
  },
});

export default SuperAdminBottomTabBar;