import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  // Role cards
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  roleCardActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  roleName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  roleNameActive: {
    color: '#2563EB',
  },
  roleTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleTag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  permsTag: {
    backgroundColor: '#F3F4F6',
  },
  permsTagText: {
    color: '#374151',
  },

  // Permission matrix card
  matrixCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  matrixTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  matrixRolePill: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matrixRolePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  matrixCount: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Permission rows
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  permLabel: {
    fontSize: 13,
    color: '#374151',
  },

  // Save button
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});