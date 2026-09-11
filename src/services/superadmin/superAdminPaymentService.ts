import {getAuthToken, getErrorMessage} from './superAdminDashboardService';
import {ENV} from '../../config/env';

const API_BASE_URL = ENV.API_BASE_URL || 'https://investor.inrfs.com/api';

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

const resolveEndpoint = (endpoint: string): string => {
  const base = (ENV.API_BASE_URL || 'https://investor.inrfs.com/api').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }
  if (!base.endsWith('/api') && !cleanEndpoint.startsWith('/api/')) {
    return `${base}/api${cleanEndpoint}`;
  }
  return `${base}${cleanEndpoint}`;
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

  const rawSettlementType = String(
    getValue(
      item,
      [
        'settlement_type',
        'settlementType',
        'o_settlement_type',
      ],
      '',
    ),
  ).trim().toUpperCase();

  let paymentType: PaymentCategory = '';

  if (
    rawSettlementType === 'PRECLOSE' ||
    rawSettlementType === 'PRE_CLOSE' ||
    rawSettlementType === 'PRE-CLOSE' ||
    rawSettlementType.includes('PRECLOSE') ||
    rawSettlementType.includes('PRE-CLOSE')
  ) {
    paymentType = 'Pre-Close Settlement';
  } else if (
    rawSettlementType === 'TENURE_TIMEOUT' ||
    rawSettlementType === 'TENURE TIMEOUT' ||
    rawSettlementType.includes('TENURE') ||
    rawSettlementType.includes('TIMEOUT') ||
    rawSettlementType.includes('MATURITY')
  ) {
    paymentType = 'Tenure Settlement';
  } else if (
    rawSettlementType.includes('EXTENSION')
  ) {
    paymentType = 'Tenure Extension';
  } else {
    const rawType = String(
      getValue(
        item,
        [
          'payment_type',
          'paymentType',
          'o_payment_type',
          'type',
          'payout_type',
          'settlement_type',
        ],
        defaultType && defaultType !== 'All' ? defaultType : '',
      ),
    ).trim();

    const lType = rawType.toLowerCase();
    if (lType.includes('preclose') || lType.includes('pre-close') || lType.includes('pre_close')) {
      paymentType = 'Pre-Close Settlement';
    } else if (lType.includes('tenure_timeout') || lType.includes('tenure timeout') || lType.includes('maturity') || lType.includes('tenure settlement')) {
      paymentType = 'Tenure Settlement';
    } else if (lType.includes('extension') || lType.includes('tenure extension')) {
      paymentType = 'Tenure Extension';
    } else if (lType.includes('monthly') || lType.includes('interest')) {
      paymentType = 'Monthly Interest';
    } else if (item.interest_schedule_id !== undefined && item.interest_schedule_id !== null && item.interest_schedule_id !== '') {
      paymentType = 'Monthly Interest';
    } else if (item.preclose_request_id !== undefined && item.preclose_request_id !== null && item.preclose_request_id !== '') {
      paymentType = 'Pre-Close Settlement';
    } else if (item.settlement_id !== undefined && item.settlement_id !== null && item.settlement_id !== '') {
      paymentType = 'Tenure Settlement';
    } else if (item.extension_id !== undefined && item.extension_id !== null && item.extension_id !== '') {
      paymentType = 'Tenure Extension';
    } else if (defaultType && defaultType !== 'All') {
      paymentType = defaultType;
    } else {
      paymentType = rawType || 'Monthly Interest';
    }
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
 * 1. GET /api/superadmin/payments (All payments queue)
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
  const safeLimit = Math.min(Math.max(Number(params?.limit) || 100, 1), 100);
  const safeOffset = Math.max(Number(params?.offset) || 0, 0);

  const rawType = params?.payment_type ?? params?.paymentType ?? 'All';
  const normType = String(rawType || '').trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (normType === 'tenure settlement') {
    return await getTenureTimeoutSettlements({limit: safeLimit, offset: safeOffset});
  }

  if (normType === 'pre-close settlement' || normType === 'preclose settlement') {
    return await getPrecloseSettlements({limit: safeLimit, offset: safeOffset});
  }

  if (normType === 'tenure extension') {
    return await getAllTenureExtensions({limit: safeLimit, offset: safeOffset});
  }

  if (normType === 'monthly interest') {
    return await getMonthlyInterestPaymentQueue({limit: safeLimit, offset: safeOffset});
  }

  if (normType === 'all' || !normType) {
    // Web All tab aggregation: Fetch all 4 sources concurrently using Promise.allSettled
    const [monthlyRes, tenureRes, precloseRes, extensionRes] = await Promise.allSettled([
      getMonthlyInterestPaymentQueue({limit: 100, offset: 0}),
      getTenureTimeoutSettlements({limit: 100, offset: 0}),
      getPrecloseSettlements({limit: 100, offset: 0}),
      getAllTenureExtensions({limit: 100, offset: 0}),
    ]);

    const monthlyRecords = monthlyRes.status === 'fulfilled' ? monthlyRes.value.records || [] : [];
    const tenureRecords = tenureRes.status === 'fulfilled' ? tenureRes.value.records || [] : [];
    const precloseRecords = precloseRes.status === 'fulfilled' ? precloseRes.value.records || [] : [];
    const extensionRecords = extensionRes.status === 'fulfilled' ? extensionRes.value.records || [] : [];

    const combined = [
      ...monthlyRecords,
      ...tenureRecords,
      ...precloseRecords,
      ...extensionRecords,
    ];

    // Deduplicate records by unique key (paymentType + sourceId/id)
    const seen = new Set<string>();
    const unique: SuperAdminPaymentRecord[] = [];
    for (const record of combined) {
      const key = `${record.paymentType}-${record.sourceId || record.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(record);
      }
    }

    let records = unique;

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      records = records.filter(
        p =>
          p.investorName.toLowerCase().includes(q) ||
          p.bondId.toLowerCase().includes(q) ||
          p.branchName.toLowerCase().includes(q) ||
          p.paymentType.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          String(p.netAmount).includes(q) ||
          String(p.amount).includes(q),
      );
    }

    if (params?.status && params.status !== 'All' && params.status !== 'All Status') {
      const s = params.status.toLowerCase().trim();
      records = records.filter(p => (p.status || '').toLowerCase().trim() === s);
    }

    return {records, total: records.length};
  }

  const queryParts: string[] = [];
  queryParts.push(`payment_type=${encodeURIComponent(rawType)}`);
  queryParts.push(`limit=${safeLimit}`);
  queryParts.push(`offset=${safeOffset}`);

  if (params?.status && params.status !== 'All' && params.status !== 'All Status') {
    queryParts.push(`status=${encodeURIComponent(params.status)}`);
  }

  if (params?.branch_id) {
    queryParts.push(`branch_id=${params.branch_id}`);
  }

  if (params?.search && params.search.trim()) {
    queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
  }

  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/payments${qs}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/payments${qs}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, rawType));
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
 * 2. GET /api/superadmin/payments/summary
 */
export const getPaymentSummary = async (): Promise<PaymentSummaryData> => {
  try {
    let response: any = null;
    try {
      response = await apiRequest('/api/superadmin/payments/summary', {
        method: 'GET',
      });
    } catch {
      response = await apiRequest('/superadmin/payments/summary', {
        method: 'GET',
      });
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
 * 3. GET /api/superadmin/payments/{id}
 */
export const getPaymentDetails = async (
  sourceId: number | string,
  paymentType?: string,
): Promise<SuperAdminPaymentRecord> => {
  if (sourceId === undefined || sourceId === null || sourceId === '') {
    throw new Error('Payment source ID is required.');
  }

  const normType = String(paymentType || '').trim().toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ');

  if (normType === 'tenure settlement') {
    return await getTenureTimeoutSettlementDetails(sourceId);
  }

  if (normType === 'pre-close settlement' || normType === 'preclose settlement') {
    return await getPrecloseSettlementDetails(sourceId);
  }

  if (normType === 'tenure extension') {
    return await getTenureExtensionDetails(sourceId);
  }

  if (normType === 'monthly interest') {
    return await getMonthlyInterestDetails(sourceId);
  }

  const pTypeParam = paymentType ? `?payment_type=${encodeURIComponent(paymentType)}` : '';
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/payments/${encodeURIComponent(String(sourceId))}${pTypeParam}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/payments/${encodeURIComponent(String(sourceId))}${pTypeParam}`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, paymentType);
};

/**
 * 4. POST /api/superadmin/payments/approve
 */
export const approvePayment = async (
  sourceIdOrPayload: number | string | PaymentActionPayload,
  paymentType?: string,
): Promise<any> => {
  let source_id: number;
  let p_type: string;

  if (typeof sourceIdOrPayload === 'object' && sourceIdOrPayload !== null) {
    source_id = Number(sourceIdOrPayload.source_id);
    p_type = sourceIdOrPayload.payment_type;
  } else {
    source_id = Number(sourceIdOrPayload);
    p_type = paymentType || '';
  }

  if (!source_id) {
    throw new Error('Payment source ID is required.');
  }

  const payload = {
    source_id,
    payment_type: p_type,
  };

  try {
    return await apiRequest('/api/superadmin/payments/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/superadmin/payments/approve', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

/**
 * 5. POST /api/superadmin/payments/reject
 */
export const rejectPayment = async (
  sourceIdOrPayload: number | string | RejectPaymentPayload,
  paymentType?: string,
  rejectionReason?: string,
): Promise<any> => {
  let source_id: number;
  let p_type: string;
  let reason: string;

  if (typeof sourceIdOrPayload === 'object' && sourceIdOrPayload !== null) {
    source_id = Number(sourceIdOrPayload.source_id);
    p_type = sourceIdOrPayload.payment_type;
    reason = String(sourceIdOrPayload.rejection_reason || '').trim();
  } else {
    source_id = Number(sourceIdOrPayload);
    p_type = paymentType || '';
    reason = String(rejectionReason || '').trim();
  }

  if (!source_id) {
    throw new Error('Payment source ID is required.');
  }
  if (!reason) {
    throw new Error('Rejection reason is required.');
  }

  const payload = {
    source_id,
    payment_type: p_type,
    rejection_reason: reason,
  };

  try {
    return await apiRequest('/api/superadmin/payments/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/superadmin/payments/reject', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

/**
 * 6. POST /api/superadmin/payments/mark-paid
 */
export const markPaymentPaid = async (
  sourceIdOrPayload: number | string | PaymentActionPayload,
  paymentType?: string,
): Promise<any> => {
  let source_id: number;
  let p_type: string;

  if (typeof sourceIdOrPayload === 'object' && sourceIdOrPayload !== null) {
    source_id = Number(sourceIdOrPayload.source_id);
    p_type = sourceIdOrPayload.payment_type;
  } else {
    source_id = Number(sourceIdOrPayload);
    p_type = paymentType || '';
  }

  if (!source_id) {
    throw new Error('Payment source ID is required.');
  }

  const payload = {
    source_id,
    payment_type: p_type,
  };

  try {
    return await apiRequest('/api/superadmin/payments/mark-paid', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return await apiRequest('/superadmin/payments/mark-paid', {
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
  const limit = params?.limit !== undefined ? params.limit : 100;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/payments?payment_type=MONTHLY_INTEREST&limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/payments?payment_type=MONTHLY_INTEREST&limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Monthly Interest'));
  const total = Number(response?.total ?? response?.total_count ?? response?.count ?? records.length);

  return {records, total};
};

/**
 * 8. GET /api/superadmin/settlements/tenure-timeout
 */
export const getTenureTimeoutSettlements = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 100;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/settlements/tenure-timeout?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/settlements/tenure-timeout?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Tenure Settlement'));
  const total = Number(response?.total ?? response?.total_count ?? response?.count ?? records.length);

  return {records, total};
};

/**
 * 8b. GET /api/superadmin/settlements/tenure-timeout/{settlement_id}
 */
export const getTenureTimeoutSettlementDetails = async (
  settlementId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/settlements/tenure-timeout/${encodeURIComponent(String(settlementId))}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/settlements/tenure-timeout/${encodeURIComponent(String(settlementId))}`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, 'Tenure Settlement');
};

/**
 * 9. GET /api/superadmin/settlements/preclose
 */
export const getPrecloseSettlements = async (params?: {
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 100;
  const offset = params?.offset !== undefined ? params.offset : 0;

  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/settlements/preclose?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/settlements/preclose?limit=${limit}&offset=${offset}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Pre-Close Settlement'));
  const total = Number(response?.total ?? response?.total_count ?? response?.count ?? records.length);

  return {records, total};
};

/**
 * 9b. GET /api/superadmin/settlements/preclose/{request_id}
 */
export const getPrecloseSettlementDetails = async (
  requestId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/settlements/preclose/${encodeURIComponent(String(requestId))}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/settlements/preclose/${encodeURIComponent(String(requestId))}`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, 'Pre-Close Settlement');
};

/**
 * 10. GET /api/superadmin/tenure-extensions
 */
export const getAllTenureExtensions = async (params?: {
  branchId?: number | null;
  limit?: number;
  offset?: number;
}): Promise<{records: SuperAdminPaymentRecord[]; total: number}> => {
  const limit = params?.limit !== undefined ? params.limit : 100;
  const offset = params?.offset !== undefined ? params.offset : 0;

  const queryParts: string[] = [`limit=${safeLimit(limit)}`, `offset=${Math.max(0, Number(offset) || 0)}`];
  if (params?.branchId) {
    queryParts.push(`branch_id=${params.branchId}`);
  }
  const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/tenure-extensions${qs}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/tenure-extensions${qs}`, {
      method: 'GET',
    });
  }

  const list = getList(response);
  const records = list.map(item => normalizePayment(item, 'Tenure Extension'));
  const total = Number(response?.total ?? response?.total_count ?? response?.count ?? records.length);

  return {records, total};
};

const safeLimit = (limit: any) => Math.min(Math.max(Number(limit) || 100, 1), 100);

/**
 * 11. GET /api/superadmin/tenure-extensions/{requestId}
 */
export const getTenureExtensionDetails = async (
  requestId: number | string,
): Promise<SuperAdminPaymentRecord> => {
  const idNum = Number(requestId) || requestId;
  let response: any = null;
  try {
    response = await apiRequest(`/api/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}`, {
      method: 'GET',
    });
  } catch {
    response = await apiRequest(`/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}`, {
      method: 'GET',
    });
  }
  return normalizePayment(response?.data || response, 'Tenure Extension');
};

/**
 * 12. PUT /api/superadmin/tenure-extensions/{requestId}/approve
 */
export const approveTenureExtension = async (
  requestId: number | string,
  remarks?: string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/api/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/approve`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Approved by Super Admin.'}),
    });
  } catch {
    return await apiRequest(`/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/approve`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Approved by Super Admin.'}),
    });
  }
};

/**
 * 13. PUT /api/superadmin/tenure-extensions/{requestId}/reject
 */
export const rejectTenureExtension = async (
  requestId: number | string,
  remarks: string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/api/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/reject`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Rejected by Super Admin.'}),
    });
  } catch {
    return await apiRequest(`/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/reject`, {
      method: 'PUT',
      body: JSON.stringify({remarks: remarks || 'Rejected by Super Admin.'}),
    });
  }
};

/**
 * 14. PUT /api/superadmin/tenure-extensions/{requestId}/mark-paid
 */
export const markTenureExtensionPaid = async (
  requestId: number | string,
): Promise<any> => {
  const idNum = Number(requestId) || requestId;
  try {
    return await apiRequest(`/api/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/mark-paid`, {
      method: 'PUT',
    });
  } catch {
    return await apiRequest(`/superadmin/tenure-extensions/${encodeURIComponent(String(idNum))}/mark-paid`, {
      method: 'PUT',
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

// Additional Web Aliases
export const getMonthlyInterestQueue = getMonthlyInterestPaymentQueue;
export const getMonthlyInterestDetails = async (interestScheduleId: number | string) => {
  return getPaymentDetails(interestScheduleId, 'MONTHLY_INTEREST');
};
export const getMonthlyInterestPaymentDetails = getMonthlyInterestDetails;
export const approveMonthlyInterest = approveMonthlyInterestPayment;
export const rejectMonthlyInterest = rejectMonthlyInterestPayment;
export const markMonthlyInterestPaid = markMonthlyInterestPaymentPaid;

export const getSuperAdminPrecloseRequests = getPrecloseSettlements;
export const getSuperAdminPrecloseRequestDetails = getPrecloseSettlementDetails;
export const getPrecloseRequests = getPrecloseSettlements;
export const getPrecloseRequestDetails = getPrecloseSettlementDetails;

export const getSuperAdminTenureTimeoutSettlements = getTenureTimeoutSettlements;
export const getSuperAdminTenureTimeoutSettlementDetails = getTenureTimeoutSettlementDetails;

export {getErrorMessage};

