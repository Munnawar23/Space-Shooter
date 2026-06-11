import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';

interface FloatingItemProps {
  delay: number;
  emoji: string;
  startX: number;
  startY: number;
}

function FloatingCelebrationItem({ delay, emoji, startX, startY }: FloatingItemProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scaleVal = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    scaleVal.value = withDelay(delay, withSpring(1.5, { damping: 10 }));
    
    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(scale(30), { duration: 600 }),
          withTiming(scale(-30), { duration: 600 })
        ),
        -1,
        true
      )
    );

    translateY.value = withDelay(
      delay,
      withTiming(-hp(50), { duration: 3000 }, () => {
        opacity.value = withTiming(0, { duration: 300 });
      })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: startX,
      top: startY,
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scaleVal.value },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: scale(36) }}>{emoji}</Text>
    </Animated.View>
  );
}

function CelebrationBadge() {
  const scaleVal = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    scaleVal.value = withSpring(1, { damping: 10, stiffness: 100 });
    rotation.value = withSequence(
      withTiming(-6, { duration: 150 }),
      withRepeat(
        withSequence(
          withTiming(6, { duration: 250 }),
          withTiming(-6, { duration: 250 })
        ),
        5,
        true
      ),
      withTiming(0, { duration: 150 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleVal.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.badgeCard, animatedStyle]}>
      <View style={styles.badgeHeader}>
        <Text style={styles.badgeEmoji}>🎉</Text>
        <Text style={styles.badgeTitle}>SPLISH SPLASH!</Text>
        <Text style={styles.badgeEmoji}>💦</Text>
      </View>
      <Text style={styles.badgeSubtitle}>Your pet is super clean and happy!</Text>
    </Animated.View>
  );
}

export default function CelebrationOverlay() {
  const CELEBRATION_ITEMS = [
    { emoji: '💦', startX: wp(15), startY: hp(50), delay: 0 },
    { emoji: '✨', startX: wp(30), startY: hp(55), delay: 200 },
    { emoji: '🧼', startX: wp(45), startY: hp(48), delay: 400 },
    { emoji: '💦', startX: wp(60), startY: hp(52), delay: 150 },
    { emoji: '✨', startX: wp(75), startY: hp(45), delay: 500 },
    { emoji: '🧼', startX: wp(20), startY: hp(40), delay: 700 },
    { emoji: '💦', startX: wp(70), startY: hp(38), delay: 850 },
    { emoji: '🎉', startX: wp(50), startY: hp(60), delay: 300 },
    { emoji: '👑', startX: wp(40), startY: hp(35), delay: 600 },
    { emoji: '💖', startX: wp(55), startY: hp(32), delay: 750 },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {CELEBRATION_ITEMS.map((item, index) => (
        <FloatingCelebrationItem
          key={index}
          delay={item.delay}
          emoji={item.emoji}
          startX={item.startX}
          startY={item.startY}
        />
      ))}
      <CelebrationBadge />
    </View>
  );
}

const styles = StyleSheet.create({
  badgeCard: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: scale(20),
    padding: scale(20),
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    top: hp(22),
    alignSelf: 'center',
    width: wp(80),
    zIndex: 1000,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  badgeTitle: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.title,
    color: theme.colors.text,
    marginHorizontal: scale(8),
  },
  badgeSubtitle: {
    fontFamily: theme.fontFamily.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  badgeEmoji: {
    fontSize: scale(24),
  },
});
