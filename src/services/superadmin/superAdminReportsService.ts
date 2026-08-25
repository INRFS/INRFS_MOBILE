import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAuthToken, getErrorMessage} from './superAdminDashboardService';

const API_BASE_URL = 'http://187.52.115.32:8000';

/* ============================================================
   TYPES & INTERFACES (Matching Web SuperAdmin Reports)
   ============================================================ */

export interface ReportQueryParams {
  search?: string;
  branch_id?: number | string;
  admin_id?: number | string;
  status_id?: number | string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export interface ReportFilterOption {
  id: number | string;
  name: string;
}

export interface ReportFiltersResponse {
  branches: ReportFilterOption[];
  admins: ReportFilterOption[];
  statuses: ReportFilterOption[];
}

export interface InvestmentReportItem {
  id: string | number;
  investment_id: string;
  investor_id: string;
  investor_name: string;
  investor_email: string;
  investor_mobile: string;
  branch_id: string | number;
  branch_name: string;
  admin_id: string | number;
  admin_name: string;
  superadmin_id: string | number;
  superadmin_name: string;
  investment_amount: number;
  interest_rate: number;
  expected_interest_amount: number;
  maturity_amount: number;
  status_id: string | number;
  status_name: string;
  investment_date: string;
  maturity_date: string;
  tenure_months: number;
  approved_date: string;
  raw?: any;
}

export interface InvestorReportItem {
  id: string | number;
  investor_id: string;
  name: string;
  email: string;
  mobile: string;
  branch_id: string | number;
  branch_name: string;
  investment_count: number;
  total_invested: number;
  total_interest: number;
  status: string;
  created_date: string;
  raw?: any;
}

export interface AdminReportItem {
  id: string | number;
  admin_id: string;
  name: string;
  email: string;
  mobile: string;
  branch_id: string | number;
  branch_name: string;
  investor_count: number;
  investment_count: number;
  total_aum: number;
  status: string;
  raw?: any;
}

export interface SettlementReportItem {
  id: string | number;
  settlement_id: string;
  investment_id: string;
  investor_name: string;
  investor_id: string;
  settlement_type: string;
  principal_amount: number;
  interest_amount: number;
  penalty_amount: number;
  net_settlement_amount: number;
  status: string;
  requested_date: string;
  settled_date: string;
  branch_name: string;
  raw?: any;
}

export interface ExtensionReportItem {
  id: string | number;
  extension_id: string;
  investment_id: string;
  investor_name: string;
  investor_id: string;
  previous_tenure_months: number;
  extended_months: number;
  new_tenure_months: number;
  status: string;
  requested_date: string;
  approved_date: string;
  branch_name: string;
  raw?: any;
}

export interface BranchGroupedReportItem {
  branch_id: string | number;
  branch_name: string;
  investor_count: number;
  investment_count: number;
  principal_amount: number;
  expected_interest: number;
  maturity_amount: number;
}

export interface MonthlyGroupedReportItem {
  month: string;
  investor_count: number;
  investment_count: number;
  principal_amount: number;
  expected_interest: number;
  maturity_amount: number;
}

/* ============================================================
   API HELPER
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
    } else if (responseBody?.error) {
      errorMessage =
        typeof responseBody.error === 'string'
          ? responseBody.error
          : JSON.stringify(responseBody.error);
    }

    throw new Error(errorMessage);
  }

  return responseBody;
};

const buildQueryString = (params?: ReportQueryParams): string => {
  if (!params) return '';
  const query = new URLSearchParams();

  if (params.search?.trim()) query.append('search', params.search.trim());
  if (params.branch_id !== undefined && params.branch_id !== '' && params.branch_id !== 'all') {
    query.append('branch_id', String(params.branch_id));
  }
  if (params.admin_id !== undefined && params.admin_id !== '' && params.admin_id !== 'all') {
    query.append('admin_id', String(params.admin_id));
  }
  if (params.status_id !== undefined && params.status_id !== '' && params.status_id !== 'all') {
    query.append('status_id', String(params.status_id));
  }
  if (params.from_date?.trim()) query.append('from_date', params.from_date.trim());
  if (params.to_date?.trim()) query.append('to_date', params.to_date.trim());

  query.append('limit', String(params.limit ?? 500));
  query.append('offset', String(params.offset ?? 0));

  const str = query.toString();
  return str ? `?${str}` : '';
};

const extractList = (res: any): any[] => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.records)) return res.records;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res.investments)) return res.investments;
  if (Array.isArray(res.investors)) return res.investors;
  if (Array.isArray(res.admins)) return res.admins;
  if (Array.isArray(res.settlements)) return res.settlements;
  if (Array.isArray(res.extensions)) return res.extensions;
  return [];
};

/* ============================================================
   SUPER ADMIN REPORTS SERVICE
   ============================================================ */

/**
 * 1. GET /api/superadmin/reports/filters
 */
export const getReportFilters = async (): Promise<ReportFiltersResponse> => {
  let response: any = null;
  try {
    response = await apiRequest('/api/superadmin/reports/filters');
  } catch {
    try {
      response = await apiRequest('/superadmin/reports/filters');
    } catch {
      return {branches: [], admins: [], statuses: []};
    }
  }

  const data = response?.data || response || {};

  const branches = extractList(data.branches).map((b: any) => ({
    id: b.id ?? b.branch_id ?? '',
    name: b.name ?? b.branch_name ?? b.branch ?? String(b),
  }));

  const admins = extractList(data.admins).map((a: any) => ({
    id: a.id ?? a.admin_id ?? '',
    name: a.name ?? a.admin_name ?? a.full_name ?? String(a),
  }));

  const statuses = extractList(data.statuses).map((s: any) => ({
    id: s.id ?? s.status_id ?? '',
    name: s.name ?? s.status_name ?? s.status ?? String(s),
  }));

  return {branches, admins, statuses};
};

/**
 * 2. GET /api/superadmin/reports/investments
 */
export const getInvestmentReports = async (
  params?: ReportQueryParams,
): Promise<{records: InvestmentReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/investments${qs}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/investments${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/investments${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: InvestmentReportItem[] = rawList.map((row: any) => ({
    id: row.investment_id ?? row.investment_code ?? row.id ?? '',
    investment_id: String(row.investment_id ?? row.investment_code ?? row.id ?? ''),
    investor_id: String(row.investor_id ?? row.investor_registration_id ?? ''),
    investor_name: String(row.investor_name ?? row.investor ?? row.full_name ?? '—'),
    investor_email: String(row.investor_email ?? row.email ?? '—'),
    investor_mobile: String(row.investor_mobile ?? row.mobile ?? '—'),
    branch_id: row.branch_id ?? '',
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    admin_id: row.admin_id ?? '',
    admin_name: String(row.admin_name ?? row.admin ?? '—'),
    superadmin_id: row.superadmin_id ?? '',
    superadmin_name: String(row.superadmin_name ?? row.super_admin_name ?? '—'),
    investment_amount: Number(row.investment_amount ?? row.amount ?? 0),
    interest_rate: Number(row.interest_rate ?? row.rate ?? 0),
    expected_interest_amount: Number(row.expected_interest_amount ?? row.expected_interest ?? 0),
    maturity_amount: Number(row.maturity_amount ?? 0),
    status_id: row.status_id ?? row.investment_status_id ?? '',
    status_name: String(row.status_name ?? row.status ?? row.investment_status ?? 'Unknown'),
    investment_date: String(row.investment_date ?? ''),
    maturity_date: String(row.maturity_date ?? ''),
    tenure_months: Number(row.tenure_months ?? 0),
    approved_date: String(row.approved_date ?? ''),
    raw: row,
  }));

  return {records, total};
};

/**
 * 3. GET /api/superadmin/reports/investments/{investmentId}
 */
export const getInvestmentReportDetails = async (
  investmentId: string | number,
): Promise<InvestmentReportItem | null> => {
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/investments/${encodeURIComponent(investmentId)}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/investments/${encodeURIComponent(investmentId)}`);
    } catch {
      response = await apiRequest(`/superadmin/investments/${encodeURIComponent(investmentId)}`);
    }
  }

  const row = response?.data || response;
  if (!row) return null;

  return {
    id: row.investment_id ?? row.investment_code ?? row.id ?? '',
    investment_id: String(row.investment_id ?? row.investment_code ?? row.id ?? ''),
    investor_id: String(row.investor_id ?? row.investor_registration_id ?? ''),
    investor_name: String(row.investor_name ?? row.investor ?? row.full_name ?? '—'),
    investor_email: String(row.investor_email ?? row.email ?? '—'),
    investor_mobile: String(row.investor_mobile ?? row.mobile ?? '—'),
    branch_id: row.branch_id ?? '',
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    admin_id: row.admin_id ?? '',
    admin_name: String(row.admin_name ?? row.admin ?? '—'),
    superadmin_id: row.superadmin_id ?? '',
    superadmin_name: String(row.superadmin_name ?? row.super_admin_name ?? '—'),
    investment_amount: Number(row.investment_amount ?? row.amount ?? 0),
    interest_rate: Number(row.interest_rate ?? row.rate ?? 0),
    expected_interest_amount: Number(row.expected_interest_amount ?? row.expected_interest ?? 0),
    maturity_amount: Number(row.maturity_amount ?? 0),
    status_id: row.status_id ?? row.investment_status_id ?? '',
    status_name: String(row.status_name ?? row.status ?? row.investment_status ?? 'Unknown'),
    investment_date: String(row.investment_date ?? ''),
    maturity_date: String(row.maturity_date ?? ''),
    tenure_months: Number(row.tenure_months ?? 0),
    approved_date: String(row.approved_date ?? ''),
    raw: row,
  };
};

/**
 * 4. GET /api/superadmin/reports/investors
 */
export const getInvestorReports = async (
  params?: ReportQueryParams,
): Promise<{records: InvestorReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/investors${qs}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/investors${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/investors${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: InvestorReportItem[] = rawList.map((row: any) => ({
    id: row.id ?? row.investor_id ?? '',
    investor_id: String(row.investor_id ?? row.investor_code ?? row.id ?? ''),
    name: String(row.name ?? row.investor_name ?? row.full_name ?? '—'),
    email: String(row.email ?? '—'),
    mobile: String(row.mobile ?? row.phone ?? '—'),
    branch_id: row.branch_id ?? '',
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    investment_count: Number(row.investment_count ?? row.total_investments ?? row.investments ?? 0),
    total_invested: Number(row.total_invested ?? row.total_amount ?? row.amount ?? 0),
    total_interest: Number(row.total_interest ?? row.interest_earned ?? 0),
    status: String(row.status ?? row.kyc_status ?? 'Active'),
    created_date: String(row.created_date ?? row.registration_date ?? row.created_at ?? ''),
    raw: row,
  }));

  return {records, total};
};

/**
 * 5. GET /api/superadmin/reports/admins
 */
export const getAdminReports = async (
  params?: ReportQueryParams,
): Promise<{records: AdminReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/admins${qs}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/admins${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/admins${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: AdminReportItem[] = rawList.map((row: any) => ({
    id: row.id ?? row.admin_id ?? '',
    admin_id: String(row.admin_id ?? row.admin_code ?? row.id ?? ''),
    name: String(row.name ?? row.admin_name ?? row.full_name ?? '—'),
    email: String(row.email ?? '—'),
    mobile: String(row.mobile ?? row.phone ?? '—'),
    branch_id: row.branch_id ?? '',
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    investor_count: Number(row.investor_count ?? row.total_investors ?? 0),
    investment_count: Number(row.investment_count ?? row.total_investments ?? 0),
    total_aum: Number(row.total_aum ?? row.total_invested ?? row.aum ?? 0),
    status: String(row.status ?? 'Active'),
    raw: row,
  }));

  return {records, total};
};

/**
 * 6. GET /api/superadmin/reports/settlements
 */
export const getSettlementReports = async (
  params?: ReportQueryParams,
): Promise<{records: SettlementReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/settlements${qs}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/settlements${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/settlements/preclose${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: SettlementReportItem[] = rawList.map((row: any) => ({
    id: row.id ?? row.settlement_id ?? row.request_id ?? '',
    settlement_id: String(row.settlement_id ?? row.id ?? ''),
    investment_id: String(row.investment_id ?? row.investment_code ?? ''),
    investor_name: String(row.investor_name ?? row.investor ?? '—'),
    investor_id: String(row.investor_id ?? ''),
    settlement_type: String(row.settlement_type ?? row.type ?? 'Pre-Close'),
    principal_amount: Number(row.principal_amount ?? row.investment_amount ?? row.principal ?? 0),
    interest_amount: Number(row.interest_amount ?? row.interest ?? 0),
    penalty_amount: Number(row.penalty_amount ?? row.penalty ?? 0),
    net_settlement_amount: Number(row.net_settlement_amount ?? row.net_amount ?? row.settlement_amount ?? 0),
    status: String(row.status ?? row.request_status ?? 'Pending'),
    requested_date: String(row.requested_date ?? row.created_date ?? ''),
    settled_date: String(row.settled_date ?? row.approved_date ?? ''),
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    raw: row,
  }));

  return {records, total};
};

/**
 * 7. GET /api/superadmin/reports/extensions
 */
export const getExtensionReports = async (
  params?: ReportQueryParams,
): Promise<{records: ExtensionReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/reports/extensions${qs}`);
  } catch {
    try {
      response = await apiRequest(`/superadmin/reports/extensions${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/settlements/extensions${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: ExtensionReportItem[] = rawList.map((row: any) => ({
    id: row.id ?? row.extension_id ?? row.request_id ?? '',
    extension_id: String(row.extension_id ?? row.id ?? ''),
    investment_id: String(row.investment_id ?? row.investment_code ?? ''),
    investor_name: String(row.investor_name ?? row.investor ?? '—'),
    investor_id: String(row.investor_id ?? ''),
    previous_tenure_months: Number(row.previous_tenure_months ?? row.current_tenure_months ?? row.tenure_months ?? 0),
    extended_months: Number(row.extended_months ?? row.extension_months ?? 0),
    new_tenure_months: Number(row.new_tenure_months ?? row.final_tenure_months ?? 0),
    status: String(row.status ?? row.request_status ?? 'Pending'),
    requested_date: String(row.requested_date ?? row.created_date ?? ''),
    approved_date: String(row.approved_date ?? ''),
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    raw: row,
  }));

  return {records, total};
};

/* ============================================================
   DERIVED REPORT HELPERS (Matching Web Calculation Logic)
   ============================================================ */

/**
 * Maturity report: Investments with valid maturity dates sorted chronologically
 */
export const deriveMaturityReports = (investments: InvestmentReportItem[]): InvestmentReportItem[] => {
  return investments
    .filter(row => Boolean(row.maturity_date && row.maturity_date !== '—'))
    .sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime());
};

/**
 * Interest report: Investments sorted by expected interest descending
 */
export const deriveInterestReports = (investments: InvestmentReportItem[]): InvestmentReportItem[] => {
  return [...investments].sort((a, b) => b.expected_interest_amount - a.expected_interest_amount);
};

/**
 * Branch report: Grouped investments by branch
 */
export const deriveBranchReports = (investments: InvestmentReportItem[]): BranchGroupedReportItem[] => {
  const map = new Map<string, {
    branch_id: string | number;
    branch_name: string;
    investor_ids: Set<string>;
    investment_count: number;
    principal_amount: number;
    expected_interest: number;
    maturity_amount: number;
  }>();

  investments.forEach(inv => {
    const key = String(inv.branch_name || inv.branch_id || 'Unknown');
    if (!map.has(key)) {
      map.set(key, {
        branch_id: inv.branch_id || key,
        branch_name: inv.branch_name || key,
        investor_ids: new Set<string>(),
        investment_count: 0,
        principal_amount: 0,
        expected_interest: 0,
        maturity_amount: 0,
      });
    }

    const item = map.get(key)!;
    if (inv.investor_id) item.investor_ids.add(inv.investor_id);
    item.investment_count += 1;
    item.principal_amount += inv.investment_amount;
    item.expected_interest += inv.expected_interest_amount;
    item.maturity_amount += inv.maturity_amount;
  });

  return Array.from(map.values()).map(b => ({
    branch_id: b.branch_id,
    branch_name: b.branch_name,
    investor_count: b.investor_ids.size,
    investment_count: b.investment_count,
    principal_amount: b.principal_amount,
    expected_interest: b.expected_interest,
    maturity_amount: b.maturity_amount,
  }));
};

/**
 * Monthly report: Grouped investments by YYYY-MM
 */
export const deriveMonthlyReports = (investments: InvestmentReportItem[]): MonthlyGroupedReportItem[] => {
  const map = new Map<string, {
    month: string;
    investor_ids: Set<string>;
    investment_count: number;
    principal_amount: number;
    expected_interest: number;
    maturity_amount: number;
  }>();

  investments.forEach(inv => {
    let month = 'Unknown';
    if (inv.investment_date) {
      try {
        const dt = new Date(inv.investment_date);
        if (!isNaN(dt.getTime())) {
          month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        }
      } catch {}
    }

    if (!map.has(month)) {
      map.set(month, {
        month,
        investor_ids: new Set<string>(),
        investment_count: 0,
        principal_amount: 0,
        expected_interest: 0,
        maturity_amount: 0,
      });
    }

    const item = map.get(month)!;
    if (inv.investor_id) item.investor_ids.add(inv.investor_id);
    item.investment_count += 1;
    item.principal_amount += inv.investment_amount;
    item.expected_interest += inv.expected_interest_amount;
    item.maturity_amount += inv.maturity_amount;
  });

  return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month)).map(m => ({
    month: m.month,
    investor_count: m.investor_ids.size,
    investment_count: m.investment_count,
    principal_amount: m.principal_amount,
    expected_interest: m.expected_interest,
    maturity_amount: m.maturity_amount,
  }));
};
