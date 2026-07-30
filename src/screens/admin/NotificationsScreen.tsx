import React from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/NotificationsScreen.styles';

const ICON_MAP: Record<string, {emoji: string; bg: string}> = {
  check: {emoji: '✅', bg: '#DCFCE7'},
  bond: {emoji: '📄', bg: '#EDE9FE'},
  money: {emoji: '💵', bg: '#DBEAFE'},
  bell: {emoji: '🔔', bg: '#FEF3C7'},
  mail: {emoji: '✉️', bg: '#DBEAFE'},
};

const NotificationsScreen = ({navigation}: any) => {
  const {adminNotifications, markAllAdminNotificationsRead} = useAppData();
  const unreadCount = adminNotifications.filter(n => n.isNew).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAdminNotificationsRead}>
              <Text style={styles.markAllLink}>Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {adminNotifications.map(n => {
          const icon = ICON_MAP[n.icon] ?? ICON_MAP.bell;
          return (
            <View key={n.id} style={[styles.card, n.isNew && styles.cardUnread]}>
              <View style={[styles.iconWrap, {backgroundColor: icon.bg}]}>
                <Text style={styles.iconEmoji}>{icon.emoji}</Text>
              </View>
              <View style={styles.textWrap}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{n.title}</Text>
                  {n.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.message}>{n.message}</Text>
                <Text style={styles.time}>{n.time}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;