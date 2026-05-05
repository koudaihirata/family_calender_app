import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'

export type User = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  created_at: string
}

type AuthContextType = {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  signIn: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [token, userData] = await Promise.all([
          SecureStore.getItemAsync('access_token'),
          SecureStore.getItemAsync('user'),
        ])
        if (token && userData) {
          setAccessToken(token)
          setUser(JSON.parse(userData))
        }
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  async function signIn(token: string, refreshToken: string, user: User) {
    await Promise.all([
      SecureStore.setItemAsync('access_token', token),
      SecureStore.setItemAsync('refresh_token', refreshToken),
      SecureStore.setItemAsync('user', JSON.stringify(user)),
    ])
    setAccessToken(token)
    setUser(user)
  }

  async function signOut() {
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('user'),
    ])
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
