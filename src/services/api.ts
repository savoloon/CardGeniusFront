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
    credentials: 'include', // Required for cookies (HttpOnly)
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

export interface LoginUserData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ApiUser;
  };
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

export async function registerUser(data: RegisterUserData): Promise<RegisterResponse> {
  return request<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: LoginUserData): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshTokens(): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/refresh', {
    method: 'POST',
  });
}

export async function logoutUser(): Promise<LogoutResponse> {
  return request<LogoutResponse>('/auth/logout', {
    method: 'POST',
  });
}

export interface MeResponse {
  success: boolean;
  data?: { user: ApiUser };
}

export async function getCurrentUser(): Promise<MeResponse> {
  return request<MeResponse>('/auth/me');
}

export type ProcessMode =
  | 'remove_background'
  | 'generate_background'
  | 'generate_exposure'
  | 'generate_exposure_by_request'
  | 'improve_image';

export interface SubmitProcessResponse {
  success: boolean;
  message?: string;
  data?: { taskId: string };
}

export interface ProcessStatusResponse {
  success: boolean;
  data?: {
    taskId: string;
    status: 'pending' | 'completed' | 'failed';
    result?: { images: string[] };
  };
}

export async function submitProcess(
  image: File,
  mode: ProcessMode,
  options?: { variants?: number; prompt?: string }
): Promise<SubmitProcessResponse> {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('mode', mode);
  if (options?.variants) formData.append('variants', String(options.variants));
  if (options?.prompt) formData.append('prompt', options.prompt);

  const url = `${API_URL}/process`;
  const config: RequestInit = {
    method: 'POST',
    credentials: 'include',
    body: formData,
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || response.statusText) as Error & ApiError;
    error.response = { status: response.status, data };
    throw error;
  }

  return data;
}

export async function getProcessStatus(
  taskId: string
): Promise<ProcessStatusResponse> {
  return request<ProcessStatusResponse>(`/process/${taskId}`);
}
