import { AuthProvider } from '@/auth/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === 'light' ? DarkTheme : DefaultTheme}
          >
            <Stack initialRouteName="SplashScreen">
              <Stack.Screen
                name="SplashScreen"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', title: 'Modal' }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
