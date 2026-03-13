import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Home, Clock, BookOpen, User, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const TabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View 
      className="absolute left-6 right-6 bg-white rounded-full flex-row items-center justify-between px-6 py-4 shadow-xl border border-gray-100"
      style={{ bottom: (insets.bottom > 0 ? insets.bottom : 24) }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        if (options.href === null || route.name === 'subject/[id]') {
          return null;
        }
        
        let icon;
        const color = isFocused ? '#FFFFFF' : '#9CA3AF';
        const size = 24;

        if (route.name === 'attendance') {
          icon = <Clock size={size} color={color} />;
        } else if (route.name === 'subjects' || route.name === 'subject/[id]') {
          icon = <BookOpen size={size} color={color} />;
        } else if (route.name === 'profile') {
          icon = <User size={size} color={color} />;
        } else if (route.name === 'about') {
          icon = <Info size={size} color={color} />;
        } else {
          icon = <Home size={size} color={color} />;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isFocused ? 'bg-[#147A5C]' : 'bg-transparent'
            }`}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
