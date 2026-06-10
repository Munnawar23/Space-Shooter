import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const S = createStyles(variant, disabled);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[S.button, style]}
    >
      {loading ? (
        <ActivityIndicator color={S.text.color as string} />
      ) : (
        <Text style={[S.text, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
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
