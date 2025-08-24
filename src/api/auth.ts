import type { AuthResponse, RefreshTokenPayload, RegisterPayload } from "@/types/auth";
import { apiClient } from "./client"

export const authApi = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/users/register', data);
    return response.data;
  },

  login: async (data: FormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/token', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },


  refreshToken: async (data: RefreshTokenPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/refresh_token', data);
    return response.data;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post('/api/auth/refresh_token');
  },
};
