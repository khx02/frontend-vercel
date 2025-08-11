import type { AuthResponse, RegisterPayload } from "@/types/auth";
import { apiClient } from "./client"

export const authApi = {
  register: (data: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post('/users/register', data, {}, true),

  login: (data: FormData): Promise<AuthResponse> =>
    apiClient.post('/auth/token', data, {}, false),

  logout: (): Promise<Response> =>
    apiClient.post('/auth/logout')
};
