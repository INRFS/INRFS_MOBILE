import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
// import InvestorSettingsScreen from '../screens/SettingsScreen';
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
// NEW: Admin > Investments — reviews investor-submitted investment requests
// import AdminInvestmentsScreen from '../screens/admin/AdminInvestmentsScreen';
// ---- SUPER ADMIN SCREENS (new, own subfolder, mirrors the web Super Admin portal) ----
import SuperAdminDashboardScreen from '../screens/superadmin/SuperAdminDashboardScreen';
import BranchManagementScreen from '../screens/superadmin/BranchManagementScreen';
import AdminManagementScreen from '../screens/superadmin/AdminManagementScreen';
import UserManagementScreen from '../screens/superadmin/UserManagementScreen';
import RolesPermissionsScreen from '../screens/superadmin/RolesPermissionsScreen';
import AuditLogsScreen from '../screens/superadmin/AuditLogsScreen';
import SuperAdminReportsScreen from '../screens/superadmin/SuperAdminReportsScreen';
import SystemSettingsScreen from '../screens/superadmin/SystemSettingsScreen';
import PaymentQueueScreen from '../screens/superadmin/PaymentQueueScreen';
import SuperAdminProfileScreen from '../screens/superadmin/SuperAdminProfileScreen';
import InvestorManagementScreen from '../screens/superadmin/InvestorManagementScreen';
import InvestmentManagementScreen from '../screens/superadmin/InvestmentManagementScreen';
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
  status: 'Active' | 'Pending' | 'Suspended';   // <-- added 'Suspended'
  type: 'individual' | 'institution';
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bankAccountNumber?: string;   // <-- new, for the View details modal
  ifscCode?: string;            // <-- new
  bankName?: string;            // <-- new
  bankAccountType?: string;     // <-- new, e.g. 'Savings' / 'Current'
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
   investorId: string; 
  interestRate: number;
  investedDate: string;
  maturityDate: string;
  subscriptionPercent: number;
  monthsActive: number;
  status: 'Active' | 'Upcoming' | 'Settled';
  // Optional so bonds already persisted to AsyncStorage before this field
  // existed don't break on load.
  tenureMonths?: number;
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
  aadhaarNumber: string;
  pan: DocStatus;
  bankStmt: DocStatus;
  avgWait: string;
  amlNote?: string;
  category: 'pending' | 'flagged' | 'archive';
  investorId?: string;
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
  status: 'overdue' | 'upcoming' | 'paid' | 'pending_approval' | 'approved' | 'rejected';
  overdueDays?: number;
};

export type InvestmentRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export type InvestmentRequest = {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  tenureMonths: number;
  interestRate: number;
  transactionRef: string;
  screenshotUri: string | null;
  status: InvestmentRequestStatus;
  requestedOn: string;
  bondSeriesId?: string;
  branch?: string;
};
export type TenureExtensionRequest = {
  id: string;
  bondSeriesId: string;
  investorId: string;
  investorName: string;
  currentTenureMonths: number;
  extensionMonths: number;
  status: 'Pending' | 'PendingSuperAdmin' | 'Approved' | 'Rejected';
  requestedOn: string;
  // NEW: the rate the admin decided on when forwarding to Super Admin —
  // applied to the bond only once Super Admin gives final approval.
  decidedRate?: number;
};
// NEW: tracks a matured bond the admin has forwarded to Super Admin for
// final settlement approval — the "Tenure Timeout" equivalent of a
// pre-close request, but with no investor-submitted request behind it.
export type MaturitySettlementRequest = {
  id: string;
  bondSeriesId: string;
  investorId: string;
  investorName: string;
  principal: number;
  totalInterest: number;
  netSettlement: number;
  status: 'PendingSuperAdmin' | 'Approved' | 'Rejected';
  requestedOn: string;
};
export type PreSettlementRequest = {
  id: string;
  bondSeriesId: string;
  investorId: string;
  investorName: string;
  principal: number;
  earned: number;
  penalty: number;
  netAmount: number;
  status: 'Pending' | 'PendingSuperAdmin' | 'Approved' | 'Rejected';
  requestedOn: string;
    reason?: string;
};
export type Branch = {
  id: string;
  name: string;
  city: string;
  adminName: string;
  investors: number;
  aum: string;
  status: 'Active' | 'Suspended';
};

export type SAAdmin = {
  id: string;
  name: string;
  email: string;
  mobile: string;
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
  relatedPayoutId?: string;
  relatedPayoutIds?: string[];
  payoutActionTaken?: 'approved' | 'rejected';
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

// ---------------------------------------------------------------------------
// Params for registering a brand-new investor straight from
// RegistrationScreen — BEFORE any investment or KYC approval has happened.
// This is what was missing: RegistrationScreen used to just console.log the
// form and never call into shared app state, so nothing the person typed
// (name, mobile, branch, address, aadhaar, etc.) ever reached the admin
// screens. This closes that gap.
// ---------------------------------------------------------------------------
type RegisterInvestorParams = {
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  aadhaar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  branch?: string;
  type?: 'individual' | 'institution';
};

type AddInvestmentParams = {
  investorId: string;
  investorName: string;
  amount: number;
  bondSeriesId?: string;
  investorType?: 'individual' | 'institution';
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  branch?: string;
};

type AddBondParams = {
  investorName: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  investedDateStr: string;
  reference?: string;
};

type SubmitInvestmentRequestParams = {
  investorId: string;
  investorName: string;
  amount: number;
  tenureMonths: number;
  interestRate: number;
  transactionRef: string;
  screenshotUri: string | null;
  dob?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  branch?: string;
};

type AddBranchParams = {
  name: string;
  city: string;
  adminName: string;
};

type AddSAAdminParams = {
  name: string;
  email: string;
  mobile?: string;
  branch: string;
  role: 'Admin' | 'Branch Manager';
};

// NEW: params for editing an existing Super Admin-managed admin/branch
// manager record. Used by AdminManagementScreen's Edit Admin modal so
// changes are written through context (and therefore persisted to
// AsyncStorage) instead of being kept as local, session-only state.
type UpdateSAAdminParams = {
  name?: string;
  email?: string;
  mobile?: string;
  branch?: string;
  role?: SAAdmin['role'];
  status?: SAAdmin['status'];
};

type AddSystemUserParams = {
  name: string;
  email: string;
  role: SystemUser['role'];
  branch: string;
};

// ---------------------------------------------------------------------------
// NEW: Params for updating an investor's own profile fields (name, mobile,
// email, address, etc.) and, separately, their bank details. Kept as two
// distinct calls because they're edited from different sections of the
// Profile screen and map cleanly onto how ProfileScreen's `draft` state is
// already split into top-level fields vs `draft.bank`.
// ---------------------------------------------------------------------------
type UpdateInvestorProfileParams = {
  name?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type UpdateInvestorBankDetailsParams = {
  bankName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankAccountType?: string;
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
  registerInvestor: (params: RegisterInvestorParams) => string;
  addInvestment: (params: AddInvestmentParams) => void;
  addBond: (params: AddBondParams) => void;
  markPayoutPaid: (payoutId: string) => void;
  markAllPayoutsPaid: () => void;
  requestPayoutApproval: (payoutId: string) => void;
  requestAllPayoutsApproval: () => void;
  approvePayoutRequest: (notificationId: string) => void;
  rejectPayoutRequest: (notificationId: string) => void;
  setAdminProfile: (partial: Partial<AdminProfile>) => void;
  approveKyc: (id: string) => void;
  rejectKyc: (id: string) => void;
  escalateKyc: (id: string) => void;
  approveInvestorKyc: (investorId: string) => void;
  rejectInvestorKyc: (investorId: string) => void;
  tenureExtensionRequests: TenureExtensionRequest[];
  preSettlementRequests: PreSettlementRequest[];
  requestTenureExtension: (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    currentTenureMonths: number;
    extensionMonths: number;
  }) => void;
  requestPreSettlement: (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    principal: number;
    earned: number;
    penalty: number;
    netAmount: number;
    // NEW: matches the web "REASON FOR PRE-CLOSE" field, surfaced on the
    // admin's Settlement screen under each Pre-Close request.
    reason?: string;
  }) => void;
  // NEW: admin-side actions on investor-submitted tenure extension / pre-close
  // requests. approveTenureExtension takes the bond directly (not just the
  // request id) because the admin can tweak months/rate in the Tenure modal
  // even when there's no linked request (manual renewal). linkedRequestId is
  // optional so a manual renewal (no investor request behind it) still works.
  approveTenureExtension: (
    bondSeriesId: string,
    extensionMonths: number,
    newRate?: number,
    linkedRequestId?: string,
  ) => void;
  rejectTenureExtension: (requestId: string) => void;
  approvePreSettlement: (requestId: string) => void;
  rejectPreSettlement: (requestId: string) => void;
  // NEW: Super Admin's final action on a tenure extension the admin has
  // already forwarded — this is what actually applies the extension to
  // the bond now.
  superAdminApproveTenureExtension: (requestId: string) => void;
  superAdminRejectTenureExtension: (requestId: string) => void;
  // NEW: replaces the old settleMaturedBond — admin no longer settles a
  // matured bond directly, only forwards it to Super Admin.
  maturitySettlementRequests: MaturitySettlementRequest[];
  requestMaturitySettlement: (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    principal: number;
    totalInterest: number;
    netSettlement: number;
  }) => void;
  superAdminApproveMaturitySettlement: (requestId: string) => void;
  superAdminRejectMaturitySettlement: (requestId: string) => void;
  // NEW: Super Admin's final action on a pre-close request the admin has
  // already forwarded. This is what actually settles the bond now.
  superAdminApprovePreSettlement: (requestId: string) => void;
  superAdminRejectPreSettlement: (requestId: string) => void;
  // NEW: called from ProfileScreen so investor-entered data (both personal
  // info and bank details) lives in shared context/AsyncStorage instead of
  // that screen's own local state, and is therefore visible everywhere else
  // (e.g. the Invest Now bank-details modal) immediately after Save.
  updateInvestorProfile: (investorId: string, params: UpdateInvestorProfileParams) => void;
  updateInvestorBankDetails: (investorId: string, params: UpdateInvestorBankDetailsParams) => void;
updateInvestorBranch: (investorId: string, branch: string) => void; 
  investmentRequests: InvestmentRequest[];
  submitInvestmentRequest: (params: SubmitInvestmentRequestParams) => void;
  updateInvestmentRequestRate: (id: string, rate: number) => void;
  // Accepts an optional rate override so an admin's edited rate is applied
  // atomically with approval instead of relying on two separate state
  // updates racing each other (see BondTrackingScreen for the call site).
  approveInvestmentRequest: (id: string, rateOverride?: number) => void;
  rejectInvestmentRequest: (id: string) => void;

  adminNotifications: SANotification[];
  adminSettings: AdminSettings;
  markAllAdminNotificationsRead: () => void;
  updateAdminSettings: (partial: Partial<AdminSettings>) => void;

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
  // NEW: persists edits made in AdminManagementScreen's Edit Admin modal.
  updateSAAdmin: (id: string, params: UpdateSAAdminParams) => void;
  deleteSAAdmin: (id: string) => void;
  addSystemUser: (params: AddSystemUserParams) => void;
  deleteSystemUser: (id: string) => void;
  updateRolePermissions: (roleName: SystemRole['name'], permissions: Record<PermissionKey, boolean>) => void;
  updateSystemSettings: (partial: Partial<SystemSettings>) => void;
  markAllNotificationsRead: () => void;
  runBackupNow: () => void;

  // Screens can check this to avoid a "No investments yet" flash before the
  // persisted data has finished loading from disk right after app launch.
  isDataHydrated: boolean;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error('useAppData must be used within AppNavigator tree');
  }
  return ctx;
};

// ---------------------------------------------------------------------------
// MOCK / SEED DATA
// These "initial*" arrays are only used the very FIRST time the app runs on
// a device, before anything has been saved to AsyncStorage. On every later
// launch, saved data loaded from AsyncStorage overwrites these (see the
// PERSISTENCE section below and the load effect inside AppNavigator).
// ---------------------------------------------------------------------------

const initialInvestors: Investor[] = [];
const initialBonds: Bond[] = [];
const initialActivities: Activity[] = [];
const initialPayouts: Payout[] = [];
const initialAdminNotifications: SANotification[] = [];

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
    aadhaarNumber: 'XXXX XXXX 4521',
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
    aadhaarNumber: 'XXXX XXXX 7788',
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
    aadhaarNumber: 'XXXX XXXX 3092',
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

const initialInvestmentRequests: InvestmentRequest[] = [];

const initialBranches: Branch[] = [
  {id: 'br1', name: 'Hyderabad', city: 'Hyderabad', adminName: 'Ravi Mehta', investors: 0, aum: '₹0Cr', status: 'Active'},
  {id: 'br2', name: 'Vijayawada', city: 'Vijayawada', adminName: 'Suresh Kumar', investors: 0, aum: '₹0Cr', status: 'Active'},
  {id: 'br3', name: 'Bengaluru', city: 'Bengaluru', adminName: 'Anita Rao', investors: 0, aum: '₹0Cr', status: 'Active'},
  {id: 'br4', name: 'Chennai', city: 'Chennai', adminName: 'Mohan Das', investors: 0, aum: '₹0Cr', status: 'Active'},
];

const initialSAAdmins: SAAdmin[] = [
  {id: 'ad1', name: 'Ravi Mehta', email: 'ravi@inrfs.in', mobile: '+91 98765 43210', branch: 'Mumbai HQ', role: 'Admin', status: 'Active'},
  {id: 'ad2', name: 'Suresh Kumar', email: 'suresh@inrfs.in', mobile: '+91 98765 43211', branch: 'Delhi North', role: 'Admin', status: 'Active'},
  {id: 'ad3', name: 'Anita Rao', email: 'anita@inrfs.in', mobile: '+91 98765 43212', branch: 'Bangalore', role: 'Admin', status: 'Active'},
  {id: 'ad4', name: 'Mohan Das', email: 'mohan@inrfs.in', mobile: '+91 98765 43213', branch: 'Chennai', role: 'Branch Manager', status: 'Active'},
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

// ---------------------------------------------------------------------------
// PERSISTENCE
// ---------------------------------------------------------------------------
const STORAGE_KEY = '@inrfs_app_data_v1';

type PersistedState = {
  investors: Investor[];
  bonds: Bond[];
  activities: Activity[];
  payouts: Payout[];
  investmentRequests: InvestmentRequest[];
  kycRequests: KycRequest[];
  adminNotifications: SANotification[];
  adminSettings: AdminSettings;
  adminProfile: AdminProfile;
  branches: Branch[];
  saAdmins: SAAdmin[];
  systemUsers: SystemUser[];
  systemRoles: SystemRole[];
  auditLogs: AuditLogEntry[];
  saNotifications: SANotification[];
  systemSettings: SystemSettings;
   tenureExtensionRequests: TenureExtensionRequest[];
  preSettlementRequests: PreSettlementRequest[];
  maturitySettlementRequests: MaturitySettlementRequest[];
};
  // preSettlementRequests: PreSettlementRequest[];
// };

const loadAppData = async (): Promise<Partial<PersistedState> | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<PersistedState>) : null;
  } catch (e) {
    console.warn('[AppNavigator] Failed to load persisted app data:', e);
    return null;
  }
};
 
const saveAppData = async (data: PersistedState) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[AppNavigator] Failed to persist app data:', e);
  }
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

const formatINRShort = (n: number) => '₹' + n.toLocaleString('en-IN');

// Bond numbers now match the web reference format (BND-2025-001) instead of
// the old DB-YYYY-#### format.
const nextBondNumber = (existingCount: number, year: number) =>
  `BND-${year}-${String(existingCount + 1).padStart(3, '0')}`;

// Investor IDs generated at registration time, before any admin approval.
const nextInvestorId = (existingCount: number) =>
  `INV-${String(existingCount + 1).padStart(3, '0')}`;

const AppNavigator = () => {
  const [investors, setInvestors] = useState<Investor[]>(initialInvestors);
  const [bonds, setBonds] = useState<Bond[]>(initialBonds);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [adminProfile, setAdminProfileState] = useState<AdminProfile>(defaultAdminProfile);
  const [kycRequests, setKycRequests] = useState<KycRequest[]>(initialKycRequests);
  const [kycStats] = useState<KycStats>(initialKycStats);
  const [investmentRequests, setInvestmentRequests] = useState<InvestmentRequest[]>(initialInvestmentRequests);

  const [adminNotifications, setAdminNotifications] = useState<SANotification[]>(initialAdminNotifications);
  const [adminSettings, setAdminSettingsState] = useState<AdminSettings>(defaultAdminSettings);


  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [saAdmins, setSaAdmins] = useState<SAAdmin[]>(initialSAAdmins);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(initialSystemUsers);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(initialSystemRoles);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [saNotifications, setSaNotifications] = useState<SANotification[]>(initialSANotifications);
  const [systemSettings, setSystemSettingsState] = useState<SystemSettings>(initialSystemSettings);
  const [tenureExtensionRequests, setTenureExtensionRequests] = useState<TenureExtensionRequest[]>([]);

  const [preSettlementRequests, setPreSettlementRequests] = useState<PreSettlementRequest[]>([]);
  const [maturitySettlementRequests, setMaturitySettlementRequests] = useState<MaturitySettlementRequest[]>([]);
  const [isDataHydrated, setIsDataHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadAppData();
      if (saved) {
        if (saved.investors) setInvestors(saved.investors);
        if (saved.bonds) setBonds(saved.bonds);
        if (saved.activities) setActivities(saved.activities);
        if (saved.payouts) setPayouts(saved.payouts);
        if (saved.investmentRequests) setInvestmentRequests(saved.investmentRequests);
        if (saved.kycRequests) setKycRequests(saved.kycRequests);
        if (saved.adminNotifications) setAdminNotifications(saved.adminNotifications);
        if (saved.adminSettings) setAdminSettingsState(saved.adminSettings);
        if (saved.adminProfile) setAdminProfileState(saved.adminProfile);
        if (saved.branches) setBranches(saved.branches);
        if (saved.saAdmins) setSaAdmins(saved.saAdmins);
        if (saved.systemUsers) setSystemUsers(saved.systemUsers);
        if (saved.systemRoles) setSystemRoles(saved.systemRoles);
        if (saved.auditLogs) setAuditLogs(saved.auditLogs);
        if (saved.saNotifications) setSaNotifications(saved.saNotifications);
        if (saved.systemSettings) setSystemSettingsState(saved.systemSettings);
        if (saved.tenureExtensionRequests) setTenureExtensionRequests(saved.tenureExtensionRequests);
        if (saved.preSettlementRequests) setPreSettlementRequests(saved.preSettlementRequests);
          if (saved.maturitySettlementRequests) setMaturitySettlementRequests(saved.maturitySettlementRequests);
      }
      setIsDataHydrated(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDataHydrated) return;
    saveAppData({
      investors,
      bonds,
      activities,
      payouts,
      investmentRequests,
      kycRequests,
      adminNotifications,
      adminSettings,
      adminProfile,
      branches,
      saAdmins,
      systemUsers,
      systemRoles,
      auditLogs,
      saNotifications,
      systemSettings,
            tenureExtensionRequests,
      preSettlementRequests,
       maturitySettlementRequests,
    });
  }, [
    isDataHydrated,
    investors,
    bonds,
    activities,
    payouts,
    investmentRequests,
    kycRequests,
    adminNotifications,
    adminSettings,
    adminProfile,
    branches,
    saAdmins,
    systemUsers,
    systemRoles,
    auditLogs,
    saNotifications,
    systemSettings,
    tenureExtensionRequests,
    preSettlementRequests,
     maturitySettlementRequests,
  ]);

  // ---------------------------------------------------------------------
  // NEW: registerInvestor
  // Called by RegistrationScreen the moment someone submits their signup
  // form. This is the fix for the whole "branch/mobile missing" and
  // "shows INV-XXX instead of name" family of bugs — previously nothing
  // called into shared state at registration time, so the Investor record
  // that later screens read from either didn't exist yet or got created
  // downstream with only an ID standing in for the name.
  // ---------------------------------------------------------------------
  const registerInvestor = (params: RegisterInvestorParams): string => {
    const investorId = nextInvestorId(investors.length);

    const newInvestor: Investor = {
      id: investorId,
      name: params.name,
      email: params.email || `${investorId.toLowerCase()}@email.com`,
      mobile: params.mobile || '—',
      branch: params.branch || '—',
      tier: 'SILVER',
      kycStatus: 'Pending',
      totalInvested: 0,
      status: 'Pending',
      type: params.type ?? 'individual',
      dob: params.dob,
      address: params.address,
      city: params.city,
      state: params.state,
      pincode: params.pincode,
    };

    setInvestors(prev => [newInvestor, ...prev]);

    // Create the matching KYC request so the Aadhaar number and other
    // registration details actually show up on the KYC Approvals screen
    // instead of "Not submitted" / "—".
    setKycRequests(prev => [
      {
        id: `kyc-${investorId}`,
        name: params.name,
        location: params.city && params.state ? `${params.city}, ${params.state}` : '—',
        avatarUri: 'https://i.pravatar.cc/200',
        overallFlag: 'uploading',
        aadhaar: 'Pending',
        aadhaarNumber: params.aadhaar || '—',
        pan: 'Pending',
        bankStmt: 'Pending',
        avgWait: '--:--',
        category: 'pending',
        investorId,
      },
      ...prev,
    ]);

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'New Investor Registration',
        isNew: true,
        message: `${params.name} submitted a registration request${
          params.branch ? ` for ${params.branch}` : ''
        }. Awaiting KYC review.`,
        time: 'Just now',
        icon: 'bell',
      },
      ...prev,
    ]);

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'New Investor Registration',
        subtitle: `${params.name}${params.branch ? ` • ${params.branch}` : ''}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'investor',
      },
      ...prev,
    ]);

    pushAuditLog('System', 'System', `Investor Registered — ${params.name} (${investorId})`);

    return investorId;
  };

  // ---------------------------------------------------------------------
  // NEW: updateInvestorProfile / updateInvestorBankDetails
  // Both are called from ProfileScreen on Save. Writing through context
  // (instead of ProfileScreen's own local useState) means:
  //  - the change is picked up by the AsyncStorage persistence effect above
  //    and survives app restarts, and
  //  - every other screen reading `investors` from useAppData() (e.g. the
  //    Invest Now bank-details modal) sees the updated value on its very
  //    next render — no manual refetch/refresh needed.
  // ---------------------------------------------------------------------
  const updateInvestorProfile = (investorId: string, params: UpdateInvestorProfileParams) => {
    setInvestors(prev =>
      prev.map(inv => (inv.id === investorId ? {...inv, ...params} : inv)),
    );
  };

  const updateInvestorBankDetails = (investorId: string, params: UpdateInvestorBankDetailsParams) => {
    setInvestors(prev =>
      prev.map(inv => (inv.id === investorId ? {...inv, ...params} : inv)),
    );
    const inv = investors.find(i => i.id === investorId);
    pushAuditLog(inv?.name || 'Investor', 'Investor', 'Bank Details Updated');
  };
const updateInvestorBranch = (investorId: string, branch: string) => {
  const inv = investors.find(i => i.id === investorId);
  setInvestors(prev =>
    prev.map(i => (i.id === investorId ? {...i, branch} : i)),
  );
  pushAuditLog('Admin', 'Admin', `Branch Updated — ${inv?.name || investorId} → ${branch}`);
};
  const approveKyc = (id: string) => {
    const req = kycRequests.find(k => k.id === id);
    setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'archive'} : k)));
    if (req?.investorId) {
      setInvestors(prev =>
        prev.map(inv =>
          inv.id === req.investorId ? {...inv, kycStatus: 'Approved', status: 'Active'} : inv,
        ),
      );
    }
  };

const rejectKyc = (id: string) => {
  const req = kycRequests.find(k => k.id === id);
  setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'archive'} : k)));
  if (req?.investorId) {
    setInvestors(prev =>
      prev.map(inv =>
        inv.id === req.investorId ? {...inv, kycStatus: 'Rejected', status: 'Suspended'} : inv,
      ),
    );
    pushAuditLog('Admin', 'Admin', `KYC Rejected — ${req.name}`);
  }
};


  const escalateKyc = (id: string) => {
    setKycRequests(prev => prev.map(k => (k.id === id ? {...k, category: 'flagged'} : k)));
  };

  const approveInvestorKyc = (investorId: string) => {
    setInvestors(prev =>
      prev.map(inv => (inv.id === investorId ? {...inv, kycStatus: 'Approved', status: 'Active'} : inv)),
    );
  };

 const rejectInvestorKyc = (investorId: string) => {
  const inv = investors.find(i => i.id === investorId);
  setInvestors(prev =>
    prev.map(i => (i.id === investorId ? {...i, kycStatus: 'Rejected', status: 'Suspended'} : i)),
  );
  if (inv) {
    pushAuditLog('Admin', 'Admin', `KYC Rejected — ${inv.name}`);
  }
};

  const setAdminProfile = (partial: Partial<AdminProfile>) => {
    setAdminProfileState(prev => ({...prev, ...partial}));
  };

  const createPayoutForBond = (params: {
    bondId: string;
    investorName: string;
    investorType: 'individual' | 'institution';
    amount: number;
    interestRate: number;
    investedDateStr: string;
  }) => {
    const {bondId, investorName, investorType, amount, interestRate, investedDateStr} = params;
    const monthlyInterest = Math.round((amount * (interestRate / 100)) / 12);

    const investedDate = parseDDMMYYYY(investedDateStr);
    const dueDate = new Date(investedDate);
    dueDate.setMonth(dueDate.getMonth() + 1);

    const newPayout: Payout = {
      id: `pay-${Date.now().toString().slice(-6)}-${bondId}`,
      investorName,
      investorType,
      bondId,
      amount: monthlyInterest,
      dueDate: formatDDMMYYYY(dueDate),
      reference: '–',
      status: 'upcoming',
    };

    setPayouts(prev => [newPayout, ...prev]);
  };

  const scheduleNextMonthlyPayout = (paidPayout: Payout) => {
    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);
    const nextPayout: Payout = {
      id: `pay-${Date.now().toString().slice(-6)}-${paidPayout.bondId}`,
      investorName: paidPayout.investorName,
      investorType: paidPayout.investorType,
      bondId: paidPayout.bondId,
      amount: paidPayout.amount,
      dueDate: formatDDMMYYYY(nextDue),
      reference: '–',
      status: 'upcoming',
    };
    setPayouts(prev => [nextPayout, ...prev]);
  };

  const addInvestment = ({
    investorId,
    investorName,
    amount,
    bondSeriesId,
    investorType,
    dob,
    address,
    city,
    state,
    pincode,
    branch,
  }: AddInvestmentParams) => {
    setInvestors(prev => {
      const existing = prev.find(inv => inv.id === investorId);
      if (existing) {
        return prev.map(inv =>
          inv.id === investorId
            ? {
                ...inv,
                totalInvested: inv.totalInvested + amount,
                branch: inv.branch && inv.branch !== '—' ? inv.branch : branch ?? inv.branch,
              }
            : inv,
        );
      }
      return [
        {
          id: investorId,
          name: investorName,
          email: `${investorName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
          mobile: '—',
          branch: branch ?? '—',
          tier: 'SILVER',
          kycStatus: 'Pending',
          totalInvested: amount,
          status: 'Active',
          type: investorType ?? 'individual',
          dob,
          address,
          city,
          state,
          pincode,
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
    seriesId: nextBondNumber(bonds.length, investedDate.getFullYear()),
    investorId: investors.find(inv => inv.name === investorName)?.id || '',
    investorName,
    amount,
      interestRate,
      tenureMonths,
      investedDate: investedDateStr,
      maturityDate: formatDDMMYYYY(maturityDate),
      subscriptionPercent: 100,
      monthsActive: 0,
      status: 'Active',
    };

    setBonds(prev => [newBond, ...prev]);

    createPayoutForBond({
      bondId: newBond.seriesId,
      investorName,
      investorType: 'individual',
      amount,
      interestRate,
      investedDateStr,
    });

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

  // ---------------------------------------------------------------------
  // submitInvestmentRequest
  // FIX: previously this ALWAYS fabricated a new Investor record when no
  // existing investor matched investorId — including when the ID came from
  // a manually-typed demo login. That fabricated record's `name` field
  // ended up being the ID itself (e.g. "INV-567"), which is what created
  // duplicate "ghost" cards on the Investor Registry screen alongside the
  // real, properly-registered investor. Now it doesn't fabricate a record
  // — the investment request itself still carries investorId/investorName
  // and shows up correctly under Admin > Investments either way. A real
  // registered investor's flow is completely unaffected, since `existing`
  // is found and this whole branch is skipped for them.
  // ---------------------------------------------------------------------
  const submitInvestmentRequest = ({
    investorId,
    investorName,
    amount,
    tenureMonths,
    interestRate,
    transactionRef,
    screenshotUri,
    dob,
    address,
    city,
    state,
    pincode,
    branch,
  }: SubmitInvestmentRequestParams) => {
    const newRequest: InvestmentRequest = {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      investorId,
      investorName,
      amount,
      tenureMonths,
      interestRate,
      transactionRef,
      screenshotUri,
      status: 'Pending',
      requestedOn: nowTimestamp(),
      branch,
    };

    setInvestmentRequests(prev => [newRequest, ...prev]);

    setInvestors(prev => {
      const existing = prev.find(inv => inv.id === investorId);
      if (existing) return prev;
      // Demo mode: don't fabricate a Registry entry for an ID that was
      // never actually registered.
      return prev;
    });

    setKycRequests(prev => {
      const alreadyLinked = prev.some(k => k.investorId === investorId);
      if (alreadyLinked) return prev;
      const investorExists = investors.some(inv => inv.id === investorId);
      if (!investorExists) return prev;
      return [
        {
          id: `kyc-${investorId}`,
          name: investorName,
          location: '—',
          avatarUri: 'https://i.pravatar.cc/200',
          overallFlag: 'uploading',
          aadhaar: 'Pending',
          aadhaarNumber: '—',
          pan: 'Pending',
          bankStmt: 'Pending',
          avgWait: '--:--',
          category: 'pending',
          investorId,
        },
        ...prev,
      ];
    });

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'New Investment Request',
        isNew: true,
        message: `${investorName} submitted an investment request of ${formatINRShort(amount)} for ${tenureMonths} months. Awaiting your approval.`,
        time: 'Just now',
        icon: 'money',
      },
      ...prev,
    ]);

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'New Investment Request',
        subtitle: `${investorName} • ${formatINRShort(amount)} • ${tenureMonths} months`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'transaction',
      },
      ...prev,
    ]);
  };

  const updateInvestmentRequestRate = (id: string, rate: number) => {
    setInvestmentRequests(prev => prev.map(r => (r.id === id ? {...r, interestRate: rate} : r)));
  };

  // FIX — RATE-ON-APPROVAL BUG:
  // Previously the screen called updateInvestmentRequestRate(id, rate) and
  // then immediately called approveInvestmentRequest(id) on the next line.
  // Because setState is async, approveInvestmentRequest was still reading
  // the OLD investmentRequests array, so the generated bond (and therefore
  // "All Investments") kept the stale rate. Accepting an explicit
  // rateOverride here lets the rate be applied in one atomic step.
  //
  // FIX — GHOST INVESTOR ON APPROVAL:
  // Same guard as submitInvestmentRequest — don't fabricate a Registry
  // entry when approving a request whose investorId was never actually
  // registered (e.g. a demo login). A real, registered investor's flow
  // (existing found → totalInvested updated, status set Active) is
  // completely unaffected.
  const approveInvestmentRequest = (id: string, rateOverride?: number) => {
    const req = investmentRequests.find(r => r.id === id);
    if (!req || req.status !== 'Pending') return;

    const finalRate =
      rateOverride !== undefined && !Number.isNaN(rateOverride) && rateOverride >= 0
        ? rateOverride
        : req.interestRate;

    const investedDateStr = formatDDMMYYYY(new Date());
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + req.tenureMonths);
    const seriesId = nextBondNumber(bonds.length, new Date().getFullYear());

    // Prefer the name already on file in the investor registry (set at
    // registration) over whatever is stored on the request itself.
    const registeredName = investors.find(inv => inv.id === req.investorId)?.name;

    const newBond: Bond = {
      seriesId,
      investorName: registeredName || req.investorName,
      amount: req.amount,
      investorId: req.investorId,
      interestRate: finalRate,
      tenureMonths: req.tenureMonths,
      investedDate: investedDateStr,
      maturityDate: formatDDMMYYYY(maturityDate),
      subscriptionPercent: 100,
      monthsActive: 0,
      status: 'Active',
    };

    setBonds(prev => [newBond, ...prev]);

    createPayoutForBond({
      bondId: seriesId,
      investorName: newBond.investorName,
      investorType: 'individual',
      amount: req.amount,
      interestRate: finalRate,
      investedDateStr,
    });

    setInvestors(prev => {
      const existing = prev.find(inv => inv.id === req.investorId);
      if (existing) {
        return prev.map(inv =>
          inv.id === req.investorId
            ? {...inv, totalInvested: inv.totalInvested + req.amount, status: 'Active'}
            : inv,
        );
      }
      // Demo mode: don't fabricate a Registry entry for an approval tied
      // to an ID that was never actually registered.
      return prev;
    });

    setKycRequests(prev => {
      const alreadyLinked = prev.some(k => k.investorId === req.investorId);
      if (alreadyLinked) return prev;
      const investorExists = investors.some(inv => inv.id === req.investorId);
      if (!investorExists) return prev;
      return [
        {
          id: `kyc-${req.investorId}`,
          name: req.investorName,
          location: '—',
          avatarUri: 'https://i.pravatar.cc/200',
          overallFlag: 'uploading',
          aadhaar: 'Pending',
          aadhaarNumber: '—',
          pan: 'Pending',
          bankStmt: 'Pending',
          avgWait: '--:--',
          category: 'pending',
          investorId: req.investorId,
        },
        ...prev,
      ];
    });

    setInvestmentRequests(prev =>
      prev.map(r =>
        r.id === id ? {...r, status: 'Approved', bondSeriesId: seriesId, interestRate: finalRate} : r,
      ),
    );

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'Bond Generated',
        subtitle: `${newBond.investorName} • ${seriesId} • ${formatINRShort(req.amount)}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'bond',
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Investment Approved — ${newBond.investorName} (${seriesId})`);
  };

  const rejectInvestmentRequest = (id: string) => {
    const req = investmentRequests.find(r => r.id === id);
    if (!req || req.status !== 'Pending') return;
    setInvestmentRequests(prev => prev.map(r => (r.id === id ? {...r, status: 'Rejected'} : r)));
    pushAuditLog('Admin', 'Admin', `Investment Rejected — ${req.investorName}`);
  };

  const markPayoutPaid = (payoutId: string) => {
    const payout = payouts.find(p => p.id === payoutId);
    setPayouts(prev =>
      prev.map(p =>
        p.id === payoutId && p.status === 'approved'
          ? {...p, status: 'paid', reference: `UTR${Date.now().toString().slice(-6)}`, overdueDays: undefined}
          : p,
      ),
    );
    if (payout && payout.status === 'approved') {
      scheduleNextMonthlyPayout(payout);
    }
  };

  const markAllPayoutsPaid = () => {
    const toRollover = payouts.filter(p => p.status === 'approved');
    setPayouts(prev =>
      prev.map(p =>
        p.status === 'approved'
          ? {...p, status: 'paid', reference: `UTR${Date.now().toString().slice(-6)}${p.id}`, overdueDays: undefined}
          : p,
      ),
    );
    toRollover.forEach(scheduleNextMonthlyPayout);
  };

  const requestPayoutApproval = (payoutId: string) => {
    const payout = payouts.find(p => p.id === payoutId);
    if (!payout || (payout.status !== 'overdue' && payout.status !== 'upcoming' && payout.status !== 'rejected')) return;

    setPayouts(prev =>
      prev.map(p => (p.id === payoutId ? {...p, status: 'pending_approval'} : p)),
    );

    setSaNotifications(prev => [
      {
        id: `sn-${Date.now()}`,
        title: 'Payout Approval Requested',
        isNew: true,
        message: `Monthly interest payment of ${formatINRShort(payout.amount)} for ${payout.investorName} (${payout.bondId}) is due. Please approve to release payment.`,
        time: 'Just now',
        icon: 'money',
        relatedPayoutId: payoutId,
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Payout Approval Requested — ${payout.investorName} (${payout.bondId})`);
  };

  const requestAllPayoutsApproval = () => {
    const eligible = payouts.filter(p => p.status === 'overdue' || p.status === 'upcoming');
    if (eligible.length === 0) return;
    const ids = eligible.map(p => p.id);

    setPayouts(prev =>
      prev.map(p => (ids.includes(p.id) ? {...p, status: 'pending_approval'} : p)),
    );

    setSaNotifications(prev => [
      {
        id: `sn-${Date.now()}`,
        title: 'Bulk Payout Approval Requested',
        isNew: true,
        message: `Admin requested approval to process ${ids.length} pending interest payouts.`,
        time: 'Just now',
        icon: 'money',
        relatedPayoutIds: ids,
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Bulk Payout Approval Requested — ${ids.length} record(s)`);
  };

  const approvePayoutRequest = (notificationId: string) => {
    const note = saNotifications.find(n => n.id === notificationId);
    if (!note) return;
    const ids = note.relatedPayoutIds ?? (note.relatedPayoutId ? [note.relatedPayoutId] : []);
    if (ids.length === 0) return;

    setPayouts(prev => prev.map(p => (ids.includes(p.id) ? {...p, status: 'approved'} : p)));

    setSaNotifications(prev =>
      prev.map(n => (n.id === notificationId ? {...n, isNew: false, payoutActionTaken: 'approved'} : n)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: ids.length > 1 ? 'Bulk Payout Approved' : 'Payout Approved',
        isNew: true,
        message:
          ids.length > 1
            ? `Super Admin approved ${ids.length} pending interest payouts. You can now mark them as paid.`
            : `Super Admin approved the interest payout. You can now mark it as paid.`,
        time: 'Just now',
        icon: 'check',
        relatedPayoutId: note.relatedPayoutId,
        relatedPayoutIds: note.relatedPayoutIds,
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Payout Approval Granted — ${ids.length} record(s)`);
  };

  const rejectPayoutRequest = (notificationId: string) => {
    const note = saNotifications.find(n => n.id === notificationId);
    if (!note) return;
    const ids = note.relatedPayoutIds ?? (note.relatedPayoutId ? [note.relatedPayoutId] : []);
    if (ids.length === 0) return;

    setPayouts(prev => prev.map(p => (ids.includes(p.id) ? {...p, status: 'rejected'} : p)));

    setSaNotifications(prev =>
      prev.map(n => (n.id === notificationId ? {...n, isNew: false, payoutActionTaken: 'rejected'} : n)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: ids.length > 1 ? 'Bulk Payout Rejected' : 'Payout Rejected',
        isNew: true,
        message:
          ids.length > 1
            ? `Super Admin rejected ${ids.length} pending interest payouts. Please review and resend for approval.`
            : `Super Admin rejected the interest payout. Please review and resend for approval.`,
        time: 'Just now',
        icon: 'bell',
        relatedPayoutId: note.relatedPayoutId,
        relatedPayoutIds: note.relatedPayoutIds,
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Payout Approval Rejected — ${ids.length} record(s)`);
  };

  const kycPendingCount = investors.filter(inv => inv.status === 'Pending').length;

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications(prev => prev.map(n => ({...n, isNew: false})));
  };

  const updateAdminSettings = (partial: Partial<AdminSettings>) => {
    setAdminSettingsState(prev => ({...prev, ...partial}));
  };

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

  const addSAAdmin = ({name, email, mobile, branch, role}: AddSAAdminParams) => {
    const newAdmin: SAAdmin = {
      id: `ad-${Date.now()}`,
      name,
      email,
      mobile: mobile && mobile.trim() ? mobile.trim() : '—',
      branch,
      role,
      status: 'Active',
    };
    setSaAdmins(prev => [newAdmin, ...prev]);
    pushAuditLog('Super Admin', 'Super Admin', `${role} Created — ${name}`);
  };

  // NEW: called from AdminManagementScreen's Edit Admin modal so edits
  // (name, email, mobile, branch, role, status) are saved through context
  // and therefore persisted to AsyncStorage — same pattern as
  // updateInvestorProfile above.
  const updateSAAdmin = (id: string, params: UpdateSAAdminParams) => {
    const admin = saAdmins.find(a => a.id === id);
    setSaAdmins(prev => prev.map(a => (a.id === id ? {...a, ...params} : a)));
    if (admin) {
      pushAuditLog('Super Admin', 'Super Admin', `Admin Updated — ${params.name ?? admin.name}`);
    }
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

  // ---------------------------------------------------------------------
  // requestTenureExtension / requestPreSettlement
  // Called by the investor's MyInvestments screen. These now also raise an
  // admin notification, an activity entry, and an audit log entry so the
  // request is actually visible to the admin somewhere (previously these
  // just silently pushed into tenureExtensionRequests/preSettlementRequests
  // with nothing surfacing it anywhere in the admin UI).
  // ---------------------------------------------------------------------
  const requestTenureExtension = (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    currentTenureMonths: number;
    extensionMonths: number;
  }) => {
    const request: TenureExtensionRequest = {
      id: `TEN-${Date.now()}`,
      ...params,
      status: 'Pending',
      requestedOn: nowTimestamp(),
    };

    setTenureExtensionRequests(prev => [request, ...prev]);

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Tenure Extension Request',
        isNew: true,
        message: `${params.investorName} requested to extend ${params.bondSeriesId} by ${params.extensionMonths} months (current tenure ${params.currentTenureMonths}M).`,
        time: 'Just now',
        icon: 'bell',
      },
      ...prev,
    ]);

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'Tenure Extension Requested',
        subtitle: `${params.investorName} • ${params.bondSeriesId} • +${params.extensionMonths} months`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'bond',
      },
      ...prev,
    ]);

    pushAuditLog(
      params.investorName || 'Investor',
      'Investor',
      `Tenure Extension Requested — ${params.bondSeriesId} (+${params.extensionMonths}M)`,
    );
  };

  // NEW: `reason` accepted on the params object and spread straight into
  // the stored PreSettlementRequest (which already declares `reason?:
  // string`) — this is what MyInvestmentsScreen's Pre-Close modal sends,
  // and what SettlementCalculatorScreen reads back on the admin side.
  const requestPreSettlement = (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    principal: number;
    earned: number;
    penalty: number;
    netAmount: number;
    reason?: string;
  }) => {
    const request: PreSettlementRequest = {
      id: `PRE-${Date.now()}`,
      ...params,
      status: 'Pending',
      requestedOn: nowTimestamp(),
    };

    setPreSettlementRequests(prev => [request, ...prev]);

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Pre-Settlement Request',
        isNew: true,
        message: `${params.investorName} requested pre-close on ${params.bondSeriesId}. Net payable ${formatINRShort(params.netAmount)}.`,
        time: 'Just now',
        icon: 'money',
      },
      ...prev,
    ]);

    setActivities(prev => [
      {
        id: `a-${Date.now()}`,
        title: 'Pre-Settlement Requested',
        subtitle: `${params.investorName} • ${params.bondSeriesId} • ${formatINRShort(params.netAmount)}`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        icon: 'transaction',
      },
      ...prev,
    ]);

    pushAuditLog(params.investorName || 'Investor', 'Investor', `Pre-Settlement Requested — ${params.bondSeriesId}`);
  };

  // ---------------------------------------------------------------------
  // NEW: approveTenureExtension
  // Called from BondTrackingScreen's "Renew / Increase Tenure" modal. Takes
  // the bond series id directly (not just a request id) so it also works
  // for a manual renewal the admin initiates with no investor request
  // behind it — linkedRequestId is optional and only gets marked Approved
  // when there actually is a matching pending investor request.
  // ---------------------------------------------------------------------
// CHANGED: Admin "approving" a tenure extension in the Tenure modal no
  // longer applies it to the bond directly. It now forwards the
  // (possibly admin-adjusted) months/rate to the Super Admin for final
  // approval — mirrors the pre-close flow. The bond's tenure, maturity
  // date, and rate stay unchanged until superAdminApproveTenureExtension
  // runs.
  const approveTenureExtension = (
    bondSeriesId: string,
    extensionMonths: number,
    newRate?: number,
    linkedRequestId?: string,
  ) => {
    const bond = bonds.find(b => b.seriesId === bondSeriesId);

    if (linkedRequestId) {
      setTenureExtensionRequests(prev =>
        prev.map(r =>
          r.id === linkedRequestId
            ? {...r, extensionMonths, decidedRate: newRate, status: 'PendingSuperAdmin'}
            : r,
        ),
      );

      setSaNotifications(prev => [
        {
          id: `sn-${Date.now()}`,
          title: 'Tenure Extension Requested',
          isNew: true,
          message: `Admin approved a ${extensionMonths}-month extension on ${bondSeriesId}${
            bond ? ` for ${bond.investorName}` : ''
          }. Please review and approve.`,
          time: 'Just now',
          icon: 'bond',
        },
        ...prev,
      ]);

      pushAuditLog('Admin', 'Admin', `Tenure Extension Approved — sent to Super Admin — ${bondSeriesId}`);
      return;
    }

    // Manual renewal with no investor request behind it — not currently
    // reachable from the UI (Tenure button is only enabled when a request
    // exists), kept as a safe fallback that applies immediately.
    setBonds(prev =>
      prev.map(b => {
        if (b.seriesId !== bondSeriesId) return b;
        const maturity = parseDDMMYYYY(b.maturityDate);
        maturity.setMonth(maturity.getMonth() + extensionMonths);
        return {
          ...b,
          tenureMonths: (b.tenureMonths ?? 0) + extensionMonths,
          maturityDate: formatDDMMYYYY(maturity),
          interestRate:
            newRate !== undefined && !Number.isNaN(newRate) ? newRate : b.interestRate,
        };
      }),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Tenure Extension Approved',
        isNew: true,
        message: `${bondSeriesId} extended by ${extensionMonths} months${
          bond ? ` for ${bond.investorName}` : ''
        }.`,
        time: 'Just now',
        icon: 'check',
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Tenure Extension Approved — ${bondSeriesId} (+${extensionMonths}M)`);
  };

  // NEW: Super Admin's final settlement action for a forwarded tenure
  // extension — this now does what approveTenureExtension used to do:
  // actually extends the bond's tenure, maturity date, and rate.
  const superAdminApproveTenureExtension = (requestId: string) => {
    const req = tenureExtensionRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setBonds(prev =>
      prev.map(b => {
        if (b.seriesId !== req.bondSeriesId) return b;
        const maturity = parseDDMMYYYY(b.maturityDate);
        maturity.setMonth(maturity.getMonth() + req.extensionMonths);
        return {
          ...b,
          tenureMonths: (b.tenureMonths ?? 0) + req.extensionMonths,
          maturityDate: formatDDMMYYYY(maturity),
          interestRate:
            req.decidedRate !== undefined && !Number.isNaN(req.decidedRate)
              ? req.decidedRate
              : b.interestRate,
        };
      }),
    );

    setTenureExtensionRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Approved'} : r)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Tenure Extension Finalized',
        isNew: true,
        message: `${req.bondSeriesId} extended by ${req.extensionMonths} months for ${req.investorName}.`,
        time: 'Just now',
        icon: 'check',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Tenure Extension Finalized — ${req.bondSeriesId} (+${req.extensionMonths}M)`);
  };

  const superAdminRejectTenureExtension = (requestId: string) => {
    const req = tenureExtensionRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setTenureExtensionRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Rejected'} : r)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Tenure Extension Rejected by Super Admin',
        isNew: true,
        message: `${req.bondSeriesId} tenure extension request was rejected by Super Admin.`,
        time: 'Just now',
        icon: 'bell',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Tenure Extension Rejected — ${req.bondSeriesId}`);
  };

  const rejectTenureExtension = (requestId: string) => {
    const req = tenureExtensionRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'Pending') return;
    setTenureExtensionRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Rejected'} : r)),
    );
    pushAuditLog('Admin', 'Admin', `Tenure Extension Rejected — ${req.bondSeriesId}`);
  };

  // ---------------------------------------------------------------------
  // NEW: approvePreSettlement / rejectPreSettlement
  // Unlike tenure extension, principal/penalty/net were fixed by the
  // investor's original request, so there's nothing for the admin to edit
  // — approving here settles the bond directly.
  // ---------------------------------------------------------------------
 // CHANGED: Admin "approving" a pre-close request no longer settles the
  // bond. It now forwards the request to the Super Admin for final
  // settlement — mirrors the existing monthly-payout admin -> super admin
  // flow (requestPayoutApproval). The bond stays 'Active' until
  // superAdminApprovePreSettlement runs.
  const approvePreSettlement = (requestId: string) => {
    const req = preSettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'Pending') return;

    setPreSettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'PendingSuperAdmin'} : r)),
    );

    setSaNotifications(prev => [
      {
        id: `sn-${Date.now()}`,
        title: 'Pre-Close Settlement Requested',
        isNew: true,
        message: `Admin approved pre-close on ${req.bondSeriesId} for ${req.investorName}. Net payable ${formatINRShort(req.netAmount)}. Please review and settle.`,
        time: 'Just now',
        icon: 'money',
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Pre-Settlement Approved — sent to Super Admin — ${req.bondSeriesId}`);
  };

  // NEW: Super Admin's final settlement action. This now does what
  // approvePreSettlement used to do — settle the bond — but only once the
  // admin has already forwarded it (status 'PendingSuperAdmin').
  const superAdminApprovePreSettlement = (requestId: string) => {
    const req = preSettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setPreSettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Approved'} : r)),
    );
    setBonds(prev =>
      prev.map(b => (b.seriesId === req.bondSeriesId ? {...b, status: 'Settled'} : b)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Pre-Settlement Paid',
        isNew: true,
        message: `${req.bondSeriesId} settled for ${req.investorName}. Net paid ${formatINRShort(req.netAmount)}.`,
        time: 'Just now',
        icon: 'check',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Pre-Settlement Paid — ${req.bondSeriesId}`);
  };

  const superAdminRejectPreSettlement = (requestId: string) => {
    const req = preSettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setPreSettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Rejected'} : r)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Pre-Close Rejected by Super Admin',
        isNew: true,
        message: `${req.bondSeriesId} pre-close request was rejected by Super Admin.`,
        time: 'Just now',
        icon: 'bell',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Pre-Settlement Rejected — ${req.bondSeriesId}`);
  };
const rejectPreSettlement = (requestId: string) => {
    const req = preSettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'Pending') return;
    setPreSettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Rejected'} : r)),
    );
    pushAuditLog('Admin', 'Admin', `Pre-Settlement Rejected — ${req.bondSeriesId}`);
  };
  // ---------------------------------------------------------------------
  // NEW: settleMaturedBond
  // Called from SettlementCalculatorScreen's "Tenure Timeout" tab when the
  // admin approves settlement for a bond that simply reached its maturity
  // date — no investor pre-close request behind it. Marks the bond
  // 'Settled' directly, mirroring what approvePreSettlement already does
  // for the pre-close path, so both roads into "settled" converge on the
  // same bond state (which is what BondTrackingScreen's `isMatured` /
  // Tenure-button-hiding logic keys off of).
  // ---------------------------------------------------------------------
// CHANGED: Admin approving a matured bond in the "Tenure Timeout" tab
  // no longer settles it directly. It now forwards it to the Super
  // Admin's "Tenure Settlement" queue for final approval — mirrors the
  // pre-close flow. The bond stays 'Active' until
  // superAdminApproveMaturitySettlement runs.
  const requestMaturitySettlement = (params: {
    bondSeriesId: string;
    investorId: string;
    investorName: string;
    principal: number;
    totalInterest: number;
    netSettlement: number;
  }) => {
    const already = maturitySettlementRequests.some(
      r => r.bondSeriesId === params.bondSeriesId && r.status === 'PendingSuperAdmin',
    );
    if (already) return;

    const request: MaturitySettlementRequest = {
      id: `MAT-${Date.now()}`,
      ...params,
      status: 'PendingSuperAdmin',
      requestedOn: nowTimestamp(),
    };

    setMaturitySettlementRequests(prev => [request, ...prev]);

    setSaNotifications(prev => [
      {
        id: `sn-${Date.now()}`,
        title: 'Bond Maturity Settlement Requested',
        isNew: true,
        message: `Admin approved settlement for matured bond ${params.bondSeriesId} (${params.investorName}). Net payable ${formatINRShort(params.netSettlement)}. Please review.`,
        time: 'Just now',
        icon: 'money',
      },
      ...prev,
    ]);

    pushAuditLog('Admin', 'Admin', `Bond Settlement Approved — sent to Super Admin — ${params.bondSeriesId}`);
  };

  const superAdminApproveMaturitySettlement = (requestId: string) => {
    const req = maturitySettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setBonds(prev =>
      prev.map(b => (b.seriesId === req.bondSeriesId ? {...b, status: 'Settled'} : b)),
    );

    setMaturitySettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Approved'} : r)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Bond Settled',
        isNew: true,
        message: `${req.bondSeriesId} matured and has been settled for ${req.investorName}. Net paid ${formatINRShort(req.netSettlement)}.`,
        time: 'Just now',
        icon: 'check',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Bond Settlement Paid — ${req.bondSeriesId}`);
  };

  const superAdminRejectMaturitySettlement = (requestId: string) => {
    const req = maturitySettlementRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'PendingSuperAdmin') return;

    setMaturitySettlementRequests(prev =>
      prev.map(r => (r.id === requestId ? {...r, status: 'Rejected'} : r)),
    );

    setAdminNotifications(prev => [
      {
        id: `an-${Date.now()}`,
        title: 'Bond Settlement Rejected by Super Admin',
        isNew: true,
        message: `${req.bondSeriesId} settlement request was rejected by Super Admin.`,
        time: 'Just now',
        icon: 'bell',
      },
      ...prev,
    ]);

    pushAuditLog('Super Admin', 'Super Admin', `Bond Settlement Rejected — ${req.bondSeriesId}`);
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

    registerInvestor,
    addInvestment,
    addBond,

    markPayoutPaid,
    markAllPayoutsPaid,
    requestPayoutApproval,
    requestAllPayoutsApproval,
    approvePayoutRequest,
    rejectPayoutRequest,

    setAdminProfile,

    approveKyc,
    rejectKyc,
    escalateKyc,
    approveInvestorKyc,
    rejectInvestorKyc,

    tenureExtensionRequests,
    preSettlementRequests,
    requestTenureExtension,
    requestPreSettlement,
    approveTenureExtension,
    rejectTenureExtension,
   approvePreSettlement,
    rejectPreSettlement,
    superAdminApprovePreSettlement,
    superAdminRejectPreSettlement,
    superAdminApproveTenureExtension,
    superAdminRejectTenureExtension,
    maturitySettlementRequests,
    requestMaturitySettlement,
    superAdminApproveMaturitySettlement,
    superAdminRejectMaturitySettlement,
    // settleMaturedBond,

    updateInvestorProfile,
    updateInvestorBankDetails,
updateInvestorBranch,
    investmentRequests,
    submitInvestmentRequest,
    updateInvestmentRequestRate,
    approveInvestmentRequest,
    rejectInvestmentRequest,

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
    updateSAAdmin,
    deleteSAAdmin,

    addSystemUser,
    deleteSystemUser,

    updateRolePermissions,
    updateSystemSettings,
    markAllNotificationsRead,
    runBackupNow,

    isDataHydrated,
  }}
>
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
            {/* <Stack.Screen name="InvestorSettings" component={InvestorSettingsScreen} /> */}
   
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
            {/* <Stack.Screen name="AdminInvestments" component={AdminInvestmentsScreen} /> */}
            
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminDashboardScreen} />
            <Stack.Screen name="BranchManagement" component={BranchManagementScreen} />
            <Stack.Screen name="AdminManagement" component={AdminManagementScreen} />
            <Stack.Screen name="UserManagement" component={UserManagementScreen} />
            <Stack.Screen name="RolesPermissions" component={RolesPermissionsScreen} />
            <Stack.Screen name="AuditLogs" component={AuditLogsScreen} />
            <Stack.Screen name="SuperAdminReports" component={SuperAdminReportsScreen} />
            <Stack.Screen name="SystemSettings" component={SystemSettingsScreen} />
           <Stack.Screen name="Notifications" component={PaymentQueueScreen} />
            <Stack.Screen name="SuperAdminProfile" component={SuperAdminProfileScreen} />
            <Stack.Screen name="InvestorManagement" component={InvestorManagementScreen} />
<Stack.Screen name="InvestmentManagement" component={InvestmentManagementScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppDataContext.Provider>
    </SafeAreaProvider>
  );
};

export default AppNavigator;