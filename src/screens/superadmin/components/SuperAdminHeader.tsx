import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {styles} from '../../../styles/superadmin/components/SuperAdminHeader.styles';
import {useAppData} from '../../../navigation/AppNavigator';

type Props = {
  navigation: any;
  title: string;
  showBack?: boolean;
};

const SuperAdminHeader = ({navigation, title, showBack = true}: Props) => {
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

export default SuperAdminHeader;