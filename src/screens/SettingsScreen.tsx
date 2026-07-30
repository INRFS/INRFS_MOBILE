import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity,  TextInput, Switch, Alert} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from '../styles/SettingsScreen.styles';
import {SafeAreaView} from 'react-native-safe-area-context';
const InvestorSettingsScreen = ({navigation}: any) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Missing details', 'Please enter your current and new password.');
      return;
    }
    // Wire this up to a real password-change API call once available.
    Alert.alert('Password updated', 'Your password has been changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Notification Preferences */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notification Preferences</Text>

          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelWrap}>
              <Text style={styles.toggleTitle}>Email Notifications</Text>
              <Text style={styles.toggleSubtitle}>Get email alerts for all activity</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{false: '#D1D5DB', true: '#1955F0'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={[styles.toggleRow, {borderBottomWidth: 0}]}>
            <View style={styles.toggleLabelWrap}>
              <Text style={styles.toggleTitle}>SMS Notifications</Text>
              <Text style={styles.toggleSubtitle}>Get SMS for interest credits</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{false: '#D1D5DB', true: '#1955F0'}}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>

          <View style={[styles.toggleRow, {borderBottomWidth: 0}]}>
            <View style={styles.toggleLabelWrap}>
              <Text style={styles.toggleTitle}>Two-Factor Authentication</Text>
              <Text style={styles.toggleSubtitle}>Require OTP on every login</Text>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
              trackColor={{false: '#D1D5DB', true: '#1955F0'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePassword}>
            <Text style={styles.updateBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InvestorSettingsScreen;