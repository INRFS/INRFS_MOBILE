import {StyleSheet} from 'react-native';

export const BORDER = '#E2E4E9';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 8,
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  iconWrapActive: {
    backgroundColor: '#E6EDFE',
  },
  label: {fontSize: 11, color: '#9CA3AF', fontWeight: '600'},
  labelActive: {color: '#1955F0'},
});