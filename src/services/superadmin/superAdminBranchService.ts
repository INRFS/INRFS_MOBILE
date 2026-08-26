import {getAuthToken, getErrorMessage} from './superAdminDashboardService';

const API_BASE_URL = 'http://187.52.115.32:8000';

export interface BranchRecord {
  id: number;
  name: string;
  cityName: string;
  stateId: number;
  stateName: string;
  isActive: boolean;
  adminName: string;
  investorCount: number;
  aum: string;
  status: string;
  raw: any;
}

export interface StateOption {
  id: number;
  stateName: string;
}

export interface CreateBranchPayload {
  branch_name: string;
  city_name: string;
  state_id: number;
  is_active?: boolean;
}

export interface UpdateBranchPayload {
  branch_name: string;
  city_name: string;
  state_id: number;
  is_active: boolean;
}

export interface BranchQueryParams {
  search?: string;
  state_id?: number;
  is_active?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
}

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

/**
 * Format currency / AUM value cleanly
 */
const formatAumValue = (rawAum: any): string => {
  if (rawAum === undefined || rawAum === null || rawAum === '' || rawAum === '—') {
    return '₹0';
  }
  const str = String(rawAum).trim();
  if (str.startsWith('₹') || str.includes('Cr') || str.includes('Lakh')) {
    return str;
  }
  const num = Number(str.replace(/[^0-9.-]+/g, ''));
  if (!isNaN(num) && num !== 0) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
  return str.startsWith('₹') ? str : `₹${str}`;
};

/**
 * Normalization layer for branch records from backend stored procedures or standard JSON
 */
export const normalizeBranch = (item: any): BranchRecord => {
  const id = Number(
    getValue(item, ['o_branch_id', 'branch_id', 'id', 'branchId'], 0),
  );
  const name = String(
    getValue(
      item,
      ['o_branch_name', 'branch_name', 'name', 'branchName', 'branch_title'],
      '—',
    ),
  );
  const cityName = String(
    getValue(item, ['o_city_name', 'city_name', 'cityName', 'city'], '—'),
  );
  const stateId = Number(
    getValue(item, ['o_state_id', 'state_id', 'stateId'], 0),
  );
  const stateName = String(
    getValue(item, ['o_state_name', 'state_name', 'stateName', 'state'], '—'),
  );

  const rawActive = getValue(
    item,
    ['o_is_active', 'is_active', 'isActive', 'status_id', 'status'],
    true,
  );
  let isActive = true;
  if (typeof rawActive === 'boolean') {
    isActive = rawActive;
  } else if (typeof rawActive === 'string') {
    const s = rawActive.toLowerCase().trim();
    isActive = s === 'active' || s === 'true' || s === '1';
  } else if (typeof rawActive === 'number') {
    isActive = rawActive === 1 || rawActive === 2;
  }

  const adminName = String(
    getValue(
      item,
      ['o_admin_name', 'admin_name', 'adminName', 'manager_name', 'admin', 'manager', 'full_name'],
      '—',
    ),
  );
  const investorCount = Number(
    getValue(
      item,
      ['o_investor_count', 'investor_count', 'investors_count', 'investors', 'investorCount', 'total_investors'],
      0,
    ),
  );
  const rawAum = getValue(item, ['o_aum', 'aum', 'total_aum', 'system_aum'], '0');
  const aum = formatAumValue(rawAum);
  const status = isActive ? 'Active' : 'Suspended';

  return {
    id,
    name,
    cityName,
    stateId,
    stateName,
    isActive,
    adminName,
    investorCount,
    aum,
    status,
    raw: item,
  };
};

/**
 * 1. GET /superadmin/branch-management (or fallback endpoints)
 * Query parameters: search, state_id, limit, offset
 */
export const getBranches = async (
  params?: BranchQueryParams,
): Promise<{records: BranchRecord[]; total: number}> => {
  const queryParts: string[] = [];
  if (params?.limit !== undefined) queryParts.push(`limit=${params.limit}`);
  else queryParts.push('limit=10');
  if (params?.offset !== undefined) queryParts.push(`offset=${params.offset}`);
  if (params?.state_id) queryParts.push(`state_id=${params.state_id}`);
  if (params?.search && params.search.trim()) {
    queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
  }

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/branch-management${qs}`, {
      method: 'GET',
    });
  } catch (err: any) {
    try {
      response = await apiRequest(`/api/superadmin/branch-management${qs}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/superadmin/branches${qs}`, {
        method: 'GET',
      });
    }
  }

  const list = getList(response);
  const records = list.map(normalizeBranch);
  const total = Number(
    response?.total ??
    response?.total_count ??
    response?.count ??
    response?.o_total_count ??
    records.length,
  );

  return {records, total};
};

/**
 * 2. POST /superadmin/branch-management
 * Request body: { branch_name, city_name, state_id, is_active }
 */
export const createBranch = async (
  payload: CreateBranchPayload,
): Promise<any> => {
  const body = JSON.stringify({
    branch_name: payload.branch_name,
    city_name: payload.city_name,
    state_id: payload.state_id,
    is_active: payload.is_active !== undefined ? payload.is_active : true,
  });

  try {
    return await apiRequest('/superadmin/branch-management', {
      method: 'POST',
      body,
    });
  } catch (err: any) {
    try {
      return await apiRequest('/api/superadmin/branch-management', {
        method: 'POST',
        body,
      });
    } catch {
      return await apiRequest('/superadmin/branches', {
        method: 'POST',
        body,
      });
    }
  }
};

/**
 * 3. GET /superadmin/branch-management/{branch_id}
 */
export const getBranchDetails = async (
  branchId: number | string,
): Promise<BranchRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/branch-management/${branchId}`, {
      method: 'GET',
    });
  } catch (err: any) {
    try {
      response = await apiRequest(`/api/superadmin/branch-management/${branchId}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/superadmin/branches/${branchId}`, {
        method: 'GET',
      });
    }
  }
  return normalizeBranch(response?.data || response);
};

/**
 * 4. PUT /superadmin/branch-management/{branch_id}
 * Request body: { branch_name, city_name, state_id, is_active }
 */
export const updateBranch = async (
  branchId: number | string,
  payload: UpdateBranchPayload,
): Promise<any> => {
  const body = JSON.stringify({
    branch_name: payload.branch_name,
    city_name: payload.city_name,
    state_id: payload.state_id,
    is_active: payload.is_active,
  });

  try {
    return await apiRequest(`/superadmin/branch-management/${branchId}`, {
      method: 'PUT',
      body,
    });
  } catch (err: any) {
    try {
      return await apiRequest(`/api/superadmin/branch-management/${branchId}`, {
        method: 'PUT',
        body,
      });
    } catch {
      return await apiRequest(`/superadmin/branches/${branchId}`, {
        method: 'PUT',
        body,
      });
    }
  }
};

/**
 * 5. GET /superadmin/branch-management/states
 */
export const getBranchStates = async (): Promise<StateOption[]> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/superadmin/branch-management/states', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/api/superadmin/branch-management/states', {
          method: 'GET',
        });
      } catch {
        try {
          response = await apiRequest('/superadmin/branches/states', {
            method: 'GET',
          });
        } catch {
          response = await apiRequest('/superadmin/branch-management/filters/states', {
            method: 'GET',
          });
        }
      }
    }

    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(
        getValue(item, ['o_state_id', 'state_id', 'id', 'value'], 0),
      ),
      stateName: String(
        getValue(
          item,
          ['o_state_name', 'state_name', 'name', 'label', 'state'],
          '—',
        ),
      ),
    })).filter(s => s.id > 0);
  } catch (err) {
    console.log('getBranchStates error note:', err);
    return [];
  }
};

export {getErrorMessage};
