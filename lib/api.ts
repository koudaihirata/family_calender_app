import * as SecureStore from 'expo-secure-store'
import type { User, Family } from './auth-context'
import type { Event } from '@/types/event'
import type { Label } from '@/types/label'

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

  // イベント
  getEvents: (year: number, month: number) =>
    request<{ events: any[] }>(`/events?year=${year}&month=${month}`)
      .then(res => ({
        events: (res.events || []).map((e: any) => ({
          ...e,
          start_at: typeof e.start_at === 'string' ? new Date(e.start_at) : e.start_at,
          end_at: typeof e.end_at === 'string' ? new Date(e.end_at) : e.end_at,
          created_at: typeof e.created_at === 'string' ? new Date(e.created_at) : e.created_at,
          updated_at: typeof e.updated_at === 'string' ? new Date(e.updated_at) : e.updated_at,
        }))
      })),

  createEvent: (body: { title: string; start_at: string; end_at: string; label_id?: string; location_name?: string }) =>
    request<{ event: Event }>('/events', { method: 'POST', body: JSON.stringify(body) }),

  // ラベル
  getLabels: () =>
    request<{ labels: Label[] }>('/labels')
      .then(res => ({
        labels: (res.labels || []).map((l: any) => ({
          ...l,
          created_at: typeof l.created_at === 'string' ? new Date(l.created_at) : l.created_at,
        }))
      }))
}
