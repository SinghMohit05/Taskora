import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { ToastContainer } from '../src/components/Toast';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { colors } from '../src/theme';

function AuthGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User is logged out but trying to access protected screen
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is logged in but on auth screens
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.forge,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          contentStyle: {
            backgroundColor: colors.paper,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="project/new"
          options={{
            title: 'New Project',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
        <Stack.Screen
          name="project/[id]/edit"
          options={{
            title: 'Edit Project',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
        <Stack.Screen
          name="task/new"
          options={{
            title: 'New Task',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            title: 'Edit Task',
            presentation: 'modal',
            headerStyle: { backgroundColor: colors.card },
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60,
          },
        },
      })
  );

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthGate />
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.forge,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
