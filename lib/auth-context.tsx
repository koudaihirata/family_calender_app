import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as SecureStore from 'expo-secure-store'

export type User = {
  id: string
  name: string
  email: string
  avatar_url: string | null
  created_at: string
}

export type Family = {
  id: string
  name: string
  invite_code: string
  home_address: string | null
  home_lat: number | null
  home_lng: number | null
  created_at: string
}

type AuthContextType = {
  user: User | null
  family: Family | null
  accessToken: string | null
  isLoading: boolean
  signIn: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  signOut: () => Promise<void>
  setFamily: (family: Family | null) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null)
  const [family, setFamilyState]      = useState<Family | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading]     = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const [token, userData, familyData] = await Promise.all([
          SecureStore.getItemAsync('access_token'),
          SecureStore.getItemAsync('user'),
          SecureStore.getItemAsync('family'),
        ])
        if (token && userData) {
          setAccessToken(token)
          setUser(JSON.parse(userData))
        }
        if (familyData) {
          setFamilyState(JSON.parse(familyData))
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

  async function setFamily(family: Family | null) {
    if (family) {
      await SecureStore.setItemAsync('family', JSON.stringify(family))
    } else {
      await SecureStore.deleteItemAsync('family')
    }
    setFamilyState(family)
  }

  async function signOut() {
    await Promise.all([
      SecureStore.deleteItemAsync('access_token'),
      SecureStore.deleteItemAsync('refresh_token'),
      SecureStore.deleteItemAsync('user'),
      SecureStore.deleteItemAsync('family'),
    ])
    setAccessToken(null)
    setUser(null)
    setFamilyState(null)
  }

  return (
    <AuthContext.Provider value={{ user, family, accessToken, isLoading, signIn, signOut, setFamily }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
