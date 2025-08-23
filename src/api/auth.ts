import type { AuthResponse, RefreshTokenPayload, RegisterPayload } from "@/types/auth";
import { apiClient } from "./client"

export const authApi = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/register', data);
    return response.data;
  },

  login: async (data: FormData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/token', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },


  refreshToken: async (data: RefreshTokenPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh_token', data);
    return response.data;
  },

  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh_token');
  },
};
