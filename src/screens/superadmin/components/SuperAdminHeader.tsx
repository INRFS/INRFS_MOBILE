import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {styles} from '../../../styles/superadmin/components/SuperAdminHeader.styles';
import {useAppData} from '../../../navigation/AppNavigator';

type Props = {
  navigation: any;
  title: string;
  showBack?: boolean;
  // NEW: when true, renders a bold, large "INRFS" logo in place of the
  // title text. Only the Dashboard screen passes this — every other
  // screen keeps rendering its `title` exactly as before.
  showLogo?: boolean;
};

const SuperAdminHeader = ({navigation, title, showBack = true, showLogo = false}: Props) => {
  const {adminProfile, saNotifications} = useAppData();
  const unreadCount = saNotifications.filter(n => n.isNew).length;
  const initial = adminProfile.name?.trim()?.[0]?.toUpperCase() || 'S';

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : null}
        {showLogo ? (
          <Text style={localStyles.logoText} numberOfLines={1}>
            INRFS
          </Text>
        ) : (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
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

// Kept local (rather than added to SuperAdminHeader.styles.ts, which
// wasn't shared) so this change is self-contained to this file.
const localStyles = StyleSheet.create({
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0B1E45',
    letterSpacing: -0.5,
  },
});

export default SuperAdminHeader;