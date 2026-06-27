import React from 'react';
import {
  Group,
  Image,
  useImage,
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';

const SHIP_IMG = require('../../../assets/player_ship_v2.png');

interface PlayerShipProps {
  playerX:       SharedValue<number>;
  playerY:       SharedValue<number>;
  thrusterScale: SharedValue<number>;
}

export default function PlayerShip({ playerX, playerY }: PlayerShipProps) {
  const shipTransform = useDerivedValue(() => [
    { translateX: playerX.value },
    { translateY: playerY.value },
  ]);

  const shipImage = useImage(SHIP_IMG);

  return (
    <Group transform={shipTransform}>
      {shipImage && (
        <Image
          image={shipImage}
          x={-35}
          y={-35}
          width={70}
          height={70}
          fit="contain"
          // In case the AI image generator gave us a solid black background,
          // 'screen' blend mode treats black as completely transparent!
          // If the image is already transparent, it just renders normally.
          blendMode="screen"
        />
      )}
    </Group>
  );
}
