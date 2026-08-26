import {getAuthToken} from './superAdminDashboardService';
import {ENV} from '../../config/env';

const API_BASE_URL = ENV.API_BASE_URL || 'http://187.52.115.32:8000';

/* ============================================================
   TYPES & INTERFACES (Matching Swagger Super Admin Reports)
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
  city?: string;
}

export interface ReportFiltersResponse {
  branches: ReportFilterOption[];
  admins: ReportFilterOption[];
  statuses: ReportFilterOption[];
}

export interface InvestmentReportItem {
  id: string | number;
  investment_id: string;
  investor_registration_id?: string | number;
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
  remarks?: string;
  raw?: any;
}

export interface InvestorReportItem {
  id: string | number;
  investor_registration_id?: string | number;
  investor_id: string;
  name: string;
  email: string;
  mobile: string;
  branch_id: string | number;
  branch_name: string;
  investment_count: number;
  principal_amount: number;
  total_invested: number;
  expected_interest: number;
  total_interest: number;
  maturity_amount: number;
  pending_count: number;
  active_count: number;
  settled_count: number;
  rejected_count: number;
  status: string;
  created_date: string;
  raw?: any;
}

export interface AdminReportItem {
  id?: string | number;
  admin_id?: string | number;
  admin_name: string;
  name?: string;
  email?: string;
  mobile?: string;
  branch_id?: string | number;
  branch_name?: string;
  investor_count: number;
  investment_count: number;
  principal_amount: number;
  total_aum?: number;
  expected_interest: number;
  maturity_amount: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  settled_count: number;
  status?: string;
  raw?: any;
}

export interface SettlementReportItem {
  id: string | number;
  settlement_id: string;
  investment_id: string;
  investor_name: string;
  investor_id: string;
  investor_email: string;
  settlement_type: string;
  settlement_type_name: string;
  settlement_amount: number;
  principal_amount: number;
  net_settlement_amount: number;
  interest_amount: number;
  penalty_amount: number;
  status: string;
  status_id?: number | string;
  requested_date: string;
  settled_date: string;
  branch_name: string;
  branch_id?: number | string;
  admin_name: string;
  remarks: string;
  raw?: any;
}

export interface ExtensionReportItem {
  id: string | number;
  extension_id: string;
  request_id: string | number;
  investment_id: string;
  bond_id: string;
  investor_name: string;
  investor_id: string;
  requested_extension: string;
  extended_months: number;
  current_maturity_date: string;
  current_interest_rate: number;
  previous_tenure_months: number;
  new_tenure_months: number;
  status: string;
  requested_date: string;
  submitted_date: string;
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

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

  const response = await fetch(fullUrl, {
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
    let errorMessage = `Request to ${cleanEndpoint} failed with status ${response.status}`;

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

    const err = new Error(errorMessage);
    (err as any).status = response.status;
    (err as any).data = responseBody;
    (err as any).endpoint = cleanEndpoint;
    throw err;
  }

  return responseBody;
};

/**
 * Build sanitized query string ensuring FastAPI numeric constraints
 */
const buildQueryString = (params?: ReportQueryParams): string => {
  if (!params) return '';
  const query = new URLSearchParams();

  if (params.search && typeof params.search === 'string' && params.search.trim()) {
    query.append('search', params.search.trim());
  }

  // Only pass integer values for branch_id, admin_id, status_id (never 'all' or non-numeric)
  if (
    params.branch_id !== undefined &&
    params.branch_id !== null &&
    params.branch_id !== '' &&
    params.branch_id !== 'all' &&
    !isNaN(Number(params.branch_id))
  ) {
    query.append('branch_id', String(Number(params.branch_id)));
  }

  if (
    params.admin_id !== undefined &&
    params.admin_id !== null &&
    params.admin_id !== '' &&
    params.admin_id !== 'all' &&
    !isNaN(Number(params.admin_id))
  ) {
    query.append('admin_id', String(Number(params.admin_id)));
  }

  if (
    params.status_id !== undefined &&
    params.status_id !== null &&
    params.status_id !== '' &&
    params.status_id !== 'all' &&
    !isNaN(Number(params.status_id))
  ) {
    query.append('status_id', String(Number(params.status_id)));
  }

  if (params.from_date && typeof params.from_date === 'string' && params.from_date.trim()) {
    query.append('from_date', params.from_date.trim());
  }

  if (params.to_date && typeof params.to_date === 'string' && params.to_date.trim()) {
    query.append('to_date', params.to_date.trim());
  }

  if (params.limit !== undefined && !isNaN(Number(params.limit))) {
    query.append('limit', String(Number(params.limit)));
  } else {
    query.append('limit', '500');
  }

  if (params.offset !== undefined && !isNaN(Number(params.offset))) {
    query.append('offset', String(Number(params.offset)));
  }

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

const normalizeInvestmentItem = (row: any): InvestmentReportItem => {
  const investmentId = String(row.investment_id ?? row.investment_code ?? row.bond_id ?? row.id ?? '');
  const amount = Number(row.investment_amount ?? row.amount ?? row.principal_amount ?? 0);
  const rate = Number(row.interest_rate ?? row.rate ?? 0);
  const expectedInterest = Number(row.expected_interest_amount ?? row.expected_interest ?? row.interest ?? 0);
  const maturityAmount = Number(row.maturity_amount ?? (amount + expectedInterest));

  return {
    id: row.id ?? investmentId,
    investment_id: investmentId,
    investor_registration_id: row.investor_registration_id ?? '',
    investor_id: String(row.investor_id ?? row.investor_code ?? row.investor_registration_id ?? '—'),
    investor_name: String(row.investor_name ?? row.investor ?? row.full_name ?? '—'),
    investor_email: String(row.investor_email ?? row.email ?? '—'),
    investor_mobile: String(row.investor_mobile ?? row.mobile ?? row.phone ?? '—'),
    branch_id: row.branch_id ?? '',
    branch_name: String(row.branch_name ?? row.branch ?? '—'),
    admin_id: row.admin_id ?? '',
    admin_name: String(row.admin_name ?? row.admin ?? '—'),
    superadmin_id: row.superadmin_id ?? '',
    superadmin_name: String(row.superadmin_name ?? row.super_admin_name ?? '—'),
    investment_amount: amount,
    interest_rate: rate,
    expected_interest_amount: expectedInterest,
    maturity_amount: maturityAmount,
    status_id: row.status_id ?? row.investment_status_id ?? '',
    status_name: String(row.status_name ?? row.status ?? row.investment_status ?? 'Active'),
    investment_date: String(row.investment_date ?? row.created_date ?? ''),
    maturity_date: String(row.maturity_date ?? ''),
    tenure_months: Number(row.tenure_months ?? 0),
    approved_date: String(row.approved_date ?? ''),
    remarks: row.remarks ? String(row.remarks) : undefined,
    raw: row,
  };
};

/* ============================================================
   SUPER ADMIN REPORTS SERVICE
   ============================================================ */

/**
 * 1. GET /superadmin/reports/filters
 */
export const getReportFilters = async (): Promise<ReportFiltersResponse> => {
  let response: any = null;
  try {
    response = await apiRequest('/superadmin/reports/filters');
  } catch {
    try {
      response = await apiRequest('/api/superadmin/reports/filters');
    } catch (err) {
      console.warn('Error fetching report filters:', err);
      return {branches: [], admins: [], statuses: []};
    }
  }

  const data = response?.data || response || {};
  const rawBranches = extractList(data.branches || response?.branches);
  const rawAdmins = extractList(data.admins || response?.admins);
  const rawStatuses = extractList(data.statuses || response?.statuses);

  const branches: ReportFilterOption[] = rawBranches.map((b: any) => ({
    id: b.id ?? b.branch_id ?? '',
    name: String(b.branch_name ?? b.name ?? b.branch ?? String(b)),
    city: b.city_name ?? b.city ?? undefined,
  }));

  const admins: ReportFilterOption[] = rawAdmins.map((a: any) => ({
    id: a.id ?? a.admin_id ?? '',
    name: String(a.full_name ?? a.admin_name ?? a.name ?? String(a)),
    city: a.branch_name ?? undefined,
  }));

  const statuses: ReportFilterOption[] = rawStatuses.map((s: any) => ({
    id: s.id ?? s.status_id ?? '',
    name: String(s.status_name ?? s.name ?? s.status ?? String(s)),
  }));

  return {branches, admins, statuses};
};

/**
 * 2. GET /superadmin/reports/investments
 */
export const getInvestmentReports = async (
  params?: ReportQueryParams,
): Promise<{records: InvestmentReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/investments${qs}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/investments${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/investments${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);
  const records = rawList.map(normalizeInvestmentItem);

  return {records, total};
};

/**
 * 3. GET /superadmin/reports/investments/{investment_id}
 * IMPORTANT: Passes the alphanumeric string identifier (e.g. 'INV000048'), NOT numeric id
 */
export const getInvestmentReportDetails = async (
  investmentId: string | number,
): Promise<InvestmentReportItem | null> => {
  const cleanId = String(investmentId || '').trim();
  if (!cleanId) return null;

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/investments/${encodeURIComponent(cleanId)}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/investments/${encodeURIComponent(cleanId)}`);
    } catch {
      try {
        response = await apiRequest(`/superadmin/investments/${encodeURIComponent(cleanId)}`);
      } catch (err) {
        console.warn('Failed to load investment details for:', cleanId, err);
        return null;
      }
    }
  }

  const row = response?.data || response;
  if (!row || typeof row !== 'object' || row.detail) return null;

  return normalizeInvestmentItem(row);
};

/**
 * 4. GET /superadmin/reports/investors
 */
export const getInvestorReports = async (
  params?: ReportQueryParams,
): Promise<{records: InvestorReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/investors${qs}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/investors${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/investors${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: InvestorReportItem[] = rawList.map((row: any) => {
    const principal = Number(row.principal_amount ?? row.total_invested ?? row.total_amount ?? row.amount ?? 0);
    const interest = Number(row.expected_interest ?? row.total_interest ?? row.interest_earned ?? 0);
    const maturity = Number(row.maturity_amount ?? (principal + interest));

    return {
      id: row.investor_registration_id ?? row.id ?? row.investor_id ?? '',
      investor_registration_id: row.investor_registration_id ?? row.id ?? '',
      investor_id: String(row.investor_id ?? row.investor_code ?? row.id ?? '—'),
      name: String(row.investor_name ?? row.name ?? row.full_name ?? '—'),
      email: String(row.investor_email ?? row.email ?? '—'),
      mobile: String(row.investor_mobile ?? row.mobile ?? row.phone ?? '—'),
      branch_id: row.branch_id ?? '',
      branch_name: String(row.branch_name ?? row.branch ?? '—'),
      investment_count: Number(row.investment_count ?? row.total_investments ?? row.investments ?? 0),
      principal_amount: principal,
      total_invested: principal,
      expected_interest: interest,
      total_interest: interest,
      maturity_amount: maturity,
      pending_count: Number(row.pending_count ?? 0),
      active_count: Number(row.active_count ?? 0),
      settled_count: Number(row.settled_count ?? 0),
      rejected_count: Number(row.rejected_count ?? 0),
      status: String(row.status ?? (row.active_count > 0 ? 'Active' : 'Registered')),
      created_date: String(row.created_date ?? row.registration_date ?? row.created_at ?? ''),
      raw: row,
    };
  });

  return {records, total};
};

/**
 * 5. GET /superadmin/reports/admins
 */
export const getAdminReports = async (
  params?: ReportQueryParams,
): Promise<{records: AdminReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/admins${qs}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/admins${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/admins${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: AdminReportItem[] = rawList.map((row: any) => {
    const principalAmount = Number(
      row.principal_amount ??
      row.total_aum ??
      0
    );

    const expectedInterest = Number(
      row.expected_interest ??
      0
    );

    const principal = Number.isFinite(principalAmount) ? principalAmount : 0;
    const interest = Number.isFinite(expectedInterest) ? expectedInterest : 0;
    const maturityAmount = Number(row.maturity_amount);
    const maturity = Number.isFinite(maturityAmount)
      ? maturityAmount
      : (principal + interest);

    const adminName = String(row.admin_name ?? row.name ?? row.full_name ?? '—');
    const adminEmail = String(row.admin_email ?? row.email ?? '—');
    const adminMobile = String(row.admin_mobile ?? row.mobile ?? row.phone ?? '—');

    return {
      ...row,
      id: row.id ?? row.admin_id ?? '',
      admin_id: String(row.admin_id ?? row.admin_code ?? row.id ?? '—'),
      admin_name: adminName,
      name: adminName,
      email: adminEmail,
      mobile: adminMobile,
      branch_id: row.branch_id ?? '',
      branch_name: String(row.branch_name ?? row.branch ?? '—'),
      investor_count: Number(row.investor_count ?? row.total_investors ?? 0),
      investment_count: Number(row.investment_count ?? row.total_investments ?? 0),
      principal_amount: principal,
      total_aum: principal,
      expected_interest: interest,
      maturity_amount: maturity,
      pending_count: Number(row.pending_count ?? 0),
      approved_count: Number(row.approved_count ?? 0),
      rejected_count: Number(row.rejected_count ?? 0),
      settled_count: Number(row.settled_count ?? 0),
      status: String(row.status ?? 'Active'),
      raw: row,
    };
  });

  return {records, total};
};

/**
 * 6. GET /superadmin/reports/settlements
 */
export const getSettlementReports = async (
  params?: ReportQueryParams,
): Promise<{records: SettlementReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/settlements${qs}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/settlements${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/settlements/preclose${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: SettlementReportItem[] = rawList.map((row: any) => {
    const amount = Number(row.settlement_amount ?? row.net_settlement_amount ?? row.net_amount ?? row.principal_amount ?? row.principal ?? 0);
    const type = String(row.settlement_type ?? (row.settlement_type_name?.toLowerCase().includes('pre') ? 'PRECLOSE' : 'MATURITY'));
    const typeName = String(row.settlement_type_name ?? (type === 'PRECLOSE' ? 'Pre-Close Settlement' : 'Maturity Settlement'));

    return {
      id: row.id ?? row.settlement_id ?? row.request_id ?? '',
      settlement_id: String(row.settlement_id ?? row.id ?? '—'),
      investment_id: String(row.investment_id ?? row.investment_code ?? row.bond_id ?? '—'),
      investor_name: String(row.investor_name ?? row.investor ?? '—'),
      investor_id: String(row.investor_id ?? '—'),
      investor_email: String(row.investor_email ?? row.email ?? '—'),
      settlement_type: type,
      settlement_type_name: typeName,
      settlement_amount: amount,
      principal_amount: amount,
      net_settlement_amount: amount,
      interest_amount: Number(row.interest_amount ?? 0),
      penalty_amount: Number(row.penalty_amount ?? 0),
      status: String(row.status_name ?? row.status ?? row.request_status ?? 'Pending'),
      status_id: row.status_id ?? '',
      requested_date: String(row.requested_date ?? row.created_date ?? ''),
      settled_date: String(row.settled_date ?? row.approved_date ?? ''),
      branch_name: String(row.branch_name ?? row.branch ?? '—'),
      branch_id: row.branch_id ?? '',
      admin_name: String(row.admin_name ?? row.admin ?? '—'),
      remarks: String(row.remarks ?? ''),
      raw: row,
    };
  });

  return {records, total};
};

/**
 * 7. GET /superadmin/reports/extensions
 */
export const getExtensionReports = async (
  params?: ReportQueryParams,
): Promise<{records: ExtensionReportItem[]; total: number}> => {
  const qs = buildQueryString(params);
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/reports/extensions${qs}`);
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/reports/extensions${qs}`);
    } catch {
      response = await apiRequest(`/superadmin/settlements/extensions${qs}`);
    }
  }

  const rawList = extractList(response);
  const total = Number(response?.total ?? rawList.length);

  const records: ExtensionReportItem[] = rawList.map((row: any) => {
    let extMonths = Number(row.extended_months ?? row.extension_months ?? 0);
    const reqExtStr = String(row.requested_extension ?? '');
    if (!extMonths && reqExtStr) {
      const match = reqExtStr.match(/\d+/);
      if (match) extMonths = parseInt(match[0], 10);
    }

    const prevTenure = Number(row.previous_tenure_months ?? row.current_tenure_months ?? row.tenure_months ?? 0);
    const newTenure = Number(row.new_tenure_months ?? (prevTenure + extMonths));

    return {
      id: row.id ?? row.extension_id ?? row.request_id ?? '',
      extension_id: String(row.extension_id ?? row.request_id ?? row.id ?? '—'),
      request_id: row.request_id ?? row.id ?? '—',
      investment_id: String(row.bond_id ?? row.investment_id ?? row.investment_code ?? '—'),
      bond_id: String(row.bond_id ?? row.investment_id ?? '—'),
      investor_name: String(row.investor_name ?? row.investor ?? '—'),
      investor_id: String(row.investor_id ?? '—'),
      requested_extension: reqExtStr || `+${extMonths} months`,
      extended_months: extMonths,
      current_maturity_date: String(row.current_maturity_date ?? ''),
      current_interest_rate: Number(row.current_interest_rate ?? 0),
      previous_tenure_months: prevTenure,
      new_tenure_months: newTenure,
      status: String(row.request_status ?? row.status ?? 'Pending'),
      requested_date: String(row.submitted_date ?? row.requested_date ?? row.created_date ?? ''),
      submitted_date: String(row.submitted_date ?? row.requested_date ?? row.created_date ?? ''),
      approved_date: String(row.approved_date ?? ''),
      branch_name: String(row.branch_name ?? row.branch ?? '—'),
      raw: row,
    };
  });

  return {records, total};
};

/* ============================================================
   DERIVED REPORT HELPERS (Strict Business & Math Logic)
   ============================================================ */

/**
 * Maturity report: Investments sorted chronologically ascending by maturity_date
 */
export const deriveMaturityReports = (investments: InvestmentReportItem[]): InvestmentReportItem[] => {
  return investments
    .filter(row => Boolean(row.maturity_date && row.maturity_date !== '—' && !isNaN(new Date(row.maturity_date).getTime())))
    .sort((a, b) => new Date(a.maturity_date).getTime() - new Date(b.maturity_date).getTime());
};

/**
 * Interest report: Investments sorted by expected interest descending
 */
export const deriveInterestReports = (investments: InvestmentReportItem[]): InvestmentReportItem[] => {
  return [...investments].sort(
    (a, b) => (b.expected_interest_amount || 0) - (a.expected_interest_amount || 0),
  );
};

/**
 * Branch report: Grouped investments by branch using unique investor ID sets
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
    const branchName = inv.branch_name && inv.branch_name !== '—' ? inv.branch_name : 'Unassigned Branch';
    const key = String(branchName);
    if (!map.has(key)) {
      map.set(key, {
        branch_id: inv.branch_id || key,
        branch_name: branchName,
        investor_ids: new Set<string>(),
        investment_count: 0,
        principal_amount: 0,
        expected_interest: 0,
        maturity_amount: 0,
      });
    }

    const item = map.get(key)!;
    if (inv.investor_id && inv.investor_id !== '—') {
      item.investor_ids.add(inv.investor_id);
    }
    item.investment_count += 1;
    item.principal_amount += Number(inv.investment_amount) || 0;
    item.expected_interest += Number(inv.expected_interest_amount) || 0;
    item.maturity_amount += Number(inv.maturity_amount) || (Number(inv.investment_amount) + Number(inv.expected_interest_amount)) || 0;
  });

  return Array.from(map.values())
    .sort((a, b) => b.principal_amount - a.principal_amount)
    .map(b => ({
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
 * Monthly report: Grouped investments by YYYY-MM sorted chronologically ascending
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
    let month = '';
    if (inv.investment_date) {
      try {
        const dt = new Date(inv.investment_date);
        if (!isNaN(dt.getTime())) {
          month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        }
      } catch {}
    }
    if (!month) month = 'Other';

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
    if (inv.investor_id && inv.investor_id !== '—') {
      item.investor_ids.add(inv.investor_id);
    }
    item.investment_count += 1;
    item.principal_amount += Number(inv.investment_amount) || 0;
    item.expected_interest += Number(inv.expected_interest_amount) || 0;
    item.maturity_amount += Number(inv.maturity_amount) || (Number(inv.investment_amount) + Number(inv.expected_interest_amount)) || 0;
  });

  return Array.from(map.values())
    .filter(m => m.month !== 'Other')
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: m.month,
      investor_count: m.investor_ids.size,
      investment_count: m.investment_count,
      principal_amount: m.principal_amount,
      expected_interest: m.expected_interest,
      maturity_amount: m.maturity_amount,
    }));
};
