import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import { useSharedValue, withSpring, useDerivedValue } from 'react-native-reanimated';
import { theme } from '@/styles/theme';
import { scale, verticalScale } from 'react-native-size-matters';

interface StatProps {
  progress: number;
  color: string;
  icon: React.ReactNode;
}

const MiniProgressBar = ({ progress, color, icon }: StatProps) => {
  const width = scale(85);
  const height = verticalScale(12);
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
    <View style={styles.statItem}>
      <View style={styles.iconRow}>
        {icon}
        <Text style={styles.statValue}>{Math.round(progress)}</Text>
      </View>
      <Canvas style={{ width, height }}>
        <RoundedRect x={0} y={0} width={width} height={height} r={height / 2} color="rgba(0,0,0,0.15)" />
        <RoundedRect x={0} y={0} width={barWidth} height={height} r={height / 2} color={color} />
        <RoundedRect x={0} y={0} width={width} height={height} r={height / 2} color={theme.colors.text} style="stroke" strokeWidth={2} />
      </Canvas>
    </View>
  );
};

interface CompactStatsBarProps {
  hunger: number;
  energy: number;
  happiness: number;
  hungerIcon: React.ReactNode;
  energyIcon: React.ReactNode;
  happinessIcon: React.ReactNode;
}

export default function CompactStatsBar({
  hunger,
  energy,
  happiness,
  hungerIcon,
  energyIcon,
  happinessIcon,
}: CompactStatsBarProps) {
  return (
    <View style={styles.container}>
      <MiniProgressBar progress={hunger} color={theme.colors.accent} icon={hungerIcon} />
      <MiniProgressBar progress={energy} color={theme.colors.sunshine} icon={energyIcon} />
      <MiniProgressBar progress={happiness} color={theme.colors.sky} icon={happinessIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(16),
    borderRadius: scale(20),
    borderWidth: 3,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  statValue: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.small,
    color: theme.colors.text,
    marginLeft: scale(4),
  },
});
