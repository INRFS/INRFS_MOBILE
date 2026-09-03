import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppData} from '../../navigation/AppNavigator';
import {styles} from '../../styles/admin/SettingsScreen.styles';

const SettingsScreen = ({navigation}: any) => {
  const {adminSettings, updateAdminSettings} = useAppData();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleUpdatePassword = () => {
    const cleanCurrent = currentPassword.trim();
    const cleanNew = newPassword.trim();
    const errors: Record<string, string> = {};

    if (!cleanCurrent) {
      errors.currentPassword = 'Please enter your current password.';
    }

    if (!cleanNew) {
      errors.newPassword = 'Please enter your new password.';
    } else if (cleanNew.length < 8) {
      errors.newPassword = 'New password should be at least 8 characters.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
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
            onChangeText={t => {
              setCurrentPassword(t);
              if (fieldErrors.currentPassword) setFieldErrors(prev => ({...prev, currentPassword: ''}));
            }}
          />
          {fieldErrors.currentPassword ? (
            <Text style={{color: '#DC2626', fontSize: 11.5, marginTop: 4, fontWeight: '500'}}>
              {fieldErrors.currentPassword}
            </Text>
          ) : null}

          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={newPassword}
            onChangeText={t => {
              setNewPassword(t);
              if (fieldErrors.newPassword) setFieldErrors(prev => ({...prev, newPassword: ''}));
            }}
          />
          {fieldErrors.newPassword ? (
            <Text style={{color: '#DC2626', fontSize: 11.5, marginTop: 4, fontWeight: '500'}}>
              {fieldErrors.newPassword}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePassword}>
            <Text style={styles.updateBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;