import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { ProgressLoading } from "@/components/ProgressLoading";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <ProgressLoading message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
