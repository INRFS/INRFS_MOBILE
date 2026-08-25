import {getAuthToken, getErrorMessage} from './superAdminDashboardService';

const API_BASE_URL = 'http://187.52.115.32:8000';

export interface AdminRecord {
  id: number;
  name: string;
  email: string;
  mobile: string;
  branchId: number | null;
  branchName: string;
  roleId: number | null;
  role: string;
  statusId: number | null;
  status: string;
  createdAt: string;
  raw: any;
}

export interface AdminFilterOption {
  id: number;
  name: string;
}

export interface CreateAdminPayload {
  full_name: string;
  email: string;
  mobile: string;
  branch_id: number;
  role_id: number;
  status_id?: number;
  password: string;
}

export interface UpdateAdminPayload {
  full_name: string;
  email: string;
  mobile: string;
  branch_id: number;
  role_id: number;
  status_id: number;
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

export const normalizeAdmin = (item: any): AdminRecord => {
  const id = Number(getValue(item, ['admin_id', 'id', 'user_id'], 0));
  const name = String(getValue(item, ['full_name', 'fullName', 'name', 'username', 'admin_name'], '—'));
  const email = String(getValue(item, ['email'], '—'));
  const mobile = String(getValue(item, ['mobile', 'phone'], '—'));
  const branchId = item.branch_id !== undefined ? Number(item.branch_id) : null;
  const branchName = String(getValue(item, ['branch_name', 'branchName', 'branch'], '—'));
  const roleId = item.role_id !== undefined ? Number(item.role_id) : null;
  const role = String(getValue(item, ['role', 'role_name', 'roleName'], 'Admin'));
  const statusId = item.status_id !== undefined ? Number(item.status_id) : null;
  const statusRaw = getValue(item, ['status', 'is_active', 'status_name'], 'Active');
  const status = typeof statusRaw === 'boolean' ? (statusRaw ? 'Active' : 'Inactive') : String(statusRaw);
  const createdAt = String(getValue(item, ['created_date', 'created_at', 'createdAt', 'created_on'], '—'));

  return {
    id,
    name,
    email,
    mobile,
    branchId,
    branchName,
    roleId,
    role,
    statusId,
    status,
    createdAt,
    raw: item,
  };
};

/**
 * 1. GET /superadmin/admins
 */
export const getAdmins = async (params?: {
  search?: string;
  branch_id?: number;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{records: AdminRecord[]; total: number}> => {
  const queryParts: string[] = [];
  if (params?.limit) queryParts.push(`limit=${params.limit}`);
  else queryParts.push('limit=100');
  if (params?.offset !== undefined) queryParts.push(`offset=${params.offset}`);
  if (params?.branch_id) queryParts.push(`branch_id=${params.branch_id}`);
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  const response = await apiRequest(`/superadmin/admins${qs}`, {
    method: 'GET',
  });

  const list = getList(response);
  const records = list.map(normalizeAdmin);
  const total = Number(response?.total || response?.count || records.length);

  return {records, total};
};

/**
 * 2. POST /superadmin/admins
 */
export const createAdmin = async (payload: CreateAdminPayload): Promise<any> => {
  return await apiRequest('/superadmin/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * 3. GET /superadmin/admins/{admin_id}
 */
export const getAdminDetails = async (adminId: number | string): Promise<AdminRecord> => {
  const response = await apiRequest(`/superadmin/admins/${adminId}`, {
    method: 'GET',
  });
  return normalizeAdmin(response?.data || response);
};

/**
 * 4. PUT /superadmin/admins/{admin_id}
 */
export const updateAdmin = async (
  adminId: number | string,
  payload: UpdateAdminPayload,
): Promise<any> => {
  return await apiRequest(`/superadmin/admins/${adminId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

/**
 * 5. PATCH /superadmin/admins/{admin_id}/suspend
 */
export const suspendAdmin = async (adminId: number | string): Promise<any> => {
  return await apiRequest(`/superadmin/admins/${adminId}/suspend`, {
    method: 'PATCH',
  });
};

/**
 * 6. GET /superadmin/admins/filters/branches
 */
export const getAdminBranchesFilter = async (): Promise<AdminFilterOption[]> => {
  try {
    const response = await apiRequest('/superadmin/admins/filters/branches', {
      method: 'GET',
    });
    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(getValue(item, ['id', 'branch_id', 'value'], 0)),
      name: String(getValue(item, ['branch_name', 'name', 'label'], '—')),
    }));
  } catch (err) {
    console.log('getAdminBranchesFilter note:', err);
    return [];
  }
};

/**
 * 7. GET /superadmin/admins/filters/roles
 */
export const getAdminRolesFilter = async (): Promise<AdminFilterOption[]> => {
  try {
    const response = await apiRequest('/superadmin/admins/filters/roles', {
      method: 'GET',
    });
    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(getValue(item, ['id', 'role_id', 'value'], 0)),
      name: String(getValue(item, ['role_name', 'name', 'label', 'role'], '—')),
    }));
  } catch (err) {
    console.log('getAdminRolesFilter note:', err);
    return [];
  }
};

/**
 * 8. GET /superadmin/admins/filters/statuses
 */
export const getAdminStatusesFilter = async (): Promise<AdminFilterOption[]> => {
  try {
    const response = await apiRequest('/superadmin/admins/filters/statuses', {
      method: 'GET',
    });
    const list = getList(response);
    return list.map((item: any) => ({
      id: Number(getValue(item, ['id', 'status_id', 'value'], 0)),
      name: String(getValue(item, ['status_name', 'name', 'label', 'status'], '—')),
    }));
  } catch (err) {
    console.log('getAdminStatusesFilter note:', err);
    return [];
  }
};

export {getErrorMessage};
