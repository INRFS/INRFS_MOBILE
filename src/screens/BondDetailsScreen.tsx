import React, {useEffect, useMemo, useState} from 'react';
import {Alert, ScrollView, Share, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {styles} from '../styles/BondDetailsScreen.styles';


import {
  investorService,
  BondData,
  ApiInvestment,
} from '../services/investorService';

const money = (value: number) =>
  '₹' + Math.round(value).toLocaleString('en-IN');

const num = (v: any, fallback = 0) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
};

const BondDetailsScreen = ({navigation, route}: any) => {
  const {bondId, bondDisplayId} = route?.params || {};

  const [bond, setBond] = useState<BondData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        let numericId = Number(bondId);

        if (!Number.isInteger(numericId) || numericId <= 0) {
          const investments = await investorService.getMyInvestments();
          const match = investments.find(
            x => String(x.investment_id) === String(bondId),
          );
          numericId = match ? Number(match.id) : 0;
        }

        if (!numericId) {
          throw new Error('Investment not found.');
        }

        const response = await investorService.getInvestmentBond(numericId);

        if (mounted) setBond(response);
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Unable to load bond certificate.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [bondId]);

  const principal = num(bond?.investment_amount ?? bond?.amount);
  const rate = num(bond?.interest_rate ?? bond?.rate);
  const expectedInterest = num(bond?.expected_interest_amount);
  const maturityAmount = num(
    bond?.maturity_amount,
    principal + expectedInterest,
  );

  const backendTenure = num(bond?.tenure_months);
  const calculatedTenure =
    expectedInterest > 0 && principal > 0 && rate > 0
      ? Math.round(
          (expectedInterest * 12) / (principal * (rate / 100)),
        )
      : 1;
  const months = Math.max(
    1,
    Math.round(backendTenure || calculatedTenure),
  );

  const monthlyInterest = expectedInterest / months;

  const displayBondId =
    bond?.bond_number ||
    bond?.bond_id ||
    bondDisplayId ||
    bond?.investment_code ||
    String(bond?.investment_id || '—');

  const investor = useMemo(() => {
    const nested: any = (bond as any)?.investor || {};
    const nestedBank = nested?.bank || (bond as any)?.bank || {};

    return {
      name:
        nested?.name ||
        nested?.investor_name ||
        bond?.investor_name ||
        '—',
      id: String(
        nested?.investor_id ||
          nested?.investorId ||
          nested?.id ||
          bond?.investor_id ||
          bond?.investor_registration_id ||
          '—',
      ),
      mobile:
        nested?.mobile ||
        nested?.phone ||
        bond?.mobile ||
        '—',
      email: nested?.email || bond?.email || '—',
      aadhar:
        nested?.aadhar ||
        nested?.aadhaar ||
        bond?.aadhar ||
        bond?.aadhaar ||
        '—',
      bankName:
        nested?.bank_name ||
        nestedBank?.name ||
        bond?.bank_name ||
        '—',
      account:
        nested?.account_number ||
        nestedBank?.accountNumber ||
        nestedBank?.account_number ||
        bond?.account_number ||
        '—',
      ifsc:
        nestedBank?.ifsc ||
        bond?.ifsc_code ||
        '—',
      accountType:
        nested?.account_type ||
        nestedBank?.accountType ||
        nestedBank?.account_type ||
        bond?.account_type ||
        '—',
    };
  }, [bond]);

  const verification = `verify.inrfs.in/${displayBondId}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Icon name="loading" size={40} color="#9C9689" />
          <Text style={styles.notFoundText}>Loading bond...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bond) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundWrap}>
          <Icon name="file-search-outline" size={40} color="#9C9689" />
          <Text style={styles.notFoundText}>
            {error || 'Bond certificate not available yet.'}
          </Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const share = () => {
    Share.share({
      message:
        `INRFS Bond Certificate\n\n` +
        `Bond ID: ${displayBondId}\n` +
        `Investor: ${investor.name}\n` +
        `Principal: ${money(principal)}\n` +
        `Interest Rate: ${rate}% p.a.\n` +
        `Investment Date: ${bond.investment_date || '—'}\n` +
        `Maturity Date: ${bond.maturity_date || '—'}\n` +
        `Maturity Amount: ${money(maturityAmount)}\n` +
        `Verify: ${verification}`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backIconBtn}>
          <Icon name="arrow-left" size={20} color="#1A1A18" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bond Certificate</Text>
        <View style={{width: 20}} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.certificateCard}>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>INRFS</Text>
            <Text style={styles.brandSubtitle}>INVESTMENT PORTAL</Text>
          </View>

          <View style={styles.bondIdBadge}>
            <Text style={styles.bondIdBadgeText}>{displayBondId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.principalBox}>
            <Text style={styles.principalLabel}>
              INVESTED PRINCIPAL AMOUNT
            </Text>
            <Text style={styles.principalValue}>{money(principal)}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INVESTOR NAME</Text>
              <Text style={styles.metaValue}>{investor.name}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INVESTOR ID</Text>
              <Text style={styles.metaValue}>{investor.id}</Text>
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
              <Text style={styles.metaValue}>
                {bond.investment_date || '—'}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MATURITY DATE</Text>
              <Text style={styles.metaValue}>
                {bond.maturity_date || '—'}
              </Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>INTEREST RATE</Text>
              <Text style={styles.metaValueGold}>{rate}% p.a.</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MONTHLY INTEREST</Text>
              <Text style={styles.metaValue}>{money(monthlyInterest)}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>TOTAL INTEREST</Text>
              <Text style={styles.metaValue}>
                {money(expectedInterest)} ({months} months)
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>MATURITY AMOUNT</Text>
              <Text style={styles.metaValueGreen}>
                {money(maturityAmount)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>BANK NAME</Text>
              <Text style={styles.metaValue}>{investor.bankName}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ACCOUNT NUMBER</Text>
              <Text style={styles.metaValue}>{investor.account}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>IFSC CODE</Text>
              <Text style={styles.metaValue}>{investor.ifsc}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>ACCOUNT TYPE</Text>
              <Text style={styles.metaValue}>{investor.accountType}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.qrWrap}>
            <View style={styles.qrBox}>
              <Icon name="qrcode" size={72} color="#1A1A18" />
            </View>
            <Text style={styles.qrCaption}>QR Verification Code</Text>
            <Text style={styles.qrLink}>{verification}</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtn} onPress={share}>
            <Icon name="share-variant" size={16} color="#fff" />
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() =>
            Alert.alert(
              'PDF download',
              'No PDF endpoint is present in the supplied API contract. The live bond data is connected and the certificate can be shared.',
            )
          }>
          <Icon name="download-outline" size={18} color="#8A6D2F" />
          <Text style={styles.downloadBtnText}>Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BondDetailsScreen;