import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  Layout, 
  SlideInUp, 
  SlideOutUp,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming
} from 'react-native-reanimated';

interface SyncProgress {
  current: number;
  total: number;
}

interface AnimatedSyncBannerProps {
  progress: SyncProgress | null;
}

export function AnimatedSyncBanner({ progress }: AnimatedSyncBannerProps) {
  const [stage, setStage] = useState(0); 
  const lastSubjectRef = useRef<number | null>(null);

  useEffect(() => {
    if (progress?.current !== lastSubjectRef.current) {
      setStage(0); 
      lastSubjectRef.current = progress?.current ?? null;
      
      const t1 = setTimeout(() => setStage(1), 2000);
      const t2 = setTimeout(() => setStage(2), 4000); 

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [progress?.current]);

  const getDisplayText = () => {
    if (stage === 0) return 'Syncing attendance for all subjects...';
    if (stage === 1) return `Syncing ${progress?.current || 0} of ${progress?.total || 0}`;
    return 'SSUET Portal is slow, syncing may take time...';
  };

  const isSlow = stage === 2;
  
  const colorProgress = useDerivedValue(() => {
    return withTiming(isSlow ? 1 : 0, { duration: 500 });
  });

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1],
      ['#147A5C', '#EAB308']
    );
    return { backgroundColor };
  });

  const displayText = getDisplayText();

  return (
    <Animated.View 
      entering={SlideInUp.duration(400)}
      exiting={SlideOutUp.duration(300)}
      layout={Layout.springify().damping(20)}
      style={animatedStyle}
      className="mx-6 mb-3 mt-1 rounded-2xl px-5 py-3.5 flex-row items-center shadow-lg elevation-4"
    >
      <ActivityIndicator size="small" color={isSlow ? '#1e293b' : '#ffffff'} />
      <View className="ml-3 flex-1 flex-row items-center">
        <Animated.View 
          key={displayText} 
          entering={FadeIn.duration(300)} 
          exiting={FadeOut.duration(200)}
          className="flex-1"
        >
          <Text 
            className={`font-bold text-sm ${isSlow ? 'text-slate-800' : 'text-white'}`}
            numberOfLines={1}
          >
            {displayText}
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}
