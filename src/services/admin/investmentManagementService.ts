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
   TYPES
   ============================================================ */

export type InvestmentStatus =
  | 'Pending'
  | 'Active'
  | 'Rejected'
  | 'Matured'
  | 'Closed';

export interface InvestmentRecord {
  id: string;
  investmentId: string;
  investorId: string;
  investorName: string;
  bondId: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  investmentDate: string;
  maturityDate: string;
  status: InvestmentStatus;
  rawStatus: string;
  remarks?: string;
  rejectionReason?: string;
  raw: any;
}

export interface TenureExtensionRecord {
  requestId: number;
  investorId: string;
  investorName: string;
  bondId: string;
  currentMaturityDate: string;
  currentInterestRate: number;
  requestedExtension: string;
  submittedDate: string;
  status: string;
  remarks?: string;
  raw: any;
}

export interface InvestmentDetails {
  investmentId: string;
  investorId: string;
  investorName: string;
  bondId?: string;
  amount: number;
  interestRate: number;
  tenureMonths: number;
  investmentDate: string;
  maturityDate: string;
  status: string;
  mobile?: string;
  email?: string;
  aadhar?: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  raw: any;
}

export interface ApiResponse<T = any> {
  success?: boolean;
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
   LIST EXTRACTION HELPER
   ============================================================ */

export const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  return [];
};

/* ============================================================
   STATUS NORMALIZATION (Matching Web)
   ============================================================ */

export const normalizeInvestmentStatus = (rawStatus?: string): InvestmentStatus => {
  const s = String(rawStatus || '').toLowerCase().trim();

  if (
    s === 'pending' ||
    s === 'pending approval' ||
    s === 'awaiting approval' ||
    s === 'waiting for approval' ||
    s === 'under review' ||
    s === 'submitted'
  ) {
    return 'Pending';
  }

  if (s === 'approved' || s === 'active' || s === 'success') {
    return 'Active';
  }

  if (s === 'rejected' || s === 'cancelled' || s === 'canceled') {
    return 'Rejected';
  }

  if (s === 'matured') {
    return 'Matured';
  }

  if (s === 'closed' || s === 'completed' || s === 'settled') {
    return 'Closed';
  }

  return 'Active';
};

/* ============================================================
   INVESTOR NAME EXTRACTION
   ============================================================ */

export const extractInvestorName = (raw: any): string => {
  if (!raw || typeof raw !== 'object') return '—';

  const candidates = [
    raw.investor_name,
    raw.investorName,
    raw.investor_full_name,
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
   RECORD NORMALIZERS
   ============================================================ */

export const mapInvestmentRecord = (raw: any): InvestmentRecord => {
  const investmentId = String(
    raw?.investment_id ??
    raw?.investmentId ??
    raw?.id ??
    '—',
  );

  const investorId = String(
    raw?.investor_id ??
    raw?.investorId ??
    raw?.investor_registration_id ??
    '—',
  );

  const investorName = extractInvestorName(raw);

  const bondId = String(
    raw?.bond_id ??
    raw?.bondId ??
    raw?.bond_number ??
    raw?.bondNumber ??
    '—',
  );

  const amount = Number(
    raw?.investment_amount ??
    raw?.amount ??
    raw?.principal_amount ??
    raw?.invested_amount ??
    0,
  ) || 0;

  const interestRate = Number(
    raw?.interest_rate ??
    raw?.rate ??
    raw?.current_interest_rate ??
    0,
  ) || 0;

  const tenureMonths = Number(
    raw?.tenure_months ??
    raw?.tenure ??
    raw?.tenureMonths ??
    0,
  ) || 0;

  const investmentDate = String(
    raw?.investment_date ??
    raw?.invested_date ??
    raw?.created_date ??
    '—',
  );

  const maturityDate = String(
    raw?.maturity_date ??
    raw?.current_maturity_date ??
    '—',
  );

  const rawStatus = String(
    raw?.investment_status ??
    raw?.status ??
    'Pending',
  );

  const status = normalizeInvestmentStatus(rawStatus);

  return {
    id: investmentId,
    investmentId,
    investorId,
    investorName,
    bondId,
    amount,
    interestRate,
    tenureMonths,
    investmentDate,
    maturityDate,
    status,
    rawStatus,
    remarks: raw?.remarks,
    rejectionReason: raw?.rejection_reason,
    raw,
  };
};

export const mapTenureExtensionRecord = (raw: any): TenureExtensionRecord => {
  const requestId = Number(raw?.request_id ?? raw?.requestId ?? raw?.id ?? 0);
  const investorId = String(raw?.investor_id ?? raw?.investorId ?? '—');
  const investorName = extractInvestorName(raw);
  const bondId = String(raw?.bond_id ?? raw?.bondId ?? raw?.bond_number ?? '—');
  const currentMaturityDate = String(raw?.current_maturity_date ?? raw?.maturity_date ?? '—');
  const currentInterestRate = Number(raw?.current_interest_rate ?? raw?.interest_rate ?? 0) || 0;
  const requestedExtension = String(raw?.requested_extension ?? raw?.extension ?? '—');
  const submittedDate = String(raw?.submitted_date ?? raw?.created_date ?? '—');
  const status = String(raw?.request_status ?? raw?.status ?? 'Pending');

  return {
    requestId,
    investorId,
    investorName,
    bondId,
    currentMaturityDate,
    currentInterestRate,
    requestedExtension,
    submittedDate,
    status,
    remarks: raw?.remarks,
    raw,
  };
};

/* ============================================================
   SWAGGER SERVICES (Matching Web investmentManagementService)
   ============================================================ */

/**
 * 1. GET /admin/investments
 */
export const getInvestments = async (
  params: { bondId?: string; limit?: number; offset?: number } = {},
): Promise<{ records: InvestmentRecord[]; total: number; raw: any }> => {
  const query = new URLSearchParams();
  if (params.bondId?.trim()) query.append('bond_id', params.bondId.trim());
  query.append('limit', String(params.limit || 100));
  query.append('offset', String(params.offset || 0));

  const response = await apiRequest(`/admin/investments?${query.toString()}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const records = rawList.map(mapInvestmentRecord);
  const total = Number(response?.total ?? records.length);

  return { records, total, raw: response };
};

/**
 * 2. GET /admin/investments/pending
 */
export const getPendingInvestments = async (
  params: { limit?: number; offset?: number } = {},
): Promise<{ records: InvestmentRecord[]; total: number; raw: any }> => {
  const query = new URLSearchParams({
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),
  }).toString();

  const response = await apiRequest(`/admin/investments/pending?${query}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const records = rawList.map(mapInvestmentRecord);
  const total = Number(response?.total ?? records.length);

  return { records, total, raw: response };
};

/**
 * 3. GET /admin/investments/{investment_id} & /admin/investments/{investment_id}/bond
 */
export const getInvestmentDetails = async (
  investmentId: string | number,
): Promise<InvestmentDetails> => {
  const idStr = String(investmentId).trim();
  if (!idStr) throw new Error('Investment ID is required.');

  let res: any = null;
  try {
    res = await apiRequest(`/admin/investments/${encodeURIComponent(idStr)}`, {
      method: 'GET',
    });
  } catch (err) {
    console.log('getInvestmentDetails note:', err);
  }

  let bondRes: any = null;
  try {
    bondRes = await apiRequest(
      `/admin/investments/${encodeURIComponent(idStr)}/bond`,
      { method: 'GET' },
    );
  } catch (err) {
    console.log('getInvestmentBond note:', err);
  }

  const d = res?.data || res || {};
  const b = bondRes?.data || bondRes || {};
  const combined = { ...d, ...b };

  return {
    investmentId: String(combined?.investment_id ?? idStr),
    investorId: String(combined?.investor_id ?? combined?.investor_registration_id ?? '—'),
    investorName: extractInvestorName(combined),
    bondId: combined?.bond_id || combined?.bond_number,
    amount: Number(combined?.investment_amount ?? combined?.amount ?? 0) || 0,
    interestRate: Number(combined?.interest_rate ?? combined?.rate ?? 0) || 0,
    tenureMonths: Number(combined?.tenure_months ?? combined?.tenure ?? 0) || 0,
    investmentDate: String(combined?.investment_date ?? '—'),
    maturityDate: String(combined?.maturity_date ?? '—'),
    status: String(combined?.investment_status ?? combined?.status ?? 'Active'),
    mobile: combined?.mobile,
    email: combined?.email,
    aadhar: combined?.aadhar || combined?.aadhaar,
    pan: combined?.pan,
    bankName: combined?.bank_name || combined?.bank?.name,
    accountNumber: combined?.account_number || combined?.bank?.account_number,
    ifscCode: combined?.ifsc_code || combined?.bank?.ifsc,
    raw: combined,
  };
};

/**
 * 4. PUT /admin/investments/{investment_id}/approve
 */
export const approveInvestment = async (
  investmentId: string | number,
  payload: { interestRate: number; remarks?: string },
): Promise<ApiResponse> => {
  const idStr = String(investmentId).trim();
  if (!idStr) throw new Error('Investment ID is required.');

  const rateNum = Number(payload.interestRate);
  if (isNaN(rateNum) || rateNum < 0) {
    throw new Error('Valid numeric Interest Rate is required.');
  }

  return await apiRequest(
    `/admin/investments/${encodeURIComponent(idStr)}/approve`,
    {
      method: 'PUT',
      body: JSON.stringify({
        interest_rate: rateNum,
        remarks: payload.remarks || null,
      }),
    },
  );
};

/**
 * 5. PUT /admin/investments/{investment_id}/reject
 */
export const rejectInvestment = async (
  investmentId: string | number,
  payload: { rejectionReason: string; remarks?: string },
): Promise<ApiResponse> => {
  const idStr = String(investmentId).trim();
  if (!idStr) throw new Error('Investment ID is required.');

  if (!payload.rejectionReason?.trim()) {
    throw new Error('Rejection Reason is required.');
  }

  return await apiRequest(
    `/admin/investments/${encodeURIComponent(idStr)}/reject`,
    {
      method: 'PUT',
      body: JSON.stringify({
        rejection_reason: payload.rejectionReason.trim(),
        remarks: payload.remarks || null,
      }),
    },
  );
};

/**
 * 6. GET /admin/tenure-extensions/pending
 */
export const getPendingTenureExtensions = async (
  params: { limit?: number; offset?: number } = {},
): Promise<{ records: TenureExtensionRecord[]; total: number; raw: any }> => {
  const query = new URLSearchParams({
    limit: String(params.limit || 100),
    offset: String(params.offset || 0),
  }).toString();

  const response = await apiRequest(`/admin/tenure-extensions/pending?${query}`, {
    method: 'GET',
  });

  const rawList = getList(response);
  const records = rawList.map(mapTenureExtensionRecord);
  const total = Number(response?.total ?? records.length);

  return { records, total, raw: response };
};

/**
 * 7. PUT /admin/tenure-extensions/{request_id}/approve
 * Admin directly approves the tenure extension!
 */
export const approveTenureExtension = async (
  requestId: number | string,
  payload: { remarks?: string } = {},
): Promise<ApiResponse> => {
  const idNum = Number(requestId);
  if (!idNum) throw new Error('Valid Tenure Extension Request ID is required.');

  try {
    return await apiRequest(`/admin/tenure-extensions/${idNum}/approve`, {
      method: 'PUT',
      body: JSON.stringify({
        remarks: payload.remarks?.trim() || 'Approved by Admin.',
      }),
    });
  } catch (err) {
    // Preserve fallback for existing backend compatibility if required
    return await apiRequest(`/admin/tenure-extensions/${idNum}/submit`, {
      method: 'PUT',
      body: JSON.stringify({
        remarks: payload.remarks?.trim() || 'Approved by Admin.',
      }),
    });
  }
};

/**
 * 8. PUT /admin/tenure-extensions/{request_id}/reject
 * Admin rejects the tenure extension request
 */
export const rejectTenureExtension = async (
  requestId: number | string,
  payload: { remarks?: string } = {},
): Promise<ApiResponse> => {
  const idNum = Number(requestId);
  if (!idNum) throw new Error('Valid Tenure Extension Request ID is required.');

  return await apiRequest(`/admin/tenure-extensions/${idNum}/reject`, {
    method: 'PUT',
    body: JSON.stringify({
      remarks: payload.remarks?.trim() || 'Rejected by Admin.',
    }),
  });
};

/**
 * Backward compatibility alias:
 * submitTenureExtension points to approveTenureExtension
 */
export const submitTenureExtension = approveTenureExtension;
