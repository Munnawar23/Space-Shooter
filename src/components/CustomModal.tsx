import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import Button from '@/components/Button';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import FallingEmojis from '@/components/FallingEmojis';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonTitle: string;
  onButtonPress: () => void;
  secondaryButtonTitle?: string;
  onSecondaryButtonPress?: () => void;
  showCloseButton?: boolean;
  icon?: React.ReactNode;
  showCelebrationEffect?: boolean;
}

export default function CustomModal({
  visible,
  onClose,
  title,
  message,
  buttonTitle,
  onButtonPress,
  secondaryButtonTitle,
  onSecondaryButtonPress,
  showCloseButton = true,
  icon,
  showCelebrationEffect = false,
}: CustomModalProps) {
  const handleClose = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    onClose();
  };

  const handleSecondaryPress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    if (onSecondaryButtonPress) {
      onSecondaryButtonPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {showCelebrationEffect && <FallingEmojis />}
        <View style={styles.card}>
          {/* Close / Cross Button */}
          {showCloseButton && (
            <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
              <X size={scale(20)} color={theme.colors.text} />
            </TouchableOpacity>
          )}

          {/* Icon Header */}
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {/* Content */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Actions */}
          <View style={styles.buttonContainer}>
            <Button
              title={buttonTitle}
              onPress={onButtonPress}
              variant="primary"
              style={styles.actionButton}
            />
            {secondaryButtonTitle && onSecondaryButtonPress && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSecondaryPress} activeOpacity={0.7}>
                <Text style={styles.secondaryButtonText}>{secondaryButtonTitle}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 253, 247, 0.98)', // theme.colors.card warmth
    width: '85%',
    borderRadius: scale(24),
    padding: scale(24),
    alignItems: 'center',
    borderWidth: 3.5,
    borderColor: theme.colors.text,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: scale(14),
    right: scale(14),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    borderWidth: 2,
    borderColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  iconContainer: {
    width: scale(70),
    height: scale(70),
    borderRadius: scale(35),
    backgroundColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(14),
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  title: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.title,
    color: theme.colors.text,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  message: {
    fontFamily: theme.fontFamily.body,
    fontSize: theme.fontSize.body,
    color: theme.colors.subtext,
    textAlign: 'center',
    lineHeight: scale(20),
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(10),
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    marginBottom: verticalScale(8),
  },
  secondaryButton: {
    paddingVertical: verticalScale(8),
  },
  secondaryButtonText: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.small,
    color: theme.colors.subtext,
    textTransform: 'uppercase',
  },
});
