import React, {createContext, useContext, useState} from 'react';
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
import ProfileScreen from '../screens/ProfileScreen';

// ---- ADMIN SCREENS (kept in their own subfolder, investor code above is untouched) ----
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import InvestorRegistryScreen from '../screens/admin/InvestorRegistryScreen';
import BondTrackingScreen from '../screens/admin/BondTrackingScreen';
import InterestPayoutsScreen from '../screens/admin/InterestPayoutsScreen';
import SettlementCalculatorScreen from '../screens/admin/SettlementCalculatorScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import KycApprovalsScreen from '../screens/admin/KycApprovalsScreen';

const Stack = createNativeStackNavigator();



export type Investor = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  branch: string;
  tier: 'PLATINUM' | 'GOLD' | 'SILVER';
  kycStatus: 'Approved' | 'Pending' | 'Rejected';
  totalInvested: number;
  status: 'Active' | 'Pending';
  type: 'individual' | 'institution';
};

export type Bond = {
  seriesId: string;
  investorName: string;
  amount: number;
  interestRate: number;
  investedDate: string;
  maturityDate: string;
  subscriptionPercent: number;
  status: 'Active' | 'Upcoming' | 'Settled';
};

export type Activity = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  icon: 'investor' | 'bond' | 'transaction';
};

export type AdminProfile = {
  name: string;
  email: string;
  role: string;
  mobile: string;
  branch: string;
  status: 'Active' | 'Inactive';
  avatarUri: string;
};

export type DocStatus = 'Verified' | 'Pending' | 'Flagged' | 'Uploading';

export type KycRequest = {
  id: string;
  name: string;
  location: string;
  avatarUri: string;
  overallFlag: 'verified' | 'flagged' | 'uploading';
  aadhaar: DocStatus;
  pan: DocStatus;
  bankStmt: DocStatus;
  avgWait: string;
  amlNote?: string;
  category: 'pending' | 'flagged' | 'archive';
};

export type KycStats = {
  avgReviewTime: string;
  avgReviewChangePct: number;
  todaysCompleted: number;
  todaysTarget: number;
  amlHighRiskCount: number;
};

export type Payout = {
  id: string;
  investorName: string;
  investorType: 'individual' | 'institution';
  bondId: string;
  amount: number;
  dueDate: string;
  reference: string;
  status: 'overdue' | 'upcoming' | 'paid';
  overdueDays?: number;
};

// ---- Registered investor credentials (used for login validation) ----
export type RegisteredInvestor = {
  id: string;
  name: string;
  mobile: string;
};

type AddInvestmentParams = {
  investorId: string;
  investorName: string;
  amount: number;
  bondSeriesId?: string;
  investorType?: 'individual' | 'institution';
};

type AppDataContextType = {
  investors: Investor[];
  bonds: Bond[];
  activities: Activity[];
  payouts: Payout[];
  kycPendingCount: number;
  adminProfile: AdminProfile;
  kycRequests: KycRequest[];
  kycStats: KycStats;
  registeredInvestors: RegisteredInvestor[];
  addInvestment: (params: AddInvestmentParams) => void;
  markPayoutPaid: (payoutId: string) => void;
  markAllPayoutsPaid: () => void;
  setAdminProfile: (partial: Partial<AdminProfile>) => void;
  approveKyc: (id: string) => void;
  rejectKyc: (id: string) => void;
  escalateKyc: (id: string) => void;
  registerInvestor: (name: string, mobile: string) => string;
  validateInvestorLogin: (investorId: string, mobile: string) => boolean;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppNavigator tree');
  }
  return ctx;
};

const initialInvestors: Investor[] = [
  {id: 'INV-0842', name: 'Global Heritage Trust', email: 'contact@globalheritagetrust.com', mobile: '9876543210', branch: 'Mumbai HQ', tier: 'PLATINUM', kycStatus: 'Approved', totalInvested: 4250000, status: 'Active', type: 'institution'},
  {id: 'INV-1102', name: 'Alexandra Vance', email: 'alexandra.vance@email.com', mobile: '9876543211', branch: 'Delhi North', tier: 'GOLD', kycStatus: 'Approved', totalInvested: 842500, status: 'Active', type: 'individual'},
  {id: 'INV-1459', name: 'Marcus Thorne', email: 'marcus.thorne@email.com', mobile: '9876543212', branch: 'Bangalore', tier: 'SILVER', kycStatus: 'Pending', totalInvested: 120000, status: 'Pending', type: 'individual'},
  {id: 'INV-0012', name: 'Apex Capital Ltd', email: 'contact@apexcapital.com', mobile: '9876543213', branch: 'Chennai', tier: 'PLATINUM', kycStatus: 'Approved', totalInvested: 12400000, status: 'Active', type: 'institution'},
];

const initialBonds: Bond[] = [
  {seriesId: 'DB-2024-X901', investorName: 'Global Heritage Trust', amount: 4250000, interestRate: 4.25, investedDate: '15 Jan 2025', maturityDate: '12 Nov 2029', subscriptionPercent: 84, status: 'Active'},
  {seriesId: 'DB-2024-Y212', investorName: 'Alexandra Vance', amount: 842500, interestRate: 5.1, investedDate: '18 Jan 2025', maturityDate: '22 Jan 2031', subscriptionPercent: 12, status: 'Upcoming'},
  {seriesId: 'DB-2023-A004', investorName: 'Marcus Thorne', amount: 120000, interestRate: 3.85, investedDate: '22 Jan 2025', maturityDate: '15 Dec 2023', subscriptionPercent: 100, status: 'Settled'},
  {seriesId: 'DB-2024-M550', investorName: 'Apex Capital Ltd', amount: 12400000, interestRate: 6.2, investedDate: '25 Jan 2025', maturityDate: '04 Mar 2035', subscriptionPercent: 62, status: 'Active'},
];

const initialActivities: Activity[] = [
  {id: 'a1', title: 'New Investor Registered', subtitle: 'ID: #INV-9284 • London, UK', time: '14:02', icon: 'investor'},
  {id: 'a2', title: 'Bond Issuance Completed', subtitle: 'Series 2024-B • $500M', time: '12:45', icon: 'bond'},
  {id: 'a3', title: 'Large Transaction Alert', subtitle: 'External Wallet • 4.2M USD', time: '10:12', icon: 'transaction'},
];

const initialPayouts: Payout[] = [
  {id: 'p1', investorName: 'Aditya Sharma', investorType: 'individual', bondId: 'BOND-9923', amount: 12400, dueDate: '12 Oct', reference: '–', status: 'overdue', overdueDays: 3},
  {id: 'p2', investorName: 'Global Ventures Ltd.', investorType: 'institution', bondId: 'BOND-8812', amount: 45000, dueDate: '14 Oct', reference: '–', status: 'overdue', overdueDays: 1},
  {id: 'p3', investorName: 'Meera Iyer', investorType: 'individual', bondId: 'BOND-7721', amount: 8500, dueDate: '20 Oct', reference: '–', status: 'upcoming'},
  {id: 'p4', investorName: 'Rohan Kapur', investorType: 'individual', bondId: 'BOND-6654', amount: 22100, dueDate: '22 Oct', reference: '–', status: 'upcoming'},
  {id: 'p5', investorName: 'Priya Patel', investorType: 'individual', bondId: 'BOND-5521', amount: 9479, dueDate: '18 Jul', reference: 'UTR789456', status: 'paid'},
];

const initialKycRequests: KycRequest[] = [
  {
    id: 'k1',
    name: 'Aditya Sharma',
    location: 'Mumbai, India',
    avatarUri: 'https://i.pravatar.cc/200?img=13',
    overallFlag: 'verified',
    aadhaar: 'Verified',
    pan: 'Verified',
    bankStmt: 'Pending',
    avgWait: '02:10',
    category: 'pending',
  },
  {
    id: 'k2',
    name: 'Priya Nair',
    location: 'Bangalore, India',
    avatarUri: 'https://i.pravatar.cc/200?img=32',
    overallFlag: 'flagged',
    aadhaar: 'Verified',
    pan: 'Flagged',
    bankStmt: 'Verified',
    avgWait: '00:40',
    amlNote: 'AML Flag: Name mismatch detected between Aadhaar and PAN database. Reviewing secondary identity documents is recommended.',
    category: 'flagged',
  },
  {
    id: 'k3',
    name: 'Rohan Mehta',
    location: 'Delhi, India',
    avatarUri: 'https://i.pravatar.cc/200?img=14',
    overallFlag: 'uploading',
    aadhaar: 'Uploading',
    pan: 'Verified',
    bankStmt: 'Pending',
    avgWait: '--:--',
    category: 'pending',
  },
];

const initialKycStats: KycStats = {
  avgReviewTime: '04:22',
  avgReviewChangePct: -12,
  todaysCompleted: 84,
  todaysTarget: 120,
  amlHighRiskCount: 3,
};

const defaultAdminProfile: AdminProfile = {
  name: 'Ravi Mehta',
  email: 'ravi.admin@inrfs.in',
  role: 'Super Admin',
  mobile: '+91 98765 43210',
  branch: 'Head Office, Mumbai',
  status: 'Active',
  avatarUri: 'https://i.pravatar.cc/200?img=12',
};

const AppNavigator = () => {
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [bonds] = useState<Bond[]>(initialBonds);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [adminProfile, setAdminProfileState] = useState<AdminProfile>(defaultAdminProfile);
  const [kycRequests, setKycRequests] = useState<KycRequest[]>(initialKycRequests);
  const [kycStats] = useState<KycStats>(initialKycStats);

  // Seeded from the existing demo investors so those IDs keep working for login too.
  const [registeredInvestors, setRegisteredInvestors] = useState<RegisteredInvestor[]>(
    initialInvestors.map(inv => ({id: inv.id, name: inv.name, mobile: inv.mobile})),
  );

  const approveKyc = (id: string) => {
    setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'archive'} : k)));
  };

  const rejectKyc = (id: string) => {
    setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'archive'} : k)));
  };

  const escalateKyc = (id: string) => {
    setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'flagged'} : k)));
  };

  const setAdminProfile = (partial: Partial<AdminProfile>) => {
    setAdminProfileState(prev => ({...prev, ...partial}));
  };

  const addInvestment = ({investorId, investorName, amount, bondSeriesId, investorType}: AddInvestmentParams) => {
    setInvestors(prev => {
      const existing = prev.find(inv => inv.id === investorId);
      if (existing) {
        return prev.map(inv =>
          inv.id === investorId ? {...inv, totalInvested: inv.totalInvested + amount} : inv,
        );
      }
      return [
        {
          id: investorId,
          name: investorName,
          email: `${investorName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          mobile: '—',
          branch: '—',
          tier: 'SILVER',
          kycStatus: 'Pending',
          totalInvested: amount,
          status: 'Active',
          type: investorType ?? 'individual',
        },
        ...prev,
      ];
    });

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'New Investment Made',
        subtitle: `${investorName}${bondSeriesId ? ` • ${bondSeriesId}` : ''} • $${amount.toLocaleString()}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'transaction',
      },
      ...prev,
    ]);
  };

  const markPayoutPaid = (payoutId: string) => {
    setPayouts(prev =>
      prev.map(p =>
        p.id === payoutId
          ? {...p, status: 'paid', reference: `UTR${Date.now().toString().slice(-6)}`, overdueDays: undefined}
          : p,
      ),
    );
  };

  const markAllPayoutsPaid = () => {
    setPayouts(prev =>
      prev.map(p =>
        p.status === 'paid'
          ? p
          : {...p, status: 'paid', reference: `UTR${Date.now().toString().slice(-6)}${p.id}`, overdueDays: undefined},
      ),
    );
  };

  // Generates a unique-ish INV-XXXX id, stores the credentials, and returns
  // the new id so RegistrationScreen can display it to the user.
  const registerInvestor = (name: string, mobile: string) => {
    const newId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    setRegisteredInvestors(prev => [...prev, {id: newId, name: name.trim(), mobile: mobile.trim()}]);
    return newId;
  };

  // Checks the entered Investor ID + mobile against everyone who has
  // registered (including the seeded demo investors above).
  const validateInvestorLogin = (investorId: string, mobile: string) => {
    return registeredInvestors.some(
      inv =>
        inv.id.trim().toLowerCase() === investorId.trim().toLowerCase() &&
        inv.mobile.trim() === mobile.trim(),
    );
  };

  const kycPendingCount = investors.filter(inv => inv.status === 'Pending').length;

  return (
    <AppDataContext.Provider
      value={{
        investors,
        bonds,
        activities,
        payouts,
        kycPendingCount,
        adminProfile,
        kycRequests,
        kycStats,
        registeredInvestors,
        addInvestment,
        markPayoutPaid,
        markAllPayoutsPaid,
        setAdminProfile,
        approveKyc,
        rejectKyc,
        escalateKyc,
        registerInvestor,
        validateInvestorLogin,
      }}>
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
          <Stack.Screen name="Profile" component={ProfileScreen} />

       
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="InvestorRegistry" component={InvestorRegistryScreen} />
          <Stack.Screen name="BondTracking" component={BondTrackingScreen} />
          <Stack.Screen name="InterestPayouts" component={InterestPayoutsScreen} />
          <Stack.Screen name="SettlementCalculator" component={SettlementCalculatorScreen} />
          <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
          <Stack.Screen name="KycApprovals" component={KycApprovalsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppDataContext.Provider>
  );
};

export default AppNavigator;