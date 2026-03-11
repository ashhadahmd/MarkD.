import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { portalService } from '../../services/portalService';
import { useAuthStore } from '../../store/useAuthStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { LogOut, User, BookOpen, GraduationCap } from 'lucide-react-native';

export default function ProfileScreen() {
  const { profile, logoutState } = useAuthStore();
  const { clear } = useAttendanceStore();

  const handleLogout = async () => {
    await portalService.logout();
    logoutState();
    clear();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mt-1">Profile</Text>
        </View>

        <View className="items-center mb-8 px-6 pt-4">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
            {profile?.profilePicture ? (
              <Image 
                source={{ uri: profile.profilePicture }} 
                className="w-full h-full"
                resizeMode="cover"
                style={{ transform: [{ scale: 1.4 }, { translateY: 8 }] }}
              />
            ) : (
              <User size={40} color="#147A5C" />
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-900 text-center">{profile?.name || 'Student Name'}</Text>
          <Text className="text-gray-500 font-medium mt-1">{profile?.regNo || 'Registration No.'}</Text>
          
          <View className={`mt-3 px-3 py-1 rounded-full ${profile?.status === 'Active' ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs font-bold ${profile?.status === 'Active' ? 'text-green-700' : 'text-gray-600'}`}>
              {profile?.status || 'Active'}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 mx-6">
          <View className="space-y-6">
            <View className="flex-row items-center border-b border-gray-50 pb-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-4">
                 <GraduationCap size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                 <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Program Structure</Text>
                 <Text className="text-gray-800 font-semibold text-base" numberOfLines={2}>{profile?.program || 'Not Available'}</Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mr-4">
                 <BookOpen size={20} color="#F97316" />
              </View>
              <View className="flex-1">
                 <Text className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Current Session</Text>
                 <Text className="text-gray-800 font-semibold text-base">{profile?.session || 'Not Available'}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-white border border-red-100 rounded-2xl p-4 flex-row items-center justify-center shadow-sm mx-6"
          onPress={handleLogout}
        >
          <LogOut size={20} color="#EF4444" style={{ marginRight: 12 }} />
          <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}
