import * as THREE from 'three';
import type { BulletData, BulletType } from '../types';

function makeBulletTexture(color1: string, color2: string, glow: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(0.3, color1);
  gradient.addColorStop(0.6, color2);
  gradient.addColorStop(1, glow);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createBulletTexture(): THREE.CanvasTexture {
  return makeBulletTexture('#ffff00', '#ff8800', 'rgba(255, 136, 0, 0)');
}

export function createEnemyBulletTexture(): THREE.CanvasTexture {
  return makeBulletTexture('#ff4444', '#cc0000', 'rgba(204, 0, 0, 0)');
}

export function createPierceBulletTexture(): THREE.CanvasTexture {
  return makeBulletTexture('#88ddff', '#0088ff', 'rgba(0, 136, 255, 0)');
}

export function createBounceBulletTexture(): THREE.CanvasTexture {
  return makeBulletTexture('#88ff88', '#00cc44', 'rgba(0, 204, 68, 0)');
}

let _bulletTex: THREE.CanvasTexture | null = null;
let _enemyBulletTex: THREE.CanvasTexture | null = null;
let _pierceTex: THREE.CanvasTexture | null = null;
let _bounceTex: THREE.CanvasTexture | null = null;

function getBulletTex(): THREE.CanvasTexture {
  if (!_bulletTex) _bulletTex = createBulletTexture();
  return _bulletTex;
}

function getEnemyBulletTex(): THREE.CanvasTexture {
  if (!_enemyBulletTex) _enemyBulletTex = createEnemyBulletTexture();
  return _enemyBulletTex;
}

function getPierceTex(): THREE.CanvasTexture {
  if (!_pierceTex) _pierceTex = createPierceBulletTexture();
  return _pierceTex;
}

function getBounceTex(): THREE.CanvasTexture {
  if (!_bounceTex) _bounceTex = createBounceBulletTexture();
  return _bounceTex;
}

export function createBullet(x: number, y: number, isEnemy: boolean, scale: number = 1, bulletType: BulletType = 'normal'): BulletData {
  let tex: THREE.CanvasTexture;
  let s = 0.25 * scale;
  if (isEnemy) {
    tex = getEnemyBulletTex();
  } else if (bulletType === 'pierce') {
    tex = getPierceTex();
    s = 0.35 * scale;
  } else if (bulletType === 'bounce') {
    tex = getBounceTex();
    s = 0.2 * scale;
  } else {
    tex = getBulletTex();
  }
  const geo = new THREE.PlaneGeometry(s, s);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, 0);
  const speed = isEnemy ? -4 * scale : 10 * scale;
  return {
    mesh,
    velocity: new THREE.Vector2(0, speed),
    isEnemy,
    alive: true,
    bulletType,
    pierceHits: 0,
  };
}
