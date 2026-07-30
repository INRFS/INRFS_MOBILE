import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, } from 'react-native';
import {styles} from '../../styles/superadmin/NotificationsScreen.styles';
import {useAppData, SANotification} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
const iconFor = (icon: SANotification['icon']) => {
  switch (icon) {
    case 'check':
      return '✅';
    case 'bond':
      return '📄';
    case 'money':
      return '💵';
    case 'bell':
      return '🔔';
    case 'mail':
      return '✉️';
    default:
      return '🔔';
  }
};

const NotificationsScreen = ({navigation}: any) => {
  const {saNotifications, markAllNotificationsRead} = useAppData();
  const unreadCount = saNotifications.filter(n => n.isNew).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Notifications" showBack={false} />
      <View style={styles.topBar}>
        <Text style={styles.unreadText}>{unreadCount} unread notifications</Text>
        <TouchableOpacity onPress={markAllNotificationsRead}>
          <Text style={styles.markAllText}>✓ Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {saNotifications.map(note => (
          <View key={note.id} style={[styles.card, note.isNew && styles.cardNew]}>
            <View style={styles.iconWrap}>
              <Text style={styles.icon}>{iconFor(note.icon)}</Text>
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{note.title}</Text>
                {note.isNew ? (
                  <View style={styles.newPill}>
                    <Text style={styles.newPillText}>New</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.message}>{note.message}</Text>
              <Text style={styles.time}>{note.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <SuperAdminBottomTabBar navigation={navigation} active="Notifications" />
    </SafeAreaView>
  );
};

export default NotificationsScreen;