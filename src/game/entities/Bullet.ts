import * as THREE from 'three';
import type { BulletData } from '../types';

export function createBulletTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#ffff00');
  gradient.addColorStop(0.6, '#ff8800');
  gradient.addColorStop(1, 'rgba(255, 136, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createEnemyBulletTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, '#ff4444');
  gradient.addColorStop(0.6, '#cc0000');
  gradient.addColorStop(1, 'rgba(204, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 24, 24);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

let _bulletTex: THREE.CanvasTexture | null = null;
let _enemyBulletTex: THREE.CanvasTexture | null = null;

function getBulletTex(): THREE.CanvasTexture {
  if (!_bulletTex) _bulletTex = createBulletTexture();
  return _bulletTex;
}

function getEnemyBulletTex(): THREE.CanvasTexture {
  if (!_enemyBulletTex) _enemyBulletTex = createEnemyBulletTexture();
  return _enemyBulletTex;
}

export function createBullet(x: number, y: number, isEnemy: boolean): BulletData {
  const tex = isEnemy ? getEnemyBulletTex() : getBulletTex();
  const geo = new THREE.PlaneGeometry(0.25, 0.25);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0);
  return {
    mesh,
    velocity: new THREE.Vector2(0, isEnemy ? -4 : 10),
    isEnemy,
    alive: true,
  };
}
