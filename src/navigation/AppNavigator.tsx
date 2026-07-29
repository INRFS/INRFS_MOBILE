import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import InvestorDashboardScreen from '../screens/InvestorDashboardScreen';
import InvestNowScreen from '../screens/InvestNowScreen';
import MyInvestmentsscreen from '../screens/MyInvestmentsscreen';
import BondDetailsScreen from '../screens/BondDetailsScreen';
const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registration" component={RegistrationScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="InvestorDashboard" component={InvestorDashboardScreen} />
        <Stack.Screen name="InvestNow" component={InvestNowScreen} />
        <Stack.Screen name="MyInvestments" component={MyInvestmentsscreen} />
        <Stack.Screen name="BondDetails" component={BondDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;