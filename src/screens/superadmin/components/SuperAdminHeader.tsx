import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {styles} from '../../../styles/superadmin/components/SuperAdminHeader.styles';
import {useAppData} from '../../../navigation/AppNavigator';

type Props = {
  navigation: any;
  title: string;
  showBack?: boolean;
  // When true, renders the premium branded logo bar (logo + "INRFS" +
  // "Investment Portal") instead of the usual back-arrow/title/bell/avatar
  // header. Only the Dashboard screen passes this.
  showLogo?: boolean;
};

const SuperAdminHeader = ({navigation, title, showBack = true, showLogo = false}: Props) => {
  const {adminProfile, saNotifications} = useAppData();
  const unreadCount = saNotifications.filter(n => n.isNew).length;
  const initial = adminProfile.name?.trim()?.[0]?.toUpperCase() || 'S';

  if (showLogo) {
    return (
      <View style={localStyles.brandContainer}>
        <Image
          source={require('../../../assets/logo.jpeg')}
          style={localStyles.logoMark}
          resizeMode="contain"
        />
        {/* <View style={localStyles.brandTextWrap}>
          <Text style={localStyles.logoText} numberOfLines={1}>
            INRFS
          </Text>
          <Text style={localStyles.logoSubtext} numberOfLines={1}>
            Investment Portal
          </Text>
        </View> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={styles.right}>
        {/* <TouchableOpacity style={styles.bellWrap} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('SuperAdminProfile')}>
          <Text style={styles.avatarText}>{initial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Local styles for the branded logo bar. Kept separate from
// SuperAdminHeader.styles.ts (not shared) so this change is self-contained.
const localStyles = StyleSheet.create({
  brandContainer: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  logoMark: {
    width: 92,
    height: 92,
    marginRight: 10,
  },
  brandTextWrap: {
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0B1E45',
    letterSpacing: -0.5,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#667085',
    marginTop: -2,
  },
});

export default SuperAdminHeader;