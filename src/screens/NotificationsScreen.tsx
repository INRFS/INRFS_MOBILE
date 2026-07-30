import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../styles/NotificationsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
type NotificationItem = {
  id: string;
  title: string;
  isNew: boolean;
  message: string;
  time: string;
  icon: string;
  iconStyle: 'iconCircleCheck' | 'iconCircleBond' | 'iconCircleMoney' | 'iconCircleBell' | 'iconCircleMail';
};

// Replace with real investor notification data (from context/API) once available.
const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Investment Approved',
    isNew: true,
    message: 'Your investment BND-2025-001 of ₹5,00,000 has been approved.',
    time: '2 hours ago',
    icon: 'check-circle-outline',
    iconStyle: 'iconCircleCheck',
  },
  {
    id: 'n2',
    title: 'Bond Generated',
    isNew: true,
    message: 'Investment Bond BND-2025-001 has been generated. Download now.',
    time: '2 hours ago',
    icon: 'file-document-outline',
    iconStyle: 'iconCircleBond',
  },
  {
    id: 'n3',
    title: 'Interest Credited',
    isNew: true,
    message: '₹5,000 monthly interest for June 2025 has been credited.',
    time: '5 days ago',
    icon: 'cash-multiple',
    iconStyle: 'iconCircleMoney',
  },
  {
    id: 'n4',
    title: 'Upcoming Maturity',
    isNew: false,
    message: 'Bond BND-2024-087 matures in 30 days. Plan your renewal.',
    time: '1 week ago',
    icon: 'bell-outline',
    iconStyle: 'iconCircleBell',
  },
  {
    id: 'n5',
    title: 'Email Confirmation',
    isNew: false,
    message: 'Email confirmation sent to arjun@email.com for investment.',
    time: '2 weeks ago',
    icon: 'email-outline',
    iconStyle: 'iconCircleMail',
  },
];

const InvestorNotificationsScreen = ({navigation}: any) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter(n => n.isNew).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, isNew: false})));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.subtitleRow}>
        <Text style={styles.unreadText}>{unreadCount} unread notifications</Text>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark All Read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {notifications.map(n => (
          <View key={n.id} style={[styles.notifCard, n.isNew && styles.notifCardUnread]}>
            <View style={[styles.iconCircle, styles[n.iconStyle]]}>
              <Icon name={n.icon} size={18} color="#111827" />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifTitleRow}>
                <Text style={styles.notifTitle}>{n.title}</Text>
                {n.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
              <Text style={styles.notifMessage}>{n.message}</Text>
              <Text style={styles.notifTime}>{n.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvestorNotificationsScreen;