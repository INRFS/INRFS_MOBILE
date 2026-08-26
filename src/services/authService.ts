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

export const authService = {
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
