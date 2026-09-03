import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient, {TOKEN_KEYS} from '../api/client';

export type TokenResponse = {
  access_token: string;
  token_type?: string;
  user_id: number;
  login_id: string;
  full_name: string;
  role: string;
  branch_id?: number | null;
};

export type UserResponse = {
  id: number;
  login_id: string;
  full_name: string;
  mobile?: string | null;
  email?: string | null;
  role: string;
  is_active: boolean;
  branch_id?: number | null;
};

export type ForgotPasswordSendOtpResponse = {
  message?: string;
  detail?: string;
};

export type ForgotPasswordVerifyOtpResponse = {
  message?: string;
  detail?: string;
};

export type ForgotPasswordResetResponse = {
  message?: string;
  detail?: string;
};

export type SendEmailOtpResponse = {
  success?: boolean;
  message?: string;
  detail?: string;
};

export type VerifyEmailOtpResponse = {
  success?: boolean;
  valid?: boolean;
  message?: string;
  detail?: string;
};

export type InvestorRegisterPayload = {
  full_name: string;
  mobile: string;
  email?: string | null;
  password: string;
  date_of_birth: string;
  aadhaar_number: string;
  address: string;
  city: string;
  state_id: number;
  pincode: string;
  branch_id: number;
};

export type StaffRegisterPayload = {
  full_name: string;
  mobile: string;
  email?: string | null;
  username: string;
  password: string;
  branch_id?: number | null;
};

export const authService = {
  /**
   * Send Email OTP (Registration)
   * POST /auth/email/send-otp
   */
  sendEmailOtp: async (email: string, name?: string): Promise<SendEmailOtpResponse> => {
    const response = await apiClient.post<SendEmailOtpResponse>(
      '/auth/email/send-otp',
      {
        email: email.trim().toLowerCase(),
        name: name?.trim() || 'User',
      },
    );
    return response.data;
  },

  /**
   * Verify Email OTP (Registration)
   * POST /auth/email/verify-otp
   */
  verifyEmailOtp: async (email: string, otp: string): Promise<VerifyEmailOtpResponse> => {
    const response = await apiClient.post<VerifyEmailOtpResponse>(
      '/auth/email/verify-otp',
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      },
    );
    return response.data;
  },

  /**
   * Register Investor
   * POST /auth/investor/register
   */
  registerInvestor: async (payload: InvestorRegisterPayload): Promise<any> => {
    const response = await apiClient.post('/auth/investor/register', payload);
    return response.data;
  },

  /**
   * Register Admin
   * POST /auth/admin/register
   */
  registerAdmin: async (payload: StaffRegisterPayload): Promise<any> => {
    const response = await apiClient.post('/auth/admin/register', payload);
    return response.data;
  },

  /**
   * Register Super Admin
   * POST /auth/superadmin/register
   */
  registerSuperAdmin: async (payload: StaffRegisterPayload): Promise<any> => {
    const response = await apiClient.post('/auth/superadmin/register', payload);
    return response.data;
  },

  /**
   * Investor Login
   * POST /auth/investor/login
   */
  loginInvestor: async (investorId: string, password: string): Promise<TokenResponse> => {
    const formattedId = investorId.trim().toUpperCase();
    const response = await apiClient.post<TokenResponse>('/auth/investor/login', {
      investor_id: formattedId,
      password: password,
    });

    const data = response.data;
    if (data?.access_token) {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, data.access_token),
        AsyncStorage.setItem(TOKEN_KEYS.INVESTOR_ID, formattedId),
        AsyncStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(data)),
      ]);
    }

    return data;
  },

  /**
   * Send Forgot Password OTP
   * POST /auth/forgot-password/send-otp
   */
  sendForgotPasswordOtp: async (email: string): Promise<ForgotPasswordSendOtpResponse> => {
    const response = await apiClient.post<ForgotPasswordSendOtpResponse>(
      '/auth/forgot-password/send-otp',
      {
        email: email.trim().toLowerCase(),
      },
    );
    return response.data;
  },

  /**
   * Verify Forgot Password OTP
   * POST /auth/forgot-password/verify-otp
   */
  verifyForgotPasswordOtp: async (
    email: string,
    otp: string,
  ): Promise<ForgotPasswordVerifyOtpResponse> => {
    const response = await apiClient.post<ForgotPasswordVerifyOtpResponse>(
      '/auth/forgot-password/verify-otp',
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      },
    );
    return response.data;
  },

  /**
   * Reset Forgot Password
   * POST /auth/forgot-password/reset
   */
  resetForgotPassword: async (
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<ForgotPasswordResetResponse> => {
    const response = await apiClient.post<ForgotPasswordResetResponse>(
      '/auth/forgot-password/reset',
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: newPassword,
      },
    );
    return response.data;
  },

  /**
   * Get Current User Details
   * GET /auth/me
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/auth/me');
    return response.data;
  },

  /**
   * Get stored token
   */
  getStoredToken: async (): Promise<string | null> => {
    return (
      (await AsyncStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)) ||
      (await AsyncStorage.getItem('accessToken')) ||
      (await AsyncStorage.getItem('token'))
    );
  },

  /**
   * Get stored user info
   */
  getStoredUserInfo: async (): Promise<TokenResponse | null> => {
    try {
      const raw = await AsyncStorage.getItem(TOKEN_KEYS.USER_INFO);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Logout and clear all auth data
   */
  logout: async (): Promise<void> => {
    const keys = [
      TOKEN_KEYS.ACCESS_TOKEN,
      TOKEN_KEYS.REFRESH_TOKEN,
      TOKEN_KEYS.USER_INFO,
      TOKEN_KEYS.INVESTOR_ID,
      'accessToken',
      'token',
      'authToken',
    ];
    await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
  },
};

export default authService;
