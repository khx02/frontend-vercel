import type { AuthResponse, RefreshTokenPayload, RegisterPayload, ValidateTokenRes } from "@/types/auth";
import { apiClient } from "./client"

export const authApi = {
  register: (data: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post('/users/register', data, {}, true),

  login: (data: FormData): Promise<AuthResponse> =>
    apiClient.post('/auth/token', data, {}, false),

  logout: (): Promise<Response> =>
    apiClient.post('/auth/logout'),

  validateToken: (token: string): Promise<ValidateTokenRes> => {
    const options = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };

    return apiClient.post('/auth/validate_token', undefined, options, true);
  },

  refreshToken: (data: RefreshTokenPayload): Promise<AuthResponse> =>
    apiClient.post('/auth/refresh_token', data, {}, true),
};
