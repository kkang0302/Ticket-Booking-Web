import { ApiResponse } from '../types/api';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge custom headers if provided
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle empty responses (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  const json: ApiResponse<T> = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(json.error?.message || 'An error occurred during the request.', response.status);
  }

  return json.data as T;
}
