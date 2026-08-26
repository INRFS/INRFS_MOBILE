import {getAuthToken, getErrorMessage} from './superAdminDashboardService';

const API_BASE_URL = 'http://187.52.115.32:8000';

export interface SuperAdminProfile {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  username: string;
  role: string;
  branchName: string;
  status: string;
  avatarUri?: string;
  raw: any;
}

export interface UpdateSuperAdminProfilePayload {
  full_name: string;
  email: string;
  mobile: string;
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
 * Robust normalization layer handling:
 * - Swagger backend stored procedure response fields: o_user_id, o_full_name, o_email, o_mobile, o_role_name, o_branch_name, o_status_name
 * - Standard camelCase / snake_case responses: full_name, email, mobile, role_name, branch_name, status_name
 * - Nested user/profile structures: data.user, data.profile
 */
export const normalizeProfile = (raw: any): SuperAdminProfile => {
  if (__DEV__) {
    console.log('[DEBUG] Raw Super Admin Profile Response:', JSON.stringify(raw, null, 2));
  }

  const item = raw?.data?.user || raw?.data?.profile || raw?.data || raw?.user || raw || {};

  const id = Number(
    getValue(item, ['o_user_id', 'user_id', 'id', 'admin_id', 'userId'], 0),
  );

  const fullName = String(
    getValue(
      item,
      ['o_full_name', 'full_name', 'fullName', 'name', 'username', 'admin_name'],
      'Super Admin',
    ),
  );

  const email = String(
    getValue(
      item,
      ['o_email', 'email', 'email_address', 'emailAddress', 'user_email'],
      '—',
    ),
  );

  const mobile = String(
    getValue(
      item,
      ['o_mobile', 'mobile', 'mobile_number', 'mobileNumber', 'phone', 'contact_number', 'user_mobile'],
      '—',
    ),
  );

  const username = String(
    getValue(item, ['username', 'login_id', 'o_username', 'loginId'], 'superadmin'),
  );

  const role = String(
    getValue(
      item,
      ['o_role_name', 'role_name', 'roleName', 'role', 'user_role'],
      'Super Admin',
    ),
  );

  const branchName = String(
    getValue(
      item,
      ['o_branch_name', 'branch_name', 'branchName', 'branch', 'branch_title'],
      'All Branches',
    ),
  );

  const rawStatus = getValue(
    item,
    ['o_status_name', 'status_name', 'statusName', 'status', 'is_active', 'account_status'],
    'Active',
  );
  const status =
    typeof rawStatus === 'boolean'
      ? rawStatus
        ? 'Active'
        : 'Inactive'
      : String(rawStatus);

  const normalized: SuperAdminProfile = {
    id,
    fullName,
    email,
    mobile,
    username,
    role,
    branchName,
    status,
    raw,
  };

  if (__DEV__) {
    console.log('[DEBUG] Normalized Super Admin Profile:', JSON.stringify(normalized, null, 2));
  }

  return normalized;
};

/**
 * 1. GET /superadmin/profile
 * Matches Swagger contract: GET /superadmin/profile (or /api/superadmin/profile)
 */
export const getSuperAdminProfile = async (): Promise<SuperAdminProfile> => {
  let response: any = null;
  try {
    response = await apiRequest('/superadmin/profile', {
      method: 'GET',
    });
  } catch (err: any) {
    try {
      response = await apiRequest('/api/superadmin/profile', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/auth/me', {
          method: 'GET',
        });
      } catch {
        throw err;
      }
    }
  }
  return normalizeProfile(response);
};

/**
 * 2. PUT /superadmin/profile
 * Matches Swagger contract: PUT /superadmin/profile (Body: { full_name, email, mobile })
 */
export const updateSuperAdminProfile = async (
  payload: UpdateSuperAdminProfilePayload,
): Promise<any> => {
  let response: any = null;
  try {
    response = await apiRequest('/superadmin/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: payload.full_name,
        email: payload.email,
        mobile: payload.mobile,
      }),
    });
  } catch (err: any) {
    response = await apiRequest('/api/superadmin/profile', {
      method: 'PUT',
      body: JSON.stringify({
        full_name: payload.full_name,
        email: payload.email,
        mobile: payload.mobile,
      }),
    });
  }
  return response;
};

export {getErrorMessage};
