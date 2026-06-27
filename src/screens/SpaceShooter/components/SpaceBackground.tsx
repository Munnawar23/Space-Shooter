import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Points, vec } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, useDerivedValue } from 'react-native-reanimated';

export default function SpaceBackground() {
  const { width, height } = useWindowDimensions();
  const stars = useSharedValue<{ x: number; y: number; size: number; speed: number }[]>([]);

  // Initialize background star coordinates once
  useEffect(() => {
    const list = [];
    for (let i = 0; i < 50; i++) {
      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
      });
    }
    stars.value = list;
  }, [width, height]);

  // Frame callback loop dedicated to moving background stars on the UI thread
  useFrameCallback((frameInfo) => {
    const dt = frameInfo.timeSincePreviousFrame ?? 16;
    const speedMultiplier = dt / 16;
    const currentStars = [...stars.value];
    if (currentStars.length === 0) return;

    for (let i = 0; i < currentStars.length; i++) {
      currentStars[i].y += currentStars[i].speed * speedMultiplier;
      if (currentStars[i].y > height) {
        currentStars[i].y = -10;
        currentStars[i].x = Math.random() * width;
      }
    }
    stars.value = currentStars;
  });

  const drawStars = useDerivedValue(() => {
    return stars.value.map((s) => vec(s.x, s.y));
  });

  return (
    <Points points={drawStars} mode="points" color="#ffffff" strokeWidth={1.5} />
  );
}
