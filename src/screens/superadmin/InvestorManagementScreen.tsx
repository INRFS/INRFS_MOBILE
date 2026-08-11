// import React, {useState} from 'react';
// import {View, Text, ScrollView, TouchableOpacity, TextInput} from 'react-native';
// import {styles} from '../../styles/superadmin/InvestorManagementScreen.styles';
// import SuperAdminHeader from './components/SuperAdminHeader';
// import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
// import {SafeAreaView} from 'react-native-safe-area-context';

// type KycStatus = 'Approved' | 'Pending' | 'Rejected';
// type InvestorStatus = 'Active' | 'Pending' | 'Suspended';

// interface InvestorRow {
//   id: string;
//   name: string;
//   mobile: string;
//   branch: string;
//   registered: string;
//   kyc: KycStatus;
//   status: InvestorStatus;
//   aum: string;
// }

// // STATIC DATA — matches the web reference screenshot exactly for now.
// const STATIC_INVESTORS: InvestorRow[] = [
//   {id: 'INV001', name: 'Arjun Sharma', mobile: '9876543210', branch: 'Mumbai HQ', registered: '12 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹5,00,000'},
//   {id: 'INV002', name: 'Priya Patel', mobile: '9876543211', branch: 'Delhi North', registered: '14 Jan 2025', kyc: 'Pending', status: 'Pending', aum: '₹2,50,000'},
//   {id: 'INV003', name: 'Rahul Kumar', mobile: '9876543212', branch: 'Bangalore', registered: '16 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹8,75,000'},
//   {id: 'INV004', name: 'Sunita Verma', mobile: '9876543213', branch: 'Chennai', registered: '18 Jan 2025', kyc: 'Rejected', status: 'Suspended', aum: '₹1,50,000'},
//   {id: 'INV005', name: 'Vikram Singh', mobile: '9876543214', branch: 'Pune', registered: '20 Jan 2025', kyc: 'Pending', status: 'Pending', aum: '₹3,25,000'},
//   {id: 'INV006', name: 'Neha Gupta', mobile: '9876543215', branch: 'Mumbai HQ', registered: '22 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹6,00,000'},
// ];

// const kycPillStyle = (kyc: KycStatus) => {
//   switch (kyc) {
//     case 'Approved':
//       return {pill: styles.pillApproved, text: styles.pillTextApproved};
//     case 'Rejected':
//       return {pill: styles.pillRejected, text: styles.pillTextRejected};
//     default:
//       return {pill: styles.pillPending, text: styles.pillTextPending};
//   }
// };

// const statusPillStyle = (status: InvestorStatus) => {
//   switch (status) {
//     case 'Active':
//       return {pill: styles.pillApproved, text: styles.pillTextApproved};
//     case 'Suspended':
//       return {pill: styles.pillRejected, text: styles.pillTextRejected};
//     default:
//       return {pill: styles.pillPending, text: styles.pillTextPending};
//   }
// };

// const InvestorManagementScreen = ({navigation}: any) => {
//   const [query, setQuery] = useState('');

//   const rows = STATIC_INVESTORS.filter(
//     inv =>
//       inv.name.toLowerCase().includes(query.toLowerCase()) ||
//       inv.id.toLowerCase().includes(query.toLowerCase()),
//   );

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <SuperAdminHeader navigation={navigation} title="Investors" showBack={false} />

//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <View style={styles.headerRow}>
//           <View>
//             <Text style={styles.title}>Investor Management</Text>
//             <Text style={styles.subtitle}>All investors across all branches — {STATIC_INVESTORS.length} records</Text>
//           </View>
//         </View>

//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search investors..."
//           placeholderTextColor="#9CA3AF"
//           value={query}
//           onChangeText={setQuery}
//         />

//         {rows.length === 0 && (
//           <View style={styles.emptyWrap}>
//             <Text style={styles.emptyText}>No investors found</Text>
//           </View>
//         )}

//         {rows.map(inv => {
//           const kycStyle = kycPillStyle(inv.kyc);
//           const statusStyle = statusPillStyle(inv.status);
//           return (
//             <View key={inv.id} style={styles.card}>
//               <View style={styles.cardTopRow}>
//                 <View>
//                   <Text style={styles.investorId}>{inv.id}</Text>
//                   <Text style={styles.investorName}>{inv.name}</Text>
//                 </View>
//                 <TouchableOpacity style={styles.eyeBtn}>
//                   <Text>👁️</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>MOBILE</Text>
//                   <Text style={styles.cardValueSm}>{inv.mobile}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>BRANCH</Text>
//                   <Text style={styles.cardValueSm}>{inv.branch}</Text>
//                 </View>
//               </View>

//               <View style={styles.cardGrid}>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>REGISTERED</Text>
//                   <Text style={styles.cardValueSm}>{inv.registered}</Text>
//                 </View>
//                 <View style={styles.cardCol}>
//                   <Text style={styles.cardLabel}>AUM</Text>
//                   <Text style={styles.cardValue}>{inv.aum}</Text>
//                 </View>
//               </View>

//               <View style={styles.pillRow}>
//                 <View style={styles.pillGroup}>
//                   <Text style={styles.pillGroupLabel}>KYC</Text>
//                   <View style={[styles.pill, kycStyle.pill]}>
//                     <Text style={[styles.pillText, kycStyle.text]}>{inv.kyc}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.pillGroup}>
//                   <Text style={styles.pillGroupLabel}>STATUS</Text>
//                   <View style={[styles.pill, statusStyle.pill]}>
//                     <Text style={[styles.pillText, statusStyle.text]}>{inv.status}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           );
//         })}
//       </ScrollView>

//       <SuperAdminBottomTabBar navigation={navigation} active="Dashboard" />
//     </SafeAreaView>
//   );
// };

// export default InvestorManagementScreen;

import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet} from 'react-native';
import {styles} from '../../styles/superadmin/InvestorManagementScreen.styles';
import SuperAdminHeader from './components/SuperAdminHeader';
import SuperAdminBottomTabBar from './components/SuperAdminBottomTabBar';
import {SafeAreaView} from 'react-native-safe-area-context';

type KycStatus = 'Approved' | 'Pending' | 'Rejected';
type InvestorStatus = 'Active' | 'Pending' | 'Suspended';

interface InvestorRow {
  id: string;
  name: string;
  mobile: string;
  branch: string;
  registered: string;
  kyc: KycStatus;
  status: InvestorStatus;
  aum: string;
}

// STATIC DATA — matches the web reference screenshot exactly for now.
const STATIC_INVESTORS: InvestorRow[] = [
  {id: 'INV001', name: 'Arjun Sharma', mobile: '9876543210', branch: 'Mumbai HQ', registered: '12 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹5,00,000'},
  {id: 'INV002', name: 'Priya Patel', mobile: '9876543211', branch: 'Delhi North', registered: '14 Jan 2025', kyc: 'Pending', status: 'Pending', aum: '₹2,50,000'},
  {id: 'INV003', name: 'Rahul Kumar', mobile: '9876543212', branch: 'Bangalore', registered: '16 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹8,75,000'},
  {id: 'INV004', name: 'Sunita Verma', mobile: '9876543213', branch: 'Chennai', registered: '18 Jan 2025', kyc: 'Rejected', status: 'Suspended', aum: '₹1,50,000'},
  {id: 'INV005', name: 'Vikram Singh', mobile: '9876543214', branch: 'Pune', registered: '20 Jan 2025', kyc: 'Pending', status: 'Pending', aum: '₹3,25,000'},
  {id: 'INV006', name: 'Neha Gupta', mobile: '9876543215', branch: 'Mumbai HQ', registered: '22 Jan 2025', kyc: 'Approved', status: 'Active', aum: '₹6,00,000'},
];

const kycPillStyle = (kyc: KycStatus) => {
  switch (kyc) {
    case 'Approved':
      return {pill: styles.pillApproved, text: styles.pillTextApproved};
    case 'Rejected':
      return {pill: styles.pillRejected, text: styles.pillTextRejected};
    default:
      return {pill: styles.pillPending, text: styles.pillTextPending};
  }
};

const statusPillStyle = (status: InvestorStatus) => {
  switch (status) {
    case 'Active':
      return {pill: styles.pillApproved, text: styles.pillTextApproved};
    case 'Suspended':
      return {pill: styles.pillRejected, text: styles.pillTextRejected};
    default:
      return {pill: styles.pillPending, text: styles.pillTextPending};
  }
};

const InvestorManagementScreen = ({navigation}: any) => {
  const [query, setQuery] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorRow | null>(null);

  const rows = STATIC_INVESTORS.filter(
    inv =>
      inv.name.toLowerCase().includes(query.toLowerCase()) ||
      inv.id.toLowerCase().includes(query.toLowerCase()),
  );

  const closeModal = () => setSelectedInvestor(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="Investors" showBack={false} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Investor Management</Text>
            <Text style={styles.subtitle}>All investors across all branches — {STATIC_INVESTORS.length} records</Text>
          </View>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search investors..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
        />

        {rows.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No investors found</Text>
          </View>
        )}

        {rows.map(inv => {
          const kycStyle = kycPillStyle(inv.kyc);
          const statusStyle = statusPillStyle(inv.status);
          return (
            <View key={inv.id} style={styles.card}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.investorId}>{inv.id}</Text>
                  <Text style={styles.investorName}>{inv.name}</Text>
                </View>
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setSelectedInvestor(inv)}>
                  <Text>👁️</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>MOBILE</Text>
                  <Text style={styles.cardValueSm}>{inv.mobile}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>BRANCH</Text>
                  <Text style={styles.cardValueSm}>{inv.branch}</Text>
                </View>
              </View>

              <View style={styles.cardGrid}>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>REGISTERED</Text>
                  <Text style={styles.cardValueSm}>{inv.registered}</Text>
                </View>
                <View style={styles.cardCol}>
                  <Text style={styles.cardLabel}>AUM</Text>
                  <Text style={styles.cardValue}>{inv.aum}</Text>
                </View>
              </View>

              <View style={styles.pillRow}>
                <View style={styles.pillGroup}>
                  <Text style={styles.pillGroupLabel}>KYC</Text>
                  <View style={[styles.pill, kycStyle.pill]}>
                    <Text style={[styles.pillText, kycStyle.text]}>{inv.kyc}</Text>
                  </View>
                </View>
                <View style={styles.pillGroup}>
                  <Text style={styles.pillGroupLabel}>STATUS</Text>
                  <View style={[styles.pill, statusStyle.pill]}>
                    <Text style={[styles.pillText, statusStyle.text]}>{inv.status}</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* View details modal — matches web reference popup */}
      <Modal
        visible={!!selectedInvestor}
        transparent
        animationType="fade"
        onRequestClose={closeModal}>
        <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={closeModal}>
          <TouchableOpacity activeOpacity={1} style={modalStyles.card} onPress={() => {}}>
            {selectedInvestor && (
              <>
                <View style={modalStyles.headerRow}>
                  <Text style={modalStyles.headerTitle}>{selectedInvestor.name}</Text>
                  <TouchableOpacity onPress={closeModal} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Text style={modalStyles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>INVESTOR ID</Text>
                    <Text style={modalStyles.value}>{selectedInvestor.id}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>MOBILE</Text>
                    <Text style={modalStyles.value}>{selectedInvestor.mobile}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>BRANCH</Text>
                    <Text style={modalStyles.value}>{selectedInvestor.branch}</Text>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>REGISTERED</Text>
                    <Text style={modalStyles.value}>{selectedInvestor.registered}</Text>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>KYC</Text>
                    <View style={[styles.pill, kycPillStyle(selectedInvestor.kyc).pill, modalStyles.pillSpacing]}>
                      <Text style={[styles.pillText, kycPillStyle(selectedInvestor.kyc).text]}>
                        {selectedInvestor.kyc}
                      </Text>
                    </View>
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>STATUS</Text>
                    <View style={[styles.pill, statusPillStyle(selectedInvestor.status).pill, modalStyles.pillSpacing]}>
                      <Text style={[styles.pillText, statusPillStyle(selectedInvestor.status).text]}>
                        {selectedInvestor.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={modalStyles.grid}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>AUM</Text>
                    <Text style={modalStyles.value}>{selectedInvestor.aum}</Text>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SuperAdminBottomTabBar navigation={navigation} active="Dashboard" />
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

export default InvestorManagementScreen;