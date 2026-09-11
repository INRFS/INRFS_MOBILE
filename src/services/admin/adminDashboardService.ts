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

export const getData = (response: any) => {
  if (response?.data !== undefined) {
    return response.data;
  }
  return response;
};

/* ============================================================
   ADMIN DASHBOARD SERVICES (Matching Web Source of Truth)
   ============================================================ */

/**
 * 1. GET /api/admin/dashboard/summary
 */
export const getAdminDashboardSummary = async (): Promise<any> => {
  return apiRequest('/admin/dashboard/summary', {
    method: 'GET',
  });
};

/**
 * 2. GET /api/admin/dashboard/investor-growth
 */
export const getAdminInvestorGrowth = async (): Promise<any> => {
  return apiRequest('/admin/dashboard/investor-growth', {
    method: 'GET',
  });
};

/**
 * 3. GET /api/admin/dashboard/monthly-investment-trend
 */
export const getAdminMonthlyInvestmentTrend = async (): Promise<any> => {
  return apiRequest('/admin/dashboard/monthly-investment-trend', {
    method: 'GET',
  });
};

/**
 * 4. Combined Dashboard Data
 */
export const getAdminDashboardData = async (): Promise<{
  summary: any;
  investorGrowth: any;
  investmentTrend: any;
}> => {
  const [
    summaryResponse,
    investorGrowthResponse,
    investmentTrendResponse,
  ] = await Promise.all([
    getAdminDashboardSummary(),
    getAdminInvestorGrowth(),
    getAdminMonthlyInvestmentTrend(),
  ]);

  return {
    summary: getData(summaryResponse),
    investorGrowth: getData(investorGrowthResponse),
    investmentTrend: getData(investmentTrendResponse),
  };
};

export default {
  getAdminDashboardSummary,
  getAdminInvestorGrowth,
  getAdminMonthlyInvestmentTrend,
  getAdminDashboardData,
  getData,
};
