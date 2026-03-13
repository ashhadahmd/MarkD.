import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions, MaterialTopTabNavigationEventMap } from '@react-navigation/material-top-tabs';
import { withLayoutContext, useSegments } from 'expo-router';
import { TabNavigationState, ParamListBase } from '@react-navigation/native';
import { TabBar } from '../../components/TabBar';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <MaterialTopTabs
      tabBar={(props) => <TabBar {...props} />}
      tabBarPosition="bottom"
      keyboardDismissMode="on-drag"
      screenOptions={{ swipeEnabled: true }}
    >
      <MaterialTopTabs.Screen name="attendance" options={{ title: 'Dashboard' }} />
      <MaterialTopTabs.Screen name="subjects" options={{ title: 'Subjects' }} />
      <MaterialTopTabs.Screen name="profile" options={{ title: 'Profile' }} />
      <MaterialTopTabs.Screen name="about" options={{ title: 'About' }} />
    </MaterialTopTabs>
  );
}
