import * as THREE from 'three';

export const GameState = {
  START: 'start',
  UPGRADE: 'upgrade',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
} as const;
export type GameState = (typeof GameState)[keyof typeof GameState];

export const EnemyType = {
  BASIC: 'basic',
  SHOOTER: 'shooter',
  FAST: 'fast',
  TANK: 'tank',
  BOSS: 'boss',
  SWARM: 'swarm',
} as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const PowerUpType = {
  SPREAD: 'spread',
  SHIELD: 'shield',
  SPEED: 'speed',
  RAPID: 'rapid',
  EXTRA_LIFE: 'extra_life',
  PIERCE: 'pierce',
  BOUNCE: 'bounce',
  COIN_MAGNET: 'coin_magnet',
} as const;
export type PowerUpType = (typeof PowerUpType)[keyof typeof PowerUpType];

export const BulletType = {
  NORMAL: 'normal',
  PIERCE: 'pierce',
  BOUNCE: 'bounce',
} as const;
export type BulletType = (typeof BulletType)[keyof typeof BulletType];

export const Difficulty = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export interface Entity {
  mesh: THREE.Mesh;
  alive: boolean;
  update(dt: number): void;
}

export interface BulletData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  isEnemy: boolean;
  alive: boolean;
  bulletType: BulletType;
  pierceHits: number;
}

export interface EnemyData {
  mesh: THREE.Mesh;
  type: EnemyType;
  hp: number;
  velocity: THREE.Vector2;
  alive: boolean;
  shootTimer: number;
  fireInterval: number;
}

export interface PowerUpData {
  mesh: THREE.Mesh;
  type: PowerUpType;
  velocity: THREE.Vector2;
  alive: boolean;
}

export interface CoinData {
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  alive: boolean;
  amount: number;
}

export interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector2;
  life: number;
  maxLife: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  remaining: number;
}

export interface RunStats {
  enemiesKilled: number;
  killsByType: Record<EnemyType, number>;
  powerupsCollected: number;
  powerupTypes: string[];
  maxCombo: number;
  timeSurvived: number;
  bossKills: number;
}

export function emptyStats(): RunStats {
  return {
    enemiesKilled: 0,
    killsByType: { basic: 0, shooter: 0, fast: 0, tank: 0, boss: 0, swarm: 0 },
    powerupsCollected: 0,
    powerupTypes: [],
    maxCombo: 0,
    timeSurvived: 0,
    bossKills: 0,
  };
}

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onPowerUpChange: (powerUp: PowerUpType | null) => void;
  onGameOver: (score: number, stats: RunStats) => void;
  onStateChange: (state: GameState) => void;
  onLevelUp?: (level: number) => void;
  onCoinsChange?: (coins: number) => void;
  onAutoFireChange?: (active: boolean) => void;
}

export const GAME_WIDTH = 20;
export const PLAYER_SPEED = 8;
export const BULLET_SPEED = 12;
export const ENEMY_BASE_SPEED = 2.5;
export const POWERUP_DURATION = 8;
export const SPREAD_ANGLE = 0.4;
export const RAPID_FIRE_INTERVAL = 0.08;
export const NORMAL_FIRE_INTERVAL = 0.25;

export function getLevelThreshold(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 2000;
  let total = 2000;
  let increment = 1500;
  for (let i = 2; i < level; i++) {
    total += increment;
    increment += 500;
  }
  return total;
}

export function getLevelFromScore(score: number): number {
  if (score < 2000) return 1;
  let level = 2;
  let total = 2000;
  let increment = 1500;
  while (true) {
    const next = total + increment;
    if (score < next) return level;
    total = next;
    level++;
    increment += 500;
  }
}

export function getDifficultyFromScore(score: number): number {
  return getLevelFromScore(score) - 1;
}
