import * as THREE from 'three';
import type { EnemyType, PowerUpType, EnemyData, PowerUpData, Difficulty } from '../types';
import { createEnemy } from '../entities/Enemy';
import { createPowerUp } from '../entities/PowerUp';

const DIFFICULTY_MODS: Record<Difficulty, { spawnMult: number; enemySpeedMult: number; hpBonus: number; coinRate: number; playerSpeedMult: number; scoreMult: number }> = {
  easy: { spawnMult: 1.3, enemySpeedMult: 0.7, hpBonus: 0, coinRate: 0.2, playerSpeedMult: 1.0, scoreMult: 1.5 },
  medium: { spawnMult: 1.0, enemySpeedMult: 1.0, hpBonus: 0, coinRate: 0.1, playerSpeedMult: 1.0, scoreMult: 1.0 },
  hard: { spawnMult: 0.8, enemySpeedMult: 1.3, hpBonus: 1, coinRate: 0.05, playerSpeedMult: 1.2, scoreMult: 0.7 },
};

export class SpawnSystem {
  private timer = 0;
  private spawnInterval = 1.8;
  private difficulty: Difficulty = 'medium';
  private level = 1;
  private waveNumber = 0;
  private waveTimer = 0;
  private betweenWaves = false;
  private warmupTimer = 3.0;
  private scene: THREE.Scene;
  private width: number;
  private height: number;
  private scale = 1;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }

  get mods() {
    return DIFFICULTY_MODS[this.difficulty];
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setDifficulty(level: number): void {
    if (level > this.level && level % 5 === 0 && level > 0) {
      this.startBossWave(level);
    }
    this.level = level;
    this.spawnInterval = Math.max(0.6, 1.8 - level * 0.04) * DIFFICULTY_MODS[this.difficulty].spawnMult;
  }

  setDifficultyMode(mode: Difficulty): void {
    this.difficulty = mode;
  }

  get currentWave(): number {
    return this.waveNumber;
  }

  get isBetweenWaves(): boolean {
    return this.betweenWaves;
  }

  private startBossWave(wave: number): void {
    this.waveNumber = wave;
    this.betweenWaves = true;
    this.waveTimer = 2.0;
    this.timer = 999;
  }

  setScale(s: number): void {
    this.scale = s;
  }

  update(dt: number): { newEnemies: EnemyData[]; newPowerUps: PowerUpData[] } {
    const newEnemies: EnemyData[] = [];
    const newPowerUps: PowerUpData[] = [];

    if (this.warmupTimer > 0) {
      this.warmupTimer -= dt;
      return { newEnemies, newPowerUps };
    }

    if (this.betweenWaves) {
      this.waveTimer -= dt;
      if (this.waveTimer <= 0) {
        this.betweenWaves = false;
        this.timer = 0.5;
        const boss = createEnemy('boss', 0, this.height + 3, this.level, this.scale, this.difficulty);
        newEnemies.push(boss);
        this.scene.add(boss.mesh);

        const escortCount = Math.min(2 + Math.floor(this.level / 5), 6);
        for (let i = 0; i < escortCount; i++) {
          const ex = (Math.random() - 0.5) * this.width * 1.2;
          const ey = this.height + 1 + Math.random() * 2;
          const escort = createEnemy('swarm', ex, ey, this.level, this.scale, this.difficulty);
          newEnemies.push(escort);
          this.scene.add(escort.mesh);
        }
      }
      return { newEnemies, newPowerUps };
    }

    this.timer -= dt;

    if (this.timer <= 0) {
      this.timer = this.spawnInterval * (0.8 + Math.random() * 0.4);
      const x = (Math.random() - 0.5) * this.width * 1.6;
      const y = this.height + 1;

      const type = this.pickEnemyType();

      if (type === 'swarm') {
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
          const sx = x + (Math.random() - 0.5) * 1.5;
          const sy = y + Math.random() * 0.5;
          const swarm = createEnemy('swarm', sx, sy, this.level, this.scale, this.difficulty);
          newEnemies.push(swarm);
          this.scene.add(swarm.mesh);
        }
      } else {
        const enemy = createEnemy(type, x, y, this.level, this.scale, this.difficulty);
        newEnemies.push(enemy);
        this.scene.add(enemy.mesh);
      }

      const coinRate = DIFFICULTY_MODS[this.difficulty].coinRate;
      if (Math.random() < 0.15 + coinRate) {
        const puType = this.pickPowerUpType();
        const pu = createPowerUp(puType, x + (Math.random() - 0.5) * 2, y, this.scale);
        newPowerUps.push(pu);
        this.scene.add(pu.mesh);
      }
    }

    return { newEnemies, newPowerUps };
  }

  private pickEnemyType(): EnemyType {
    const roll = Math.random();
    const shooterChance = Math.min(0.4, 0.1 + this.level * 0.02);
    const tankChance = Math.min(0.25, 0.05 + this.level * 0.015);
    const fastChance = Math.min(0.3, 0.1 + this.level * 0.015);
    const swarmChance = this.level >= 3 ? Math.min(0.25, 0.05 + this.level * 0.01) : 0;

    let cumulative = 0;
    cumulative += fastChance;
    if (roll < cumulative) return 'fast';
    cumulative += shooterChance;
    if (roll < cumulative) return 'shooter';
    cumulative += tankChance;
    if (roll < cumulative) return 'tank';
    cumulative += swarmChance;
    if (roll < cumulative) return 'swarm';
    return 'basic';
  }

  private pickPowerUpType(): PowerUpType {
    const types: PowerUpType[] = ['spread', 'shield', 'speed', 'rapid', 'extra_life', 'pierce', 'bounce', 'coin_magnet'];
    return types[Math.floor(Math.random() * types.length)];
  }

  reset(): void {
    this.timer = 0;
    this.spawnInterval = 1.8;
    this.level = 1;
    this.waveNumber = 0;
    this.waveTimer = 0;
    this.betweenWaves = false;
    this.warmupTimer = 3.0;
  }

  destroy(): void {
  }
}
