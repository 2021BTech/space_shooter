import * as THREE from 'three';
import type { EnemyType, PowerUpType, EnemyData, PowerUpData } from '../types';
import { createEnemy } from '../entities/Enemy';
import { createPowerUp } from '../entities/PowerUp';

export class SpawnSystem {
  private timer = 0;
  private spawnInterval = 1.5;
  private difficulty = 0;
  private scene: THREE.Scene;
  private width: number;
  private height: number;
  private scale = 1;

  constructor(scene: THREE.Scene, width: number, height: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  setDifficulty(score: number): void {
    this.difficulty = Math.floor(score / 500);
    this.spawnInterval = Math.max(0.4, 1.5 - this.difficulty * 0.1);
  }

  setScale(s: number): void {
    this.scale = s;
  }

  update(dt: number): { newEnemies: EnemyData[]; newPowerUps: PowerUpData[] } {
    const newEnemies: EnemyData[] = [];
    const newPowerUps: PowerUpData[] = [];
    this.timer -= dt;

    if (this.timer <= 0) {
      this.timer = this.spawnInterval * (0.8 + Math.random() * 0.4);
      const x = (Math.random() - 0.5) * this.width * 1.6;
      const y = this.height + 1;

      const type = this.pickEnemyType();
      const enemy = createEnemy(type, x, y, this.difficulty, this.scale);
      newEnemies.push(enemy);
      this.scene.add(enemy.mesh);

      if (Math.random() < 0.15) {
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
    const shooterChance = Math.min(0.4, 0.1 + this.difficulty * 0.05);
    const tankChance = Math.min(0.25, 0.05 + this.difficulty * 0.03);
    const fastChance = Math.min(0.3, 0.1 + this.difficulty * 0.03);

    if (roll < fastChance) return 'fast';
    if (roll < fastChance + shooterChance) return 'shooter';
    if (roll < fastChance + shooterChance + tankChance) return 'tank';
    return 'basic';
  }

  private pickPowerUpType(): PowerUpType {
    const types: PowerUpType[] = ['spread', 'shield', 'speed', 'rapid', 'extra_life'];
    return types[Math.floor(Math.random() * types.length)];
  }

  reset(): void {
    this.timer = 0;
    this.spawnInterval = 1.5;
    this.difficulty = 0;
  }

  destroy(): void {
  }
}
