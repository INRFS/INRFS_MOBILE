import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
 
  ScrollView,
  Image,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/MyInvestmentsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
// ---------------------------------------------------------------------------
// Shared investments data — lives here so both MyInvestmentsScreen and
// InvestNowScreen can use it, without a separate store file/screen.
// InvestNowScreen imports { addInvestment } from this file and calls it
// on submit; this screen re-renders automatically via the useInvestments hook.
// ---------------------------------------------------------------------------

export type BondStatus = 'Active' | 'Matured';

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

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'});

// TODO: replace with your real investor investments API call.
let investments: Investment[] = [
  {
    id: 'BND-2025-001',
    name: 'Green Power Infra Bond',
    status: 'Active',
    amount: 500000,
    rate: 12,
    tenureMonths: 12,
    investedOn: '15 Jan 2025',
    maturesOn: '15 Jan 2026',
    monthlyInterest: 5000,
    earned: 30000,
  },
  {
    id: 'BND-2024-087',
    name: 'Tata Capital Series IV',
    status: 'Matured',
    amount: 300000,
    rate: 11,
    tenureMonths: 12,
    investedOn: '10 Jun 2024',
    maturesOn: '10 Jun 2025',
    monthlyInterest: 2750,
    earned: 33000,
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach(l => l());

export type NewInvestmentInput = {
  amount: number;
  rate: number;
  tenureMonths: number;
};

// Call this from InvestNowScreen (or anywhere) when an investment is submitted.
export function addInvestment(input: NewInvestmentInput): Investment {
  const investedOnDate = new Date();
  const maturesOnDate = new Date(investedOnDate);
  maturesOnDate.setMonth(maturesOnDate.getMonth() + input.tenureMonths);

  const years = input.tenureMonths / 12;
  const totalInterest = input.amount * (input.rate / 100) * years;
  const monthlyInterest = totalInterest / input.tenureMonths;

  const year = investedOnDate.getFullYear();
  const seq = String(investments.length + 1).padStart(3, '0');

  const newInvestment: Investment = {
    id: `BND-${year}-${seq}`,
    name: `INRFS Bond — ${input.tenureMonths}M`,
    // Newly submitted investments reuse the 'Active' badge styling so no new
    // style keys are needed. Add a 'Pending' variant later if you want a
    // distinct look for investments awaiting admin verification.
    status: 'Active',
    amount: input.amount,
    rate: input.rate,
    tenureMonths: input.tenureMonths,
    investedOn: formatDate(investedOnDate),
    maturesOn: formatDate(maturesOnDate),
    monthlyInterest,
    earned: 0,
  };

  investments = [newInvestment, ...investments];
  notify();
  return newInvestment;
}

// Hook: re-renders any screen using it whenever the list changes.
export function useInvestments(): Investment[] {
  const [data, setData] = useState<Investment[]>(investments);

  useEffect(() => {
    const listener = () => setData(investments);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return data;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const formatINR = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

const MyInvestmentsScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};
  const [query, setQuery] = useState('');

  const items = useInvestments();

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

  const handleExport = () => {
    Share.share({
      message: `My INRFS Investments\n\n${items.map(
        inv =>
          `${inv.id} — ${inv.name}\nAmount: ${formatINR(inv.amount)} at ${inv.rate}% p.a.\nStatus: ${inv.status}`,
      ).join('\n\n')}`,
    });
  };

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

            <TouchableOpacity
              style={styles.viewBondBtn}
              onPress={() => navigation.navigate('BondDetails', {investorId, bondId: inv.id})}>
              <Icon name="eye-outline" size={16} color="#1A1A18" />
              <Text style={styles.viewBondBtnText}>View Bond</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.newInvestmentBtn}
          onPress={() => navigation.navigate('InvestNow', {investorId})}>
          <Icon name="plus-circle-outline" size={18} color="#8A6D2F" />
          <Text style={styles.newInvestmentBtnText}>New Investment</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomTabBar active="Portfolio" navigation={navigation} />
    </SafeAreaView>
  );
};

export default MyInvestmentsScreen;