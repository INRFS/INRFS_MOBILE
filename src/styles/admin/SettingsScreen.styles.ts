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
  pageTitle: {fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16},

  rowBetween: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  rowTextWrap: {flex: 1, paddingRight: 12},
  rowLabel: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  rowSubtitle: {fontSize: 12, color: GRAY, marginTop: 2},

  inputLabel: {fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 18},
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },

  updateBtn: {
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  updateBtnText: {fontSize: 14, fontWeight: '700', color: '#fff'},
});