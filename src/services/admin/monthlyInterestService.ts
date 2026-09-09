import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../../config/env';

/* ============================================================
   CONFIG & AUTH CONSTANTS
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
   TYPES & INTERFACES (Matching Web & Backend)
   ============================================================ */

export type PayoutStatus =
  | 'Pending'
  | 'Awaiting Approval'
  | 'Approved'
  | 'Rejected'
  | 'Paid';

export interface MonthlyInterestRecord {
  id: string | number;
  interestScheduleId: number;
  scheduleId?: number;
  investor: string;
  investorName: string;
  bondId: string;
  amount: number;
  gstAmount: number;
  netPayable: number;
  dueDate: string;
  dueLabel: string;
  status: PayoutStatus;
  rawStatus: string;
  actions?: string;
  reference?: string;
  overdueDays?: number;
  raw?: any;
}

export interface MonthlyInterestDetails {
  interestScheduleId: number;
  investorId: string;
  investorName: string;
  mobile: string;
  bondId: string;
  investmentId: string;
  interestMonth: number;
  dueDate: string;
  amount: number;
  gstAmount: number;
  netPayable: number;
  paymentStatus: string;
  raw?: any;
}

export interface GetMonthlyInterestParams {
  interestDueDate?: string;
  dueDate?: string;
  query?: string;
  searchText?: string;
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
   VALUE & DATE HELPERS (Matching Web)
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

export const formatDate = (value: any): string => {
  if (!value || value === '—' || value === '-') return '—';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  const parts = String(value).trim().split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    } else {
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }
  }
  return String(value);
};

export const toISODate = (value: any): string => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const parts = String(value).trim().split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return '';
};

/* ============================================================
   STATUS NORMALIZATION HELPER (Matching Web Exactly)
   ============================================================ */

export const normalizePayoutStatus = (value?: any): PayoutStatus => {
  if (!value) return 'Pending';

  const status = String(value).trim().toLowerCase();

  if (
    status === 'approved' ||
    status === 'active' ||
    status === 'paid'
  ) {
    return status === 'paid' ? 'Paid' : 'Approved';
  }

  if (
    status.includes('awaiting') ||
    status.includes('super admin') ||
    status.includes('submitted') ||
    status.includes('sent for approval') ||
    status.includes('pending_approval')
  ) {
    return 'Awaiting Approval';
  }

  if (
    status === 'rejected' ||
    status === 'reject'
  ) {
    return 'Rejected';
  }

  return 'Pending';
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
    raw.user_name,
    raw.userName,
    raw.investor?.name,
    raw.investor?.investor_name,
    raw.investor?.full_name,
    raw.user?.name,
    raw.user?.full_name,
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
   SWAGGER / WEB RESPONSE RECORD MAPPER (Matching Web normalizeRow)
   ============================================================ */

export const mapMonthlyInterestRecord = (
  row: any,
  index: number = 0,
): MonthlyInterestRecord => {
  const amount = Number(
    getValue(
      row,
      [
        'interest_amount',
        'interestAmount',
        'interest',
        'amount',
        'interest_due',
        'interest_due_amount',
      ],
      0,
    ),
  );

  const dueDate = getValue(
    row,
    [
      'interest_due_date',
      'interestDueDate',
      'due_date',
      'dueDate',
      'payment_due_date',
    ],
    null,
  );

  const investor = getValue(
    row,
    [
      'investor_name',
      'investorName',
      'full_name',
      'name',
      'investor',
    ],
    extractInvestorName(row),
  );

  const bond = getValue(
    row,
    [
      'bond_number',
      'bondNumber',
      'bond_id',
      'bond',
    ],
    '—',
  );

  const rawId = getValue(
    row,
    [
      'interest_schedule_id',
      'interestScheduleId',
      'id',
      'schedule_id',
    ],
    null,
  );

  const id = rawId !== null ? rawId : index;
  const scheduleId = rawId !== null ? Number(rawId) || undefined : undefined;

  const rawStatus = getValue(
    row,
    [
      'status',
      'status_name',
      'interest_status',
      'approval_status',
    ],
    'Pending',
  );

  const status = normalizePayoutStatus(rawStatus);

  const gstAmount = Math.round(amount * GST_RATE);
  const netPayable = amount - gstAmount;

  return {
    id,
    interestScheduleId: scheduleId || Number(id) || 0,
    scheduleId,
    investor: investor || '—',
    investorName: investor || '—',
    bondId: bond || '—',
    amount,
    gstAmount,
    netPayable,
    dueDate: dueDate ? String(dueDate) : '—',
    dueLabel: formatDate(dueDate),
    status,
    rawStatus: String(rawStatus),
    actions: row?.actions ? String(row.actions) : undefined,
    reference:
      getValue(
        row,
        [
          'payment_reference',
          'paymentReference',
          'reference',
          'utr',
          'transaction_ref',
        ],
        '–',
      ) || '–',
    overdueDays: row?.overdue_days,
    raw: row,
  };
};

/* ============================================================
   APIS (Matching Web & Backend)
   ============================================================ */

/**
 * 1. GET /admin/monthly-interest
 * Parameters:
 *  - interest_due_date (optional, YYYY-MM-DD)
 *  - limit (default 100)
 *  - offset (default 0)
 */
export const getMonthlyInterest = async (
  params: GetMonthlyInterestParams = {},
): Promise<{ records: MonthlyInterestRecord[]; total: number; raw: any }> => {
  const queryParams = new URLSearchParams();

  const rawDate = params.interestDueDate || params.dueDate;
  if (rawDate?.trim()) {
    const iso = toISODate(rawDate.trim());
    if (iso) {
      queryParams.append('interest_due_date', iso);
    } else {
      queryParams.append('interest_due_date', rawDate.trim());
    }
  }

  queryParams.append('limit', String(params.limit || 100));
  queryParams.append('offset', String(params.offset || 0));

  const query = queryParams.toString();
  const response = await apiRequest(`/admin/monthly-interest?${query}`, {
    method: 'GET',
  });

  const rawList: any[] = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.items)
        ? response.items
        : [];

  const records = rawList.map((row, idx) => mapMonthlyInterestRecord(row, idx));
  const total = Number(response?.total ?? records.length);

  return {
    records,
    total,
    raw: response,
  };
};

/**
 * 2. GET /admin/monthly-interest/{interest_schedule_id}
 */
export const getMonthlyInterestDetails = async (
  scheduleId: number | string,
): Promise<MonthlyInterestDetails> => {
  if (scheduleId === undefined || scheduleId === null || scheduleId === '') {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  const response = await apiRequest(
    `/admin/monthly-interest/${encodeURIComponent(String(scheduleId))}`,
    {
      method: 'GET',
    },
  );

  const d = response?.data || response || {};
  const amount = Number(
    d.interest_amount || d.amount || d.interest || 0,
  );
  const gstAmount = Number(d.gst_amount || Math.round(amount * GST_RATE));
  const netPayable = Number(d.net_interest_amount || amount - gstAmount);

  return {
    interestScheduleId: Number(d.interest_schedule_id || scheduleId),
    investorId: String(d.investor_id || ''),
    investorName: extractInvestorName(d),
    mobile: String(d.mobile || ''),
    bondId: String(d.bond_id || d.bond_number || ''),
    investmentId: String(d.investment_id || ''),
    interestMonth: Number(d.interest_month || 0),
    dueDate: String(d.interest_due_date || d.due_date || ''),
    amount,
    gstAmount,
    netPayable,
    paymentStatus: String(d.payment_status || d.status || ''),
    raw: d,
  };
};

/**
 * 3. PUT /admin/monthly-interest/{interest_schedule_id}/send-for-approval
 * Backend sets status to "Awaiting Approval"
 */
export const sendMonthlyInterestForApproval = async (
  scheduleId: number | string,
): Promise<ApiResponse> => {
  if (scheduleId === undefined || scheduleId === null || scheduleId === '') {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(
    `/admin/monthly-interest/${encodeURIComponent(String(scheduleId))}/send-for-approval`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

/**
 * 4. PUT /admin/monthly-interest/send-all-for-approval
 * Body: { interest_due_date: "YYYY-MM-DD" }
 */
export const sendAllMonthlyInterestForApproval = async (
  interestDueDate?: string,
): Promise<ApiResponse> => {
  const formattedDate = interestDueDate?.trim()
    ? toISODate(interestDueDate.trim()) || interestDueDate.trim()
    : new Date().toISOString().slice(0, 10);

  return await apiRequest(
    '/admin/monthly-interest/send-all-for-approval',
    {
      method: 'PUT',
      body: JSON.stringify({
        interest_due_date: formattedDate,
      }),
    },
  );
};

/**
 * 5. PUT /admin/monthly-interest/{interest_schedule_id}/approve
 */
export const approveMonthlyInterest = async (
  scheduleId: number | string,
): Promise<ApiResponse> => {
  if (scheduleId === undefined || scheduleId === null || scheduleId === '') {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(
    `/admin/monthly-interest/${encodeURIComponent(String(scheduleId))}/approve`,
    {
      method: 'PUT',
      body: JSON.stringify({}),
    },
  );
};

/**
 * 6. PUT /admin/monthly-interest/{interest_schedule_id}/reject
 */
export const rejectMonthlyInterest = async (
  scheduleId: number | string,
  rejectionReason?: string,
  remarks?: string,
): Promise<ApiResponse> => {
  if (scheduleId === undefined || scheduleId === null || scheduleId === '') {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(
    `/admin/monthly-interest/${encodeURIComponent(String(scheduleId))}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({
        rejection_reason: rejectionReason || 'Rejected by admin',
        remarks: remarks || null,
      }),
    },
  );
};

export const markMonthlyInterestPaid = approveMonthlyInterest;

export { API_BASE_URL };

export default {
  getMonthlyInterest,
  getMonthlyInterestDetails,
  sendMonthlyInterestForApproval,
  sendAllMonthlyInterestForApproval,
  approveMonthlyInterest,
  rejectMonthlyInterest,
  markMonthlyInterestPaid,
  mapMonthlyInterestRecord,
  normalizePayoutStatus,
  formatDate,
  toISODate,
};



