import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bug, Github, Code2, Share2, Mail, ExternalLink, ArrowRight } from 'lucide-react-native';

export default function AboutScreen() {
  const handleReportBug = () => {
    Linking.openURL('mailto:2023f-bcs-023@ssuet.edu.pk?subject=Bug Report - MarkD. SSUET');
  };

  const handleOpenGithub = () => {
    Linking.openURL('https://github.com/ashhadahmd/MarkD./issues');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out MarkD. - The premium SSUET Attendance Tracker! Engineered for the student community.',
      });
    } catch (error: any) {}
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-gray-900 mt-1">About MarkD.</Text>
        </View>

        <View className="mx-6 bg-[#147A5C] rounded-3xl p-8 items-center shadow-lg shadow-[#147A5C]/30 mb-6">
          <View className="bg-white/20 p-4 rounded-full mb-4">
            <Code2 size={32} color="#FFFFFF" />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">MarkD.</Text>
          <Text className="text-white/80 text-center font-medium">
            The professional standard for SSUET student portal interaction. Engineered for performance and clarity.
          </Text>
        </View>

        <View className="px-6">
          <TouchableOpacity 
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-row items-center justify-between mb-6"
            onPress={handleShare}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
                <Share2 size={20} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800">Refer MarkD.</Text>
                <Text className="text-gray-500 text-sm">Empower colleagues with better tracking</Text>
              </View>
            </View>
            <ArrowRight size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <Github size={20} color="#3B82F6" />
              </View>
              <Text className="text-lg font-bold text-gray-800">Software Development</Text>
            </View>
            <Text className="text-gray-900 font-bold mb-1">ashhadahmd</Text>
            <Text className="text-gray-500 text-sm mb-4">Roll No: 2023F-BCS-023</Text>
            <Text className="text-gray-600 leading-relaxed">
              This application was developed by a fellow student at SSUET because the official portal experience is suboptimal. MarkD. provides a high-performance alternative designed with modern architectural standards.
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-3">
                <Bug size={20} color="#EF4444" />
              </View>
              <Text className="text-lg font-bold text-gray-800">Support & Engineering</Text>
            </View>
            <Text className="text-gray-600 mb-6 leading-relaxed">
              Technical issues or feature requests can be submitted via prioritized email support or through our official repository's issue tracking system.
            </Text>
            
            <View>
              <TouchableOpacity 
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex-row items-center justify-between mb-3"
                onPress={handleReportBug}
              >
                <View className="flex-row items-center flex-1">
                  <Mail size={18} color="#4B5563" style={{ marginRight: 12 }} />
                  <Text className="text-gray-700 font-bold">Priority Support</Text>
                </View>
                <ExternalLink size={16} color="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex-row items-center justify-between"
                onPress={handleOpenGithub}
              >
                <View className="flex-row items-center flex-1">
                  <Github size={18} color="#4B5563" style={{ marginRight: 12 }} />
                  <View className="flex-1">
                    <Text className="text-gray-700 font-bold">GitHub Repository</Text>
                    <Text className="text-gray-500 text-[10px] mt-0.5" numberOfLines={1}>Audit source or track bugs</Text>
                  </View>
                </View>
                <ExternalLink size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center py-6">
            <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest">Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
