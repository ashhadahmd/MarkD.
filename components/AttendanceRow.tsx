import React from 'react';
import { View, Text } from 'react-native';
import { LectureRecord } from '../services/portalService';
import { Check, X, Clock } from 'lucide-react-native';

interface AttendanceRowProps {
  record: LectureRecord;
}

export const AttendanceRow = ({ record }: AttendanceRowProps) => {
  const isPresent = record.status === 'P';
  const isAbsent = record.status === 'A';
  
  return (
    <View className="flex-row justify-between items-center bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isPresent ? 'bg-green-100' : isAbsent ? 'bg-red-100' : 'bg-yellow-100'}`}>
          {isPresent ? (
            <Check size={20} color="#10B981" />
          ) : isAbsent ? (
            <X size={20} color="#EF4444" />
          ) : (
            <Clock size={20} color="#F59E0B" />
          )}
        </View>
        <Text className="text-gray-800 font-medium text-base">
          {new Date(record.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
      </View>
      
      <View>
        <Text className={`font-bold ${isPresent ? 'text-green-600' : isAbsent ? 'text-red-600' : 'text-yellow-600'}`}>
          {isPresent ? 'Present' : isAbsent ? 'Absent' : 'Late'}
        </Text>
      </View>
    </View>
  );
};
