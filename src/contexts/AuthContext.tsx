import { authApi } from "@/api/auth";
import { type AuthContextType, type User } from "@/types/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);

      try {
        // TODO: Store token as cookies
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.log("TOKEN NOT FOUND/LOGGED OUT");
          setUser(null);

          return;
        }

        // token validation with backend
        console.log("Validating token..");
        try {
          await authApi.validateToken(token);
        } catch (err) {
          console.log("Invalid token, refreshing...");

          // Refresh token
          const refresh_token = localStorage.getItem("refreshToken");
          if (!refresh_token) { throw new Error("Refresh token not found") };

          const body = { token: refresh_token };
          const refresh_res = await authApi.refreshToken(body);

          localStorage.setItem("authToken", refresh_res.token.access_token);
          localStorage.setItem("refreshToken", refresh_res.token.refresh_token);

          console.log("Refresh token res:", refresh_res);
          console.log("Successfully refreshed token");
          return;
        }

        console.log("Authenticated!");
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [location.pathname]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      // Create form data as expected by OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const authRes = await authApi.login(formData);

      console.log("Login successful:", authRes);

      // TODO: Backend must return a token.
      if (!authRes.token.access_token || !authRes.token.refresh_token) {
        throw new Error("Token not issued");
      }

      // Store authentication token
      localStorage.setItem("authToken", authRes.token.access_token);
      localStorage.setItem("refreshToken", authRes.token.refresh_token);

      setUser(authRes.user);
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, passwordConfirmation: string): Promise<void> => {
    setIsLoading(true);

    try {
      const payload = {
        email: email,
        password: password,
      }

      const authRes = await authApi.register(payload);

      console.log("Login successful:", authRes);

      if (!authRes.token.access_token || !authRes.token.refresh_token) {
        throw new Error("Token not issued");
      }

      // Store authentication token
      localStorage.setItem("authToken", authRes.token.access_token);
      localStorage.setItem("refreshToken", authRes.token.refresh_token);

      setUser(authRes.user);
    } catch (error) {
      console.log("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
