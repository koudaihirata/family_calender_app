import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'

export const unstable_settings = {
  anchor: '(tabs)',
}

function RootNavigator() {
  const { user, family, isLoading, setFamily } = useAuth()
  const segments                               = useSegments()
  const colorScheme                            = useColorScheme()

  useEffect(() => {
    if (isLoading) return

    const inAuth  = segments[0] === '(auth)'
    const inSetup = segments[0] === '(setup)'

    if (!user) {
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    // ログイン済みだが family がキャッシュにない → APIで確認
    if (!family) {
      api.getMyFamily().then(({ family: f }) => {
        if (f) {
          setFamily(f)
          if (inAuth || inSetup) router.replace('/(tabs)')
        } else {
          if (!inSetup) router.replace('/(setup)')
        }
      }).catch(() => {
        if (!inSetup) router.replace('/(setup)')
      })
      return
    }

    if (inAuth || inSetup) router.replace('/(tabs)')
  }, [user, family, isLoading, segments])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)"  options={{ headerShown: false }} />
        <Stack.Screen name="(auth)"  options={{ headerShown: false }} />
        <Stack.Screen name="(setup)" options={{ headerShown: false }} />
        <Stack.Screen name="modal"   options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="add-event" options={{ presentation: 'modal', title: 'イベント追加' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
