import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAttendanceStore } from '../store/useAttendanceStore';
import Animated, { useAnimatedStyle, withTiming, interpolateColor, useDerivedValue } from 'react-native-reanimated';

export function SyncingPill() {
  const { syncing, syncProgress } = useAttendanceStore();
  const [sessionStage, setSessionStage] = useState(0);
  const [subjectSlow, setSubjectSlow] = useState(false);
  
  const lastSubjectRef = useRef<number | null>(null);
  const syncStartedRef = useRef(false);

  useEffect(() => {
    if (syncing && !syncStartedRef.current) {
      syncStartedRef.current = true;
      const t = setTimeout(() => setSessionStage(1), 2000);
      return () => clearTimeout(t);
    } else if (!syncing) {
      syncStartedRef.current = false;
      setSessionStage(0);
    }
  }, [syncing]);

  useEffect(() => {
    if (syncing && syncProgress?.current !== lastSubjectRef.current) {
      setSubjectSlow(false);
      lastSubjectRef.current = syncProgress?.current ?? null;
      
      const timer = setTimeout(() => setSubjectSlow(true), 4000);
      return () => clearTimeout(timer);
    }
  }, [syncing, syncProgress?.current]);

  const colorProgress = useDerivedValue(() => {
    return withTiming(subjectSlow ? 1 : 0, { duration: 500 });
  });

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#147A5C', '#EAB308']
    );
    return { backgroundColor };
  });

  if (!syncing) return null;

  const getDisplayText = () => {
    return 'Syncing';
  };

  const displayText = getDisplayText();

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 6,
          maxWidth: 200, // Slightly wider to fit "Syncing attendance..."
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 3,
        },
        animatedStyle
      ]}
    >
      <ActivityIndicator size="small" color={subjectSlow ? '#1e293b' : '#ffffff'} style={{ transform: [{ scale: 0.7 }] }} />
      <Text
        numberOfLines={1}
        style={{ 
          color: subjectSlow ? '#1e293b' : '#ffffff', 
          fontSize: 11, 
          fontWeight: '700', 
          marginLeft: 4, 
          flexShrink: 1, 
        }}
      >
        {displayText}
      </Text>
    </Animated.View>
  );
}
