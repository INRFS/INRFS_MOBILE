// import React, {useState} from 'react';
// import {View, Text, ScrollView, TouchableOpacity,  Alert} from 'react-native';
// import {styles} from '../../styles/superadmin/AuditLogsScreen.styles';
// import {useAppData} from '../../navigation/AppNavigator';
// import SuperAdminHeader from './components/SuperAdminHeader';
// import {SafeAreaView} from 'react-native-safe-area-context';
// const PAGE_SIZE = 10;

// const AuditLogsScreen = ({navigation}: any) => {
//   const {auditLogs} = useAppData();
//   const [page, setPage] = useState(1);

//   const totalPages = Math.max(1, Math.ceil(auditLogs.length / PAGE_SIZE));
//   const start = (page - 1) * PAGE_SIZE;
//   const pageLogs = auditLogs.slice(start, start + PAGE_SIZE);

//   const handleExport = () => {
//     Alert.alert('Export started', 'Audit logs are being prepared for export.');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <SuperAdminHeader navigation={navigation} title="Audit Logs" />
//       <View style={styles.topBar}>
//         <Text style={styles.countText}>{auditLogs.length} records</Text>
//         <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
//           <Text style={styles.exportBtnText}>⬇ Export</Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView contentContainerStyle={styles.container}>
//         {pageLogs.map(log => (
//           <View key={log.id} style={styles.card}>
//             <View style={styles.cardTopRow}>
//               <Text style={styles.user}>{log.user}</Text>
//               <View style={[styles.statusPill, log.status === 'Failed' && styles.statusPillFailed]}>
//                 <Text style={[styles.statusPillText, log.status === 'Failed' && styles.statusPillTextFailed]}>
//                   {log.status}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.roleTag}>
//               <Text style={styles.roleTagText}>{log.role}</Text>
//             </View>
//             <Text style={styles.action}>{log.action}</Text>
//             <Text style={styles.timestamp}>{log.timestamp}</Text>
//           </View>
//         ))}

//         <View style={styles.pagination}>
//           <TouchableOpacity
//             style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
//             disabled={page === 1}
//             onPress={() => setPage(p => Math.max(1, p - 1))}>
//             <Text style={styles.pageBtnText}>‹ Prev</Text>
//           </TouchableOpacity>
//           <Text style={styles.pageIndicator}>
//             Page {page} of {totalPages}
//           </Text>
//           <TouchableOpacity
//             style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
//             disabled={page === totalPages}
//             onPress={() => setPage(p => Math.min(totalPages, p + 1))}>
//             <Text style={styles.pageBtnText}>Next ›</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default AuditLogsScreen;