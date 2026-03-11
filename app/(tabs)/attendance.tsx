import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { portalService } from '../../services/portalService';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CircularProgress } from '../../components/CircularProgress';
import { SubjectCard } from '../../components/SubjectCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { Bell, User } from 'lucide-react-native';

export default function AttendanceScreen() {
  const { data, loading, error, setAttendanceData, setLoading, setError } = useAttendanceStore();
  const { profile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const attendance = await portalService.getAttendance();
      setAttendanceData(attendance);
      setError(null);
    } catch (err) {
      setError('Failed to fetch attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const getOverallStats = () => {
    if (!data || data.subjects.length === 0) return { total: 0, present: 0, absent: 0 };
    return data.subjects.reduce((acc: { total: number, present: number, absent: number }, sub: any) => ({
      total: acc.total + sub.totalClasses,
      present: acc.present + sub.present,
      absent: acc.absent + sub.absent
    }), { total: 0, present: 0, absent: 0 });
  };

  const stats = getOverallStats();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#147A5C" />}
      >
        <View className="px-6 pt-6 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900 mt-1">
              {profile?.name || 'Loading...'}
            </Text>
            <Text className="text-gray-500 text-sm font-medium">{profile?.regNo || 'Welcome'}</Text>
          </View>
          <View className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm border border-gray-100 overflow-hidden">
            {profile?.profilePicture ? (
              <Image 
                source={{ uri: profile.profilePicture }} 
                className="w-full h-full"
                resizeMode="cover"
                style={{ transform: [{ scale: 1.4 }, { translateY: 2 }] }}
              />
            ) : (
              <User size={20} color="#4B5563" />
            )}
          </View>
        </View>

        {loading && !refreshing && !data ? (
          <View className="px-6 py-12 items-center">
             <ActivityIndicator size="large" color="#147A5C" />
             <Text className="text-gray-500 mt-4">Syncing from portal...</Text>
          </View>
        ) : error && !data ? (
          <View className="px-6 py-8 items-center">
             <Text className="text-red-500 mb-4">{error}</Text>
          </View>
        ) : data ? (
          <>
            <View className="items-center my-8">
              <CircularProgress percentage={data.overallPercentage} radius={90} strokeWidth={15} />
              <Text className="text-gray-500 font-medium mt-4">Overall Attendance</Text>
            </View>

            <View className="flex-row justify-between px-6 mb-4">
              <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100 items-center">
                <Text className="text-gray-500 text-xs font-medium mb-1 text-center">Total Classes</Text>
                <Text className="text-xl font-bold text-gray-800">{stats.total}</Text>
              </View>
              <View className="bg-white rounded-2xl p-4 flex-1 mx-1 shadow-sm border border-gray-100 items-center">
                <Text className="text-gray-500 text-xs font-medium mb-1 text-center">Present</Text>
                <Text className="text-xl font-bold text-green-600">{stats.present}</Text>
              </View>
              <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100 items-center">
                <Text className="text-gray-500 text-xs font-medium mb-1 text-center">Absent</Text>
                <Text className="text-xl font-bold text-red-600">{stats.absent}</Text>
              </View>
            </View>

            <View className="flex-row justify-between px-6 mb-8">
              <View 
                className="bg-white rounded-3xl p-4 flex-1 mr-3 shadow-sm border border-gray-100 items-center justify-center h-40"
              >
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mb-3">
                  <Text className="text-blue-600 font-bold text-xs">GPA</Text>
                </View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">CGPA</Text>
                <Text className={`text-2xl font-bold ${
                  parseFloat(profile?.cgpa || '0') >= 3.0 ? 'text-green-600' : 
                  parseFloat(profile?.cgpa || '0') >= 2.5 ? 'text-yellow-500' : 'text-red-600'
                }`}>
                  {profile?.cgpa || '0.00'}
                </Text>
              </View>
              
              <View 
                className="bg-white rounded-3xl p-4 flex-1 shadow-sm border border-gray-100 items-center justify-center h-40"
              >
                <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center mb-3">
                  <Text className="text-orange-600 font-bold text-xs">PKR</Text>
                </View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 text-center">Balance</Text>
                <Text className="text-xl font-bold text-gray-800 text-center">
                  Rs. {parseFloat(profile?.balance || '0').toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="px-6 mb-4 mt-2">
              <Text className="text-lg font-bold text-gray-900">Your Subjects</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
            >
              {data.subjects.map((subject: any) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </ScrollView>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
