import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { portalService } from '../services/portalService';
import { sessionService } from '../services/sessionService';

export default function Index() {
  const { isAuthenticated, rememberMe, regNo, password, loginState } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [updateRequired, setUpdateRequired] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    try {
      // Always check for updates first
      const { isLatest, latestVersion } = await portalService.checkLatestVersion();
      if (!isLatest) {
        // Redirect to login which will display the update screen
        setUpdateRequired(true);
        setChecking(false);
        return;
      }

      // If rememberMe is on and we have credentials, try to auto-login
      if (rememberMe && regNo && password) {
        const valid = await portalService.isSessionValid();
        if (valid) {
          // Session still alive — go straight to the app
          setChecking(false);
          router.replace('/(tabs)/attendance');
          return;
        }
        // Cookie expired — silently renew
        const renewed = await portalService.tryRenewSession();
        if (renewed) {
          const profile = await portalService.getProfile();
          loginState(regNo, password, profile, true);
          setChecking(false);
          router.replace('/(tabs)/attendance');
          return;
        }
      }
    } catch (e) {
      // Network error — fall through to login
    }

    // Not remembered or session expired/invalid
    await sessionService.clearIfNotPersistent();
    setChecking(false);
  };

  if (checking) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        {/* App logo */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 42, fontWeight: '800', color: '#147A5C' }}>MarkD</Text>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#147A5C', marginTop: 16, marginLeft: 3 }} />
        </View>
        <ActivityIndicator size="large" color="#147A5C" />
        <Text style={{ color: '#111827', fontWeight: '600', fontSize: 16, marginTop: 16 }}>
          {rememberMe ? 'Signing you in...' : 'Loading...'}
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
          {rememberMe ? 'Restoring your session' : 'Checking for updates'}
        </Text>
      </View>
    );
  }

  if (isAuthenticated && !updateRequired) {
    return <Redirect href="/(tabs)/attendance" />;
  }

  return <Redirect href="/(auth)/login" />;
}
