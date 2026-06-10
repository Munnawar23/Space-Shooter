import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Sound from 'react-native-sound';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
  onPress: () => void;
}

export default function ActionButton({ label, icon, color, textColor = theme.colors.card, onPress }: ActionButtonProps) {
  const scaleVal = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleVal.value }],
    };
  });

  const handlePress = () => {
    // 1. Reanimated scale effect
    scaleVal.value = withSequence(
      withSpring(0.85, { damping: 10, stiffness: 300 }),
      withSpring(1.05, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );

    // 2. Haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });

    // 3. Sound effect (button.mp3)
    const soundAsset = Image.resolveAssetSource(require('@/assets/sfx/button.mp3'));
    const clickSound = new Sound(soundAsset.uri, '', (error) => {
      if (!error) {
        clickSound.play(() => {
          clickSound.release();
        });
      } else {
        console.warn('Failed to load button sound:', error);
      }
    });

    // 4. Trigger parent callback
    onPress();
  };

  return (
    <Animated.View style={[styles.actionWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={[styles.actionButton, { backgroundColor: color }]}
      >
        {icon}
        <Text style={[styles.actionLabel, { color: textColor }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionWrapper: {
    alignItems: 'center',
  },
  actionButton: {
    width: scale(105),
    height: scale(105),
    borderRadius: scale(32),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.card,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  actionLabel: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.small,
    color: theme.colors.card,
    marginTop: verticalScale(4),
    textTransform: 'uppercase',
  },
});
