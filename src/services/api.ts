const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface RegisterUserData {
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface ApiUser {
  id: number;
  email: string;
  isAdmin: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ApiUser;
  };
}

export interface ApiError {
  response?: {
    status: number;
    data: {
      message?: string;
      errors?: Array<{ field: string; message: string }>;
    };
  };
}

interface RequestConfig extends RequestInit {
  headers?: HeadersInit & { 'Content-Type'?: string };
}

async function request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = new Error(response.statusText) as Error & ApiError;
    error.response = {
      status: response.status,
      data: await response.json().catch(() => ({})),
    };
    throw error;
  }

  return response.json();
}

export async function registerUser(data: RegisterUserData): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
