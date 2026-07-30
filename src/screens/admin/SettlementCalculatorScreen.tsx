import React, {useState} from 'react';
import {View, Text, ScrollView,  TouchableOpacity, Alert, TextInput} from 'react-native';
import {useAppData, Investor, Bond} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/SettlementCalculatorScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const formatUSD = (n: number) => '$' + n.toLocaleString('en-US', {minimumFractionDigits: 2});

const journeyStages = ['Q1', 'Q2', 'Q3', 'Payout'];

const SettlementCalculatorScreen = ({navigation}: any) => {
  const {investors, bonds} = useAppData();

  const [investorPickerOpen, setInvestorPickerOpen] = useState(false);
  const [bondPickerOpen, setBondPickerOpen] = useState(false);

  const [selectedInvestor, setSelectedInvestor] = useState<Investor | undefined>(investors[0]);
  const [selectedBond, setSelectedBond] = useState<Bond | undefined>(
    bonds.find(b => b.status === 'Settled') ?? bonds[0],
  );
  const todayStr = new Date().toLocaleDateString('en-GB').split('/').join('-'); // DD-MM-YYYY
  const [settlementDate, setSettlementDate] = useState(todayStr);

  const principal = selectedInvestor?.totalInvested ?? 0;
  const interestRate = selectedBond?.interestRate ?? 0;
  const monthsActive = selectedBond?.monthsActive ?? 0;
  const totalInterest = principal * (interestRate / 100) * (monthsActive / 12);
  const penalty = principal * 0.02;
  const netSettlement = principal + totalInterest - penalty;

  const handleApprove = () => {
    if (!selectedInvestor || !selectedBond) return;
    Alert.alert(
      'Settlement approved',
      `${formatUSD(netSettlement)} settlement approved for ${selectedInvestor.name}.`,
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏦  INRFS</Text>
        <View style={{width: 20}} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>🧮  Settlement Calculator</Text>
        <Text style={styles.subtitle}>Finalize payouts for matured bond instruments</Text>

        <Text style={styles.fieldLabel}>Select Investor</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setInvestorPickerOpen(v => !v)}>
          <Text style={styles.selectBoxText}>
            {selectedInvestor ? `${selectedInvestor.name} (${selectedInvestor.id})` : 'Select investor'}
          </Text>
          <Text style={styles.chevron}>{investorPickerOpen ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>
        {investorPickerOpen && (
          <View style={styles.dropdown}>
            {investors.map(inv => (
              <TouchableOpacity
                key={inv.id}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedInvestor(inv);
                  setInvestorPickerOpen(false);
                }}>
                <Text style={styles.dropdownItemText}>{inv.name} ({inv.id})</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.fieldLabel}>Matured Bond</Text>
        <TouchableOpacity style={styles.selectBox} onPress={() => setBondPickerOpen(v => !v)}>
          <Text style={styles.selectBoxText}>
            {selectedBond
              ? `${selectedBond.interestRate}% ${selectedBond.seriesId} (Matures ${selectedBond.maturityDate})`
              : 'Select bond'}
          </Text>
          <Text style={styles.chevron}>{bondPickerOpen ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>
        {bondPickerOpen && (
          <View style={styles.dropdown}>
            {bonds.map(b => (
              <TouchableOpacity
                key={b.seriesId}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedBond(b);
                  setBondPickerOpen(false);
                }}>
                <Text style={styles.dropdownItemText}>
                  {b.interestRate}% {b.seriesId} ({b.status})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.fieldLabel}>Settlement Date</Text>
        <TextInput
          style={styles.selectBox}
          value={settlementDate}
          onChangeText={setSettlementDate}
          placeholder="DD-MM-YYYY"
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownTopRow}>
            <Text style={styles.breakdownTitle}>Payout Breakdown</Text>
            <View style={styles.calculatedBadge}>
              <Text style={styles.calculatedBadgeText}>CALCULATED</Text>
            </View>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Principal Amount</Text>
            <Text style={styles.breakdownValue}>{formatUSD(principal)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Months Active</Text>
            <Text style={styles.breakdownValue}>{monthsActive}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Interest Earned ({monthsActive}m)</Text>
            <Text style={styles.breakdownValuePositive}>+{formatUSD(totalInterest)}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Penalty (2%)</Text>
            <Text style={styles.breakdownValueNegative}>-{formatUSD(penalty)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.netLabel}>NET SETTLEMENT</Text>
          </View>
          <Text style={styles.netValue}>{formatUSD(netSettlement)}</Text>
        </View>

        <Text style={styles.journeyLabel}>PAYOUT JOURNEY</Text>
        <View style={styles.journeyRow}>
          {journeyStages.map((stage, i) => (
            <View key={stage} style={styles.journeyItem}>
              <View style={[styles.journeyPill, {opacity: 0.4 + i * 0.2}]} />
              <Text style={[styles.journeyLabelText, i === journeyStages.length - 1 && styles.journeyLabelTextActive]}>
                {stage}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.maturityNote}>✓ Maturity criteria met on {selectedBond?.maturityDate ?? '—'}</Text>

        <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
          <Text style={styles.approveBtnText}>✓  Approve Settlement</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettlementCalculatorScreen;