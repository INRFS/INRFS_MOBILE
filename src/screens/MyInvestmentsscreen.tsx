// import React, {useEffect, useMemo, useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Modal,
//   Platform,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import BottomTabBar from '../components/BottomTabBar';
// import {styles} from '../styles/MyInvestmentsScreen.styles';
// import {SafeAreaView} from 'react-native-safe-area-context';

// // ---------------------------------------------------------------------------
// // Excel export requires these packages:
// //   npm install xlsx react-native-fs react-native-share
// // (iOS: cd ios && pod install)
// // ---------------------------------------------------------------------------
// import XLSX from 'xlsx';
// import RNFS from 'react-native-fs';
// import RNShare from 'react-native-share';

// // ---------------------------------------------------------------------------
// // Shared investments data — lives here so both MyInvestmentsScreen and
// // InvestNowScreen can use it, without a separate store file/screen.
// // InvestNowScreen imports { addInvestment } from this file and calls it
// // on submit; this screen re-renders automatically via the useInvestments hook.
// // ---------------------------------------------------------------------------

// export type BondStatus = 'Active' | 'Matured';

// export type Investment = {
//   id: string;
//   name: string;
//   status: BondStatus;
//   amount: number;
//   rate: number;
//   tenureMonths: number;
//   investedOn: string;
//   maturesOn: string;
//   monthlyInterest: number;
//   earned: number;
// };

// const formatDate = (d: Date) =>
//   d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});

// // TODO: replace with your real investor investments API call.
// let investments: Investment[] = [
//   {
//     id: 'BND-2025-001',
//     name: 'Green Power Infra Bond',
//     status: 'Active',
//     amount: 500000,
//     rate: 12,
//     tenureMonths: 12,
//     investedOn: '15 Jan 2025',
//     maturesOn: '15 Jan 2026',
//     monthlyInterest: 5000,
//     earned: 30000,
//   },
//   {
//     id: 'BND-2024-087',
//     name: 'Tata Capital Series IV',
//     status: 'Matured',
//     amount: 300000,
//     rate: 11,
//     tenureMonths: 12,
//     investedOn: '10 Jun 2024',
//     maturesOn: '10 Jun 2025',
//     monthlyInterest: 2750,
//     earned: 33000,
//   },
// ];

// type Listener = () => void;
// const listeners = new Set<Listener>();
// const notify = () => listeners.forEach(l => l());

// export type NewInvestmentInput = {
//   amount: number;
//   rate: number;
//   tenureMonths: number;
// };

// // Call this from InvestNowScreen (or anywhere) when an investment is submitted.
// export function addInvestment(input: NewInvestmentInput): Investment {
//   const investedOnDate = new Date();
//   const maturesOnDate = new Date(investedOnDate);
//   maturesOnDate.setMonth(maturesOnDate.getMonth() + input.tenureMonths);

//   const years = input.tenureMonths / 12;
//   const totalInterest = input.amount * (input.rate / 100) * years;
//   const monthlyInterest = totalInterest / input.tenureMonths;

//   const year = investedOnDate.getFullYear();
//   const seq = String(investments.length + 1).padStart(3, '0');

//   const newInvestment: Investment = {
//     id: `BND-${year}-${seq}`,
//     name: `INRFS Bond — ${input.tenureMonths}M`,
//     // Newly submitted investments reuse the 'Active' badge styling so no new
//     // style keys are needed. Add a 'Pending' variant later if you want a
//     // distinct look for investments awaiting admin verification.
//     status: 'Active',
//     amount: input.amount,
//     rate: input.rate,
//     tenureMonths: input.tenureMonths,
//     investedOn: formatDate(investedOnDate),
//     maturesOn: formatDate(maturesOnDate),
//     monthlyInterest,
//     earned: 0,
//   };

//   investments = [newInvestment, ...investments];
//   notify();
//   return newInvestment;
// }

// // Hook: re-renders any screen using it whenever the list changes.
// export function useInvestments(): Investment[] {
//   const [data, setData] = useState<Investment[]>(investments);

//   useEffect(() => {
//     const listener = () => setData(investments);
//     listeners.add(listener);
//     return () => {
//       listeners.delete(listener);
//     };
//   }, []);

//   return data;
// }

// // ---------------------------------------------------------------------------
// // Screen
// // ---------------------------------------------------------------------------

// const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// // Tenure extension options offered to the investor.
// const EXTENSION_OPTIONS = [12, 24, 36];

// // Flat early-exit penalty applied on principal for a pre-settlement request.
// // TODO: replace with your real penalty schedule (e.g. tiered by months held).
// const EARLY_EXIT_PENALTY_RATE = 0.02; // 2%

// const MyInvestmentsScreen = ({navigation, route}: any) => {
//   const {investorId} = route?.params || {};
//   const [query, setQuery] = useState('');

//   const items = useInvestments();

//   // ---- Tenure extension modal state ----
//   const [tenureModalBond, setTenureModalBond] = useState<Investment | null>(null);
//   const [selectedExtension, setSelectedExtension] = useState<number>(EXTENSION_OPTIONS[0]);

//   // ---- Settlement (pre-settlement) modal state ----
//   const [settlementModalBond, setSettlementModalBond] = useState<Investment | null>(null);

//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return items;
//     return items.filter(
//       inv => inv.id.toLowerCase().includes(q) || inv.name.toLowerCase().includes(q),
//     );
//   }, [query, items]);

//   const totalValue = useMemo(
//     () => items.reduce((sum, inv) => sum + inv.amount + inv.earned, 0),
//     [items],
//   );

//   // ---------- Export to Excel ----------
//   const handleExport = async () => {
//     try {
//       const rows = items.map(inv => ({
//         'Bond Number': inv.id,
//         'Bond Name': inv.name,
//         Status: inv.status,
//         'Amount (₹)': inv.amount,
//         'Rate (% p.a.)': inv.rate,
//         'Tenure (Months)': inv.tenureMonths,
//         'Invested On': inv.investedOn,
//         'Matures On': inv.maturesOn,
//         'Monthly Interest (₹)': inv.monthlyInterest,
//         'Earned (₹)': inv.earned,
//       }));

//       const worksheet = XLSX.utils.json_to_sheet(rows);
//       const workbook = XLSX.utils.book_new();
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'My Investments');
//       const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});

//       const fileName = `INRFS_My_Investments_${Date.now()}.xlsx`;
//       const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
//       await RNFS.writeFile(filePath, base64, 'base64');

//       await RNShare.open({
//         url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         filename: fileName,
//       });
//     } catch (err: any) {
//       // RNShare throws when the user simply dismisses the share sheet — don't
//       // show an error alert for that case.
//       if (err?.message && !/user did not share/i.test(err.message)) {
//         Alert.alert('Export failed', 'Could not generate the Excel file. Please try again.');
//       }
//     }
//   };

//   // ---------- Tenure extension ----------
//   const openTenureModal = (inv: Investment) => {
//     setSelectedExtension(EXTENSION_OPTIONS[0]);
//     setTenureModalBond(inv);
//   };

//   const handleConfirmExtension = () => {
//     if (!tenureModalBond) return;
//     // TODO: replace with your real "request tenure extension" API call.
//     // This should notify the admin so they can approve/reject it from the
//     // Admin Portal's "Extend Tenure" screen.
//     Alert.alert(
//       'Request submitted',
//       `Your request to extend ${tenureModalBond.id} by ${selectedExtension} months has been sent to the admin for approval.`,
//     );
//     setTenureModalBond(null);
//   };

//   // ---------- Pre-settlement ----------
//   const openSettlementModal = (inv: Investment) => {
//     setSettlementModalBond(inv);
//   };

//   const handleRequestSettlement = () => {
//     if (!settlementModalBond) return;
//     // TODO: replace with your real "request pre-settlement" API call.
//     // This should notify the admin so they can review/approve it from the
//     // Admin Portal's Settlement screen.
//     Alert.alert(
//       'Settlement requested',
//       `Your pre-settlement request for ${settlementModalBond.id} has been sent to the admin for approval.`,
//     );
//     setSettlementModalBond(null);
//   };

//   const settlementPenalty = settlementModalBond
//     ? settlementModalBond.amount * EARLY_EXIT_PENALTY_RATE
//     : 0;
//   const settlementNet = settlementModalBond
//     ? settlementModalBond.amount + settlementModalBond.earned - settlementPenalty
//     : 0;

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.header}>
//         <View style={styles.headerBrand}>
//           <Image source={{uri: 'https://i.pravatar.cc/64?img=5'}} style={styles.avatar} />
//           <Text style={styles.headerTitle}>My Investments</Text>
//         </View>
//         <TouchableOpacity>
//           <Icon name="bell-outline" size={20} color="#1A1A18" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <View style={styles.heroCard}>
//           <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
//           <Text style={styles.heroValue}>{formatINR(totalValue)}</Text>
//         </View>

//         <View style={styles.searchRow}>
//           <View style={styles.searchBox}>
//             <Icon name="magnify" size={18} color="#9C9689" />
//             <TextInput
//               style={styles.searchInput}
//               value={query}
//               onChangeText={setQuery}
//               placeholder="Search bonds..."
//               placeholderTextColor="#9C9689"
//             />
//           </View>
//           <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
//             <Icon name="export-variant" size={16} color="#1A1A18" />
//             <Text style={styles.exportBtnText}>Export</Text>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.sectionHeaderRow}>
//           <Text style={styles.sectionTitle}>Investment details</Text>
//           <Text style={styles.recordCount}>
//             Showing {filtered.length} record{filtered.length === 1 ? '' : 's'}
//           </Text>
//         </View>

//         {filtered.map((inv, i) => (
//           <View
//             key={inv.id}
//             style={[styles.investmentCard, i === 0 && styles.investmentCardFirst]}>
//             <View style={styles.cardTopRow}>
//               <Text style={styles.bondId}>{inv.id}</Text>
//               <View
//                 style={[
//                   styles.statusBadge,
//                   inv.status === 'Active' ? styles.statusBadgeActive : styles.statusBadgeMatured,
//                 ]}>
//                 <Text
//                   style={[
//                     styles.statusBadgeText,
//                     inv.status === 'Active'
//                       ? styles.statusBadgeTextActive
//                       : styles.statusBadgeTextMatured,
//                   ]}>
//                   {inv.status.toUpperCase()}
//                 </Text>
//               </View>
//             </View>
//             <Text style={styles.bondName}>{inv.name}</Text>

//             <View style={styles.metaGrid}>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>AMOUNT</Text>
//                 <Text style={styles.metaValue}>{formatINR(inv.amount)}</Text>
//               </View>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>RATE</Text>
//                 <Text style={styles.metaValueGold}>{inv.rate}% p.a.</Text>
//               </View>
//             </View>
//             <View style={styles.metaGrid}>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>INVESTED ON</Text>
//                 <Text style={styles.metaValue}>{inv.investedOn}</Text>
//               </View>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>MATURES ON</Text>
//                 <Text style={styles.metaValue}>{inv.maturesOn}</Text>
//               </View>
//             </View>
//             <View style={styles.metaGrid}>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>MONTHLY INT.</Text>
//                 <Text style={styles.metaValue}>{formatINR(inv.monthlyInterest)}</Text>
//               </View>
//               <View style={styles.metaCol}>
//                 <Text style={styles.metaLabel}>EARNED</Text>
//                 <Text style={styles.metaValueGreen}>{formatINR(inv.earned)}</Text>
//               </View>
//             </View>

//             <View style={styles.actionIconRow}>
//               <TouchableOpacity
//                 style={styles.actionIconBtn}
//                 onPress={() => navigation.navigate('BondDetails', {investorId, bondId: inv.id})}>
//                 <Icon name="eye-outline" size={18} color="#1A1A18" />
//                 <Text style={styles.actionIconBtnText}>View</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.actionIconBtn} onPress={() => openTenureModal(inv)}>
//                 <Icon name="calendar-clock" size={18} color="#1A1A18" />
//                 <Text style={styles.actionIconBtnText}>Tenure</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.actionIconBtn}
//                 onPress={() => openSettlementModal(inv)}>
//                 <Icon name="cash-refund" size={18} color="#1A1A18" />
//                 <Text style={styles.actionIconBtnText}>Settle</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))}

//         <TouchableOpacity
//           style={styles.newInvestmentBtn}
//           onPress={() => navigation.navigate('InvestNow', {investorId})}>
//           <Icon name="plus-circle-outline" size={18} color="#8A6D2F" />
//           <Text style={styles.newInvestmentBtnText}>New Investment</Text>
//         </TouchableOpacity>
//       </ScrollView>

//       {/* ---------- Tenure Extension modal ---------- */}
//       <Modal
//         visible={!!tenureModalBond}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setTenureModalBond(null)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>Extend Tenure — {tenureModalBond?.id}</Text>
//               <TouchableOpacity onPress={() => setTenureModalBond(null)}>
//                 <Icon name="close" size={20} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.modalFieldLabel}>Extension Period</Text>
//             <View style={styles.modalChipRow}>
//               {EXTENSION_OPTIONS.map(months => {
//                 const active = selectedExtension === months;
//                 return (
//                   <TouchableOpacity
//                     key={months}
//                     style={[styles.modalChip, active && styles.modalChipActive]}
//                     onPress={() => setSelectedExtension(months)}>
//                     <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
//                       {months} Months
//                     </Text>
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>

//             <View style={styles.modalActionRow}>
//               <TouchableOpacity
//                 style={styles.modalCancelBtn}
//                 onPress={() => setTenureModalBond(null)}>
//                 <Text style={styles.modalCancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmExtension}>
//                 <Text style={styles.modalConfirmBtnText}>Confirm</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ---------- Settlement (pre-settlement) modal ---------- */}
//       <Modal
//         visible={!!settlementModalBond}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setSettlementModalBond(null)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeaderRow}>
//               <Text style={styles.modalTitle}>Settlement — {settlementModalBond?.id}</Text>
//               <TouchableOpacity onPress={() => setSettlementModalBond(null)}>
//                 <Icon name="close" size={20} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             {settlementModalBond && (
//               <>
//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalRowLabel}>Principal</Text>
//                   <Text style={styles.modalRowValue}>
//                     {formatINR(settlementModalBond.amount)}
//                   </Text>
//                 </View>
//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalRowLabel}>Interest Earned</Text>
//                   <Text style={styles.modalRowValueGreen}>
//                     {formatINR(settlementModalBond.earned)}
//                   </Text>
//                 </View>
//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalRowLabel}>Early Exit Penalty (2%)</Text>
//                   <Text style={styles.modalRowValueRed}>-{formatINR(settlementPenalty)}</Text>
//                 </View>

//                 <View style={styles.modalDivider} />

//                 <View style={styles.modalRow}>
//                   <Text style={styles.modalNetLabel}>Net Settlement</Text>
//                   <Text style={styles.modalNetValue}>{formatINR(settlementNet)}</Text>
//                 </View>
//               </>
//             )}

//             <View style={styles.modalActionRow}>
//               <TouchableOpacity
//                 style={styles.modalCancelBtn}
//                 onPress={() => setSettlementModalBond(null)}>
//                 <Text style={styles.modalCancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleRequestSettlement}>
//                 <Text style={styles.modalConfirmBtnText}>Request Settlement</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <BottomTabBar active="Portfolio" navigation={navigation} />
//     </SafeAreaView>
//   );
// };

// export default MyInvestmentsScreen;

import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/MyInvestmentsScreen.styles';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// Excel export requires these packages:
//   npm install xlsx react-native-fs react-native-share
// (iOS: cd ios && pod install)
// ---------------------------------------------------------------------------
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';

// ---------------------------------------------------------------------------
// Investment data now comes straight from the shared AppDataContext
// (AppNavigator.tsx) — the same store the Admin side reads/writes. There is
// no separate local store here anymore, so an investor's investment and what
// the admin sees are always the same data:
//   - Bonds already approved by an admin -> shown as Active / Matured.
//   - Investment requests still awaiting admin approval -> shown as
//     "Pending Approval" (no bond exists yet for these).
// ---------------------------------------------------------------------------

export type BondStatus = 'Active' | 'Matured' | 'Pending Approval';

export type Investment = {
  id: string;
  name: string;
  status: BondStatus;
  amount: number;
  rate: number;
  tenureMonths: number;
  investedOn: string;
  maturesOn: string;
  monthlyInterest: number;
  earned: number;
};

const parseDisplayDate = (s: string): Date => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const monthsBetween = (start: Date, end: Date): number => {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(months, 1);
};

// Hook: re-renders automatically whenever bonds / investment requests change,
// since it reads straight from context. Pass an investorId to scope the list
// to one investor (used by MyInvestmentsScreen below); call with no
// arguments to get every bond in the system (used by BondDetailsScreen,
// matching its previous behaviour of looking up bonds by id globally).
export function useInvestments(investorId?: string): Investment[] {
  const {bonds, investmentRequests, investors} = useAppData();

  const investorName = investorId
    ? investors.find(inv => inv.id === investorId)?.name
    : undefined;

  const bondItems: Investment[] = bonds
    .filter(b => !investorId || b.investorName === investorName)
    .map(b => {
      const investedDate = parseDisplayDate(b.investedDate);
      const maturityDate = parseDisplayDate(b.maturityDate);
      const tenureMonths = monthsBetween(investedDate, maturityDate);
      const years = tenureMonths / 12;
      const totalInterest = b.amount * (b.interestRate / 100) * years;

      return {
        id: b.seriesId,
        name: `INRFS Bond — ${b.seriesId}`,
        status: (b.status === 'Settled' ? 'Matured' : 'Active') as BondStatus,
        amount: b.amount,
        rate: b.interestRate,
        tenureMonths,
        investedOn: b.investedDate,
        maturesOn: b.maturityDate,
        monthlyInterest: totalInterest / tenureMonths,
        earned: 0,
      };
    });

  const pendingItems: Investment[] = investmentRequests
    .filter(r => r.status === 'Pending' && (!investorId || r.investorId === investorId))
    .map(r => ({
      id: r.id,
      name: `INRFS Bond — ${r.tenureMonths}M (Pending)`,
      status: 'Pending Approval' as BondStatus,
      amount: r.amount,
      rate: r.interestRate,
      tenureMonths: r.tenureMonths,
      investedOn: r.requestedOn,
      maturesOn: '—',
      monthlyInterest: 0,
      earned: 0,
    }));

  return [...pendingItems, ...bondItems];
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// Tenure extension options offered to the investor.
const EXTENSION_OPTIONS = [12, 24, 36];

// Flat early-exit penalty applied on principal for a pre-settlement request.
// TODO: replace with your real penalty schedule (e.g. tiered by months held).
const EARLY_EXIT_PENALTY_RATE = 0.02; // 2%

const MyInvestmentsScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};
  const [query, setQuery] = useState('');

  const items = useInvestments(investorId);

  // ---- Tenure extension modal state ----
  const [tenureModalBond, setTenureModalBond] = useState<Investment | null>(null);
  const [selectedExtension, setSelectedExtension] = useState<number>(EXTENSION_OPTIONS[0]);

  // ---- Settlement (pre-settlement) modal state ----
  const [settlementModalBond, setSettlementModalBond] = useState<Investment | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      inv => inv.id.toLowerCase().includes(q) || inv.name.toLowerCase().includes(q),
    );
  }, [query, items]);

  const totalValue = useMemo(
    () => items.reduce((sum, inv) => sum + inv.amount + inv.earned, 0),
    [items],
  );

  // ---------- Export to Excel ----------
  const handleExport = async () => {
    try {
      const rows = items.map(inv => ({
        'Bond Number': inv.id,
        'Bond Name': inv.name,
        Status: inv.status,
        'Amount (₹)': inv.amount,
        'Rate (% p.a.)': inv.rate,
        'Tenure (Months)': inv.tenureMonths,
        'Invested On': inv.investedOn,
        'Matures On': inv.maturesOn,
        'Monthly Interest (₹)': inv.monthlyInterest,
        'Earned (₹)': inv.earned,
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'My Investments');
      const base64 = XLSX.write(workbook, {type: 'base64', bookType: 'xlsx'});

      const fileName = `INRFS_My_Investments_${Date.now()}.xlsx`;
      const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64, 'base64');

      await RNShare.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: fileName,
      });
    } catch (err: any) {
      // RNShare throws when the user simply dismisses the share sheet — don't
      // show an error alert for that case.
      if (err?.message && !/user did not share/i.test(err.message)) {
        Alert.alert('Export failed', 'Could not generate the Excel file. Please try again.');
      }
    }
  };

  // ---------- Tenure extension ----------
  const openTenureModal = (inv: Investment) => {
    setSelectedExtension(EXTENSION_OPTIONS[0]);
    setTenureModalBond(inv);
  };

  const handleConfirmExtension = () => {
    if (!tenureModalBond) return;
    // TODO: replace with your real "request tenure extension" API call.
    // This should notify the admin so they can approve/reject it from the
    // Admin Portal's "Extend Tenure" screen.
    Alert.alert(
      'Request submitted',
      `Your request to extend ${tenureModalBond.id} by ${selectedExtension} months has been sent to the admin for approval.`,
    );
    setTenureModalBond(null);
  };

  // ---------- Pre-settlement ----------
  const openSettlementModal = (inv: Investment) => {
    setSettlementModalBond(inv);
  };

  const handleRequestSettlement = () => {
    if (!settlementModalBond) return;
    // TODO: replace with your real "request pre-settlement" API call.
    // This should notify the admin so they can review/approve it from the
    // Admin Portal's Settlement screen.
    Alert.alert(
      'Settlement requested',
      `Your pre-settlement request for ${settlementModalBond.id} has been sent to the admin for approval.`,
    );
    setSettlementModalBond(null);
  };

  const settlementPenalty = settlementModalBond
    ? settlementModalBond.amount * EARLY_EXIT_PENALTY_RATE
    : 0;
  const settlementNet = settlementModalBond
    ? settlementModalBond.amount + settlementModalBond.earned - settlementPenalty
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={{uri: 'https://i.pravatar.cc/64?img=5'}} style={styles.avatar} />
          <Text style={styles.headerTitle}>My Investments</Text>
        </View>
        <TouchableOpacity>
          <Icon name="bell-outline" size={20} color="#1A1A18" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>TOTAL PORTFOLIO VALUE</Text>
          <Text style={styles.heroValue}>{formatINR(totalValue)}</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Icon name="magnify" size={18} color="#9C9689" />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search bonds..."
              placeholderTextColor="#9C9689"
            />
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Icon name="export-variant" size={16} color="#1A1A18" />
            <Text style={styles.exportBtnText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Investment details</Text>
          <Text style={styles.recordCount}>
            Showing {filtered.length} record{filtered.length === 1 ? '' : 's'}
          </Text>
        </View>

        {filtered.map((inv, i) => (
          <View
            key={inv.id}
            style={[styles.investmentCard, i === 0 && styles.investmentCardFirst]}>
            <View style={styles.cardTopRow}>
              <Text style={styles.bondId}>{inv.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  inv.status === 'Active' ? styles.statusBadgeActive : styles.statusBadgeMatured,
                ]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    inv.status === 'Active'
                      ? styles.statusBadgeTextActive
                      : styles.statusBadgeTextMatured,
                  ]}>
                  {inv.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.bondName}>{inv.name}</Text>

            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>AMOUNT</Text>
                <Text style={styles.metaValue}>{formatINR(inv.amount)}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>RATE</Text>
                <Text style={styles.metaValueGold}>{inv.rate}% p.a.</Text>
              </View>
            </View>
            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>INVESTED ON</Text>
                <Text style={styles.metaValue}>{inv.investedOn}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>MATURES ON</Text>
                <Text style={styles.metaValue}>{inv.maturesOn}</Text>
              </View>
            </View>
            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>MONTHLY INT.</Text>
                <Text style={styles.metaValue}>{formatINR(inv.monthlyInterest)}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>EARNED</Text>
                <Text style={styles.metaValueGreen}>{formatINR(inv.earned)}</Text>
              </View>
            </View>

            {inv.status === 'Pending Approval' ? (
              <Text style={styles.recordCount}>
                Waiting for Admin Approval — actions unlock once approved.
              </Text>
            ) : (
              <View style={styles.actionIconRow}>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => navigation.navigate('BondDetails', {investorId, bondId: inv.id})}>
                  <Icon name="eye-outline" size={18} color="#1A1A18" />
                  <Text style={styles.actionIconBtnText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIconBtn} onPress={() => openTenureModal(inv)}>
                  <Icon name="calendar-clock" size={18} color="#1A1A18" />
                  <Text style={styles.actionIconBtnText}>Tenure</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => openSettlementModal(inv)}>
                  <Icon name="cash-refund" size={18} color="#1A1A18" />
                  <Text style={styles.actionIconBtnText}>Settle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.newInvestmentBtn}
          onPress={() => navigation.navigate('InvestNow', {investorId})}>
          <Icon name="plus-circle-outline" size={18} color="#8A6D2F" />
          <Text style={styles.newInvestmentBtnText}>New Investment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ---------- Tenure Extension modal ---------- */}
      <Modal
        visible={!!tenureModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setTenureModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Extend Tenure — {tenureModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setTenureModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalFieldLabel}>Extension Period</Text>
            <View style={styles.modalChipRow}>
              {EXTENSION_OPTIONS.map(months => {
                const active = selectedExtension === months;
                return (
                  <TouchableOpacity
                    key={months}
                    style={[styles.modalChip, active && styles.modalChipActive]}
                    onPress={() => setSelectedExtension(months)}>
                    <Text style={[styles.modalChipText, active && styles.modalChipTextActive]}>
                      {months} Months
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setTenureModalBond(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmExtension}>
                <Text style={styles.modalConfirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ---------- Settlement (pre-settlement) modal ---------- */}
      <Modal
        visible={!!settlementModalBond}
        transparent
        animationType="fade"
        onRequestClose={() => setSettlementModalBond(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Settlement — {settlementModalBond?.id}</Text>
              <TouchableOpacity onPress={() => setSettlementModalBond(null)}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {settlementModalBond && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Principal</Text>
                  <Text style={styles.modalRowValue}>
                    {formatINR(settlementModalBond.amount)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Interest Earned</Text>
                  <Text style={styles.modalRowValueGreen}>
                    {formatINR(settlementModalBond.earned)}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalRowLabel}>Early Exit Penalty (2%)</Text>
                  <Text style={styles.modalRowValueRed}>-{formatINR(settlementPenalty)}</Text>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalRow}>
                  <Text style={styles.modalNetLabel}>Net Settlement</Text>
                  <Text style={styles.modalNetValue}>{formatINR(settlementNet)}</Text>
                </View>
              </>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setSettlementModalBond(null)}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleRequestSettlement}>
                <Text style={styles.modalConfirmBtnText}>Request Settlement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomTabBar active="My Investments" navigation={navigation} />
    </SafeAreaView>
  );
};

export default MyInvestmentsScreen;