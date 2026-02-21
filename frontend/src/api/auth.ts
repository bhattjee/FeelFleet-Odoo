import { api } from './client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt?: string;
}

export async function login(email: string, password: string) {
  const res = await api.post<{ user: AuthUser }>('/api/auth/login', { email, password });
  if (!res.success || !res.data?.user) throw new Error(res.error || 'Login failed');
  return res.data.user;
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  confirmPassword: string;
}) {
  const res = await api.post<{ user: AuthUser }>('/api/auth/register', data);
  if (!res.success || !res.data?.user) throw new Error(res.error || 'Registration failed');
  return res.data.user;
}

export async function getMe() {
  const res = await api.get<{ user: AuthUser }>('/api/auth/me');
  if (!res.success || !res.data?.user) throw new Error(res.error || 'Not authenticated');
  return res.data.user;
}

export async function logout() {
  await api.post('/api/auth/logout');
}
