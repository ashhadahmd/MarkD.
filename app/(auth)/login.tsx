import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Redirect } from 'expo-router';
import { portalService } from '../../services/portalService';
import { sessionService } from '../../services/sessionService';
import { useAuthStore } from '../../store/useAuthStore';
import { Eye, EyeOff, User, Lock, ArrowRight, ShieldCheck, DownloadCloud, CheckSquare, Square } from 'lucide-react-native';

const AuthInput = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  icon: Icon, 
  secureTextEntry,
  rightElement,
  editable,
  textContentType,
  autoComplete,
}: any) => (
  <View className="mb-5">
    <Text className="text-gray-900 font-bold mb-2 ml-1">{label}</Text>
    <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-sm">
      <Icon size={20} color="#9CA3AF" style={{ marginRight: 12 }} />
      <TextInput
        className="flex-1 text-gray-900 font-semibold text-base"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        editable={editable}
        textContentType={textContentType}
        autoComplete={autoComplete}
      />
      {rightElement}
    </View>
  </View>
));

export default function LoginScreen() {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateRequired, setUpdateRequired] = useState(false);
  const [latestVersionStr, setLatestVersionStr] = useState('');
  
  const { loginState, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Lightweight check for update banner only — no blocking
    portalService.checkLatestVersion()
      .then(({ isLatest, latestVersion }) => {
        if (!isLatest) {
          setUpdateRequired(true);
          setLatestVersionStr(latestVersion);
        }
      })
      .catch(() => {});
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const rightElement = useMemo(() => (
    <TouchableOpacity 
      onPress={togglePassword} 
      className="p-2"
      disabled={loading}
    >
      {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
    </TouchableOpacity>
  ), [showPassword, loading, togglePassword]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/attendance" />;
  }

  const handleUpdate = () => {
    Linking.openURL('https://github.com/ashhadahmd/MarkD./releases/latest');
  };

  const handleLogin = async () => {
    if (!regNo || !password) {
      setError('Please enter your credentials');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const success = await portalService.login(regNo, password);
      
      if (success) {
        const profile = await portalService.getProfile();
        await sessionService.setRememberMe(rememberMe);
        loginState(regNo, password, profile, rememberMe);
        router.replace('/(tabs)/attendance');
      } else {
        setError('Incorrect registration number or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-12">
            <View className="flex-row items-center mb-1">
              <Text className="text-5xl font-extrabold text-[#147A5C]">MarkD</Text>
              <View className="bg-[#147A5C] h-2 w-2 rounded-full mt-4 ml-1" />
            </View>
            <Text className="text-gray-400 text-lg font-medium tracking-tight">SSUET Attendance Portal</Text>
          </View>

          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Sign In</Text>
            <Text className="text-gray-500">Access your academic logs and profile</Text>
          </View>

          {updateRequired ? (
            <View className="bg-orange-50 p-6 rounded-3xl border border-orange-100 items-center mb-8">
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-4">
                <DownloadCloud size={32} color="#EA580C" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2 text-center">Update Required</Text>
              <Text className="text-gray-600 text-center mb-6 leading-relaxed">
                You are using an outdated version of MarkD. Please update to version <Text className="font-bold">v{latestVersionStr}</Text> to continue using the app securely.
              </Text>
              <TouchableOpacity
                className="w-full bg-[#EA580C] rounded-2xl h-14 flex-row justify-center items-center shadow-lg shadow-orange-500/30"
                onPress={handleUpdate}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg mr-2">Download Update</Text>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {error ? (
                <View className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 flex-row items-center">
                  <ShieldCheck size={20} color="#EF4444" className="mr-3" />
                  <Text className="text-red-600 font-medium flex-1">{error}</Text>
                </View>
              ) : null}

              <View className="space-y-5">
                <AuthInput
                  label="Registration No."
                  placeholder="e.g. 2030S-BCS-000"
                  icon={User}
                  value={regNo}
                  onChangeText={setRegNo}
                  editable={!loading}
                  textContentType="username"
                  autoComplete="username"
                />

                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  icon={Lock}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  rightElement={rightElement}
                  textContentType="none"
                  autoComplete="password"
                  contextMenuHidden={true}
                  isPassword={true}
                />

                {/* Remember Me */}
                <TouchableOpacity
                  onPress={() => setRememberMe(v => !v)}
                  className="flex-row items-center mb-6"
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  {rememberMe
                    ? <CheckSquare size={20} color="#147A5C" />
                    : <Square size={20} color="#9CA3AF" />}
                  <Text className="ml-2 text-gray-600 font-medium text-sm">Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`w-full bg-[#147A5C] rounded-2xl h-16 flex-row justify-center items-center shadow-lg shadow-[#147A5C]/30 ${loading ? 'opacity-90' : ''}`}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <View className="flex-row items-center">
                      <Text className="text-white text-center font-bold text-lg mr-2">Sign In</Text>
                      <ArrowRight size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}

          <View className="flex-1 justify-end items-center py-20">
            <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-[3px] text-center">Free for Students • By a Student</Text>
            <View className="flex-row items-center mt-3">
              <View className="h-[0.5px] w-8 bg-gray-100" />
              <Text className="text-gray-400 text-[10px] mx-3 font-semibold uppercase tracking-[2px]">MarkD. x SSUET</Text>
              <View className="h-[0.5px] w-8 bg-gray-100" />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
