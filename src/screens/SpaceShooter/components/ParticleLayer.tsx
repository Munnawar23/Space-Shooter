/**
 * ParticleLayer – GPU-optimized single-path-per-color approach
 *
 * OLD: 200 individual <Circle> components × 5 useDerivedValue each = ~1000 hooks
 *      React reconciles 200 nodes every frame → severe LAG on burst fire
 *
 * NEW: Group particles by color (4 possible colors), build ONE SkPath per color.
 *      4 draw calls total vs 200+. Runs entirely on UI thread GPU pipeline.
 *
 * Per-particle alpha/fade is handled by removing dim particles from the array
 * in the game loop (SpaceShooterScreen.tsx step 7) rather than per-draw opacity.
 * This is actually MORE GPU efficient – fewer primitives drawn.
 *
 * Docs: https://shopify.github.io/react-native-skia/docs/paths
 */
import React from 'react';
import { Path, Group, BlurMask } from '@shopify/react-native-skia';
import { Skia } from '@shopify/react-native-skia';
import { useDerivedValue, SharedValue } from 'react-native-reanimated';
import { Particle } from '../types';

interface ParticleLayerProps {
  particles: SharedValue<Particle[]>;
}

// The 4 possible explosion colours (enemy types + player)
const COLORS = ['#39ff14', '#ffea00', '#ff007f', '#00f3ff'];

/**
 * Build a path containing all particles matching a given color string.
 * Returns { core, glow } paths.
 */
function useColorPath(
  particles: SharedValue<Particle[]>,
  color: string,
) {
  const corePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const list = particles.value;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      if (p.color === color) {
        path.addCircle(p.x, p.y, Math.max(0.5, p.size / 2));
      }
    }
    return path;
  });

  return corePath;
}

export default function ParticleLayer({ particles }: ParticleLayerProps) {
  // One useDerivedValue per color → 4 draw calls (core) + 4 (glow) = 8 GPU commands
  const pathGreen   = useColorPath(particles, COLORS[0]);
  const pathYellow  = useColorPath(particles, COLORS[1]);
  const pathMagenta = useColorPath(particles, COLORS[2]);
  const pathCyan    = useColorPath(particles, COLORS[3]);

  // White core paths (same geometry, color doesn't matter)
  const allCorePath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const list = particles.value;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      path.addCircle(p.x, p.y, Math.max(0.3, p.size / 3));
    }
    return path;
  });

  return (
    <Group>
      {/* Coloured glows – one draw call per color */}
      <Path path={pathGreen} color="#39ff14" opacity={0.85}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={pathYellow} color="#ffea00" opacity={0.85}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={pathMagenta} color="#ff007f" opacity={0.85}>
        <BlurMask blur={5} style="normal" />
      </Path>
      <Path path={pathCyan} color="#00f3ff" opacity={0.85}>
        <BlurMask blur={5} style="normal" />
      </Path>

      {/* Bright white centers – single draw call over everything */}
      <Path path={allCorePath} color="#ffffff" opacity={0.95} />
    </Group>
  );
}
