import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const EMOJIS = ['💖', '✨', '🎉', '🌟', '🎊', '🎈', '🥰'];
const NUM_EMOJIS = 20;

const FallingEmoji = ({ index }: { index: number }) => {
  const emoji = EMOJIS[index % EMOJIS.length];
  const startX = Math.random() * width;
  const delay = Math.random() * 2000;
  const duration = 2000 + Math.random() * 2000;
  const size = 20 + Math.random() * 20;

  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, {
          duration,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(startX - 30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(startX + 30, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: duration * 1.5, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [delay, duration, rotate, startX, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <Animated.Text style={[styles.emoji, { fontSize: size }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

export default function FallingEmojis() {
  const emojis = Array.from({ length: NUM_EMOJIS }).map((_, i) => i);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {emojis.map((i) => (
        <FallingEmoji key={i} index={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emoji: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
