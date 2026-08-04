import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  unreadText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  markAllText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '700',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  cardNew: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  newPill: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  newPillText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  approvalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  approveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  resolvedApprovedText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 6,
  },
  resolvedRejectedText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 6,
  },
});