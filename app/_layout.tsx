import "./global.css";
import React, { useEffect } from 'react';
import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { portalService } from '../services/portalService';

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();

  // Handled via Redirect components in index.tsx and (tabs)/_layout.tsx

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="subject/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
