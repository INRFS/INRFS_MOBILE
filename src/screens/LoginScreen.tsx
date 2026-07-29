import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView} from 'react-native';
import {styles} from '../styles/LoginScreen.styles';

type Role = 'investor' | 'admin' | 'superadmin' | 'branchmanager';

const roles: {key: Role; label: string; sub: string; icon: string}[] = [
  {key: 'investor', label: 'Investor', sub: 'Access your portfolio', icon: '👤'},
  {key: 'admin', label: 'Admin', sub: 'Manage investors', icon: '🛡'},
  {key: 'superadmin', label: 'Super admin', sub: 'Full system access', icon: '🔒'},
  {key: 'branchmanager', label: 'Branch manager', sub: 'Branch operations', icon: '🏢'},
];

const LoginScreen = ({navigation}: any) => {
  const [selectedRole, setSelectedRole] = useState<Role>('investor');
  const [investorId, setInvestorId] = useState('');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = () => {
    if (selectedRole === 'investor') {
      if (!investorId.trim() || !mobile.trim()) {
        setErrorMsg('Please enter both Investor ID and mobile number.');
        return;
      }
      setErrorMsg('');
      console.log('Send OTP for', investorId, mobile);
      navigation.navigate('OtpVerification', {investorId, mobile});
    } else {
      if (!username.trim() || !password.trim()) {
        setErrorMsg('Please enter both username and password.');
        return;
      }
      setErrorMsg('');
      console.log('Login as', selectedRole, username, password);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your INRFS account</Text>

        <Text style={styles.label}>Login as</Text>
        <View style={styles.roleGrid}>
          {roles.map(role => {
            const active = selectedRole === role.key;
            return (
              <TouchableOpacity
                key={role.key}
                style={[styles.roleCard, active && styles.roleCardActive]}
                onPress={() => {
                  setSelectedRole(role.key);
                  setErrorMsg('');
                }}>
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRole === 'investor' ? (
          <>
            <Text style={styles.label}>Investor ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your investor ID"
              placeholderTextColor="#9CA3AF"
              value={investorId}
              onChangeText={setInvestorId}
            />
            <Text style={styles.label}>Registered mobile number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
            />

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Send OTP  →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
              <Text style={styles.footerText}>
                New investor? <Text style={styles.footerLink}>Register now</Text>
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Login to Dashboard  →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;