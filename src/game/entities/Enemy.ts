import * as THREE from 'three';
import type { EnemyType, EnemyData } from '../types';
import { ENEMY_BASE_SPEED } from '../types';

function createEnemyTexture(type: EnemyType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const cx = 32, cy = 32;

  switch (type) {
    case 'basic': {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      g.addColorStop(0, '#ff6666');
      g.addColorStop(0.5, '#cc2222');
      g.addColorStop(1, '#881111');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 24);
      ctx.lineTo(cx + 24, cy);
      ctx.lineTo(cx, cy + 24);
      ctx.lineTo(cx - 24, cy);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'shooter': {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      g.addColorStop(0, '#ffaa44');
      g.addColorStop(0.5, '#dd6600');
      g.addColorStop(1, '#993300');
      ctx.fillStyle = g;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const r = 24;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffcc44';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'fast': {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      g.addColorStop(0, '#ffff66');
      g.addColorStop(0.5, '#ddcc00');
      g.addColorStop(1, '#998800');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx + 22, cy + 14);
      ctx.lineTo(cx, cy + 6);
      ctx.lineTo(cx - 22, cy + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffee44';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
    }
    case 'tank': {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      g.addColorStop(0, '#aa4444');
      g.addColorStop(0.5, '#882222');
      g.addColorStop(1, '#551111');
      ctx.fillStyle = g;
      ctx.fillRect(cx - 22, cy - 22, 44, 44);
      ctx.strokeStyle = '#cc4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 22, cy - 22, 44, 44);
      ctx.fillStyle = '#cc6666';
      ctx.fillRect(cx - 8, cy - 8, 16, 16);
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

export function createEnemy(type: EnemyType, x: number, y: number, difficulty: number): EnemyData {
  const tex = getEnemyTex(type);
  const speedMult = 1 + difficulty * 0.1;
  let size = 0.8;
  let hp = 1;
  let speed = ENEMY_BASE_SPEED;
  let fireInterval = 0;

  switch (type) {
    case 'basic':
      size = 0.8;
      hp = 1;
      speed = ENEMY_BASE_SPEED * speedMult;
      break;
    case 'shooter':
      size = 0.9;
      hp = 1;
      speed = ENEMY_BASE_SPEED * 0.8 * speedMult;
      fireInterval = 2.0 / speedMult;
      break;
    case 'fast':
      size = 0.6;
      hp = 1;
      speed = ENEMY_BASE_SPEED * 1.8 * speedMult;
      break;
    case 'tank':
      size = 1.2;
      hp = 3;
      speed = ENEMY_BASE_SPEED * 0.5 * speedMult;
      fireInterval = 3.0 / speedMult;
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
