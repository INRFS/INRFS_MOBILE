import {StyleSheet} from 'react-native';

const NAVY = '#3c5381';
const PRIMARY = '#2563EB';
const PRIMARY_DARK = '#1D4ED8';
const BG = '#e6e8f3';
const GRAY = '#6B7280';
const BORDER = '#EEF0F4';

// Status accent colors — same palette used across the admin app so
// Active/Pending reads as a color at a glance, not just badge text.
const GREEN = '#09473f';
const GREEN_BG = '#DCFCE7';
const AMBER = '#D97706';
const AMBER_BG = '#FEF3C7';
const SLATE = '#6B7280';
const SLATE_BG = '#E5E7EB';

export const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: '#fff'},

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: {fontSize: 18, fontWeight: '800', color: NAVY},
  bell: {fontSize: 18},

  container: {padding: 20, paddingBottom: 110, backgroundColor: BG, flexGrow: 1},

  title: {fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4, letterSpacing: -0.3},
  subtitle: {fontSize: 13, color: GRAY, marginBottom: 16},

  searchRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  filterBtn: {
    width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  filterBtnPressed: {backgroundColor: '#F3F4F6', borderColor: '#D1D5DB'},

  // ---- Investor card — premium elevated card: soft shadow instead of a
  // flat border, plus a 4px colored left stripe matching the investor's
  // status (green=Active, amber=Pending, slate=Inactive), applied via the
  // cardAccent* helpers below. ----
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    shadowColor: '#0B1E45',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardAccentActive: {borderLeftColor: GREEN},
  cardAccentPending: {borderLeftColor: AMBER},
  cardAccentInactive: {borderLeftColor: SLATE},

  cardTopRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  avatarWrap: {
    width: 44, height: 44, borderRadius: 13, backgroundColor: '#EAF0FE',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  avatarText: {fontSize: 18},
  nameWrap: {flex: 1},
  name: {fontSize: 15.5, fontWeight: '800', color: '#111827'},
  invId: {fontSize: 12, color: GRAY, marginTop: 2},
  email: {fontSize: 12, color: GRAY, marginTop: 2},

  infoRow: {flexDirection: 'row', marginBottom: 12},
  infoCol: {flex: 1},
  infoLabel: {fontSize: 11, color: GRAY, marginBottom: 4, fontWeight: '600'},
  infoValue: {fontSize: 13, fontWeight: '700', color: '#111827'},

  // Status pill — tinted background + glowing dot instead of a flat gray
  // badge, matching the card's accent stripe.
  pill: {alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20},
  pillActive: {backgroundColor: GREEN_BG},
  pillPending: {backgroundColor: AMBER_BG},
  pillInactive: {backgroundColor: SLATE_BG},
  pillText: {fontSize: 11, fontWeight: '800'},

  divider: {height: 1, backgroundColor: '#F1F2F5', marginBottom: 12},

  statsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14},
  statLabel: {fontSize: 12, color: GRAY, marginBottom: 4, fontWeight: '600'},
  statValue: {fontSize: 15, fontWeight: '800', color: '#111827'},
  statusRow: {flexDirection: 'row', alignItems: 'center'},
  dot: {width: 7, height: 7, borderRadius: 4, marginRight: 6},
  dotGlowActive: {
    backgroundColor: GREEN,
    shadowColor: GREEN, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.9, shadowRadius: 4, elevation: 3,
  },
  dotGlowPending: {
    backgroundColor: AMBER,
    shadowColor: AMBER, shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.9, shadowRadius: 4, elevation: 3,
  },
  dotGlowInactive: {backgroundColor: SLATE},
  statusText: {fontSize: 13, fontWeight: '700'},

  // ---- Card actions (View Profile / Edit) — accent color plus a matching
  // pressed-state shade for real tap feedback instead of a flat opacity
  // fade. ----
  actionsRow: {flexDirection: 'row', gap: 10},
  viewProfileBtn: {
    flex: 1, backgroundColor: NAVY, borderRadius: 10, paddingVertical: 12, alignItems: 'center',
    shadowColor: NAVY, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  viewProfileBtnPressed: {backgroundColor: '#081A3D'},
  viewProfileText: {color: '#fff', fontWeight: '700', fontSize: 13},
  editBtn: {
    width: 46, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  editBtnPressed: {backgroundColor: '#EFF6FF', borderColor: PRIMARY},

  fab: {
    position: 'absolute', right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
    shadowColor: PRIMARY, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, elevation: 6,
  },
  fabPressed: {backgroundColor: PRIMARY_DARK},
  fabIcon: {color: '#fff', fontSize: 28, fontWeight: '400', marginTop: -2},

  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingVertical: 10, paddingBottom: 18,
  },
  tabItem: {flex: 1, alignItems: 'center'},
  tabIcon: {fontSize: 18, color: GRAY, marginBottom: 2},
  tabIconActive: {fontSize: 18, marginBottom: 2},
  tabLabel: {fontSize: 11, color: GRAY},
  tabLabelActive: {fontSize: 11, color: PRIMARY, fontWeight: '700'},

  // ---------------------------------------------------------------------
  // Export button (searchRow)
  // ---------------------------------------------------------------------
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  exportBtnPressed: {backgroundColor: '#F3F4F6', borderColor: '#D1D5DB'},
  exportBtnText: {fontSize: 13, fontWeight: '700', color: '#111827'},

  // ---------------------------------------------------------------------
  // Active / Pending status filter chips — premium: active chip gets a
  // soft navy glow shadow, pressed state gives a visible tap response
  // ---------------------------------------------------------------------
  statusFilterRow: {flexDirection: 'row', gap: 8, marginBottom: 18},
  statusFilterChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  statusFilterChipActive: {
    backgroundColor: NAVY, borderColor: NAVY,
    shadowColor: NAVY, shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3,
  },
  statusFilterChipPressed: {backgroundColor: '#F3F4F6'},
  statusFilterChipActivePressed: {backgroundColor: '#081A3D'},
  statusFilterChipText: {fontSize: 12.5, fontWeight: '700', color: '#111827'},
  statusFilterChipTextActive: {color: '#fff'},
});