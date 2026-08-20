import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/SystemSettingsScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import AppHeader from '../../components/AppHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
type Tab = 'System' | 'Email' | 'SMS' | 'Backup';

const tabs: {key: Tab; label: string; icon: string}[] = [
  {key: 'System', label: 'System', icon: '⚙️'},
  {key: 'Email', label: 'Email', icon: '✉️'},
  {key: 'SMS', label: 'SMS', icon: '📱'},
  {key: 'Backup', label: 'Backup', icon: '🗄️'},
];

const SystemSettingsScreen = ({navigation}: any) => {
  const {systemSettings, updateSystemSettings} = useAppData();
  const [activeTab, setActiveTab] = useState<Tab>('System');

  // ---- System tab (unchanged, no screenshot provided) ----
  const [appName, setAppName] = useState(systemSettings.appName);
  const [supportEmail, setSupportEmail] = useState(systemSettings.supportEmail);
  const [minInvestment, setMinInvestment] = useState(systemSettings.minInvestment);
  const [interestDay, setInterestDay] = useState(systemSettings.interestPaymentDay);

  // ---- Email tab (matches web: SMTP Host, SMTP Port, From Email) ----
  const [smtpHost, setSmtpHost] = useState(systemSettings.smtpHost ?? 'smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [fromEmail, setFromEmail] = useState('noreply@inrfs.in');

  // ---- SMS tab (matches web: SMS Provider, Sender ID, OTP Expiry) ----
  const [smsProvider, setSmsProvider] = useState(systemSettings.smsProvider ?? 'Twilio');
  const [smsSenderId, setSmsSenderId] = useState(systemSettings.smsSenderId ?? 'INRFS');
  const [otpExpiry, setOtpExpiry] = useState('10 minutes');

  // ---- Backup tab (matches web: status banner, Frequency, Retention, Location) ----
  const [backupFrequency, setBackupFrequency] = useState('Daily at 2:00 AM');
  const [retentionPeriod, setRetentionPeriod] = useState('30 days');
  const [backupLocation, setBackupLocation] = useState('AWS S3');

  const handleSaveSystem = () => {
    updateSystemSettings({appName, supportEmail, minInvestment, interestPaymentDay: interestDay});
    Alert.alert('Saved', 'System settings updated.');
  };

  const handleSaveEmail = () => {
    updateSystemSettings({smtpHost});
    Alert.alert('Saved', 'Email settings updated.');
  };

  const handleSaveSms = () => {
    updateSystemSettings({smsSenderId, smsProvider});
    Alert.alert('Saved', 'SMS settings updated.');
  };

  const handleSaveBackup = () => {
    Alert.alert('Saved', 'Backup settings updated.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader subtitle="System Settings" />

      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {activeTab === 'System' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>System Settings</Text>

            <Text style={styles.label}>Application Name</Text>
            <TextInput style={styles.input} value={appName} onChangeText={setAppName} />

            <Text style={styles.label}>Support Email</Text>
            <TextInput
              style={styles.input}
              value={supportEmail}
              onChangeText={setSupportEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Min Investment</Text>
            <TextInput style={styles.input} value={minInvestment} onChangeText={setMinInvestment} />

            <Text style={styles.label}>Interest Payment Day</Text>
            <TextInput
              style={styles.input}
              value={interestDay}
              onChangeText={setInterestDay}
              keyboardType="number-pad"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSystem}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'Email' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Email Settings</Text>

            <Text style={styles.label}>SMTP Host</Text>
            <TextInput style={styles.input} value={smtpHost} onChangeText={setSmtpHost} autoCapitalize="none" />

            <Text style={styles.label}>SMTP Port</Text>
            <TextInput style={styles.input} value={smtpPort} onChangeText={setSmtpPort} keyboardType="number-pad" />

            <Text style={styles.label}>From Email</Text>
            <TextInput
              style={styles.input}
              value={fromEmail}
              onChangeText={setFromEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEmail}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'SMS' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>SMS Settings</Text>

            <Text style={styles.label}>SMS Provider</Text>
            <TextInput style={styles.input} value={smsProvider} onChangeText={setSmsProvider} />

            <Text style={styles.label}>Sender ID</Text>
            <TextInput style={styles.input} value={smsSenderId} onChangeText={setSmsSenderId} autoCapitalize="characters" />

            <Text style={styles.label}>OTP Expiry</Text>
            <TextInput style={styles.input} value={otpExpiry} onChangeText={setOtpExpiry} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSms}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'Backup' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Backup Settings</Text>

            <View style={styles.statusBanner}>
              <Text style={styles.statusBannerText}>
                Last Backup: {systemSettings.lastBackupTime} — <Text style={styles.statusSuccess}>Success</Text>
              </Text>
            </View>

            <Text style={styles.label}>Backup Frequency</Text>
            <TextInput style={styles.input} value={backupFrequency} onChangeText={setBackupFrequency} />

            <Text style={styles.label}>Retention Period</Text>
            <TextInput style={styles.input} value={retentionPeriod} onChangeText={setRetentionPeriod} />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={backupLocation} onChangeText={setBackupLocation} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBackup}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SystemSettingsScreen;