const API_BASE_URL = "http://localhost:8000"

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg);
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  };

  async post<T>(endpoint: string, data?: any, options: RequestInit = {}, stringify: boolean = true): Promise<T> {
    const headers = new Headers(options.headers);

    if (stringify && data) {
      headers.set('Content-Type', 'application/json');
    }

    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: data ?
        stringify ? JSON.stringify(data) : data
        : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  };
};

export const apiClient = new ApiClient(API_BASE_URL);
