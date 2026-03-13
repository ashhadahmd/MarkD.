import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { portalService, SubjectDetail } from '../../services/portalService';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { AttendanceRow } from '../../components/AttendanceRow';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';

export default function SubjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const { data: attendance, subjectDetails, setSubjectDetail, syncing } = useAttendanceStore();
  const [localLoading, setLocalLoading] = useState(false);

  const detail: SubjectDetail | undefined = typeof id === 'string' ? subjectDetails[id] : undefined;
  const subject = attendance?.subjects.find((s: any) => s.id === id);

  useEffect(() => {
    if (subject && !detail && !syncing) {
      fetchDetailFallback();
    }
  }, [id, subject?.id, detail, syncing]);

  const fetchDetailFallback = async () => {
    if (!subject) return;
    setLocalLoading(true);
    try {
      const data = await portalService.getSubjectDetail(subject);
      setSubjectDetail(subject.id, data);
    } catch (e) {
      
    } finally {
      setLocalLoading(false);
    }
  };

  const progress = useSharedValue(0);

  useEffect(() => {
    if (detail) {
      progress.value = withTiming(detail.subject.percentage, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [detail]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  const getColor = (percent: number, total: number) => {
    if (total === 0) return 'bg-gray-300';
    if (percent > 75) return 'bg-green-500';
    if (percent > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-4 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-3 bg-gray-50 rounded-full">
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1 truncate" numberOfLines={1}>
          {detail?.subject.name || 'Loading...'}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }} 
        showsVerticalScrollIndicator={false}
      >
        {(localLoading || (syncing && !detail)) && !detail ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#147A5C" />
            <Text className="text-gray-500 mt-4 text-sm">Syncing details...</Text>
          </View>
        ) : detail ? (
          <>
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <Text className="text-lg font-bold text-gray-800 mb-1">{detail.subject.teacher}</Text>
              <Text className="text-sm text-gray-500 mb-6">3 Credit Hours</Text>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600 font-medium h-5">Attendance Percentage</Text>
                <Text className="text-gray-900 font-bold h-5">{detail.subject.percentage}%</Text>
              </View>

              {detail.subject.totalClasses > 0 && detail.subject.percentage <= 70 && (
                <Text className="text-red-500 text-[10px] font-bold uppercase mb-2 text-right">Short of Attendance</Text>
              )}
              
              <View className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <Animated.View 
                  className={`h-full rounded-full ${getColor(detail.subject.percentage, detail.subject.totalClasses)}`} 
                  style={progressStyle} 
                />
              </View>

              <View className="flex-row justify-between mt-6 pt-4 border-t border-gray-100">
                 <View className="items-center">
                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Total</Text>
                    <Text className="font-bold text-xl text-gray-800">{detail.subject.totalClasses}</Text>
                 </View>
                 <View className="items-center">
                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Present</Text>
                    <Text className="font-bold text-xl text-green-600">{detail.subject.present}</Text>
                 </View>
                 <View className="items-center">
                    <Text className="text-gray-500 text-xs uppercase tracking-wider mb-1">Absent</Text>
                    <Text className="font-bold text-xl text-red-600">{detail.subject.absent}</Text>
                 </View>
              </View>
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-4 ml-1">Lecture Log</Text>
            
            {detail.lectures.length > 0 ? (
              detail.lectures.map((record, index) => (
                <AttendanceRow key={index} record={record} />
              ))
            ) : (
              <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center justify-center">
                <Text className="text-gray-500">No lecture records found</Text>
              </View>
            )}
          </>
        ) : (
           <View className="items-center py-10">
             <Text className="text-gray-500">Subject data not available.</Text>
           </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
