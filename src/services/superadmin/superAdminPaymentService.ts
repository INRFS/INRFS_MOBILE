import {getAuthToken, getErrorMessage} from './superAdminDashboardService';

const API_BASE_URL = 'http://187.52.115.32:8000';

export type PaymentCategory =
  | 'All'
  | 'Monthly Interest'
  | 'Tenure Settlement'
  | 'Pre-Close Settlement'
  | 'Tenure Extension'
  | string;

export interface SuperAdminPaymentRecord {
  id: number | string;
  sourceId: number;
  paymentType: PaymentCategory;
  investorName: string;
  investorId: string;
  bondId: string;
  branchName: string;
  principalAmount?: number;
  interestAmount?: number;
  gstAmount?: number;
  penaltyAmount?: number;
  netAmount: number;
  amount: number;
  paymentMonth?: string;
  requestedBy?: string;
  approvedBy?: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected' | string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  createdDate: string;
  currentMaturityDate?: string;
  requestedExtension?: string;
  currentInterestRate?: number;
  remarks?: string;
  raw: any;
}

export interface PaymentSummaryData {
  totalRequests: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  paidCount: number;
  paidAmount: number;
  totalSettledAmount: number;
}

export interface PaymentActionPayload {
  source_id: number;
  payment_type: string;
}

export interface RejectPaymentPayload {
  source_id: number;
  payment_type: string;
  rejection_reason: string;
}

export interface TenureExtensionApprovalPayload {
  remarks?: string;
}

export interface TenureExtensionRejectPayload {
  remarks: string;
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

/**
 * Robust response list extractor matching Web implementation
 */
export const getList = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.records)) return response.records;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.requests)) return response.requests;
  if (Array.isArray(response.settlements)) return response.settlements;
  if (Array.isArray(response.preclose_requests)) return response.preclose_requests;
  if (Array.isArray(response.tenure_timeout_settlements)) return response.tenure_timeout_settlements;
  if (Array.isArray(response.closed_settlements)) return response.closed_settlements;

  if (response.data && typeof response.data === 'object') {
    if (Array.isArray(response.data.data)) return response.data.data;
    if (Array.isArray(response.data.items)) return response.data.items;
    if (Array.isArray(response.data.records)) return response.data.records;
    if (Array.isArray(response.data.results)) return response.data.results;
    if (Array.isArray(response.data.requests)) return response.data.requests;
    if (Array.isArray(response.data.settlements)) return response.data.settlements;
    if (Array.isArray(response.data.preclose_requests)) return response.data.preclose_requests;
    if (Array.isArray(response.data.tenure_timeout_settlements)) return response.data.tenure_timeout_settlements;
    if (Array.isArray(response.data.closed_settlements)) return response.data.closed_settlements;
  }

  if (response.result && typeof response.result === 'object') {
    if (Array.isArray(response.result)) return response.result;
    if (Array.isArray(response.result.items)) return response.result.items;
    if (Array.isArray(response.result.data)) return response.result.data;
  }

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
 * Payment record normalizer matching Web source of truth
 */
export const normalizePayment = (item: any, defaultType?: string): SuperAdminPaymentRecord => {
  const id = getValue(
    item,
    [
      'o_payment_id',
      'payment_id',
      'request_id',
      'requestId',
      'extension_id',
      'extensionId',
      'settlement_id',
      'payout_id',
      'interest_schedule_id',
      'id',
      'source_id',
    ],
    '—',
  );
  const sourceId = Number(
    getValue(
      item,
      [
        'o_source_id',
        'source_id',
        'request_id',
        'requestId',
        'extension_id',
        'extensionId',
        'payout_id',
        'settlement_id',
        'interest_schedule_id',
        'id',
      ],
      0,
    ),
  );

  const rawType = String(
    getValue(item, ['o_payment_type', 'payment_type', 'type', 'payout_type', 'settlement_type'], defaultType || 'Monthly Interest'),
  );

  let paymentType: PaymentCategory = rawType;
  const lType = rawType.toLowerCase();
  if (lType.includes('monthly') || lType.includes('interest')) {
    paymentType = 'Monthly Interest';
  } else if (lType.includes('preclose') || lType.includes('pre-close') || lType.includes('pre_close')) {
    paymentType = 'Pre-Close Settlement';
  } else if (lType.includes('tenure_timeout') || lType.includes('tenure timeout') || lType.includes('maturity') || lType.includes('tenure settlement')) {
    paymentType = 'Tenure Settlement';
  } else if (lType.includes('extension') || lType.includes('tenure extension')) {
    paymentType = 'Tenure Extension';
  }

  const investorName = String(
    getValue(
      item,
      ['o_investor_name', 'investor_name', 'investorName', 'full_name', 'fullName', 'name', 'investor'],
      'Investor',
    ),
  );
  const investorId = String(
    getValue(item, ['o_investor_id', 'investor_id', 'investorId', 'investor_registration_id'], '—'),
  );
  const bondId = String(
    getValue(item, ['o_bond_number', 'bond_number', 'bondNumber', 'bond_id', 'bondId', 'bond_no', 'bondNo', 'bond'], '—'),
  );
  const branchName = String(
    getValue(item, ['o_branch_name', 'branch_name', 'branchName', 'branch'], '—'),
  );

  const principalAmount = Number(
    getValue(item, ['o_principal_amount', 'principal_amount', 'principalAmount', 'principal', 'investment_amount'], 0),
  );
  const interestAmount = Number(
    getValue(item, ['o_interest_amount', 'interest_amount', 'interestAmount', 'interest', 'interest_earned', 'payout_amount'], 0),
  );
  const gstAmount = Number(
    getValue(item, ['o_gst_amount', 'gst_amount', 'gstAmount', 'gst'], 0),
  );
  const penaltyAmount = Number(
    getValue(item, ['o_penalty_amount', 'penalty_amount', 'penaltyAmount', 'penalty'], 0),
  );

  // Amount represents base/gross amount (strictly NOT net amount)
  const amount = Number(
    getValue(
      item,
      ['o_amount', 'amount', 'payment_amount', 'base_amount', 'gross_amount'],
      0,
    ),
  );

  // Net Amount represents net settlement/interest payout after deductions
  let netFallback = 0;
  if (paymentType === 'Monthly Interest') {
    netFallback = interestAmount ? Math.max(0, interestAmount - gstAmount) : 0;
  } else if (paymentType === 'Tenure Settlement' || paymentType === 'Pre-Close Settlement') {
    netFallback = Math.max(0, (principalAmount || amount) + interestAmount - gstAmount - penaltyAmount);
  }

  const netAmount = Number(
    getValue(
      item,
      [
        'o_net_amount',
        'net_amount',
        'net_interest_amount',
        'net_settlement_amount',
        'netSettlementAmount',
        'net_payable',
        'payable_amount',
        'netAmount',
      ],
      netFallback,
    ),
  );

  const paymentMonth = String(
    getValue(item, ['o_payment_month', 'payment_month', 'month', 'period', 'due_date', 'interest_due_date'], '—'),
  );

  const requestedBy = String(
    getValue(item, ['o_requested_by', 'requested_by_name', 'requestedByName', 'requested_by', 'admin_name'], '—'),
  );
  const approvedBy = String(
    getValue(item, ['o_approved_by', 'approved_by_name', 'approvedByName', 'approved_by', 'approved_by_admin'], '—'),
  );

  // Status mapping matching Web
  const rawStatus = String(
    getValue(
      item,
      [
        'o_status_name',
        'status_name',
        'request_status',
        'extension_status',
        'approval_status',
        'superadmin_status',
        'admin_status',
        'status',
        'payment_status',
        'settlement_status',
        'statusName',
        'requestStatus',
        'extensionStatus',
      ],
      '',
    ),
  ).toLowerCase().trim();

  let status = 'Pending';
  if (
    rawStatus.includes('paid') ||
    rawStatus.includes('success') ||
    rawStatus === 'completed' ||
    rawStatus === 'settled' ||
    rawStatus.includes('mark_paid')
  ) {
    status = 'Paid';
  } else if (
    rawStatus.includes('approved') ||
    rawStatus.includes('active') ||
    rawStatus === 'super_admin_approved' ||
    rawStatus === 'superadmin_approved' ||
    rawStatus === 'approved_by_super_admin' ||
    rawStatus === 'admin_approved' ||
    item.is_approved === true ||
    item.approved === true ||
    item.superadmin_approved === true
  ) {
    status = 'Approved';
  } else if (
    rawStatus.includes('reject') ||
    rawStatus === 'declined' ||
    rawStatus === 'cancelled'
  ) {
    status = 'Rejected';
  } else if (
    rawStatus.includes('pending') ||
    rawStatus.includes('submitted') ||
    rawStatus.includes('review') ||
    rawStatus.includes('awaiting')
  ) {
    status = 'Pending';
  } else {
    // Check status_id
    const statusId = Number(
      getValue(
        item,
        ['status_id', 'statusId', 'investment_status_id', 'request_status_id', 'payment_status_id'],
        0,
      ),
    );
    if (statusId === 2) {
      status = 'Approved';
    } else if (statusId === 3 || statusId === 4) {
      status = 'Paid';
    } else if (statusId === 5) {
      status = 'Rejected';
    } else if (item.approved_by || item.approved_by_name || item.approved_date || item.approved_at) {
      status = 'Approved';
    } else {
      status = 'Pending';
    }
  }

  const bankName = String(getValue(item, ['o_bank_name', 'bank_name', 'bank'], '—'));
  const accountNumber = String(getValue(item, ['o_account_number', 'account_number', 'account_no', 'accountNo'], '—'));
  const ifscCode = String(getValue(item, ['o_ifsc_code', 'ifsc_code', 'ifsc'], '—'));

  const createdDate = String(
    getValue(item, ['o_created_date', 'created_date', 'created_at', 'createdAt', 'requested_date', 'requested_on', 'due_date', 'interest_due_date', 'date'], '—'),
  );

  const currentMaturityDate = String(
    getValue(item, ['o_current_maturity_date', 'current_maturity_date', 'maturity_date'], '—'),
  );
  const extMonths = getValue(item, ['o_extension_months', 'extension_months', 'requested_extension', 'months'], '');
  const requestedExtension = typeof extMonths === 'number' ? `+${extMonths} Months` : String(extMonths || '');
  const currentInterestRate = Number(
    getValue(item, ['o_interest_rate', 'interest_rate', 'current_interest_rate', 'rate'], 0),
  );
  const remarks = String(getValue(item, ['o_remarks', 'remarks', 'admin_remarks', 'reason'], ''));

  return {
    id,
    sourceId,
    paymentType,
    investorName,
    investorId,
    bondId,
    branchName,
    principalAmount,
    interestAmount,
    gstAmount,
    penaltyAmount,
    netAmount,
    amount,
    paymentMonth,
    requestedBy,
    approvedBy,
    status,
    bankName,
    accountNumber,
    ifscCode,
    createdDate,
    currentMaturityDate,
    requestedExtension,
    currentInterestRate,
    remarks,
    raw: item,
  };
};

/* ============================================================
   SERVICE APIS
   ============================================================ */

/**
 * 1. GET /superadmin/payments (All payments queue)
 */
export const getPaymentQueue = async (params?: {
  search?: string;
  status?: string;
  payment_type?: string;
  paymentType?: string;
  branch_id?: number;
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const queryParts: string[] = [];
  if (params?.limit !== undefined) queryParts.push(`limit=${params.limit}`);
  else queryParts.push('limit=10');
  if (params?.offset !== undefined) queryParts.push(`offset=${params.offset}`);

  const pType = params?.payment_type ?? params?.paymentType;
  if (pType && pType !== 'All') {
    queryParts.push(`payment_type=${encodeURIComponent(pType)}`);
  } else {
    queryParts.push('payment_type=All');
  }

  if (params?.status && params.status !== 'All' && params.status !== 'All Status') {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }

  if (params?.branch_id) queryParts.push(`branch_id=${params.branch_id}`);
  if (params?.search && params.search.trim()) queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/payments${qs}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/payments${qs}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/payments${qs}`, {
        method: 'GET',
      });
    }
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, pType));
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
 * 2. GET /superadmin/payments/summary
 */
export const getPaymentSummary = async (): Promise<PaymentSummaryData> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/superadmin/payments/summary', {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest('/api/superadmin/payments/summary', {
          method: 'GET',
        });
      } catch {
        response = null;
      }
    }

    if (response) {
      const d = response.data || response;
      return {
        totalRequests: Number(getValue(d, ['total_requests', 'total_count', 'total'], 0)),
        pendingCount: Number(getValue(d, ['pending_count', 'pending'], 0)),
        pendingAmount: Number(getValue(d, ['pending_amount', 'total_pending_amount'], 0)),
        approvedCount: Number(getValue(d, ['approved_count', 'approved'], 0)),
        approvedAmount: Number(getValue(d, ['approved_amount', 'total_approved_amount'], 0)),
        paidCount: Number(getValue(d, ['paid_count', 'paid'], 0)),
        paidAmount: Number(getValue(d, ['paid_amount', 'total_paid_amount'], 0)),
        totalSettledAmount: Number(getValue(d, ['total_settled_amount', 'total_payout_amount', 'total_amount'], 0)),
      };
    }
  } catch (err) {
    console.log('getPaymentSummary note:', err);
  }

  return {
    totalRequests: 0,
    pendingCount: 0,
    pendingAmount: 0,
    approvedCount: 0,
    approvedAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    totalSettledAmount: 0,
  };
};

/**
 * 3. GET /superadmin/payments/{id}
 */
export const getPaymentDetails = async (
  sourceId: number | string,
  paymentType?: string,
): Promise<SuperAdminPaymentRecord> => {
  const pTypeParam = paymentType ? `?payment_type=${encodeURIComponent(paymentType)}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/payments/${sourceId}${pTypeParam}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/api/superadmin/payments/${sourceId}${pTypeParam}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/payments/${sourceId}${pTypeParam}`, {
        method: 'GET',
      });
    }
  }
  return normalizePayment(response?.data || response, paymentType);
};

/**
 * 4. POST /superadmin/payments/approve
 */
export const approvePayment = async (payload: PaymentActionPayload): Promise<any> => {
  try {
    return await apiRequest('/superadmin/payments/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/api/superadmin/payments/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

/**
 * 5. POST /superadmin/payments/reject
 */
export const rejectPayment = async (payload: RejectPaymentPayload): Promise<any> => {
  try {
    return await apiRequest('/superadmin/payments/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/api/superadmin/payments/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

/**
 * 6. POST /superadmin/payments/mark-paid
 */
export const markPaymentPaid = async (payload: PaymentActionPayload): Promise<any> => {
  try {
    return await apiRequest('/superadmin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/api/superadmin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

/**
 * 7. GET Monthly Interest Queue
 * payment_type=MONTHLY_INTEREST
 */
export const getMonthlyInterestPaymentQueue = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 10;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/payments?payment_type=MONTHLY_INTEREST&limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/payments?payment_type=Monthly%20Interest&limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest(`/admin/monthly-interest?limit=${limit}&offset=${offset}`, {
          method: 'GET',
        });
      } catch {
        response = await apiRequest(`/monthly-interest?limit=${limit}&offset=${offset}`, {
          method: 'GET',
        });
      }
    }
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Monthly Interest'));
  const total = Number(response?.total || response?.count || records.length);

  return {records, total};
};

/**
 * 8. GET /superadmin/settlements/tenure-timeout
 */
export const getTenureTimeoutSettlements = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 10;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/settlements/tenure-timeout?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/payments?payment_type=Tenure%20Settlement&limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/admin/settlements/tenure-timeout?limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    }
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Tenure Settlement'));
  const total = Number(response?.total || response?.count || records.length);

  return {records, total};
};

/**
 * 8b. GET /superadmin/settlements/tenure-timeout/{settlement_id}
 */
export const getTenureTimeoutSettlementDetails = async (
  settlementId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/settlements/tenure-timeout/${settlementId}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/payments/${settlementId}?payment_type=Tenure%20Settlement`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, 'Tenure Settlement');
};

/**
 * 9. GET /superadmin/settlements/preclose
 */
export const getPrecloseSettlements = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 10;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/settlements/preclose?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/payments?payment_type=Pre-Close%20Settlement&limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/admin/settlements/preclose?limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    }
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Pre-Close Settlement'));
  const total = Number(response?.total || response?.count || records.length);

  return {records, total};
};

/**
 * 9b. GET /superadmin/settlements/preclose/{request_id}
 */
export const getPrecloseSettlementDetails = async (
  requestId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/settlements/preclose/${requestId}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/payments/${requestId}?payment_type=Pre-Close%20Settlement`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, 'Pre-Close Settlement');
};

/**
 * 10. GET /superadmin/tenure-extensions
 */
export const getAllTenureExtensions = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 10;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/tenure-extensions?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/payments?payment_type=Tenure%20Extension&limit=${limit}&offset=${offset}`, {
        method: 'GET',
      });
    } catch {
      try {
        response = await apiRequest(`/admin/tenure-extensions?limit=${limit}&offset=${offset}`, {
          method: 'GET',
        });
      } catch {
        response = await apiRequest(`/admin/tenure-extensions/pending?limit=${limit}&offset=${offset}`, {
          method: 'GET',
        });
      }
    }
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Tenure Extension'));
  const total = Number(response?.total || response?.count || records.length);

  return {records, total};
};

/**
 * 11. GET /superadmin/tenure-extensions/{requestId}
 */
export const getTenureExtensionDetails = async (
  requestId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  const idNum = Number(requestId) || requestId;
  let response: any = null;
  try {
    response = await apiRequest(`/superadmin/tenure-extensions/${idNum}`, {
      method: 'GET',
    });
  } catch {
    try {
      response = await apiRequest(`/superadmin/payments/${idNum}?payment_type=Tenure%20Extension`, {
        method: 'GET',
      });
    } catch {
      response = await apiRequest(`/admin/tenure-extensions/${idNum}`, {
        method: 'GET',
      });
    }
  }
  return normalizePayment(response?.data || response, 'Tenure Extension');
};

/**
 * 12. PUT /superadmin/tenure-extensions/{requestId}/approve
 */
export const approveTenureExtension = async (
  requestId: number | string,
  remarks?: string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/superadmin/tenure-extensions/${idNum}/approve`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Approved by Super Admin.'}),
    });
  } catch (err1) {
    try {
      return await apiRequest(`/superadmin/payments/approve`, {
        method: 'POST',
        body: JSON.stringify({
          source_id: Number(idNum),
          payment_type: 'Tenure Extension',
          remarks: remarks || 'Approved by Super Admin.',
        }),
      });
    } catch {
      return await apiRequest(`/admin/tenure-extensions/${idNum}/approve`, {
        method: 'PUT',
        body: JSON.stringify({remarks: remarks || 'Approved by Super Admin.'}),
      });
    }
  }
};

/**
 * 13. PUT /superadmin/tenure-extensions/{requestId}/reject
 */
export const rejectTenureExtension = async (
  requestId: number | string,
  remarks: string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/superadmin/tenure-extensions/${idNum}/reject`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Rejected by Super Admin.'}),
    });
  } catch (err1) {
    try {
      return await apiRequest(`/superadmin/payments/reject`, {
        method: 'POST',
        body: JSON.stringify({
          source_id: Number(idNum),
          payment_type: 'Tenure Extension',
          rejection_reason: remarks,
        }),
      });
    } catch {
      return await apiRequest(`/admin/tenure-extensions/${idNum}/reject`, {
        method: 'PUT',
        body: JSON.stringify({remarks: remarks || 'Rejected by Super Admin.'}),
      });
    }
  }
};

/**
 * 14. PUT /superadmin/tenure-extensions/{requestId}/mark-paid
 */
export const markTenureExtensionPaid = async (
  requestId: number | string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/superadmin/tenure-extensions/${idNum}/mark-paid`, {
      method: 'PUT',
    });
  } catch {
    return await apiRequest(`/superadmin/payments/mark-paid`, {
      method: 'POST',
      body: JSON.stringify({
        source_id: Number(idNum),
        payment_type: 'Tenure Extension',
      }),
    });
  }
};

/* ============================================================
   DEDICATED ACTION ALIASES (Matching Web Implementation)
   ============================================================ */

export const approveMonthlyInterestPayment = async (sourceId: number | string) =>
  approvePayment({source_id: Number(sourceId), payment_type: 'MONTHLY_INTEREST'});

export const rejectMonthlyInterestPayment = async (sourceId: number | string, reason: string) =>
  rejectPayment({source_id: Number(sourceId), payment_type: 'MONTHLY_INTEREST', rejection_reason: reason});

export const markMonthlyInterestPaymentPaid = async (sourceId: number | string) =>
  markPaymentPaid({source_id: Number(sourceId), payment_type: 'MONTHLY_INTEREST'});

export const approveTenureTimeoutSettlement = async (settlementId: number | string) =>
  approvePayment({source_id: Number(settlementId), payment_type: 'Tenure Settlement'});

export const rejectTenureTimeoutSettlement = async (settlementId: number | string, reason: string) =>
  rejectPayment({source_id: Number(settlementId), payment_type: 'Tenure Settlement', rejection_reason: reason});

export const markTenureTimeoutSettlementPaid = async (settlementId: number | string) =>
  markPaymentPaid({source_id: Number(settlementId), payment_type: 'Tenure Settlement'});

export const approvePrecloseRequest = async (requestId: number | string) =>
  approvePayment({source_id: Number(requestId), payment_type: 'Pre-Close Settlement'});

export const rejectPrecloseRequest = async (requestId: number | string, reason: string) =>
  rejectPayment({source_id: Number(requestId), payment_type: 'Pre-Close Settlement', rejection_reason: reason});

export const markPrecloseRequestPaid = async (requestId: number | string) =>
  markPaymentPaid({source_id: Number(requestId), payment_type: 'Pre-Close Settlement'});

export {getErrorMessage};
