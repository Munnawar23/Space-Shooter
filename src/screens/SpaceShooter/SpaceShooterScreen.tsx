import React, { useEffect } from 'react';
import { View, StyleSheet, Text, useWindowDimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { useSharedValue, useFrameCallback, withTiming, withRepeat } from 'react-native-reanimated';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';

import SpaceBackground from './components/SpaceBackground';
import PlayerShip from './components/PlayerShip';

export default function SpaceShooterScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  // Shared values for player state
  const playerX = useSharedValue(width / 2);
  const playerY = useSharedValue(height - 120);
  const playerWidth = 40;
  const playerHeight = 45;

  const score = useSharedValue(0);
  const thrusterScale = useSharedValue(1);

  // Score accumulator
  const timeElapsed = useSharedValue(0);

  // Initialize animations on mount
  useEffect(() => {
    // Start thruster animation loop
    thrusterScale.value = withRepeat(
      withTiming(1.4, { duration: 100 }),
      -1,
      true
    );
  }, []);

  // Touch gesture handler for ship movement
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const panGesture = usePanGesture({
    onActivate: () => {
      startX.value = playerX.value;
      startY.value = playerY.value;
    },
    onUpdate: (event) => {
      let newX = startX.value + event.translationX;
      let newY = startY.value + event.translationY;

      // Restrict boundaries
      playerX.value = Math.max(playerWidth, Math.min(width - playerWidth, newX));
      playerY.value = Math.max(playerHeight, Math.min(height - 80, newY));
    },
  });

  // Main game loop running on UI thread at 60 FPS (updates survival score)
  useFrameCallback((frameInfo) => {
    const dt = frameInfo.timeSincePreviousFrame ?? 16;

    // Increment survival score (e.g. 1 point every 100ms)
    timeElapsed.value += dt;
    if (timeElapsed.value >= 100) {
      timeElapsed.value = 0;
      score.value += 1;
    }
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060814" />

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={StyleSheet.absoluteFill}>
            {/* Background color */}
            <Rect x={0} y={0} width={width} height={height} color="#060814" />

            {/* Stars rendering - handles its own loop and state */}
            <SpaceBackground />

            {/* Player Ship */}
            <PlayerShip
              playerX={playerX}
              playerY={playerY}
              thrusterScale={thrusterScale}
            />
          </Canvas>
        </View>
      </GestureDetector>

      {/* HUD OVERLAY showing only survival score */}
      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.scoreContainer}>
          <Text style={styles.hudLabel}>SCORE</Text>
          <Text style={styles.hudValue}>{score.value}</Text>
        </View>
      </View>

      {/* Close/Cross Button to return Home */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <X size={20} color="#00f3ff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060814',
  },
  canvasContainer: {
    flex: 1,
  },
  hudOverlay: {
    ...StyleSheet.absoluteFill,
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 23, 54, 0.85)',
    paddingVertical: hp(1),
    paddingHorizontal: wp(8),
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00f3ff',
    minWidth: wp(30),
  },
  hudLabel: {
    color: '#8f9bb3',
    fontSize: 10,
    fontFamily: theme.fontFamily.heading,
    letterSpacing: 1.5,
  },
  hudValue: {
    color: '#00f3ff',
    fontSize: 22,
    fontFamily: theme.fontFamily.heading,
    marginTop: 2,
  },
  closeButton: {
    position: 'absolute',
    top: hp(6),
    right: wp(5),
    backgroundColor: 'rgba(17, 23, 54, 0.85)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00f3ff',
    zIndex: 10,
  },
});
