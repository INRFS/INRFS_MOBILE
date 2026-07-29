import React from 'react';
import {View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BottomTabBar from '../components/BottomTabBar';
import {styles} from '../styles/InvestorDashboardScreen.styles';

const chartBars = [34, 46, 58, 66, 52, 74, 60];

const bonds = [
  {
    id: 'BND-2025-001',
    type: 'Fixed Deposit — 12% p.a.',
    icon: 'chart-bar',
    status: 'Active',
    maturity: '15 Aug 2026',
    currentReturn: '₹1,12,000',
  },
  {
    id: 'BND-2024-042',
    type: 'Corporate Debt — 11.5% p.a.',
    icon: 'file-document-outline',
    status: 'Active',
    maturity: '02 Feb 2025',
    currentReturn: '₹48,250',
  },
];

const transactions = [
  {
    title: 'Monthly Interest',
    date: 'Today, 10:45 AM',
    amount: '+₹8,000.00',
    status: 'Settled',
    credit: true,
  },
  {
    title: 'New Investment',
    date: 'Yesterday',
    amount: '-₹2,00,000.00',
    status: 'BND-2025-001',
    credit: false,
  },
  {
    title: 'Interest Credit',
    date: '24 Oct 2023',
    amount: '+₹8,000.00',
    status: 'Settled',
    credit: true,
  },
];

const InvestorDashboardScreen = ({navigation, route}: any) => {
  const {investorId} = route?.params || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <View style={styles.brandIconWrap}>
            <Icon name="bank" size={16} color="#fff" />
          </View>
          <Text style={styles.headerTitle}>INRFS</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.bellWrap}>
            <Icon name="bell-outline" size={20} color="#111827" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <Image
            source={{uri: 'https://i.pravatar.cc/64'}}
            style={styles.avatar}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.portfolioCard}>
          <View style={styles.portfolioTopRow}>
            <Text style={styles.portfolioLabel}>TOTAL PORTFOLIO VALUE</Text>
            <View style={styles.trendBadge}>
              <Icon name="trending-up" size={12} color="#16A34A" />
              <Text style={styles.trendText}>+12.5%</Text>
            </View>
          </View>
          <Text style={styles.portfolioValue}>₹12,84,500.00</Text>

          <View style={styles.chartRow}>
            {chartBars.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.chartBar,
                  {height: h},
                  i === chartBars.length - 2 && styles.chartBarHighlight,
                ]}
              />
            ))}
          </View>

          <View style={styles.portfolioBtnRow}>
            <TouchableOpacity
              style={styles.investBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('InvestNow', {investorId})}>
              <Icon name="plus-circle-outline" size={16} color="#fff" />
              <Text style={styles.investBtnText}>Invest</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.withdrawBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('MyInvestments', {investorId})}>
              <Icon name="briefcase-outline" size={16} color="#fff" />
              <Text style={styles.withdrawBtnText}>MyInvestments</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Icon name="wallet-outline" size={18} color="#1955F0" />
            <Text style={styles.statLabel}>Interest Earned</Text>
            <Text style={styles.statValue}>₹72,000</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="calendar-month-outline" size={18} color="#1955F0" />
            <Text style={styles.statLabel}>Next Payout</Text>
            <Text style={styles.statValue}>₹8,000</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Bonds</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyInvestments', {investorId})}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {bonds.map(bond => (
          <View key={bond.id} style={styles.bondCard}>
            <View style={styles.bondTopRow}>
              <View style={styles.bondIconBox}>
                <Icon name={bond.icon} size={18} color="#0E2A5E" />
              </View>
              <View style={styles.bondTitleWrap}>
                <Text style={styles.bondId}>{bond.id}</Text>
                <Text style={styles.bondType}>{bond.type}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{bond.status}</Text>
              </View>
            </View>
            <View style={styles.bondDivider} />
            <View style={styles.bondBottomRow}>
              <View>
                <Text style={styles.bondMetaLabel}>Maturity Date</Text>
                <Text style={styles.bondMetaValue}>{bond.maturity}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.bondMetaLabel}>Current Return</Text>
                <Text style={styles.bondReturnValue}>{bond.currentReturn}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>See History</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txCard}>
          {transactions.map((tx, i) => (
            <View
              key={i}
              style={[styles.txRow, i !== transactions.length - 1 && styles.txRowBorder]}>
              <View style={[styles.txIconWrap, tx.credit ? styles.txIconCredit : styles.txIconDebit]}>
                <Icon
                  name={tx.credit ? 'arrow-bottom-left' : 'arrow-top-right'}
                  size={16}
                  color={tx.credit ? '#16A34A' : '#374151'}
                />
              </View>
              <View style={styles.txTitleWrap}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={[styles.txAmount, tx.credit ? styles.txAmountCredit : null]}>
                  {tx.amount}
                </Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomTabBar active="Portfolio" navigation={navigation} />
    </SafeAreaView>
  );
};

export default InvestorDashboardScreen;