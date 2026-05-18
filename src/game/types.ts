import * as THREE from 'three';

export const GameState = {
  START: 'start',
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
} as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];

export const PowerUpType = {
  SPREAD: 'spread',
  SHIELD: 'shield',
  SPEED: 'speed',
  RAPID: 'rapid',
} as const;
export type PowerUpType = (typeof PowerUpType)[keyof typeof PowerUpType];

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

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onPowerUpChange: (powerUp: PowerUpType | null) => void;
  onGameOver: (score: number) => void;
  onStateChange: (state: GameState) => void;
}

export const GAME_WIDTH = 20;
export const PLAYER_SPEED = 8;
export const BULLET_SPEED = 12;
export const ENEMY_BASE_SPEED = 2.5;
export const POWERUP_DURATION = 8;
export const SPREAD_ANGLE = 0.4;
export const RAPID_FIRE_INTERVAL = 0.08;
export const NORMAL_FIRE_INTERVAL = 0.25;
