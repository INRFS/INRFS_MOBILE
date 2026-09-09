import AsyncStorage from '@react-native-async-storage/async-storage';
import {ENV} from '../../config/env';

/* ============================================================
   CONFIG
   ============================================================ */

const API_BASE_URL = ENV?.API_BASE_URL || 'https://investor.inrfs.com/api';

const AUTH_TOKEN_KEYS = [
  'access_token',
  'accessToken',
  'token',
  'authToken',
  'auth_token',
  'admin_token',
  'jwt',
];

const GST_RATE = 0.18;

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
  type: 'TENURE_TIMEOUT' | 'PRECLOSE' | 'CLOSED' | 'Tenure Timeout' | 'Pre-Close';
  raw: any;
}

export interface GetSettlementParams {
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T = any> {
  success?: boolean;
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
      if (val && val !== 'null' && val !== 'undefined') {
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

    if (response.status === 401) {
      errorMessage = 'Authentication failed. Please login again.';
    } else if (typeof responseBody === 'string') {
      errorMessage = responseBody;
    } else if (responseBody?.detail) {
      if (typeof responseBody.detail === 'string') {
        errorMessage = responseBody.detail;
      } else if (Array.isArray(responseBody.detail)) {
        errorMessage = responseBody.detail
          .map((d: any) =>
            typeof d === 'string' ? d : d.msg || d.message || String(d),
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
   VALUE & NUMBER EXTRACTION HELPERS (Matching Web)
   ============================================================ */

const getValue = (row: any, keys: string[], fallback: any = null) => {
  for (const key of keys) {
    if (
      row &&
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ''
    ) {
      return row[key];
    }
  }
  return fallback;
};

const toNumber = (value: any, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

/* ============================================================
   LIST EXTRACTION HELPER (Matching Web getList)
   ============================================================ */

export const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.settlements)) return response.settlements;
  if (Array.isArray(response.requests)) return response.requests;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.tenure_timeout_settlements)) {
    return response.tenure_timeout_settlements;
  }
  if (Array.isArray(response.preclose_requests)) {
    return response.preclose_requests;
  }
  if (Array.isArray(response.closed_settlements)) {
    return response.closed_settlements;
  }
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
    raw.full_name,
    raw.fullName,
    raw.name,
    raw.investor,
    raw.investor?.name,
    raw.investor?.investor_name,
    raw.investor?.full_name,
    raw.user?.name,
  ];

  for (const c of candidates) {
    if (
      typeof c === 'string' &&
      c.trim() &&
      c.trim().toLowerCase() !== 'investor' &&
      c.trim().toLowerCase() !== 'unknown' &&
      c.trim().toLowerCase() !== 'null' &&
      c.trim().toLowerCase() !== 'undefined'
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

export const normalizeSettlementStatus = (
  rawStatus?: string,
  remarks?: string,
): SettlementStatus => {
  const rem = String(remarks || '').toLowerCase();
  if (
    rem.includes('sent to super admin') ||
    rem.includes('waiting for super admin')
  ) {
    return 'Pending Super Admin';
  }

  if (!rawStatus) {
    return 'Pending';
  }

  const s = String(rawStatus).trim().toLowerCase();

  if (s === 'paid') {
    return 'Paid';
  }
  if (s === 'approved' || s === 'settled' || s === 'completed') {
    return 'Approved';
  }
  if (s === 'rejected' || s === 'declined' || s === 'reject') {
    return 'Rejected';
  }
  if (
    s.includes('awaiting') ||
    s.includes('super admin') ||
    s.includes('waiting')
  ) {
    return 'Pending Super Admin';
  }
  if (
    s.includes('pending') ||
    s.includes('requested') ||
    s.includes('submitted') ||
    s.includes('created')
  ) {
    return 'Pending';
  }
  return 'Pending';
};

/* ============================================================
   NORMALIZERS (Matching Web)
   ============================================================ */

export const normalizeTenureItem = (
  row: any,
  index: number = 0,
): SettlementRecord => {
  const source = row?.settlement || row?.details || row || {};

  const principal = toNumber(
    getValue(
      source,
      [
        'principal_amount',
        'principal',
        'investment_amount',
        'amount',
      ],
      0,
    ),
  );

  const interestEarned = toNumber(
    getValue(
      source,
      [
        'interest_amount',
        'interest_earned',
        'interestEarned',
        'expected_interest_amount',
        'total_interest',
      ],
      0,
    ),
  );

  const gstAmount = toNumber(
    getValue(
      source,
      ['gst_amount', 'gst', 'gstAmount'],
      Number((interestEarned * GST_RATE).toFixed(2)),
    ),
  );

  const penalty = toNumber(
    getValue(source, ['penalty_amount', 'penalty'], 0),
  );

  const netSettlementAmount = toNumber(
    getValue(
      source,
      [
        'net_settlement_amount',
        'netSettlementAmount',
        'net_settlement',
        'net_payable',
      ],
      Number((principal + interestEarned - gstAmount - penalty).toFixed(2)),
    ),
  );

  const rawStatus = getValue(
    source,
    ['status_name', 'status', 'settlement_status'],
    'Pending',
  );
  const remarks = String(getValue(source, ['remarks'], '') || '');
  const status = normalizeSettlementStatus(rawStatus, remarks);

  const rawSettlementId = getValue(source, ['settlement_id', 'id'], null);
  const settlementId =
    rawSettlementId !== null ? Number(rawSettlementId) || rawSettlementId : undefined;
  const investmentId = String(
    getValue(source, ['investment_id', 'investment_code'], '—'),
  );
  const investor = extractInvestorName(source);
  const investorId = String(
    getValue(
      source,
      ['investor_id', 'investorId', 'investor_registration_id'],
      '—',
    ),
  );
  const branch = String(
    getValue(source, ['branch_name', 'branch', 'location_name'], '—'),
  );
  const cityName = String(getValue(source, ['city_name', 'city', 'location'], ''));
  const bondNumber = String(
    getValue(source, ['bond_number', 'bond_id', 'bondId'], '—'),
  );
  const investmentDate = String(getValue(source, ['investment_date'], '—'));
  const maturedOn = String(
    getValue(source, ['maturity_date', 'matured_on'], '—'),
  );
  const date = String(
    getValue(
      source,
      ['approved_date', 'paid_date', 'created_date', 'maturity_date', 'matured_on'],
      maturedOn,
    ),
  );

  return {
    id: rawSettlementId ?? investmentId ?? index,
    settlementId: typeof settlementId === 'number' ? settlementId : undefined,
    investmentId,
    investor,
    investorName: investor,
    investorId,
    branch,
    cityName,
    bondNumber,
    investmentDate,
    maturedOn,
    date,
    principal,
    interestEarned,
    gstAmount,
    penalty,
    netSettlementAmount,
    status,
    rawStatus: String(rawStatus),
    type: 'TENURE_TIMEOUT',
    raw: source,
  };
};

export const normalizePrecloseItem = (
  row: any,
  index: number = 0,
): SettlementRecord => {
  const source = row?.request || row?.preclose || row?.details || row || {};

  const principal = toNumber(
    getValue(
      source,
      [
        'principal_amount',
        'investment_amount',
        'principal',
        'amount',
      ],
      0,
    ),
  );

  const interestEarned = toNumber(
    getValue(
      source,
      [
        'interest_amount',
        'interest_earned',
        'expected_interest_amount',
        'interestEarned',
        'total_interest',
      ],
      0,
    ),
  );

  const penalty = toNumber(
    getValue(source, ['penalty_amount', 'penalty'], 0),
  );

  const gstAmount = toNumber(
    getValue(
      source,
      ['gst_amount', 'gst', 'gstAmount'],
      Number((interestEarned * GST_RATE).toFixed(2)),
    ),
  );

  const netSettlementAmount = toNumber(
    getValue(
      source,
      [
        'net_settlement_amount',
        'net_payable',
        'settlement_amount',
        'netSettlementAmount',
        'net_settlement',
      ],
      Number((principal + interestEarned - gstAmount - penalty).toFixed(2)),
    ),
  );

  const rawStatus = getValue(
    source,
    ['request_status', 'status_name', 'status', 'settlement_status'],
    'Pending',
  );
  const remarks = String(getValue(source, ['remarks'], '') || '');
  const status = normalizeSettlementStatus(rawStatus, remarks);

  const rawRequestId = getValue(
    source,
    ['request_id', 'preclose_request_id', 'id'],
    null,
  );
  const requestId =
    rawRequestId !== null ? Number(rawRequestId) || rawRequestId : undefined;
  const investmentId = String(
    getValue(source, ['investment_id', 'investment_code'], '—'),
  );
  const investor = extractInvestorName(source);
  const investorId = String(
    getValue(
      source,
      ['investor_id', 'investorId', 'investor_registration_id'],
      '—',
    ),
  );
  const branch = String(
    getValue(source, ['branch_name', 'branch', 'location_name'], '—'),
  );
  const cityName = String(getValue(source, ['city_name', 'city'], ''));
  const bondNumber = String(
    getValue(source, ['bond_number', 'bond_id', 'bondId'], '—'),
  );
  const investmentDate = String(getValue(source, ['investment_date'], '—'));
  const requestedDate = String(
    getValue(source, ['requested_date', 'created_date', 'date'], '—'),
  );
  const reason = String(
    getValue(source, ['preclose_reason', 'reason', 'remarks'], '—'),
  );

  return {
    id: rawRequestId ?? investmentId ?? index,
    requestId: typeof requestId === 'number' ? requestId : undefined,
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
    rawStatus: String(rawStatus),
    type: 'PRECLOSE',
    raw: source,
  };
};

export const normalizeClosedItem = (
  row: any,
  index: number = 0,
): SettlementRecord => {
  const source = row?.settlement || row?.details || row || {};

  const typeValue = String(
    getValue(source, ['settlement_type', 'type', 'request_type'], ''),
  )
    .trim()
    .toUpperCase();

  const isPreClose =
    typeValue === 'PRECLOSE' ||
    typeValue === 'PRE_CLOSE' ||
    typeValue === 'PRE-CLOSE';

  const principal = toNumber(
    getValue(
      source,
      [
        'principal_amount',
        'principal',
        'investment_amount',
        'amount',
      ],
      0,
    ),
  );

  const interestEarned = toNumber(
    getValue(
      source,
      [
        'interest_amount',
        'interest_earned',
        'interestEarned',
        'expected_interest_amount',
        'total_interest',
      ],
      0,
    ),
  );

  const gstAmount = toNumber(
    getValue(
      source,
      ['gst_amount', 'gst', 'gstAmount'],
      Number((interestEarned * GST_RATE).toFixed(2)),
    ),
  );

  const penalty = toNumber(
    getValue(source, ['penalty_amount', 'penalty'], 0),
  );

  const netSettlementAmount = toNumber(
    getValue(
      source,
      [
        'net_settlement_amount',
        'net_settlement',
        'net_payable',
        'netSettlementAmount',
      ],
      Number((principal + interestEarned - gstAmount - penalty).toFixed(2)),
    ),
  );

  const rawStatus = getValue(
    source,
    ['status_name', 'status', 'settlement_status'],
    'Paid',
  );
  const remarks = String(getValue(source, ['remarks'], '') || '');
  const status = normalizeSettlementStatus(rawStatus, remarks);

  const rawSettlementId = getValue(
    source,
    ['settlement_id', 'id', 'request_id'],
    null,
  );
  const settlementId =
    rawSettlementId !== null ? Number(rawSettlementId) || rawSettlementId : undefined;
  const investmentId = String(
    getValue(source, ['investment_id', 'investment_code'], '—'),
  );
  const investor = extractInvestorName(source);
  const investorId = String(
    getValue(
      source,
      ['investor_id', 'investorId', 'investor_registration_id'],
      '—',
    ),
  );
  const branch = String(
    getValue(source, ['branch_name', 'branch', 'location_name'], '—'),
  );
  const cityName = String(getValue(source, ['city_name', 'city'], ''));
  const bondNumber = String(
    getValue(source, ['bond_number', 'bond_id', 'bondId'], '—'),
  );
  const investmentDate = String(getValue(source, ['investment_date'], '—'));
  const date = String(
    getValue(
      source,
      [
        'approved_date',
        'paid_date',
        'created_date',
        'maturity_date',
        'modified_date',
        'settlement_date',
      ],
      '—',
    ),
  );

  return {
    id: rawSettlementId ?? investmentId ?? index,
    settlementId: typeof settlementId === 'number' ? settlementId : undefined,
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
    status:
      status === 'Pending' || status === 'Pending Super Admin'
        ? 'Approved'
        : status,
    rawStatus: String(rawStatus),
    type: isPreClose ? 'PRECLOSE' : 'TENURE_TIMEOUT',
    raw: source,
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
  const items = rawList.map((row, idx) => normalizeTenureItem(row, idx));

  return { items, raw: response };
};

/**
 * 2. GET /admin/settlements/tenure-timeout/{settlement_id}
 */
export const getTenureTimeoutSettlementDetails = async (
  settlementId: number | string,
): Promise<any> => {
  if (
    settlementId === undefined ||
    settlementId === null ||
    settlementId === ''
  ) {
    throw new Error('Settlement ID is required');
  }

  return apiRequest(
    `/admin/settlements/tenure-timeout/${encodeURIComponent(String(settlementId))}`,
    {
      method: 'GET',
    },
  );
};

/**
 * 3. GET /admin/settlements/preclose
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
  const items = rawList.map((row, idx) => normalizePrecloseItem(row, idx));

  return { items, raw: response };
};

/**
 * 4. GET /admin/settlements/preclose/{request_id}
 */
export const getPrecloseRequestDetails = async (
  requestId: number | string,
): Promise<any> => {
  if (
    requestId === undefined ||
    requestId === null ||
    requestId === ''
  ) {
    throw new Error('Pre-close request ID is required');
  }

  return apiRequest(
    `/admin/settlements/preclose/${encodeURIComponent(String(requestId))}`,
    {
      method: 'GET',
    },
  );
};

/**
 * 5. GET /admin/settlements/closed
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
  const items = rawList.map((row, idx) => normalizeClosedItem(row, idx));

  return { items, raw: response };
};

/**
 * 6. PUT /admin/settlements/tenure-timeout/{settlement_id}/approve
 */
export const approveTenureTimeoutSettlement = async (
  settlementId: number | string,
): Promise<ApiResponse> => {
  if (
    settlementId === undefined ||
    settlementId === null ||
    settlementId === ''
  ) {
    throw new Error('Valid Settlement ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/tenure-timeout/${encodeURIComponent(String(settlementId))}/approve`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

/**
 * 7. PUT /admin/settlements/tenure-timeout/{settlement_id}/reject
 */
export const rejectTenureTimeoutSettlement = async (
  settlementId: number | string,
): Promise<ApiResponse> => {
  if (
    settlementId === undefined ||
    settlementId === null ||
    settlementId === ''
  ) {
    throw new Error('Valid Settlement ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/tenure-timeout/${encodeURIComponent(String(settlementId))}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

/**
 * 8. PUT /admin/settlements/preclose/{request_id}/approve
 */
export const approvePrecloseRequest = async (
  requestId: number | string,
): Promise<ApiResponse> => {
  if (
    requestId === undefined ||
    requestId === null ||
    requestId === ''
  ) {
    throw new Error('Valid Request ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/preclose/${encodeURIComponent(String(requestId))}/approve`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

/**
 * 9. PUT /admin/settlements/preclose/{request_id}/reject
 */
export const rejectPrecloseRequest = async (
  requestId: number | string,
): Promise<ApiResponse> => {
  if (
    requestId === undefined ||
    requestId === null ||
    requestId === ''
  ) {
    throw new Error('Valid Request ID is required.');
  }

  return await apiRequest(
    `/admin/settlements/preclose/${encodeURIComponent(String(requestId))}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

export { API_BASE_URL };

export default {
  getTenureTimeoutSettlements,
  getTenureTimeoutSettlementDetails,
  approveTenureTimeoutSettlement,
  rejectTenureTimeoutSettlement,
  getPrecloseRequests,
  getPrecloseRequestDetails,
  approvePrecloseRequest,
  rejectPrecloseRequest,
  getClosedSettlements,
  getList,
};

