import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { wp } from '@/helpers/dimensionHelpers';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface ZzzParticleProps {
  delay: number;
  fontSize: number;
}

const ZZZ_SWAY = scale(14);
const ZZZ_RISE = verticalScale(90);

function ZzzParticle({ delay, fontSize }: ZzzParticleProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withDelay(
        delay,
        withTiming(1, { duration: 3000 })
      ),
      -1,
      false
    );
  }, [delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = p < 0.2 ? p / 0.2 : (1 - p);
    const translateY = -p * ZZZ_RISE;
    const translateX = Math.sin(p * Math.PI * 3.5) * ZZZ_SWAY;
    const scaleVal = 0.6 + p * 0.7;
    
    return {
      opacity,
      transform: [
        { translateY },
        { translateX },
        { scale: scaleVal },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.zzzText, animatedStyle, { fontSize }]}>
      Z
    </Animated.Text>
  );
}

export default function ZzzEffect() {
  return (
    <View style={styles.zzzContainer}>
      <ZzzParticle delay={0} fontSize={scale(18)} />
      <ZzzParticle delay={1000} fontSize={scale(24)} />
      <ZzzParticle delay={2000} fontSize={scale(30)} />
    </View>
  );
}

const styles = StyleSheet.create({
  zzzContainer: {
    position: 'absolute',
    right: wp(14),
    bottom: verticalScale(150),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  zzzText: {
    position: 'absolute',
    fontFamily: theme.fontFamily.heading,
    color: theme.colors.sunshine,
    textShadowColor: theme.colors.text,
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 0,
  },
});
