import AsyncStorage from '@react-native-async-storage/async-storage';

/* ============================================================
   CONFIG & AUTH CONSTANTS
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
   TYPES & INTERFACES (Matching Swagger OpenAPI Spec)
   ============================================================ */

export type PayoutStatus =
  | 'pending'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'overdue'
  | 'upcoming';

export interface MonthlyInterestRecord {
  id: string;
  interestScheduleId: number;
  scheduleId?: number;
  investor: string;
  investorName: string;
  bondId: string;
  amount: number;
  gstAmount: number;
  netPayable: number;
  dueDate: string;
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
  success: boolean;
  message?: string;
  data?: T;
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
   STATUS NORMALIZATION HELPER
   ============================================================ */

export const normalizePayoutStatus = (status?: string, actions?: string): PayoutStatus => {
  const s = String(status || '').toLowerCase().trim();
  const a = String(actions || '').toLowerCase().trim();

  if (s.includes('paid') || a.includes('paid')) return 'paid';
  if (s.includes('approved') || a.includes('approved')) return 'approved';
  if (s.includes('reject') || a.includes('reject')) return 'rejected';
  if (
    s.includes('awaiting') ||
    s.includes('pending_approval') ||
    s.includes('waiting') ||
    a.includes('waiting') ||
    a.includes('super admin')
  ) {
    return 'pending_approval';
  }
  if (s.includes('overdue')) return 'overdue';
  if (s.includes('upcoming')) return 'upcoming';
  return 'pending';
};

/* ============================================================
   INVESTOR NAME EXTRACTION (Matching Swagger & Web Priority)
   ============================================================ */

export const extractInvestorName = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return '—';

  // Swagger and Backend prioritize "investor", "investor_name", "investorName", "full_name", "name"
  const candidates = [
    raw.investor,
    raw.investor_name,
    raw.investorName,
    raw.full_name,
    raw.fullName,
    raw.name,
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
   SWAGGER RESPONSE RECORD MAPPER
   ============================================================ */

export const mapMonthlyInterestRecord = (raw: any): MonthlyInterestRecord => {
  const scheduleId = Number(
    raw?.interest_schedule_id ??
    raw?.interestScheduleId ??
    raw?.id ??
    0,
  );

  const id = scheduleId ? String(scheduleId) : '';
  const investorName = extractInvestorName(raw);

  const bondId =
    raw?.bond_number ??
    raw?.bondNumber ??
    raw?.bond_id ??
    raw?.bondId ??
    '—';

  const amount = Number(raw?.interest_amount ?? raw?.amount ?? 0) || 0;
  const gstAmount = Number(raw?.gst_amount ?? raw?.gst ?? Math.round(amount * 0.18)) || 0;
  const netPayable =
    Number(raw?.net_interest_amount ?? raw?.net_payable ?? raw?.netAmount ?? amount - gstAmount) ||
    amount - gstAmount;

  const dueDate =
    raw?.due_date ??
    raw?.dueDate ??
    raw?.interest_due_date ??
    raw?.interestDueDate ??
    '—';

  const rawStatus = String(raw?.status ?? 'Pending');
  const actions = raw?.actions ? String(raw.actions) : undefined;
  const status = normalizePayoutStatus(rawStatus, actions);

  return {
    id,
    interestScheduleId: scheduleId,
    investor: investorName,
    investorName,
    bondId,
    amount,
    gstAmount,
    netPayable,
    dueDate,
    status,
    rawStatus,
    actions,
    reference: raw?.reference ?? raw?.transaction_ref ?? '–',
    overdueDays: raw?.overdue_days,
    raw,
  };
};

/* ============================================================
   REAL SWAGGER APIS (Tested & Verified with Backend)
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

  const dateVal = params.interestDueDate || params.dueDate;
  if (dateVal?.trim()) {
    // If date format is DD-MM-YYYY, convert to YYYY-MM-DD for backend
    const parts = dateVal.trim().split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        queryParams.append('interest_due_date', dateVal.trim());
      } else {
        const [d, m, y] = parts;
        queryParams.append(
          'interest_due_date',
          `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`,
        );
      }
    } else {
      queryParams.append('interest_due_date', dateVal.trim());
    }
  }

  queryParams.append('limit', String(params.limit || 100));
  queryParams.append('offset', String(params.offset || 0));

  const query = queryParams.toString();
  const response = await apiRequest(`/admin/monthly-interest?${query}`, {
    method: 'GET',
  });

  const rawList: any[] = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response)
    ? response
    : [];

  const records = rawList.map(mapMonthlyInterestRecord);
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
  const idNum = Number(scheduleId);
  if (!idNum) {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  const response = await apiRequest(`/admin/monthly-interest/${idNum}`, {
    method: 'GET',
  });

  const d = response?.data || {};
  const amount = Number(d.interest_amount || 0);
  const gstAmount = Number(d.gst_amount || 0);
  const netPayable = Number(d.net_interest_amount || amount - gstAmount);

  return {
    interestScheduleId: Number(d.interest_schedule_id || idNum),
    investorId: String(d.investor_id || ''),
    investorName: extractInvestorName(d),
    mobile: String(d.mobile || ''),
    bondId: String(d.bond_id || ''),
    investmentId: String(d.investment_id || ''),
    interestMonth: Number(d.interest_month || 0),
    dueDate: String(d.interest_due_date || ''),
    amount,
    gstAmount,
    netPayable,
    paymentStatus: String(d.payment_status || ''),
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
  const idNum = Number(scheduleId);
  if (!idNum) {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(
    `/admin/monthly-interest/${idNum}/send-for-approval`,
    {
      method: 'PUT',
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
  let formattedDate: string | undefined = undefined;

  if (interestDueDate?.trim()) {
    const parts = interestDueDate.trim().split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        formattedDate = interestDueDate.trim();
      } else {
        const [d, m, y] = parts;
        formattedDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    } else {
      formattedDate = interestDueDate.trim();
    }
  }

  const bodyData = formattedDate
    ? JSON.stringify({interest_due_date: formattedDate})
    : JSON.stringify({interest_due_date: new Date().toISOString().slice(0, 10)});

  return await apiRequest(
    '/admin/monthly-interest/send-all-for-approval',
    {
      method: 'PUT',
      body: bodyData,
    },
  );
};

/**
 * 5. PUT /admin/monthly-interest/{interest_schedule_id}/approve
 */
export const approveMonthlyInterest = async (
  scheduleId: number | string,
): Promise<ApiResponse> => {
  const idNum = Number(scheduleId);
  if (!idNum) {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(`/admin/monthly-interest/${idNum}/approve`, {
    method: 'PUT',
  });
};

/**
 * 6. PUT /admin/monthly-interest/{interest_schedule_id}/reject
 */
export const rejectMonthlyInterest = async (
  scheduleId: number | string,
  rejectionReason: string,
  remarks?: string,
): Promise<ApiResponse> => {
  const idNum = Number(scheduleId);
  if (!idNum) {
    throw new Error('Valid Interest Schedule ID is required.');
  }

  return await apiRequest(`/admin/monthly-interest/${idNum}/reject`, {
    method: 'PUT',
    body: JSON.stringify({
      rejection_reason: rejectionReason,
      remarks: remarks || null,
    }),
  });
};

export const markMonthlyInterestPaid = approveMonthlyInterest;


