import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

const API_BASE_URL = "http://localhost:8000";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseUrl: string) {
    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      withCredentials: true,
    });

    // 401 / refresh here
    this.axiosInstance.interceptors.response.use(
      (res) => res,
      (error) => Promise.reject(error)
    );
  }

  private async request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
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
