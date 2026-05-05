import * as SecureStore from 'expo-secure-store'
import type { User, Family } from './auth-context'

export const BASE_URL = 'https://family-calendar-back.hiratakoudai61.workers.dev'

type AuthResponse = {
  user: User
  access_token: string
  refresh_token: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await SecureStore.getItemAsync('access_token')

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.json() as { error?: string }
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export const api = {
  // 認証
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/login', { method: 'POST', body: JSON.stringify(body) }),

  me: () =>
    request<{ user: User }>('/me'),

  // 家族
  getMyFamily: () =>
    request<{ family: Family | null }>('/families/me'),

  createFamily: (body: { name: string }) =>
    request<{ family: Family }>('/families', { method: 'POST', body: JSON.stringify(body) }),

  joinFamily: (body: { invite_code: string }) =>
    request<{ family: Family }>('/families/join', { method: 'POST', body: JSON.stringify(body) }),
}
