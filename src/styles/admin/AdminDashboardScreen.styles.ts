import {StyleSheet} from 'react-native';

const NAVY = '#0B1E45';
const BG = '#F4F6FA';
const GRAY = '#6B7280';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: BG},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
  },
  headerTitle: {fontSize: 18, fontWeight: '700', color: NAVY},
  headerIcons: {flexDirection: 'row', alignItems: 'center'},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110},

  greetingTitle: {fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 2},
  greetingSubtitle: {fontSize: 12.5, color: GRAY, marginBottom: 14},

  topActionsRow: {flexDirection: 'row', gap: 10, marginBottom: 16},
  topActionBtnOutline: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff',
  },
  topActionBtnOutlineText: {fontSize: 13, fontWeight: '700', color: '#111827'},
  topActionBtnFilled: {
    flex: 1, backgroundColor: '#2563EB', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  topActionBtnFilledText: {fontSize: 13, fontWeight: '700', color: '#fff'},

  aumCard: {
    backgroundColor: NAVY,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  aumLabel: {color: '#C6CEE0', fontSize: 13, marginBottom: 6},
  aumValue: {color: '#fff', fontSize: 26, fontWeight: '700', marginBottom: 6},
  aumChange: {color: '#4ADE80', fontSize: 13, fontWeight: '600'},

  statGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16},
  statGridCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },
  statGridIconWrap: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  statGridLabel: {color: GRAY, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.3, marginBottom: 4},
  statGridValue: {fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4},
  statGridDeltaGood: {fontSize: 11, color: '#16A34A', fontWeight: '700'},
  statGridDeltaBad: {fontSize: 11, color: '#DC2626', fontWeight: '700'},
  statGridDeltaNeutral: {fontSize: 11, color: GRAY, fontWeight: '600'},

  statsRow: {flexDirection: 'row', gap: 12, marginBottom: 16},
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },
  statTopRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18},
  statIconWrap: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  statLabel: {color: GRAY, fontSize: 13, marginBottom: 4},
  statValue: {fontSize: 20, fontWeight: '700', color: '#111827'},

  badgeActive: {backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  badgeActiveText: {color: '#16A34A', fontSize: 11, fontWeight: '700'},
  badgeUrgent: {backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12},
  badgeUrgentText: {color: '#DC2626', fontSize: 11, fontWeight: '700'},

  chartCard: {backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16},
  chartHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  chartTitle: {fontSize: 15, fontWeight: '700', color: '#111827'},
  chartMenu: {color: GRAY, fontSize: 16},
  chartBarsRow: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100, marginBottom: 8},
  chartBarCol: {flex: 1, alignItems: 'center'},
  chartBar: {width: 8, borderRadius: 4, backgroundColor: '#2563EB'},
  chartLabelsRow: {flexDirection: 'row', justifyContent: 'space-between'},
  chartLabel: {color: GRAY, fontSize: 10},

  sectionHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#111827'},
  viewLogs: {color: '#2563EB', fontSize: 13, fontWeight: '600'},

  activityCard: {backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 14, marginBottom: 16},
  activityRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14},
  activityRowBorder: {borderBottomWidth: 1, borderBottomColor: '#F1F2F5'},
  activityIconWrap: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#E7ECFB',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  activityInitial: {fontSize: 15, fontWeight: '700', color: '#2563EB'},
  activityTextWrap: {flex: 1},
  activityTitle: {fontSize: 14, fontWeight: '600', color: '#111827'},
  activitySubtitle: {fontSize: 12, color: GRAY, marginTop: 2},
  activityTime: {fontSize: 12, color: GRAY},

  miniBadge: {paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8},
  miniBadgeText: {fontSize: 10, fontWeight: '700'},

  riskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9EBF0',
    borderRadius: 16, padding: 16, marginBottom: 20,
  },
  riskIcon: {fontSize: 20, marginRight: 12},
  riskTextWrap: {flex: 1},
  riskTitle: {fontSize: 14, fontWeight: '700', color: '#111827'},
  riskSubtitle: {fontSize: 12, color: GRAY, marginTop: 2},
  riskArrow: {
    fontSize: 18, color: '#fff', backgroundColor: NAVY, width: 32, height: 32,
    borderRadius: 16, textAlign: 'center', textAlignVertical: 'center',
  },

  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#EEF0F4',
    paddingVertical: 10, paddingBottom: 18,
  },
  tabItem: {flex: 1, alignItems: 'center'},
  tabIcon: {fontSize: 18, color: GRAY, marginBottom: 2},
  tabIconActive: {fontSize: 18, marginBottom: 2},
  tabLabel: {fontSize: 11, color: GRAY},
  tabLabelActive: {fontSize: 11, color: NAVY, fontWeight: '700'},

  /* ---- Add Investment / Generate Bond modal ---- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {fontSize: 18, fontWeight: '800', color: '#111827'},
  modalClose: {fontSize: 16, color: GRAY, padding: 4},
  modalSubtitle: {fontSize: 12.5, color: GRAY, marginBottom: 18},

  inputLabel: {fontSize: 12.5, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14},
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

  investorResultsBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  investorResultRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F5',
  },
  investorResultName: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  investorResultMeta: {fontSize: 11.5, color: GRAY, marginTop: 2},
  noResultsText: {fontSize: 12, color: GRAY, marginTop: 8},

  selectedInvestorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectedInvestorName: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  selectedInvestorMeta: {fontSize: 11.5, color: GRAY, marginTop: 2},
  changeInvestorLink: {fontSize: 12.5, fontWeight: '700', color: '#2563EB'},

  tenureRow: {flexDirection: 'row', gap: 8},
  tenureOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tenureOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  tenureOptionMonths: {fontSize: 13, fontWeight: '800', color: '#111827'},
  tenureOptionMonthsActive: {color: '#fff'},
  tenureOptionRate: {fontSize: 11, color: GRAY, marginTop: 2, fontWeight: '600'},
  tenureOptionRateActive: {color: '#DBEAFE'},

  summaryBox: {
    backgroundColor: '#F4F6FA',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    gap: 8,
  },
  summaryRow: {flexDirection: 'row', justifyContent: 'space-between'},
  summaryLabel: {fontSize: 12.5, color: GRAY, fontWeight: '600'},
  summaryValue: {fontSize: 13, color: '#111827', fontWeight: '700'},

  modalButtonsRow: {flexDirection: 'row', gap: 10, marginTop: 22},
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalCancelBtnText: {fontSize: 13.5, fontWeight: '700', color: '#111827'},
  modalSaveBtn: {
    flex: 1.4,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveBtnText: {fontSize: 13.5, fontWeight: '700', color: '#fff'},
});