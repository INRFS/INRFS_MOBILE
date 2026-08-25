import AsyncStorage from '@react-native-async-storage/async-storage';

/* ============================================================
   CONFIG & AUTH
   ============================================================ */

const API_BASE_URL = 'http://187.52.115.32:8000';

const AUTH_TOKEN_KEYS = [
  'SUPERADMIN_ACCESS_TOKEN',
  'superadmin_token',
  'access_token',
  'accessToken',
  'token',
  'authToken',
  'auth_token',
  'jwt',
];

export const getAuthToken = async (): Promise<string | null> => {
  try {
    for (const key of AUTH_TOKEN_KEYS) {
      const val = await AsyncStorage.getItem(key);
      if (val) {
        return val.replace(/^Bearer\s+/i, '').trim();
      }
    }
    return null;
  } catch (error) {
    console.log('Error reading token from AsyncStorage:', error);
    return null;
  }
};

export const getErrorMessage = (error: any): string => {
  if (!error) return 'Operation failed.';
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }
  if (error.response) {
    const res = error.response;
    if (typeof res === 'string') return res;
    if (typeof res.detail === 'string') return res.detail;
    if (Array.isArray(res.detail)) {
      return res.detail
        .map((d: any) =>
          typeof d === 'string' ? d : d.msg || d.message || JSON.stringify(d),
        )
        .join(', ');
    }
    if (typeof res.message === 'string') return res.message;
    if (typeof res.error === 'string') return res.error;
  }
  return 'Operation failed. Please try again.';
};

/* ============================================================
   TYPES & INTERFACES
   ============================================================ */

export interface DashboardSummary {
  totalBranches: number;
  totalAdmins: number;
  activeAdmins: number;
  totalInvestors: number;
  systemAum: number;
  investorGrowthPercentage: number;
  monthlyGrowthPercentage: number;
  totalInvestments: number;
}

export interface MonthlyPerformanceItem {
  month: string;
  count: number;
  amount: number;
  interestAmount: number;
}

export interface InvestorGrowthItem {
  month: string;
  count: number;
}

export interface InvestmentStatusItem {
  statusId: number | string;
  statusName: string;
  percentage: number;
  count: number;
}

export interface BranchPerformanceItem {
  branchName: string;
  investorCount: number;
}

export interface SuperAdminDashboardData {
  summary: DashboardSummary;
  investmentPerformance: MonthlyPerformanceItem[];
  investorGrowth: InvestorGrowthItem[];
  investmentStatus: InvestmentStatusItem[];
  branchPerformance: BranchPerformanceItem[];
  raw: any;
}

export interface RecentAdmin {
  id: string | number;
  name: string;
  email: string;
  mobile: string;
  branchName: string;
  role: string;
  status: string;
  createdDate: string;
  raw: any;
}

export interface RecentInvestor {
  id: string | number;
  investorId: string;
  name: string;
  email: string;
  mobile: string;
  branchName: string;
  status: string;
  createdDate: string;
  raw: any;
}

/* ============================================================
   VALUE EXTRACTION HELPER
   ============================================================ */

const getValue = (obj: any, keys: string[], fallback: any = 0) => {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
      return obj[k];
    }
  }
  return fallback;
};

const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.results)) return response.results;
  return [];
};

/* ============================================================
   CORE API REQUEST HELPER
   ============================================================ */

const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<any> => {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  let responseBody: any = null;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    if (typeof responseBody === 'string') {
      errorMessage = responseBody;
    } else if (responseBody?.detail) {
      if (typeof responseBody.detail === 'string') {
        errorMessage = responseBody.detail;
      } else if (Array.isArray(responseBody.detail)) {
        errorMessage = responseBody.detail
          .map((d: any) =>
            typeof d === 'string' ? d : d.msg || d.message || JSON.stringify(d),
          )
          .join(', ');
      } else if (typeof responseBody.detail === 'object') {
        errorMessage =
          responseBody.detail.message ||
          responseBody.detail.error ||
          JSON.stringify(responseBody.detail);
      }
    } else if (responseBody?.message) {
      errorMessage =
        typeof responseBody.message === 'string'
          ? responseBody.message
          : JSON.stringify(responseBody.message);
    }

    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = responseBody;

    throw error;
  }

  return responseBody;
};

/* ============================================================
   FORMATTING UTILITIES
   ============================================================ */

export const formatIndianNumber = (val: number | string): string => {
  const n = Math.round(Number(val) || 0);
  return n.toLocaleString('en-IN');
};

export const formatCurrencyAUM = (amount: number | string): string => {
  const n = Number(amount) || 0;
  if (n >= 10000000) {
    return `₹${(n / 10000000).toFixed(2)}Cr`;
  }
  if (n >= 100000) {
    return `₹${(n / 100000).toFixed(2)}L`;
  }
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

export const formatSuperAdminDate = (dateStr?: string): string => {
  if (!dateStr || dateStr === '—' || dateStr === '-') return '—';
  try {
    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      return `${day} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
    }
  } catch {}
  return dateStr;
};

/* ============================================================
   DATA NORMALIZERS
   ============================================================ */

export const normalizeSuperAdminDashboard = (raw: any): SuperAdminDashboardData => {
  const data = raw?.data || raw || {};
  const summaryObj = data?.summary || data || {};

  const summary: DashboardSummary = {
    totalBranches: Number(getValue(summaryObj, ['o_total_branches', 'total_branches', 'branch_count', 'branches'], 0)),
    totalAdmins: Number(getValue(summaryObj, ['o_total_admins', 'total_admins', 'admin_count', 'admins'], 0)),
    activeAdmins: Number(getValue(summaryObj, ['o_active_admins', 'active_admins', 'active_admin_count'], 0)),
    totalInvestors: Number(getValue(summaryObj, ['o_total_investors', 'total_investors', 'investor_count', 'investors'], 0)),
    systemAum: Number(getValue(summaryObj, ['o_system_aum', 'system_aum', 'total_aum', 'aum'], 0)),
    investorGrowthPercentage: Number(getValue(summaryObj, ['o_growth_percentage', 'growth_percentage', 'growth', 'growth_percent'], 0)),
    monthlyGrowthPercentage: Number(getValue(summaryObj, ['o_monthly_growth', 'monthly_growth', 'growth_percentage', 'growth_percent'], 0)),
    totalInvestments: Number(getValue(summaryObj, ['total_investments', 'investment_count', 'investments'], 0)),
  };

  const perfList = getList(data?.investment_performance || data?.investmentPerformance || data?.monthly_trend || []);
  const investmentPerformance: MonthlyPerformanceItem[] = perfList.map((p: any) => ({
    month: String(getValue(p, ['o_month', 'month_name', 'month', 'label'], '')),
    count: Number(getValue(p, ['o_investment_count', 'investment_count', 'investments', 'count'], 0)),
    amount: Number(getValue(p, ['o_investment_amount', 'investment_amount', 'amount', 'total_amount', 'total_investment'], 0)),
    interestAmount: Number(getValue(p, ['o_interest_amount', 'interest_amount', 'interest', 'total_interest'], 0)),
  }));

  const growthList = getList(data?.investor_growth || data?.investorGrowth || []);
  const investorGrowth: InvestorGrowthItem[] = growthList.map((g: any) => ({
    month: String(getValue(g, ['o_month', 'month_name', 'month', 'label'], '')),
    count: Number(getValue(g, ['o_investor_count', 'investor_count', 'investors', 'count', 'total_investors'], 0)),
  }));

  const statusList = getList(data?.investment_status || data?.investmentStatus || []);
  const investmentStatus: InvestmentStatusItem[] = statusList.map((s: any) => ({
    statusId: getValue(s, ['o_status_id', 'status_id', 'id'], 0),
    statusName: String(getValue(s, ['o_status_name', 'status_name', 'name', 'label', 'investment_status'], '')),
    percentage: Number(getValue(s, ['o_percentage', 'percentage', 'percent', 'value'], 0)),
    count: Number(getValue(s, ['o_investment_count', 'investment_count', 'count'], 0)),
  }));

  const branchList = getList(data?.branch_performance || data?.branchPerformance || []);
  const branchPerformance: BranchPerformanceItem[] = branchList.map((b: any) => ({
    branchName: String(getValue(b, ['o_branch_name', 'branch_name', 'name', 'branch'], '')),
    investorCount: Number(getValue(b, ['o_investor_count', 'investor_count', 'investors', 'total_investors', 'count'], 0)),
  }));

  return {
    summary,
    investmentPerformance,
    investorGrowth,
    investmentStatus,
    branchPerformance,
    raw,
  };
};

/* ============================================================
   SUPER ADMIN SERVICES
   ============================================================ */

/**
 * 1. GET /superadmin/dashboard
 */
export const getSuperAdminDashboard = async (): Promise<SuperAdminDashboardData> => {
  const response = await apiRequest('/superadmin/dashboard', {
    method: 'GET',
  });
  return normalizeSuperAdminDashboard(response);
};

/**
 * 2. GET /superadmin/admins?limit=5&offset=0
 */
export const getRecentAdmins = async (limit = 5): Promise<RecentAdmin[]> => {
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/admins?limit=${limit}&offset=0`, {
      method: 'GET',
    });
  } catch (err) {
    console.log('getRecentAdmins error note:', err);
    return [];
  }

  const rawList = getList(response);
  return rawList.map((item: any) => {
    const name = String(
      getValue(item, ['full_name', 'fullName', 'name', 'username', 'admin_name'], '—'),
    );
    const branchName = String(
      getValue(item, ['branch_name', 'branchName', 'branch'], '—'),
    );
    const email = String(getValue(item, ['email'], '—'));
    const mobile = String(getValue(item, ['mobile', 'phone'], '—'));
    const role = String(getValue(item, ['role', 'role_name'], 'Admin'));
    const status = String(getValue(item, ['status', 'is_active', 'status_name'], 'Active'));
    const createdDate = String(getValue(item, ['created_date', 'created_at', 'createdAt'], '—'));
    const id = getValue(item, ['admin_id', 'id', 'user_id'], '—');

    return {
      id,
      name,
      email,
      mobile,
      branchName,
      role,
      status: typeof status === 'boolean' ? (status ? 'Active' : 'Inactive') : status,
      createdDate,
      raw: item,
    };
  });
};

/**
 * 3. GET /superadmin/investors?limit=5&offset=0
 */
export const getRecentInvestors = async (limit = 5): Promise<RecentInvestor[]> => {
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/investors?limit=${limit}&offset=0`, {
      method: 'GET',
    });
  } catch (err) {
    console.log('getRecentInvestors note:', err);
    try {
      response = await apiRequest(`/superadmin/investor-management?limit=${limit}&offset=0`, {
        method: 'GET',
      });
    } catch {}
  }

  const rawList = getList(response);
  return rawList.map((item: any) => {
    const name = String(
      getValue(item, ['investor_name', 'investorName', 'full_name', 'fullName', 'name'], '—'),
    );
    const investorId = String(
      getValue(item, ['investor_id', 'investorId', 'investor_registration_id', 'id'], '—'),
    );
    const branchName = String(
      getValue(item, ['branch_name', 'branchName', 'branch'], '—'),
    );
    const email = String(getValue(item, ['email'], '—'));
    const mobile = String(getValue(item, ['mobile', 'phone'], '—'));
    const status = String(getValue(item, ['status', 'kyc_status', 'status_name'], 'Active'));
    const createdDate = String(getValue(item, ['created_date', 'registration_date', 'created_at'], '—'));
    const id = getValue(item, ['id', 'investor_id'], '—');

    return {
      id,
      investorId,
      name,
      email,
      mobile,
      branchName,
      status,
      createdDate,
      raw: item,
    };
  });
};
