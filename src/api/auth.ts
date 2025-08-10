import type { RegisterPayload, User } from "@/types/auth";
import { apiClient } from "./client"

export const authApi = {
  register: (data: RegisterPayload): Promise<User> =>
    apiClient.post('/users/register', data, {}, true),

  login: (data: FormData): Promise<User> =>
    apiClient.post('/auth/token', data, {}, false),

  logout: (): Promise<Response> =>
    apiClient.post('/auth/logout')
};
