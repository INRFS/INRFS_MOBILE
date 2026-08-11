import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#2563EB',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#2563EB',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#111827',
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  readonlyBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  statusBannerText: {
    fontSize: 13,
    color: '#065F46',
  },
  statusSuccess: {
    color: '#059669',
    fontWeight: '700',
  },
});