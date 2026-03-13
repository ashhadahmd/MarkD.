import "./global.css";
import React, { useEffect, useRef } from 'react';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppState, AppStateStatus } from 'react-native';
import { sessionService } from '../services/sessionService';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
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
