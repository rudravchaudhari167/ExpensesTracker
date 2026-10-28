/**
 * Dedicated API Client Layer for Pennywise
 * Connects to Spring Boot REST API
 */

export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('pennywise_custom_api_url');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
    }
  }
  return (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
}

export function setCustomApiUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('pennywise_custom_api_url');
  } else {
    localStorage.setItem('pennywise_custom_api_url', url.trim());
  }
}

class ApiError extends Error {
  constructor(message, status, details = null) {
    super(typeof message === 'string' ? message : JSON.stringify(message));
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content (like successful DELETE)
    if (response.status === 204) {
      return null;
    }

    // Try parsing JSON response if present
    let data = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (data) {
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (typeof data.error === 'string') {
          errorMessage = data.error;
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (data.error && typeof data.error.message === 'string') {
          errorMessage = data.error.message;
        }
      }
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const isCloudHost =
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1';

    const cloudMsg =
      'Your Spring Boot & MySQL backend is running locally on your laptop, so Vercel cannot reach it over the internet. You can explore in Showcase Mode or deploy your backend to Render/Railway.';

    const localMsg =
      'Unable to connect to the backend server. Please verify Spring Boot is running on port 8080.';

    throw new ApiError(isCloudHost ? cloudMsg : localMsg, 0, error);
  }
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
  getBaseUrl,
  setCustomApiUrl,
};

export default api;
