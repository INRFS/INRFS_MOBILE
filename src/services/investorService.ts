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
  status?: string | null;
  investment_date?: string | null;
  maturity_date?: string | null;
  approved_by?: string | number | null;
  approved_date?: string | null;
  remarks?: string | null;
  rejection_reason?: string | null;
  bond_id?: string | null;
  bond_number?: string | null;
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
  is_active?: boolean;
};

export type MasterBranch = {
  id: number;
  branch_name: string;
  state_id?: number | null;
  is_active?: boolean;
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
    const response = await apiClient.put<InvestorProfileResponse>('/investors/profile', payload);
    return response.data;
  },

  /**
   * GET /investments/my-investments
   */
  getMyInvestments: async (): Promise<ApiInvestment[]> => {
    const response = await apiClient.get<ApiInvestment[] | {data: ApiInvestment[]}>('/investments/my-investments');
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
    if (Array.isArray((response.data as any)?.items)) return (response.data as any).items;
    return [];
  },

  /**
   * GET /investments/my-investments/{investment_id}
   */
  getInvestmentDetails: async (investmentId: number | string): Promise<ApiInvestment> => {
    const response = await apiClient.get<ApiInvestment | {data: ApiInvestment}>(
      `/investments/my-investments/${encodeURIComponent(investmentId)}`,
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as ApiInvestment;
  },

  /**
   * GET /investments/my-investments/{investment_id}/bond
   */
  getInvestmentBond: async (investmentId: number | string): Promise<BondData> => {
    const response = await apiClient.get<BondResponse | BondData | {data: BondData}>(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/bond`,
    );
    if ((response.data as any)?.data) return (response.data as any).data;
    return response.data as BondData;
  },

  /**
   * POST /investments/calculate
   */
  calculateInvestment: async (
    investmentAmount: number,
    tenureId: number,
  ): Promise<InvestmentCalculationResponse> => {
    const response = await apiClient.post<InvestmentCalculationResponse>('/investments/calculate', {
      investment_amount: investmentAmount,
      tenure_id: tenureId,
    });
    return response.data;
  },

  /**
   * POST /investments/
   */
  createInvestment: async (
    investmentAmount: number,
    tenureId: number,
  ): Promise<ApiInvestment> => {
    const response = await apiClient.post<ApiInvestment>('/investments/', {
      investment_amount: investmentAmount,
      tenure_id: tenureId,
    });
    return response.data;
  },

  /**
   * POST /investments/my-investments/{investment_id}/tenure-extension
   */
  requestTenureExtension: async (
    investmentId: number | string,
    extensionMonths: number,
    remarks: string = '',
  ): Promise<any> => {
    const response = await apiClient.post(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/tenure-extension`,
      {
        extension_months: extensionMonths,
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
    const response = await apiClient.post(
      `/investments/my-investments/${encodeURIComponent(investmentId)}/preclose`,
      {
        reason: reason.trim(),
      },
    );
    return response.data;
  },

  /**
   * GET /masters/investment-tenures
   */
  getInvestmentTenures: async (): Promise<InvestmentTenureItem[]> => {
    const response = await apiClient.get<InvestmentTenureItem[] | {data: InvestmentTenureItem[]}>(
      '/masters/investment-tenures',
    );
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
    return [];
  },

  /**
   * GET /masters/investment-statuses
   */
  getInvestmentStatuses: async (): Promise<InvestmentStatusItem[]> => {
    const response = await apiClient.get<InvestmentStatusItem[] | {data: InvestmentStatusItem[]}>(
      '/masters/investment-statuses',
    );
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
    return [];
  },

  /**
   * GET /masters/states
   */
  getStates: async (): Promise<MasterState[]> => {
    const response = await apiClient.get<MasterState[] | {data: MasterState[]}>('/masters/states');
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
    return [];
  },

  /**
   * GET /masters/branches
   */
  getBranches: async (stateId?: number): Promise<MasterBranch[]> => {
    const response = await apiClient.get<MasterBranch[] | {data: MasterBranch[]}>('/masters/branches', {
      params: stateId ? {state_id: stateId} : undefined,
    });
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
    return [];
  },
};

export default investorService;
