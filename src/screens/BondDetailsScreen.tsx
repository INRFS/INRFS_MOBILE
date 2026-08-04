// import React, {useMemo} from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
 
//   ScrollView,
//   Image,
//   Share,
//   Alert,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import {styles} from '../styles/BondDetailsScreen.styles';
// import {useInvestments} from './MyInvestmentsscreen';
// import {SafeAreaView} from 'react-native-safe-area-context';
// const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// // ---------------------------------------------------------------------------
// // Amount → words (Indian numbering: Crore / Lakh / Thousand)
// // ---------------------------------------------------------------------------
// const ONES = [
//   '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
//   'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
//   'Seventeen', 'Eighteen', 'Nineteen',
// ];
// const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

// const twoDigitWords = (n: number): string => {
//   if (n < 20) return ONES[n];
//   const t = Math.floor(n / 10);
//   const o = n % 10;
//   return TENS[t] + (o ? ' ' + ONES[o] : '');
// };

// const threeDigitWords = (n: number): string => {
//   const hundred = Math.floor(n / 100);
//   const rest = n % 100;
//   let s = '';
//   if (hundred) s += ONES[hundred] + ' Hundred';
//   if (rest) s += (s ? ' ' : '') + twoDigitWords(rest);
//   return s;
// };

// const amountToWordsINR = (amount: number): string => {
//   let n = Math.round(amount);
//   if (n === 0) return 'Zero Rupees Only';

//   const crore = Math.floor(n / 1e7);
//   n %= 1e7;
//   const lakh = Math.floor(n / 1e5);
//   n %= 1e5;
//   const thousand = Math.floor(n / 1e3);
//   n %= 1e3;
//   const hundredPart = n;

//   const parts: string[] = [];
//   if (crore) parts.push(threeDigitWords(crore) + ' Crore');
//   if (lakh) parts.push(twoDigitWords(lakh) + ' Lakh');
//   if (thousand) parts.push(twoDigitWords(thousand) + ' Thousand');
//   if (hundredPart) parts.push(threeDigitWords(hundredPart));

//   return parts.join(' ') + ' Rupees Only';
// };

// // ---------------------------------------------------------------------------
// // Mock investor profile — TODO: replace with your real logged-in investor
// // data (from auth/context/API) once that's wired up. Keyed here just so the
// // certificate has something sensible to display per investorId.
// //
// // `bank` mirrors the shape used in ProfileScreen.tsx's `investor.bank` object
// // so both screens stay in sync once you wire this up to a real data source.
// // ---------------------------------------------------------------------------
// type InvestorBank = {
//   name: string;
//   accountNumber: string;
//   ifsc: string;
//   accountType: string;
// };

// type InvestorProfile = {
//   name: string;
//   investorId: string;
//   aadhar: string;
//   mobile: string;
//   email: string;
//   bank: InvestorBank;
// };

// const DEFAULT_INVESTOR: InvestorProfile = {
//   name: 'Arjun Sharma',
//   investorId: 'INV001',
//   aadhar: 'XXXX XXXX 4321',
//   mobile: '+91 98765 43210',
//   email: 'arjun@inrfs.in',
//   bank: {
//     name: 'HDFC Bank',
//     accountNumber: '50100XXXXXX4321',
//     ifsc: 'HDFC0001234',
//     accountType: 'Savings',
//   },
// };

// const getInvestorProfile = (_investorId?: string): InvestorProfile => {
//   // TODO: look up the real investor record (including bank details) by
//   // _investorId.
//   return DEFAULT_INVESTOR;
// };

// const BondDetailsScreen = ({navigation, route}: any) => {
//   const {investorId, bondId} = route?.params || {};
//   const investments = useInvestments();
//   const investor = useMemo(() => getInvestorProfile(investorId), [investorId]);

//   const bond = useMemo(
//     () => investments.find(inv => inv.id === bondId),
//     [investments, bondId],
//   );

//   if (!bond) {
//     return (
//       <SafeAreaView style={styles.safeArea}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
//             <Icon name="arrow-left" size={20} color="#1A1A18" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Bond Certificate</Text>
//           <View style={{width: 20}} />
//         </View>
//         <View style={styles.notFoundWrap}>
//           <Icon name="file-search-outline" size={40} color="#9C9689" />
//           <Text style={styles.notFoundText}>Bond not found.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const totalInterest = bond.monthlyInterest * bond.tenureMonths;
//   const maturityAmount = bond.amount + totalInterest;
//   const verifyUrl = `verify.inrfs.in/${bond.id}`;

//   const handleShare = () => {
//     Share.share({
//       message:
//         `INRFS Bond Certificate\n\n` +
//         `Bond ID: ${bond.id}\n` +
//         `Investor: ${investor.name} (${investor.investorId})\n` +
//         `Principal Amount: ${formatINR(bond.amount)}\n` +
//         `Interest Rate: ${bond.rate}% p.a.\n` +
//         `Investment Date: ${bond.investedOn}\n` +
//         `Maturity Date: ${bond.maturesOn}\n` +
//         `Maturity Amount: ${formatINR(maturityAmount)}\n\n` +
//         `Verify at: ${verifyUrl}`,
//     });
//   };

//   const handleDownload = () => {
//     // TODO: wire this up to real PDF generation (e.g. react-native-html-to-pdf)
//     // once you're ready — this is a placeholder so the button has a response.
//     Alert.alert('Coming soon', 'PDF download will be available once this is connected to your backend.');
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
//           <Icon name="arrow-left" size={20} color="#1A1A18" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Bond Certificate</Text>
//         <View style={{width: 20}} />
//       </View>

//       <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//         <View style={styles.certificateCard}>
//           <View style={styles.brandRow}>
//             <Text style={styles.brandName}>INRFS</Text>
//             <Text style={styles.brandSubtitle}>INVESTMENT PORTAL</Text>
//           </View>

//           <View style={styles.bondIdBadge}>
//             <Text style={styles.bondIdBadgeText}>{bond.id}</Text>
//           </View>

//           <View style={styles.divider} />

//           <View style={styles.principalBox}>
//             <Text style={styles.principalLabel}>INVESTED PRINCIPAL AMOUNT</Text>
//             <Text style={styles.principalValue}>{formatINR(bond.amount)}</Text>
//             <Text style={styles.principalWords}>{amountToWordsINR(bond.amount)}</Text>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>INVESTOR NAME</Text>
//               <Text style={styles.metaValue}>{investor.name}</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>INVESTOR ID</Text>
//               <Text style={styles.metaValue}>{investor.investorId}</Text>
//             </View>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>AADHAR NUMBER</Text>
//               <Text style={styles.metaValue}>{investor.aadhar}</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>MOBILE</Text>
//               <Text style={styles.metaValue}>{investor.mobile}</Text>
//             </View>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>INVESTMENT DATE</Text>
//               <Text style={styles.metaValue}>{bond.investedOn}</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>MATURITY DATE</Text>
//               <Text style={styles.metaValue}>{bond.maturesOn}</Text>
//             </View>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>INTEREST RATE</Text>
//               <Text style={styles.metaValueGold}>{bond.rate}% p.a.</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>MONTHLY INTEREST</Text>
//               <Text style={styles.metaValue}>{formatINR(bond.monthlyInterest)}</Text>
//             </View>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>TOTAL INTEREST</Text>
//               <Text style={styles.metaValue}>
//                 {formatINR(totalInterest)} ({bond.tenureMonths} months)
//               </Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>MATURITY AMOUNT</Text>
//               <Text style={styles.metaValueGreen}>{formatINR(maturityAmount)}</Text>
//             </View>
//           </View>

//           <View style={styles.divider} />

//           {/* ---------- Bank Details ---------- */}
//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>BANK NAME</Text>
//               <Text style={styles.metaValue}>{investor.bank.name}</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>ACCOUNT NUMBER</Text>
//               <Text style={styles.metaValue}>{investor.bank.accountNumber}</Text>
//             </View>
//           </View>

//           <View style={styles.metaGrid}>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>IFSC CODE</Text>
//               <Text style={styles.metaValue}>{investor.bank.ifsc}</Text>
//             </View>
//             <View style={styles.metaCol}>
//               <Text style={styles.metaLabel}>ACCOUNT TYPE</Text>
//               <Text style={styles.metaValue}>{investor.bank.accountType}</Text>
//             </View>
//           </View>

//           <View style={styles.divider} />

//           <View style={styles.qrWrap}>
//             <View style={styles.qrBox}>
//               <Icon name="qrcode" size={72} color="#1A1A18" />
//             </View>
//             <Text style={styles.qrCaption}>QR Verification Code</Text>
//             <Text style={styles.qrLink}>{verifyUrl}</Text>
//           </View>

//           <View style={styles.noteBox}>
//             <Text style={styles.noteText}>
//               This bond certifies that the above named investor has deposited the stated
//               principal amount with INRFS Investment Portal. The investment carries a fixed
//               rate of interest as stated above, payable monthly. This bond is non-transferable
//               and subject to INRFS terms and conditions.
//             </Text>
//           </View>

//           <View style={styles.signRow}>
//             <View style={styles.signCol}>
//               <View style={styles.signLine} />
//               <Text style={styles.signLabel}>Investor Signature</Text>
//             </View>
//             <View style={styles.sealWrap}>
//               <View style={styles.sealCircle}>
//                 <Text style={styles.sealText}>INRFS{'\n'}SEAL</Text>
//               </View>
//             </View>
//             <View style={styles.signCol}>
//               <View style={styles.signLine} />
//               <Text style={styles.signLabel}>Authorised Signatory</Text>
//             </View>
//           </View>

//           <Text style={styles.footerText}>
//             INRFS Investment Portal | CIN: U65900MH2020PTC123456 | SEBI Reg: INZ345678901
//           </Text>
//           <Text style={styles.footerText}>Verify at: {verifyUrl}</Text>
//         </View>

//         <View style={styles.actionRow}>
//           <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
//             <Text style={styles.closeBtnText}>Close</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
//             <Icon name="share-variant" size={16} color="#fff" />
//             <Text style={styles.shareBtnText}>Share</Text>
//           </TouchableOpacity>
//         </View>

//         <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
//           <Icon name="download-outline" size={18} color="#8A6D2F" />
//           <Text style={styles.downloadBtnText}>Download PDF</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default BondDetailsScreen;
import React, {useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
 
  ScrollView,
  Image,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../styles/BondDetailsScreen.styles';
import {useInvestments} from './MyInvestmentsscreen';
import {useAppData} from '../navigation/AppNavigator';
import {SafeAreaView} from 'react-native-safe-area-context';
const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// ---------------------------------------------------------------------------
// Amount → words (Indian numbering: Crore / Lakh / Thousand)
// ---------------------------------------------------------------------------
const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const twoDigitWords = (n: number): string => {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? ' ' + ONES[o] : '');
};

const threeDigitWords = (n: number): string => {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  let s = '';
  if (hundred) s += ONES[hundred] + ' Hundred';
  if (rest) s += (s ? ' ' : '') + twoDigitWords(rest);
  return s;
};

const amountToWordsINR = (amount: number): string => {
  let n = Math.round(amount);
  if (n === 0) return 'Zero Rupees Only';

  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1e3);
  n %= 1e3;
  const hundredPart = n;

  const parts: string[] = [];
  if (crore) parts.push(threeDigitWords(crore) + ' Crore');
  if (lakh) parts.push(twoDigitWords(lakh) + ' Lakh');
  if (thousand) parts.push(twoDigitWords(thousand) + ' Thousand');
  if (hundredPart) parts.push(threeDigitWords(hundredPart));

  return parts.join(' ') + ' Rupees Only';
};

// ---------------------------------------------------------------------------
// Mock investor profile — TODO: replace with your real logged-in investor
// data (from auth/context/API) once that's wired up. Keyed here just so the
// certificate has something sensible to display per investorId.
//
// `bank` mirrors the shape used in ProfileScreen.tsx's `investor.bank` object
// so both screens stay in sync once you wire this up to a real data source.
// ---------------------------------------------------------------------------
type InvestorBank = {
  name: string;
  accountNumber: string;
  ifsc: string;
  accountType: string;
};

type InvestorProfile = {
  name: string;
  investorId: string;
  aadhar: string;
  mobile: string;
  email: string;
  bank: InvestorBank;
};

const DEFAULT_INVESTOR: InvestorProfile = {
  name: 'Arjun Sharma',
  investorId: 'INV001',
  aadhar: 'XXXX XXXX 4321',
  mobile: '+91 98765 43210',
  email: 'arjun@inrfs.in',
  bank: {
    name: 'HDFC Bank',
    accountNumber: '50100XXXXXX4321',
    ifsc: 'HDFC0001234',
    accountType: 'Savings',
  },
};

const getInvestorProfile = (_investorId?: string): InvestorProfile => {
  // TODO: look up the real investor record (including bank details) by
  // _investorId.
  return DEFAULT_INVESTOR;
};

// ---------------------------------------------------------------------------
// Admin-originated bonds (from AppNavigator's useAppData()) use a different
// shape (seriesId, investorName, interestRate, investedDate, maturityDate —
// no tenure/monthly-interest fields) than the investor's own Investment list
// in MyInvestmentsscreen.tsx (id, name, rate, tenureMonths, monthlyInterest).
// This adapter normalizes an admin Bond into the same shape the certificate
// below already knows how to render, so "View Profile" from Investor
// Management resolves correctly instead of hitting "Bond not found".
// ---------------------------------------------------------------------------
const parseDisplayDate = (s: string): Date => {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const monthsBetween = (start: Date, end: Date): number => {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(months, 1);
};

const BondDetailsScreen = ({navigation, route}: any) => {
  const {investorId, bondId} = route?.params || {};
  const investments = useInvestments();
  const {bonds: adminBonds, investors: adminInvestors} = useAppData();

  const investorSideBond = useMemo(
    () => investments.find(inv => inv.id === bondId),
    [investments, bondId],
  );

  // Fallback: bond wasn't in the investor's own list — check admin's bonds
  // (e.g. when opened via Investor Management → View Profile).
  const adminSideBond = useMemo(() => {
    if (investorSideBond) return undefined;
    return adminBonds.find(b => b.seriesId === bondId);
  }, [investorSideBond, adminBonds, bondId]);

  const bond = useMemo(() => {
    if (investorSideBond) return investorSideBond;
    if (!adminSideBond) return undefined;

    const investedDate = parseDisplayDate(adminSideBond.investedDate);
    const maturityDate = parseDisplayDate(adminSideBond.maturityDate);
    const tenureMonths = monthsBetween(investedDate, maturityDate);
    const years = tenureMonths / 12;
    const totalInterest = adminSideBond.amount * (adminSideBond.interestRate / 100) * years;

    return {
      id: adminSideBond.seriesId,
      name: `INRFS Bond — ${adminSideBond.seriesId}`,
      status: adminSideBond.status === 'Settled' ? 'Matured' : 'Active',
      amount: adminSideBond.amount,
      rate: adminSideBond.interestRate,
      tenureMonths,
      investedOn: adminSideBond.investedDate,
      maturesOn: adminSideBond.maturityDate,
      monthlyInterest: totalInterest / tenureMonths,
      earned: 0,
    };
  }, [investorSideBond, adminSideBond]);

  const investor = useMemo(() => {
    if (adminSideBond) {
      // Admin's Investor type has no Aadhaar/bank fields yet — fall back to
      // the default profile's aadhar/bank until that data exists.
      const adminInvestor = adminInvestors.find(i => i.name === adminSideBond.investorName);
      if (adminInvestor) {
        return {
          ...DEFAULT_INVESTOR,
          name: adminInvestor.name,
          investorId: adminInvestor.id,
          mobile: adminInvestor.mobile,
          email: adminInvestor.email,
        };
      }
    }
    return getInvestorProfile(investorId);
  }, [investorId, adminSideBond, adminInvestors]);

  if (!bond) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
            <Icon name="arrow-left" size={20} color="#1A1A18" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bond Certificate</Text>
          <View style={{width: 20}} />
        </View>
        <View style={styles.notFoundWrap}>
          <Icon name="file-search-outline" size={40} color="#9C9689" />
          <Text style={styles.notFoundText}>Bond not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalInterest = bond.monthlyInterest * bond.tenureMonths;
  const maturityAmount = bond.amount + totalInterest;
  const verifyUrl = `verify.inrfs.in/${bond.id}`;

  const handleShare = () => {
    Share.share({
      message:
        `INRFS Bond Certificate\n\n` +
        `Bond ID: ${bond.id}\n` +
        `Investor: ${investor.name} (${investor.investorId})\n` +
        `Principal Amount: ${formatINR(bond.amount)}\n` +
        `Interest Rate: ${bond.rate}% p.a.\n` +
        `Investment Date: ${bond.investedOn}\n` +
        `Maturity Date: ${bond.maturesOn}\n` +
        `Maturity Amount: ${formatINR(maturityAmount)}\n\n` +
        `Verify at: ${verifyUrl}`,
    });
  };

  const handleDownload = () => {
    // TODO: wire this up to real PDF generation (e.g. react-native-html-to-pdf)
    // once you're ready — this is a placeholder so the button has a response.
    Alert.alert('Coming soon', 'PDF download will be available once this is connected to your backend.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconBtn}>
          <Icon name="arrow-left" size={20} color="#1A1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bond Certificate</Text>
        <View style={{width: 20}} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.certificateCard}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>INRFS</Text>
            <Text style={styles.brandSubtitle}>INVESTMENT PORTAL</Text>
          </View>

          <View style={styles.bondIdBadge}>
            <Text style={styles.bondIdBadgeText}>{bond.id}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.principalBox}>
            <Text style={styles.principalLabel}>INVESTED PRINCIPAL AMOUNT</Text>
            <Text style={styles.principalValue}>{formatINR(bond.amount)}</Text>
            <Text style={styles.principalWords}>{amountToWordsINR(bond.amount)}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INVESTOR NAME</Text>
              <Text style={styles.metaValue}>{investor.name}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INVESTOR ID</Text>
              <Text style={styles.metaValue}>{investor.investorId}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>AADHAR NUMBER</Text>
              <Text style={styles.metaValue}>{investor.aadhar}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MOBILE</Text>
              <Text style={styles.metaValue}>{investor.mobile}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INVESTMENT DATE</Text>
              <Text style={styles.metaValue}>{bond.investedOn}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MATURITY DATE</Text>
              <Text style={styles.metaValue}>{bond.maturesOn}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INTEREST RATE</Text>
              <Text style={styles.metaValueGold}>{bond.rate}% p.a.</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MONTHLY INTEREST</Text>
              <Text style={styles.metaValue}>{formatINR(bond.monthlyInterest)}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>TOTAL INTEREST</Text>
              <Text style={styles.metaValue}>
                {formatINR(totalInterest)} ({bond.tenureMonths} months)
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MATURITY AMOUNT</Text>
              <Text style={styles.metaValueGreen}>{formatINR(maturityAmount)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ---------- Bank Details ---------- */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>BANK NAME</Text>
              <Text style={styles.metaValue}>{investor.bank.name}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.metaValue}>{investor.bank.accountNumber}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>IFSC CODE</Text>
              <Text style={styles.metaValue}>{investor.bank.ifsc}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ACCOUNT TYPE</Text>
              <Text style={styles.metaValue}>{investor.bank.accountType}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <Icon name="qrcode" size={72} color="#1A1A18" />
            </View>
            <Text style={styles.qrCaption}>QR Verification Code</Text>
            <Text style={styles.qrLink}>{verifyUrl}</Text>
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              This bond certifies that the above named investor has deposited the stated
              principal amount with INRFS Investment Portal. The investment carries a fixed
              rate of interest as stated above, payable monthly. This bond is non-transferable
              and subject to INRFS terms and conditions.
            </Text>
          </View>

          <View style={styles.signRow}>
            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>Investor Signature</Text>
            </View>
            <View style={styles.sealWrap}>
              <View style={styles.sealCircle}>
                <Text style={styles.sealText}>INRFS{'\n'}SEAL</Text>
              </View>
            </View>
            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={styles.signLabel}>Authorised Signatory</Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            INRFS Investment Portal | CIN: U65900MH2020PTC123456 | SEBI Reg: INZ345678901
          </Text>
          <Text style={styles.footerText}>Verify at: {verifyUrl}</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Icon name="share-variant" size={16} color="#fff" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Icon name="download-outline" size={18} color="#8A6D2F" />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BondDetailsScreen;