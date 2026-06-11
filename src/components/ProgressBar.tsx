import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { scale, verticalScale } from 'react-native-size-matters';
import { theme } from '@/styles/theme';
import { ChevronLeft } from 'lucide-react-native';

interface ProgressBarProps {
  progress: number;
  label: string;
  color?: string;
  onBack?: () => void;
}

export default function ProgressBar({
  progress,
  label,
  color = theme.colors.primary,
  onBack,
}: ProgressBarProps) {
  return (
    <View style={styles.progressWrapper}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={scale(20)} color={theme.colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.rightContent}>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={[styles.progressPercent, { color }]}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarOutline}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressWrapper: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: scale(20),
    borderWidth: 2,
    borderColor: theme.colors.text,
    padding: scale(14),
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(12),
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  rightContent: {
    flex: 1,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  progressLabel: {
    fontFamily: theme.fontFamily.bodyBold,
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  progressPercent: {
    fontFamily: theme.fontFamily.heading,
    fontSize: theme.fontSize.body,
  },
  progressBarOutline: {
    width: '100%',
    height: verticalScale(14),
    backgroundColor: theme.colors.statBarBackground,
    borderRadius: scale(7),
    borderWidth: 1.5,
    borderColor: theme.colors.text,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: scale(5),
  },
});
