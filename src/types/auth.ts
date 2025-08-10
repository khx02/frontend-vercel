export interface User {
  id: string;
  email: string;
  // name: string,
  // isExec: boolean,
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, passwordConfirm: string) => Promise<void>;
}

export interface AuthResponse {
  user: User | null;
  access_token: string;
  refresh_token: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
