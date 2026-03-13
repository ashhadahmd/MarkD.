import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { portalService } from '../../services/portalService';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { CircularProgress } from '../../components/CircularProgress';
import { SubjectCard } from '../../components/SubjectCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { AnimatedSyncBanner } from '../../components/AnimatedSyncBanner';
import { Bell, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function AttendanceScreen() {
  const { data, loading, syncing, syncMessage, syncProgress, error, setAttendanceData, setLoading, setSyncing, setSyncMessage, setError } = useAttendanceStore();
  const { profile } = useAuthStore();

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    const hasCache = !!useAttendanceStore.getState().data;
    if (!hasCache) setLoading(true);
    setSyncing(true);
    setSyncMessage('Fetching attendance overview...');

    try {
      const attendance = await portalService.getAttendance(signal);
      setAttendanceData(attendance);
      setError(null);

      let i = 0;
      for (const subject of attendance.subjects) {
        if (signal.aborted) break;
        i++;
        setSyncMessage(subject.name);
        useAttendanceStore.getState().setSyncProgress({ current: i, total: attendance.subjects.length });

        try {
          const detail = await portalService.getSubjectDetail(subject);
          useAttendanceStore.getState().setSubjectDetail(subject.id, detail);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          await new Promise(res => setTimeout(res, 500));
        } catch (detailError: any) {
          if (detailError?.name === 'AbortError' || signal.aborted) break;
          // Failed silently in production
        }
      }

    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.name === 'CanceledError' || signal.aborted) {
        return;
      }
      
      setError('Failed to fetch attendance data');
    } finally {
      useAttendanceStore.getState().setSyncProgress(null);
      setSyncMessage('');
      setLoading(false);
      setSyncing(false);
    }
  }, []);


  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const onRefresh = () => {
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
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={onRefresh}
            enabled={!syncing}
            tintColor="transparent"
          />
        }
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


        {/* Syncing banner */}
        {syncing && data && (
          <AnimatedSyncBanner 
            progress={syncProgress} 
          />
        )}


        {loading && !syncing && !data ? (
          <View className="px-6 py-20 items-center">
            <ActivityIndicator size="large" color="#147A5C" />
            <Text className="text-gray-700 font-semibold mt-4 text-base">Syncing from portal</Text>
            <Text className="text-gray-400 mt-1 text-sm">Fetching your attendance data...</Text>
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
