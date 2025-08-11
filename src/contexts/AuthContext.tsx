import { authApi } from "@/api/auth";
import { type AuthContextType, type User } from "@/types/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          // token validation with backend
        }
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

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
      // if (!data.token) {
      //   throw new Error("Token not issued");
      // }
      //
      // // Store authentication token
      // localStorage.setItem("authToken", data.token.access_token);
      // localStorage.setItem("refreshToken", data.token.refresh_token);

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

      // TODO: Backend response requires auth token.
      // if (!userData.token) {
      //   throw new Error("Token not issued");
      // }
      //
      // // Store authentication token
      // localStorage.setItem("authToken", userData.token.access_token);
      // localStorage.setItem("refreshToken", userData.token.refresh_token);

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
