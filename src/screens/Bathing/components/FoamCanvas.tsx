import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, Line } from '@shopify/react-native-skia';
import { scale } from 'react-native-size-matters';
import { wp, hp } from '@/helpers/dimensionHelpers';

export interface FoamCanvasRef {
  addBubbles: (x: number, y: number) => void;
  spawnWater: (active: boolean) => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface Droplet {
  id: number;
  x: number;
  y: number;
  length: number;
  alpha: number;
  vy: number;
  strokeWidth: number;
}

const FoamCanvas = forwardRef<FoamCanvasRef, {}>((_, ref) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [isWaterActive, setIsWaterActive] = useState(false);

  // Expose methods to parent via ref to bypass parent screen re-renders
  useImperativeHandle(ref, () => ({
    addBubbles(x: number, y: number) {
      const numBubbles = 3;
      const newBubbles: Bubble[] = Array.from({ length: numBubbles }).map(() => ({
        id: Math.random(),
        x: x + (Math.random() - 0.5) * scale(40),
        y: y + (Math.random() - 0.5) * scale(40),
        r: scale(6 + Math.random() * 12),
        alpha: 0.8 + Math.random() * 0.2,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
      }));
      setBubbles((prev) => [...prev, ...newBubbles].slice(-100));
    },
    spawnWater(active: boolean) {
      setIsWaterActive(active);
    },
  }));

  // Unified animation loop for both bubbles and water droplets
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update bubbles (float up & fade ONLY if water is active)
      setBubbles((prev) =>
        prev
          .map((b) => ({
            ...b,
            x: isWaterActive ? b.x + b.vx + (Math.random() - 0.5) * 1.5 : b.x,
            y: isWaterActive ? b.y + b.vy - 1.2 : b.y,
            alpha: isWaterActive ? b.alpha - 0.02 : b.alpha,
          }))
          .filter((b) => b.alpha > 0)
      );

      // 2. Update water droplets (fall down & fade)
      setDroplets((prev) =>
        prev
          .map((d) => ({
            ...d,
            y: d.y + d.vy,
            alpha: d.alpha - 0.03,
          }))
          .filter((d) => d.alpha > 0 && d.y < hp(95))
      );
    }, 30);

    return () => clearInterval(interval);
  }, [isWaterActive]);

  // Water generator loop: spawns droplets when active
  useEffect(() => {
    if (!isWaterActive) return;

    const waterInterval = setInterval(() => {
      const numDroplets = 5;
      const newDroplets: Droplet[] = Array.from({ length: numDroplets }).map(() => ({
        id: Math.random(),
        x: wp(10) + Math.random() * wp(80),
        y: hp(10) + Math.random() * hp(5),
        length: scale(14 + Math.random() * 14),
        alpha: 0.5 + Math.random() * 0.4,
        vy: scale(9 + Math.random() * 6), // Faster fall speed for rain
        strokeWidth: scale(1.5 + Math.random() * 1.5),
      }));

      setDroplets((prev) => [...prev, ...newDroplets].slice(-150));
    }, 40);

    return () => clearInterval(waterInterval);
  }, [isWaterActive]);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Render Rain Droplets */}
      {droplets.map((d) => (
        <Line
          key={d.id}
          p1={{ x: d.x, y: d.y }}
          p2={{ x: d.x, y: d.y + d.length }}
          color={`rgba(174, 219, 245, ${d.alpha})`} // Shower rain color
          style="stroke"
          strokeWidth={d.strokeWidth}
          strokeCap="round"
        />
      ))}

      {/* 2. Render Soap Bubbles */}
      {bubbles.map((b) => (
        <React.Fragment key={b.id}>
          {/* Bubble Fill */}
          <Circle
            cx={b.x}
            cy={b.y}
            r={b.r}
            color={`rgba(235, 246, 255, ${b.alpha * 0.7})`}
          />
          {/* Bubble Highlight Outline */}
          <Circle
            cx={b.x}
            cy={b.y}
            r={b.r}
            color={`rgba(255, 255, 255, ${b.alpha * 0.85})`}
            style="stroke"
            strokeWidth={1.5}
          />
        </React.Fragment>
      ))}
    </Canvas>
  );
});

export default FoamCanvas;
