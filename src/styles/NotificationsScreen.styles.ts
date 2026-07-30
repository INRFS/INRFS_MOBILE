import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E2A5E',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 32,
  },

  // Subtitle row
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  unreadText: {
    fontSize: 12,
    color: '#6B7280',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1955F0',
  },

  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#1955F0',
  },

  // Icon circle (color varies by notification type)
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleCheck: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleBond: {
    backgroundColor: '#EDE9FE',
  },
  iconCircleMoney: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleBell: {
    backgroundColor: '#FEF3C7',
  },
  iconCircleMail: {
    backgroundColor: '#DBEAFE',
  },

  // Content
  notifContent: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1955F0',
  },
  notifMessage: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});