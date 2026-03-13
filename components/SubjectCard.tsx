import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Subject } from '../services/portalService';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { CircularProgress } from './CircularProgress';
import { Link } from 'expo-router';

interface SubjectCardProps {
  subject: Subject;
  variant?: 'compact' | 'detailed';
}

export const SubjectCard = ({ subject, variant = 'compact' }: SubjectCardProps) => {
  const getGraphColor = (percent: number, total: number) => {
    if (total === 0) return 'bg-gray-300';
    if (percent > 75) return 'bg-green-500';
    if (percent > 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (percent: number, total: number) => {
    if (total === 0) return 'text-gray-400';
    if (percent > 75) return 'text-green-600';
    if (percent > 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHexColor = (percent: number, total: number) => {
    if (total === 0) return '#D1D5DB';
    if (percent > 75) return '#10B981';
    if (percent > 70) return '#F59E0B';
    return '#EF4444';
  };

  const progress = useSharedValue(0);

  useEffect(() => {
    if (variant === 'detailed') {
      progress.value = withTiming(subject.percentage, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [subject.percentage, variant]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  if (variant === 'compact') {
    return (
      <Link href={{ pathname: '/subject/[id]', params: { id: subject.id } }} asChild>
        <TouchableOpacity className="bg-white p-4 rounded-xl shadow-sm mr-4 w-64 border border-gray-100 flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="font-bold text-gray-800 text-lg mb-1 leading-tight" numberOfLines={2}>
              {subject.name}
            </Text>
            <Text className="text-gray-500 text-sm mb-2" numberOfLines={1}>
              {subject.id}
            </Text>
            
            <View className="flex-row items-center mt-2">
              <View className="bg-gray-100 px-2 py-1 rounded">
                <Text className="text-xs text-gray-600 font-medium">Total: {subject.totalClasses}</Text>
              </View>
            </View>
          </View>

          <View>
            <CircularProgress 
              percentage={subject.percentage} 
              radius={28} 
              strokeWidth={5} 
              color={getHexColor(subject.percentage, subject.totalClasses)} 
            />
          </View>
        </TouchableOpacity>
      </Link>
    );
  }

  return (
    <Link href={{ pathname: '/subject/[id]', params: { id: subject.id } }} asChild>
      <TouchableOpacity className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 justify-between w-full">
        
        <View className="mb-4 flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="font-bold text-gray-800 text-lg mb-1 leading-tight" numberOfLines={2}>
              {subject.name}
            </Text>
            <Text className="text-gray-500 text-sm" numberOfLines={1}>
              {subject.teacher}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wider">Attendance</Text>
            <Text className={`font-bold text-sm ${getTextColor(subject.percentage, subject.totalClasses)}`}>{subject.percentage}%</Text>
          </View>

          {subject.totalClasses > 0 && subject.percentage <= 70 && (
            <Text className="text-red-500 text-[10px] font-bold uppercase mb-2 text-right">Short of Attendance</Text>
          )}
          
          <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <Animated.View 
              className={`h-full rounded-full ${getGraphColor(subject.percentage, subject.totalClasses)}`} 
              style={progressStyle} 
            />
          </View>
        </View>

        <View className="flex-row justify-between pt-3 border-t border-gray-50">
           <View className="items-center">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Total</Text>
              <Text className="font-semibold text-gray-700">{subject.totalClasses}</Text>
           </View>
           <View className="items-center">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Present</Text>
              <Text className="font-semibold text-green-600">{subject.present}</Text>
           </View>
           <View className="items-center">
              <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Absent</Text>
              <Text className="font-semibold text-red-500">{subject.absent}</Text>
           </View>
        </View>

      </TouchableOpacity>
    </Link>
  );
};
