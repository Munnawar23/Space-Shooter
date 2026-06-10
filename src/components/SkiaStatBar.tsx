import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, RoundedRect, LinearGradient, vec } from '@shopify/react-native-skia';
import { useSharedValue, withSpring, useDerivedValue } from 'react-native-reanimated';
import { theme } from '@/styles/theme';
import { scale, verticalScale } from 'react-native-size-matters';

interface SkiaStatBarProps {
  label: string;
  progress: number; // 0 to 100
  color: string;
  icon: React.ReactNode;
}

export default function SkiaStatBar({ label, progress, color, icon }: SkiaStatBarProps) {
  const [width, setWidth] = useState(0);
  const animatedProgress = useSharedValue(progress / 100);

  useEffect(() => {
    animatedProgress.value = withSpring(Math.max(0, Math.min(1, progress / 100)), {
      damping: 15,
      stiffness: 120,
    });
  }, [progress, animatedProgress]);

  const barWidth = useDerivedValue(() => {
    return animatedProgress.value * width;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconRow}>
          {icon}
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{Math.round(progress)}</Text>
      </View>

      <View 
        style={styles.canvasContainer} 
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {width > 0 && (
          <Canvas style={{ flex: 1 }}>
            {/* Background Track */}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={verticalScale(18)}
              r={verticalScale(9)}
              color={theme.colors.statBarBackground || theme.colors.backgroundAlt}
            />
            {/* Foreground Progress */}
            <RoundedRect
              x={0}
              y={0}
              width={barWidth}
              height={verticalScale(18)}
              r={verticalScale(9)}
              color={color}
            />
            {/* Outline */}
            <RoundedRect
              x={0}
              y={0}
              width={width}
              height={verticalScale(18)}
              r={verticalScale(9)}
              color={theme.colors.text}
              style="stroke"
              strokeWidth={2.5}
            />
          </Canvas>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(14),
    backgroundColor: theme.colors.card,
    padding: scale(12),
    borderRadius: scale(16),
    borderWidth: 3,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.statLabel,
    color: theme.colors.text,
    marginLeft: scale(8),
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
  },
  canvasContainer: {
    height: verticalScale(18),
    width: '100%',
  },
});
