export interface EnemyType {
  width: number;
  height: number;
  maxHp: number;
  scoreValue: number;
  color: string;
  speed: number;
  path: string;
}

export const ENEMY_CONFIGS: EnemyType[] = [
  {
    width: 30,
    height: 30,
    maxHp: 1,
    scoreValue: 10,
    color: '#39ff14', // Neon Green Scout
    speed: 7,
    path: 'M 0 15 L -15 -15 L 0 -5 L 15 -15 Z',
  },
  {
    width: 45,
    height: 40,
    maxHp: 3,
    scoreValue: 30,
    color: '#ffea00', // Electric Yellow Fighter
    speed: 4.5,
    path: 'M 0 20 L -20 -15 L -10 -5 L 0 -20 L 10 -5 L 20 -15 Z',
  },
  {
    width: 60,
    height: 50,
    maxHp: 5,
    scoreValue: 50,
    color: '#ff007f', // Neon Magenta Bomber
    speed: 3,
    path: 'M 0 25 L -30 -10 L -15 -25 L 0 -10 L 15 -25 L 30 -10 Z',
  },
];

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: number;
  hp: number;
  maxHp: number;
  width: number;
  height: number;
  speed: number;
  animOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;     // current life 0..1
  maxLife: number;  // total life frames
}
