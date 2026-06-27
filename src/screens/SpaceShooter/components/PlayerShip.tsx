import React from 'react';
import { Group, Path, LinearGradient, vec } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';

interface PlayerShipProps {
  playerX: SharedValue<number>;
  playerY: SharedValue<number>;
  thrusterScale: SharedValue<number>;
}

const playerShipPath = 'M 0 -22 L 5 -8 L 18 10 L 8 10 L 0 3 L -8 10 L -18 10 L -5 -8 Z';
const playerThrusterPath = 'M -5 10 L 0 20 L 5 10 Z';

export default function PlayerShip({ playerX, playerY, thrusterScale }: PlayerShipProps) {
  const drawPlayer = useDerivedValue(() => {
    return [
      { translateX: playerX.value },
      { translateY: playerY.value },
    ];
  });

  const thrusterTransform = useDerivedValue(() => {
    return [
      { scaleY: thrusterScale.value },
      { translateY: 2 },
    ];
  });

  return (
    <Group transform={drawPlayer}>
      {/* Glowing engine flame */}
      <Group transform={thrusterTransform}>
        <Path path={playerThrusterPath} color="#ffea00" />
      </Group>

      {/* Main Ship Path */}
      <Path path={playerShipPath} color="#00f3ff">
        <LinearGradient
          start={vec(0, -22)}
          end={vec(0, 15)}
          colors={['#00f3ff', '#111736']}
        />
      </Path>
    </Group>
  );
}
