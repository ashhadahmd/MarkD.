import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/attendance" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
