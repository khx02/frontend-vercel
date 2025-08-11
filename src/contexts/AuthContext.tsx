// src/contexts/AuthContext.tsx
import { apiClient } from "@/api/client";
import { type AuthContextType, type User } from "@/types/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  // Ask backend who the user is (cookie-based session)
  const fetchMe = async () => {
    try {
      const { data } = await apiClient.get<User>("/auth/me");
      setUser(data);

      console.log(user);
      
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      try {
        await fetchMe();
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
    // re-check when the route changes (optional but handy)
  }, [location.pathname]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // If your backend expects a form (OAuth2PasswordRequestForm), keep FormData:
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);

      // Server should set http-only cookies (access/refresh) via Set-Cookie
      await apiClient.post("/auth/token", form);
      await fetchMe();
      
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, _passwordConfirmation: string): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/register", { email, password });
      await fetchMe();

    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Server should clear cookies + revoke refresh token
      await apiClient.post("/auth/logout");
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
