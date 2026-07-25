import {StyleSheet} from 'react-native';

export const NAVY = '#1B3A7A';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 110,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roof: {
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: NAVY,
  },
  pillarsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  pillar: {
    width: 6,
    height: 24,
    backgroundColor: NAVY,
    marginHorizontal: 3,
  },
  base: {
    width: 48,
    height: 5,
    backgroundColor: NAVY,
    marginTop: 3,
    borderRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#B8C4E0',
    letterSpacing: 2,
    marginTop: 6,
  },
});