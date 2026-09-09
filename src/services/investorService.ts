import apiClient from '../api/client';

// ==========================================
// TYPES
// ==========================================

export type DashboardSummary = {
  total_invested: string;
  interest_earned: string;
  active_bonds: number;
  monthly_payout: string;
  portfolio_value: string;
  next_maturity_date: string | null;
  days_to_maturity: number | null;
};

export type GrowthItem = {
  month_name: string;
  investment_amount: string;
};

export type PortfolioSplitItem = {
  label: string;
  percentage?: number;
  pct?: number;
  amount?: number;
  color?: string;
};

export type RecentInvestment = {
  investment_id: string;
  investment_amount: string;
  interest_rate: string;
  investment_date: string;
  investment_status: string;
  bond_id: string;
};

export type DashboardInvestor = {
  investor_id: string;
  investor_name: string;
  mobile: string;
  email: string;
  date_of_birth: string;
  aadhaar_number: string;
  address: string;
  city: string;
  state_name: string;
  pincode: string;
  branch_name: string;
  kyc_status: string;
  account_status: string;
  account_created_date: string;
  approved_date: string;
  remarks: string;
};

export type InvestorDashboardResponse = {
  summary: DashboardSummary;
  growth: GrowthItem[];
  portfolio_split: PortfolioSplitItem[];
  recent_investments: RecentInvestment[];
  investor: DashboardInvestor;
};

export type BankProfile = {
  id?: number | null;
  account_holder_name?: string | null;
  bank_name?: string | null;
  account_type_id?: number | null;
  account_type?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  is_primary?: boolean | null;
};

export type InvestorProfileResponse = {
  investor_id?: string | null;
  full_name: string;
  mobile: string;
  email?: string | null;
  date_of_birth?: string | null;
  aadhaar_number?: string | null;
  address?: string | null;
  city?: string | null;
  state_id?: number | null;
  state_name?: string | null;
  pincode?: string | null;
  branch_id?: number | null;
  branch_name?: string | null;
  status?: string | null;
  kyc_status?: string | null;
  kyc_status_name?: string | null;
  bank?: BankProfile | null;
};

export type InvestorProfileUpdate = {
  full_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  state_id?: number | null;
  pincode?: string | null;
  branch_id?: number | null;
  bank?: {
    account_holder_name?: string | null;
    bank_name?: string | null;
    account_type_id?: number | null;
    account_number?: string | null;
    ifsc_code?: string | null;
  } | null;
};

export type UpdateProfileRequest = InvestorProfileUpdate;

export type ApiInvestment = {
  id: number;
  investment_id: string;
  investor_registration_id?: number | string | null;
  investor_id?: string | null;
  investor_name?: string | null;
  tenure_id?: number | null;
  tenure_months?: number | null;
  investment_amount?: string | number | null;
  amount?: string | number | null;
  interest_rate?: string | number | null;
  rate?: string | number | null;
  expected_interest_amount?: string | number | null;
  expected_monthly_interest?: string | number | null;
  maturity_amount?: string | number | null;
  investment_status_id?: number | string | null;
  investment_status?: string | null;
  status_id?: number | null;
  status_name?: string | null;
  status?: string | null;
  investment_date?: string | null;
  maturity_date?: string | null;
  approved_by?: string | number | null;
  approved_date?: string | null;
  remarks?: string | null;
  rejection_reason?: string | null;
  bond_id?: string | null;
  bond_number?: string | null;
  [key: string]: any;
};

export type BondData = {
  id: number;
  bond_id: string;
  bond_number?: string | null;
  investment_id: number;
  investment_code?: string | null;
  investor_registration_id?: number | null;
  investor_id?: string | null;
  investor_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  aadhar?: string | null;
  aadhaar?: string | null;
  investment_amount?: string | null;
  amount?: string | null;
  interest_rate?: string | null;
  rate?: string | null;
  expected_interest_amount?: string | null;
  maturity_amount?: string | null;
  tenure_months?: number | null;
  investment_date?: string | null;
  maturity_date: string;
  issue_date?: string | null;
  status?: string | null;
  bank?: BankProfile | null;
  bank_name?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  account_type?: string | null;
  investor?: any;
};

export type BondResponse = {
  success: boolean;
  data: BondData;
};

export type InvestmentCalculationResponse = {
  investment_amount: string;
  tenure_id: number;
  tenure_months: number;
  interest_rate: string;
  expected_monthly_interest: string;
  expected_interest_amount: string;
  maturity_amount: string;
  maturity_date: string;
};

export type InvestmentStatusItem = {
  id: number;
  status_name: string;
  name?: string;
  is_active?: boolean;
};

export type InvestmentTenureItem = {
  id: number;
  tenure_months: number;
  is_active?: boolean;
};

export type MasterState = {
  id: number;
  state_name: string;
  name?: string;
  is_active?: boolean;
};

export type MasterBranch = {
  id: number;
  branch_name: string;
  name?: string;
  state_id?: number | null;
  is_active?: boolean;
};

// ==========================================
// INTERNAL HELPERS (MATCHING WEB SERVICE)
// ==========================================

const getList = <T = any>(response: any, fallbackKey?: string): T[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.investments)) return response.investments;
  if (Array.isArray(response?.tenures)) return response.tenures;
  if (Array.isArray(response?.bonds)) return response.bonds;
  if (Array.isArray(response?.states)) return response.states;
  if (Array.isArray(response?.branches)) return response.branches;
  if (Array.isArray(response?.statuses)) return response.statuses;
  if (fallbackKey && Array.isArray(response?.[fallbackKey])) return response[fallbackKey];
  return [];
};

const getStatusId = (investment: any): number | null => {
  const values = [
    investment?.status_id,
    investment?.investment_status_id,
    investment?.statusId,
    investment?.investmentStatusId,
    investment?.status?.id,
    investment?.investment_status?.id,
    investment?.investmentStatus?.id,
  ];

  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      const number = Number(value);
      if (!Number.isNaN(number)) {
        return number;
      }
    }
  }

  return null;
};

const getStatusName = (investment: any): string | null => {
  const values = [
    investment?.status_name,
    investment?.investment_status_name,
    investment?.statusName,
    investment?.status?.status_name,
    investment?.status?.name,
    investment?.investment_status?.status_name,
    investment?.investment_status?.name,
    investment?.investmentStatus?.status_name,
    investment?.investmentStatus?.name,
  ];

  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return null;
};

const statusIdMap: Record<number, string> = {
  1: 'Pending Approval',
  2: 'Active',
  3: 'Closed',
  4: 'Rejected',
  5: 'Refunded',
};

const normalizeStatus = (statusName?: string | null, statusId?: number | null): string => {
  if (statusName) {
    const value = String(statusName).trim().toLowerCase();

    if (
      value === 'pending' ||
      value === 'pending approval' ||
      value === 'pending_approval' ||
      value === 'pending-approval'
    ) {
      return 'Pending Approval';
    }

    if (value === 'active' || value === 'approved') {
      return 'Active';
    }

    if (value === 'closed' || value === 'settled') {
      return 'Closed';
    }

    if (value === 'rejected' || value === 'reject') {
      return 'Rejected';
    }

    if (value === 'refunded' || value === 'refund') {
      return 'Refunded';
    }

    if (
      value === 'extension requested' ||
      value === 'tenure extension requested'
    ) {
      return 'Extension Requested';
    }

    if (
      value === 'pre-close requested' ||
      value === 'preclose requested'
    ) {
      return 'Pre-Close Requested';
    }

    if (
      value === 'settlement requested' ||
      value === 'tenure timeout settlement requested'
    ) {
      return 'Settlement Requested';
    }

    return String(statusName).trim();
  }

  if (statusId !== null && statusId !== undefined && statusIdMap[statusId]) {
    return statusIdMap[statusId];
  }

  return 'Unknown';
};

const normalizeInvestment = (investment: any): ApiInvestment => {
  const statusId = getStatusId(investment);
  const statusName = normalizeStatus(getStatusName(investment), statusId);

  return {
    ...investment,
    status_id: statusId,
    investment_status_id: statusId,
    status_name: statusName,
    investment_status: statusName,
    status: statusName,
  };
};

// ==========================================
// INVESTOR SERVICE
// ==========================================

export const investorService = {
  /**
   * GET /investor/dashboard
   */
  getDashboard: async (): Promise<InvestorDashboardResponse> => {
    const response = await apiClient.get<any>('/investor/dashboard');
    const root = response.data;
    if (root && typeof root === 'object' && 'data' in root && root.data) {
      return root.data as InvestorDashboardResponse;
    }
    return root as InvestorDashboardResponse;
  },

  /**
   * GET /investors/profile
   */
  getProfile: async (): Promise<InvestorProfileResponse> => {
    const response = await apiClient.get<InvestorProfileResponse>('/investors/profile');
    return response.data;
  },

  /**
   * PUT /investors/profile
   */
  updateProfile: async (payload: InvestorProfileUpdate): Promise<InvestorProfileResponse> => {
    const bank = payload?.bank || {};

    let accountTypeId: number | null = null;
    if (bank.account_type_id) {
      accountTypeId = Number(bank.account_type_id);
    }

    const cleanPayload = {
      full_name: payload.full_name?.trim() || null,
      mobile: payload.mobile?.trim() || null,
      email: payload.email?.trim() || null,
      date_of_birth: payload.date_of_birth || null,
      address: payload.address?.trim() || null,
      city: payload.city?.trim() || null,
      state_id: payload.state_id ? Number(payload.state_id) : null,
      pincode: payload.pincode?.trim() || null,
      branch_id: payload.branch_id ? Number(payload.branch_id) : null,
      bank: {
        account_holder_name: bank.account_holder_name?.trim() || payload.full_name?.trim() || null,
        bank_name: bank.bank_name?.trim() || null,
        account_type_id: accountTypeId,
        account_number: bank.account_number?.trim() || null,
        ifsc_code: bank.ifsc_code?.trim().toUpperCase() || null,
      },
    };

    const response = await apiClient.put<InvestorProfileResponse>('/investors/profile', cleanPayload);
    return response.data;
  },

  /**
   * GET /masters/investment-statuses
   */
  getInvestmentStatuses: async (): Promise<InvestmentStatusItem[]> => {
    const response = await apiClient.get<any>('/masters/investment-statuses');
    return getList<InvestmentStatusItem>(response.data, 'statuses');
  },

  /**
   * GET /investments/my-investments
   */
  getMyInvestments: async (): Promise<ApiInvestment[]> => {
    const [investmentsResponse, statusesResponse] = await Promise.all([
      apiClient.get<any>('/investments/my-investments'),
      investorService.getInvestmentStatuses().catch(() => []),
    ]);

    const investments = getList<any>(investmentsResponse.data, 'investments');
    const statuses = getList<InvestmentStatusItem>(statusesResponse, 'statuses');

    const statusMap: Record<number, string> = {};
    statuses.forEach((status: any) => {
      if (status?.id !== undefined && status?.id !== null) {
        statusMap[Number(status.id)] = status.status_name || status.name;
      }
    });

    return investments.map((investment: any) => {
      const normalized = normalizeInvestment(investment);
      const statusId = normalized.status_id;
      const mappedStatus =
        statusId !== null && statusId !== undefined ? statusMap[statusId] : null;

      const finalStatus = normalizeStatus(
        mappedStatus || normalized.status_name,
        statusId,
      );

      return {
        ...normalized,
        status_name: finalStatus,
        investment_status: finalStatus,
        status: finalStatus,
      };
    });
  },

  /**
   * GET /investments/my-investments/{investment_id}
   */
  getInvestmentDetails: async (investmentId: number | string): Promise<ApiInvestment> => {
    if (investmentId === undefined || investmentId === null || investmentId === '') {
      throw new Error('Investment ID is required');
    }

    const [investmentResponse, statusesResponse] = await Promise.all([
      apiClient.get<any>(`/investments/my-investments/${encodeURIComponent(investmentId)}`),
      investorService.getInvestmentStatuses().catch(() => []),
    ]);

    const statuses = getList<InvestmentStatusItem>(statusesResponse, 'statuses');
    const statusMap: Record<number, string> = {};
    statuses.forEach((status: any) => {
      if (status?.id !== undefined && status?.id !== null) {
        statusMap[Number(status.id)] = status.status_name || status.name;
      }
    });

    const investment = investmentResponse?.data?.data || investmentResponse?.data || investmentResponse;
    const normalized = normalizeInvestment(investment);
    const statusId = normalized.status_id;
    const mappedStatus =
      statusId !== null && statusId !== undefined ? statusMap[statusId] : null;

    const finalStatus = normalizeStatus(
      mappedStatus || normalized.status_name,
      statusId,
    );

    return {
      ...normalized,
      status_name: finalStatus,
      investment_status: finalStatus,
      status: finalStatus,
    };
  },

  /**
   * GET /investments/my-investments/{investment_id}/bond
   */
  getInvestmentBond: async (investmentId: number | string): Promise<BondData> => {
    if (investmentId === undefined || investmentId === null || investmentId === '') {
      throw new Error('Investment ID is required');
    }

    const response = await apiClient.get<BondResponse | BondData | { data: BondData }>(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/bond`,
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as BondData;
  },

  /**
   * GET /investments/my-bonds/{bond_id}
   */
  getMyBond: async (bondId: number | string): Promise<BondData> => {
    if (bondId === undefined || bondId === null || bondId === '') {
      throw new Error('Bond ID is required');
    }

    const response = await apiClient.get<BondResponse | BondData | { data: BondData }>(
      `/investments/my-bonds/${encodeURIComponent(bondId)}`,
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as BondData;
  },

  /**
   * POST /investments/calculate
   */
  calculateInvestment: async (
    investmentAmount: number | string,
    tenureId: number | string,
  ): Promise<InvestmentCalculationResponse> => {
    const amount = Number(investmentAmount);
    const tenure = Number(tenureId);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Valid investment amount is required.');
    }
    if (!Number.isFinite(tenure) || tenure <= 0) {
      throw new Error('Valid tenure is required.');
    }

    const response = await apiClient.post<InvestmentCalculationResponse>('/investments/calculate', {
      investment_amount: amount,
      tenure_id: tenure,
    });
    return response.data;
  },

  /**
   * POST /investments/
   */
  createInvestment: async (
    investmentAmount: number | string,
    tenureId: number | string,
  ): Promise<ApiInvestment> => {
    const amount = Number(investmentAmount);
    const tenure = Number(tenureId);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Valid investment amount is required.');
    }
    if (!Number.isFinite(tenure) || tenure <= 0) {
      throw new Error('Valid tenure is required.');
    }

    const response = await apiClient.post<ApiInvestment>('/investments/', {
      investment_amount: amount,
      tenure_id: tenure,
    });
    return response.data;
  },

  /**
   * POST /investments/my-investments/{investment_id}/tenure-extension
   */
  requestTenureExtension: async (
    investmentId: number | string,
    extensionMonths: number | string,
    remarks: string = '',
  ): Promise<any> => {
    if (investmentId === undefined || investmentId === null || investmentId === '') {
      throw new Error('Investment ID is required');
    }

    const months = Number(extensionMonths);
    if (!Number.isFinite(months) || months <= 0) {
      throw new Error('Valid extension months are required');
    }

    const response = await apiClient.post(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/tenure-extension`,
      {
        extension_months: months,
        remarks: remarks?.trim() || null,
      },
    );
    return response.data;
  },

  /**
   * POST /investments/my-investments/{investment_id}/preclose
   */
  requestPreclose: async (
    investmentId: number | string,
    reason: string,
  ): Promise<any> => {
    if (investmentId === undefined || investmentId === null || investmentId === '') {
      throw new Error('Investment ID is required');
    }

    const cleanReason = String(reason || '').trim();
    if (!cleanReason) {
      throw new Error('Pre-close reason is required');
    }

    const response = await apiClient.post(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/preclose`,
      {
        reason: cleanReason,
      },
    );
    return response.data;
  },

  /**
   * POST /investments/my-investments/{investment_id}/tenure-timeout-settlement
   */
  requestTenureTimeoutSettlement: async (
    investmentId: number | string,
  ): Promise<any> => {
    if (investmentId === undefined || investmentId === null || investmentId === '') {
      throw new Error('Investment ID is required');
    }

    const response = await apiClient.post(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/tenure-timeout-settlement`,
    );
    return response.data;
  },

  /**
   * GET /masters/investment-tenures
   */
  getInvestmentTenures: async (): Promise<InvestmentTenureItem[]> => {
    const response = await apiClient.get<any>('/masters/investment-tenures');
    return getList<InvestmentTenureItem>(response.data, 'tenures');
  },

  /**
   * GET /masters/states
   */
  getStates: async (): Promise<MasterState[]> => {
    const response = await apiClient.get<any>('/masters/states');
    return getList<MasterState>(response.data, 'states');
  },

  /**
   * GET /masters/branches?state_id={stateId}
   */
  getBranches: async (stateId?: number | string | null): Promise<MasterBranch[]> => {
    if (stateId === null || stateId === undefined || stateId === '' || (typeof stateId === 'number' && isNaN(stateId))) {
      return [];
    }

    const cleanStateId = Number(stateId);
    if (isNaN(cleanStateId) || cleanStateId <= 0) {
      return [];
    }

    const response = await apiClient.get<any>('/masters/branches', {
      params: { state_id: cleanStateId },
    });
    return getList<MasterBranch>(response.data, 'branches');
  },
};

export default investorService;