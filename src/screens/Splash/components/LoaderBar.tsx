import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { verticalScale, scale } from "react-native-size-matters";
import { theme } from "@/styles/theme";
import { wp } from "@/helpers/dimensionHelpers";

interface LoaderBarProps {
  onComplete?: () => void;
  duration?: number;
}

export default function LoaderBar({ onComplete, duration = 3000 }: LoaderBarProps) {
  const [progressVal, setProgressVal] = useState(0);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth progress bar animation over specified duration
    Animated.timing(animWidth, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Discrete number steps 0 to 100
    const stepDuration = duration / 100;
    const interval = setInterval(() => {
      setProgressVal((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(interval);
        return 100;
      });
    }, stepDuration);

    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete, duration, animWidth]);

  const widthInterpolate = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.loaderContainer}>
      <Text style={styles.loaderText}>LOADING... {progressVal}%</Text>
      <View style={styles.progressBarTrack}>
        <Animated.View style={[styles.progressBarFill, { width: widthInterpolate }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    alignItems: "center",
    width: wp(75),
    marginTop: verticalScale(10),
  },
  loaderText: {
    fontFamily: theme.fontFamily.heading,
    fontSize: scale(18),
    color: "#ffffff",
    marginBottom: verticalScale(12),
    textTransform: "uppercase",
    letterSpacing: scale(1.5),
  },
  progressBarTrack: {
    width: "100%",
    height: verticalScale(16),
    borderRadius: scale(8),
    borderWidth: 2,
    borderColor: "#1e295d",
    backgroundColor: "#111736",
    overflow: "hidden",
    elevation: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#00f3ff",
    borderRadius: scale(6),
  },
});
