import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/SettingsScreen.styles';

const SettingsScreen = ({navigation}: any) => {
  const {adminSettings, updateAdminSettings} = useAppData();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing fields', 'Please enter your current and new password.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Weak password', 'New password should be at least 8 characters.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    Alert.alert('Password updated', 'Your password has been changed successfully.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Admin Settings</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Preferences</Text>

          <View style={styles.rowBetween}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Email Notifications</Text>
              <Text style={styles.rowSubtitle}>Get email alerts for all activity</Text>
            </View>
            <Switch
              value={adminSettings.emailNotifications}
              onValueChange={v => updateAdminSettings({emailNotifications: v})}
              trackColor={{false: '#E5E7EB', true: '#2563EB'}}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.rowBetween, {marginTop: 18}]}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>SMS Notifications</Text>
              <Text style={styles.rowSubtitle}>Get SMS for interest credits</Text>
            </View>
            <Switch
              value={adminSettings.smsNotifications}
              onValueChange={v => updateAdminSettings({smsNotifications: v})}
              trackColor={{false: '#E5E7EB', true: '#2563EB'}}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>

          <View style={styles.rowBetween}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>Two-Factor Authentication</Text>
              <Text style={styles.rowSubtitle}>Require OTP on every login</Text>
            </View>
            <Switch
              value={adminSettings.twoFactorEnabled}
              onValueChange={v => updateAdminSettings({twoFactorEnabled: v})}
              trackColor={{false: '#E5E7EB', true: '#2563EB'}}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter current password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePassword}>
            <Text style={styles.updateBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;