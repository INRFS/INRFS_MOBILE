import AsyncStorage from '@react-native-async-storage/async-storage';

/* ============================================================
   CONFIG
   ============================================================ */

const API_BASE_URL = 'http://187.52.115.32:8000';

const AUTH_TOKEN_KEYS = [
  'access_token',
  'accessToken',
  'token',
  'authToken',
  'auth_token',
  'jwt',
];

/* ============================================================
   TYPES
   ============================================================ */

export type SettlementStatus =
  | 'Pending'
  | 'Pending Super Admin'
  | 'Approved'
  | 'Rejected'
  | 'Paid';

export interface SettlementRecord {
  id: string | number;
  settlementId?: number;
  requestId?: number;
  investmentId: string | number;
  investor: string;
  investorName: string;
  investorId: string;
  branch: string;
  cityName?: string;
  bondNumber: string;
  investmentDate: string;
  maturedOn?: string;
  requestedDate?: string;
  date?: string;
  reason?: string;
  principal: number;
  interestEarned: number;
  gstAmount: number;
  penalty: number;
  netSettlementAmount: number;
  status: SettlementStatus;
  rawStatus: string;
  type: 'TENURE_TIMEOUT' | 'PRECLOSE' | 'CLOSED';
  raw: any;
}

export interface GetSettlementParams {
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  items?: T;
  total?: number;
  detail?: any;
}

/* ============================================================
   TOKEN & ERROR HELPERS
   ============================================================ */

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
   LIST EXTRACTION HELPER (Matching Web getList)
   ============================================================ */

export const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.results)) return response.results;
  return [];
};

/* ============================================================
   INVESTOR NAME EXTRACTION
   ============================================================ */

export const extractInvestorName = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return '—';

  const candidates = [
    raw.investor_name,
    raw.investorName,
    raw.investor,
    raw.full_name,
    raw.fullName,
    raw.name,
    raw.investor?.name,
    raw.investor?.investor_name,
    raw.user?.name,
  ];

  for (const c of candidates) {
    if (
      typeof c === 'string' &&
      c.trim() &&
      c.trim().toLowerCase() !== 'investor' &&
      c.trim().toLowerCase() !== 'unknown'
    ) {
      return c.trim();
    }
  }

  if (raw.investor_id || raw.investorId) {
    return String(raw.investor_id || raw.investorId);
  }

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      return c.trim();
    }
  }

  return '—';
};

/* ============================================================
   STATUS NORMALIZATION (Matching Web)
   ============================================================ */

export const normalizeSettlementStatus = (rawStatus?: string): SettlementStatus => {
  const s = String(rawStatus || '').toLowerCase().trim();

  if (s.includes('paid') || s.includes('settled') || s.includes('completed')) {
    return 'Paid';
  }
  if (s.includes('reject') || s.includes('declined')) {
    return 'Rejected';
  }
  if (
    s.includes('pending super admin') ||
    s.includes('awaiting') ||
    s.includes('super admin') ||
    s.includes('waiting')
  ) {
    return 'Pending Super Admin';
  }
  if (s.includes('approved') || s.includes('approve')) {
    return 'Approved';
  }
  return 'Pending';
};

/* ============================================================
   NORMALIZERS (Matching Web)
   ============================================================ */

export const normalizeTenureItem = (row: any): SettlementRecord => {
  const settlementId = Number(row?.settlement_id ?? row?.id ?? 0);
  const investmentId = row?.investment_code ?? row?.investment_id ?? '—';
  const investor = extractInvestorName(row);
  const investorId = String(row?.investor_id ?? row?.investor_registration_id ?? '—');
  const branch = String(row?.branch_name ?? row?.branch ?? '—');
  const cityName = String(row?.city_name ?? row?.city ?? '');
  const bondNumber = String(row?.bond_number ?? row?.bondId ?? row?.bond_id ?? '—');

  const investmentDate = String(row?.investment_date ?? '—');
  const maturedOn = String(row?.maturity_date ?? row?.maturedOn ?? '—');

  const principal = Number(row?.principal_amount ?? row?.investment_amount ?? row?.principal ?? 0) || 0;
  const interestEarned = Number(row?.interest_amount ?? row?.expected_interest_amount ?? row?.interestEarned ?? 0) || 0;
  const gstAmount = Number(row?.gst_amount ?? Math.round(interestEarned * 0.18)) || 0;
  const penalty = Number(row?.penalty_amount ?? 0) || 0;

  const rawNet = Number(row?.net_settlement_amount ?? row?.net_settlement ?? 0);
  const netSettlementAmount = rawNet || (principal + interestEarned - gstAmount - penalty);

  const rawStatus = String(row?.status_name ?? row?.status ?? 'Pending');
  const status = normalizeSettlementStatus(rawStatus);

  return {
    id: settlementId || investmentId,
    settlementId: settlementId || undefined,
    investmentId,
    investor,
    investorName: investor,
    investorId,
    branch,
    cityName,
    bondNumber,
    investmentDate,
    maturedOn,
    date: maturedOn,
    principal,
    interestEarned,
    gstAmount,
    penalty,
    netSettlementAmount,
    status,
    rawStatus,
    type: 'TENURE_TIMEOUT',
    raw: row,
  };
};

export const normalizePrecloseItem = (row: any): SettlementRecord => {
  const requestId = Number(row?.request_id ?? row?.preclose_request_id ?? row?.id ?? 0);
  const investmentId = row?.investment_code ?? row?.investment_id ?? '—';
  const investor = extractInvestorName(row);
  const investorId = String(row?.investor_id ?? row?.investor_registration_id ?? '—');
  const branch = String(row?.branch_name ?? row?.branch ?? '—');
  const cityName = String(row?.city_name ?? row?.city ?? '');
  const bondNumber = String(row?.bond_number ?? row?.bondId ?? row?.bond_id ?? '—');

  const investmentDate = String(row?.investment_date ?? '—');
  const requestedDate = String(row?.requested_date ?? row?.created_date ?? '—');
  const reason = String(row?.preclose_reason ?? row?.reason ?? '—');

  const principal = Number(row?.principal_amount ?? row?.investment_amount ?? row?.principal ?? 0) || 0;
  const interestEarned = Number(row?.interest_amount ?? row?.expected_interest_amount ?? row?.interestEarned ?? 0) || 0;
  const gstAmount = Number(row?.gst_amount ?? Math.round(interestEarned * 0.18)) || 0;
  const penalty = Number(row?.penalty_amount ?? 0) || 0;

  const rawNet = Number(row?.net_settlement_amount ?? row?.net_settlement ?? 0);
  const netSettlementAmount = rawNet || (principal + interestEarned - gstAmount - penalty);

  const rawStatus = String(row?.request_status ?? row?.status_name ?? row?.status ?? 'Pending');
  const status = normalizeSettlementStatus(rawStatus);

  return {
    id: requestId || investmentId,
    requestId: requestId || undefined,
    investmentId,
    investor,
    investorName: investor,
    investorId,
    branch,
    cityName,
    bondNumber,
    investmentDate,
    requestedDate,
    date: requestedDate,
    reason,
    principal,
    interestEarned,
    gstAmount,
    penalty,
    netSettlementAmount,
    status,
    rawStatus,
    type: 'PRECLOSE',
    raw: row,
  };
};

export const normalizeClosedItem = (row: any): SettlementRecord => {
  const settlementId = Number(row?.settlement_id ?? row?.id ?? 0);
  const investmentId = row?.investment_code ?? row?.investment_id ?? '—';
  const investor = extractInvestorName(row);
  const investorId = String(row?.investor_id ?? row?.investor_registration_id ?? '—');
  const branch = String(row?.branch_name ?? row?.branch ?? '—');
  const cityName = String(row?.city_name ?? row?.city ?? '');
  const bondNumber = String(row?.bond_number ?? row?.bondId ?? row?.bond_id ?? '—');

  const investmentDate = String(row?.investment_date ?? '—');
  const date = String(row?.paid_date ?? row?.modified_date ?? row?.created_date ?? row?.maturity_date ?? '—');

  const principal = Number(row?.principal_amount ?? row?.investment_amount ?? row?.principal ?? 0) || 0;
  const interestEarned = Number(row?.interest_amount ?? row?.expected_interest_amount ?? row?.interestEarned ?? 0) || 0;
  const gstAmount = Number(row?.gst_amount ?? Math.round(interestEarned * 0.18)) || 0;
  const penalty = Number(row?.penalty_amount ?? 0) || 0;

  const rawNet = Number(row?.net_settlement_amount ?? row?.net_settlement ?? 0);
  const netSettlementAmount = rawNet || (principal + interestEarned - gstAmount - penalty);

  const rawStatus = String(row?.status_name ?? row?.status ?? 'Paid');
  const status = normalizeSettlementStatus(rawStatus);

  return {
    id: settlementId || investmentId,
    settlementId: settlementId || undefined,
    investmentId,
    investor,
    investorName: investor,
    investorId,
    branch,
    cityName,
    bondNumber,
    investmentDate,
    date,
    principal,
    interestEarned,
    gstAmount,
    penalty,
    netSettlementAmount,
    status,
    rawStatus,
    type: 'CLOSED',
    raw: row,
  };
};

/* ============================================================
   SERVICES (Matching Web & Swagger Endpoints)
   ============================================================ */

/**
 * 1. GET /admin/settlements/tenure-timeout
 */
export const getTenureTimeoutSettlements = async (
  params: GetSettlementParams = {},
): Promise<{ items: SettlementRecord[]; raw: any }> => {
  const query = new URLSearchParams({
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),
  }).toString();

  const response = await apiRequest(`/admin/settlements/tenure-timeout?${query}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const items = rawList.map(normalizeTenureItem);

  return { items, raw: response };
};

/**
 * 2. GET /admin/settlements/preclose
 */
export const getPrecloseRequests = async (
  params: GetSettlementParams = {},
): Promise<{ items: SettlementRecord[]; raw: any }> => {
  const query = new URLSearchParams({
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),
  }).toString();

  const response = await apiRequest(`/admin/settlements/preclose?${query}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const items = rawList.map(normalizePrecloseItem);

  return { items, raw: response };
};

/**
 * 3. GET /admin/settlements/closed
 */
export const getClosedSettlements = async (
  params: GetSettlementParams = {},
): Promise<{ items: SettlementRecord[]; raw: any }> => {
  const query = new URLSearchParams({
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),
  }).toString();

  const response = await apiRequest(`/admin/settlements/closed?${query}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const items = rawList.map(normalizeClosedItem);

  return { items, raw: response };
};

/**
 * 4. PUT /admin/settlements/tenure-timeout/{settlement_id}/approve
 */
export const approveTenureTimeoutSettlement = async (
  settlementId: number | string,
): Promise<ApiResponse> => {
  const idNum = Number(settlementId);
  if (!idNum) {
    throw new Error('Valid Settlement ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/tenure-timeout/${idNum}/approve`,
    {
      method: 'PUT',
    },
  );
};

/**
 * 5. PUT /admin/settlements/tenure-timeout/{settlement_id}/reject
 */
export const rejectTenureTimeoutSettlement = async (
  settlementId: number | string,
): Promise<ApiResponse> => {
  const idNum = Number(settlementId);
  if (!idNum) {
    throw new Error('Valid Settlement ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/tenure-timeout/${idNum}/reject`,
    {
      method: 'PUT',
    },
  );
};

/**
 * 6. PUT /admin/settlements/preclose/{request_id}/approve
 */
export const approvePrecloseRequest = async (
  requestId: number | string,
): Promise<ApiResponse> => {
  const idNum = Number(requestId);
  if (!idNum) {
    throw new Error('Valid Request ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/preclose/${idNum}/approve`,
    {
      method: 'PUT',
    },
  );
};

/**
 * 7. PUT /admin/settlements/preclose/{request_id}/reject
 */
export const rejectPrecloseRequest = async (
  requestId: number | string,
): Promise<ApiResponse> => {
  const idNum = Number(requestId);
  if (!idNum) {
    throw new Error('Valid Request ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/preclose/${idNum}/reject`,
    {
      method: 'PUT',
    },
  );
};
