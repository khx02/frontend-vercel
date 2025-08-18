this doc is AI gen

# Token Refresh System Documentation

This document explains how the automatic token refresh system works in your application.

## Overview

The token refresh system is designed to automatically refresh authentication tokens in several scenarios:
1. When the user navigates to different routes
2. When API requests return 401 (Unauthorized) errors
3. Optionally on window focus and timer intervals

## Components

### 1. Enhanced API Client (`src/api/client.ts`)

The `ApiClient` class now includes:

- **Response Interceptor**: Automatically catches 401 errors and attempts to refresh tokens
- **Request Queuing**: Prevents multiple simultaneous refresh attempts
- **Manual Refresh Method**: `refreshTokenOnRouteChange()` for manual token refresh

#### Key Features:
- Prevents duplicate refresh requests
- Queues failed requests and retries them after successful refresh
- Automatically redirects to login if refresh fails

### 2. Token Refresh Hook (`src/hooks/useTokenRefresh.ts`)

A custom React hook that provides flexible token refresh options:

```typescript
useTokenRefresh({
  refreshOnRouteChange: true,  // Refresh on every route change
  refreshOnFocus: true,        // Refresh when user focuses the tab
  refreshOnTimer: true,        // Refresh every X minutes
  timerInterval: 15 * 60 * 1000, // 15 minutes
  excludeRoutes: ['/login', '/signup'] // Skip these routes
});
```

### 3. Updated Auth API (`src/api/auth.ts`)

Added a simple refresh endpoint for the interceptor:
- `refresh()`: Cookie-based refresh for the interceptor
- `refreshToken()`: Original method for manual refresh with payload

## Usage Examples

### Basic Setup (Recommended)

Add to your main layout component:

```typescript
import { useTokenRefresh } from "./hooks/useTokenRefresh";

export function Layout() {
  // Basic setup - refreshes on route changes only
  useTokenRefresh();
  
  return (
    // Your layout JSX
  );
}
```

### Advanced Setup

```typescript
export function Layout() {
  useTokenRefresh({
    refreshOnRouteChange: true,
    refreshOnFocus: true,
    refreshOnTimer: true,
    timerInterval: 10 * 60 * 1000, // 10 minutes
    excludeRoutes: ['/login', '/signup', '/public-page']
  });
  
  return (
    // Your layout JSX
  );
}
```

### Manual Refresh

```typescript
import { apiClient } from '@/api/client';

// Manually refresh token anywhere in your app
const handleManualRefresh = async () => {
  try {
    const success = await apiClient.refreshTokenOnRouteChange();
    if (success) {
      console.log('Token refreshed successfully');
    }
  } catch (error) {
    console.error('Manual refresh failed:', error);
  }
};
```

## Customization

### Custom Refresh Logic

You can extend the `ApiClient` class or create your own refresh logic:

```typescript
class CustomApiClient extends ApiClient {
  protected async refreshToken(): Promise<void> {
    // Your custom refresh logic
    const response = await this.axiosInstance.post('/custom/refresh');
    // Handle response
  }
}
```

### Custom Hook Options

Create your own version of `useTokenRefresh` with different defaults:

```typescript
export const useMyTokenRefresh = (customOptions = {}) => {
  const defaultOptions = {
    refreshOnRouteChange: true,
    refreshOnFocus: false,
    refreshOnTimer: true,
    timerInterval: 20 * 60 * 1000, // 20 minutes
    excludeRoutes: ['/login', '/signup', '/404']
  };
  
  return useTokenRefresh({ ...defaultOptions, ...customOptions });
};
```