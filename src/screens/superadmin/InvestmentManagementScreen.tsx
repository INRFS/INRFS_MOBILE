// // import React, {useState} from 'react';
// // import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet} from 'react-native';
// // import {styles} from '../../styles/superadmin/InvestmentManagementScreen.styles';
// // import SuperAdminHeader from './components/SuperAdminHeader';
// // import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
// // import {SafeAreaView} from 'react-native-safe-area-context';

// // type BondStatus = 'Active' | 'Matured' | 'Pending';

// // interface InvestmentRow {
// //   bond: string | null; // null = no bond generated yet (matches "—" in web)
// //   investor: string;
// //   amount: string;
// //   rate: string;
// //   investedOn: string;
// //   maturesOn: string | null;
// //   monthlyInt: string;
// //   status: BondStatus;
// // }

// // // STATIC DATA — matches the web reference screenshot exactly for now.
// // const STATIC_INVESTMENTS: InvestmentRow[] = [
// //   {bond: 'BND-2025-001', investor: 'Arjun Sharma', amount: '₹5,00,000', rate: '3% p.m.', investedOn: '15 Jan 2025', maturesOn: '15 Jan 2026', monthlyInt: '₹15,000', status: 'Active'},
// //   {bond: 'BND-2025-002', investor: 'Rahul Kumar', amount: '₹8,75,000', rate: '3% p.m.', investedOn: '18 Jan 2025', maturesOn: '18 Jul 2025', monthlyInt: '₹26,250', status: 'Matured'},
// //   {bond: 'BND-2025-003', investor: 'Neha Gupta', amount: '₹6,00,000', rate: '3% p.m.', investedOn: '22 Jan 2025', maturesOn: '22 Jan 2026', monthlyInt: '₹18,000', status: 'Active'},
// //   {bond: 'BND-2025-004', investor: 'Priya Patel', amount: '₹2,50,000', rate: '3% p.m.', investedOn: '22 Jul 2025', maturesOn: null, monthlyInt: '₹7,500', status: 'Pending'},
// //   {bond: null, investor: 'Vikram Singh', amount: '₹3,25,000', rate: '3% p.m.', investedOn: '21 Jul 2025', maturesOn: null, monthlyInt: '₹9,750', status: 'Pending'},
// // ];

// // const statusPillStyle = (status: BondStatus) => {
// //   switch (status) {
// //     case 'Active':
// //       return {pill: styles.pillActive, text: styles.pillTextActive};
// //     case 'Matured':
// //       return {pill: styles.pillMatured, text: styles.pillTextMatured};
// //     default:
// //       return {pill: styles.pillPending, text: styles.pillTextPending};
// //   }
// // };

// // const InvestmentManagementScreen = ({navigation}: any) => {
// //   const [query, setQuery] = useState('');
// //   const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRow | null>(null);

// //   const rows = STATIC_INVESTMENTS.filter(
// //     inv =>
// //       inv.investor.toLowerCase().includes(query.toLowerCase()) ||
// //       (inv.bond ?? '').toLowerCase().includes(query.toLowerCase()),
// //   );

// //   const closeModal = () => setSelectedInvestment(null);

// //   return (
// //     <SafeAreaView style={styles.safeArea}>
// //       <SuperAdminHeader navigation={navigation} title="Investments" showBack={false} />

// //       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
// //         <View style={styles.headerRow}>
// //           <View>
// //             <Text style={styles.title}>Investment Management</Text>
// //             <Text style={styles.subtitle}>All investments across all branches — {STATIC_INVESTMENTS.length} records</Text>
// //           </View>
// //         </View>

// //         <TextInput
// //           style={styles.searchInput}
// //           placeholder="Search bonds..."
// //           placeholderTextColor="#9CA3AF"
// //           value={query}
// //           onChangeText={setQuery}
// //         />

// //         {rows.length === 0 && (
// //           <View style={styles.emptyWrap}>
// //             <Text style={styles.emptyText}>No investments found</Text>
// //           </View>
// //         )}

// //         {rows.map((inv, idx) => {
// //           const statusStyle = statusPillStyle(inv.status);
// //           return (
// //             <View key={inv.bond ?? `pending-${idx}`} style={styles.card}>
// //               <View style={styles.cardTopRow}>
// //                 <View>
// //                   <Text style={styles.bondId}>{inv.bond ?? '— No Bond Yet'}</Text>
// //                   <Text style={styles.investorName}>{inv.investor}</Text>
// //                 </View>
// //                 <View style={[styles.pill, statusStyle.pill]}>
// //                   <Text style={[styles.pillText, statusStyle.text]}>{inv.status}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardGrid}>
// //                 <View style={styles.cardCol}>
// //                   <Text style={styles.cardLabel}>AMOUNT</Text>
// //                   <Text style={styles.cardValue}>{inv.amount}</Text>
// //                 </View>
// //                 <View style={styles.cardCol}>
// //                   <Text style={styles.cardLabel}>RATE</Text>
// //                   <Text style={styles.cardValue}>{inv.rate}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardGrid}>
// //                 <View style={styles.cardCol}>
// //                   <Text style={styles.cardLabel}>INVESTED ON</Text>
// //                   <Text style={styles.cardValueSm}>{inv.investedOn}</Text>
// //                 </View>
// //                 <View style={styles.cardCol}>
// //                   <Text style={styles.cardLabel}>MATURES ON</Text>
// //                   <Text style={styles.cardValueSm}>{inv.maturesOn ?? '—'}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardGrid}>
// //                 <View style={styles.cardCol}>
// //                   <Text style={styles.cardLabel}>MONTHLY INTEREST</Text>
// //                   <Text style={styles.cardValueSm}>{inv.monthlyInt}</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.actionRow}>
// //                 <TouchableOpacity style={styles.eyeBtn} onPress={() => setSelectedInvestment(inv)}>
// //                   <Text>👁️</Text>
// //                 </TouchableOpacity>
// //                 {inv.status === 'Active' && (
// //                   <TouchableOpacity style={styles.bondBtn}>
// //                     <Text style={styles.bondBtnText}>🎫  Bond</Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </View>
// //             </View>
// //           );
// //         })}
// //       </ScrollView>

// //       {/* View details modal — matches web reference popup */}
// //       <Modal
// //         visible={!!selectedInvestment}
// //         transparent
// //         animationType="fade"
// //         onRequestClose={closeModal}>
// //         <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={closeModal}>
// //           <TouchableOpacity activeOpacity={1} style={modalStyles.card} onPress={() => {}}>
// //             {selectedInvestment && (
// //               <>
// //                 <View style={modalStyles.headerRow}>
// //                   <Text style={modalStyles.headerTitle}>
// //                     {selectedInvestment.bond ?? '— No Bond Yet'}
// //                   </Text>
// //                   <TouchableOpacity onPress={closeModal} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
// //                     <Text style={modalStyles.closeIcon}>✕</Text>
// //                   </TouchableOpacity>
// //                 </View>

// //                 <View style={modalStyles.grid}>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>BOND</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.bond ?? '—'}</Text>
// //                   </View>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>INVESTOR</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.investor}</Text>
// //                   </View>
// //                 </View>

// //                 <View style={modalStyles.grid}>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>AMOUNT</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.amount}</Text>
// //                   </View>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>RATE</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.rate}</Text>
// //                   </View>
// //                 </View>

// //                 <View style={modalStyles.grid}>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>INVESTED ON</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.investedOn}</Text>
// //                   </View>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>MATURES ON</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.maturesOn ?? '—'}</Text>
// //                   </View>
// //                 </View>

// //                 <View style={modalStyles.grid}>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>MONTHLY INTEREST</Text>
// //                     <Text style={modalStyles.value}>{selectedInvestment.monthlyInt}</Text>
// //                   </View>
// //                   <View style={modalStyles.col}>
// //                     <Text style={modalStyles.label}>STATUS</Text>
// //                     <View
// //                       style={[
// //                         styles.pill,
// //                         statusPillStyle(selectedInvestment.status).pill,
// //                         modalStyles.pillSpacing,
// //                       ]}>
// //                       <Text
// //                         style={[
// //                           styles.pillText,
// //                           statusPillStyle(selectedInvestment.status).text,
// //                         ]}>
// //                         {selectedInvestment.status}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </>
// //             )}
// //           </TouchableOpacity>
// //         </TouchableOpacity>
// //       </Modal>

// //       <SuperAdminBottomTabBar navigation={navigation} active="Dashboard" />
// //     </SafeAreaView>
// //   );
// // };

// // const modalStyles = StyleSheet.create({
// //   overlay: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.5)',
// //     justifyContent: 'center',
// //     paddingHorizontal: 20,
// //   },
// //   card: {
// //     backgroundColor: '#FFFFFF',
// //     borderRadius: 16,
// //     padding: 20,
// //   },
// //   headerRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     marginBottom: 16,
// //   },
// //   headerTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: '#111827',
// //   },
// //   closeIcon: {
// //     fontSize: 18,
// //     color: '#6B7280',
// //   },
// //   grid: {
// //     flexDirection: 'row',
// //     marginBottom: 16,
// //   },
// //   col: {
// //     flex: 1,
// //   },
// //   label: {
// //     fontSize: 11,
// //     fontWeight: '600',
// //     color: '#9CA3AF',
// //     marginBottom: 4,
// //     letterSpacing: 0.5,
// //   },
// //   value: {
// //     fontSize: 15,
// //     fontWeight: '600',
// //     color: '#111827',
// //   },
// //   pillSpacing: {
// //     alignSelf: 'flex-start',
// //     marginTop: 2,
// //   },
// // });

// // export default InvestmentManagementScreen;

// // import React, {useState} from 'react';
// // import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet} from 'react-native';
// // import {styles} from '../../styles/superadmin/InvestmentManagementScreen.styles';
// // import SuperAdminHeader from './components/SuperAdminHeader';
// // import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
// // import {SafeAreaView} from 'react-native-safe-area-context';

// // type BondStatus = 'Active' | 'Matured' | 'Pending';

// // interface InvestmentRow {
// //   bond: string | null; // null = no bond generated yet (matches "—" in web)
// //   investor: string;
// //   amount: string;
// //   rate: string;
// //   investedOn: string;
// //   maturesOn: string | null;
// //   monthlyInt: string;
// //   status: BondStatus;
// // }

// // // STATIC DATA — matches the web reference screenshot exactly for now.
// // const STATIC_INVESTMENTS: InvestmentRow[] = [
// //   {bond: 'BND-2025-001', investor: 'Arjun Sharma', amount: '₹5,00,000', rate: '3% p.m.', investedOn: '15 Jan 2025', maturesOn: '15 Jan 2026', monthlyInt: '₹15,000', status: 'Active'},
// //   {bond: 'BND-2025-002', investor: 'Rahul Kumar', amount: '₹8,75,000', rate: '3% p.m.', investedOn: '18 Jan 2025', maturesOn: '18 Jul 2025', monthlyInt: '₹26,250', status: 'Matured'},
// //   {bond: 'BND-2025-003', investor: 'Neha Gupta', amount: '₹6,00,000', rate: '3% p.m.', investedOn: '22 Jan 2025', maturesOn: '22 Jan 2026', monthlyInt: '₹18,000', status: 'Active'},
// //   {bond: 'BND-2025-004', investor: 'Priya Patel', amount: '₹2,50,000', rate: '3% p.m.', investedOn: '22 Jul 2025', maturesOn: null, monthlyInt: '₹7,500', status: 'Pending'},
// //   {bond: null, investor: 'Vikram Singh', amount: '₹3,25,000', rate: '3% p.m.', investedOn: '21 Jul 2025', maturesOn: null, monthlyInt: '₹9,750', status: 'Pending'},
// // ];

// import React, {useState} from 'react';
// import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet} from 'react-native';
// import {styles} from '../../styles/superadmin/InvestmentManagementScreen.styles';
// import SuperAdminHeader from './components/SuperAdminHeader';
// import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {useAppData, Bond, InvestmentRequest} from '../../navigation/AppNavigator';

// type BondStatus = 'Active' | 'Matured' | 'Pending';

// // Same row shape the UI was already built against — kept so nothing below
// // (search, pills, modal) has to change. Rows are now derived from the live
// // `bonds` and `investmentRequests` arrays in context instead of the old
// // STATIC_INVESTMENTS seed, the same way PaymentQueueScreen derives its rows
// // from `payouts`. `id` is added only as a stable list key.
// interface InvestmentRow {
//   id: string;
//   bond: string | null; // null = no bond generated yet (matches "—" in web)
//   investor: string;
//   amount: string;
//   rate: string;
//   investedOn: string;
//   maturesOn: string | null;
//   monthlyInt: string;
//   status: BondStatus;
// }

// const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

// // Same monthly-interest formula already used in AppNavigator's
// // createPayoutForBond, reused here so the figure shown matches what the
// // investor's actual monthly payout would be.
// const monthlyInterestFor = (amount: number, interestRate: number) =>
//   Math.round((amount * (interestRate / 100)) / 12);

// // A bond is only "Matured" once it's actually been settled — bonds that are
// // still Active/Upcoming keep showing Active here, same status the rest of
// // the app (BondTracking, Settlement) treats them as until settleMaturedBond
// // / approvePreSettlement flips them to 'Settled'.
// const bondToRow = (bond: Bond): InvestmentRow => ({
//   id: bond.seriesId,
//   bond: bond.seriesId,
//   investor: bond.investorName,
//   amount: formatINR(bond.amount),
//   rate: `${bond.interestRate}% p.m.`,
//   investedOn: bond.investedDate,
//   maturesOn: bond.maturityDate,
//   monthlyInt: formatINR(monthlyInterestFor(bond.amount, bond.interestRate)),
//   status: bond.status === 'Settled' ? 'Matured' : 'Active',
// });

// // A still-pending investment request has no bond generated yet — mirrors
// // the "— No Bond Yet" row the UI already renders for that case.
// const requestToRow = (req: InvestmentRequest): InvestmentRow => ({
//   id: req.id,
//   bond: null,
//   investor: req.investorName,
//   amount: formatINR(req.amount),
//   rate: `${req.interestRate}% p.m.`,
//   investedOn: req.requestedOn,
//   maturesOn: null,
//   monthlyInt: formatINR(monthlyInterestFor(req.amount, req.interestRate)),
//   status: 'Pending',
// });

// const statusPillStyle = (status: BondStatus) => {
//   switch (status) {
//     case 'Active':
//       return {pill: styles.pillActive, text: styles.pillTextActive};
//     case 'Matured':
//       return {pill: styles.pillMatured, text: styles.pillTextMatured};
//     default:
//       return {pill: styles.pillPending, text: styles.pillTextPending};
//   }
// };

// const InvestmentManagementScreen = ({navigation}: any) => {
//   const {bonds, investmentRequests} = useAppData();
//   const [query, setQuery] = useState('');
//   const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRow | null>(null);

//   // Live rows: every generated bond, plus every investment request still
//   // awaiting approval (which therefore has no bond yet).
//   const investmentRows: InvestmentRow[] = [
//     ...bonds.map(bondToRow),
//     ...investmentRequests.filter(r => r.status === 'Pending').map(requestToRow),
//   ];

//   const rows = investmentRows.filter(
//     inv =>
//       inv.investor.toLowerCase().includes(query.toLowerCase()) ||
//       (inv.bond ?? '').toLowerCase().includes(query.toLowerCase()),
//   );

//   const closeModal = () => setSelectedInvestment(null);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <SuperAdminHeader navigation={navigation} title="Investments" showBack={false} />

//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.title}>Investment Management</Text>
//             <Text style={styles.subtitle}>All investments across all branches — {investmentRows.length} records</Text>
//           </View>
//         </View>

//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search bonds..."
//           placeholderTextColor="#9CA3AF"
//           value={query}
//           onChangeText={setQuery}
//         />

//         {rows.length === 0 && (
//           <View style={styles.emptyWrap}>
//             <Text style={styles.emptyText}>No investments found</Text>
//           </View>
//         )}

//         {rows.map(inv => {
//           const statusStyle = statusPillStyle(inv.status);
//           return (
//             <View key={inv.id} style={styles.card}>
//               <View style={styles.cardTopRow}>
//                 <View>
//                   <Text style={styles.bondId}>{inv.bond ?? '— No Bond Yet'}</Text>
//                   <Text style={styles.investorName}>{inv.investor}</Text>
//                 </View>
//                 <View style={[styles.pill, statusStyle.pill]}>
//                   <Text style={[styles.pillText, statusStyle.text]}>{inv.status}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>AMOUNT</Text>
//                   <Text style={styles.cardValue}>{inv.amount}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>RATE</Text>
//                   <Text style={styles.cardValue}>{inv.rate}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>INVESTED ON</Text>
//                   <Text style={styles.cardValueSm}>{inv.investedOn}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>MATURES ON</Text>
//                   <Text style={styles.cardValueSm}>{inv.maturesOn ?? '—'}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>MONTHLY INTEREST</Text>
//                   <Text style={styles.cardValueSm}>{inv.monthlyInt}</Text>
//                 </View>
//               </View>

//               <View style={styles.actionRow}>
//                 <TouchableOpacity style={styles.eyeBtn} onPress={() => setSelectedInvestment(inv)}>
//                   <Text>👁️</Text>
//                 </TouchableOpacity>
//                 {inv.status === 'Active' && (
//                   <TouchableOpacity style={styles.bondBtn}>
//                     <Text style={styles.bondBtnText}>🎫  Bond</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           );
//         })}
//       </ScrollView>

//       {/* View details modal — matches web reference popup */}
//       <Modal
//         visible={!!selectedInvestment}
//         transparent
//         animationType="fade"
//         onRequestClose={closeModal}>
//         <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={closeModal}>
//           <TouchableOpacity activeOpacity={1} style={modalStyles.card} onPress={() => {}}>
//             {selectedInvestment && (
//               <>
//                 <View style={modalStyles.headerRow}>
//                   <Text style={modalStyles.headerTitle}>
//                     {selectedInvestment.bond ?? '— No Bond Yet'}
//                   </Text>
//                   <TouchableOpacity onPress={closeModal} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
//                     <Text style={modalStyles.closeIcon}>✕</Text>
//                   </TouchableOpacity>
//                 </View>

//                 <View style={modalStyles.grid}>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>BOND</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.bond ?? '—'}</Text>
//                   </View>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>INVESTOR</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.investor}</Text>
//                   </View>
//                 </View>

//                 <View style={modalStyles.grid}>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>AMOUNT</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.amount}</Text>
//                   </View>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>RATE</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.rate}</Text>
//                   </View>
//                 </View>

//                 <View style={modalStyles.grid}>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>INVESTED ON</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.investedOn}</Text>
//                   </View>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>MATURES ON</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.maturesOn ?? '—'}</Text>
//                   </View>
//                 </View>

//                 <View style={modalStyles.grid}>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>MONTHLY INTEREST</Text>
//                     <Text style={modalStyles.value}>{selectedInvestment.monthlyInt}</Text>
//                   </View>
//                   <View style={modalStyles.col}>
//                     <Text style={modalStyles.label}>STATUS</Text>
//                     <View
//                       style={[
//                         styles.pill,
//                         statusPillStyle(selectedInvestment.status).pill,
//                         modalStyles.pillSpacing,
//                       ]}>
//                       <Text
//                         style={[
//                           styles.pillText,
//                           statusPillStyle(selectedInvestment.status).text,
//                         ]}>
//                         {selectedInvestment.status}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </>
//             )}
//           </TouchableOpacity>
//         </TouchableOpacity>
//       </Modal>

//       <SuperAdminBottomTabBar navigation={navigation} active="Investments" />
//     </SafeAreaView>
//   );
// };

// const modalStyles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     paddingHorizontal: 20,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   closeIcon: {
//     fontSize: 18,
//     color: '#6B7280',
//   },
//   grid: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   col: {
//     flex: 1,
//   },
//   label: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#9CA3AF',
//     marginBottom: 4,
//     letterSpacing: 0.5,
//   },
//   value: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   pillSpacing: {
//     alignSelf: 'flex-start',
//     marginTop: 2,
//   },
// });

// export default InvestmentManagementScreen;

import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet} from 'react-native';
import {styles} from '../../styles/superadmin/InvestmentManagementScreen.styles';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData, Bond, InvestmentRequest, Investor} from '../../navigation/AppNavigator';

type BondStatus = 'Active' | 'Matured' | 'Pending';

interface InvestmentRow {
  id: string;
  bond: string | null;
  investor: string;
  branch: string;
  amount: string;
  rate: string;
  investedOn: string;
  maturesOn: string | null;
  monthlyInt: string;
  status: BondStatus;
}

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

const monthlyInterestFor = (amount: number, interestRate: number) =>
  Math.round((amount * (interestRate / 100)) / 12);

// Branch was set once, at registration, on the Investor record — not on
// each individual bond/request. So we resolve it here via a name→investor
// lookup instead of expecting bonds/requests to carry their own branch.
const branchForInvestor = (
  investorName: string,
  investorLookup: Map<string, Investor>,
): string => {
  const match = investorLookup.get(investorName);
  return match?.branch && match.branch !== '' ? match.branch : '—';
};

const bondToRow = (bond: Bond, investorLookup: Map<string, Investor>): InvestmentRow => ({
  id: bond.seriesId,
  bond: bond.seriesId,
  investor: bond.investorName,
  branch: branchForInvestor(bond.investorName, investorLookup),
  amount: formatINR(bond.amount),
  rate: `${bond.interestRate}% p.m.`,
  investedOn: bond.investedDate,
  maturesOn: bond.maturityDate,
  monthlyInt: formatINR(monthlyInterestFor(bond.amount, bond.interestRate)),
  status: bond.status === 'Settled' ? 'Matured' : 'Active',
});

const requestToRow = (req: InvestmentRequest, investorLookup: Map<string, Investor>): InvestmentRow => ({
  id: req.id,
  bond: null,
  investor: req.investorName,
  branch: branchForInvestor(req.investorName, investorLookup),
  amount: formatINR(req.amount),
  rate: `${req.interestRate}% p.m.`,
  investedOn: req.requestedOn,
  maturesOn: null,
  monthlyInt: formatINR(monthlyInterestFor(req.amount, req.interestRate)),
  status: 'Pending',
});

const statusPillStyle = (status: BondStatus) => {
  switch (status) {
    case 'Active':
      return {pill: styles.pillActive, text: styles.pillTextActive};
    case 'Matured':
      return {pill: styles.pillMatured, text: styles.pillTextMatured};
    default:
      return {pill: styles.pillPending, text: styles.pillTextPending};
  }
};

const InvestmentManagementScreen = ({navigation}: any) => {
  const {bonds, investmentRequests, investors} = useAppData();
  const [query, setQuery] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentRow | null>(null);

  // Name → Investor lookup, built once per render from the live investors
  // list (the same list InvestorManagementScreen reads `.branch` from) so
  // every bond/request row can resolve its branch from registration data.
  const investorLookup = new Map<string, Investor>(investors.map(inv => [inv.name, inv]));

  const investmentRows: InvestmentRow[] = [
    ...bonds.map(b => bondToRow(b, investorLookup)),
    ...investmentRequests.filter(r => r.status === 'Pending').map(r => requestToRow(r, investorLookup)),
  ];

  const rows = investmentRows.filter(
    inv =>
      inv.investor.toLowerCase().includes(query.toLowerCase()) ||
      (inv.bond ?? '').toLowerCase().includes(query.toLowerCase()) ||
      inv.branch.toLowerCase().includes(query.toLowerCase()),
  );

  const closeModal = () => setSelectedInvestment(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Investments" showBack={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Investment Management</Text>
            <Text style={styles.subtitle}>All investments across all branches — {investmentRows.length} records</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search bonds, investors or branch..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />

        {rows.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No investments found</Text>
          </View>
        )}

        {rows.map(inv => {
          const statusStyle = statusPillStyle(inv.status);
          return (
            <View key={inv.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.bondId}>{inv.bond ?? '— No Bond Yet'}</Text>
                  <Text style={styles.investorName}>{inv.investor}</Text>
                </View>
                <View style={[styles.pill, statusStyle.pill]}>
                  <Text style={[styles.pillText, statusStyle.text]}>{inv.status}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>AMOUNT</Text>
                  <Text style={styles.cardValue}>{inv.amount}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>RATE</Text>
                  <Text style={styles.cardValue}>{inv.rate}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>BRANCH</Text>
                  <Text style={styles.cardValueSm}>{inv.branch}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>INVESTED ON</Text>
                  <Text style={styles.cardValueSm}>{inv.investedOn}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>MATURES ON</Text>
                  <Text style={styles.cardValueSm}>{inv.maturesOn ?? '—'}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>MONTHLY INTEREST</Text>
                  <Text style={styles.cardValueSm}>{inv.monthlyInt}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setSelectedInvestment(inv)}>
                  <Text>👁️</Text>
                </TouchableOpacity>
                {inv.status === 'Active' && (
                  <TouchableOpacity style={styles.bondBtn}>
                    <Text style={styles.bondBtnText}>🎫  Bond</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!selectedInvestment}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={closeModal}>
          <TouchableOpacity activeOpacity={1} style={modalStyles.card} onPress={() => {}}>
            {selectedInvestment && (
              <>
                <View style={modalStyles.headerRow}>
                  <Text style={modalStyles.headerTitle}>
                    {selectedInvestment.bond ?? '— No Bond Yet'}
                  </Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={modalStyles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>BOND</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.bond ?? '—'}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>INVESTOR</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.investor}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>BRANCH</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.branch}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>AMOUNT</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.amount}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>RATE</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.rate}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>INVESTED ON</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.investedOn}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>MATURES ON</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.maturesOn ?? '—'}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>MONTHLY INTEREST</Text>
                    <Text style={modalStyles.value}>{selectedInvestment.monthlyInt}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>STATUS</Text>
                    <View
                      style={[
                        styles.pill,
                        statusPillStyle(selectedInvestment.status).pill,
                        modalStyles.pillSpacing,
                      ]}>
                      <Text
                        style={[
                          styles.pillText,
                          statusPillStyle(selectedInvestment.status).text,
                        ]}>
                        {selectedInvestment.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SuperAdminBottomTabBar navigation={navigation} active="Investments" />
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    fontSize: 18,
    color: '#6B7280',
  },
  grid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  pillSpacing: {
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});

export default InvestmentManagementScreen;