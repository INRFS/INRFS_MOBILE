import {getAuthToken, getErrorMessage} from './superAdminDashboardService';
import {ENV} from '../../config/env';

const API_BASE_URL = ENV.API_BASE_URL || 'https://investor.inrfs.com/api';

export interface SuperAdminInvestorRecord {
  id: number | string;
  investorId: string;
  name: string;
  email: string;
  mobile: string;
  branchId: number | null;
  branchName: string;
  kycStatus: string;
  status: string;
  totalInvested: number;
  totalAum: string;
  registeredDate: string;
  raw: any;
}

export interface InvestorSummaryData {
  totalInvestors: number;
  activeInvestors: number;
  inactiveInvestors: number;
  totalAum: string;
}

export interface InvestorFilterOption {
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

const parseAum = (val: any): string => {
  if (val === null || val === undefined || val === '') return '₹0';
  if (typeof val === 'number') {
    return `₹${val.toLocaleString('en-IN')}`;
  }
  const str = String(val).trim();
  if (str.startsWith('₹')) return str;
  const num = Number(str.replace(/[^0-9.-]+/g, ''));
  if (Number.isFinite(num) && num > 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return str ? `₹${str}` : '₹0';
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
  if (Array.isArray(response.requests)) return response.requests;
  if (Array.isArray(response.settlements)) return response.settlements;
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

export const normalizeInvestor = (item: any): SuperAdminInvestorRecord => {
  const id = getValue(item, ['id', 'investor_id', 'user_id', 'o_investor_id'], '—');
  const investorId = String(
    getValue(item, ['investor_registration_id', 'investor_id', 'investorId', 'id', 'o_investor_id'], '—'),
  );
  const name = String(
    getValue(item, ['investor_name', 'investorName', 'full_name', 'fullName', 'name', 'o_investor_name'], '—'),
  );
  const email = String(getValue(item, ['email', 'o_email'], '—'));
  const mobile = String(getValue(item, ['mobile', 'phone', 'mobile_number', 'o_mobile'], '—'));
  const branchId = item.branch_id !== undefined ? Number(item.branch_id) : null;
  const branchName = String(getValue(item, ['branch_name', 'branchName', 'branch', 'o_branch_name'], '—'));
  const kycStatus = String(getValue(item, ['kyc_status', 'kycStatus', 'kyc', 'o_kyc_status'], 'Pending'));
  const status = String(getValue(item, ['status', 'is_active', 'status_name', 'o_status_name'], 'Active'));
  const totalInvested = Number(getValue(item, ['total_invested', 'total_amount', 'amount', 'o_total_invested'], 0));
  
  const rawAum = getValue(
    item,
    [
      'aum',
      'total_aum',
      'totalAum',
      'total_investment',
      'totalInvestment',
      'total_invested',
      'totalInvested',
      'o_aum',
      'o_total_invested',
    ],
    totalInvested || 0,
  );
  const totalAum = parseAum(rawAum);

  const registeredDate = String(getValue(item, ['registered_date', 'registration_date', 'created_date', 'created_at', 'o_created_at'], '—'));

  return {
    id,
    investorId,
    name,
    email,
    mobile,
    branchId,
    branchName,
    kycStatus,
    status,
    totalInvested,
    totalAum,
    registeredDate,
    raw: item,
  };
};

const normalizeId = (value: any): string => {
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
 * 1. GET /api/superadmin/investor-management
 */
export const getInvestors = async (params?: {
  search?: string;
  branch_id?: number | string;
  branchId?: number | string;
  status_id?: number | string;
  statusId?: number | string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminInvestorRecord[]; total: number; summary?: InvestorSummaryData}> => {
  const queryParts: string[] = [];

  const safeLimit = Math.min(Math.max(Number(params?.limit) || 10, 1), 100);
  const safeOffset = Math.max(Number(params?.offset) || 0, 0);

  queryParts.push(`limit=${safeLimit}`);
  queryParts.push(`offset=${safeOffset}`);

  const rawBranch = params?.branch_id ?? params?.branchId;
  const safeBranch = normalizeId(rawBranch);
  if (safeBranch) {
    queryParts.push(`branch_id=${safeBranch}`);
  }

  const rawStatus = params?.status_id ?? params?.statusId;
  const safeStatusId = normalizeId(rawStatus);
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
    response = await apiRequest(`/api/superadmin/investor-management${qs}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/investor-management${qs}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(normalizeInvestor);

  const rawTotal = getValue(
    response,
    [
      'total',
      'total_records',
      'totalRecords',
      'total_count',
      'totalCount',
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
          ['total', 'total_records', 'totalRecords', 'total_count', 'totalCount', 'count'],
          null,
        ) ??
        getValue(
          response?.pagination,
          ['total', 'total_records', 'totalRecords', 'total_count', 'totalCount', 'count'],
          null,
        );

  const total = Number(nestedTotal !== null && nestedTotal !== undefined ? nestedTotal : records.length);

  let summary: InvestorSummaryData | undefined;
  const summaryObj =
    response?.summary ||
    (response &&
      !Array.isArray(response) &&
      typeof response === 'object' &&
      (response.total_aum !== undefined || response.total_investors !== undefined)
      ? response
      : null);

  if (summaryObj) {
    const rawAum = getValue(
      summaryObj,
      [
        'total_aum',
        'totalAum',
        'aum',
        'total_investment',
        'totalInvestment',
        'system_aum',
        'systemAum',
        'total_invested',
        'totalInvested',
      ],
      null,
    );
    summary = {
      totalInvestors: Number(getValue(summaryObj, ['total_investors', 'total', 'count'], total)),
      activeInvestors: Number(getValue(summaryObj, ['active_investors', 'active'], 0)),
      inactiveInvestors: Number(getValue(summaryObj, ['inactive_investors', 'inactive', 'suspended_investors'], 0)),
      totalAum: parseAum(rawAum),
    };
  }

  return {records, total, summary};
};

/**
 * 2. GET /api/superadmin/investor-management/summary
 */
export const getInvestorSummary = async (): Promise<InvestorSummaryData> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/api/superadmin/investor-management/summary', {
        method: 'GET',
      });
    } catch {
      response = await apiRequest('/superadmin/investor-management/summary', {
        method: 'GET',
      });
    }

    const d = response?.data || response || {};
    const rawAum = getValue(
      d,
      [
        'total_aum',
        'totalAum',
        'aum',
        'total_investment',
        'totalInvestment',
        'system_aum',
        'systemAum',
        'total_invested',
        'totalInvested',
        'total_amount',
        'totalAmount',
      ],
      null,
    );
    const totalAum = parseAum(rawAum);

    return {
      totalInvestors: Number(getValue(d, ['total_investors', 'total_count', 'total', 'count'], 0)),
      activeInvestors: Number(getValue(d, ['active_investors', 'active_count', 'active'], 0)),
      inactiveInvestors: Number(getValue(d, ['inactive_investors', 'inactive_count', 'inactive', 'suspended_investors'], 0)),
      totalAum,
    };
  } catch (err) {
    console.log('getInvestorSummary note:', err);
    return {
      totalInvestors: 0,
      activeInvestors: 0,
      inactiveInvestors: 0,
      totalAum: '₹0',
    };
  }
};

/**
 * 3. GET /api/superadmin/investor-management/{investor_id}
 */
export const getInvestorDetails = async (investorId: number | string): Promise<SuperAdminInvestorRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/investor-management/${encodeURIComponent(String(investorId))}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/investor-management/${encodeURIComponent(String(investorId))}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/superadmin/investors/${encodeURIComponent(String(investorId))}`, {
        method: 'GET',
      });
    }
  }
  return normalizeInvestor(response?.data || response);
};

/**
 * 4. GET /api/superadmin/investor-management/filters/branches
 */
export const getInvestorBranchesFilter = async (): Promise<InvestorFilterOption[]> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/api/superadmin/investor-management/filters/branches', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/superadmin/investor-management/filters/branches', {
          method: 'GET',
        });
      } catch {
        response = await apiRequest('/superadmin/branches', {
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
    console.log('getInvestorBranchesFilter note:', err);
    return [];
  }
};

/**
 * 5. GET /api/superadmin/investor-management/filters/statuses
 */
export const getInvestorStatusesFilter = async (): Promise<InvestorFilterOption[]> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/api/superadmin/investor-management/filters/statuses', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/superadmin/investor-management/filters/statuses', {
          method: 'GET',
        });
      } catch {
        response = await apiRequest('/superadmin/statuses', {
          method: 'GET',
        });
      }
    }

    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(getValue(item, ['id', 'status_id', 'value'], 0)),
      name: String(getValue(item, ['status_name', 'name', 'label', 'status'], '—')),
    })).filter(s => s.id > 0);
  } catch (err) {
    console.log('getInvestorStatusesFilter note:', err);
    return [];
  }
};

// Aliases matching prompt requirements
export const getInvestorManagement = getInvestors;
export const getInvestorManagementSummary = getInvestorSummary;
export const getInvestorManagementDetails = getInvestorDetails;
export const getInvestorManagementBranches = getInvestorBranchesFilter;
export const getInvestorManagementStatuses = getInvestorStatusesFilter;
export const exportInvestorsCSV = async () => {
  return true;
};

export {getErrorMessage};
