import {getAuthToken, getErrorMessage} from './superAdminDashboardService';
import {ENV} from '../../config/env';

const API_BASE_URL = ENV.API_BASE_URL || 'https://investor.inrfs.com/api';

export interface SuperAdminInvestmentRecord {
  id: number | string;
  investmentId: string;
  bondId: string;
  investorName: string;
  investorId: string;
  branchName: string;
  branchId?: number | null;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  investmentDate: string;
  maturityDate: string;
  status: string;
  monthlyInterest: number;
  raw: any;
}

export interface SuperAdminInvestmentSummary {
  totalInvestments: number;
  totalInvestors?: number;
  activeInvestments: number;
  pendingApproval: number;
  matured: number;
  totalInvested: number;
}

export interface InvestmentFilterOption {
  id: number;
  name: string;
}

const resolveEndpoint = (endpoint: string): string => {
  const base = (ENV.API_BASE_URL || 'https://investor.inrfs.com/api').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  if (!base.endsWith('/api') && !cleanEndpoint.startsWith('/api/')) {
    return `${base}/api${cleanEndpoint}`;
  }
  return `${base}${cleanEndpoint}`;
};

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

  const url = resolveEndpoint(endpoint);
  const response = await fetch(url, {
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

    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = responseBody;

    throw error;
  }

  return responseBody;
};

const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.records)) return response.records;
  if (Array.isArray(response.results)) return response.results;
  return [];
};

const getValue = (obj: any, keys: string[], fallback: any = '—') => {
  if (!obj || typeof obj !== 'object') return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') {
      return obj[k];
    }
  }
  return fallback;
};

export const normalizeInvestment = (item: any): SuperAdminInvestmentRecord => {
  const id = getValue(item, ['investment_id', 'id', 'investmentId', 'o_investment_id'], '—');
  const investmentId = String(getValue(item, ['investment_id', 'investmentId', 'id', 'o_investment_id'], '—'));
  const bondId = String(getValue(item, ['bond_number', 'bond_id', 'bondId', 'bond_no', 'o_bond_number'], '—'));
  const investorName = String(
    getValue(
      item,
      ['investor_name', 'investorName', 'full_name', 'fullName', 'name', 'investor', 'o_investor_name'],
      'Investor',
    ),
  );
  const investorId = String(
    getValue(item, ['investor_id', 'investorId', 'investor_registration_id', 'o_investor_id'], '—'),
  );
  const branchName = String(getValue(item, ['branch_name', 'branchName', 'branch', 'o_branch_name'], '—'));
  const branchId = item.branch_id !== undefined ? Number(item.branch_id) : null;
  const amount = Number(getValue(item, ['investment_amount', 'amount', 'principal_amount', 'o_investment_amount'], 0));
  const interestRate = Number(getValue(item, ['interest_rate', 'interestRate', 'rate', 'o_interest_rate'], 0));
  const tenureMonths = Number(getValue(item, ['tenure_months', 'tenureMonths', 'tenure', 'o_tenure_months'], 0));
  const investmentDate = String(getValue(item, ['investment_date', 'investmentDate', 'invested_on', 'investedOn', 'o_investment_date', 'created_at'], '—'));
  const maturityDate = String(getValue(item, ['maturity_date', 'maturityDate', 'matures_on', 'maturesOn', 'o_maturity_date'], '—'));
  const status = String(getValue(item, ['status', 'investment_status', 'status_name', 'o_status_name'], 'Active'));

  const rawMonthly = getValue(item, ['monthly_interest', 'monthlyInterest', 'monthlyInt', 'monthly_return', 'o_monthly_interest'], null);
  const monthlyInterest = rawMonthly !== null && rawMonthly !== undefined
    ? Number(rawMonthly)
    : (amount > 0 && interestRate > 0 ? (amount * (interestRate / 100)) / 12 : 0);

  return {
    id,
    investmentId,
    bondId,
    investorName,
    investorId,
    branchName,
    branchId,
    amount,
    interestRate,
    tenureMonths,
    investmentDate,
    maturityDate,
    status,
    monthlyInterest,
    raw: item,
  };
};

const normalizeNumber = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return '';
  }
  return String(Math.trunc(number));
};

/**
 * 1. GET /api/superadmin/investments
 */
export const getSuperAdminInvestments = async (params?: {
  search?: string;
  branch_id?: number | string;
  branchId?: number | string;
  status_id?: number | string;
  statusId?: number | string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminInvestmentRecord[]; total: number; summary?: SuperAdminInvestmentSummary}> => {
  const queryParts: string[] = [];

  const safeLimit = Math.min(Math.max(Number(params?.limit) || 100, 1), 100);
  const safeOffset = Math.max(Number(params?.offset) || 0, 0);

  queryParts.push(`limit=${safeLimit}`);
  queryParts.push(`offset=${safeOffset}`);

  const rawBranch = params?.branch_id ?? params?.branchId;
  const safeBranchId = normalizeNumber(rawBranch);
  if (safeBranchId) {
    queryParts.push(`branch_id=${safeBranchId}`);
  }

  const rawStatus = params?.status_id ?? params?.statusId;
  const safeStatusId = normalizeNumber(rawStatus);
  if (safeStatusId) {
    queryParts.push(`status_id=${safeStatusId}`);
  } else if (params?.status && params.status !== 'All' && params.status !== 'All Status') {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }

  if (params?.search && params.search.trim()) {
    queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
  }

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/investments${qs}`, {
      method: 'GET',
    });
  } catch (err: any) {
    response = await apiRequest(`/superadmin/investments${qs}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(normalizeInvestment);

  const rawTotal = getValue(
    response,
    [
      'total',
      'total_records',
      'totalRecords',
      'total_count',
      'totalCount',
      'total_investments',
      'totalInvestments',
      'count',
      'o_total_count',
    ],
    null,
  );

  const nestedTotal =
    rawTotal !== null
      ? rawTotal
      : getValue(
          response?.data,
          ['total', 'total_records', 'totalRecords', 'total_count', 'totalCount', 'total_investments', 'totalInvestments', 'count'],
          null,
        ) ??
        getValue(
          response?.pagination,
          ['total', 'total_records', 'totalRecords', 'total_count', 'totalCount', 'count'],
          null,
        ) ??
        getValue(
          response?.summary,
          ['total_investments', 'totalInvestments', 'total', 'total_count', 'count'],
          null,
        );

  const total = Number(nestedTotal !== null && nestedTotal !== undefined ? nestedTotal : records.length);

  let summary: SuperAdminInvestmentSummary | undefined;
  const s =
    response?.summary ||
    (response &&
    !Array.isArray(response) &&
    typeof response === 'object' &&
    (response.total_investors !== undefined ||
      response.active_investments !== undefined ||
      response.total_investments !== undefined)
      ? response
      : null);

  if (s) {
    const rawInvestors = Number(
      getValue(s, ['total_investors', 'totalInvestors', 'investor_count', 'investors_count', 'unique_investors'], 0),
    );
    const fallbackInvestors = new Set(records.map(r => r.investorId || r.investorName).filter(Boolean)).size;
    summary = {
      totalInvestments: Number(getValue(s, ['total_investments', 'totalInvestments', 'total', 'total_count', 'count'], total)),
      totalInvestors: rawInvestors > 0 ? rawInvestors : fallbackInvestors,
      activeInvestments: Number(getValue(s, ['active_investments', 'activeInvestments', 'active', 'active_count'], 0)),
      pendingApproval: Number(getValue(s, ['pending_approval', 'pendingApproval', 'pending', 'pending_count'], 0)),
      matured: Number(getValue(s, ['matured', 'matured_investments', 'maturedInvestments', 'matured_count'], 0)),
      totalInvested: Number(getValue(s, ['total_invested', 'totalInvested', 'total_amount', 'total_investment', 'invested'], 0)),
    };
  }

  return {records, total, summary};
};

/**
 * 2. GET /api/superadmin/investment-management/summary
 */
export const getSuperAdminInvestmentSummary = async (): Promise<SuperAdminInvestmentSummary> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/api/superadmin/investment-management/summary', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/api/superadmin/investments/summary', {
          method: 'GET',
        });
      } catch {
        response = await apiRequest('/superadmin/investments/summary', {
          method: 'GET',
        });
      }
    }

    const d = response?.data || response || {};
    return {
      totalInvestments: Number(getValue(d, ['total_investments', 'totalInvestments', 'total', 'total_count', 'count'], 0)),
      totalInvestors: Number(getValue(d, ['total_investors', 'totalInvestors', 'investor_count', 'investors_count'], 0)),
      activeInvestments: Number(getValue(d, ['active_investments', 'activeInvestments', 'active', 'active_count'], 0)),
      pendingApproval: Number(getValue(d, ['pending_approval', 'pendingApproval', 'pending', 'pending_count'], 0)),
      matured: Number(getValue(d, ['matured', 'matured_investments', 'maturedInvestments', 'matured_count'], 0)),
      totalInvested: Number(getValue(d, ['total_invested', 'totalInvested', 'total_amount', 'total_investment', 'invested'], 0)),
    };
  } catch (err) {
    console.log('getSuperAdminInvestmentSummary note:', err);
    return {
      totalInvestments: 0,
      totalInvestors: 0,
      activeInvestments: 0,
      pendingApproval: 0,
      matured: 0,
      totalInvested: 0,
    };
  }
};

/**
 * 3. GET /superadmin/investments/{investment_id}
 */
export const getSuperAdminInvestmentDetails = async (
  investmentId: number | string,
): Promise<SuperAdminInvestmentRecord> => {
  if (!investmentId) {
    throw new Error('Investment ID is required.');
  }

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/investments/${encodeURIComponent(String(investmentId))}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/investments/${encodeURIComponent(String(investmentId))}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/superadmin/investment-management/${encodeURIComponent(String(investmentId))}`, {
        method: 'GET',
      });
    }
  }
  return normalizeInvestment(response?.data || response);
};

/**
 * 4. GET /superadmin/investor-management/filters/branches
 */
export const getSuperAdminBranchesFilter = async (): Promise<InvestmentFilterOption[]> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/superadmin/investor-management/filters/branches', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/superadmin/branches', {
          method: 'GET',
        });
      } catch {
        response = await apiRequest('/superadmin/investment-management/filters/branches', {
          method: 'GET',
        });
      }
    }

    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(getValue(item, ['id', 'branch_id', 'value'], 0)),
      name: String(getValue(item, ['branch_name', 'name', 'label'], '—')),
    })).filter(b => b.id > 0);
  } catch (err) {
    console.log('getSuperAdminBranchesFilter note:', err);
    return [];
  }
};

export {getErrorMessage};
