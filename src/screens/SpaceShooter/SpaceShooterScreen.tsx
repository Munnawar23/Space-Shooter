import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useFrameCallback,
  withRepeat,
  withTiming,
  runOnJS,
  useAnimatedReaction,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { theme } from '@/styles/theme';
import { wp, hp } from '@/helpers/dimensionHelpers';

import SpaceBackground from './components/SpaceBackground';
import PlayerShip from './components/PlayerShip';
import BulletLayer from './components/BulletLayer';
import EnemyLayer from './components/EnemyLayer';
import ParticleLayer from './components/ParticleLayer';

import { Bullet, Enemy, Particle, ENEMY_CONFIGS } from './types';

// ─── constants ────────────────────────────────────────────────────────────────
const PLAYER_W      = 40;
const PLAYER_H      = 45;
const BULLET_SPEED  = 14;
const BULLET_RATE   = 180;   // ms between shots while dragging
const ENEMY_SPAWN   = 450;   // ms between spawns (3x faster)
const EXP_COUNT     = 18;    // particles per explosion

let _bulletId = 0;
let _enemyId  = 0;

// ─── worklet helper: spawn explosion particles ────────────────────────────────
function spawnExplosion(
  x: number,
  y: number,
  color: string,
  particles: Particle[],
) {
  'worklet';
  for (let i = 0; i < EXP_COUNT; i++) {
    const angle = (Math.PI * 2 * i) / EXP_COUNT + Math.random() * 0.5;
    const spd   = Math.random() * 5 + 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: Math.random() * 5 + 2,
      alpha: 1,
      color,
      life: 1,
      maxLife: 1,
    });
  }
}

// ─── main screen ─────────────────────────────────────────────────────────────
export default function SpaceShooterScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation();

  // player
  const playerX      = useSharedValue(width / 2);
  const playerY      = useSharedValue(height - 120);
  const thrusterScale = useSharedValue(1);
  const isDragging   = useSharedValue(false);

  // game objects
  const bullets   = useSharedValue<Bullet[]>([]);
  const enemies   = useSharedValue<Enemy[]>([]);
  const particles = useSharedValue<Particle[]>([]);

  // HUD
  const score    = useSharedValue(0);
  const lives    = useSharedValue(3);
  const gameOver = useSharedValue(false);

  // timers
  const bulletTimer = useSharedValue(0);
  const enemyTimer  = useSharedValue(0);

  // pan gesture anchors
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // thruster flicker
  useEffect(() => {
    thrusterScale.value = withRepeat(withTiming(1.5, { duration: 90 }), -1, true);
  }, []);

  // ── pan gesture (Gesture Handler v3) ─────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      startX.value   = playerX.value;
      startY.value   = playerY.value;
      isDragging.value = true;
    })
    .onUpdate((e) => {
      'worklet';
      const nx = startX.value + e.translationX;
      const ny = startY.value + e.translationY;
      playerX.value = Math.max(PLAYER_W / 2, Math.min(width - PLAYER_W / 2, nx));
      playerY.value = Math.max(PLAYER_H / 2, Math.min(height - 60, ny));
    })
    .onEnd(() => {
      'worklet';
      isDragging.value = false;
    })
    .onFinalize(() => {
      'worklet';
      isDragging.value = false;
    });

  // ── main game loop (UI thread, 60 FPS) ───────────────────────────────────
  useFrameCallback((frameInfo) => {
    'worklet';
    if (gameOver.value) return;

    const dt = frameInfo.timeSincePreviousFrame ?? 16;

    // 1 ─ fire bullets while dragging
    bulletTimer.value += dt;
    if (isDragging.value && bulletTimer.value >= BULLET_RATE) {
      bulletTimer.value = 0;
      const nb = bullets.value.slice();
      nb.push({
        id: Math.random(),
        x: playerX.value,
        y: playerY.value - PLAYER_H / 2 - 4,
      });
      bullets.value = nb;
    }

    // 2 ─ move bullets up
    const nextBullets = [];
    for (let i = 0; i < bullets.value.length; i++) {
      const b = bullets.value[i];
      b.y -= BULLET_SPEED;
      if (b.y > -30) nextBullets.push(b);
    }
    bullets.value = nextBullets;

    // 3 ─ spawn enemies
    enemyTimer.value += dt;
    if (enemyTimer.value >= ENEMY_SPAWN) {
      enemyTimer.value = 0;
      const ti  = Math.floor(Math.random() * ENEMY_CONFIGS.length);
      const cfg = ENEMY_CONFIGS[ti];
      const mg  = cfg.width / 2 + 10;
      const ne  = enemies.value.slice();
      ne.push({
        id: Math.random(),
        x: mg + Math.random() * (width - mg * 2),
        y: -cfg.height,
        type: ti,
        hp: cfg.maxHp,
        maxHp: cfg.maxHp,
        width: cfg.width,
        height: cfg.height,
        speed: cfg.speed,
        animOffset: Math.random() * Math.PI * 2,
      });
      enemies.value = ne;
    }

    // 4 ─ move enemies down
    let movedEnemies: Enemy[] = [];
    for (let i = 0; i < enemies.value.length; i++) {
      const e = enemies.value[i];
      e.y += e.speed;
      movedEnemies.push(e);
    }

    // 5 ─ bullet × enemy collisions
    const hitBulletIds = new Set<number>();
    const hitEnemyIds  = new Set<number>();
    let   newParticles = particles.value.slice();
    let   scoreDelta   = 0;

    for (let bi = 0; bi < bullets.value.length; bi++) {
      const bullet = bullets.value[bi];
      if (hitBulletIds.has(bullet.id)) continue;
      for (let ei = 0; ei < movedEnemies.length; ei++) {
        const enemy = movedEnemies[ei];
        if (hitEnemyIds.has(enemy.id)) continue;
        const hw = enemy.width  / 2;
        const hh = enemy.height / 2;
        if (
          bullet.x > enemy.x - hw &&
          bullet.x < enemy.x + hw &&
          bullet.y > enemy.y - hh &&
          bullet.y < enemy.y + hh
        ) {
          hitBulletIds.add(bullet.id);
          movedEnemies[ei] = { ...enemy, hp: enemy.hp - 1 };
          if (movedEnemies[ei].hp <= 0) {
            hitEnemyIds.add(enemy.id);
            scoreDelta += ENEMY_CONFIGS[enemy.type].scoreValue;
            spawnExplosion(enemy.x, enemy.y, ENEMY_CONFIGS[enemy.type].color, newParticles);
          }
          break;
        }
      }
    }

    const survivingBullets = [];
    for (let i = 0; i < bullets.value.length; i++) {
      if (!hitBulletIds.has(bullets.value[i].id)) survivingBullets.push(bullets.value[i]);
    }
    bullets.value = survivingBullets;

    const survivingMovedEnemies = [];
    for (let i = 0; i < movedEnemies.length; i++) {
      if (!hitEnemyIds.has(movedEnemies[i].id)) survivingMovedEnemies.push(movedEnemies[i]);
    }
    movedEnemies = survivingMovedEnemies;

    // 6 ─ enemy × player collisions
    const px  = playerX.value;
    const py  = playerY.value;
    const phw = PLAYER_W / 2;
    const phh = PLAYER_H / 2;

    const survivingEnemies: Enemy[] = [];
    let livesLost = 0;

    for (const enemy of movedEnemies) {
      const hw = enemy.width  / 2;
      const hh = enemy.height / 2;
      if (
        px + phw > enemy.x - hw &&
        px - phw < enemy.x + hw &&
        py + phh > enemy.y - hh &&
        py - phh < enemy.y + hh
      ) {
        livesLost += 1;
        spawnExplosion(enemy.x, enemy.y, ENEMY_CONFIGS[enemy.type].color, newParticles);
        spawnExplosion(px, py, '#00f3ff', newParticles);
      } else if (enemy.y < height + 80) {
        survivingEnemies.push(enemy);
      }
      // enemies past bottom are silently removed
    }

    enemies.value = survivingEnemies;

    // 7 ─ update particles (physics + fade)
    const aliveParts: Particle[] = [];
    for (const p of newParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12;
      p.vx *= 0.96;
      p.alpha -= 0.033;
      p.size *= 0.97;
      p.life = p.alpha;
      if (p.alpha > 0 && p.size > 0.3) aliveParts.push(p);
    }
    particles.value = aliveParts;

    // 8 ─ commit score / lives
    if (scoreDelta > 0) score.value += scoreDelta;
    if (livesLost > 0) {
      const newLives = lives.value - livesLost;
      lives.value = Math.max(0, newLives);
      if (newLives <= 0) gameOver.value = true;
    }
  });

  // ── restart ───────────────────────────────────────────────────────────────
  const handleRestart = useCallback(() => {
    bullets.value     = [];
    enemies.value     = [];
    particles.value   = [];
    score.value       = 0;
    lives.value       = 3;
    playerX.value     = width / 2;
    playerY.value     = height - 120;
    gameOver.value    = false;
    bulletTimer.value = 0;
    enemyTimer.value  = 0;
  }, [width, height]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#060814" />

      <GestureDetector gesture={panGesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Rect x={0} y={0} width={width} height={height} color="#060814" />
            <SpaceBackground />
            <ParticleLayer particles={particles} />
            <BulletLayer   bullets={bullets} />
            <EnemyLayer    enemies={enemies} />
            <PlayerShip
              playerX={playerX}
              playerY={playerY}
              thrusterScale={thrusterScale}
            />
          </Canvas>
        </View>
      </GestureDetector>

      {/* HUD & Controls */}
      <View style={styles.hudOverlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <View style={styles.statsContainer} pointerEvents="none">
            <View style={styles.scoreContainer}>
              <Text style={styles.hudLabel}>SCORE</Text>
              <ScoreText score={score} />
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <X size={24} color="#00f3ff" />
          </TouchableOpacity>
        </View>

        <View style={styles.livesCenterContainer} pointerEvents="none">
          <View style={styles.livesRow}>
            <LivesDisplay lives={lives} />
          </View>
        </View>
      </View>

      {/* Game Over */}
      <GameOverOverlay gameOver={gameOver} score={score} onRestart={handleRestart} />
    </View>
  );
}

// ─── HUD reactive sub-components ─────────────────────────────────────────────

function ScoreText({ score }: { score: SharedValue<number> }) {
  const [display, setDisplay] = useState(0);
  useAnimatedReaction(
    () => score.value,
    (v) => runOnJS(setDisplay)(v),
  );
  return <Text style={styles.hudValue}>{display}</Text>;
}

function LivesDisplay({ lives }: { lives: SharedValue<number> }) {
  const [display, setDisplay] = useState(3);
  useAnimatedReaction(
    () => lives.value,
    (v) => runOnJS(setDisplay)(v),
  );
  return (
    <View style={styles.livesContainer}>
      {[0, 1, 2].map((i) => (
        <Text key={i} style={[styles.lifeIcon, i >= display && styles.lifeIconDead]}>
          ❤️
        </Text>
      ))}
    </View>
  );
}

function GameOverOverlay({
  gameOver,
  score,
  onRestart,
}: {
  gameOver: SharedValue<boolean>;
  score: SharedValue<number>;
  onRestart: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useAnimatedReaction(
    () => ({ go: gameOver.value, s: score.value }),
    ({ go, s }) => {
      runOnJS(setVisible)(go);
      runOnJS(setFinalScore)(s);
    },
  );

  if (!visible) return null;

  return (
    <View style={styles.gameOverOverlay}>
      <Text style={styles.gameOverTitle}>GAME OVER</Text>
      <Text style={styles.gameOverScore}>Score: {finalScore}</Text>
      <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
        <Text style={styles.restartText}>PLAY AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060814',
  },
  canvasContainer: {
    flex: 1,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: hp(6),
    paddingHorizontal: wp(5),
  },
  statsContainer: {
    alignItems: 'flex-start',
  },
  scoreContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(17, 23, 54, 0.75)',
    paddingVertical: hp(1),
    paddingHorizontal: wp(5),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.5)',
    minWidth: wp(25),
  },
  hudLabel: {
    color: '#8f9bb3',
    fontSize: 10,
    fontFamily: theme.fontFamily.heading,
    letterSpacing: 2,
    marginBottom: 2,
  },
  hudValue: {
    color: '#00f3ff',
    fontSize: 24,
    fontFamily: theme.fontFamily.heading,
    textShadowColor: 'rgba(0, 243, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  livesCenterContainer: {
    position: 'absolute',
    top: hp(6),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  livesRow: {
    backgroundColor: 'rgba(17, 23, 54, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 127, 0.4)',
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  lifeIcon: {
    fontSize: 16,
    opacity: 1,
  },
  lifeIconDead: {
    opacity: 0.2,
    transform: [{ scale: 0.8 }],
  },
  closeButton: {
    backgroundColor: 'rgba(17, 23, 54, 0.75)',
    padding: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 243, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 8, 20, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  gameOverTitle: {
    color: '#ff007f',
    fontSize: 42,
    fontFamily: theme.fontFamily.heading,
    letterSpacing: 6,
    textShadowColor: '#ff007f',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  gameOverScore: {
    color: '#00f3ff',
    fontSize: 22,
    fontFamily: theme.fontFamily.heading,
    marginTop: hp(2),
  },
  restartButton: {
    marginTop: hp(4),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(12),
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00f3ff',
    backgroundColor: 'rgba(0,243,255,0.12)',
  },
  restartText: {
    color: '#00f3ff',
    fontSize: 16,
    fontFamily: theme.fontFamily.heading,
    letterSpacing: 3,
  },
});
