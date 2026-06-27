/**
 * BulletLayer – GPU-optimized single-path approach
 *
 * OLD: 40 individual <Circle> components × 4 useDerivedValue each = ~160 hooks
 *      React reconciles all 40 nodes every frame → LAG
 *
 * NEW: useDerivedValue builds ONE Skia SkPath containing all bullet circles.
 *      Skia renders it as a single GPU draw call, zero React reconciliation.
 *      Docs: https://shopify.github.io/react-native-skia/docs/paths
 */
import React from 'react';
import { Path, Group, BlurMask } from '@shopify/react-native-skia';
import { Skia } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { Bullet } from '../types';

interface BulletLayerProps {
  bullets: SharedValue<Bullet[]>;
}

const BULLET_R      = 3;
const BULLET_GLOW_R = 7;

export default function BulletLayer({ bullets }: BulletLayerProps) {
  /**
   * Build a single compound path with every active bullet circle.
   * This runs on the UI thread via Reanimated's worklet runtime –
   * zero JS bridge, zero React diffing, pure GPU paint every frame.
   */
  const bulletPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const list = bullets.value;
    for (let i = 0; i < list.length; i++) {
      path.addCircle(list[i].x, list[i].y, BULLET_R);
    }
    return path;
  });

  const glowPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const list = bullets.value;
    for (let i = 0; i < list.length; i++) {
      path.addCircle(list[i].x, list[i].y, BULLET_GLOW_R);
    }
    return path;
  });

  return (
    <Group>
      {/* Cyan outer glow – single draw call */}
      <Path path={glowPath} color="#00f3ff" opacity={0.5}>
        <BlurMask blur={6} style="normal" />
      </Path>

      {/* Bright white core – single draw call */}
      <Path path={bulletPath} color="#ffffff" />
    </Group>
  );
}
