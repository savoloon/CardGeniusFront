const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface RegisterUserData {
  email: string;
  password: string;
  smartToken: string;
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

interface RequestInternalOptions {
  skipAuthRetry?: boolean;
}

let sessionExpiredHandler: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

async function request<T>(
  endpoint: string,
  options: RequestConfig = {},
  internalOptions: RequestInternalOptions = {}
): Promise<T> {
  const { skipAuthRetry = false } = internalOptions;
  const url = `${API_URL}${endpoint}`;
  const config: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const status = response.status;
    const data = await response.json().catch(() => ({}));

    // Только 401 (Unauthorized) считаем поводом попытаться обновить токен.
    // 403 (Forbidden) — доступ запрещён, не сбрасываем сессию.
    if (status === 401 && !skipAuthRetry) {
      try {
        const refreshRes = await request<LoginResponse>(
          '/auth/refresh',
          { method: 'POST' },
          { skipAuthRetry: true }
        );
        if (refreshRes.success) {
          return request<T>(endpoint, options, { skipAuthRetry: true });
        }
      } catch {
        // refresh не удался
      }
      sessionExpiredHandler?.();
      // Не редиректим, если 401 вернул именно /auth/refresh (при загрузке без валидного токена),
      // иначе бесконечный цикл: редирект → загрузка → refresh 401 → редирект → ...
      if (endpoint !== '/auth/refresh') {
        window.location.href = '/';
      }
      const error = new Error(response.statusText) as Error & ApiError;
      error.response = { status, data };
      throw error;
    }

    const error = new Error(response.statusText) as Error & ApiError;
    error.response = { status, data };
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

export interface UpdateProfileData {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data?: { user: ApiUser };
}

export async function updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
  return request<UpdateProfileResponse>('/auth/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export interface AdminUser {
  id: number;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminPlan {
  id: number;
  name: string;
  price: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data?: { users: AdminUser[] };
}

export interface AdminPlansResponse {
  success: boolean;
  data?: { plans: AdminPlan[] };
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  return request<AdminUsersResponse>('/admin/users');
}

export async function getAdminPlans(): Promise<AdminPlansResponse> {
  return request<AdminPlansResponse>('/admin/plans');
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
