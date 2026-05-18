import * as THREE from 'three';
import type { BulletData, EnemyData, PowerUpData } from '../types';

export class CollisionSystem {
  checkBulletEnemy(bullets: BulletData[], enemies: EnemyData[]): { bulletIdx: number; enemyIdx: number }[] {
    const hits: { bulletIdx: number; enemyIdx: number }[] = [];
    for (let bi = 0; bi < bullets.length; bi++) {
      const b = bullets[bi];
      if (!b.alive || b.isEnemy) continue;
      for (let ei = 0; ei < enemies.length; ei++) {
        const e = enemies[ei];
        if (!e.alive) continue;
        const dist = b.mesh.position.distanceTo(e.mesh.position);
        if (dist < 0.7) {
          hits.push({ bulletIdx: bi, enemyIdx: ei });
          break;
        }
      }
    }
    return hits;
  }

  checkEnemyPlayer(
    enemies: EnemyData[],
    playerPos: THREE.Vector3
  ): number[] {
    const hits: number[] = [];
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!e.alive) continue;
      const dist = e.mesh.position.distanceTo(playerPos);
      if (dist < 0.8) {
        hits.push(i);
      }
    }
    return hits;
  }

  checkEnemyBulletPlayer(
    bullets: BulletData[],
    playerPos: THREE.Vector3
  ): number[] {
    const hits: number[] = [];
    for (let i = 0; i < bullets.length; i++) {
      const b = bullets[i];
      if (!b.alive || !b.isEnemy) continue;
      const dist = b.mesh.position.distanceTo(playerPos);
      if (dist < 0.5) {
        hits.push(i);
      }
    }
    return hits;
  }

  checkPlayerPowerUp(
    powerups: PowerUpData[],
    playerPos: THREE.Vector3
  ): number[] {
    const hits: number[] = [];
    for (let i = 0; i < powerups.length; i++) {
      const p = powerups[i];
      if (!p.alive) continue;
      const dist = p.mesh.position.distanceTo(playerPos);
      if (dist < 0.6) {
        hits.push(i);
      }
    }
    return hits;
  }
}
