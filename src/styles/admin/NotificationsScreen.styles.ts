import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';
const BLUE = '#2563EB';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },
  backBtn: {width: 28},
  backArrow: {fontSize: 24, color: NAVY, fontWeight: '700'},
  headerTitle: {fontSize: 17, fontWeight: '700', color: NAVY},

  container: {padding: 20, paddingBottom: 40},

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  unreadText: {fontSize: 13, color: GRAY, fontWeight: '600'},
  markAllLink: {fontSize: 13, color: BLUE, fontWeight: '700'},

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  cardUnread: {
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFF',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconEmoji: {fontSize: 16},
  textWrap: {flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4},
  title: {fontSize: 14, fontWeight: '700', color: '#111827'},
  newBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {fontSize: 10, fontWeight: '700', color: BLUE},
  message: {fontSize: 12.5, color: GRAY, lineHeight: 18, marginBottom: 6},
  time: {fontSize: 11, color: '#9CA3AF'},
});