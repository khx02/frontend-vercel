import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseTokenRefreshOptions {
  /** Whether to refresh token on every route change (default: true) */
  refreshOnRouteChange?: boolean;
  /** Whether to refresh token on window focus (default: false) */
  refreshOnFocus?: boolean;
  /** Whether to refresh token on a timer (default: false) */
  refreshOnTimer?: boolean;
  /** Timer interval in milliseconds (default: 15 minutes) */
  timerInterval?: number;
  /** Routes to exclude from auto-refresh */
  excludeRoutes?: string[];
}

export const useTokenRefresh = (options: UseTokenRefreshOptions = {}) => {
  const {
    refreshOnRouteChange = true,
    refreshOnFocus = false,
    refreshOnTimer = false,
    timerInterval = 14 * 60 * 1000, // 14 minutes
    excludeRoutes = ['/login', '/signup', '/']
  } = options;

  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const shouldRefresh = useCallback(() => {
    if (!isAuthenticated) return false;
    if (excludeRoutes.includes(location.pathname)) return false;
    return true;
  }, [isAuthenticated, location.pathname, excludeRoutes]);

  const refreshToken = useCallback(async () => {
    if (!shouldRefresh()) return;
    
    try {
      await apiClient.refreshTokenOnRouteChange();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }, [shouldRefresh]);

  // Refresh on route change
  useEffect(() => {
    if (refreshOnRouteChange && shouldRefresh()) {
      refreshToken();
    }
  }, [location.pathname, refreshOnRouteChange, refreshToken]);

  // Refresh on window focus
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      if (shouldRefresh()) {
        refreshToken();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshOnFocus, refreshToken]);

  // Refresh on timer
  useEffect(() => {
    if (!refreshOnTimer) return;

    const interval = setInterval(() => {
      if (shouldRefresh()) {
        refreshToken();
      }
    }, timerInterval);

    return () => clearInterval(interval);
  }, [refreshOnTimer, timerInterval, refreshToken]);

  return { refreshToken };
};
