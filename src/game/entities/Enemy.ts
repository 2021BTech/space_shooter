import * as THREE from 'three';
import type { EnemyType, EnemyData, Difficulty } from '../types';
import { ENEMY_BASE_SPEED } from '../types';

const DIFF_SPEED_MULT: Record<Difficulty, number> = {
  easy: 0.7,
  medium: 1.0,
  hard: 1.3,
};

const DIFF_HP_BONUS: Record<Difficulty, number> = {
  easy: 0,
  medium: 0,
  hard: 1,
};

function createEnemyTexture(type: EnemyType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const cx = 32, cy = 32;

  switch (type) {
    case 'basic': {
      ctx.fillStyle = '#cc2222';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx + 26, cy - 4);
      ctx.lineTo(cx + 18, cy + 18);
      ctx.lineTo(cx, cy + 26);
      ctx.lineTo(cx - 18, cy + 18);
      ctx.lineTo(cx - 26, cy - 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#881111';
      ctx.beginPath();
      ctx.ellipse(cx - 6, cy - 2, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 6, cy - 2, 4, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 3, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aa0000';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 8, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ff6666';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ff3333';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 20);
      ctx.lineTo(cx - 6, cy - 10);
      ctx.lineTo(cx + 6, cy - 10);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'shooter': {
      ctx.fillStyle = '#cc5500';
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy - 10);
      ctx.lineTo(cx + 24, cy - 10);
      ctx.lineTo(cx + 28, cy + 4);
      ctx.lineTo(cx + 20, cy + 20);
      ctx.lineTo(cx - 20, cy + 20);
      ctx.lineTo(cx - 28, cy + 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#993300';
      ctx.fillRect(cx - 4, cy - 16, 8, 20);

      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(cx, cy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#884400';
      ctx.fillRect(cx - 20, cy + 10, 6, 14);
      ctx.fillRect(cx + 14, cy + 10, 6, 14);

      ctx.fillStyle = '#ff4400';
      ctx.fillRect(cx - 19, cy + 12, 4, 10);
      ctx.fillRect(cx + 15, cy + 12, 4, 10);

      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'fast': {
      ctx.fillStyle = '#cc9900';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 28);
      ctx.lineTo(cx + 22, cy + 6);
      ctx.lineTo(cx + 28, cy + 16);
      ctx.lineTo(cx + 10, cy + 8);
      ctx.lineTo(cx + 10, cy + 22);
      ctx.lineTo(cx, cy + 18);
      ctx.lineTo(cx - 10, cy + 22);
      ctx.lineTo(cx - 10, cy + 8);
      ctx.lineTo(cx - 28, cy + 16);
      ctx.lineTo(cx - 22, cy + 6);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffdd00';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx + 8, cy - 2);
      ctx.lineTo(cx, cy + 4);
      ctx.lineTo(cx - 8, cy - 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff6600';
      ctx.fillRect(cx - 6, cy + 12, 4, 10);
      ctx.fillRect(cx + 2, cy + 12, 4, 10);

      ctx.fillStyle = '#ffaa00';
      ctx.beginPath();
      ctx.arc(cx, cy - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffee44';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'tank': {
      ctx.fillStyle = '#666666';
      ctx.fillRect(cx - 24, cy - 20, 48, 40);

      ctx.fillStyle = '#555555';
      ctx.fillRect(cx - 20, cy - 16, 40, 32);

      ctx.fillStyle = '#888888';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 6, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#333333';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 6, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#444444';
      ctx.fillRect(cx - 6, cy - 24, 12, 10);

      ctx.fillStyle = '#aa2222';
      ctx.fillRect(cx - 14, cy + 8, 28, 8);

      ctx.fillStyle = '#ff4444';
      ctx.fillRect(cx - 12, cy + 9, 24, 2);

      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 24, cy - 20, 48, 40);
      break;
    }
    case 'swarm': {
      ctx.fillStyle = '#88bb00';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#668800';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aadd00';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 2, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ccff00';
      ctx.beginPath();
      ctx.arc(cx - 5, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aadd00';
      ctx.beginPath();
      ctx.moveTo(cx - 2, cy + 4);
      ctx.lineTo(cx + 2, cy + 4);
      ctx.lineTo(cx, cy + 12);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ddee44';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'boss': {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
      grad.addColorStop(0, '#440022');
      grad.addColorStop(0.5, '#880044');
      grad.addColorStop(1, '#cc0044');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx + 28, cy - 10);
      ctx.lineTo(cx + 30, cy + 10);
      ctx.lineTo(cx + 16, cy + 28);
      ctx.lineTo(cx - 16, cy + 28);
      ctx.lineTo(cx - 30, cy + 10);
      ctx.lineTo(cx - 28, cy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff0044';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 8, cy - 4, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff4488';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + 8, cy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#aa0033';
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy + 6);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.lineTo(cx, cy + 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#ff4488';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const textureCache = new Map<EnemyType, THREE.CanvasTexture>();

function getEnemyTex(type: EnemyType): THREE.CanvasTexture {
  if (!textureCache.has(type)) {
    textureCache.set(type, createEnemyTexture(type));
  }
  return textureCache.get(type)!;
}

export function createEnemy(type: EnemyType, x: number, y: number, level: number, scale: number = 1, difficulty: Difficulty = 'medium'): EnemyData {
  const tex = getEnemyTex(type);
  const speedMult = 1 + (level - 1) * 0.04;
  const diffSpeedMult = DIFF_SPEED_MULT[difficulty];
  const hpBonus = DIFF_HP_BONUS[difficulty];
  let size = 0.8 * scale;
  let hp = 1;
  let speed = ENEMY_BASE_SPEED;
  let fireInterval = 0;

  switch (type) {
    case 'basic':
      size = 0.8 * scale;
      hp = 1 + hpBonus;
      speed = ENEMY_BASE_SPEED * speedMult * diffSpeedMult;
      break;
    case 'shooter':
      size = 0.9 * scale;
      hp = 1 + hpBonus;
      speed = ENEMY_BASE_SPEED * 0.8 * speedMult * diffSpeedMult;
      fireInterval = 2.0 / speedMult;
      break;
    case 'fast':
      size = 0.6 * scale;
      hp = 1 + hpBonus;
      speed = ENEMY_BASE_SPEED * 1.8 * speedMult * diffSpeedMult;
      break;
    case 'tank':
      size = 1.2 * scale;
      hp = 3 + hpBonus;
      speed = ENEMY_BASE_SPEED * 0.5 * speedMult * diffSpeedMult;
      fireInterval = 3.0 / speedMult;
      break;
    case 'swarm':
      size = 0.4 * scale;
      hp = 1 + hpBonus;
      speed = ENEMY_BASE_SPEED * 2.5 * speedMult * diffSpeedMult;
      break;
    case 'boss':
      size = 2.0 * scale;
      hp = 8 + level - 1 + hpBonus;
      speed = ENEMY_BASE_SPEED * 0.3 * diffSpeedMult;
      fireInterval = 1.5 / speedMult;
      break;
  }

  const geo = new THREE.PlaneGeometry(size, size);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0);

  return {
    mesh,
    type,
    hp,
    velocity: new THREE.Vector2(0, -speed),
    alive: true,
    shootTimer: fireInterval > 0 ? fireInterval * 0.5 + Math.random() * fireInterval * 0.5 : 0,
    fireInterval,
  };
}
