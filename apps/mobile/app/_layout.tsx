import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSession } from '../lib/auth-client';
import { TRPCProvider } from '../lib/trpc';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AUTH_ROUTES = ['sign-in', 'sign-up'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const segments = useSegments();

  useEffect(() => {
    if (isPending) return;
    const onAuthScreen = AUTH_ROUTES.includes(segments[0] as string);
    if (!session && !onAuthScreen) {
      router.replace('/sign-in');
    } else if (session && onAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [session, isPending, segments]);

  if (isPending) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TRPCProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </TRPCProvider>
  );
}
