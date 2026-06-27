/**
 * EnemyLayer – highly optimized for minimal JS-bridge overhead
 */
import React from 'react';
import {
  Group,
  Image,
  Rect,
  useImage,
  SkImage,
} from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { Enemy, ENEMY_CONFIGS } from '../types';

const IMG_SCOUT   = require('../../../assets/enemy_scout.png');
const IMG_FIGHTER = require('../../../assets/enemy_fighter.png');
const IMG_BOMBER  = require('../../../assets/enemy_bomber.png');

interface EnemyLayerProps {
  enemies: SharedValue<Enemy[]>;
}

const MAX_ENEMIES = 40;
const OFFSCREEN   = -5000;

export default function EnemyLayer({ enemies }: EnemyLayerProps) {
  // Preload the three 3D enemy sprites
  const imgScout   = useImage(IMG_SCOUT);
  const imgFighter = useImage(IMG_FIGHTER);
  const imgBomber  = useImage(IMG_BOMBER);

  const images = [imgScout, imgFighter, imgBomber];

  return (
    <>
      {Array.from({ length: MAX_ENEMIES }).map((_, i) => (
        <SingleEnemy key={i} index={i} enemies={enemies} images={images} />
      ))}
    </>
  );
}

function SingleEnemy({
  index,
  enemies,
  images,
}: {
  index: number;
  enemies: SharedValue<Enemy[]>;
  images: (SkImage | null)[];
}) {
  // 1. Transform position
  const transform = useDerivedValue(() => {
    const list = enemies.value;
    if (index >= list.length) return [{ translateX: OFFSCREEN }, { translateY: OFFSCREEN }];
    return [
      { translateX: list[index].x },
      { translateY: list[index].y },
    ];
  });

  // 2. Extracted properties
  const props = useDerivedValue(() => {
    const list = enemies.value;
    if (index >= list.length) {
      return {
        type: 0,
        color: '#000000',
        hpBarW: 0,
        halfW: 0,
        barY: 0,
        barFullW: 0,
      };
    }
    const e = list[index];
    const cfg = ENEMY_CONFIGS[e.type];
    return {
      type: e.type,
      color: cfg.color,
      hpBarW: (e.hp / e.maxHp) * e.width,
      halfW: e.width / 2,
      barY: -(e.height / 2) - 10,
      barFullW: e.width,
    };
  });

  const color    = useDerivedValue(() => props.value.color);
  const hpBarW   = useDerivedValue(() => props.value.hpBarW);
  const halfW    = useDerivedValue(() => props.value.halfW);
  const barY     = useDerivedValue(() => props.value.barY);
  const barFullW = useDerivedValue(() => props.value.barFullW);
  const negHalfW = useDerivedValue(() => -props.value.halfW);

  // Reactive image selection based on enemy type
  const activeImage = useDerivedValue(() => {
    const t = props.value.type;
    return images[t] || null;
  });

  return (
    <Group transform={transform}>
      {/* 3D Sprite Ship */}
      <Image
        image={activeImage}
        x={negHalfW}
        // Shift image slightly up so it centers on the collision box
        y={useDerivedValue(() => -props.value.halfW - 5)}
        width={barFullW}
        // Make the image slightly taller than it is wide
        height={useDerivedValue(() => props.value.barFullW * 1.2)}
        fit="contain"
        blendMode="screen" // Strips out solid black backgrounds from AI images
      />

      {/* HP bar – background */}
      <Rect
        x={negHalfW}
        y={barY}
        width={barFullW}
        height={3}
        color="rgba(255,255,255,0.15)"
      />

      {/* HP bar – fill */}
      <Rect
        x={negHalfW}
        y={barY}
        width={hpBarW}
        height={3}
        color={color}
      />
    </Group>
  );
}
