import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert} from 'react-native';
import {styles} from '../../styles/superadmin/SystemSettingsScreen.styles';
import {useAppData} from '../../navigation/AppNavigator';
import SuperAdminHeader from './components/SuperAdminHeader';
import {SafeAreaView} from 'react-native-safe-area-context';
type Tab = 'System' | 'Email' | 'SMS' | 'Backup';

const tabs: {key: Tab; label: string; icon: string}[] = [
  {key: 'System', label: 'System', icon: '⚙️'},
  {key: 'Email', label: 'Email', icon: '✉️'},
  {key: 'SMS', label: 'SMS', icon: '📱'},
  {key: 'Backup', label: 'Backup', icon: '🗄️'},
];

const SystemSettingsScreen = ({navigation}: any) => {
  const {systemSettings, updateSystemSettings, runBackupNow} = useAppData();
  const [activeTab, setActiveTab] = useState<Tab>('System');

  const [appName, setAppName] = useState(systemSettings.appName);
  const [supportEmail, setSupportEmail] = useState(systemSettings.supportEmail);
  const [minInvestment, setMinInvestment] = useState(systemSettings.minInvestment);
  const [interestDay, setInterestDay] = useState(systemSettings.interestPaymentDay);

  const [smtpHost, setSmtpHost] = useState(systemSettings.smtpHost);
  const [smtpFromName, setSmtpFromName] = useState(systemSettings.smtpFromName);

  const [smsSenderId, setSmsSenderId] = useState(systemSettings.smsSenderId);
  const [smsProvider, setSmsProvider] = useState(systemSettings.smsProvider);

  const [autoBackup, setAutoBackup] = useState(systemSettings.autoBackup);

  const handleSaveSystem = () => {
    updateSystemSettings({appName, supportEmail, minInvestment, interestPaymentDay: interestDay});
    Alert.alert('Saved', 'System settings updated.');
  };

  const handleSaveEmail = () => {
    updateSystemSettings({smtpHost, smtpFromName});
    Alert.alert('Saved', 'Email settings updated.');
  };

  const handleSaveSms = () => {
    updateSystemSettings({smsSenderId, smsProvider});
    Alert.alert('Saved', 'SMS settings updated.');
  };

  const handleToggleAutoBackup = (val: boolean) => {
    setAutoBackup(val);
    updateSystemSettings({autoBackup: val});
  };

  const handleRunBackup = () => {
    runBackupNow();
    Alert.alert('Backup complete', 'A fresh backup has been created.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SuperAdminHeader navigation={navigation} title="System Settings" />

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

            <Text style={styles.label}>From Name</Text>
            <TextInput style={styles.input} value={smtpFromName} onChangeText={setSmtpFromName} />

            <Text style={styles.label}>Support Email</Text>
            <TextInput
              style={styles.input}
              value={supportEmail}
              onChangeText={setSupportEmail}
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

            <Text style={styles.label}>Sender ID</Text>
            <TextInput style={styles.input} value={smsSenderId} onChangeText={setSmsSenderId} autoCapitalize="characters" />

            <Text style={styles.label}>SMS Provider</Text>
            <TextInput style={styles.input} value={smsProvider} onChangeText={setSmsProvider} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSms}>
              <Text style={styles.saveBtnText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {activeTab === 'Backup' ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Backup Settings</Text>

            <View style={styles.switchRow}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Automatic Daily Backup</Text>
                <Text style={styles.helperText}>Runs every night at 2:00 AM</Text>
              </View>
              <Switch value={autoBackup} onValueChange={handleToggleAutoBackup} />
            </View>

            <Text style={styles.label}>Last Backup</Text>
            <View style={styles.readonlyBox}>
              <Text style={styles.readonlyText}>{systemSettings.lastBackupTime}</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleRunBackup}>
              <Text style={styles.saveBtnText}>Run Backup Now</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SystemSettingsScreen;