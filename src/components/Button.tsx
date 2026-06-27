import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const S = createStyles(variant, disabled);
  const scaleVal = useSharedValue(1);
  const pressStartTime = useRef(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleVal.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    pressStartTime.current = Date.now();
    scaleVal.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    const duration = Date.now() - pressStartTime.current;
    const remainingTime = Math.max(0, 150 - duration);
    scaleVal.value = withDelay(
      remainingTime,
      withSpring(1, { damping: 15, stiffness: 300 })
    );
  };

  const handlePress = () => {
    if (disabled || loading) return;
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onPress();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        style={S.button}
      >
        {loading ? (
          <ActivityIndicator color={S.text.color as string} />
        ) : (
          <>
            {icon}
            <Text style={[S.text, textStyle, icon ? { marginLeft: scale(8) } : null]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}


const createStyles = (variant: 'primary' | 'accent' | 'secondary', disabled: boolean) => {
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.statBarBackground;
    switch (variant) {
      case 'accent':
        return theme.colors.accent;
      case 'secondary':
        return theme.colors.backgroundAlt;
      case 'primary':
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.subtext;
    switch (variant) {
      case 'secondary':
        return theme.colors.text;
      case 'accent':
      case 'primary':
      default:
        return theme.colors.text;
    }
  };

  const shadowStyles = (() => {
    if (disabled) return {};
    switch (variant) {
      case 'primary':
        return {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
          transform: [{ translateY: -2 }],
        };
      case 'accent':
        return {
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
          transform: [{ translateY: -2 }],
        };
      default:
        return {};
    }
  })();

  return StyleSheet.create({
    button: {
      height: verticalScale(48),
      borderRadius: scale(16),
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(24),
      borderWidth: 2,
      borderColor: theme.colors.text,
      backgroundColor: getBackgroundColor(),
      ...shadowStyles,
    } as any,
    text: {
      fontFamily: theme.fontFamily.heading,
      fontSize: theme.fontSize.button,
      textAlign: 'center',
      color: getTextColor(),
    },
  });
};
