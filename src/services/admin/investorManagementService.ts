import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENV} from '../../config/env';

/* ============================================================
   CONFIG & AUTH HELPERS
   ============================================================ */

export const API_BASE_URL = ENV?.API_BASE_URL || 'https://investor.inrfs.com/api';

const AUTH_TOKEN_KEYS = [
  'access_token',
  'accessToken',
  'token',
  'authToken',
  'auth_token',
  'admin_token',
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
    console.log('Error reading auth token from AsyncStorage:', error);
    return null;
  }
};

export const resolveEndpoint = (endpoint: string): string => {
  const base = (ENV?.API_BASE_URL || 'https://investor.inrfs.com/api').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  if (!base.endsWith('/api') && !cleanEndpoint.startsWith('/api/')) {
    return `${base}/api${cleanEndpoint}`;
  }
  return `${base}${cleanEndpoint}`;
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
    }

    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.response = responseBody;

    throw error;
  }

  return responseBody;
};

/* =========================================================
   MASTER - INVESTOR STATUSES
   ========================================================= */

export const getInvestorStatuses = async (): Promise<any> => {
  return apiRequest('/masters/investor-request-statuses', {
    method: 'GET',
  });
};

/* =========================================================
   MASTER - KYC STATUSES
   ========================================================= */

export const getKycStatuses = async (): Promise<any> => {
  return apiRequest('/masters/kyc-statuses', {
    method: 'GET',
  });
};

/* =========================================================
   GET INVESTORS
   ========================================================= */

export const getInvestors = async ({
  statusName,
  kycStatusName,
  searchText,
  limit = 100,
  offset = 0,
}: {
  statusName?: string;
  kycStatusName?: string;
  searchText?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<any> => {
  const params = new URLSearchParams();

  if (statusName && statusName !== 'All') {
    params.append('status_name', statusName);
  }

  if (kycStatusName && kycStatusName !== 'All KYC Status') {
    params.append('kyc_status_name', kycStatusName);
  }

  if (searchText) {
    params.append('search_text', searchText);
  }

  params.append('limit', String(limit));
  params.append('offset', String(offset));

  return apiRequest(`/admin/investors?${params.toString()}`, {
    method: 'GET',
  });
};

/* =========================================================
   GET INVESTOR DETAILS
   ========================================================= */

export const getInvestorDetails = async (
  investorRegistrationId: number | string,
): Promise<any> => {
  if (
    investorRegistrationId === null ||
    investorRegistrationId === undefined ||
    investorRegistrationId === ''
  ) {
    throw new Error('Investor registration ID is required');
  }

  return apiRequest(
    `/admin/investors/${encodeURIComponent(String(investorRegistrationId))}`,
    {
      method: 'GET',
    },
  );
};

/* =========================================================
   APPROVE INVESTOR
   ========================================================= */

export const approveInvestor = async (
  investorId: number | string,
  {
    branch_id,
    remarks,
  }: {
    branch_id?: number | string;
    remarks?: string;
  } = {},
): Promise<any> => {
  if (investorId === null || investorId === undefined || investorId === '') {
    throw new Error('Investor ID is required');
  }

  if (branch_id === null || branch_id === undefined || branch_id === '') {
    throw new Error('Branch ID is required');
  }

  const numericBranchId = Number(branch_id);

  if (!Number.isInteger(numericBranchId) || numericBranchId <= 0) {
    throw new Error('Invalid branch ID');
  }

  return apiRequest(
    `/admin/investors/${encodeURIComponent(String(investorId))}/approve`,
    {
      method: 'PUT',
      body: JSON.stringify({
        branch_id: numericBranchId,
        remarks: remarks || 'Investor approved by admin',
      }),
    },
  );
};

/* =========================================================
   REJECT INVESTOR
   ========================================================= */

export const rejectInvestor = async (
  investorId: number | string,
  {
    remarks,
  }: {
    remarks?: string;
  } = {},
): Promise<any> => {
  if (investorId === null || investorId === undefined || investorId === '') {
    throw new Error('Investor ID is required');
  }

  return apiRequest(
    `/admin/investors/${encodeURIComponent(String(investorId))}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({
        remarks: remarks || 'Investor rejected by admin',
      }),
    },
  );
};

export default {
  getInvestorStatuses,
  getKycStatuses,
  getInvestors,
  getInvestorDetails,
  approveInvestor,
  rejectInvestor,
};
