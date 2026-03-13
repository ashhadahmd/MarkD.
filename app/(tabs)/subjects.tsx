import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { SubjectCard } from '../../components/SubjectCard';
import { SyncingPill } from '../../components/SyncingPill';

export default function SubjectsScreen() {
  const { data, subjectDetails } = useAttendanceStore();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900 mt-1">All Subjects</Text>
        <SyncingPill />
      </View>
      
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {data?.subjects ? (
            <View className="flex-row flex-wrap justify-between">
              {data.subjects.map((subject: any) => {
                const detail = subjectDetails[subject.id];
                const subjectToRender = detail ? detail.subject : subject;
                return (
                  <View key={subject.id} className="w-full mb-4">
                    <SubjectCard subject={subjectToRender} variant="detailed" />
                  </View>
                );
              })}
            </View>
        ) : (
          <View className="items-center py-10">
            <Text className="text-gray-500">No subjects loaded yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
