import { authApi } from "./auth";
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

// Extend the Axios request config to include our custom _retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const API_BASE_URL = "http://localhost:8000/api";

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Response interceptor to handle token refresh on 401
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as ExtendedAxiosRequestConfig;

        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // Don't try to refresh on auth-related requests to avoid infinite loops
          if (
            originalRequest.url?.includes("/auth/me") ||
            originalRequest.url?.includes("/auth/set-token") ||
            originalRequest.url?.includes("/auth/logout") ||
            originalRequest.url?.includes("/auth/refresh-token")
          ) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.refreshToken();
            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            // Redirect to login or handle auth failure
            window.location.href = "/login";
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(): Promise<void> {
    try {
      // Call your refresh endpoint - using the correct endpoint
      await authApi.refresh();
    } catch (error) {
      // If refresh fails, clear any stored auth state
      throw error;
    }
  }

  // Method to manually refresh token (for route changes)
  public async refreshTokenOnRouteChange(): Promise<boolean> {
    try {
      await this.refreshToken();
      return true;
    } catch (error) {
      console.error("Token refresh failed on route change:", error);
      return false;
    }
  }

  private async request<T = unknown>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.request<T>(config);
  }

  get<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "GET", ...config });
  }
  post<T = unknown>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "POST", data, ...config });
  }
  put<T = unknown>(endpoint: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "PUT", data, ...config });
  }
  delete<T = unknown>(endpoint: string, config?: AxiosRequestConfig) {
    return this.request<T>({ url: endpoint, method: "DELETE", ...config });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
