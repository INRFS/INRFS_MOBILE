import AsyncStorage from '@react-native-async-storage/async-storage';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNShare from 'react-native-share';
import {ENV} from '../../config/env';

/* ============================================================
   CONFIG & AUTH HELPERS
   ============================================================ */

export const API_BASE_URL = ENV?.API_BASE_URL || 'http://187.52.115.32:8000';

const AUTH_TOKEN_KEYS = [
  'access_token',
  'accessToken',
  'token',
  'authToken',
  'auth_token',
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
    console.warn('Error reading auth token from AsyncStorage:', error);
    return null;
  }
};

const getHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? {Authorization: `Bearer ${token}`} : {}),
  };
};

const handleResponse = async (response: Response): Promise<any> => {
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.detail)) {
        message = data.detail
          .map((item: any) => item?.msg || item?.message || JSON.stringify(item))
          .join(', ');
      } else if (data.detail) {
        message = String(data.detail);
      } else if (data.message) {
        message = String(data.message);
      } else if (data.error) {
        message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      }
    }
    throw new Error(message);
  }

  return data;
};

const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  return handleResponse(response);
};

/* ============================================================
   TYPES & SCHEMAS (Matching Exact Swagger Definitions)
   ============================================================ */

export interface ReportFilterBranch {
  id: number;
  branch_name: string;
  state_id?: number;
  city_name?: string;
  is_active?: boolean;
}

export interface ReportFilterStatus {
  id: number;
  status_name: string;
  is_active?: boolean;
}

export interface ReportFiltersResponse {
  success: boolean;
  branch?: ReportFilterBranch;
  branches: ReportFilterBranch[];
  statuses: ReportFilterStatus[];
}

export interface ReportSummaryData {
  new_investments: number;
  interest_paid: number;
  settlements: number;
}

export interface ReportSummaryResponse {
  success: boolean;
  year: number;
  branch_id: number;
  data: ReportSummaryData;
}

export interface MonthlyInvestmentItem {
  month_number: number;
  month_name: string;
  invested_amount: number;
  interest_paid: number;
  investor_count?: number;
  investment_count?: number;
}

export interface MonthlyInvestmentsResponse {
  success: boolean;
  year: number;
  branch_id: number;
  data: MonthlyInvestmentItem[];
}

export interface InvestorGrowthItem {
  month_number: number;
  month_name: string;
  investor_count: number;
}

export interface InvestorGrowthResponse {
  success: boolean;
  year: number;
  branch_id: number;
  data: InvestorGrowthItem[];
}

export interface StatusDistributionItem {
  status_id: number;
  status_name: string;
  investment_count: number;
  investment_amount: number;
}

export interface StatusDistributionResponse {
  success: boolean;
  year: number;
  branch_id: number;
  data: StatusDistributionItem[];
}

export interface ReportInvestmentItem {
  investor_id: string;
  investor_name: string;
  investment_id: string;
  bond_id: string | null;
  investment_amount: number;
  interest_rate: number;
  tenure_months: number;
  investment_date: string;
  maturity_date: string;
  investment_status: string;
  branch_id: number;
  branch_name: string;
}

export interface ReportInvestmentsResponse {
  success: boolean;
  branch_id: number;
  data: ReportInvestmentItem[];
}

export interface PendingInvestmentItem {
  investor_id: string;
  investor_name: string;
  investment_id: string;
  branch_name: string;
  investment_amount: number;
  tenure_months: number;
  interest_rate: number;
  submitted_date: string;
  utr_number: string | null;
  investment_status: string;
  branch_id: number;
}

export interface PendingInvestmentsResponse {
  success: boolean;
  branch_id: number;
  data: PendingInvestmentItem[];
}

export interface ReportDashboardResponse {
  success: boolean;
  year: number;
  branch_id: number;
  summary: ReportSummaryData;
  monthly_investments: MonthlyInvestmentItem[];
  investor_growth: InvestorGrowthItem[];
  status_distribution: StatusDistributionItem[];
}

export interface NormalizedInvestment {
  raw: ReportInvestmentItem;
  id: string;
  investorId: string;
  investor: string;
  branch: string;
  branchId: number | null;
  bondId: string | null;
  amount: number;
  rate: number;
  invested: string;
  maturity: string;
  interest: number;
  status: string;
  tenureMonths: number;
}

/* ============================================================
   NORMALIZATION HELPER
   ============================================================ */

/**
 * Normalizes backend investment row into UI-ready representation.
 * Computes deterministic expected interest: (amount * rate * tenureMonths) / 1200
 */
export const normalizeInvestment = (
  item: ReportInvestmentItem,
  index: number = 0,
): NormalizedInvestment => {
  const id = String(item.investment_id || `INV-${index + 1}`);
  const investorId = String(item.investor_id || '');
  const investor = String(item.investor_name || '—');
  const branch = String(item.branch_name || '—');
  const branchId = item.branch_id ?? null;
  const bondId = item.bond_id ? String(item.bond_id) : null;
  const amount = Number(item.investment_amount || 0);
  const rate = Number(item.interest_rate || 0);
  const tenureMonths = Number(item.tenure_months || 0);
  const invested = item.investment_date || '';
  const maturity = item.maturity_date || '';
  const status = String(item.investment_status || 'Unknown');

  // Presentation-only derived expected interest calculation: (P * R * T) / 1200
  const interest =
    amount > 0 && rate > 0 && tenureMonths > 0
      ? Math.round(((amount * rate * tenureMonths) / 1200) * 100) / 100
      : 0;

  return {
    raw: item,
    id,
    investorId,
    investor,
    branch,
    branchId,
    bondId,
    amount,
    rate,
    invested,
    maturity,
    interest,
    status,
    tenureMonths,
  };
};

/* ============================================================
   SWAGGER ENDPOINTS IMPLEMENTATION
   ============================================================ */

/**
 * 1. GET /admin/reports/filters
 */
export const getReportFilters = async (): Promise<ReportFiltersResponse> => {
  return request('/admin/reports/filters');
};

/**
 * 2. GET /admin/reports/dashboard?year={year}
 */
export const getReportDashboard = async (
  year?: number,
): Promise<ReportDashboardResponse> => {
  const qs = year && !isNaN(Number(year)) ? `?year=${Number(year)}` : '';
  return request(`/admin/reports/dashboard${qs}`);
};

/**
 * 3. GET /admin/reports/summary?year={year}
 */
export const getReportSummary = async (
  year?: number,
): Promise<ReportSummaryResponse> => {
  const qs = year && !isNaN(Number(year)) ? `?year=${Number(year)}` : '';
  return request(`/admin/reports/summary${qs}`);
};

/**
 * 4. GET /admin/reports/monthly-investments?year={year}
 */
export const getMonthlyInvestments = async (
  year?: number,
): Promise<MonthlyInvestmentsResponse> => {
  const qs = year && !isNaN(Number(year)) ? `?year=${Number(year)}` : '';
  return request(`/admin/reports/monthly-investments${qs}`);
};

/**
 * 5. GET /admin/reports/investor-growth?year={year}
 */
export const getInvestorGrowth = async (
  year?: number,
): Promise<InvestorGrowthResponse> => {
  const qs = year && !isNaN(Number(year)) ? `?year=${Number(year)}` : '';
  return request(`/admin/reports/investor-growth${qs}`);
};

/**
 * 6. GET /admin/reports/status-distribution?year={year}
 */
export const getStatusDistribution = async (
  year?: number,
): Promise<StatusDistributionResponse> => {
  const qs = year && !isNaN(Number(year)) ? `?year=${Number(year)}` : '';
  return request(`/admin/reports/status-distribution${qs}`);
};

/**
 * 7. GET /admin/reports/investments?limit={limit}&offset={offset}
 * Backend maximum limit is 100.
 * If all === true, automatically fetches all pages in 100-record chunks.
 */
export const getReportInvestments = async ({
  limit = 100,
  offset = 0,
  all = false,
}: {
  limit?: number;
  offset?: number;
  all?: boolean;
} = {}): Promise<ReportInvestmentsResponse> => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 100));
  const safeOffset = Math.max(0, Number(offset) || 0);

  if (!all) {
    const params = new URLSearchParams({
      limit: String(safeLimit),
      offset: String(safeOffset),
    });
    return request(`/admin/reports/investments?${params.toString()}`);
  }

  // Fetch all records in 100-record chunks
  const pageSize = 100;
  let currentOffset = 0;
  let allRecords: ReportInvestmentItem[] = [];
  let branchId = 0;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      limit: String(pageSize),
      offset: String(currentOffset),
    });

    const response = await request(
      `/admin/reports/investments?${params.toString()}`,
    );

    if (response?.branch_id) {
      branchId = response.branch_id;
    }

    const records: ReportInvestmentItem[] = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : [];

    allRecords = allRecords.concat(records);

    if (records.length < pageSize) {
      hasMore = false;
    } else {
      currentOffset += pageSize;
    }
  }

  return {
    success: true,
    branch_id: branchId,
    data: allRecords,
  };
};

/**
 * 8. GET /admin/reports/pending-investments?limit={limit}&offset={offset}
 */
export const getReportPendingInvestments = async ({
  limit = 100,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}): Promise<PendingInvestmentsResponse> => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 100));
  const safeOffset = Math.max(0, Number(offset) || 0);

  const params = new URLSearchParams({
    limit: String(safeLimit),
    offset: String(safeOffset),
  });

  return request(`/admin/reports/pending-investments?${params.toString()}`);
};

/* ============================================================
   EXPORT HELPERS (CSV / EXCEL FOR MOBILE)
   ============================================================ */

/**
 * Exports data rows to CSV/XLSX and opens the native mobile share sheet.
 */
export const exportReportCSV = async (
  rows: any[],
  filename: string = 'INRFS_Report.xlsx',
): Promise<void> => {
  if (!rows || rows.length === 0) {
    throw new Error('No data available to export.');
  }

  try {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});
    const cleanFilename = (filename || 'INRFS_Report.xlsx').replace(/\.csv$/i, '.xlsx');
    const dir = RNFS.CachesDirectoryPath || RNFS.DocumentDirectoryPath;
    const path = `${dir}/${cleanFilename}`;

    await RNFS.writeFile(path, wbout, 'base64');

    const exists = await RNFS.exists(path);
    if (!exists) {
      throw new Error('Export file could not be created on the device.');
    }

    const fileUrl = `file://${path}`;
    if (!fileUrl) {
      throw new Error('Generated file URI is null or invalid.');
    }

    await RNShare.open({
      url: fileUrl,
      title: cleanFilename,
      subject: cleanFilename,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      useInternalStorage: true,
      failOnCancel: false,
    });
  } catch (error: any) {
    if (
      error?.message?.includes('User did not share') ||
      error?.message?.includes('DISMISSED') ||
      error?.message?.includes('cancel')
    ) {
      return;
    }
    console.warn('Export report error:', error);
    throw error;
  }
};
