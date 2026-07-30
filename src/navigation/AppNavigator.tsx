import React, {createContext, useContext, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
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
import InvestorNotificationsScreen from '../screens/NotificationsScreen';
import InvestorSettingsScreen from '../screens/SettingsScreen';
// ---- ADMIN SCREENS (kept in their own subfolder, investor code above is untouched) ----
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import InvestorRegistryScreen from '../screens/admin/InvestorRegistryScreen';
import BondTrackingScreen from '../screens/admin/BondTrackingScreen';
import InterestPayoutsScreen from '../screens/admin/InterestPayoutsScreen';
import SettlementCalculatorScreen from '../screens/admin/SettlementCalculatorScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import KycApprovalsScreen from '../screens/admin/KycApprovalsScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import AdminNotificationsScreen from '../screens/admin/NotificationsScreen';
import AdminSettingsScreen from '../screens/admin/SettingsScreen';
// ---- SUPER ADMIN SCREENS (new, own subfolder, mirrors the web Super Admin portal) ----
import SuperAdminDashboardScreen from '../screens/superadmin/SuperAdminDashboardScreen';
import BranchManagementScreen from '../screens/superadmin/BranchManagementScreen';
import AdminManagementScreen from '../screens/superadmin/AdminManagementScreen';
import UserManagementScreen from '../screens/superadmin/UserManagementScreen';
import RolesPermissionsScreen from '../screens/superadmin/RolesPermissionsScreen';
import AuditLogsScreen from '../screens/superadmin/AuditLogsScreen';
import SuperAdminReportsScreen from '../screens/superadmin/SuperAdminReportsScreen';
import SystemSettingsScreen from '../screens/superadmin/SystemSettingsScreen';
import NotificationsScreen from '../screens/superadmin/NotificationsScreen';
import SuperAdminProfileScreen from '../screens/superadmin/SuperAdminProfileScreen';

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

export type AdminSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  twoFactorEnabled: boolean;
};

export type Bond = {
  seriesId: string;
  investorName: string;
  amount: number;
  interestRate: number;
  investedDate: string;
  maturityDate: string;
  subscriptionPercent: number;
  monthsActive: number;
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

// ---------------- Super Admin types ----------------

export type Branch = {
  id: string;
  name: string;
  city: string;
  adminName: string;
  investors: number;
  aum: string; // e.g. "₹18.2Cr" — kept as a display string to match the web portal
  status: 'Active' | 'Suspended';
};

export type SAAdmin = {
  id: string;
  name: string;
  email: string;
  branch: string;
  role: 'Admin' | 'Branch Manager';
  status: 'Active' | 'Inactive';
};

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  role: 'Investor' | 'Admin' | 'Branch Manager' | 'Super Admin';
  branch: string;
  status: 'Active' | 'Inactive';
};

export type PermissionKey =
  | 'View Dashboard'
  | 'Approve KYC'
  | 'Generate Bond'
  | 'Process Settlement'
  | 'Export Reports'
  | 'Manage Branches'
  | 'Email Settings'
  | 'Audit Logs'
  | 'Manage Investors'
  | 'Add Investment'
  | 'Mark Interest Paid'
  | 'View Reports'
  | 'Manage Admins'
  | 'System Settings'
  | 'SMS Settings'
  | 'Delete Records';

export type SystemRole = {
  name: 'Super Admin' | 'Admin' | 'Branch Manager' | 'Investor';
  usersCount: number;
  totalPerms: number;
  permissions: Record<PermissionKey, boolean>;
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  role: 'Admin' | 'Branch Manager' | 'Super Admin' | 'Investor' | 'System';
  action: string;
  status: 'Success' | 'Failed';
};

export type SANotification = {
  id: string;
  title: string;
  isNew: boolean;
  message: string;
  time: string;
  icon: 'check' | 'bond' | 'money' | 'bell' | 'mail';
};

export type SystemSettings = {
  appName: string;
  supportEmail: string;
  minInvestment: string;
  interestPaymentDay: string;
  smtpHost: string;
  smtpFromName: string;
  smsSenderId: string;
  smsProvider: string;
  autoBackup: boolean;
  lastBackupTime: string;
};

type AddInvestmentParams = {
  investorId: string;
  investorName: string;
  amount: number;
  bondSeriesId?: string;
  investorType?: 'individual' | 'institution';
};

type AddBondParams = {
  investorName: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  investedDateStr: string; // expected format: DD-MM-YYYY
  reference?: string;
};

type AddBranchParams = {
  name: string;
  city: string;
  adminName: string;
};

type AddSAAdminParams = {
  name: string;
  email: string;
  branch: string;
  role: 'Admin' | 'Branch Manager';
};

type AddSystemUserParams = {
  name: string;
  email: string;
  role: SystemUser['role'];
  branch: string;
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
  addInvestment: (params: AddInvestmentParams) => void;
  addBond: (params: AddBondParams) => void;
  markPayoutPaid: (payoutId: string) => void;
  markAllPayoutsPaid: () => void;
  setAdminProfile: (partial: Partial<AdminProfile>) => void;
  approveKyc: (id: string) => void;
  rejectKyc: (id: string) => void;
  escalateKyc: (id: string) => void;

  // ---- Admin Notifications / Settings ----
  adminNotifications: SANotification[];
  adminSettings: AdminSettings;
  markAllAdminNotificationsRead: () => void;
  updateAdminSettings: (partial: Partial<AdminSettings>) => void;

  // ---- Super Admin ----
  branches: Branch[];
  saAdmins: SAAdmin[];
  systemUsers: SystemUser[];
  systemRoles: SystemRole[];
  auditLogs: AuditLogEntry[];
  saNotifications: SANotification[];
  systemSettings: SystemSettings;
  addBranch: (params: AddBranchParams) => void;
  toggleBranchStatus: (id: string) => void;
  deleteBranch: (id: string) => void;
  addSAAdmin: (params: AddSAAdminParams) => void;
  deleteSAAdmin: (id: string) => void;
  addSystemUser: (params: AddSystemUserParams) => void;
  deleteSystemUser: (id: string) => void;
  updateRolePermissions: (roleName: SystemRole['name'], permissions: Record<PermissionKey, boolean>) => void;
  updateSystemSettings: (partial: Partial<SystemSettings>) => void;
  markAllNotificationsRead: () => void;
  runBackupNow: () => void;
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
  {seriesId: 'DB-2024-X901', investorName: 'Global Heritage Trust', amount: 4250000, interestRate: 4.25, investedDate: '15 Jan 2025', maturityDate: '12 Nov 2029', subscriptionPercent: 84, monthsActive: 8, status: 'Active'},
  {seriesId: 'DB-2024-Y212', investorName: 'Alexandra Vance', amount: 842500, interestRate: 5.1, investedDate: '18 Jan 2025', maturityDate: '22 Jan 2031', subscriptionPercent: 12, monthsActive: 3, status: 'Upcoming'},
  {seriesId: 'DB-2023-A004', investorName: 'Marcus Thorne', amount: 120000, interestRate: 3.85, investedDate: '22 Jan 2025', maturityDate: '15 Dec 2023', subscriptionPercent: 100, monthsActive: 6, status: 'Settled'},
  {seriesId: 'DB-2024-M550', investorName: 'Apex Capital Ltd', amount: 12400000, interestRate: 6.2, investedDate: '25 Jan 2025', maturityDate: '04 Mar 2035', subscriptionPercent: 62, monthsActive: 5, status: 'Active'},
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

const initialAdminNotifications: SANotification[] = [
  {id: 'an1', title: 'Investment Approved', isNew: true, message: 'Your investment BND-2025-001 of ₹5,00,000 has been approved.', time: '2 hours ago', icon: 'check'},
  {id: 'an2', title: 'Bond Generated', isNew: true, message: 'Investment Bond BND-2025-001 has been generated. Download now.', time: '2 hours ago', icon: 'bond'},
  {id: 'an3', title: 'Interest Credited', isNew: true, message: '₹5,000 monthly interest for June 2025 has been credited.', time: '5 days ago', icon: 'money'},
  {id: 'an4', title: 'Upcoming Maturity', isNew: false, message: 'Bond BND-2024-087 matures in 30 days. Plan your renewal.', time: '1 week ago', icon: 'bell'},
  {id: 'an5', title: 'Email Confirmation', isNew: false, message: 'Email confirmation sent to arjun@email.com for investment.', time: '2 weeks ago', icon: 'mail'},
];

const defaultAdminSettings: AdminSettings = {
  emailNotifications: true,
  smsNotifications: true,
  twoFactorEnabled: true,
};

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



const initialBranches: Branch[] = [
  {id: 'br1', name: 'Mumbai HQ', city: 'Mumbai', adminName: 'Ravi Mehta', investors: 342, aum: '₹18.2Cr', status: 'Active'},
  {id: 'br2', name: 'Delhi North', city: 'Delhi', adminName: 'Suresh Kumar', investors: 218, aum: '₹11.4Cr', status: 'Active'},
  {id: 'br3', name: 'Bangalore', city: 'Bangalore', adminName: 'Anita Rao', investors: 186, aum: '₹9.8Cr', status: 'Active'},
  {id: 'br4', name: 'Chennai', city: 'Chennai', adminName: 'Mohan Das', investors: 142, aum: '₹7.2Cr', status: 'Active'},
  {id: 'br5', name: 'Pune', city: 'Pune', adminName: 'Priya Joshi', investors: 98, aum: '₹5.1Cr', status: 'Suspended'},
];

const initialSAAdmins: SAAdmin[] = [
  {id: 'ad1', name: 'Ravi Mehta', email: 'ravi@inrfs.in', branch: 'Mumbai HQ', role: 'Admin', status: 'Active'},
  {id: 'ad2', name: 'Suresh Kumar', email: 'suresh@inrfs.in', branch: 'Delhi North', role: 'Admin', status: 'Active'},
  {id: 'ad3', name: 'Anita Rao', email: 'anita@inrfs.in', branch: 'Bangalore', role: 'Admin', status: 'Active'},
  {id: 'ad4', name: 'Mohan Das', email: 'mohan@inrfs.in', branch: 'Chennai', role: 'Branch Manager', status: 'Active'},
];

const initialSystemUsers: SystemUser[] = [
  {id: 'u1', name: 'Arjun Sharma', email: 'arjun@email.com', role: 'Investor', branch: 'Mumbai HQ', status: 'Active'},
  {id: 'u2', name: 'Ravi Mehta', email: 'ravi@inrfs.in', role: 'Admin', branch: 'Mumbai HQ', status: 'Active'},
  {id: 'u3', name: 'Kishore Nair', email: 'kishore@inrfs.in', role: 'Branch Manager', branch: 'Mumbai HQ', status: 'Active'},
  {id: 'u4', name: 'Super Admin', email: 'sa@inrfs.in', role: 'Super Admin', branch: 'Head Office', status: 'Active'},
];

const allPermissionKeys: PermissionKey[] = [
  'View Dashboard', 'Approve KYC', 'Generate Bond', 'Process Settlement', 'Export Reports',
  'Manage Branches', 'Email Settings', 'Audit Logs', 'Manage Investors', 'Add Investment',
  'Mark Interest Paid', 'View Reports', 'Manage Admins', 'System Settings', 'SMS Settings', 'Delete Records',
];

const allTruePerms = (): Record<PermissionKey, boolean> => {
  const obj = {} as Record<PermissionKey, boolean>;
  allPermissionKeys.forEach(k => (obj[k] = true));
  return obj;
};

const adminPerms = (): Record<PermissionKey, boolean> => ({
  'View Dashboard': true, 'Approve KYC': true, 'Generate Bond': true, 'Process Settlement': true,
  'Export Reports': true, 'Manage Branches': false, 'Email Settings': false, 'Audit Logs': false,
  'Manage Investors': true, 'Add Investment': true, 'Mark Interest Paid': true, 'View Reports': true,
  'Manage Admins': true, 'System Settings': false, 'SMS Settings': false, 'Delete Records': false,
});

const branchManagerPerms = (): Record<PermissionKey, boolean> => ({
  'View Dashboard': true, 'Approve KYC': true, 'Generate Bond': false, 'Process Settlement': false,
  'Export Reports': true, 'Manage Branches': false, 'Email Settings': false, 'Audit Logs': false,
  'Manage Investors': true, 'Add Investment': true, 'Mark Interest Paid': false, 'View Reports': true,
  'Manage Admins': false, 'System Settings': false, 'SMS Settings': false, 'Delete Records': false,
});

const investorPerms = (): Record<PermissionKey, boolean> => ({
  'View Dashboard': true, 'Approve KYC': false, 'Generate Bond': false, 'Process Settlement': false,
  'Export Reports': false, 'Manage Branches': false, 'Email Settings': false, 'Audit Logs': false,
  'Manage Investors': false, 'Add Investment': true, 'Mark Interest Paid': false, 'View Reports': true,
  'Manage Admins': false, 'System Settings': false, 'SMS Settings': false, 'Delete Records': false,
});

const initialSystemRoles: SystemRole[] = [
  {name: 'Super Admin', usersCount: 1, totalPerms: 32, permissions: allTruePerms()},
  {name: 'Admin', usersCount: 28, totalPerms: 32, permissions: adminPerms()},
  {name: 'Branch Manager', usersCount: 14, totalPerms: 32, permissions: branchManagerPerms()},
  {name: 'Investor', usersCount: 1247, totalPerms: 32, permissions: investorPerms()},
];

const initialAuditLogs: AuditLogEntry[] = [
  {id: 'al1', timestamp: '22 Jul 2025, 14:32', user: 'Ravi Mehta', role: 'Admin', action: 'KYC Approved — INV002', status: 'Success'},
  {id: 'al2', timestamp: '22 Jul 2025, 13:15', user: 'Kishore Nair', role: 'Branch Manager', action: 'Investment Added', status: 'Success'},
  {id: 'al3', timestamp: '22 Jul 2025, 12:00', user: 'Super Admin', role: 'Super Admin', action: 'Role Updated', status: 'Success'},
  {id: 'al4', timestamp: '22 Jul 2025, 10:45', user: 'Unknown', role: 'System', action: 'Failed Login Attempt', status: 'Failed'},
  {id: 'al5', timestamp: '22 Jul 2025, 12:30', user: 'System', role: 'System', action: 'Backup Run', status: 'Failed'},
  {id: 'al6', timestamp: '22 Jul 2025, 11:30', user: 'Kishore Nair', role: 'Branch Manager', action: 'KYC Approved', status: 'Success'},
  {id: 'al7', timestamp: '22 Jul 2025, 11:00', user: 'Super Admin', role: 'Super Admin', action: 'Investment Added', status: 'Success'},
  {id: 'al8', timestamp: '22 Jul 2025, 10:30', user: 'Priya Patel', role: 'Investor', action: 'Login', status: 'Success'},
  {id: 'al9', timestamp: '22 Jul 2025, 10:00', user: 'System', role: 'System', action: 'Settings Updated', status: 'Success'},
  {id: 'al10', timestamp: '22 Jul 2025, 13:30', user: 'Priya Patel', role: 'Investor', action: 'Settings Updated', status: 'Success'},
];

const initialSANotifications: SANotification[] = [
  {id: 'sn1', title: 'Investment Approved', isNew: true, message: 'Investment BND-2025-001 of ₹5,00,000 has been approved.', time: '2 hours ago', icon: 'check'},
  {id: 'sn2', title: 'Bond Generated', isNew: true, message: 'Investment Bond BND-2025-001 has been generated. Download now.', time: '2 hours ago', icon: 'bond'},
  {id: 'sn3', title: 'Interest Credited', isNew: true, message: '₹5,000 monthly interest for June 2025 has been credited.', time: '5 days ago', icon: 'money'},
  {id: 'sn4', title: 'Upcoming Maturity', isNew: false, message: 'Bond BND-2024-087 matures in 30 days. Plan your renewal.', time: '1 week ago', icon: 'bell'},
  {id: 'sn5', title: 'Email Confirmation', isNew: false, message: 'Email confirmation sent to arjun@email.com for investment.', time: '2 weeks ago', icon: 'mail'},
];

const initialSystemSettings: SystemSettings = {
  appName: 'INRFS Investment Portal',
  supportEmail: 'support@inrfs.in',
  minInvestment: '₹10,000',
  interestPaymentDay: '15',
  smtpHost: 'smtp.inrfs.in',
  smtpFromName: 'INRFS Investment Portal',
  smsSenderId: 'INRFS',
  smsProvider: 'Twilio',
  autoBackup: true,
  lastBackupTime: '22 Jul 2025, 12:30',
};


const parseDDMMYYYY = (s: string): Date => {
  const parts = s.split('-').map(Number);
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) {
    return new Date();
  }
  const [d, m, y] = parts;
  return new Date(y, m - 1, d);
};


const formatDDMMYYYY = (d: Date): string => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const nowTimestamp = () => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const time = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}, ${time}`;
};

const AppNavigator = () => {
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [bonds, setBonds] = useState<Bond[]>(initialBonds);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [adminProfile, setAdminProfileState] = useState<AdminProfile>(defaultAdminProfile);
  const [kycRequests, setKycRequests] = useState<KycRequest[]>(initialKycRequests);
  const [kycStats] = useState<KycStats>(initialKycStats);

  const [adminNotifications, setAdminNotifications] = useState<SANotification[]>(initialAdminNotifications);
  const [adminSettings, setAdminSettingsState] = useState<AdminSettings>(defaultAdminSettings);


  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [saAdmins, setSaAdmins] = useState<SAAdmin[]>(initialSAAdmins);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(initialSystemRoles);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [saNotifications, setSaNotifications] = useState<SANotification[]>(initialSANotifications);
  const [systemSettings, setSystemSettingsState] = useState<SystemSettings>(initialSystemSettings);

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

  const addBond = ({investorName, amount, interestRate, tenureMonths, investedDateStr, reference}: AddBondParams) => {
    const investedDate = parseDDMMYYYY(investedDateStr);
    const maturityDate = new Date(investedDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenureMonths);

    const newBond: Bond = {
      seriesId: `DB-${investedDate.getFullYear()}-${Date.now().toString().slice(-4)}`,
      investorName,
      amount,
      interestRate,
      investedDate: investedDateStr,
      maturityDate: formatDDMMYYYY(maturityDate),
      subscriptionPercent: 100,
      monthsActive: 0,
      status: 'Active',
    };

    setBonds(prev => [newBond, ...prev]);

    setInvestors(prev =>
      prev.map(inv =>
        inv.name === investorName ? {...inv, totalInvested: inv.totalInvested + amount} : inv,
      ),
    );

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'Bond Generated',
        subtitle: `${investorName} • ${newBond.seriesId}${reference ? ` • Ref: ${reference}` : ''} • ₹${amount.toLocaleString()}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'bond',
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

  const kycPendingCount = investors.filter(inv => inv.status === 'Pending').length;

 

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications(prev => prev.map(n => ({...n, isNew: false})));
  };

  const updateAdminSettings = (partial: Partial<AdminSettings>) => {
    setAdminSettingsState(prev => ({...prev, ...partial}));
  };

  // ---- Super Admin actions ----

  const pushAuditLog = (user: string, role: AuditLogEntry['role'], action: string, status: AuditLogEntry['status'] = 'Success') => {
    setAuditLogs(prev => [{id: `al-${Date.now()}`, timestamp: nowTimestamp(), user, role, action, status}, ...prev]);
  };

  const addBranch = ({name, city, adminName}: AddBranchParams) => {
    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      name,
      city,
      adminName,
      investors: 0,
      aum: '₹0Cr',
      status: 'Active',
    };
    setBranches(prev => [newBranch, ...prev]);
    pushAuditLog('Super Admin', 'Super Admin', `Branch Added — ${name}`);
  };

  const toggleBranchStatus = (id: string) => {
    setBranches(prev =>
      prev.map(b => (b.id === id ? {...b, status: b.status === 'Active' ? 'Suspended' : 'Active'} : b)),
    );
    const branch = branches.find(b => b.id === id);
    if (branch) {
      pushAuditLog('Super Admin', 'Super Admin', `Branch ${branch.status === 'Active' ? 'Suspended' : 'Activated'} — ${branch.name}`);
    }
  };

  const deleteBranch = (id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const addSAAdmin = ({name, email, branch, role}: AddSAAdminParams) => {
    const newAdmin: SAAdmin = {id: `ad-${Date.now()}`, name, email, branch, role, status: 'Active'};
    setSaAdmins(prev => [newAdmin, ...prev]);
    pushAuditLog('Super Admin', 'Super Admin', `${role} Created — ${name}`);
  };

  const deleteSAAdmin = (id: string) => {
    setSaAdmins(prev => prev.filter(a => a.id !== id));
  };

  const addSystemUser = ({name, email, role, branch}: AddSystemUserParams) => {
    const newUser: SystemUser = {id: `u-${Date.now()}`, name, email, role, branch, status: 'Active'};
    setSystemUsers(prev => [newUser, ...prev]);
    pushAuditLog('Super Admin', 'Super Admin', `User Added — ${name} (${role})`);
  };

  const deleteSystemUser = (id: string) => {
    setSystemUsers(prev => prev.filter(u => u.id !== id));
  };

  const updateRolePermissions = (roleName: SystemRole['name'], permissions: Record<PermissionKey, boolean>) => {
    setSystemRoles(prev => prev.map(r => (r.name === roleName ? {...r, permissions} : r)));
    pushAuditLog('Super Admin', 'Super Admin', `Permissions Updated — ${roleName}`);
  };

  const updateSystemSettings = (partial: Partial<SystemSettings>) => {
    setSystemSettingsState(prev => ({...prev, ...partial}));
    pushAuditLog('Super Admin', 'Super Admin', 'Settings Updated');
  };

  const markAllNotificationsRead = () => {
    setSaNotifications(prev => prev.map(n => ({...n, isNew: false})));
  };

  const runBackupNow = () => {
    setSystemSettingsState(prev => ({...prev, lastBackupTime: nowTimestamp()}));
    pushAuditLog('System', 'System', 'Backup Run');
  };

  return (
    <SafeAreaProvider>
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
          addInvestment,
          addBond,
          markPayoutPaid,
          markAllPayoutsPaid,
          setAdminProfile,
          approveKyc,
          rejectKyc,
          escalateKyc,

          adminNotifications,
          adminSettings,
          markAllAdminNotificationsRead,
          updateAdminSettings,

          branches,
          saAdmins,
          systemUsers,
          systemRoles,
          auditLogs,
          saNotifications,
          systemSettings,
          addBranch,
          toggleBranchStatus,
          deleteBranch,
          addSAAdmin,
          deleteSAAdmin,
          addSystemUser,
          deleteSystemUser,
          updateRolePermissions,
          updateSystemSettings,
          markAllNotificationsRead,
          runBackupNow,
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
            <Stack.Screen name="InvestorNotifications" component={InvestorNotificationsScreen} />
            <Stack.Screen name="InvestorSettings" component={InvestorSettingsScreen} />
   
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="InvestorRegistry" component={InvestorRegistryScreen} />
            <Stack.Screen name="BondTracking" component={BondTrackingScreen} />
            <Stack.Screen name="InterestPayouts" component={InterestPayoutsScreen} />
            <Stack.Screen name="SettlementCalculator" component={SettlementCalculatorScreen} />
            <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
            <Stack.Screen name="KycApprovals" component={KycApprovalsScreen} />
            <Stack.Screen name="AdminReports" component={ReportsScreen} />
            <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
            <Stack.Screen name="BranchManagement" component={BranchManagementScreen} />
            <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="RolesPermissions" component={RolesPermissionsScreen} />
            <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
            <Stack.Screen name="SuperAdminReports" component={SuperAdminReportsScreen} />
            <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="SuperAdminProfile" component={SuperAdminProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppDataContext.Provider>
    </SafeAreaProvider>
  );
};

export default AppNavigator;